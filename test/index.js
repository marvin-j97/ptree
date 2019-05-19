let $p = require("../src/index");

function compare(actual, expected) {
  console.log(actual === expected ? 'Test passed.' : `${actual} differed from expected value: ${expected}`);
}

function compareArrays(actual, expected) {
  const sameLength = actual.length == expected.length;
  console.log((sameLength && actual.every((v, i) => v === expected[i])) ? 'Test passed.' : `Array ${actual} differed from expected array ${expected}`);
}

compare($p.get([1, 2, 3, 4], "0"), 1);

compare($p.get({
  value: 3
}, "value"), 3);

compare(
  $p.get({
    values: [
      "1",
      "2"
    ]
  }, "values.0"),
  "1"
);

const obj = {
  a: 2,
  b: 3
};
compare($p.get(obj, ""), obj);
compare($p.get(5, ""), 5);
compare($p.get(obj, "a.thisdoesnotexist"), undefined);
compare($p.get([
  [
    1, 2, 3
  ],
  [
    4, 5, 6
  ]
], "0.0"), 1);

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

compare($p.get(obj2, [
  "a", "c"
]), 2);

compare($p.get(obj2, [
  "b", "e", () => Math.max(0, 1)
]), 5);

compare($p.get(obj2, [
  "b", "e", "0"
]), 4);

compare($p.get(obj2, [
  "b", "e", 2
]), 6);

compareArrays($p.keys([1, 2, 3, 4, 5]), ["0", "1", "2", "3", "4"]);
compareArrays($p.keys([
  [0, 1], 2, 3, 4, 5
]), ["0.0", "0.1", "1", "2", "3", "4"]);

compareArrays($p.keys({
  a: 0,
  b: 1,
  c: 2
}), ["a", "b", "c"]);

compareArrays($p.keys(obj2), ["a.c", "a.d", "b.e.0", "b.e.1", "b.e.2", "b.e.3"]);

compareArrays($p.keys(obj2).map(k => $p.get(obj2, k)), [2, 3, 4, 5, 6, 7]);

let obj3 = {
  a: 2
}

compare($p.get(obj3, "a"), 2);
$p.set(obj3, "a", 3);
compare($p.get(obj3, "a"), 3);

let obj4 = {
  a: {
    a: 1,
    b: 2
  }
}

compare($p.get(obj4, "a.a"), 1);
$p.set(obj4, "a.a", 3);
compare($p.get(obj4, "a.a"), 3);

let obj5 = [1, 2, 3, 4, 5];

compare($p.get(obj5, "0"), 1);
$p.set(obj5, "0", 10);
compare($p.get(obj5, "0"), 10);

let obj6 = [{
  name: "Robert",
  age: 30
}];

compare($p.get(obj6, "0.name"), "Robert");
$p.set(obj6, "0.name", "James");
compare($p.get(obj6, ["0", "name"]), "James");

$p.set(obj6, "", 23434);
compare($p.get(obj6, ["0", "name"]), "James");
compare($p.get(obj6, ["0", "age"]), 30);

let obj7 = {
  a: 1,
  b: 2,
  c: 3,
  d: [4, 5, 6, [7, 8, 9]]
}

compareArrays($p.keys(obj7), ["a", "b", "c", "d.0", "d.1", "d.2", "d.3.0", "d.3.1", "d.3.2"]);
compareArrays($p.values(obj7), [1, 2, 3, 4, 5, 6, 7, 8, 9]);

compareArrays($p.filterKeys(obj7, i => i > 5), ["d.2", "d.3.0", "d.3.1", "d.3.2"]);

compareArrays($p.filter(obj7, i => i > 5), [6, 7, 8, 9]);
compareArrays($p.map(obj7, i => i * 2), [2, 4, 6, 8, 10, 12, 14, 16, 18]);

compare($p.reduce(obj7, (acc, i) => acc + i, 0), 45);

compareArrays($p.filter([1, 2, 3, 4, 5], i => i < 3), [1, 2]);

let objToFlatten = {
  a: 1,
  b: {
    c: 2,
    d: 3
  },
  d: [4, 5, 6, 7]
}

let flatObj = $p.flatten(objToFlatten);

compare($p.get(flatObj, "d.3"), 7);