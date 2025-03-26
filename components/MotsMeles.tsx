"use client";

import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { shuffle } from "lodash";

// Only "natural" reading directions
const DIRECTIONS = [
  [1, 1], // diagonal down-right
  [-1, 1], // diagonal up-right
  [0, 1], // right
  [1, 0], // down
];

// Sample word list - can be customized
const WORD_LIST = shuffle([
  "EMMA",
  "LOUISE",
  "JADE",
  "ALICE",
  "AMBRE",
  "LINA",
  "CHLOE",
  "ROSE",
  "ANNA",
  "LEA",
  "MIA",
  "JULIA",
  "LENA",
  "LOU",
  "JULIETTE",
  "INES",
  "ZOE",
  "AGATHE",
  "LOLA",
  "ROMY",
  "JEANNE",
  "MANON",
  "INAYA",
  "EVA",
  "NINA",
  "CAMILLE",
  "LUCIE",
  "LEONIE",
  "IRIS",
  "ADELE",
  "LUNA",
  "OLIVIA",
  "CHARLOTTE",
  "CHARLIE",
  "MARGAUX",
  "SOFIA",
  "VICTOIRE",
  "LOUNA",
  "ALBA",
  "VICTORIA",
  "ELENA",
  "CLEMENCE",
  "CLARA",
  "ALIX",
  "CAPUCINE",
  "GABRIELLE",
  "LYNA",
  "MAELYS",
  "MATHILDE",
  "LEANA",
  "ANAIS",
  "LILOU",
  "APOLLINE",
  "LISE",
  "ELISE",
  "MARIA",
  "VALENTINE",
  "ROXANE",
  "LIVIA",
  "MARIE",
  "ZELIE",
  "HELOISE",
  "THAIS",
  "NOEMIE",
  "CONSTANCE",
  "CELIA",
  "SALOME",
  "SOLINE",
  "ALBANE",
  "CELESTE",
  "AMELIA",
  "FAUSTINE",
  "MAELLE",
  "MELINA",
  "GABRIEL",
  "LEO",
  "LOUIS",
  "RAPHAEL",
  "JULES",
  "LUCAS",
  "ADAM",
  "ARTHUR",
  "HUGO",
  "MAEL",
  "LIAM",
  "ETHAN",
  "NOAH",
  "NATHAN",
  "PAUL",
  "SACHA",
  "GABIN",
  "TOM",
  "NOLAN",
  "AARON",
  "THEO",
  "ENZO",
  "MATHIS",
  "EDEN",
  "TIMEO",
  "VICTOR",
  "AXEL",
  "MARTIN",
  "LEON",
  "ANTOINE",
  "MARIUS",
  "ROBIN",
  "VALENTIN",
  "NAEL",
  "RAYAN",
  "TIAGO",
  "CLEMENT",
  "YANIS",
  "BAPTISTE",
  "MAXIME",
  "SAMUEL",
  "ELIOTT",
  "AUGUSTIN",
  "MAXENCE",
  "NINO",
  "MALO",
  "MATHEO",
  "GASPARD",
  "MARCEAU",
  "EVAN",
  "SIMON",
  "ALEXANDRE",
  "AYDEN",
  "AMIR",
  "THOMAS",
  "LENNY",
  "SOHAN",
  "NOA",
  "OSCAR",
  "SOAN",
  "COME",
  "OWEN",
  "ALEXIS",
  "LEANDRE",
  "JOSEPH",
  "ESTEBAN",
  "KYLIAN",
  "DIEGO",
  "WILLIAM",
  "PABLO",
  "ADRIEN",
  "MILAN",
  "CHARLES",
  "BASILE",
  "JEAN",
  "ANTONIN",
]);

const BONUS_WORD = "ROMANE"; // Special bonus word
const GRID_SIZE = 9;

export default function MotsMeles() {
  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<
    {
      word: string;
      cells: number[][];
      isBonus: boolean;
    }[]
  >([]);
  const [selectedCells, setSelectedCells] = useState<number[][]>([]);
  const [startCell, setStartCell] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Map<string, DOMRect>>(new Map());

  // Initialize the game
  useEffect(() => {
    generateNewGame();
  }, []);

  // Check if game is won
  useEffect(() => {
    if (
      foundWords.filter((fw) => !fw.isBonus).length === WORD_LIST.length ||
      foundWords.some((fw) => fw.isBonus)
    ) {
      triggerConfetti();
    }
  }, [foundWords]);

  // Generate a new game with words placed in the grid
  const generateNewGame = () => {
    setFoundWords([]);

    // Create empty GRID_SIZE grid
    const newGrid = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(""));

    // Place words in the grid
    const allWords = [BONUS_WORD, ...WORD_LIST];
    try {
      placeWordsInGrid(newGrid, allWords);

      // Fill remaining cells with random letters
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (newGrid[row][col] === "") {
            newGrid[row][col] = String.fromCharCode(
              65 + Math.floor(Math.random() * 26)
            );
          }
        }
      }

      setGrid(newGrid);
    } catch (error) {
      // Create a fallback grid with random letters if placement fails
      const fallbackGrid = Array(GRID_SIZE)
        .fill(null)
        .map(() =>
          Array(GRID_SIZE)
            .fill("")
            .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
        );

      setGrid(fallbackGrid);
    }

    // Reset cell refs for new game
    cellRefs.current = new Map();
  };

  // Place words in the grid in random directions
  const placeWordsInGrid = (grid: string[][], words: string[]) => {
    const unplacedWords: string[] = [];

    // Track which directions have been used
    const usedDirections = new Set<number>();

    for (const word of words) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 200; // Increase attempts to give more chances

      // First try to place the word in an unused direction
      if (usedDirections.size < DIRECTIONS.length) {
        // Try each unused direction first
        for (let dirIndex = 0; dirIndex < DIRECTIONS.length; dirIndex++) {
          // Skip if this direction has already been used
          if (usedDirections.has(dirIndex)) continue;

          const [dRow, dCol] = DIRECTIONS[dirIndex];

          // Try multiple positions with this direction
          for (let posAttempt = 0; posAttempt < 50; posAttempt++) {
            const row = Math.floor(Math.random() * GRID_SIZE);
            const col = Math.floor(Math.random() * GRID_SIZE);

            if (canPlaceWord(grid, word, row, col, dRow, dCol)) {
              // Place the word
              for (let i = 0; i < word.length; i++) {
                const currentRow = row + i * dRow;
                const currentCol = col + i * dCol;
                grid[currentRow][currentCol] = word[i];
              }
              placed = true;
              usedDirections.add(dirIndex);
              break;
            }
          }

          if (placed) break;
        }
      }

      // If still not placed, try random directions
      while (!placed && attempts < maxAttempts) {
        attempts++;

        // Choose random starting position and direction
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);
        const dirIndex = Math.floor(Math.random() * DIRECTIONS.length);
        const [dRow, dCol] = DIRECTIONS[dirIndex];

        // Check if word fits in the grid in this direction
        if (canPlaceWord(grid, word, row, col, dRow, dCol)) {
          // Place the word
          for (let i = 0; i < word.length; i++) {
            const currentRow = row + i * dRow;
            const currentCol = col + i * dCol;
            grid[currentRow][currentCol] = word[i];
          }
          placed = true;
          usedDirections.add(dirIndex);
        }
      }

      if (!placed) {
        unplacedWords.push(word);
      }
    }

    return unplacedWords;
  };

  // Check if a word can be placed at a specific position and direction
  const canPlaceWord = (
    grid: string[][],
    word: string,
    row: number,
    col: number,
    dRow: number,
    dCol: number
  ) => {
    // Check if word would go out of bounds
    if (
      row + dRow * (word.length - 1) < 0 ||
      row + dRow * (word.length - 1) >= GRID_SIZE ||
      col + dCol * (word.length - 1) < 0 ||
      col + dCol * (word.length - 1) >= GRID_SIZE
    ) {
      return false;
    }

    // Check cells for placement
    for (let i = 0; i < word.length; i++) {
      const currentRow = row + i * dRow;
      const currentCol = col + i * dCol;
      const currentCell = grid[currentRow][currentCol];

      // First and last letters must be placed in empty cells
      if ((i === 0 || i === word.length - 1) && currentCell !== "") {
        return false;
      }

      // Middle letters can intersect if they match
      if (currentCell !== "" && currentCell !== word[i]) {
        return false;
      }
    }

    return true;
  };

  // Store cell position for drawing lines
  const storeCellRef = (
    row: number,
    col: number,
    element: HTMLDivElement | null
  ) => {
    if (element) {
      const rect = element.getBoundingClientRect();
      cellRefs.current.set(`${row},${col}`, rect);
    }
  };

  // Find the closest standard direction
  const findClosestDirection = (rowDiff: number, colDiff: number): number[] => {
    if (rowDiff === 0 && colDiff === 0) return [0, 0];

    // Only allow "natural" reading directions
    if (rowDiff === 0 && colDiff > 0) return [0, 1]; // right
    if (rowDiff > 0 && colDiff === 0) return [1, 0]; // down
    if (rowDiff > 0 && colDiff > 0 && Math.abs(rowDiff) === Math.abs(colDiff))
      return [1, 1]; // diagonal down-right
    if (rowDiff < 0 && colDiff > 0 && Math.abs(rowDiff) === Math.abs(colDiff))
      return [-1, 1]; // diagonal up-right

    // If not a natural direction, return null direction
    return [0, 0];
  };

  // Get cells along a standard direction
  const getCellsInDirection = (
    startRow: number,
    startCol: number,
    direction: number[],
    endRow: number,
    endCol: number
  ) => {
    const [dRow, dCol] = direction;

    // If invalid direction, return just the start cell
    if (dRow === 0 && dCol === 0) {
      return [[startRow, startCol]];
    }

    const cells: number[][] = [];
    let currentRow = startRow;
    let currentCol = startCol;

    // Calculate how far we should go in this direction
    const maxSteps = GRID_SIZE; // Maximum grid size

    for (let i = 0; i <= maxSteps; i++) {
      // Add current cell
      cells.push([currentRow, currentCol]);

      // If we've reached or passed the end position in this direction, stop
      if (dRow > 0 && currentRow >= endRow) break;
      if (dRow < 0 && currentRow <= endRow) break;
      if (dCol > 0 && currentCol >= endCol) break;
      if (dCol < 0 && currentCol <= endCol) break;

      // Move to next cell in this direction
      currentRow += dRow;
      currentCol += dCol;

      // Stop if we go out of bounds
      if (
        currentRow < 0 ||
        currentRow >= GRID_SIZE ||
        currentCol < 0 ||
        currentCol >= GRID_SIZE
      ) {
        break;
      }
    }

    return cells;
  };

  // Handle cell selection start
  const handleCellMouseDown = (row: number, col: number) => {
    setIsDragging(true);
    setStartCell([row, col]);
    setSelectedCells([[row, col]]);
  };

  // Handle cell selection during drag
  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isDragging || startCell.length !== 2) return;

    const [startRow, startCol] = startCell;

    // Calculate row and column differences
    const rowDiff = row - startRow;
    const colDiff = col - startCol;

    // Find the closest standard direction
    const direction = findClosestDirection(rowDiff, colDiff);

    // Only update if we have a valid direction
    if (direction[0] !== 0 || direction[1] !== 0) {

      // Get cells along this direction
      const cellsInDirection = getCellsInDirection(
        startRow,
        startCol,
        direction,
        row,
        col
      );
      setSelectedCells(cellsInDirection);
    }
  };

  // Handle selection end
  const handleSelectionEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Only process if we have a valid selection (more than 1 cell)
    if (selectedCells.length > 1) {
      // Get the selected word
      const selectedWord = selectedCells
        .map(([row, col]) => grid[row][col])
        .join("");

      // We only check for forward matches since we only allow natural reading directions
      const isMatch =
        WORD_LIST.includes(selectedWord) || selectedWord === BONUS_WORD;

      if (isMatch && !foundWords.some((fw) => fw.word === selectedWord)) {
        const isBonus = selectedWord === BONUS_WORD;

        setFoundWords([
          ...foundWords,
          {
            word: selectedWord,
            cells: [...selectedCells],
            isBonus,
          },
        ]);
      }
    }

    // Clear selection
    setSelectedCells([]);
    setStartCell([]);
  };

  // Trigger confetti celebration
  const triggerConfetti = () => {
    if (typeof window !== "undefined") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  // Check if a cell is in the current selection
  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(([r, c]) => r === row && c === col);
  };

  // Check if a cell is part of the bonus word
  const isCellInBonusWord = (row: number, col: number) => {
    return foundWords.some(
      (fw) => fw.isBonus && fw.cells.some(([r, c]) => r === row && c === col)
    );
  };

  // Calculate line coordinates for found words
  const getLineCoordinates = () => {
    const lines: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      word: string;
    }[] = [];
    const gridRect = gridRef.current?.getBoundingClientRect();

    if (!gridRect) return lines;

    // Only process non-bonus words
    const nonBonusWords = foundWords.filter((fw) => !fw.isBonus);

    for (const foundWord of nonBonusWords) {
      if (foundWord.cells.length < 2) continue;

      const startCell = foundWord.cells[0];
      const endCell = foundWord.cells[foundWord.cells.length - 1];

      const startRect = cellRefs.current.get(`${startCell[0]},${startCell[1]}`);
      const endRect = cellRefs.current.get(`${endCell[0]},${endCell[1]}`);

      if (startRect && endRect) {
        // Calculate center points relative to the grid
        const startX = startRect.left + startRect.width / 2 - gridRect.left;
        const startY = startRect.top + startRect.height / 2 - gridRect.top;
        const endX = endRect.left + endRect.width / 2 - gridRect.left;
        const endY = endRect.top + endRect.height / 2 - gridRect.top;

        lines.push({
          x1: startX,
          y1: startY,
          x2: endX,
          y2: endY,
          word: foundWord.word,
        });
      }
    }

    return lines;
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-md mx-auto">
      <div className="flex justify-center w-full">
        {/* Game grid */}
        <div className="relative">
          <div
            ref={gridRef}
            className="grid grid-cols-9 touch-none border border-slate-600 rounded-md p-2 bg-muted/20"
            onMouseUp={handleSelectionEnd}
            onMouseLeave={handleSelectionEnd}
            onTouchEnd={handleSelectionEnd}
          >
            {grid.map((row, rowIndex) =>
              row.map((letter, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  ref={(el) => storeCellRef(rowIndex, colIndex, el)}
                  className={`
                    aspect-square w-8 h-8 md:w-10 md:h-10 flex items-center justify-center 
                    font-bold text-lg md:text-xl 
                    select-none cursor-pointer transition-colors
                    ${
                      isCellSelected(rowIndex, colIndex)
                        ? "bg-slate-600 text-white"
                        : "bg-transparent"
                    }
                    ${
                      isCellInBonusWord(rowIndex, colIndex)
                        ? "bg-green-100"
                        : ""
                    }
                  `}
                  onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                  onTouchStart={() => handleCellMouseDown(rowIndex, colIndex)}
                  onTouchMove={(e) => {
                    if (!gridRef.current || !isDragging) return;

                    // Get touch position relative to grid
                    const touch = e.touches[0];
                    const gridRect = gridRef.current.getBoundingClientRect();
                    const x = touch.clientX - gridRect.left;
                    const y = touch.clientY - gridRect.top;

                    // Calculate which cell the touch is over
                    const cellWidth = gridRect.width / GRID_SIZE;
                    const cellHeight = gridRect.height / GRID_SIZE;

                    const col = Math.floor(x / cellWidth);
                    const row = Math.floor(y / cellHeight);

                    // Only process valid cells
                    if (
                      row >= 0 &&
                      row < GRID_SIZE &&
                      col >= 0 &&
                      col < GRID_SIZE
                    ) {
                      handleCellMouseEnter(row, col);
                    }
                  }}
                >
                  {letter}
                </div>
              ))
            )}
          </div>

          {/* SVG overlay for drawing lines */}
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: 10 }}
          >
            {getLineCoordinates().map((line, index) => (
              <line
                key={index}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="rgba(220, 38, 38, 0.4)" // More transparent red
                strokeWidth="2" // Thinner line
                strokeLinecap="round"
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
