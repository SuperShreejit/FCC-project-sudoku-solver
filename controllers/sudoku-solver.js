const puzzleRegex = /^[\d|\.]{81}$/;
const solvedRegex = /^\d{81}$/;
const INSOLVABLE_ERROR = 'Puzzle cannot be solved';
const COLUMNS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

class SudokuSolver {
	validate(puzzleString) {
		if (puzzleString.length !== 81)
			return {
				valid: false,
				error: 'Expected puzzle to be 81 characters long'
			};
		if (!puzzleRegex.test(puzzleString))
			return { valid: false, error: 'Invalid characters in puzzle' };

		return { valid: true };
	}

	checkRowPlacement(puzzleString, row, column, value) {
		const rowValues = getRow(puzzleString, row);
		return isRowPlacementValid(rowValues, column, value);
	}

	checkColPlacement(puzzleString, row, column, value) {
		const colValues = getColumn(puzzleString, column);
		return isColPlacementValid(colValues, row, value);
	}

	checkRegionPlacement(puzzleString, row, column, value) {
		const [regionString, valuePosition] = getRegion(puzzleString, row, column);
		return isRegPlacementValid(regionString, valuePosition, value)
	}

	solve(puzzleString) {
		const isValidPuzzle = this.validate(puzzleString);
		if (!isValidPuzzle.valid) return isValidPuzzle.error;

		const board = generateBoard(puzzleString);
		const isSolvable = solveSudoku(board);
		if (!isSolvable) return INSOLVABLE_ERROR;
    
		const solvedString = getSolution(board);
		return solvedString;
	}
}

const solveSudoku = board => {
	  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] == '.') {
        for (let k = 1; k <= 9; k++) {
          if (isValid(board, i, j, k)) {
            board[i][j] = `${k}`;
          if (solveSudoku(board)) {
           return true;
          } else {
           board[i][j] = '.';
          }
         }
       }
       return false;
     }
   }
 }
 return true;
};

const isValid = (board, row, col, num) => {
	for (let i = 0; i < 9; i++) {
        const m = 3 * Math.floor(row / 3) + Math.floor(i / 3);
        const n = 3 * Math.floor(col / 3) + i % 3;
        if (board[row][i] == num || board[i][col] == num || board[m][n] == num) {
          return false;
        }
    }
    return true;
};

const generateBoard = puzzleString => {
	let board = [], row = [];
	for (let i = 0; i < puzzleString.length; i++) {
		if(i % 9 === 0 && i > 0){
      board.push(row)
      row = []
    }
		row.push(puzzleString[i]);
	}
  board.push(row)
  return board
};

const getSolution = (board) => {
	let string = '';
	for (let i = 0; i < board.length; i++)
		for (let j = 0; j < board[i].length; j++)
       string += board[i][j];
  
	return string;
};

const getRow = (puzzleString, row) => {
	switch (row.toUpperCase()) {
		case 'A':
			return puzzleString.slice(0, 9);
		case 'B':
			return puzzleString.slice(9, 18);
		case 'C':
			return puzzleString.slice(18, 27);
		case 'D':
			return puzzleString.slice(27, 36);
		case 'E':
			return puzzleString.slice(36, 45);
		case 'F':
			return puzzleString.slice(45, 54);
		case 'G':
			return puzzleString.slice(54, 63);
		case 'H':
			return puzzleString.slice(63, 72);
		case 'I':
			return puzzleString.slice(72, 81);
		default:
			return;
	}
};

const getColumn = (puzzleString, column) => {
	let string = '';
	for (let i = 1; i <= 9; i++) {
		const index = 9 * i - (10 - parseInt(column));
		string += puzzleString[index];
	}
	return string;
};

const getRegion = (puzzleString, row, column) => {
	const region = regions.find(
		reg =>
			reg.rows.includes(row.toUpperCase()) &&
			reg.columns.includes(parseInt(column))
	);
	let regionString = '',
		valuePosition = 0;
	const rowIndex = ROWS.indexOf(row.toUpperCase());
	const columnIndex = parseInt(column) - 1;
	const position = 9 * rowIndex + columnIndex;
	for (let i = 0; i < region.positions.length; i++) {
		const index = region.positions[i];
		regionString += puzzleString[index];
		if (position === index) valuePosition = i;
	}
	return [regionString, valuePosition];
};

const isRowPlacementValid = (rowValues, column, value) => {
	const positionValue = rowValues[parseInt(column) - 1];
  const rowArr = rowValues.split('') 
	if(positionValue === value) return true
  if(rowArr.includes(value)) return false
  if(positionValue !== '.' && positionValue !== value) return false
  return true
};

const isColPlacementValid = (colValues, row, value) => {
	const index = ROWS.indexOf(row.toUpperCase());
	const positionValue = colValues[index];
  const colArr = colValues.split('')
	if(positionValue === value) return true
  if(colArr.includes(value)) return false
  if(positionValue !== '.' && positionValue !== value) return false
  return true
};

const isRegPlacementValid = (regionString, valuePosition, value) => {
  const positionValue = regionString[valuePosition];
  const regArr = regionString.split('')
  if(positionValue === value) return true
  if(positionValue === '.' && regArr.includes(value)) return false
  if(positionValue !== '.' && positionValue !== value) return false
  return true
}

const regions = [
	{
		rows: ['A', 'B', 'C'],
		columns: [1, 2, 3],
		positions: [0, 1, 2, 9, 10, 11, 18, 19, 20]
	},
	{
		rows: ['A', 'B', 'C'],
		columns: [4, 5, 6],
		positions: [3, 4, 5, 12, 13, 14, 21, 22, 23]
	},
	{
		rows: ['A', 'B', 'C'],
		columns: [7, 8, 9],
		positions: [6, 7, 8, 15, 16, 17, 24, 25, 26]
	},
	{
		rows: ['D', 'E', 'F'],
		columns: [1, 2, 3],
		positions: [27, 28, 29, 36, 37, 38, 45, 46, 47]
	},
	{
		rows: ['D', 'E', 'F'],
		columns: [4, 5, 6],
		positions: [30, 31, 32, 39, 40, 41, 48, 49, 50]
	},
	{
		rows: ['D', 'E', 'F'],
		columns: [7, 8, 9],
		positions: [33, 34, 35, 42, 43, 44, 51, 52, 53]
	},
	{
		rows: ['G', 'H', 'I'],
		columns: [1, 2, 3],
		positions: [54, 55, 56, 63, 64, 65, 72, 73, 74]
	},
	{
		rows: ['G', 'H', 'I'],
		columns: [4, 5, 6],
		positions: [57, 58, 59, 66, 67, 68, 75, 76, 77]
	},
	{
		rows: ['G', 'H', 'I'],
		columns: [7, 8, 9],
		positions: [60, 61, 62, 69, 70, 71, 78, 79, 80]
	}
];

module.exports = SudokuSolver;
