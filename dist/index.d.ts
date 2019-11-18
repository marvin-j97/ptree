export declare type Key = string | number | (() => string | number);
export declare type DefaultFunction = (root: object) => any;
export declare type TransformFunction = (val: any, root: object) => any;
export declare type Rule = (val: any, root: object) => boolean | string;
export declare type ValidationProp = {
    key: Key;
    optional?: boolean;
    default?: any | DefaultFunction;
    rules?: Rule | Rule[];
    preTransform?: TransformFunction | TransformFunction[];
    postTransform?: TransformFunction | TransformFunction[];
};
interface KeyValueMap {
    [key: string]: any;
}
export default class PTree {
    root: KeyValueMap | any[];
    getRoot(): any[] | KeyValueMap;
    constructor(root: object);
    static from(root: object): PTree;
    get(key?: Key): any;
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
    validate(props: ValidationProp[]): boolean | string;
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
