let $p = require("../dist/").default;

function compare(actual, expected) {
  console.log(
    actual === expected
      ? "Test passed."
      : `${actual} differed from expected value: ${expected}`
  );
}

function compareArrays(actual, expected) {
  const sameLength = actual.length == expected.length;
  console.log(
    sameLength && actual.every((v, i) => v === expected[i])
      ? "Test passed."
      : `Array ${actual} differed from expected array ${expected}`
  );
}

compare(new $p([1, 2, 3, 4]).get("0"), 1);
compare(
  new $p({
    value: 3
  }).get("value"),
  3
);
compare(
  new $p({
    values: ["1", "2"]
  }).get("values.0"),
  "1"
);

const obj = {
  a: 2,
  b: 3
};
compare(new $p(obj).get(""), obj);
compare(new $p(obj).get("a.thisdoesnotexist"), undefined);
compare(
  new $p([
    [1, 2, 3],
    [4, 5, 6]
  ]).get("0.0"),
  1
);

const obj2 = {
  a: {
    c: 2,
    d: 3
  },
  b: {
    e: [4, 5, 6, 7]
  }
};

compare(new $p(obj2).get(["a", "c"]), 2);

compare(new $p(obj2).get(["b", "e", () => Math.max(0, 1)]), 5);

compare(new $p(obj2).get(["b", "e", "0"]), 4);

compare(new $p(obj2).get(["b", "e", 2]), 6);

compareArrays(new $p(obj).keys(), ["a", "b"]);
compareArrays(new $p([1, 2, 3, 4, 5]).keys(), ["0", "1", "2", "3", "4"]);
compareArrays(new $p([[0, 1], 2, 3, 4, 5]).keys(), [
  "0.0",
  "0.1",
  "1",
  "2",
  "3",
  "4"
]);

compareArrays(
  new $p({
    a: 0,
    b: 1,
    c: 2
  }).keys(),
  ["a", "b", "c"]
);

let arr = [
  {
    name: "Peter",
    age: 24
  },
  {
    name: "Not Peter",
    age: 42
  }
];

compare($p.from(arr).get(0).name, "Peter");
compare($p.from(arr).get([1]).age, 42);

compareArrays(new $p(obj2).keys(), [
  "a.c",
  "a.d",
  "b.e.0",
  "b.e.1",
  "b.e.2",
  "b.e.3"
]);
compareArrays(
  new $p(obj2).keys().map(k => new $p(obj2).get(k)),
  [2, 3, 4, 5, 6, 7]
);

let obj3 = {
  a: 2
};

compare(new $p(obj3).get("a"), 2);
new $p(obj3).set("a", 3);
compare(new $p(obj3).get("a"), 3);

let obj4 = {
  a: {
    a: 1,
    b: 2
  }
};

compare(new $p(obj4).get("a.a"), 1);
new $p(obj4).set("a.a", 3);
compare(new $p(obj4).get("a.a"), 3);

let obj5 = [1, 2, 3, 4, 5];

compare(new $p(obj5).get("0"), 1);
new $p(obj5).set("0", 10);
compare(new $p(obj5).get("0"), 10);

let obj6 = [
  {
    name: "Robert",
    age: 30
  }
];

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
};

compareArrays(new $p(obj7).keys(), [
  "a",
  "b",
  "c",
  "d.0",
  "d.1",
  "d.2",
  "d.3.0",
  "d.3.1",
  "d.3.2"
]);
compareArrays(new $p(obj7).values(), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
compareArrays(
  new $p(obj7).filterKeys(i => i > 5),
  ["d.2", "d.3.0", "d.3.1", "d.3.2"]
);

let objToFlatten = {
  a: 1,
  b: {
    c: 2,
    d: 3
  },
  d: [4, 5, 6, 7]
};

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
compare(
  new $p(obj8).equal([
    {
      a: {
        b: 2,
        c: 3
      },
      d: [1, 2, 3, 4]
    }
  ]),
  false
);

compare(
  new $p(obj8).equal({
    a: {
      b: 2,
      d: 3
    },
    d: [1, 2, 3, 4]
  }),
  false
);

compare(
  new $p(obj8).equal({
    a: {
      b: 2,
      c: 4
    },
    d: [1, 2, 3, 4]
  }),
  false
);

compare(
  new $p(obj8).equal({
    a: {
      b: 2,
      c: 3
    },
    d: [1, 2, 3, 4]
  }),
  true
);

let obj9 = {};

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
};

compare(
  new $p(obj10).findKey(i => i == 10),
  "c.1"
);

compare(new $p([1, 2, 3, 4]).get([1]), 2);

compareArrays(
  new $p([1, 2, 3, 4]).map(i => i * i),
  [1, 4, 9, 16]
);
compare(
  new $p(
    new $p({
      a: 2,
      b: {
        c: 3,
        d: 4
      }
    }).map(i => i * i)
  ).equal({
    a: 4,
    b: {
      c: 9,
      d: 16
    }
  }),
  true
);

compare(
  new $p(
    new $p({
      a: 2,
      b: {
        c: 3,
        d: [1, 2, 3]
      }
    }).map(i => i * i)
  ).equal({
    a: 4,
    b: {
      c: 9,
      d: [1, 4, 9]
    }
  }),
  true
);

let obj13 = {
  a: [1, 2, 3],
  b: 4,
  c: {
    d: {
      e: 5,
      f: 6
    }
  }
};

compareArrays(new $p(obj13).innerNodes(), ["a", "c", "c.d"]);

compare(new $p(obj13).equal(new $p(obj13).copy()), true);

compare(
  $p
    .from({
      a: 2
    })
    .get("a"),
  2
);

const list = [];

$p.from([
  1,
  {
    a: 2,
    b: 3
  }
]).forEach(v => list.push(v));

compareArrays(list, [1, 2, 3]);

compare(
  $p
    .from({
      a: 2,
      b: 3
    })
    .includes(3),
  true
);

compare(
  $p
    .from({
      a: 2,
      b: {
        c: [3, 4]
      }
    })
    .includes(3),
  true
);

compare(
  $p
    .from({
      a: 2,
      b: {
        c: [3, 4]
      }
    })
    .includes(5),
  false
);

compareArrays(
  $p
    .from({
      a: 2,
      b: {
        c: null
      }
    })
    .keys(),
  ["a", "b.c"]
);

const obj18 = {
  a: 2,
  b: 3
};
const copy = $p.from(obj18).copy();

compare($p.from($p.from(copy).get()).equal(obj18), true);
compare($p.from(copy).equal(obj18), true);
obj18.a = null;
compare($p.from(copy).equal(obj18), false);

const obj19 = {
  a: 2
};

try {
  $p.from(obj19).set("a.b");
} catch (err) {
  compare(err, "PTree: Tried to set property of atomic value");
}

const obj20 = {
  a: {
    b: 2,
    c: {
      d: 3,
      e: 5,
      f: [1, 2, 3]
    }
  }
};

compare($p.from(obj20).get("a.b"), 2);
$p.from(obj20).remove("a.b");
compare($p.from(obj20).get("a.b"), undefined);

compareArrays($p.from(obj20).get("a.c.f"), [1, 2, 3]);
compare($p.from(obj20).remove("a.c.f.1"), 2); // <- array, because we're splicing from an array
compareArrays($p.from(obj20).get("a.c.f"), [1, 3]);

$p.from(obj20).remove("a.c.f");
compare($p.from(obj20).get("a.c.f"), undefined);

$p.from(obj20).remove("a.c");
compare($p.from(obj20).get("a.c"), undefined);

$p.from(obj20).remove("a");
compare($p.from(obj20).get("a"), undefined);

compare(Object.keys($p.from(obj20).getRoot()).length, 0);

compare(
  $p
    .from({
      a: [1, 2, 3, 4]
    })
    .every(i => typeof i == "number"),
  true
);

compare(
  $p
    .from({
      a: [1, "string", 3, 4]
    })
    .every(i => typeof i == "number"),
  false
);

compare(
  $p
    .from({
      a: [1, "string", 3, 4]
    })
    .some(i => typeof i == "string"),
  true
);

compare(
  $p
    .from({
      a: [1, 2, 3, 4]
    })
    .some(i => typeof i == "string"),
  false
);

compare(
  $p
    .from({
      a: [1, { a: 2, b: { a: 2, b: { c: 2, d: { e: 7 } } } }, 3, 4]
    })
    .some(i => i >= 7),
  true
);

let obj21 = [
  {
    name: "Peter",
    age: 24
  },
  {
    name: "Not Peter",
    age: 42
  }
];

compare(
  $p.from($p.from(obj21).pick(["0.name", "1.name"])).equal([
    {
      name: "Peter"
    },
    {
      name: "Not Peter"
    }
  ]),
  true
);

{
  // Merge with overwrite (default)

  let obj22 = {
    a: {
      b: 2
    }
  };

  compare(obj22.a.b, 2);
  compare(obj22.a.c, undefined);
  compare(obj22.d, undefined);

  $p.from(obj22).merge({
    a: {
      b: 4,
      c: 2
    },
    d: 4
  });

  $p.from(obj22).set("e", 5);

  compare(obj22.a.b, 4);
  compare(obj22.a.c, 2);
  compare(obj22.d, 4);
}

{
  // Merge without overwrite

  let obj22 = {
    a: {
      b: 2
    }
  };

  compare(obj22.a.b, 2);
  compare(obj22.a.c, undefined);
  compare(obj22.d, undefined);

  $p.from(obj22).merge(
    {
      a: {
        b: 4,
        c: 2
      },
      d: 4
    },
    false
  );

  $p.from(obj22).set("e", 5);

  compare(obj22.a.b, 2);
  compare(obj22.a.c, 2);
  compare(obj22.d, 4);
}

const obj25 = {
  a: {
    b: "abc",
    c: "def"
  },
  b: {
    a: "asd",
    b: "des",
    c: {
      e: 2,
      f: 4
    }
  },
  c: "asd"
};

compare($p.from(obj25).wildcard("a.*").length, 2);
compare($p.from(obj25).wildcard("b.*").length, 4);
compare($p.from(obj25).wildcard("d.*").length, 0);
