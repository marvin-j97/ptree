export type Key = string | (string | number | (() => (string | number)))[];

export type ValidationProp = {
  key: Key;
  optional?: boolean;
  rules?: (((val: any, root: object) => boolean | string))[];
  preTransform?: ((val: any, root: object) => any)[];
  postTransform?: ((val: any, root: object) => any)[];
}

function getSegments(key: Key): (string | number)[] {
  if (typeof key === "string") {
    if (!key.length) {
      return [];
    }

    var segments: (string | number)[] = key.split(".");
  } else {
    var segments = key.map(seg => {
      if (typeof seg === "function") {
        return seg();
      }
      else if (typeof seg === "string" || typeof seg === "number") {
        return seg;
      }
      return "";
    });
  }

  return segments;
}

function equalArrays(a: any[], b: any[]) {
  return a.length == b.length && a.every((v, i) => v === b[i]);
}

export default class PTree {
  root: {} | any[];

  constructor(root: object) {
    this.root = root;
  }

  static from(root: object) {
    return new PTree(root);
  }

  public get(key: Key): any {
    if ((typeof key === "string" || typeof key === "number") && ((<any>this.root)[key]) !== undefined) {
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

  public keys(prev?: string): string[] {
    let keys = [] as string[];

    if (!Array.isArray(this.root)) {
      let props = Object.keys(this.root);

      props.forEach(key => {
        const v = (<any>this.root)[key];
        if (typeof v === "object" && v !== null) {
          keys.push(...new PTree(v).keys(key));
        }
        else {
          keys.push(key);
        }
      });
    } else if (Array.isArray(this.root)) {
      this.root.forEach((v, i) => {
        if (typeof v === "object" && v !== null) {
          keys.push(...new PTree(v).keys(i.toString()));
        }
        else {
          keys.push(i.toString());
        }
      });
    } else {
      throw `Tried to get keys of atomic value`;
    }

    if (prev !== undefined) {
      keys = keys.map(k => `${prev}.${k}`)
    }

    return keys;
  }

  public set(key: Key, value: any): void {
    let segments = getSegments(key);

    // Iterative deep object descent & set
    let obj = this.root;

    for (let i = 0; i < segments.length; i++) {
      const current = obj;
      const seg = segments[i] as string | number;

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
        if (/^[0-9]+$/.test(seg.toString()) || typeof seg === "number")
          (<any>current)[seg] = [];
        else
          (<any>current)[seg] = {};
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
    if (typeof this.root !== typeof other)
      return false;

    const otherTree = new PTree(other);

    const keys = this.keys();
    const otherKeys = otherTree.keys();

    if (!equalArrays(keys, otherKeys))
      return false;

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

  public validate(props: ValidationProp[]): boolean | string {
    for (const prop of props) {
      if (!prop.key) {
        throw "PTree: Invalid key in validation function";
      }

      if (prop.key === "*") {
        props.push(...this.keys().map(key => {
          return {
            key,
            optional: prop.optional,
            rules: prop.rules,
            preTransform: prop.preTransform,
            postTransform: prop.postTransform
          };
        }));
        continue;
      }

      let value = this.get(prop.key);

      if (value === undefined && !prop.optional) {
        return false;
      }

      if (value === undefined && prop.optional) {
        continue;
      }

      if (prop.preTransform) {
        for (const transformer of prop.preTransform) {
          this.set(prop.key, transformer(value, this.root));
        }

        value = this.get(prop.key);
      }

      if (prop.rules) {
        for (const rule of prop.rules) {

          if (typeof rule === "function") {
            const result = rule(value, this.root);

            if (result === true)
              continue;

            return result;
          }
        }
      }

      if (prop.postTransform) {
        for (const transformer of prop.postTransform) {
          this.set(prop.key, transformer(value, this.root));
        }
      }
    }

    return true;
  }

  public copy() {
    let obj = {};
    if (Array.isArray(this.root)) {
      obj = [];
    }

    let copy = new PTree(obj);

    this.keys().forEach(key => {
      copy.set(key, this.get(key));
    });

    return copy.root;
  }

  public forEach(func: (val: any, key: string, root: object) => void) {
    this.keys().forEach(key => {
      func(this.get(key), key, this.root);
    });
  }

  public includes(val: any) {
    return this.findKey(v => v === val) !== undefined;
  }
}