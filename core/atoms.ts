import { atom } from "jotai";
import { atomWithStorage, RESET } from "jotai/utils";
import { fill, range } from "lodash";
import { ICheck, IGame, ITurn, NUMBER_OF_ROWS } from "../lib/game";

export const gameAtom = atomWithStorage<IGame | null>("game", null);
export const currentTypedAtom = atom<string>("");
export const errorAtom = atom<string | null>(null);

export const validWordsAtom = atom<string[]>([]);

export const turnsAtom = atom<ITurn[]>((get) => {
  const game = get(gameAtom);
  return game?.turns || [];
});

export const currentWordAtom = atom<string>((get) => {
  const game = get(gameAtom);
  return game?.word || "";
});

export const availableRowsAtom = atom<number>((get) => {
  return Math.max(NUMBER_OF_ROWS, get(turnsAtom).length + 1);
});

export const hasWonAtom = atom<boolean>((get) => {
  const turns = get(turnsAtom);
  return turns.some((t) => t.success);
});

export const currentWordKeyboardColorsAtom = atom<{ [key: string]: string }>(
  (get) => {
    const userCurrentWordTurns = get(gameAtom)?.turns || [];
    const keyboardColors: { [key: string]: string } = {};
    userCurrentWordTurns.forEach((turn) => {
      for (let i = 0; i < turn.word.length; i++) {
        if (keyboardColors[turn.word[i]] === ICheck.hit) {
          // do not override hits
          continue;
        } else if (
          keyboardColors[turn.word[i]] === ICheck.misplaced &&
          turn.check[i] === ICheck.miss
        ) {
          // do not override a misplaced letter with a miss
          continue;
        } else {
          // general case
          keyboardColors[turn.word[i]] = turn.check[i];
        }
      }
    });
    return keyboardColors;
  }
);

export const userCurrentGameRowKnownLettersAtom = atom<string>((get) => {
  const game = get(gameAtom);
  const userCurrentWordTurns = game?.turns || [];
  const currentWord = game?.word || "";
  // we always know the first letter
  const currentGameRowKnownLetters: string[] = fill(
    range(currentWord.length),
    ICheck.miss
  );

  userCurrentWordTurns.forEach((turn) => {
    for (let i = 0; i < turn.word.length; i++) {
      if (turn.check[i] === ICheck.hit) {
        currentGameRowKnownLetters[i] = turn.word[i];
      }
    }
  });

  return currentGameRowKnownLetters.join("");
});
