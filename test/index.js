let $p = require("../dist/").default;

function compare(actual, expected) {
  console.log(actual === expected ? 'Test passed.' : `${actual} differed from expected value: ${expected}`);
}

function compareArrays(actual, expected) {
  const sameLength = actual.length == expected.length;
  console.log((sameLength && actual.every((v, i) => v === expected[i])) ? 'Test passed.' : `Array ${actual} differed from expected array ${expected}`);
}

compare(new $p([1, 2, 3, 4]).get("0"), 1);
compare(new $p({
  value: 3
}).get("value"), 3);
compare(
  new $p({
    values: [
      "1",
      "2"
    ]
  }).get("values.0"),
  "1"
);

const obj = {
  a: 2,
  b: 3
};
compare(new $p(obj).get(""), obj);
compare(new $p(obj).get("a.thisdoesnotexist"), undefined);
compare(new $p([
  [
    1, 2, 3
  ],
  [
    4, 5, 6
  ]
]).get("0.0"), 1);

const obj2 = {
  a: {
    c: 2,
    d: 3
  },
  b: {
    e: [
      4, 5, 6, 7
    ]
  }
};

compare(new $p(obj2).get([
  "a", "c"
]), 2);

compare(new $p(obj2).get([
  "b", "e", () => Math.max(0, 1)
]), 5);

compare(new $p(obj2).get([
  "b", "e", "0"
]), 4);

compare(new $p(obj2).get([
  "b", "e", 2
]), 6);

compareArrays(new $p(obj).keys(), ["a", "b"]);
compareArrays(new $p([1, 2, 3, 4, 5]).keys(), ["0", "1", "2", "3", "4"]);
compareArrays(new $p([
  [0, 1], 2, 3, 4, 5
]).keys(), ["0.0", "0.1", "1", "2", "3", "4"]);

compareArrays(new $p({
  a: 0,
  b: 1,
  c: 2
}).keys(), ["a", "b", "c"]);

compareArrays(new $p(obj2).keys(), ["a.c", "a.d", "b.e.0", "b.e.1", "b.e.2", "b.e.3"]);
compareArrays(new $p(obj2).keys().map(k => new $p(obj2).get(k)), [2, 3, 4, 5, 6, 7]);

let obj3 = {
  a: 2
}

compare(new $p(obj3).get("a"), 2);
new $p(obj3).set("a", 3);
compare(new $p(obj3).get("a"), 3);

let obj4 = {
  a: {
    a: 1,
    b: 2
  }
}

compare(new $p(obj4).get("a.a"), 1);
new $p(obj4).set("a.a", 3);
compare(new $p(obj4).get("a.a"), 3);

let obj5 = [1, 2, 3, 4, 5];

compare(new $p(obj5).get("0"), 1);
new $p(obj5).set("0", 10);
compare(new $p(obj5).get("0"), 10);

let obj6 = [{
  name: "Robert",
  age: 30
}];

compare(new $p(obj6).get("0.name"), "Robert");
new $p(obj6).set("0.name", "James");
compare(new $p(obj6).get(["0", "name"]), "James");

new $p(obj6).set("", 23434);
compare(new $p(obj6).get(["0", "name"]), "James");
compare(new $p(obj6).get(["0", "age"]), 30);

let obj7 = {
  a: 1,
  b: 2,
  c: 3,
  d: [4, 5, 6, [7, 8, 9]]
}

compareArrays(new $p(obj7).keys(), ["a", "b", "c", "d.0", "d.1", "d.2", "d.3.0", "d.3.1", "d.3.2"]);
compareArrays(new $p(obj7).values(), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
compareArrays(new $p(obj7).filterKeys(i => i > 5), ["d.2", "d.3.0", "d.3.1", "d.3.2"]);

let objToFlatten = {
  a: 1,
  b: {
    c: 2,
    d: 3
  },
  d: [4, 5, 6, 7]
}

let flatObj = new $p(objToFlatten).flatten();

compare(new $p(flatObj).get("d.3"), 7);

compare(new $p([1, 2, 3, 4]).equal(undefined), false);
compare(new $p([1, 2, 3, 4]).equal("5"), false);
compare(new $p([1, 2, 3, 4]).equal([1, 2, 3, 4]), true);
compare(new $p([1, 2, 3]).equal([1, 2, 3, 4]), false);
compare(new $p([4, 3, 2, 1]).equal([1, 2, 3, 4]), false);
compare(new $p([1, 2, 3, 4]).equal(obj), false);
compare(new $p([1, 2, 3, 4]).equal({}), false);

let obj8 = {
  a: {
    b: 2,
    c: 3
  },
  d: [1, 2, 3, 4]
};

compare(new $p(obj8).equal({}), false);
compare(new $p(obj8).equal([{
  a: {
    b: 2,
    c: 3
  },
  d: [1, 2, 3, 4]
}]), false);

compare(new $p(obj8).equal({
  a: {
    b: 2,
    d: 3
  },
  d: [1, 2, 3, 4]
}), false);

compare(new $p(obj8).equal({
  a: {
    b: 2,
    c: 4
  },
  d: [1, 2, 3, 4]
}), false);

compare(new $p(obj8).equal({
  a: {
    b: 2,
    c: 3
  },
  d: [1, 2, 3, 4]
}), true);

let obj9 = {}

compare(new $p(obj9).get("a"), undefined);
new $p(obj9).set("a", 5);
compare(new $p(obj9).get("a"), 5);

compare(new $p(obj9).get("b.c"), undefined);
new $p(obj9).set("b.c", 5);
compare(new $p(obj9).get("b.c"), 5);

let array = [];
compare(new $p(array).get("1"), undefined);
new $p(array).set("1", 5);
compare(new $p(array).get("1"), 5);

compare(new $p(array).get("0.a"), undefined);
new $p(array).set("0.a", 5);
compare(new $p(array).get("0.a"), 5);

compare(new $p(array).get("5.1"), undefined);
new $p(array).set("5.1", 5);
compare(new $p(array).get("5.1"), 5);

let obj10 = {
  a: 2,
  b: 3,
  c: [0, 10, 0, 0]
}

compare(new $p(obj10).findKey(i => i == 10), "c.1");

let obj11 = {
  a: 2,
  b: "string",
  c: {
    d: [1, 2, 3, 4],
    e: {
      f: 2
    }
  }
}

compare(new $p(obj11).validate([{
  key: "a",
}, {
  key: "b",
}, {
  key: "c"
}]), true);

compare(new $p(obj11).validate([{
  key: "a",
}, {
  key: "b",
}, {
  key: "f.d.e",
  optional: true,
  rules: [
    v => v == 47
  ]
}]), true);

compare(new $p(obj11).validate([{
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
}]), true);

compare(new $p(obj11).validate([{
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
}]), false);

compare(new $p(obj11).validate([{
  key: "a",
  rules: [
    v => v == 2
  ]
}, {
  key: "c.d",
  rules: [
    v => v.length == 4
  ]
}]), true);

compare(new $p(obj11).validate([{
  key: "c.e.f",
  rules: [
    v => v > 10
  ]
}, {
  key: "c.d",
  rules: [
    v => v.length == 4
  ]
}]), false);

let obj12 = {
  a: 2,
  b: 3,
  c: 4,
  d: 5
}

compare(new $p(obj12).validate([{
  key: "*",
  rules: [
    v => v < 10
  ]
}]), true);

compare(new $p(obj12).validate([{
  key: "*",
  rules: [
    v => v > 5
  ]
}]), false);

compare(new $p([]).validate([{
  key: "*",
  optional: true,
  rules: [
    v => v > 5
  ]
}]), true);

compare(new $p([4, 3, 7]).validate([{
  key: "*",
  optional: true,
  rules: [
    v => v > 5
  ]
}]), false);

compare(new $p([7, 8, 9]).validate([{
  key: "*",
  optional: true,
  rules: [
    v => v > 5
  ]
}]), true);

compare(new $p([1, 2, 3, 4]).validate([{
  key: "*",
  rules: [
    v => v < 4
  ]
}]), false);

compare(new $p([1, 2, 3, 4]).get([1]), 2);

compareArrays(new $p([1, 2, 3, 4]).map(i => i * i), [1, 4, 9, 16]);
compare(new $p(new $p({
  a: 2,
  b: {
    c: 3,
    d: 4
  }
}).map(i => i * i)).equal({
  a: 4,
  b: {
    c: 9,
    d: 16
  }
}), true);

compare(new $p(new $p({
  a: 2,
  b: {
    c: 3,
    d: [1, 2, 3]
  }
}).map(i => i * i)).equal({
  a: 4,
  b: {
    c: 9,
    d: [1, 4, 9]
  }
}), true);

let obj13 = {
  a: [1, 2, 3],
  b: 4,
  c: {
    d: {
      e: 5,
      f: 6
    }
  }
}

compare(new $p(obj13).equal(new $p(obj13).copy()), true);

let obj14 = {
  a: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
}

compare(new $p(obj14).validate([{
  key: "a",
  rules: [
    v => Array.isArray(v),
    v => v.length > 5 ? "Array too long!" : true
  ]
}]), "Array too long!");

let obj15 = {
  password: "   secretPassword   "
}

compare(new $p(obj15).validate([{
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
}]), true);

compare(obj15.password, "0petkaoi4tjou4jt4");

let obj16 = {
  a: 5,
  b: 5
}

compare(new $p(obj16).validate([{
  key: "a",
  rules: [
    (v, obj) => v === obj.b
  ]
}]), true);

let obj17 = {
  a: 5,
  b: 6
}

compare(new $p(obj17).validate([{
  key: "a",
  rules: [
    (v, obj) => v === obj.b
  ]
}]), false);

compare(new $p(obj17).validate([{
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
]), false);

compare(new $p(obj17).validate([{
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
]), false);

compare($p.from({
  a: 2
}).get("a"), 2);

const list = [];

$p.from([1, {
  a: 2,
  b: 3
}]).forEach(v => list.push(v));

compareArrays(list, [1, 2, 3]);

compare($p.from({
  a: 2,
  b: 3
}).includes(3), true);

compare($p.from({
  a: 2,
  b: {
    c: [3, 4]
  }
}).includes(3), true);

compare($p.from({
  a: 2,
  b: {
    c: [3, 4]
  }
}).includes(5), false);

compareArrays($p.from({
  a: 2,
  b: {
    c: null
  }
}).keys(), ["a", "b.c"]);