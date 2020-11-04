
"use strict";
//const _debug = false;

module.exports = exports 

var tmp;
var config = config || { run : { Λ : localStorage.getItem( "devkey" ) || (localStorage.setItem("devkey", tmp = idGen.generator() ),tmp) } }
var protocol = {
	connect : connect,
	setAuth : setAuth,
	login : login,
	request : requestService,
	connected : false,
	loggedIn : false,
	username : null,
	userkey : null,
	passAuth0(auth0) { 
		wsAuth = auth0; 
		// generate login event to get kchat
	},
	requestKey(ident,cb) { wsAuth.requestKey( ident,cb )},
};
const _protocol = protocol;
var connectEventHandler;

if( typeof localStorage === "undefined" ) { 
	//window.localStorage;
	window.localStorage = localStorage || { 
	   getItem( path ) { return sack.Sqlite.op( path, "" ) },
	   setItem( path,val ) { sack.Sqlite.so( path, val ) }
	}
}

if( typeof global != "undefined" ) {
var sack = global.sack;
if( !sack ) sack = require( "sack-gui" );
var u8xor = sack.u8xor;
const JSON6 = sack.JSON6;
const WebSocket = sack.WebSocket.Client;
const config = require( "./lib/config" );
JSON = JSON6;

} else {
//var u8xor = sack.u8xor;
	JSON = JSON6;
	
}

var peer = `wss://${location.hostname}:8000/`;

function connect(cb) {
	//console.log( "calling connect?" );
	connectEventHandler = cb;
	openSocket( "chatment.core", 0, cb );
}

function setAuth( ws ) {
	wsAuth = ws;
	protocol.username = ws.username;
	protocol.userid = ws.userid;
	stage = 1;
}

var redirect = null;
var https_redirect = null;
var connections = 0; // how many times a connection was attempted

var wsAuth;

var loginCallback;
var secureChannel = false;

var stage = 0;
var pendingServiceRequest = null;
var currentProtocol = "";
var passkey = "";
var timeoutAuth;

function openSocket( protocol, _stage, cb ) {
	var mykey = { key:idGen.generator(), step:0 }
	var myreadkey = { key:mykey.key, step:1 }
	if( !_stage )
		stage = 0;
	var connected = false;
	var ws;
	if( stage && !redirect )
		console.log( "Need to re-request service....", protocol, stage)
	connections++;
	cb( { op:"status", status:"connecting " + protocol } );
	try {
		ws = new WebSocket( (_stage == 0?peer:redirect)
			, protocol
		);
		redirect = null;
		if( _stage === 1 )
			wsAuth = ws;
		/*
		else if( _stage === 2 )
			wsChat = ws;
		else if( _stage === 3 ) {
			wsChat.storage = ws;
			wsChatStorage = ws;
		}
		*/
	} catch( err ) {
		console.log( "CONNECTION ERROR?", err );
		return;
	}
        //console.log( "Got websocket:", ws, Object.getPrototypeOf( ws ) );

	function startup() {
		var key = localStorage.getItem( "clientKey" );
		//console.log( "key is:", typeof key, key );
		var skey = localStorage.getItem( "sessionKey" );
		if( !key && _stage === 0 ) {
			//console.log( "need key..." );
			ws.send( '{op:"getClientKey"}' );
		} else {
			if( _stage == 0 ) {
				//console.log( "request auth0" );
				ws.send( "AUTH" );
				timeoutAuth = setTimeout( ()=>{
			        cb( { op:"status", status: " AUTH not responding..." });
					console.log( "Auth timed out..." );
				}, 5000 );
			} else {
				//_debug && 
				//console.log( "Send passkey to requested service" );
				ws.send( passkey );
				//if( pendingServiceRequest ) {
					ws.send( `{op:"hello"}` );
				//}
			}
		}
	}

	ws.onopen = function() {
        	connected = true;
	        cb( { op:"status", status: (_stage?"Auth":"Port") + " Opened...." });
		// Web Socket is connected. You can send data by send() method.
		//ws.send("message to send");
		//console.log( "key is", mykey );
		//console.log( "keys:", key, skey );
		ws.send( mykey.key );
		ws.send = ((orig)=>(msg)=>{ orig( u8xor( msg,mykey))})(ws.send.bind(ws));
		startup();
	};
	ws.onmessage = function (evt) {
		//console.log( "got:", evt );
		var tmpmsg = u8xor( evt.data, myreadkey );
		//console.log( "got:", tmpmsg );
		var msg = JSON.parse( tmpmsg );
		if( !msg ) return;
		//console.log( "got message:", stage, msg );
		if( _stage > 0 ) {
			if( msg.op === "addMethod" ) {
				try {
					var f = new Function( "JSON", "config", "localStorage", "idGen", msg.code );
					f.call( ws, JSON, config, localStorage, idGen );
					if( pendingServiceRequest ) {
						var tmp = pendingServiceRequest;
						pendingServiceRequest = null;
						//console.log( "and so... invoke callback" );
						tmp( { op:"connected", ws:ws } );
					}
					
					if( "setEventCallback" in ws )
						ws.setEventCallback( cb );
					else if( _stage === 1 ) {
						cb( {op:"login"} );
					}
				} catch( err ) {
					console.log( "Function compilation error:", err,"\n", msg.code );
				}
				
			}
			else {
				if( this.fw_message )
					this.fw_message( ws, msg, tmpmsg );
			}
		} else if( _stage == 0 ) {
			//console.log( "Layer0 message", msg );
			if( msg.op === "setClientKey" ) {
				//console.log( "Got key:", msg );
				localStorage.setItem( "clientKey", msg.key );
				startup();
				return;
			}

			if( msg.op === "redirect" ) {
				//console.log( "redirect and close this...", msg );
				//msg : { id:"bBjnnAjH65xkXsDDqptZDZDrxOCsOtMWrrtrQXriJUg=", port:16579, address:"198.143.191.26" }
				secureChannel = true;
				redirect = "wss://"+msg.address+":"+msg.port+"/";
				https_redirect = "https://"+msg.address+":"+msg.port+"/";
				passkey = msg.id;
				//console.log( "Layer0 redirect into system." );				
				if( _stage == 0 ) {
					ws.close();
					if( timeoutAuth ) {
						clearTimeout( timeoutAuth );
						timeoutAuth = null;
					}
				}
			}
		}
	};
	ws.onerror = function(err) {
		console.log( "Can I get anything from err?", err );
		if( _stage == 1 ) {
			//location.href=https_redirect;
		}
		if( !err.target.url.includes( "chatment.com" ) ) {
			location.href="https://chatment.com/rootcert.html"
		}
	}
	ws.onclose = function(status) {
		//console.log(" Connection closed...", status );
  	  	if( !connected ) {
			//console.log( "Aborted WEBSOCKET!", step, status.code, status.reason )
		        cb( { op:"status", status:"connection failing..." + [".",".",".","."].slice( 0, connections%4 ).join('') });
			setTimeout( ()=>{openSocket(protocol,_stage,cb)}, 5000 );
			return;
        	}
		connected = false;
		
                if( ( _stage == 0 || _stage == 2 ) && pendingServiceRequest ) {
					pendingServiceRequest(null);
					pendingServiceRequest = null;

                }
		mykey = { key:idGen.generator(), step:0 }
		myreadkey = { key:mykey.key, step:1 }
		//console.log( "CLOSED WEBSOCKET!", protocol, stage, status )
		if( redirect && _stage == 0 ) {
			openSocket( "Auth0", 1, cb );
			redirect = null;
		} else if( redirect && _stage >= 1 ) {
			if( _stage > 1 )
				console.log( "Cannot auto-reconnect; need to re-request service" );
			else
				openSocket( currentProtocol, stage = ++_stage, cb );
			redirect = null;
		} else {
			// stage 2 connection or non-redirect loss resets back to initial connect.			
			secureChannel = false;
			// reconnect this same protocol...
			_protocol.loggedIn = false;
	        cb( { op:"status", status: "Disconnected... waiting a moment to reconnect..." });
			cb( {op:"login"})
			setTimeout( ()=>{openSocket("chatment.core",0, connectEventHandler)}, 5000 );

		}
		// websocket is closed.
	};
}

function abortLogin( ) {
	if( loginCallback ) {
		loginCallback( false, "Timeout" );
		loginCallback = null;
	}
}


function login(user,pass, cb) {
	if( !loginCallback ) {
		if( stage !== 1 ) {
			if( stage > 1 )
				console.log( "already logged in?" );
			console.log( "Login is not ready yet..." );
			cb( false, "Login is not ready yet..." );
			return;
		}
		loginCallback = cb;
		if( ws && stage == 1 ) {
			//console.log( "Send login to auth0" );
			wsAuth.login( user, pass, (a,b,c)=>{loginCallback=null; cb(a,b,c) } );
			setTimeout( abortLogin, 5000 );
		}
	} else {
		console.log( "login already in progress" );
	}
}

function timeoutRequest() {
	if( pendingServiceRequest ) {
		pendingServiceRequest( { op:"status", status:"Service not available..." } );
		wsAuth.abortRequest();
		pendingServiceRequest = null;
	}
}

function requestService( service, user_id, password, cb ) {
	if( !pendingServiceRequest ) {
		currentProtocol = service;
		// callback after addMethod of anther connection happens.
		pendingServiceRequest = cb;
		// { msg: "login", user:user_id, pass:password, devkey: localStorage.getItem("clientKey") }

		function doRequest() {
			setTimeout( timeoutRequest, 5000 );
			wsAuth.request( service, function(msg) {
				//console.log( "got requested service:", service, msg )
				if( !msg ) {
					cb( false, msg.message );
					return;
				}
				// {op:"serviceReply", id:"B3D2Z$EvTox_9Pf$VAot8i6wC$JZPV0rHlW8zWAjIHQ=",port:32678,address:"198.143.191.26",service:"KCHATAdmin"}
				passkey = msg.id;
				redirect = "wss://"+msg.address+":"+msg.port+"/";
				https_redirect = "https://"+msg.address+":"+msg.port+"/";
				currentProtocol = msg.service;
				secureChannel = true;
				
				openSocket( msg.service, 2, cb );
				//ws.close(); // trigger connect to real service...
			} );
		}

		if( user_id && password ) {
			wsAuth.login( user_id, password, ( success, userid, username )=>{
				protocol.username = username;
				protocol.userid = userid;
				if( success ) {
					doRequest();
				} else {
					cb( { op:"status", status:userid } )
				}
			} )
		} else {
			if( wsAuth )
				doRequest();
			else
				cb( { op:"status", status:"Not Logged In" } );
		}
	} else {
		pendingServiceRequest( { op:"status", status:"Service request pending..." } );
	}
}

