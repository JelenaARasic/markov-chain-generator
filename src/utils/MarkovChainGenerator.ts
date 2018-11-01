const isQuestion = (sentence: string) => sentence.match(/^(why|what|who|where|did|do|how)/i);
const endsWithPunctuation = (sentence: string) => sentence.match(/[.!?]$/);
const notEndingWords = ["a", "an", "the", "if", "or", "by", "but", "I", ",", "to", "the"];

const shouldEndSentence = (word: string, upperLimit: number, len: number): boolean => {
    const possibleEnding = notEndingWords.find((w) => w === word) === undefined;
    return len >= (upperLimit) && possibleEnding;
};

const initialIsCapital = (word: string) => {
    if (!word.length) return false;
    return word[0] !== word[0].toLowerCase();
};

// Original Response from API
export interface Joke {
    id: string;
    joke: string;
}

// For Each word we keep number of times it occurs
// And also adjacent words.
export interface MarkovChainState {
    [key: string]: {
        count: number;
        words: { [key: string]: number };
    };
}

// Important for choosing starting word.
export interface MarkovChainStartState {
    [key: string]: number;
}

export default class MarkovChainGenerator {
    // TS declaration
    jokes: Joke[];
    words: string[];
    hashMap: MarkovChainState;
    startWords: MarkovChainStartState;
    endWords: MarkovChainStartState;
    minimumWords: number;
    maximumWords: number;
    maximumQuotedSentenceLength: number;
    totalWords: number;

    constructor(jokes: Joke[]) {
        // init
        this.jokes = jokes;
        this.words = [];
        this.hashMap = {};
        this.startWords = {};
        this.minimumWords = 15;
        this.maximumWords = 20;
        this.totalWords = 0;
        this.endWords = {};
        this.maximumQuotedSentenceLength = 3;

        // methods
        this.tokenizeWords();
    }

    /*
       For Each Joke do the calculation of staet
    */
    tokenizeWords() {
        this.jokes.forEach((jokeObj: Joke) => {
            const jokeString = jokeObj.joke;
            this.calculateState(jokeString);
        });
    }

    updateStartWords = (word: string): void => {
        if (!this.startWords[word]) {
            this.startWords[word] = 1;
        } else {
            this.startWords[word]++;
        }
    };

    /* Calculate Probabilities from moving from each word
        To next one.
        total probability must be 100%, so that we can always transition
     */
    calculateState(joke: String) {
        const jokeWords = joke.replace(/[?.!”,"]/g, "").split(' ');

        // Ignore Empty String
        if (jokeWords.length === 0) return;
        this.updateStartWords(jokeWords[0]);

        jokeWords.forEach((word, index) => {
            const firstWord = jokeWords[index];
            const secondWord = jokeWords[index + 1];

            if (initialIsCapital(firstWord)) {
                this.updateStartWords(firstWord);
            }

            // If second word is undefined, we have parsed all words.
            if (secondWord) {
                // If we encounter word for first time, we fill initial count with 1 and add preceding word.
                if (!this.hashMap[firstWord]) {
                    this.hashMap[firstWord] = {
                        count: 1,
                        words: {
                            [secondWord]: 1,
                        }
                    };
                } else {
                    // We already have a word, but first time encounter preceding word.
                    if (!this.hashMap[firstWord].words[secondWord]) {
                        this.hashMap[firstWord].words[secondWord] = 1;
                    } else {
                        // Both words appeared, increase their probability.
                        this.hashMap[firstWord].words[secondWord]++;
                    }
                    // Increase count because word is seen already.
                    this.hashMap[firstWord].count++;
                }
            }
        });

        this.totalWords += jokeWords.length;
    }

    getRandomWordFromBeginning = (first: boolean = false): string => {
        const numWords = Object.keys(this.startWords).reduce((a, b) => a + this.startWords[b], 0);
        const randomWord = Math.floor(numWords * Math.random());
        let count = 0;
        let word: string = "";

        Object.keys(this.startWords).some(
            (key) => {
                word = key;
                count += this.startWords[key];
                return count >= randomWord && !(first && (!this.hashMap[key] || this.hashMap[key].count === 1));
            }
        );

        return word;
    };

    getRandomWordFromAnotherWord = (word: string): string => {
        const numWords = Object.keys(this.hashMap[word].words).reduce((a, b) => a + this.hashMap[word].words[b], 0);
        const randomWord = Math.floor(numWords * Math.random());
        let count = 0;
        let foundWord: string = "";

        Object.keys(this.hashMap[word].words).some(
            (key) => {
                count += this.hashMap[word].words[key];
                foundWord = key;
                return count >= randomWord;
            }
        );

        return foundWord;
    };

    generateSentence = (first = false) => {
        let prevWord: string = this.getRandomWordFromBeginning(first);
        let sentence: string = prevWord;
        let count = 1;

        do {
            if (!this.hashMap[prevWord]) {
                break;
            }
            prevWord = this.getRandomWordFromAnotherWord(prevWord);
            count++;
            sentence += (" " + prevWord);
        } while (!(shouldEndSentence(prevWord, this.minimumWords, sentence.length) && this.hashMap[prevWord]));

        return {
            sentence,
            wordCount: count
        };
    };

    generateJoke = () => {
        let firstSentence = this.generateSentence();
        let secondSentence = {sentence: "", wordCount: 0};
        while (firstSentence.wordCount < 5) {
            firstSentence = this.generateSentence(true);
        }


        if (firstSentence.wordCount <= this.minimumWords) {
            if (isQuestion(firstSentence.sentence)) {
                firstSentence.sentence += "?";
            } else {
                firstSentence.sentence += ".";
            }
            do {
                secondSentence = this.generateSentence();
            } while (isQuestion(secondSentence.sentence));
            secondSentence.sentence += ".";
        }

        return `${firstSentence.sentence} ${secondSentence.sentence}`;
    }
}
