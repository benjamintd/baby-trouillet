// Types for word placement
export type Direction = number[] // [rowDelta, colDelta]
export type Cell = number[] // [row, col]
export type WordPlacement = {
  word: string
  startCell: Cell
  direction: Direction
  cells: Cell[]
}

// Constants
export const DIRECTIONS: Direction[] = [
  [1, 1], // diagonal down-right
  [-1, 1], // diagonal up-right
  [0, 1], // right
  [1, 0], // down
]

// Check if a cell is within grid bounds
export const isInBounds = (cell: Cell, gridSize: number): boolean => {
  const [row, col] = cell
  return row >= 0 && row < gridSize && col >= 0 && col < gridSize
}

// Get all cells in a specific direction from a starting cell
export const getCellsInDirection = (
  startCell: Cell,
  direction: Direction,
  length: number,
  gridSize: number,
): Cell[] => {
  const cells: Cell[] = []
  const [startRow, startCol] = startCell
  const [dRow, dCol] = direction

  for (let i = 0; i < length; i++) {
    const row = startRow + i * dRow
    const col = startCol + i * dCol

    if (!isInBounds([row, col], gridSize)) {
      break
    }

    cells.push([row, col])
  }

  return cells
}

// Check if a cell has potential to be part of a 4+ letter word in any direction
export const hasPotentialForWord = (grid: string[][], cell: Cell, gridSize: number): boolean => {
  const [row, col] = cell

  // Skip if cell is already filled
  if (grid[row][col] !== "") {
    return true
  }

  // Check each direction for potential 4+ letter word
  for (const direction of DIRECTIONS) {
    // Check forward
    let forwardCount = 0
    let currentRow = row
    let currentCol = col

    while (
      isInBounds([currentRow, currentCol], gridSize) &&
      (grid[currentRow][currentCol] === "" || [row, col].toString() === [currentRow, currentCol].toString()) &&
      forwardCount < 4
    ) {
      forwardCount++
      currentRow += direction[0]
      currentCol += direction[1]
    }

    // Check backward
    let backwardCount = 0
    currentRow = row - direction[0]
    currentCol = col - direction[1]

    while (isInBounds([currentRow, currentCol], gridSize) && grid[currentRow][currentCol] === "" && backwardCount < 3) {
      backwardCount++
      currentRow -= direction[0]
      currentCol -= direction[1]
    }

    // If total potential length is at least 4, this cell has potential
    if (forwardCount + backwardCount >= 4) {
      return true
    }
  }

  return false
}

// Count dead spaces created by a word placement
export const countDeadSpaces = (grid: string[][], placement: WordPlacement, gridSize: number): number => {
  // Create a temporary grid with the word placed
  const tempGrid = grid.map((row) => [...row])

  // Place the word in the temporary grid
  for (const [row, col] of placement.cells) {
    const index = placement.cells.findIndex((cell) => cell[0] === row && cell[1] === col)
    tempGrid[row][col] = placement.word[index]
  }

  // Count cells that would become dead spaces
  let deadSpaces = 0

  // Check cells adjacent to the word placement
  const checkedCells = new Set<string>()

  for (const [row, col] of placement.cells) {
    // Check all 8 adjacent cells
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue

        const adjacentRow = row + dr
        const adjacentCol = col + dc
        const cellKey = `${adjacentRow},${adjacentCol}`

        // Skip if already checked or out of bounds
        if (checkedCells.has(cellKey) || !isInBounds([adjacentRow, adjacentCol], gridSize)) {
          continue
        }

        checkedCells.add(cellKey)

        // Skip if cell is already filled
        if (tempGrid[adjacentRow][adjacentCol] !== "") {
          continue
        }

        // Check if this empty cell has potential for a 4+ letter word
        if (!hasPotentialForWord(tempGrid, [adjacentRow, adjacentCol], gridSize)) {
          deadSpaces++
        }
      }
    }
  }

  return deadSpaces
}

// Score a word placement based on various factors
export const scorePlacement = (
  grid: string[][],
  placement: WordPlacement,
  gridSize: number,
  isBonus: boolean,
  bonusWordCells: Set<string>,
): number => {
  let score = 0
  let intersections = 0

  // Check each cell of the placement
  for (let i = 0; i < placement.cells.length; i++) {
    const [row, col] = placement.cells[i]
    const letter = placement.word[i]

    // Favor intersections with existing words
    if (grid[row][col] === letter && grid[row][col] !== "") {
      intersections++
      score += 10
    }

    // Favor edge placements to maximize center space
    const distanceFromEdge = Math.min(row, col, gridSize - 1 - row, gridSize - 1 - col)
    score += distanceFromEdge === 0 ? 3 : 0
  }

  // Penalize dead spaces
  const deadSpaces = countDeadSpaces(grid, placement, gridSize)
  score -= deadSpaces * 5

  // Favor diagonal placements for the bonus word
  if (isBonus) {
    const [dRow, dCol] = placement.direction
    // Check if it's a diagonal direction
    if (Math.abs(dRow) === 1 && Math.abs(dCol) === 1) {
      score += 10000 // Significant bonus for diagonal placement of bonus word
    }
  }

  return score
}

// Check if a word can be placed at a specific position and direction
export const canPlaceWord = (
  grid: string[][],
  word: string,
  startCell: Cell,
  direction: Direction,
  gridSize: number,
  isBonus: boolean,
  bonusWordCells: Set<string>,
): boolean => {
  const [startRow, startCol] = startCell
  const [dRow, dCol] = direction

  // Check if word would go out of bounds
  if (
    startRow + dRow * (word.length - 1) < 0 ||
    startRow + dRow * (word.length - 1) >= gridSize ||
    startCol + dCol * (word.length - 1) < 0 ||
    startCol + dCol * (word.length - 1) >= gridSize
  ) {
    return false
  }

  // Check each cell for placement
  for (let i = 0; i < word.length; i++) {
    const currentRow = startRow + i * dRow
    const currentCol = startCol + i * dCol
    const currentCell = grid[currentRow][currentCol]
    const cellKey = `${currentRow},${currentCol}`

    // If this is the bonus word, all cells must be empty
    if (isBonus && currentCell !== "") {
      return false
    }

    // If this is not the bonus word, it cannot overlap with bonus word cells
    if (!isBonus && bonusWordCells.has(cellKey)) {
      return false
    }

    // First and last letters must be placed in empty cells
    if ((i === 0 || i === word.length - 1) && currentCell !== "") {
      return false
    }

    // Middle letters can intersect if they match
    if (currentCell !== "" && currentCell !== word[i]) {
      return false
    }
  }

  return true
}

// Place a word in the grid and return the cells it occupies
export const placeWord = (
  grid: string[][],
  word: string,
  startCell: Cell,
  direction: Direction,
): Cell[] => {
  const [startRow, startCol] = startCell
  const [dRow, dCol] = direction
  const cells: Cell[] = []

  for (let i = 0; i < word.length; i++) {
    const currentRow = startRow + i * dRow
    const currentCol = startCol + i * dCol
    grid[currentRow][currentCol] = word[i]
    cells.push([currentRow, currentCol])
  }

  return cells
}

// Find the best placement for a word
export const findBestPlacement = (
  grid: string[][],
  word: string,
  gridSize: number,
  isBonus: boolean,
  bonusWordCells: Set<string>,
  usedDirections: Set<number>,
): WordPlacement | null => {
  let bestScore = Number.NEGATIVE_INFINITY
  let bestPlacement: WordPlacement | null = null

  // Adaptive attempts based on word length
  const maxAttempts = 300 + word.length * 30

  // Try each direction, prioritizing unused ones
  const directionIndices = [...Array(DIRECTIONS.length).keys()]

  // Sort directions: for bonus word, prioritize diagonals
  if (isBonus) {
    // Prioritize diagonal directions (indices 0 and 1 in our DIRECTIONS array)
    directionIndices.sort((a, b) => {
      // Diagonal directions are indices 0 and 1
      const aIsDiagonal = a === 0 || a === 1
      const bIsDiagonal = b === 0 || b === 1

      if (aIsDiagonal && !bIsDiagonal) return -1
      if (!aIsDiagonal && bIsDiagonal) return 1
      return 0
    })
  } else {
    // For non-bonus words, prioritize unused directions
    directionIndices.sort((a, b) => {
      if (usedDirections.has(a) && !usedDirections.has(b)) return 1
      if (!usedDirections.has(a) && usedDirections.has(b)) return -1
      return 0
    })
  }

  // Try to find the best position
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Choose a direction, prioritizing based on the sorted indices
    const dirIndex = directionIndices[attempt % directionIndices.length]
    const direction = DIRECTIONS[dirIndex]

    // Choose starting position - try edge positions more often for longer words
    let startRow, startCol
    if (Math.random() < 0.6 && word.length > 3) {
      // Try edge positions
      const edge = Math.floor(Math.random() * 4)
      if (edge === 0) {
        startRow = 0
        startCol = Math.floor(Math.random() * gridSize)
      } else if (edge === 1) {
        startRow = gridSize - 1
        startCol = Math.floor(Math.random() * gridSize)
      } else if (edge === 2) {
        startRow = Math.floor(Math.random() * gridSize)
        startCol = 0
      } else {
        startRow = Math.floor(Math.random() * gridSize)
        startCol = gridSize - 1
      }
    } else {
      // Random position
      startRow = Math.floor(Math.random() * gridSize)
      startCol = Math.floor(Math.random() * gridSize)
    }

    const startCell: Cell = [startRow, startCol]

    // Check if word fits
    if (canPlaceWord(grid, word, startCell, direction, gridSize, isBonus, bonusWordCells)) {
      // Create a potential placement
      const cells = getCellsInDirection(startCell, direction, word.length, gridSize)
      const placement: WordPlacement = {
        word,
        startCell,
        direction,
        cells,
      }

      // Score this placement
      const score = scorePlacement(grid, placement, gridSize, isBonus, bonusWordCells)

      // Update best position if this is better
      if (score > bestScore) {
        bestScore = score
        bestPlacement = placement
      }

      // For bonus word, if we found a good diagonal placement, use it immediately
      if (isBonus && score > 20 && Math.abs(direction[0]) === 1 && Math.abs(direction[1]) === 1) {
        break
      }

      // If this is a good enough score or we're running out of attempts, use it
      if (score > 15 || attempt > maxAttempts * 0.8) {
        break
      }
    }
  }

  return bestPlacement
}

// Place words in the grid
export const placeWordsInGrid = (
  grid: string[][],
  words: string[],
  gridSize: number,
): { bonusWordCells: Cell[]; bonusWordDirection: Direction; unplacedWords: string[] } => {
  const unplacedWords: string[] = []
  let bonusWordCells: Cell[] = []
  let bonusWordDirection: Direction = [0, 0]

  // Track which directions have been used
  const usedDirections = new Set<number>()

  // Track cells used by the bonus word
  const bonusWordOccupiedCells = new Set<string>()

  // Process words in order (bonus word first, then by length)
  for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
    const word = words[wordIndex]
    const isBonus = wordIndex === 0 // First word is the bonus word

    // Find the best placement for this word
    const bestPlacement = findBestPlacement(grid, word, gridSize, isBonus, bonusWordOccupiedCells, usedDirections)

    // Place the word if a valid placement was found
    if (bestPlacement) {
      const dirIndex = DIRECTIONS.findIndex(
        (dir) => dir[0] === bestPlacement.direction[0] && dir[1] === bestPlacement.direction[1],
      )

      // Place the word in the grid
      const wordCells = placeWord(grid, word, bestPlacement.startCell, bestPlacement.direction)

      // If this is the bonus word, track its cells
      if (isBonus) {
        bonusWordCells = wordCells
        bonusWordDirection = bestPlacement.direction

        // Mark bonus word cells
        for (const [row, col] of wordCells) {
          bonusWordOccupiedCells.add(`${row},${col}`)
        }
      }

      // Mark direction as used
      usedDirections.add(dirIndex)
    } else {
      // Couldn't place the word
      unplacedWords.push(word)
    }
  }

  return {
    bonusWordCells,
    bonusWordDirection,
    unplacedWords,
  }
}

