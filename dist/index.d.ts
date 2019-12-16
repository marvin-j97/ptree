export declare type Key = string | number | (() => string | number);
interface KeyValueMap {
    [key: string]: any;
}
export default class PTree {
    root: KeyValueMap | any[];
    getRoot(): any[] | KeyValueMap;
    constructor(root: object);
    static from(root: object): PTree;
    get(key?: Key): any;
    wildcard(pattern: string): string[];
    innerNodes(prev?: string): string[];
    keys(prev?: string): string[];
    remove(key: Key): any;
    set(key: Key, value: any): void;
    values(): any[];
    fromKeys(keys: Key[]): any[];
    pick(keys: Key[]): any[] | KeyValueMap;
    filterKeys(filter: (val: any, key: string, root: object) => boolean): string[];
    flatten(): any;
    equal(other: object): boolean;
    findKey(finder: (val: any, key: string, root: object) => boolean): string | undefined;
    map(mapper: (val: any, key: string, root: object) => any): any;
    copy(): any;
    each(func: (val: any, key: string, root: object) => void): void;
    forEach(func: (val: any, key: string, root: object) => void): void;
    includes(val: any): boolean;
    every(pred: (val: any, key: string, root: object) => boolean): boolean;
    all(pred: (val: any, key: string, root: object) => boolean): boolean;
    some(pred: (val: any, key: string, root: object) => boolean): boolean;
    any(pred: (val: any, key: string, root: object) => boolean): boolean;
    merge(other: object, overwrite?: boolean): void;
}
export {};
