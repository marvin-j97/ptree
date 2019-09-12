var assert = require('assert');
var expect = require('chai').expect;
var should = require('chai').should();
var ptree = require("../dist/").default;

describe('Validate', () => {
  const obj1 = {
    a: 2,
    b: "string",
    c: {
      d: [1, 2, 3, 4],
      e: {
        f: 2
      }
    }
  }


  it('should pass checking if the keys a, b and c exist', () => {
    const result = new ptree(obj1).validate([{
      key: "a",
    }, {
      key: "b",
    }, {
      key: "c"
    }]);
    expect(result).to.be.true;
  });

  it('should pass checking if the key a and b exist and f.d.e to be optional', () => {
    const result = new ptree(obj1).validate([{
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
  });

  it('should pass checking if a equals 2 and b is a string with a length greater than 0', () => {
    const result = new ptree(obj1).validate([{
      key: "a",
      rules: [
        v => v == 2
      ]
    }, {
      key: "b",
      rules: [
        v => typeof v === "string",
        v => v.length > 0
      ]
    }]);
    expect(result).to.be.true;
  });

  it('should fail checking if a equals 2 and b is a string with a length greater than 10', () => {
    const result = new ptree(obj1).validate([{
      key: "a",
      rules: [
        v => v == 2
      ]
    }, {
      key: "b",
      rules: [
        v => typeof v === "string",
        v => v.length > 10
      ]
    }]);
    expect(result).to.be.false;
  });

  it('should pass checking if a equals 2 and c.d has a length of 4', () => {
    const result = new ptree(obj1).validate([{
      key: "a",
      rules: [
        v => v == 2
      ]
    }, {
      key: "c.d",
      rules: [
        v => v.length == 4
      ]
    }]);
    expect(result).to.be.true;
  });

  it('should fail checking that c.e.f is greater than 10 and c.d has a length of 4', () => {
    const result = new ptree(obj1).validate([{
      key: "c.e.f",
      rules: [
        v => v > 10
      ]
    }, {
      key: "c.d",
      rules: [
        v => v.length == 4
      ]
    }]);
    expect(result).to.be.false;
  });

});