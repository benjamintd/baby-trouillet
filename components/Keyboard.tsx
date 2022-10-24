import cn from "classnames";
import { useAtom } from "jotai";
import { Backspace } from "./Backspace";
import { Send } from "./Send";
import { currentTypedAtom, currentWordKeyboardColorsAtom } from "../core/atoms";
import useTypeWord from "../hooks/useTypeWord";
import useValidateWord from "../hooks/useValidateWord";
import { ICheck } from "../lib/game";

const LAYOUT = [
  ["a", "z", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["q", "s", "d", "f", "g", "h", "j", "k", "l", "m"],
  ["_empty", "_empty", "w", "x", "c", "v", "b", "n", "_del", "_enter"],
];

const Keyboard = () => {
  const [currentTyped, setCurrentTyped] = useAtom(currentTypedAtom);
  const [currentWordKeyboardColors] = useAtom(currentWordKeyboardColorsAtom);

  const validateWord = useValidateWord();
  const typeWord = useTypeWord();

  const handleClick = (key: string) => {
    if (key === "_del") {
      setCurrentTyped((currentTyped) => currentTyped.slice(0, -1));
    } else if (key === "_enter") {
      validateWord();
    } else {
      typeWord(currentTyped + key);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm gap-3 pb-4 mx-auto mt-auto lg:pb-0">
      {LAYOUT.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex justify-center w-full gap-2 basis-0"
        >
          {row.map((key, keyIndex) => {
            if (key === "_empty") {
              return (
                <div
                  key={keyIndex}
                  className="h-10 grow basis-0 md:h-12 md:w-10"
                />
              );
            }
            if (key === "_halfempty") {
              return (
                <div
                  key={keyIndex}
                  className="h-10 grow-[0.5] basis-0 md:h-12 md:w-5"
                />
              );
            }
            return (
              <button
                key={keyIndex}
                className={cn(
                  "flex-center relative h-10 grow basis-0 ring-1 ring-current md:h-12 md:w-10",
                  {
                    "bg-hit": currentWordKeyboardColors[key] === ICheck.hit,
                    "bg-misplaced":
                      currentWordKeyboardColors[key] === ICheck.misplaced,
                    "text-miss": currentWordKeyboardColors[key] === ICheck.miss,
                  }
                )}
                onClick={() => handleClick(key)}
              >
                <span>
                  {key === "_del" ? (
                    <Backspace />
                  ) : key === "_enter" ? (
                    <Send />
                  ) : (
                    key.toUpperCase()
                  )}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
