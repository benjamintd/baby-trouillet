import cn from "classnames";
import { useAtom } from "jotai";
import { range } from "lodash";
import {
  currentTypedAtom,
  userCurrentGameRowKnownLettersAtom,
} from "../core/atoms";
import { ICheck, ITurn } from "../lib/game";

const GameRow = ({
  turn,
  length,
  size = "base",
  hidden = false,
}: {
  length: number;
  turn?: ITurn;
  size?: "base" | "sm";
  hidden?: boolean;
}) => {
  if (turn && length < turn.word.length) {
    throw new Error("The turn's word is too long");
  }

  return (
    <div className="flex">
      {range(length).map((colIndex) => (
        <div
          className={cn(
            "flex-center relative border border-current uppercase",
            {
              "box-base": size === "base",
              "box-sm": size === "sm",
            }
          )}
          key={colIndex}
        >
          <div
            className={cn("flex-center absolute z-0 flex", {
              "hint-base": size === "base",
              "hint-sm": size === "sm",
              "bg-misplaced rounded-full":
                turn?.check[colIndex] === ICheck.misplaced,
              "bg-hit rounded": turn?.check[colIndex] === ICheck.hit,
              "text-miss rounded-full bg-current": hidden,
            })}
          />

          <span className="z-50">
            {(!hidden && turn?.word[colIndex]) || " "}
          </span>
        </div>
      ))}
    </div>
  );
};

export const CurrentGameRow = ({ size = "base" }: { size?: "base" | "sm" }) => {
  const [currentTyped] = useAtom(currentTypedAtom);
  const [currentGameRowKnownLetters] = useAtom(
    userCurrentGameRowKnownLettersAtom
  );

  return (
    <div className="flex">
      {range(currentGameRowKnownLetters.length).map((colIndex) => {
        return (
          <div
            className={cn("flex-center border border-current uppercase", {
              "box-base": size === "base",
              "box-sm": size === "sm",
            })}
            key={colIndex}
          >
            {currentTyped[colIndex]
              ? currentTyped[colIndex]
              : !currentTyped &&
                currentGameRowKnownLetters[colIndex] !== ICheck.miss
              ? currentGameRowKnownLetters[colIndex]
              : colIndex === currentTyped.length
              ? "_"
              : "."}
          </div>
        );
      })}
    </div>
  );
};

export default GameRow;
