const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
const solver = new Solver();

const solvedRegex = /^\d{81}$/;
const ERROR = {
	INVALID_CHARS: 'Invalid characters in puzzle',
	INVALID_LENGTH: 'Expected puzzle to be 81 characters long',
	INSOLVABLE: 'Puzzle cannot be solved'
};

suite('UnitTests', () => {
	suite('Solver Validation tests', () => {
		test('Logic handles a valid puzzle string of 81 characters', () => {
			const puzzle =
				'1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
			const isValid = solver.validate(puzzle);
			assert.isObject(isValid, 'must return an Object');
			assert.property(
				isValid,
				'valid',
				'there must be a valid property in the returned Object'
			);
			assert.isBoolean(isValid.valid, 'valid property must be a boolean');
			assert.isTrue(isValid.valid, 'returned valid must be true');
		});

		test('Logic handles a puzzle string with invalid characters (not 1-9 or .)', () => {
			const puzzle =
				'1.5..xyz4..63.12.7.2..5.....9..1....8.2.!@#$.3.7.2..9.47...8..1..16....926914.abc';
			const isValid = solver.validate(puzzle);
			assert.isObject(isValid, 'must return an Object');
			assert.property(
				isValid,
				'valid',
				'there must be a valid property in the returned Object'
			);
			assert.property(isValid, 'error', 'must have an error property');
			assert.isBoolean(isValid.valid, 'valid property must be a boolean');
			assert.isFalse(isValid.valid, 'invalid cases must be false');
			assert.isString(isValid.error, 'error must be a string');
			assert.equal(
				isValid.error,
				ERROR.INVALID_CHARS,
				`error must be ${ERROR.INVALID_CHARS}`
			);
		});

		test('Logic handles a puzzle string that is not 81 characters in length', () => {
			const testPuzzles = [
				'1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.5..',
				'1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.'
			];
			testPuzzles.forEach(puzzle => {
				const isValid = solver.validate(puzzle);
				assert.isObject(isValid, 'must return an Object');
				assert.property(
					isValid,
					'valid',
					'there must be a valid property in the returned Object'
				);
				assert.property(isValid, 'error', 'must have an error property');
				assert.isBoolean(isValid.valid, 'valid property must be a boolean');
				assert.isFalse(isValid.valid, 'invalid cases must be false');
				assert.isString(isValid.error, 'error must be a string');
				assert.equal(
					isValid.error,
					ERROR.INVALID_LENGTH,
					`error must be ${ERROR.INVALID_LENGTH}`
				);
			});
		});
	});

	suite('Solver Placement tests', () => {
		const testPuzzle =
			'1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1...16....926914.37.';

		const trueRequests = [
			{ row: 'a', column: '1', value: '1' }, // 1pos
			{ row: 'B', column: '3', value: '6' }, // 12pos
			{ row: 'A', column: '6', value: '2' } // 6pos
		];
		const falseRequests = [
			{ row: 'a', column: '1', value: '2' }, //1    :1pos
			{ row: 'B', column: '3', value: '5' }, //6   :12pos
			{ row: 'i', column: '8', value: '8' } //7  :80pos
		];

		suite('row placement tests', () => {
			test('Logic handles a valid row placement', () => {
				trueRequests.forEach(({ row, column, value }) => {
					const isValid = solver.checkRowPlacement(
						testPuzzle,
						row,
						column,
						value
					);
					assert.isBoolean(isValid, 'must return a boolean');
					assert.isTrue(isValid, 'must be true as per answer');
				});
			});

			test('Logic handles a invalid row placement', () => {
				falseRequests.forEach(({ row, column, value }) => {
					const isValid = solver.checkRowPlacement(
						testPuzzle,
						row,
						column,
						value
					);
					assert.isBoolean(isValid, 'must return a boolean');
					assert.isFalse(isValid, 'must be false as per answer');
				});
			});
		});

		suite('column placement tests', () => {
			test('Logic handles a valid column placement', () => {
				trueRequests.forEach(({ row, column, value }) => {
					const isValid = solver.checkColPlacement(
						testPuzzle,
						row,
						column,
						value
					);
					assert.isBoolean(isValid, 'must return a boolean');
					assert.isTrue(isValid, 'must be true as per answer');
				});
			});

			test('Logic handles an invalid column placement', () => {
				falseRequests.forEach(({ row, column, value }) => {
					const isValid = solver.checkColPlacement(
						testPuzzle,
						row,
						column,
						value
					);
					assert.isBoolean(isValid, 'must return a boolean');
					assert.isFalse(isValid, 'must be false as per answer');
				});
			});
		});

		suite('region placement tests', () => {
			test('Logic handles a valid region (3x3 grid) placement', () => {
				trueRequests.forEach(({ row, column, value }) => {
					const isValid = solver.checkRegionPlacement(
						testPuzzle,
						row,
						column,
						value
					);
					assert.isBoolean(isValid, 'must return a boolean');
					assert.isTrue(isValid, 'must be true as per answer');
				});
			});

			test('Logic handles an invalid region (3x3 grid) placement', () => {
				falseRequests.forEach(({ row, column, value }) => {
					const isValid = solver.checkRegionPlacement(
						testPuzzle,
						row,
						column,
						value
					);
					assert.isBoolean(isValid, 'must return a boolean');
					assert.isFalse(isValid, 'must be false as per answer');
				});
			});
		});
	});

	suite('Solver Solve Puzzle tests', () => {
		test('Valid puzzle strings pass the solver', () => {
			const puzzles = [
				'1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
				'5..91372.3...8.5.9.9.25..8.68.47.23...95..46.7.4.....5.2.......4..8916..85.72...3'
			];
			puzzles.forEach(puzzle => {
				const solvedString = solver.solve(puzzle);
				assert.isString(solvedString, 'must return a String');
				assert.match(
					solvedString,
					solvedRegex,
					'must match the solved pattern'
				);
			});
		});

		test('Invalid puzzle strings fail the solver', () => {
      const puzzles = [
        {
          puzzleString: '1.5..xyz4..63.12.7.2..5.....9..1....8.2.!@#$.3.7.2..9.47...8..1..16....926914.abc',
          error: ERROR.INVALID_CHARS
        },
        {
          puzzleString: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.5..',
          error: ERROR.INVALID_LENGTH
        },
        {
          puzzleString: '1.5..2.84..63.12.7.2..5.....8..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
          error: ERROR.INSOLVABLE
        },
      ]
      puzzles.forEach(puzzle => {
        const solvedString = solver.solve(puzzle.puzzleString)
        assert.isString(solvedString, ' must return a string')
        assert.equal(solvedString, puzzle.error, `error must be ${puzzle.error}`)        
      })
    });

		test('Solver returns the expected solution for an incomplete puzzle', () => {
			const puzzles = [
				{
					test:
						'1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
					solution:
						'135762984946381257728459613694517832812936745357824196473298561581673429269145378'
				},
				{
					test:
						'5..91372.3...8.5.9.9.25..8.68.47.23...95..46.7.4.....5.2.......4..8916..85.72...3',
					solution:
						'568913724342687519197254386685479231219538467734162895926345178473891652851726943'
				}
			];
			puzzles.forEach(puzzle => {
				const solvedString = solver.solve(puzzle.test);
				assert.isString(solvedString, 'must return a String');
				assert.equal(solvedString, puzzle.solution, 'solutions must match');
			});
		});
	});
});