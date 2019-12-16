const globObject = require("glob-object");

export type Key = string | number | (() => string | number);

function getSegments(path: Key | Key[]): (string | number)[] {
  let segments = [];
  if (typeof path === "string") {
    if (path.length) segments = path.split(".");
    else return [];
  } else if (typeof path === "number") segments = [path];
  else if (typeof path === "function") segments = [path()];
  else {
    segments = path.map(key => {
      if (typeof key === "function") {
        return key();
      } else if (typeof key === "string" || typeof key === "number") {
        return key;
      }
      throw new Error(`Unsupported key type: ${typeof key}`);
    });
  }

  return segments;
}

function equalArrays(a: any[], b: any[]) {
  return a.length == b.length && a.every((v, i) => v === b[i]);
}

interface KeyValueMap {
  [key: string]: any;
}

export default class PTree {
  root: KeyValueMap | any[];

  public getRoot() {
    return this.root;
  }

  constructor(root: object) {
    this.root = root;
  }

  static from(root: object) {
    return new PTree(root);
  }

  public get(key?: Key): any {
    if (key === undefined) return this.root;

    if (
      (typeof key === "string" || typeof key === "number") &&
      (<any>this.root)[key] !== undefined
    ) {
      return (<any>this.root)[key];
    }

    const segments = getSegments(key);

    // Iterative deep object descent
    let obj = this.root;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i] as string | number;

      obj = (<any>obj)[seg];

      if (obj === undefined) {
        return undefined;
      }
    }

    return obj;
  }

  public wildcard(pattern: string) {
    const globbed = globObject(pattern, this.root);
    return new PTree(globbed).keys();
  }

  public innerNodes(prev?: string): string[] {
    let keys = [] as string[];

    if (!Array.isArray(this.root)) {
      let props = Object.keys(this.root);

      props.forEach(key => {
        const v = (<any>this.root)[key];
        if (typeof v === "object" && v !== null) {
          keys.push(key);
          keys.push(...new PTree(v).innerNodes(key));
        }
      });
    } else if (Array.isArray(this.root)) {
      this.root.forEach((v, i) => {
        if (typeof v === "object" && v !== null) {
          keys.push(i.toString());
          keys.push(...new PTree(v).innerNodes(i.toString()));
        }
      });
    } else {
      throw `Tried to get keys of atomic value`;
    }

    if (prev !== undefined) {
      keys = keys.map(k => `${prev}.${k}`);
    }

    return keys;
  }

  public keys(prev?: string): string[] {
    let keys = [] as string[];

    if (!Array.isArray(this.root)) {
      let props = Object.keys(this.root);

      props.forEach(key => {
        const v = (<any>this.root)[key];
        if (typeof v === "object" && v !== null) {
          keys.push(...new PTree(v).keys(key));
        } else {
          keys.push(key);
        }
      });
    } else if (Array.isArray(this.root)) {
      this.root.forEach((v, i) => {
        if (typeof v === "object" && v !== null) {
          keys.push(...new PTree(v).keys(i.toString()));
        } else {
          keys.push(i.toString());
        }
      });
    } else {
      throw `Tried to get keys of atomic value`;
    }

    if (prev !== undefined) {
      keys = keys.map(k => `${prev}.${k}`);
    }

    return keys;
  }

  public remove(key: Key) {
    const segments = getSegments(key);
    const lastSegment = segments.pop();

    let obj = this.root;

    while (!!segments.length) {
      //@ts-ignore
      obj = obj[segments.shift()];
    }

    try {
      if (Array.isArray(obj)) {
        // @ts-ignore
        const val = obj.splice(lastSegment, 1)[0];
        return val;
      } else {
        // @ts-ignore
        const val = obj[lastSegment];
        // @ts-ignore
        delete obj[lastSegment];
        return val;
      }
    } catch (err) {
      throw err;
    }
  }

  public set(key: Key, value: any): void {
    const segments = getSegments(key);

    // Iterative deep object descent & set
    let obj = this.root;

    for (let i = 0; i < segments.length; i++) {
      const current = obj;
      const seg = segments[i];

      if (i < segments.length - 1) {
        obj = (<any>obj)[seg];
      } else {
        if (typeof obj === "object" && obj !== null) {
          (<any>obj)[seg] = value;
        } else {
          throw `PTree: Tried to set property of atomic value`;
        }
      }

      if (obj === undefined) {
        const nextSeg = segments[i + 1];
        if (/^[0-9]+$/.test(nextSeg.toString()) || typeof nextSeg === "number")
          (<any>current)[seg] = [];
        else (<any>current)[seg] = {};
        obj = (<any>current)[seg];
      }
    }
  }

  public values() {
    return this.fromKeys(this.keys());
  }

  public fromKeys(keys: Key[]) {
    return keys.map(k => this.get(k));
  }

  public pick(keys: Key[]) {
    let newRoot: PTree;
    if (Array.isArray(this.root)) newRoot = PTree.from([]);
    else newRoot = PTree.from({});

    keys.forEach(key => {
      newRoot.set(key, this.get(key));
    });

    return newRoot.root;
  }

  public filterKeys(filter: (val: any, key: string, root: object) => boolean) {
    return this.keys().filter(key => filter(this.get(key), key, this.root));
  }

  public flatten() {
    let flat = {} as any;

    this.keys().forEach(key => {
      flat[key] = this.get(key);
    });

    return flat;
  }

  public equal(other: object) {
    if (typeof this.root !== typeof other) return false;

    const otherTree = new PTree(other);

    const keys = this.keys();
    const otherKeys = otherTree.keys();

    if (!equalArrays(keys, otherKeys)) return false;

    const values = this.fromKeys(keys);
    const otherValues = otherTree.fromKeys(otherKeys);

    return equalArrays(values, otherValues);
  }

  public findKey(finder: (val: any, key: string, root: object) => boolean) {
    return this.keys().find(key => {
      return finder(this.get(key), key, this.root);
    });
  }

  public map(mapper: (val: any, key: string, root: object) => any) {
    const keys = this.keys();
    let mapped: any;

    if (Array.isArray(this.root)) {
      mapped = [];
    } else if (typeof this.root === "object") {
      mapped = {};
    }

    let p = new PTree(mapped);

    keys.forEach(key => {
      p.set(key, mapper(this.get(key), key, this.root));
    });

    return mapped;
  }

  public copy() {
    return JSON.parse(JSON.stringify(this.root));
  }

  public each(func: (val: any, key: string, root: object) => void) {
    this.forEach(func);
  }

  public forEach(func: (val: any, key: string, root: object) => void) {
    this.keys().forEach(key => {
      func(this.get(key), key, this.root);
    });
  }

  public includes(val: any) {
    return this.findKey(v => v === val) !== undefined;
  }

  public every(pred: (val: any, key: string, root: object) => boolean) {
    return this.keys().every((key, i, keys) => pred(this.get(key), key, keys));
  }

  public all(pred: (val: any, key: string, root: object) => boolean) {
    return this.every(pred);
  }

  public some(pred: (val: any, key: string, root: object) => boolean) {
    return this.keys().some((key, i, keys) => pred(this.get(key), key, keys));
  }

  public any(pred: (val: any, key: string, root: object) => boolean) {
    return this.some(pred);
  }

  public merge(other: object, overwrite = true) {
    PTree.from(other).each((val, key) => {
      if (this.get(key) === undefined || overwrite) this.set(key, val);
    });
  }
}
