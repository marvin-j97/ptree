type Path = string | (string | number | (() => (string | number)))[];

type ValidationProp = {
  path: Path;
  optional?: boolean;
  rules?: (((val: any, obj: any) => boolean | string))[];
  preTransform?: ((val: any, obj: any) => any)[];
  postTransform?: ((val: any, obj: any) => any)[];
}

function getSegments(path: Path): (string | number)[] {
  let segments: (string | number)[] = [];

  if (typeof path === "string") {
    if (!path.length) {
      return [];
    }

    segments = path.split(".");
  } else {
    segments = path.map(seg => {
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

  public get(path: Path): any {
    if ((typeof path === "string" || typeof path === "number") && ((<any>this.root)[path]) !== undefined) {
      return (<any>this.root)[path];
    }

    const segments = getSegments(path);

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
      keys = props.reduce((acc: string[], key) => {
        const v = (<any>this.root)[key];
        if (typeof v === "object") {
          return acc.concat(new PTree(v).keys(key));
        }
        return acc.concat(key);
      }, []);
    } else if (Array.isArray(this.root)) {
      keys = this.root.reduce((acc, v, i) => {
        if (typeof v === "object") {
          return acc.concat(new PTree(v).keys(i.toString()));
        }
        return acc.concat(i.toString());
      }, []);
    } else {
      throw `Tried to get keys of atomic value`;
    }

    if (prev !== undefined) {
      keys = keys.map(k => `${prev}.${k}`)
    }

    return keys;
  }

  public set(path: Path, value: any): void {
    let segments = getSegments(path);

    // Iterative deep object descent & set
    let obj = this.root;

    for (let i = 0; i < segments.length; i++) {
      const current = obj;
      const seg = segments[i] as string | number;

      if (i < segments.length - 1) {
        obj = (<any>obj)[seg];
      } else {
        if (typeof obj === "object") {
          (<any>obj)[seg] = value;
        } else {
          throw `PTree: Tried to set property of atomic value`;
        }
      }

      if (obj === undefined) {
        if (/^[0-9]+$/.test(seg.toString()))
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

  public fromKeys(keys: Path[]) {
    return keys.map(k => this.get(k));
  }

  public filterKeys(filter: (val: any) => boolean) {
    return this.keys().filter(k => filter(this.get(k)));
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

  public findKey(finder: (val: any) => boolean) {
    return this.keys().find(k => {
      return finder(this.get(k));
    });
  }

  public map(mapper: (val: any) => any) {
    const keys = this.keys();
    let mapped: any;

    if (Array.isArray(this.root)) {
      mapped = [];
    } else if (typeof this.root === "object") {
      mapped = {};
    }

    let p = new PTree(mapped);

    keys.forEach(key => {
      let value = this.get(key);
      p.set(key, mapper(value));
    });

    return mapped;
  }

  public validate(props: ValidationProp[]): boolean | string {
    for (const prop of props) {
      if (!prop.path) {
        throw "PTree: Invalid path in validation function";
      }

      if (prop.path === "*") {
        props.push(...this.keys().map(key => {
          return {
            path: key,
            optional: prop.optional,
            rules: prop.rules,
            preTransform: prop.preTransform,
            postTransform: prop.postTransform
          };
        }));
        continue;
      }

      let value = this.get(prop.path);

      if (prop.preTransform) {
        for (const transformer of prop.preTransform) {
          this.set(prop.path, transformer(value, this.root));
        }

        value = this.get(prop.path);
      }

      if (value === undefined && !prop.optional) {
        return false;
      }

      if (value === undefined && prop.optional) {
        return true;
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
          this.set(prop.path, transformer(value, this.root));
        }
      }
    }

    return true;
  }

  public copy() {
    const keys = this.keys();

    let obj = {};
    if (Array.isArray(this.root)) {
      obj = [];
    }

    let copy = new PTree(obj);

    keys.forEach(key => {
      copy.set(key, this.get(key));
    });

    return copy.root;
  }
}