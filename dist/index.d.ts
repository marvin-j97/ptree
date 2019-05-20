declare class PTree {
  _root: any;

  constructor(_root: any);
  get(path: string | (string | (() => (string | number)) | number)[]): any;
  keys(): string[] | undefined;
  set(path: string, value: any): void;
  values(): any[];
  fromKeys(keys: (string | (string | (() => (string | number)) | number)[])[]): any[];
  filterKeys(filter: (v: any) => boolean): string[];
  flatten(): any;
  equal(other: any): boolean;
  findKey(finder: (v: any) => boolean): string | undefined;
  validate(props: { path: string | (string | (string | (() => (string | number)) | number)[]), optional?: boolean, rules?: ((v: any) => boolean)[] }): boolean;
}

export = PTree;