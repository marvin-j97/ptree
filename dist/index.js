"use strict";function getSegments(t){let e=[];if("string"==typeof t){if(!t.length)return[];e=t.split(".")}else e="number"==typeof t?[t]:"function"==typeof t?[t()]:t.map(t=>{if("function"==typeof t)return t();if("string"==typeof t||"number"==typeof t)return t;throw new Error(`Unsupported key type: ${typeof t}`)});return e}function equalArrays(t,e){return t.length==e.length&&t.every((t,r)=>t===e[r])}Object.defineProperty(exports,"__esModule",{value:!0});class PTree{constructor(t){this.root=t}getRoot(){return this.root}static from(t){return new PTree(t)}get(t){if(void 0===t)return this.root;if(("string"==typeof t||"number"==typeof t)&&void 0!==this.root[t])return this.root[t];const e=getSegments(t);let r=this.root;for(let t=0;t<e.length;t++){if(void 0===(r=r[e[t]]))return}return r}keys(t){let e=[];if(Array.isArray(this.root)){if(!Array.isArray(this.root))throw"Tried to get keys of atomic value";this.root.forEach((t,r)=>{"object"==typeof t&&null!==t?e.push(...new PTree(t).keys(r.toString())):e.push(r.toString())})}else{Object.keys(this.root).forEach(t=>{const r=this.root[t];"object"==typeof r&&null!==r?e.push(...new PTree(r).keys(t)):e.push(t)})}return void 0!==t&&(e=e.map(e=>`${t}.${e}`)),e}remove(t){const e=getSegments(t),r=e.pop();let o=this.root;for(;e.length;)o=o[e.shift()];try{if(Array.isArray(o)){return o.splice(r,1)[0]}{const t=o[r];return delete o[r],t}}catch(t){throw t}}set(t,e){const r=getSegments(t);let o=this.root;for(let t=0;t<r.length;t++){const s=o,i=r[t];if(t<r.length-1)o=o[i];else{if("object"!=typeof o||null===o)throw"PTree: Tried to set property of atomic value";o[i]=e}if(void 0===o){const e=r[t+1];/^[0-9]+$/.test(e.toString())||"number"==typeof e?s[i]=[]:s[i]={},o=s[i]}}}values(){return this.fromKeys(this.keys())}fromKeys(t){return t.map(t=>this.get(t))}pick(t){let e;return e=Array.isArray(this.root)?PTree.from([]):PTree.from({}),t.forEach(t=>{e.set(t,this.get(t))}),e.root}filterKeys(t){return this.keys().filter(e=>t(this.get(e),e,this.root))}flatten(){let t={};return this.keys().forEach(e=>{t[e]=this.get(e)}),t}equal(t){if(typeof this.root!=typeof t)return!1;const e=new PTree(t),r=this.keys(),o=e.keys();return!!equalArrays(r,o)&&equalArrays(this.fromKeys(r),e.fromKeys(o))}findKey(t){return this.keys().find(e=>t(this.get(e),e,this.root))}map(t){const e=this.keys();let r;Array.isArray(this.root)?r=[]:"object"==typeof this.root&&(r={});let o=new PTree(r);return e.forEach(e=>{o.set(e,t(this.get(e),e,this.root))}),r}validate(t){for(const e of t){if(!e.key)throw"PTree: Invalid key in validation function";if("*"===e.key){t.push(...this.keys().map(t=>({key:t,optional:e.optional,rules:e.rules,preTransform:e.preTransform,postTransform:e.postTransform})));continue}let r=this.get(e.key);if(void 0===r&&!e.optional)return!1;if(void 0!==r||!e.optional){if(e.preTransform){if(Array.isArray(e.preTransform))for(const t of e.preTransform)this.set(e.key,t(r,this.root));else this.set(e.key,e.preTransform(r,this.root));r=this.get(e.key)}if(e.rules)if(Array.isArray(e.rules))for(const t of e.rules){const e=t(r,this.root);if(!0!==e)return e}else{const t=e.rules(r,this.root);if(!t)return t}if(e.postTransform)if(Array.isArray(e.postTransform))for(const t of e.postTransform)this.set(e.key,t(r,this.root));else this.set(e.key,e.postTransform(r,this.root))}}return!0}copy(){return JSON.parse(JSON.stringify(this.root))}each(t){this.forEach(t)}forEach(t){this.keys().forEach(e=>{t(this.get(e),e,this.root)})}includes(t){return void 0!==this.findKey(e=>e===t)}every(t){return this.keys().every((e,r,o)=>t(this.get(e),e,o))}all(t){return this.every(t)}some(t){return this.keys().some((e,r,o)=>t(this.get(e),e,o))}any(t){return this.some(t)}merge(t,e=!0){PTree.from(t).each((t,r)=>{(void 0===this.get(r)||e)&&this.set(r,t)})}}exports.default=PTree;