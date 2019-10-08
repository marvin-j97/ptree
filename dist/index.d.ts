export declare type Key = string | number | (() => string | number);
export declare type TransformFunction = (val: any, root: object) => any;
export declare type Rule = (val: any, root: object) => boolean | string;
export declare type ValidationProp = {
    key: Key;
    optional?: boolean;
    rules?: Rule[];
    preTransform?: TransformFunction | TransformFunction[];
    postTransform?: TransformFunction | TransformFunction[];
};
interface KeyValueMap {
    [key: string]: any;
}
export default class PTree {
    root: KeyValueMap | any[];
    constructor(root: object);
    static from(root: object): PTree;
    get(key?: Key): any;
    keys(prev?: string): string[];
    set(key: Key, value: any): void;
    values(): any[];
    fromKeys(keys: Key[]): any[];
    filterKeys(filter: (val: any, key: string, root: object) => boolean): string[];
    flatten(): any;
    equal(other: object): boolean;
    findKey(finder: (val: any, key: string, root: object) => boolean): string | undefined;
    map(mapper: (val: any, key: string, root: object) => any): any;
    validate(props: ValidationProp[]): boolean | string;
    copy(): any;
    forEach(func: (val: any, key: string, root: object) => void): void;
    includes(val: any): boolean;
}
export {};
