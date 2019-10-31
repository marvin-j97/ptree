"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getSegments(path) {
    let segments = [];
    if (typeof path === "string") {
        if (path.length)
            segments = path.split(".");
        else
            return [];
    }
    else if (typeof path === "number")
        segments = [path];
    else if (typeof path === "function")
        segments = [path()];
    else {
        segments = path.map(key => {
            if (typeof key === "function") {
                return key();
            }
            else if (typeof key === "string" || typeof key === "number") {
                return key;
            }
            throw new Error(`Unsupported key type: ${typeof key}`);
        });
    }
    return segments;
}
function equalArrays(a, b) {
    return a.length == b.length && a.every((v, i) => v === b[i]);
}
class PTree {
    constructor(root) {
        this.root = root;
    }
    getRoot() {
        return this.root;
    }
    static from(root) {
        return new PTree(root);
    }
    get(key) {
        if (key === undefined)
            return this.root;
        if ((typeof key === "string" || typeof key === "number") &&
            this.root[key] !== undefined) {
            return this.root[key];
        }
        const segments = getSegments(key);
        let obj = this.root;
        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            obj = obj[seg];
            if (obj === undefined) {
                return undefined;
            }
        }
        return obj;
    }
    keys(prev) {
        let keys = [];
        if (!Array.isArray(this.root)) {
            let props = Object.keys(this.root);
            props.forEach(key => {
                const v = this.root[key];
                if (typeof v === "object" && v !== null) {
                    keys.push(...new PTree(v).keys(key));
                }
                else {
                    keys.push(key);
                }
            });
        }
        else if (Array.isArray(this.root)) {
            this.root.forEach((v, i) => {
                if (typeof v === "object" && v !== null) {
                    keys.push(...new PTree(v).keys(i.toString()));
                }
                else {
                    keys.push(i.toString());
                }
            });
        }
        else {
            throw `Tried to get keys of atomic value`;
        }
        if (prev !== undefined) {
            keys = keys.map(k => `${prev}.${k}`);
        }
        return keys;
    }
    remove(key) {
        const segments = getSegments(key);
        const lastSegment = segments.pop();
        let obj = this.root;
        while (!!segments.length) {
            obj = obj[segments.shift()];
        }
        try {
            if (Array.isArray(obj)) {
                const val = obj.splice(lastSegment, 1)[0];
                return val;
            }
            else {
                const val = obj[lastSegment];
                delete obj[lastSegment];
                return val;
            }
        }
        catch (err) {
            throw err;
        }
    }
    set(key, value) {
        const segments = getSegments(key);
        let obj = this.root;
        for (let i = 0; i < segments.length; i++) {
            const current = obj;
            const seg = segments[i];
            if (i < segments.length - 1) {
                obj = obj[seg];
            }
            else {
                if (typeof obj === "object" && obj !== null) {
                    obj[seg] = value;
                }
                else {
                    throw `PTree: Tried to set property of atomic value`;
                }
            }
            if (obj === undefined) {
                if (/^[0-9]+$/.test(seg.toString()) || typeof seg === "number")
                    current[seg] = [];
                else
                    current[seg] = {};
                obj = current[seg];
            }
        }
    }
    values() {
        return this.fromKeys(this.keys());
    }
    fromKeys(keys) {
        return keys.map(k => this.get(k));
    }
    filterKeys(filter) {
        return this.keys().filter(key => filter(this.get(key), key, this.root));
    }
    flatten() {
        let flat = {};
        this.keys().forEach(key => {
            flat[key] = this.get(key);
        });
        return flat;
    }
    equal(other) {
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
    findKey(finder) {
        return this.keys().find(key => {
            return finder(this.get(key), key, this.root);
        });
    }
    map(mapper) {
        const keys = this.keys();
        let mapped;
        if (Array.isArray(this.root)) {
            mapped = [];
        }
        else if (typeof this.root === "object") {
            mapped = {};
        }
        let p = new PTree(mapped);
        keys.forEach(key => {
            p.set(key, mapper(this.get(key), key, this.root));
        });
        return mapped;
    }
    validate(props) {
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
                if (Array.isArray(prop.preTransform))
                    for (const transformer of prop.preTransform) {
                        this.set(prop.key, transformer(value, this.root));
                    }
                else
                    this.set(prop.key, prop.preTransform(value, this.root));
                value = this.get(prop.key);
            }
            if (prop.rules) {
                if (Array.isArray(prop.rules)) {
                    for (const rule of prop.rules) {
                        const result = rule(value, this.root);
                        if (result === true)
                            continue;
                        return result;
                    }
                }
                else {
                    const result = prop.rules(value, this.root);
                    if (!result)
                        return result;
                }
            }
            if (prop.postTransform) {
                if (Array.isArray(prop.postTransform))
                    for (const transformer of prop.postTransform) {
                        this.set(prop.key, transformer(value, this.root));
                    }
                else
                    this.set(prop.key, prop.postTransform(value, this.root));
            }
        }
        return true;
    }
    copy() {
        return JSON.parse(JSON.stringify(this.root));
    }
    each(func) {
        this.forEach(func);
    }
    forEach(func) {
        this.keys().forEach(key => {
            func(this.get(key), key, this.root);
        });
    }
    includes(val) {
        return this.findKey(v => v === val) !== undefined;
    }
}
exports.default = PTree;
