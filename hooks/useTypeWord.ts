import { useAtom } from "jotai";
import { useCallback, useEffect } from "react";
import { currentTypedAtom, currentWordAtom } from "../core/atoms";
import { usePrevious } from "./usePrevious";
import normalizeString from "../lib/normalizeString";

const useTypeWord = (): ((word: string) => void) => {
  const [currentWord] = useAtom(currentWordAtom);
  const [_, setCurrentTyped] = useAtom(currentTypedAtom);

  const previousCurrentWord = usePrevious(currentWord);

  // reset the current typed word when the current word changes
  useEffect(() => {
    if (currentWord !== previousCurrentWord) {
      setCurrentTyped("");
    }
  }, [currentWord, previousCurrentWord, setCurrentTyped]);

  return useCallback(
    (word: string) => {
      let normalizedWord = normalizeString(word);
      setCurrentTyped(normalizedWord.slice(0, currentWord.length));
    },
    [currentWord, setCurrentTyped]
  );
};

export default useTypeWord;
