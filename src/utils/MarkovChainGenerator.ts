const isQuestion = (sentence: string) => sentence.match(/^(why|what|who|where|did|do|how)/i);
const notEndingWords = ['a', 'an', 'the', 'if', 'or', 'by', 'but', 'I', ',', 'to', 'the'];

const shouldEndSentence = (word: string, upperLimit: number, len: number): boolean => {
  if (word === undefined || word.length === 0) return true;
  const possibleEnding = notEndingWords.find(w => w === word) === undefined;
  return len >= upperLimit && possibleEnding;
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
  minimumWords: number;
  maximumQuotedSentenceLength: number;

  constructor(jokes: Joke[]) {
    // init
    this.jokes = jokes;
    this.words = [];
    this.hashMap = {};
    this.startWords = {};
    this.minimumWords = 15;
    this.maximumQuotedSentenceLength = 3;

    // methods
    this.tokenizeWords();
  }

  tokenizeWords(): void {
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

  addNewWordPairToChain = (firstWord: string, secondWord: string): void => {
    this.hashMap[firstWord] = {
      count: 1,
      words: {
        [secondWord]: 1,
      },
    };
  };

  increaseCountForAdjacentWord = (firstWord: string, secondWord: string): void => {
    if (!this.hashMap[firstWord].words[secondWord]) {
      this.hashMap[firstWord].words[secondWord] = 1;
    } else {
      this.hashMap[firstWord].words[secondWord]++;
    }
    this.hashMap[firstWord].count++;
  };

  /** Calculate Probabilities from moving from each word
     To next one.
     total probability must be 100%, so that we can always transition
   **/
  calculateState(joke: String): void {
    const jokeWords = joke.replace(/[”‘"]/g, '').split(' ');

    if (jokeWords.length === 0) return;
    this.updateStartWords(jokeWords[0]);

    jokeWords.forEach((word, index) => {
      const firstWord = jokeWords[index];
      const secondWord = jokeWords[index + 1];

      if (firstWord === secondWord || !secondWord) return;

      if (initialIsCapital(secondWord)) this.updateStartWords(secondWord);
      else if (!this.hashMap[firstWord]) this.addNewWordPairToChain(firstWord, secondWord);
      else this.increaseCountForAdjacentWord(firstWord, secondWord);
    });
  }

  getRandomWordFromBeginning = (): string => {
    const numWords = Object.keys(this.startWords).reduce((a, b) => a + this.startWords[b], 0);
    const randomWord = Math.floor(numWords * Math.random());
    let count = 0;
    let word: string = '';

    Object.keys(this.startWords).some(key => {
      word = key;
      count += this.startWords[key];
      return count >= randomWord && !(!this.hashMap[key] || this.hashMap[key].count === 1);
    });

    return word;
  };

  getRandomWordFromAnotherWord = (word: string): string => {
    const numWords = Object.keys(this.hashMap[word].words).reduce((a, b) => a + this.hashMap[word].words[b], 0);
    const randomWord = Math.floor(numWords * Math.random());
    let count = 0;
    let foundWord: string = '';

    Object.keys(this.hashMap[word].words).some(key => {
      count += this.hashMap[word].words[key];
      foundWord = key;
      return count >= randomWord;
    });

    return foundWord;
  };

  handleSentenceEnd = (sentence: string): string => {
    if (isQuestion(sentence) && sentence.indexOf('?') === -1) {
      return sentence.slice(0, sentence.length - 1) + '?';
    } else if (sentence.indexOf('?') > -1) {
      return sentence.slice(0, sentence.length - 1) + '.';
    }
    return sentence;
  };

  generateSentence = () => {
    let prevWord: string = this.getRandomWordFromBeginning();
    let sentence: string = prevWord;
    let count = 1;

    do {
      if (!this.hashMap[prevWord]) {
        break;
      }
      prevWord = this.getRandomWordFromAnotherWord(prevWord);
      count++;
      sentence += ' ' + prevWord;
    } while (!(shouldEndSentence(prevWord, this.minimumWords, sentence.length) && !this.hashMap[prevWord]));

    sentence = this.handleSentenceEnd(sentence);

    return {
      sentence: sentence.replace(/"|‘|“|/g, ''),
      wordCount: count,
    };
  };

  generateJoke = (): string => {
    let firstSentence = this.generateSentence();
    let secondSentence = { sentence: '', wordCount: 0 };

    while (firstSentence.wordCount < 5) firstSentence = this.generateSentence();

    if (firstSentence.wordCount <= this.minimumWords) {
      do {
        secondSentence = this.generateSentence();
      } while (isQuestion(secondSentence.sentence));
    }

    const sentence = `${firstSentence.sentence} ${secondSentence.sentence}`;
    this.calculateState(sentence);
    return sentence;
  };
}
