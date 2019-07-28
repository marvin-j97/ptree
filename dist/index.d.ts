declare type Path = string | (string | number | (() => (string | number)))[];
declare type ValidationProp = {
    path: Path;
    optional: boolean;
    rules: ((val: any) => boolean)[];
};
export default class PTree {
    root: {} | any[];
    constructor(root: object);
    get(path: Path): any;
    keys(prev?: string): string[];
    set(path: Path, value: any): void;
    values(): any[];
    fromKeys(keys: Path[]): any[];
    filterKeys(filter: (val: any) => boolean): string[];
    flatten(): any;
    equal(other: object): boolean;
    findKey(finder: (val: any) => boolean): string | undefined;
    map(mapper: (val: any) => any): any;
    validate(props: ValidationProp[]): boolean;
    copy(): {} | any[];
}
export {};
