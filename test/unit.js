var assert = require('assert');
var expect = require('chai').expect;
var should = require('chai').should();
var ptree = require("../dist/").default;

describe('Validate', () => {
  it('should return true', () => {
    let obj = {
      a: 2,
      b: "string",
      c: {
        d: [1, 2, 3, 4],
        e: {
          f: 2
        }
      }
    }
    const result = new ptree(obj).validate([{
      key: "a",
    }, {
      key: "b",
    }, {
      key: "f.d.e",
      optional: true,
      rules: [
        v => v == 47
      ]
    }]);
    expect(result).to.be.true;
  })
})