declare type Key = string | (string | number | (() => (string | number)))[];
declare type ValidationProp = {
    key: Key;
    optional?: boolean;
    rules?: (((val: any, obj: any) => boolean | string))[];
    preTransform?: ((val: any, obj: any) => any)[];
    postTransform?: ((val: any, obj: any) => any)[];
};
export default class PTree {
    root: {} | any[];
    constructor(root: object);
    get(key: Key): any;
    keys(prev?: string): string[];
    set(key: Key, value: any): void;
    values(): any[];
    fromKeys(keys: Key[]): any[];
    filterKeys(filter: (val: any) => boolean): string[];
    flatten(): any;
    equal(other: object): boolean;
    findKey(finder: (val: any) => boolean): string | undefined;
    map(mapper: (val: any) => any): any;
    validate(props: ValidationProp[]): boolean | string;
    copy(): {} | any[];
}
export {};
