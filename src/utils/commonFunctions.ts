export const isQuestion = (sentence: string) => sentence.match(/^(why|what|who|where|did|do|how|what's)/i);
const notEndingWords = ['a', 'an', 'the', 'if', 'or', 'by', 'but', 'I', ',', 'to', 'the'];

export const shouldEndSentence = (word: string, upperLimit: number, len: number): boolean => {
  if (word === undefined || word.length === 0) return true;
  const possibleEnding = notEndingWords.find(w => w === word) === undefined;
  return len >= upperLimit && possibleEnding;
};

export const initialIsCapital = (word: string) => {
  if (!word.length) return false;
  return word[0] !== word[0].toLowerCase();
};

export const generateHash = () => {
    return Math.random().toString(36).substring(2);
};