// This source is loaded, and appended with sandboxPrerun.js

import {u8xor} from "../util/u8xor.mjs"
import * as idGenModule from "../util/id_generator.mjs" 
const idGen = idGenModule.generator;

const pendingInit = [];
var initDispatched = false;
/*
function Function() {
    throw new Error( "Please use other code import methods.");
}
function eval() {
    throw new Error( "Please use other code import methods.");
}
*/

const sandbox = {
    Λ : localStorage.getItem( "Λ" )/*Λ*/
	, config : null
	, sandbox : null
	, Function : Function
	, eval: eval
	, require(a) {
			return import(a);
			//require
		}
	, module:null//module
	, storage: null // privateStorage
	, disk : null
	, nativeDisk : null //physicalDisk
	, console:console
	, idGen : idGenModule
	, _setTimeout : setTimeout
	, _clearTimeout : clearTimeout
	, _setInterval : setInterval
	, onInit(cb) {
	    if( initDispatched)cb();
	    else pendingInit.push(cb);
	}
	//, Buffer: Buffer
	, vmric(a,b) {
		const f = new Function( a );
		f.call( sandbox, b );
		//vm.runInContext(a,sandbox,b)
	} 
	//, crypto: crypto
	//, config(...args) { returnpost("config",...args); })(); }  // sram type config; reloaded at startup; saved on demand
};
//console.log( "Adding u8xor?", sandbox.idGen );
sandbox.sandbox = sandbox;

/* Seal Sandbox */
["require","eval", "Function", /*"module",*/ "console", "process", /*"require",*/ "sandbox", "fs", "vm"].forEach(key => {
    if( key in sandbox )
	    Object.defineProperty(sandbox, key, { enumerable: false, writable: true, configurable: false });
});
	

