"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { shuffle } from "lodash"
import { placeWordsInGrid, type Cell, type Direction } from "../lib/placeWordsInGrid"
import fr from "../lib/dictionnaries/fr"
import { useAtom } from "jotai"
import { hasWonMotMeleAtom } from "../core/atoms"

// Only "natural" reading directions
const DIRECTIONS: Direction[] = [
  [0, 1], // right
  [1, 0], // down
  [1, 1], // diagonal down-right
  [-1, 1], // diagonal up-right
]

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
  "EVA",
  "NINA",
  "CAMILLE",
  "LUCIE",
  "LEONIE",
  "IRIS",
  "ADELE",
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
  "LYNA",
  "MAELYS",
  "MATHILDE",
  "LEANA",
  "ANAIS",
  "LILOU",
  "APOLLINE",
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
  "FAUSTINE",
  "MAELLE",
  "MELINA",
  "GABRIEL",
  "MARC",
  "LEO",
  "LOUIS",
  "RAPHAEL",
  "JULES",
  "ADAM",
  "ARTHUR",
  "HUGO",
  "ETHAN",
  "NATHAN",
  "PAUL",
  "SACHA",
  "GABIN",
  "TOM",
  "THEO",
  "MATHIS",
  "VICTOR",
  "AXEL",
  "MARTIN",
  "LEON",
  "ANTOINE",
  "MARIUS",
  "ROBIN",
  "NAEL",
  "BAPTISTE",
  "MAXIME",
  "SAMUEL",
  "ELIOTT",
  "MAXENCE",
  "MALO",
  "MATHEO",
  "GASPARD",
  "MARCEAU",
  "EVAN",
  "SIMON",
  "AYDEN",
  "THOMAS",
  "OSCAR",
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
  "TITOUAN"
])

const GRID_SIZE = 10

export default function MotsMeles({ bonusWord }: { bonusWord: string }) {
  const ALL_VALID_WORDS = [...fr.split("\n").map((s) => s.toUpperCase()), ...WORD_LIST, bonusWord]
    .filter((word) => word.length >= 2)
    .sort()

  const [_, setHasWon] = useAtom(hasWonMotMeleAtom)
  const [grid, setGrid] = useState<string[][]>([])
  const [foundWords, setFoundWords] = useState<
    {
      word: string
      cells: Cell[]
      isBonus: boolean
      direction?: Direction
    }[]
  >([])
  const [selectedCells, setSelectedCells] = useState<Cell[]>([])
  const [startCell, setStartCell] = useState<Cell>([0, 0])
  const [isDragging, setIsDragging] = useState(false)

  const gridRef = useRef<HTMLDivElement>(null)
  const cellRefs = useRef<Map<string, DOMRect>>(new Map())

  // Initialize the game
  useEffect(() => {
    setGrid(
      Array(GRID_SIZE)
        .fill(null)
        .map(() => Array(GRID_SIZE).fill("")),
    )
    generateNewGame()
  }, [])

  // Check if game is won
  useEffect(() => {
    if (foundWords.some((fw) => fw.isBonus)) {
      setHasWon(true)
    }
  }, [foundWords, setHasWon])

  // Generate a new game with words placed in the grid
  const generateNewGame = () => {
    setFoundWords([])

    // Create empty GRID_SIZE grid
    const newGrid = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(""))

    // Place words in the grid
    const allWords = [bonusWord, ...WORD_LIST]
    try {
      const { unplacedWords } = placeWordsInGrid(newGrid, allWords, GRID_SIZE)

      // Fill remaining cells with random letters
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (newGrid[row][col] === "") {
            newGrid[row][col] = String.fromCharCode(65 + Math.floor(Math.random() * 26))
          }
        }
      }

      setGrid(newGrid)

      // Log how many words were placed successfully
      console.log(`Placed ${allWords.length - unplacedWords.length} out of ${allWords.length} words`)
      if (unplacedWords.length > 0) {
        console.log(`Unplaced words: ${unplacedWords.join(", ")}`)
      }
    } catch (error) {
      console.error("Error placing words:", error)
      // Create a fallback grid with random letters if placement fails
      const fallbackGrid = Array(GRID_SIZE)
        .fill(null)
        .map(() =>
          Array(GRID_SIZE)
            .fill("")
            .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))),
        )

      setGrid(fallbackGrid)
    }

    // Reset cell refs for new game
    cellRefs.current = new Map()
  }

  // Store cell position for drawing lines
  const storeCellRef = (row: number, col: number, element: HTMLDivElement | null) => {
    if (element) {
      const rect = element.getBoundingClientRect()
      cellRefs.current.set(`${row},${col}`, rect)
    }
  }

  // Find the best direction based on start and end cells
  const findBestDirection = (startCell: Cell, endCell: Cell): { direction: Direction; endCell: Cell } => {
    const [startRow, startCol] = startCell
    const [endRow, endCol] = endCell

    // Calculate row and column differences
    const rowDiff = endRow - startRow
    const colDiff = endCol - startCol

    // If it's already a standard direction, return it
    if (
      (rowDiff === 0 && colDiff !== 0) || // horizontal
      (colDiff === 0 && rowDiff !== 0) || // vertical
      (Math.abs(rowDiff) === Math.abs(colDiff) && rowDiff !== 0 && colDiff !== 0) // diagonal
    ) {
      // Normalize the direction
      const dRow = rowDiff === 0 ? 0 : rowDiff > 0 ? 1 : -1
      const dCol = colDiff === 0 ? 0 : colDiff > 0 ? 1 : -1
      return { direction: [dRow, dCol], endCell }
    }

    // Calculate the angle of the line from start to end
    const angle = Math.atan2(rowDiff, colDiff)

    // Find the closest standard direction based on angle
    let bestDirection: Direction = [0, 0]
    let minAngleDiff = Math.PI

    for (const dir of DIRECTIONS) {
      const dirAngle = Math.atan2(dir[0], dir[1])
      const angleDiff = Math.abs(angle - dirAngle)

      // Normalize angle difference to be between 0 and PI
      const normalizedAngleDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff)

      if (normalizedAngleDiff < minAngleDiff) {
        minAngleDiff = normalizedAngleDiff
        bestDirection = dir
      }
    }

    // Calculate the projected end cell based on the best direction
    // We want to go as far as possible in the best direction while staying within bounds
    const [dRow, dCol] = bestDirection

    // Calculate how far we can go in this direction
    const distance = Math.max(Math.abs(rowDiff), Math.abs(colDiff))

    // Calculate the new end cell
    let newEndRow = startRow
    let newEndCol = startCol

    // Find the furthest valid cell in this direction
    for (let i = 1; i <= distance; i++) {
      const nextRow = startRow + i * dRow
      const nextCol = startCol + i * dCol

      // Stop if we go out of bounds
      if (nextRow < 0 || nextRow >= GRID_SIZE || nextCol < 0 || nextCol >= GRID_SIZE) {
        break
      }

      newEndRow = nextRow
      newEndCol = nextCol
    }

    return { direction: bestDirection, endCell: [newEndRow, newEndCol] }
  }

  // Get cells along a standard direction
  const getCellsInDirection = (startCell: Cell, direction: Direction, endCell: Cell): Cell[] => {
    const [startRow, startCol] = startCell
    const [dRow, dCol] = direction
    const [endRow, endCol] = endCell

    // If invalid direction, return just the start cell
    if (dRow === 0 && dCol === 0) {
      return [startCell]
    }

    const cells: Cell[] = []
    let currentRow = startRow
    let currentCol = startCol

    // Calculate how far we should go in this direction
    const maxSteps = GRID_SIZE // Maximum grid size

    for (let i = 0; i <= maxSteps; i++) {
      // Add current cell
      cells.push([currentRow, currentCol])

      // If we've reached or passed the end position in this direction, stop
      if (dRow > 0 && currentRow >= endRow) break
      if (dRow < 0 && currentRow <= endRow) break
      if (dCol > 0 && currentCol >= endCol) break
      if (dCol < 0 && currentCol <= endCol) break

      // Move to next cell in this direction
      currentRow += dRow
      currentCol += dCol

      // Stop if we go out of bounds
      if (currentRow < 0 || currentRow >= GRID_SIZE || currentCol < 0 || currentCol >= GRID_SIZE) {
        break
      }
    }

    return cells
  }

  // Handle cell selection start
  const handleCellMouseDown = (row: number, col: number) => {
    setIsDragging(true)
    setStartCell([row, col])
    setSelectedCells([[row, col]])
  }

  // Handle cell selection during drag
  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isDragging || startCell.length !== 2) return

    // Find the best direction and projected end cell
    const { direction, endCell } = findBestDirection(startCell, [row, col])

    // Only update if we have a valid direction
    if (direction[0] !== 0 || direction[1] !== 0) {
      // Get cells along this direction
      const cellsInDirection = getCellsInDirection(startCell, direction, endCell)
      setSelectedCells(cellsInDirection)
    }
  }

  // Handle selection end
  const handleSelectionEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    // Only process if we have a valid selection (more than 1 cell)
    if (selectedCells.length > 1) {
      // Get the selected word
      const selectedWord = selectedCells.map(([row, col]) => grid[row][col]).join("")

      // We only check for forward matches since we only allow natural reading directions
      const isMatch = ALL_VALID_WORDS.includes(selectedWord)

      if (isMatch && !foundWords.some((fw) => fw.word === selectedWord)) {
        const isBonus = selectedWord === bonusWord

        // Calculate direction
        const direction =
          selectedCells.length > 1
            ? [selectedCells[1][0] - selectedCells[0][0], selectedCells[1][1] - selectedCells[0][1]]
            : [0, 0]

        setFoundWords([
          ...foundWords,
          {
            word: selectedWord,
            cells: [...selectedCells],
            isBonus,
            direction,
          },
        ])
      }
    }

    // Clear selection
    setSelectedCells([])
    setStartCell([])
  }

  // Check if a cell is in the current selection
  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(([r, c]) => r === row && c === col)
  }

  // Calculate line coordinates for found words
  const getLineCoordinates = () => {
    const lines: {
      x1: number
      y1: number
      x2: number
      y2: number
      word: string
    }[] = []
    const gridRect = gridRef.current?.getBoundingClientRect()

    if (!gridRect) return lines

    // Only process non-bonus words
    const nonBonusWords = foundWords.filter((fw) => !fw.isBonus)

    for (const foundWord of nonBonusWords) {
      if (foundWord.cells.length < 2) continue

      const startCell = foundWord.cells[0]
      const endCell = foundWord.cells[foundWord.cells.length - 1]

      const startRect = cellRefs.current.get(`${startCell[0]},${startCell[1]}`)
      const endRect = cellRefs.current.get(`${endCell[0]},${endCell[1]}`)

      if (startRect && endRect) {
        // Calculate center points relative to the grid
        const startX = startRect.left + startRect.width / 2 - gridRect.left
        const startY = startRect.top + startRect.height / 2 - gridRect.top
        const endX = endRect.left + endRect.width / 2 - gridRect.left
        const endY = endRect.top + endRect.height / 2 - gridRect.top

        lines.push({
          x1: startX,
          y1: startY,
          x2: endX,
          y2: endY,
          word: foundWord.word,
        })
      }
    }

    return lines
  }

  // Get the path for the bonus word highlight
  const getBonusWordHighlightPath = () => {
    const foundBonusWord = foundWords.find((fw) => fw.isBonus)
    if (!foundBonusWord || !gridRef.current || foundBonusWord.cells.length < 2) return null

    const cells = foundBonusWord.cells
    const gridRect = gridRef.current.getBoundingClientRect()
    const direction = foundBonusWord.direction || [0, 0]

    // Check if it's a diagonal word
    const isDiagonal = Math.abs(direction[0]) === 1 && Math.abs(direction[1]) === 1

    if (isDiagonal) {
      // For diagonal words, create an angled rectangle
      const firstCell = cells[0]
      const lastCell = cells[cells.length - 1]

      const firstCellRect = cellRefs.current.get(`${firstCell[0]},${firstCell[1]}`)
      const lastCellRect = cellRefs.current.get(`${lastCell[0]},${lastCell[1]}`)

      if (!firstCellRect || !lastCellRect) return null

      // Calculate center points of first and last cells
      const startX = firstCellRect.left + firstCellRect.width / 2 - gridRect.left
      const startY = firstCellRect.top + firstCellRect.height / 2 - gridRect.top
      const endX = lastCellRect.left + lastCellRect.width / 2 - gridRect.left
      const endY = lastCellRect.top + lastCellRect.height / 2 - gridRect.top

      // Calculate the width of the highlight (perpendicular to the word direction)
      const cellWidth = firstCellRect.width
      const highlightWidth = cellWidth * 0.7 // Slightly narrower than the cell

      // Calculate the angle of the word
      const angle = Math.atan2(endY - startY, endX - startX)

      // Calculate the perpendicular angle
      const perpAngle = angle + Math.PI / 2

      // Calculate the four corners of the angled rectangle
      const offsetX = (Math.cos(perpAngle) * highlightWidth) / 2
      const offsetY = (Math.sin(perpAngle) * highlightWidth) / 2

      // Extend the rectangle slightly beyond the first and last cells
      const extensionFactor = 0.3 // How much to extend beyond the cells
      const extendedStartX = startX - Math.cos(angle) * cellWidth * extensionFactor
      const extendedStartY = startY - Math.sin(angle) * cellWidth * extensionFactor
      const extendedEndX = endX + Math.cos(angle) * cellWidth * extensionFactor
      const extendedEndY = endY + Math.sin(angle) * cellWidth * extensionFactor

      // Calculate the four corners
      const corner1X = extendedStartX - offsetX
      const corner1Y = extendedStartY - offsetY
      const corner2X = extendedStartX + offsetX
      const corner2Y = extendedStartY + offsetY
      const corner3X = extendedEndX + offsetX
      const corner3Y = extendedEndY + offsetY
      const corner4X = extendedEndX - offsetX
      const corner4Y = extendedEndY - offsetY

      return {
        type: "polygon",
        points: `${corner1X},${corner1Y} ${corner2X},${corner2Y} ${corner3X},${corner3Y} ${corner4X},${corner4Y}`,
      }
    } else {
      // For horizontal or vertical words, use a regular rectangle with rounded corners
      let minX = Number.POSITIVE_INFINITY,
        minY = Number.POSITIVE_INFINITY,
        maxX = Number.NEGATIVE_INFINITY,
        maxY = Number.NEGATIVE_INFINITY

      for (const [row, col] of cells) {
        const cellRect = cellRefs.current.get(`${row},${col}`)
        if (cellRect) {
          const left = cellRect.left - gridRect.left
          const top = cellRect.top - gridRect.top
          const right = left + cellRect.width
          const bottom = top + cellRect.height

          minX = Math.min(minX, left)
          minY = Math.min(minY, top)
          maxX = Math.max(maxX, right)
          maxY = Math.max(maxY, bottom)
        }
      }

      // Add padding
      const padding = 4
      return {
        type: "rect",
        x: minX - padding,
        y: minY - padding,
        width: maxX - minX + padding * 2,
        height: maxY - minY + padding * 2,
      }
    }
  }

  // Improved touch handling function
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!gridRef.current || !isDragging) return

    // Prevent scrolling while dragging
    e.preventDefault()

    // Get touch position relative to grid
    const touch = e.touches[0]
    const gridRect = gridRef.current.getBoundingClientRect()
    const x = touch.clientX - gridRect.left
    const y = touch.clientY - gridRect.top

    // Calculate which cell the touch is over
    const cellWidth = gridRect.width / GRID_SIZE
    const cellHeight = gridRect.height / GRID_SIZE

    const col = Math.floor(x / cellWidth)
    const row = Math.floor(y / cellHeight)

    // Only process valid cells
    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      handleCellMouseEnter(row, col)
    }
  }

  return (
    <div className="flex flex-col items-center p-4 max-w-md mx-auto">
      <div className="flex justify-center w-full">
        {/* Game grid */}
        <div className="relative">
          <div
            ref={gridRef}
            className="grid grid-cols-10 touch-none border border-slate-600 rounded-md p-2 bg-muted/20"
            onMouseUp={handleSelectionEnd}
            onMouseLeave={handleSelectionEnd}
            onTouchEnd={handleSelectionEnd}
            onTouchCancel={handleSelectionEnd}
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
                    ${isCellSelected(rowIndex, colIndex) ? "bg-slate-600 text-white" : "bg-transparent"}
                    touch-manipulation
                  `}
                  onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                  onTouchStart={(e) => {
                    e.preventDefault() // Prevent double-tap zoom
                    handleCellMouseDown(rowIndex, colIndex)
                  }}
                  onTouchMove={handleTouchMove}
                >
                  {letter}
                </div>
              )),
            )}
          </div>

          {/* SVG overlay for drawing lines and bonus word highlight */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
            {/* Bonus word highlight */}
            {foundWords.some((fw) => fw.isBonus) &&
              getBonusWordHighlightPath() &&
              (getBonusWordHighlightPath()?.type === "rect" ? (
                <rect
                  x={getBonusWordHighlightPath()?.x}
                  y={getBonusWordHighlightPath()?.y}
                  width={getBonusWordHighlightPath()?.width}
                  height={getBonusWordHighlightPath()?.height}
                  rx="8"
                  ry="8"
                  fill="rgba(134, 239, 172, 0.3)"
                  stroke="rgba(22, 163, 74, 0.5)"
                  strokeWidth="2"
                />
              ) : (
                <polygon
                  points={getBonusWordHighlightPath()?.points}
                  fill="rgba(134, 239, 172, 0.3)"
                  stroke="rgba(22, 163, 74, 0.5)"
                  strokeWidth="2"
                />
              ))}

            {/* Lines for found words */}
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
  )
}

