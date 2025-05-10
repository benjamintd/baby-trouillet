import { rng } from "./random";

// Types for word placement
export type Direction = number[]; // [rowDelta, colDelta]
export type Cell = number[]; // [row, col]
export type WordPlacement = {
  word: string;
  startCell: Cell;
  direction: Direction;
  cells: Cell[];
};

// Constants
export const DIRECTIONS: Direction[] = [
  [1, 1], // diagonal down-right
  [0, 1], // right (non-diagonal)
  [1, 0], // down (non-diagonal)
];

// Check if a cell is within grid bounds
export const isInBounds = (cell: Cell, [gridRows, gridCols]: [number, number]): boolean => {
  const [row, col] = cell;
  return row >= 0 && row < gridRows && col >= 0 && col < gridCols;
};


// Seeded shuffle function
export const shuffle = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Get all cells in a specific direction from a starting cell
export const getCellsInDirection = (
  startCell: Cell,
  direction: Direction,
  length: number,
  gridSize: [number, number]
): Cell[] => {
  const cells: Cell[] = [];
  const [startRow, startCol] = startCell;
  const [dRow, dCol] = direction;

  for (let i = 0; i < length; i++) {
    const row = startRow + i * dRow;
    const col = startCol + i * dCol;

    if (!isInBounds([row, col], gridSize)) {
      break;
    }

    cells.push([row, col]);
  }

  return cells;
};

// Check if a cell has potential to be part of a 3+ letter word in any direction
export const hasPotentialForWord = (
  grid: string[][],
  cell: Cell,
  gridSize: [number, number]
): boolean => {
  const [row, col] = cell;

  // If already filled, consider it as having potential
  if (grid[row][col] !== "") {
    return true;
  }

  // Check each direction
  for (const direction of DIRECTIONS) {
    let count = 1; // include the cell itself
    // Look forward
    let currentRow = row + direction[0];
    let currentCol = col + direction[1];
    while (
      isInBounds([currentRow, currentCol], gridSize) &&
      grid[currentRow][currentCol] === ""
    ) {
      count++;
      currentRow += direction[0];
      currentCol += direction[1];
    }
    // Look backward
    currentRow = row - direction[0];
    currentCol = col - direction[1];
    while (
      isInBounds([currentRow, currentCol], gridSize) &&
      grid[currentRow][currentCol] === ""
    ) {
      count++;
      currentRow -= direction[0];
      currentCol -= direction[1];
    }
    if (count >= 3) {
      return true;
    }
  }

  return false;
};

// Count dead spaces created by a word placement
export const countDeadSpaces = (
  grid: string[][],
  placement: WordPlacement,
  gridSize: [number, number]
): number => {
  // Create a temporary copy of the grid
  const tempGrid = grid.map((row) => [...row]);

  // Place the word in the temporary grid
  for (const [row, col] of placement.cells) {
    const index = placement.cells.findIndex(
      (cell) => cell[0] === row && cell[1] === col
    );
    tempGrid[row][col] = placement.word[index];
  }

  let deadSpaces = 0;
  const checkedCells = new Set<string>();

  // Check all cells adjacent to the placement for dead space potential
  for (const [row, col] of placement.cells) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;

        const adjacentRow = row + dr;
        const adjacentCol = col + dc;
        const cellKey = `${adjacentRow},${adjacentCol}`;

        if (
          checkedCells.has(cellKey) ||
          !isInBounds([adjacentRow, adjacentCol], gridSize)
        ) {
          continue;
        }
        checkedCells.add(cellKey);

        // Skip if already filled
        if (tempGrid[adjacentRow][adjacentCol] !== "") {
          continue;
        }

        // Penalize if this empty cell does not allow room for a 3+ letter word
        if (
          !hasPotentialForWord(tempGrid, [adjacentRow, adjacentCol], gridSize)
        ) {
          deadSpaces++;
        }
      }
    }
  }

  return deadSpaces;
};

// Score a word placement based on various factors
export const scorePlacement = (
  grid: string[][],
  placement: WordPlacement,
  gridSize: [number, number],
  isBonus: boolean
): number => {
  let score = 0;
  // Reward intersections and edge placements
  for (let i = 0; i < placement.cells.length; i++) {
    const [row, col] = placement.cells[i];
    const letter = placement.word[i];

    // Favor intersections with matching letters
    if (grid[row][col] === letter && grid[row][col] !== "") {
      score += 10;
    }

    const [gridRows, gridCols] = gridSize;

    // Slight bonus for edge placements to preserve central space
    const distanceFromEdge = Math.min(
      row,
      col,
      gridRows - 1 - row,
      gridCols - 1 - col
    );
    score += distanceFromEdge === 0 ? 3 : 0;
  }

  // Penalize based on created dead spaces
  const deadSpaces = countDeadSpaces(grid, placement, gridSize);
  score -= deadSpaces * 5;

  // For bonus word, strongly favor diagonal placements
  if (isBonus) {
    const [dRow, dCol] = placement.direction;
    if (Math.abs(dRow) === 1 && Math.abs(dCol) === 1) {
      score += 10000;
    }
  }

  return score;
};

// Check if a word can be placed at a specific position and direction
export const canPlaceWord = (
  grid: string[][],
  word: string,
  startCell: Cell,
  direction: Direction,
  [gridRows, gridCols]: [number, number],
  isBonus: boolean,
  bonusWordCells: Set<string>
): boolean => {
  const [startRow, startCol] = startCell;
  const [dRow, dCol] = direction;

  // Ensure the word does not run out of bounds
  if (
    startRow + dRow * (word.length - 1) < 0 ||
    startRow + dRow * (word.length - 1) >= gridRows ||
    startCol + dCol * (word.length - 1) < 0 ||
    startCol + dCol * (word.length - 1) >= gridCols
  ) {
    return false;
  }

  // Check each letter’s cell
  for (let i = 0; i < word.length; i++) {
    const currentRow = startRow + i * dRow;
    const currentCol = startCol + i * dCol;
    const currentCell = grid[currentRow][currentCol];
    const cellKey = `${currentRow},${currentCol}`;

    // Bonus word must be placed on empty cells
    if (isBonus && currentCell !== "") {
      return false;
    }

    // Other words cannot use cells occupied by the bonus word
    if (!isBonus && bonusWordCells.has(cellKey)) {
      return false;
    }

    // Enforce that the first and last letters are in empty cells
    if ((i === 0 || i === word.length - 1) && currentCell !== "") {
      return false;
    }

    // Allow intersections in the middle only if the letters match
    if (currentCell !== "" && currentCell !== word[i]) {
      return false;
    }
  }

  return true;
};

// Place a word in the grid and return the cells it occupies
export const placeWord = (
  grid: string[][],
  word: string,
  startCell: Cell,
  direction: Direction
): Cell[] => {
  const [startRow, startCol] = startCell;
  const [dRow, dCol] = direction;
  const cells: Cell[] = [];

  for (let i = 0; i < word.length; i++) {
    const currentRow = startRow + i * dRow;
    const currentCol = startCol + i * dCol;
    grid[currentRow][currentCol] = word[i];
    cells.push([currentRow, currentCol]);
  }

  return cells;
};

// Find the best placement for a word by iterating over all grid cells and directions
export const findBestPlacement = (
  grid: string[][],
  word: string,
  gridSize: [number, number],
  isBonus: boolean,
  bonusWordCells: Set<string>,
  usedDirections: Set<number>
): WordPlacement | null => {
  let bestScore = Number.NEGATIVE_INFINITY;
  let bestPlacement: WordPlacement | null = null;

  // Build an array of direction indices.
  let directionsToTry = [...DIRECTIONS.keys()];

  if (isBonus) {
    // For the bonus word, prioritize diagonal directions (indices 0 and 1)
    directionsToTry.sort((a, b) => {
      const aIsDiag = a === 0 || a === 1 ? 1 : 0;
      const bIsDiag = b === 0 || b === 1 ? 1 : 0;
      return bIsDiag - aIsDiag;
    });
  } else {
    // For non-bonus words, favor non-diagonals (horizontal/vertical) first,
    // then consider whether the direction has been used.
    directionsToTry.sort((a, b) => {
      const aIsDiag = DIRECTIONS[a][0] !== 0 && DIRECTIONS[a][1] !== 0 ? 1 : 0;
      const bIsDiag = DIRECTIONS[b][0] !== 0 && DIRECTIONS[b][1] !== 0 ? 1 : 0;
      if (aIsDiag !== bIsDiag) {
        return aIsDiag - bIsDiag; // non-diagonals (0) come first
      }
      const aUsed = usedDirections.has(a) ? 1 : 0;
      const bUsed = usedDirections.has(b) ? 1 : 0;
      return aUsed - bUsed;
    });
  }

  const [gridRows, gridCols] = gridSize;
  // Build a list of all grid cells.
  let cells: Cell[] = [];
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      cells.push([row, col]);
    }
  }
  // For the bonus word, shuffle the cells to avoid always starting at [0,0]
  if (isBonus) {
    cells = shuffle(cells);
  }

  // Iterate over the list of cells (shuffled for bonus word)
  for (const startCell of cells) {
    for (const dirIndex of directionsToTry) {
      const direction = DIRECTIONS[dirIndex];
      const endRow = startCell[0] + direction[0] * (word.length - 1);
      const endCol = startCell[1] + direction[1] * (word.length - 1);
      if (
        endRow < 0 ||
        endRow >= gridRows ||
        endCol < 0 ||
        endCol >= gridCols
      ) {
        continue;
      }

      if (
        canPlaceWord(
          grid,
          word,
          startCell,
          direction,
          gridSize,
          isBonus,
          bonusWordCells
        )
      ) {
        const cellsInWord = getCellsInDirection(
          startCell,
          direction,
          word.length,
          gridSize
        );
        const placement: WordPlacement = {
          word,
          startCell,
          direction,
          cells: cellsInWord,
        };
        const score = scorePlacement(grid, placement, gridSize, isBonus);

        if (score > bestScore) {
          bestScore = score;
          bestPlacement = placement;
          // For bonus words, we continue checking all shuffled cells to avoid always defaulting to [0,0]
        }
      }
    }
  }

  return bestPlacement;
};

// Place words in the grid; bonus word is placed first (diagonally if possible)
// and subsequent words avoid bonus word cells and aim for efficient packing.
export const placeWordsInGrid = (
  grid: string[][],
  words: string[],
  gridSize: [number, number]
): {
  bonusWordCells: Cell[];
  bonusWordDirection: Direction;
  placedWords: string[];
} => {
  const placedWords: string[] = [];
  let bonusWordCells: Cell[] = [];
  let bonusWordDirection: Direction = [0, 0];

  // Track which directions have been used
  const usedDirections = new Set<number>();
  // Track cells occupied by the bonus word so no other word overlaps them
  const bonusWordOccupiedCells = new Set<string>();

  // Process words in order: bonus word first, then the others
  for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
    const word = words[wordIndex];
    const isBonus = wordIndex === 0;

    const bestPlacement = findBestPlacement(
      grid,
      word,
      gridSize,
      isBonus,
      bonusWordOccupiedCells,
      usedDirections
    );

    if (bestPlacement) {
      const dirIndex = DIRECTIONS.findIndex(
        (dir) =>
          dir[0] === bestPlacement.direction[0] &&
          dir[1] === bestPlacement.direction[1]
      );

      const wordCells = placeWord(
        grid,
        word,
        bestPlacement.startCell,
        bestPlacement.direction
      );

      if (isBonus) {
        bonusWordCells = wordCells;
        bonusWordDirection = bestPlacement.direction;
        for (const [row, col] of wordCells) {
          bonusWordOccupiedCells.add(`${row},${col}`);
        }
      }

      usedDirections.add(dirIndex);
      placedWords.push(word);
    } 
  }

  return {
    bonusWordCells,
    bonusWordDirection,
    placedWords,
  };
};
