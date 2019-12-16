"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globObject = require("glob-object");
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
    wildcard(pattern) {
        const globbed = globObject(pattern, this.root);
        return new PTree(globbed).keys();
    }
    innerNodes(prev) {
        let keys = [];
        if (!Array.isArray(this.root)) {
            let props = Object.keys(this.root);
            props.forEach(key => {
                const v = this.root[key];
                if (typeof v === "object" && v !== null) {
                    keys.push(key);
                    keys.push(...new PTree(v).innerNodes(key));
                }
            });
        }
        else if (Array.isArray(this.root)) {
            this.root.forEach((v, i) => {
                if (typeof v === "object" && v !== null) {
                    keys.push(i.toString());
                    keys.push(...new PTree(v).innerNodes(i.toString()));
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
                const nextSeg = segments[i + 1];
                if (/^[0-9]+$/.test(nextSeg.toString()) || typeof nextSeg === "number")
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
    pick(keys) {
        let newRoot;
        if (Array.isArray(this.root))
            newRoot = PTree.from([]);
        else
            newRoot = PTree.from({});
        keys.forEach(key => {
            newRoot.set(key, this.get(key));
        });
        return newRoot.root;
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
    every(pred) {
        return this.keys().every((key, i, keys) => pred(this.get(key), key, keys));
    }
    all(pred) {
        return this.every(pred);
    }
    some(pred) {
        return this.keys().some((key, i, keys) => pred(this.get(key), key, keys));
    }
    any(pred) {
        return this.some(pred);
    }
    merge(other, overwrite = true) {
        PTree.from(other).each((val, key) => {
            if (this.get(key) === undefined || overwrite)
                this.set(key, val);
        });
    }
}
exports.default = PTree;
