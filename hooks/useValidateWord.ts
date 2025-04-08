import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";
import { hotjar } from "react-hotjar";
import {
  currentTypedAtom,
  currentWordAtom,
  errorAtom,
  gameAtom,
  validWordsAtom,
} from "../core/atoms";
import { getCheck } from "../lib/game";
import normalizeString from "../lib/normalizeString";

const useValidateWord = (): (() => Promise<void>) => {
  const router = useRouter();
  const [currentWord] = useAtom(currentWordAtom);
  const [currentTyped, setCurrentTyped] = useAtom(currentTypedAtom);
  const [game, setGame] = useAtom(gameAtom);
  const [_, setError] = useAtom(errorAtom);
  const [validWords] = useAtom(validWordsAtom);

  const validWordsSet = useMemo(() => new Set(validWords), [validWords]);

  return useCallback(async () => {
    // @todo error if the number of rounds is reached
    if (currentTyped.length !== currentWord.length) {
      return setError("Le prénom n'est pas assez long");
    } else if (
      (validWordsSet.has(currentTyped) || validWordsSet.size === 0) &&
      game
    ) {
      setGame({
        ...game,
        turns: [
          ...game.turns,
          {
            word: currentTyped,
            check: getCheck(currentWord, currentTyped),
            success:
              normalizeString(currentTyped) === normalizeString(currentWord),
          },
        ],
      });

      if (hotjar.initialized()) {
        // Identify the user
        hotjar.event(currentTyped);
      }

      setCurrentTyped("");
    } else {
      return setError("Ce prénom n'est pas dans la liste");
    }
  }, [
    currentTyped,
    setCurrentTyped,
    currentWord,
    setError,
    validWordsSet,
    router.query.gameId,
    game,
    setGame,
  ]);
};

export default useValidateWord;
