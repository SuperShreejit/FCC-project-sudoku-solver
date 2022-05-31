const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const ERROR = {
	NO_PUZZLE: 'Required field missing',
	INVALID_CHARS: 'Invalid characters in puzzle',
	INVALID_LEN: 'Expected puzzle to be 81 characters long',
	INSOLVABLE: 'Puzzle cannot be solved',
	MISSING_VALS: 'Required field(s) missing',
	INVALID_COORD: 'Invalid coordinate',
	INVALID_VAL: 'Invalid value'
};
const solveRoute = '/api/solve';
const checkRoute = '/api/check';
const PUZZLE = {
  VALID: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
  LOW_LENGTH:'1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.3',
  OVER_LENGTH: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37...',
  INVALID_CHARS: '1.5..2.84..63.12.7.2..5.....9..1....8.2.abc4.3.7.2..9.47...8..1..16....926914.37.',
  INSOLVABLE: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.6.2..9.47...8..1..16....926914.37.'
}
const solution = '135762984946381257728459613694517832812936745357824196473298561581673429269145378'

suite('Functional Tests', () => {
	suite(`Tests for ${solveRoute}`, () => {
		test('Solve a puzzle with valid puzzle string: POST request to /api/solve', (done) => {
      const request = { puzzle: PUZZLE.VALID }
      chai.request(server)
        .post(solveRoute)
        .send(request)
        .end((err,res) => {
          assert.isNull(err)
          assert.equal(res.status, 200, 'status must be 200')
          assert.equal(res.type, 'application/json', 'response type must be json')
          assert.isObject(res.body, 'response must be an object')
          assert.property(res.body, 'solution', 'response object must have a solution property')
          assert.isString(res.body.solution, 'solution must be a string')
          assert.equal(res.body.solution, solution, `solution recived must be ${solution}`)
          done()
        })
    });

		test('Solve a puzzle with missing puzzle string: POST request to /api/solve', (done) => {
      const request = {}
      chai.request(server)
        .post(solveRoute)
        .send(request)
        .end((err,res) => {
          assert.isNull(err)
          assert.equal(res.status, 200, 'status must be 200')
          assert.equal(res.type, 'application/json', 'response type must be json')
          assert.isObject(res.body, 'response must be an object')
          assert.property(res.body, 'error', 'response object must have an error property')
          assert.isString(res.body.error, 'error must be a string')
          assert.equal(res.body.error, ERROR.NO_PUZZLE, `error must be ${ERROR.NO_PUZZLE}`)
          done()
        })
    });

		test('Solve a puzzle with invalid characters: POST request to /api/solve', (done) => {
      const request = { puzzle: PUZZLE.INVALID_CHARS }
      chai.request(server)
        .post(solveRoute)
        .send(request)
        .end((err,res) => {
          assert.isNull(err)
          assert.equal(res.status, 200, 'status must be 200')
          assert.equal(res.type, 'application/json', 'response type must be json')
          assert.isObject(res.body, 'response must be an object')
          assert.property(res.body, 'error', 'response object must have an error property')
          assert.isString(res.body.error, 'error must be a string')
          assert.equal(res.body.error, ERROR.INVALID_CHARS, `error must be ${ERROR.INVALID_CHARS}`)
          done()
        })
    });

		test('Solve a puzzle with incorrect length: POST request to /api/solve', (done) => {
      const requests = [{ puzzle: PUZZLE.LOW_LENGTH }, { puzzle: PUZZLE.OVER_LENGTH }]
      requests.forEach(request => {        
        chai.request(server)
          .post(solveRoute)
          .send(request)
          .end((err,res) => {
            assert.isNull(err)
            assert.equal(res.status, 200, 'status must be 200')
            assert.equal(res.type, 'application/json', 'response type must be json')
            assert.isObject(res.body, 'response must be an object')
            assert.property(res.body, 'error', 'response object must have an error property')
            assert.isString(res.body.error, 'error must be a string')
            assert.equal(res.body.error, ERROR.INVALID_LEN, `error must be ${ERROR.INVALID_LEN}`)
          })
      })
      done()
    });

		test('Solve a puzzle that cannot be solved: POST request to /api/solve', (done) => {
      const request = { puzzle: PUZZLE.INSOLVABLE }
      chai.request(server)
        .post(solveRoute)
        .send(request)
        .end((err,res) => {
          assert.isNull(err)
          assert.equal(res.status, 200, 'status must be 200')
          assert.equal(res.type, 'application/json', 'response type must be json')
          assert.isObject(res.body, 'response must be an object')
          assert.property(res.body, 'error', 'response object must have an error property')
          assert.isString(res.body.error, 'error must be a string')
          assert.equal(res.body.error, ERROR.INSOLVABLE, `error must be ${ERROR.INSOLVABLE}`)
          done()
        })
    });
	});

	suite(`Tests for ${checkRoute}`, () => {
		test('Check a puzzle placement with all fields: POST request to /api/check', (done) => {
      const request = { puzzle: PUZZLE.VALID, coordinate: 'A1' , value: '1' }
      chai.request(server)
        .post(checkRoute)
        .send(request)
        .end((err,res) => {
          assert.isNull(err)
          assert.equal(res.status, 200, 'status must be 200')
          assert.equal(res.type, 'application/json', 'response type must be json')
          assert.isObject(res.body, 'response must be an object')
          assert.property(res.body, 'valid', 'response object must have a valid property')
          assert.isBoolean(res.body.valid, 'solution must be a string')
          assert.isTrue(res.body.valid, 'valid must be true')
          done()
        })
    });

		test('Check a puzzle placement with single placement conflict: POST request to /api/check', (done) => {
      const request = { puzzle: PUZZLE.VALID, coordinate: 'A2' , value: '9' }
      chai.request(server)
        .post(checkRoute)
        .send(request)
        .end((err,res) => {
          assert.isNull(err)
          assert.equal(res.status, 200, 'status must be 200')
          assert.equal(res.type, 'application/json', 'response type must be json')
          assert.isObject(res.body, 'response must be an object')
          assert.property(res.body, 'valid', 'response object must have a valid property')
          assert.property(res.body, 'conflict', 'response object must have a conflict property')
          assert.isBoolean(res.body.valid, 'valid must be a boolean')
          assert.isFalse(res.body.valid, 'valid must be false')
          assert.isArray(res.body.conflict, 'conflict must be an array')
          assert.equal(res.body.conflict.length, 1, 'must be only one conflict')
          res.body.conflict.forEach(con => {
            assert.isString(con, 'each conflict must be a string')
          })
          done()
        })
    });

		test('Check a puzzle placement with multiple placement conflicts: POST request to /api/check', (done) => {
      const request = { puzzle: PUZZLE.VALID, coordinate: 'A2' , value: '6' }
      chai.request(server)
        .post(checkRoute)
        .send(request)
        .end((err,res) => {
          assert.isNull(err)
          assert.equal(res.status, 200, 'status must be 200')
          assert.equal(res.type, 'application/json', 'response type must be json')
          assert.isObject(res.body, 'response must be an object')
          assert.property(res.body, 'valid', 'response object must have a valid property')
          assert.property(res.body, 'conflict', 'response object must have a conflict property')
          assert.isBoolean(res.body.valid, 'valid must be a boolean')
          assert.isFalse(res.body.valid, 'valid must be false')
          assert.isArray(res.body.conflict, 'conflict must be an array')
          assert.equal(res.body.conflict.length, 2, 'must be only two conflicts')
          res.body.conflict.forEach(con => {
            assert.isString(con, 'each conflict must be a string')
          })
          done()
        })
    });

		test('Check a puzzle placement with all placement conflicts: POST request to /api/check', (done) => {
      const request = { puzzle: PUZZLE.VALID, coordinate: 'A1' , value: '2' }
      chai.request(server)
        .post(checkRoute)
        .send(request)
        .end((err,res) => {
          assert.isNull(err)
          assert.equal(res.status, 200, 'status must be 200')
          assert.equal(res.type, 'application/json', 'response type must be json')
          assert.isObject(res.body, 'response must be an object')
          assert.property(res.body, 'valid', 'response object must have a valid property')
          assert.property(res.body, 'conflict', 'response object must have a conflict property')
          assert.isBoolean(res.body.valid, 'valid must be a boolean')
          assert.isFalse(res.body.valid, 'valid must be false')
          assert.isArray(res.body.conflict, 'conflict must be an array')
          assert.equal(res.body.conflict.length, 3, 'must be all three conflicts')
          res.body.conflict.forEach(con => {
            assert.isString(con, 'each conflict must be a string')
          })
          done()
        })
    });

		test('Check a puzzle placement with missing required fields: POST request to /api/check', (done) => {
      const request = { }
      chai.request(server)
        .post(checkRoute)
        .send(request)
        .end((err,res) => {
          assert.isNull(err)
          assert.equal(res.status, 200, 'status must be 200')
          assert.equal(res.type, 'application/json', 'response type must be json')
          assert.isObject(res.body, 'response must be an object')
          assert.property(res.body, 'error', 'response object must have an error property')
          assert.isString(res.body.error, 'error must be a string')
          assert.equal(res.body.error, ERROR.MISSING_VALS, `error must be ${ERROR.MISSING_VALS}`)
          done()
        })
    });

		test('Check a puzzle placement with invalid characters: POST request to /api/check', (done) => {
      const request = { puzzle: PUZZLE.INVALID_CHARS, coordinate: 'A1', value: '1' }
      chai.request(server)
        .post(checkRoute)
        .send(request)
        .end((err,res) => {
          assert.isNull(err)
          assert.equal(res.status, 200, 'status must be 200')
          assert.equal(res.type, 'application/json', 'response type must be json')
          assert.isObject(res.body, 'response must be an object')
          assert.property(res.body, 'error', 'response object must have an error property')
          assert.isString(res.body.error, 'error must be a string')
          assert.equal(res.body.error, ERROR.INVALID_CHARS, `error must be ${ERROR.INVALID_CHARS}`)
          done()
        })
    });

		test('Check a puzzle placement with incorrect length: POST request to /api/check', (done) => {
      const request = { puzzle: PUZZLE.OVER_LENGTH, coordinate: 'A1', value: '1' }
      chai.request(server)
        .post(checkRoute)
        .send(request)
        .end((err,res) => {
          assert.isNull(err)
          assert.equal(res.status, 200, 'status must be 200')
          assert.equal(res.type, 'application/json', 'response type must be json')
          assert.isObject(res.body, 'response must be an object')
          assert.property(res.body, 'error', 'response object must have an error property')
          assert.isString(res.body.error, 'error must be a string')
          assert.equal(res.body.error, ERROR.INVALID_LEN, `error must be ${ERROR.INVALID_LEN}`)
          done()
        })
    });

		test('Check a puzzle placement with invalid placement coordinate: POST request to /api/check', (done) => {
      const request = { puzzle: PUZZLE.VALID, coordinate: 'A12', value: '1' }
      chai.request(server)
        .post(checkRoute)
        .send(request)
        .end((err,res) => {
          assert.isNull(err)
          assert.equal(res.status, 200, 'status must be 200')
          assert.equal(res.type, 'application/json', 'response type must be json')
          assert.isObject(res.body, 'response must be an object')
          assert.property(res.body, 'error', 'response object must have an error property')
          assert.isString(res.body.error, 'error must be a string')
          assert.equal(res.body.error, ERROR.INVALID_COORD, `error must be ${ERROR.INVALID_COORD}`)
          done()
        })
    });

		test('Check a puzzle placement with invalid placement value: POST request to /api/check', (done) => {
      const request = { puzzle: PUZZLE.VALID, coordinate: 'A1', value: '12' }
      chai.request(server)
        .post(checkRoute)
        .send(request)
        .end((err,res) => {
          assert.isNull(err)
          assert.equal(res.status, 200, 'status must be 200')
          assert.equal(res.type, 'application/json', 'response type must be json')
          assert.isObject(res.body, 'response must be an object')
          assert.property(res.body, 'error', 'response object must have an error property')
          assert.isString(res.body.error, 'error must be a string')
          assert.equal(res.body.error, ERROR.INVALID_VAL, `error must be ${ERROR.INVALID_VAL}`)
          done()
        })
    });
	});
});
