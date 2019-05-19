function getSegments(path) {
  const pathType = typeof path;
  let segments;

  if (pathType === "string") {
    if (!path.length) {
      return [];
    }

    segments = path.split(".");
  } else {
    segments = path.map(seg => {
      const segType = typeof seg;
      if (segType === "string" || segType === "number") {
        return seg;
      }

      if (segType === "function") {
        return seg();
      }
    });
  }

  return segments;
}

// TODO: root object as constructor, 1 less parameter in future functions
// this. this. this.

const PTree = function () {

  // Get value at path
  this.get = function (_root, path) {
    const pathType = typeof path;
    if (pathType !== "string" && !Array.isArray(path)) {
      console.warn(`PTree: String or Array expected, got: ${pathType}`);
      return undefined;
    }

    if (_root[path] !== undefined) {
      return _root[path];
    }

    let segments = getSegments(path);

    // Iterative deep object descent
    let obj = _root;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];

      obj = obj[seg];

      if (obj === undefined) {
        return undefined;
      }
    }

    return obj;
  }

  // Get key paths recursively
  this.keys = function (_root, prev) {
    const objType = typeof _root;
    if (objType !== "object" && !Array.isArray(_root)) {
      console.warn(`PTree: Object or Array expected, got: ${objType}`);
      return undefined;
    }

    let keys = [];

    if (objType === "object" && !Array.isArray(_root)) {
      let props = Object.keys(_root);
      keys = props.reduce((acc, key) => {
        const v = _root[key];
        if (typeof v === "object") {
          return acc.concat(this.keys(v, key));
        }
        return acc.concat(key);
      }, []);
    } else {
      keys = _root.reduce((acc, v, i) => {
        if (typeof v === "object") {
          return acc.concat(this.keys(v, i.toString()));
        }
        return acc.concat(i.toString());
      }, []);
    }

    if (prev !== undefined) {
      keys = keys.map(k => `${prev}.${k}`)
    }

    return keys;
  }

  // Set value at path
  this.set = function (_root, path, value) {
    const pathType = typeof path;
    if (pathType !== "string" && !Array.isArray(path)) {
      console.warn(`PTree: String or Array expected, got: ${pathType}`);
      return undefined;
    }

    let segments = getSegments(path);

    // Iterative deep object descent & set
    let obj = _root;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];

      if (i < segments.length - 1) {
        obj = obj[seg];
      } else {
        if (typeof obj === "object") {
          obj[seg] = value;
        } else {
          console.warn(`PTree: Tried to set property of atomic value`);
          return;
        }
      }

      if (obj === undefined)
        return;
    }
  }

  // Get all values as array
  this.values = function (_root) {
    return this.fromKeys(_root, this.keys(_root));
  }

  // Get all values from an array of keys
  this.fromKeys = function (_root, keys) {
    return keys.map(k => this.get(_root, k));
  }

  // Get all values that meet a certain condition
  this.filter = function(_root, filter) {
    return this.fromKeys(_root, this.filterKeys(_root, filter));
  }

  // Get all keys where a certain condition is true
  this.filterKeys = function (_root, filter) {
    return this.keys(_root).filter(k => {
      return filter(this.get(_root, k));
    });
  }

  // Map a set of values to a new set of values
  this.map = function (_root, mapper) {
    return this.values(_root).map(mapper);
  }

  // Reduce a set of values
  this.reduce = function (_root, reducer, initial) {
    return this.values(_root).reduce(reducer, initial);
  }

  // Flatten object
  this.flatten = function(_root) {
    let keys = this.keys(_root);
    let flat = {};
    for(const key of keys) {
      flat[key] = this.get(_root, key);
    }
    return flat;
  }
}

const p = new PTree();

module.exports = p;