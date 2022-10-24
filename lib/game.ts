import { range } from "lodash";
import normalizeString from "./normalizeString";

export interface IGame {
  word: string;
  turns: ITurn[];
}

export enum ICheck {
  hit = "*",
  miss = "-",
  misplaced = "+",
}

export interface ITurn {
  word: string;
  success: boolean;
  check: string; // a string of equal length to the word, with "*" for hit, "+" for misplaced, "-" for miss
}

export const NUMBER_OF_ROWS = 6;

export const getCheck = (word: string, userCurrentWord: string): string => {
  const normalizedWord = normalizeString(word);
  const normalisedUserWord = normalizeString(userCurrentWord);
  const check = range(word.length).map(() => ICheck.miss);
  const used = range(word.length).map(() => false);

  // get the hits first
  for (let i = 0; i < normalizedWord.length; i++) {
    if (normalizedWord[i] === normalisedUserWord[i]) {
      check[i] = ICheck.hit;
      used[i] = true;
    }
  }

  // then the misplaced
  for (let i = 0; i < normalizedWord.length; i++) {
    if (check[i] === ICheck.miss) {
      for (let j = 0; j < normalizedWord.length; j++) {
        if (normalisedUserWord[i] === normalizedWord[j] && !used[j]) {
          check[i] = ICheck.misplaced;
          used[j] = true;
        }
      }
    }
  }

  return check.join("");
};
