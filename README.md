[![npm version](https://badge.fury.io/js/%40dotvirus%2Fptree.svg)](https://badge.fury.io/js/%40dotvirus%2Fptree)

# ptree.ts
Deep object walking, manipulation and validation

This package wraps regular Objects and Arrays, providing more functionality for accessing, manipulating and validating deep object/array integrity.

# Install
```
npm install @dotvirus/ptree --save
```

``` javascript
// Require
const ptree = require("@dotvirus/ptree").default;

// Import
import ptree from "@dotvirus/ptree"
```

# Methods

## Constructor
Create a new ptree wrapping your original object/array.

``` javascript
// Using object
const root = new ptree({ a: 2, b: 3 });

// Using array
const root = new ptree([1, 2, 3]);
```

## get
Get the value at given key.
Key can be a dot-separated string, or an array containing single key segments as strings, numbers or functions.
If a non-existing key is accessed (see example 3), undefined is returned.

``` javascript
const root = new ptree({ a: 2, b: 3 });
console.log(root.get("a")); // -> 2
console.log(root.get([() => "a"])); // -> 2

const root2 = new ptree({ a: [1, 2, 3], b: 3 });
console.log(root2.get("a.2")); // -> 3
console.log(root2.get(["a", 2])); // -> 3

const root3 = new ptree({ a: { x: {  } }, b: 3 });
console.log(root2.get("a.x.y")); // -> undefined
```

## keys
Returns all keys (leaves) (including deep keys) of the object as an array.

``` javascript
const root = new ptree([
  {
    name: "Peter",
    age: 24
  },
  {
    name: "John",
    age: 37 
  }
]);
console.log(root.keys()); // -> [ '0.name', '0.age', '1.name', '1.age' ]
```

## set
Changes the value of the leaf at the given key

``` javascript
const root = new ptree([
  {
    name: "Peter",
    age: 24
  },
  {
    name: "John",
    age: 37 
  }
]);
root.set("0.age", 77);
console.log(root.get("0.age")); // -> 77
```

If you try to set a value of an non-existing key, the object will be artificially extended.

``` javascript
const tree = new ptree({});
tree.set("a.b.c", "My Value");
console.log(tree.root); // -> { a: { b: { c: 'My Value' } } }
```

## values
Like keys, but returns all leaf values. Essentially acts as an infinitely deep array/object flatten.

``` javascript
const root = new ptree([ 1, 2, 3, 4, [ 5, 6, 7, [ 8, 9, 10, { a: 11, x: 12 }]]]);
console.log(root.values()); // -> [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ]
```

## fromKeys
Returns all values at the given keys.

``` javascript
const root = new ptree([ 1, 2, 3, 4, [ 5, 6, 7, [ 8, 9, 10, { a: 11, x: 12 }]]]);
console.log(root.fromKeys([
  "4.3.3.a",
  "4.3.3.x"
])); // -> [ 11, 12 ]
```

# filterKeys
Returns all keys where a certain condition is met

``` javascript
const root = new ptree([ 1, 2, 3, 4, [ 5, 6, 7, [ 8, 9, 10, { a: 11, x: 12 }]]]);
console.log(root.filterKeys(v => v > 9)); // -> [ '4.3.2', '4.3.3.a', '4.3.3.x' ]
```

# flatten
Returns a new flattened version of the original root.

``` javascript
const root = new ptree([ 1, { a: 2, x: 3 }]);
console.log(root.flatten()); // -> { '0': 1, '1.a': 2, '1.x': 3 }
```

# equal
Compares two objects/arrays

``` javascript
const root = new ptree([ 1, { a: 2, x: 3 }]);

const other = [
  1,
  {
    a: 2,
    x: 3
  }
];

console.log(root.equal(other)); // -> true
console.log(root.equal({ a: 2, x: 3 })); // -> false
```

# findKey
Find the first key where a certain condition is met.

``` javascript
const root = new ptree([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
console.log(root.findKey(v => v >= 5)); // -> 4
```

# map
Maps all leaves to new values. Returns a new object/array.

``` javascript
const root = new ptree({ a: 5, b: { c: 7, d: 8, e: 9} });
console.log(root.map(v => v * v)); // -> { a: 25, b: { c: 49, d: 64, e: 81 } }
console.log(root.map(v => v.toString())); // -> { a: '5', b: { c: '7', d: '8', e: '9' } }
```

# validate
Checks the integrity of the root object.
This is done by defining rules for each key you want to check.

``` javascript
const root = new ptree([1,2,3]);

// Check if keys are defined
// this returns false, because the array is only length 3.
console.log(root.validate([
  {
    key: "0"
  },
  {
    key: "1"
  },
  {
    key: "2"
  },
  {
    key: "3"
  }
])) // -> false

// Like above, but this time index 3 is optional
console.log(root.validate([
  {
    key: "0"
  },
  {
    key: "1"
  },
  {
    key: "2"
  },
  {
    key: "3",
    optional: true
  }
])) // -> true

// Check for equality at given keys
console.log(root.validate([
  {
    key: "0",
    rules: [
      v => v === 1
    ]
  },
  {
    key: "1",
    rules: [
      v => v === 2
    ]
  }
])) // -> true

// Wildcard
console.log(root.validate([
  {
    key: "*",
    rules: [
      v => typeof v === "number"
    ]
  }
])) // -> true

// Error message
const root = new ptree({
  a: [1,2,3,4,5,6,7,8,9,10]
});

console.log(root.validate([
  {
    key: "a",
    rules: [
      v => Array.isArray(v),
      v => v.length > 5 ? "Array too long!" : true
    ]
  }
])); // -> "Array too long!"

// Using (pre/post) transforms, you can alter the object before or after applying your rules; this alters the original object!
// Trim all strings before checking rules
const tree = new ptree({
  a: " string",
  b: ["  not trimmed  "]
});

tree.validate([
  {
    key: "*",
    preTransform: [
      v => v.trim()
    ],
    rules: [
      v => true
    ],
    // postTransform: [
    // ]
  }
]);

console.log(tree.root); // -> { a: 'string', b: [ 'not trimmed' ] }

// Access the original object in rules (or transforms)
const root = new ptree({ a: 5, b: 5});

console.log(root.validate([
  {
    key: "a",
    rules: [
      (v, obj) => v === obj.b
    ]
  }
]))

```

# copy
Deep-copies the root object/array.

``` javascript
const root = new ptree([1,2,3]);
console.log(root.copy()); // -> [ 1, 2, 3 ]
```
