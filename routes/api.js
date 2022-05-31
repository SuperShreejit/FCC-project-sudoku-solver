'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  const solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      const { puzzle, coordinate, value } = req.body
      try {
        if(!puzzle || !coordinate || !value)
          throw new Error(ERROR.MISSING_VALS)

        if(!isValidValue(value)) 
          throw new Error(ERROR.INVALID_VAL)

        if(!isValidCoord(coordinate))
          throw new Error(ERROR.INVALID_COORD)
          
        const isValidPuzzle = solver.validate(puzzle)
        if(!isValidPuzzle.valid)
          throw new Error(isValidPuzzle.error)
        
        const [row, column] = getRowCol(coordinate)
        const result = validateCoordValue(puzzle, row, column, value)
        res.json(result) 
        
      } catch (error) {
        res.json({ error: error.message })
      }
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      const puzzle = req.body.puzzle
      try {
        if(!puzzle) throw new Error(ERROR.NO_PUZZLE)

        const solution = solver.solve(puzzle)
        if(solution === ERROR.INVALID_CHARS || solution === ERROR.INVALID_LEN || solution === ERROR.INSOLVABLE)
          throw new Error(solution)

        res.json({ solution })  
      } catch (error) {
        res.json({ error: error.message })
      }
    });
};

const validateCoordValue = (solution, row, column, value) => {
  const solver = new SudokuSolver()

  const isRowValid = solver.checkRowPlacement(solution, row, column, value)  
  const isColValid = solver.checkColPlacement(solution, row, column, value)
  const isRegValid = solver.checkRegionPlacement(solution, row, column, value)

  let conflict = []
  if(!isRowValid) conflict.push('row')
  if(!isColValid) conflict.push('column')
  if(!isRegValid) conflict.push('region')
  
  if(isRowValid && isColValid && isRegValid) return { valid: true }

  return { valid: false, conflict }
}

const getRowCol = (coordinate) => {
  const values = coordinate.split('')
  const row = values[0]
  const column = values[1]
  return [row, column]
}

const isValidValue = (value) => (parseInt(value) >= 1 && parseInt(value) <= 9)
const isValidCoord = (coord) => ((coordRegex.test(coord) && coord.length === 2) ? true : false)

const coordRegex = /^[a-i][1-9]$/i
const ERROR = {
  NO_PUZZLE: 'Required field missing',
  INVALID_CHARS: 'Invalid characters in puzzle',
  INVALID_LEN: 'Expected puzzle to be 81 characters long',
  INSOLVABLE: 'Puzzle cannot be solved',
  MISSING_VALS: 'Required field(s) missing',
  INVALID_COORD: 'Invalid coordinate',
  INVALID_VAL: 'Invalid value'
}