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


  it('should pass if the keys a, b and c exist', () => {
    const result = new ptree(obj1).validate([{
      key: "a",
    }, {
      key: "b",
    }, {
      key: "c"
    }]);
    expect(result).to.be.true;
  });

  it('should pass if the key a and b exist and f.d.e to be optional', () => {
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

  it('should pass if a equals 2 and b is a string with a length greater than 0', () => {
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

  it('should fail if a equals 2 and b is a string with a length greater than 10', () => {
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

  it('should pass if a equals 2 and c.d has a length of 4', () => {
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

  it('should fail if c.e.f is greater than 10 and c.d has a length of 4', () => {
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

  const obj2 = {
    a: 2,
    b: 3,
    c: 4,
    d: 5
  }

  it('should pass if all values are less than 10', () => {
    const result = new ptree(obj2).validate([{
      key: "*",
      rules: [
        v => v < 10
      ]
    }]);
    expect(result).to.be.true;
  });

  it('should fail if all values are greater than 5', () => {
    const result = new ptree(obj2).validate([{
      key: "*",
      rules: [
        v => v > 5
      ]
    }]);
    expect(result).to.be.false;
  });

  it('should pass if a rule on an empty array and the key is optional', () => {
    const result = new ptree([]).validate([{
      key: "*",
      optional: true,
      rules: [
        v => v > 5
      ]
    }]);
    expect(result).to.be.true;
  });

  it('should fail if not every value in an array is greater than 5 using the * wildcard key-selector', () => {
    const result = new ptree([4, 3, 7]).validate([{
      key: "*",
      rules: [
        v => v > 5
      ]
    }]);
    expect(result).to.be.false;
  });

  it('should pass if every value in an array is greater than 5 using the * wildcard key-selector', () => {
    const result = new ptree([7, 8, 9]).validate([{
      key: "*",
      rules: [
        v => v > 5
      ]
    }]);
    expect(result).to.be.true;
  });

  it('should fail if not every value in an array is less than 4 using the * wildcard key-selector', () => {
    const result = new ptree([1, 2, 3, 4]).validate([{
      key: "*",
      rules: [
        v => v < 4
      ]
    }]);
    expect(result).to.be.false;
  });

  it('should return the string "Array too long!" if the length is greater than 5', () => {
    let obj = {
      a: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    }
    const result = new ptree(obj).validate([{
      key: "a",
      rules: [
        v => Array.isArray(v),
        v => v.length > 5 ? "Array too long!" : true
      ]
    }]);
    expect(result).to.equal('Array too long!');
  });

  it('should pass if the password got trimmed', () => {
    let obj = {
      password: "   secretPassword   "
    }
    const result = new ptree(obj).validate([{
      key: "password",
      preTransform: [
        v => v.trim()
      ],
      rules: [
        v => v === "secretPassword"
      ],
      postTransform: [
        v => "0petkaoi4tjou4jt4"
      ]
    }]);
    expect(result).to.be.true;
  });

  it('should pass if the object gets passed into the rules function and the key a equals obj.b', () => {
    let obj = {
      a: 5,
      b: 5
    }
    const result = new ptree(obj).validate([{
      key: "a",
      rules: [
        (v, obj) => v === obj.b
      ]
    }]);
    expect(result).to.be.true;
  });

  let obj3 = {
    a: 5,
    b: 6
  }

  it('should fail if the object gets passed into the function and the key a does not equal obj.b', () => {
    const result = new ptree(obj3).validate([{
      key: "a",
      rules: [
        (v, obj) => v === obj.b
      ]
    }]);
    expect(result).to.be.false;
  });

  it('should fail if c is optional and b is supposed to be a string', () => {
    const result = new ptree(obj3).validate([{
      key: "c",
      optional: true,
      rules: [
        v => v > 0
      ]
    },
    {
      key: "b",
      rules: [
        v => typeof b == "string"
      ]
    }
    ]);
    expect(result).to.be.false;
  });

  it('should fail if b is supposed to be a string and c is optional ', () => {
    const result = new ptree(obj3).validate([{
      key: "b",
      rules: [
        v => typeof b == "string"
      ]
    },
    {
      key: "c",
      optional: true,
      rules: [
        v => v > 0
      ]
    }
    ]);
    expect(result).to.be.false;
  });


});