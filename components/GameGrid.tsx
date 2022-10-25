import { useAtom } from "jotai";
import { range } from "lodash";
import GameRow, { CurrentGameRow } from "../components/GameRow";
import {
  availableRowsAtom,
  currentWordAtom,
  gameAtom,
  turnsAtom,
} from "../core/atoms";

const GameGrid = () => {
  const [currentWord] = useAtom(currentWordAtom);
  const [turns] = useAtom(turnsAtom);
  const [availableRows] = useAtom(availableRowsAtom);

  return (
    <div
      onClick={() => {
        document.getElementById("input")?.focus?.({
          preventScroll: true,
        });
      }}
      className="flex flex-col items-center"
    >
      <div className="border-2 border-current w-min">
        {range(availableRows).map((rowIndex) => {
          if (turns[rowIndex]) {
            // an already played turn
            return (
              <GameRow
                key={`${currentWord}-${rowIndex}`}
                turn={turns[rowIndex]}
                length={currentWord.length}
              />
            );
          } else if (rowIndex === turns.length) {
            // the current game row
            return <CurrentGameRow key={`${currentWord}-${rowIndex}`} />;
          } else {
            // empty row
            return (
              <GameRow
                key={`${currentWord}-${rowIndex}`}
                length={currentWord.length}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

export default GameGrid;
