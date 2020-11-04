
var myName = "chatment.taskmonitor";
if( process.argv > 2 ) {
	myName = process.argv[2];
}

const vfs = require( 'sack.vfs');
const nativeVol = vfs.Volume();

const monitor = require( "./taskMon.js" );
const serve = require( "./serve.js" );


const certGen = require( "util/keyMaster/keyServiceRemote.js" );
const https = require( "/https_server.js" );
https.certGen = certGen;
https.serviceName = myName;

const firewall = require( "util/firewall/firewallServiceRemote.js" );
const idGen = require( 'id_generator.js' );

const taskMonitorExtensions = nativeVol.read( "remoteMethods.js" ).toString();
const jsonTaskMonitorExtensions = JSON.stringify( taskMonitorExtensions );

const serviceIdMap = new Map();
var mySid = null;
var userDb;
const connectionKeys = new Map();

certGen.init( config.run.identity.raddr.address+":"+config.run.identity.parts[3], ()=>{
	https.addProtocol( myName, (conn)=>{
		// keep connection and auto timeout for idle?
		conn.on( 'message',(_msg)=>{
			if( !conn.connKey ) {
				var connKey = connectionKeys.get( _msg );
				if( !connKey ) {
					//firewall.
					console.log( "bad connection key.");
					conn.close();
					return true;
				}
				if( !userDb ) {
					conn.send( `{op:"error", message:"User database down."}`)
					conn.close();
					return true;
				}
				var userConn = getConnection( connKey.username );
				if( !userConn ){
					users.set( connKey.username, userConn={ pending:[], id:0, sent:0, read:0,from:new Date(),connections:[] } );
				}
				connKey.connections = userConn;
				userConn.connections.push( conn );
				conn.connKey = connKey;
				userConn.read += _msg.length;
				connectionKeys.delete( conn.connKey.id );
				// override send to count bytes sent
				conn.send =  ((orig)=>(buf)=>{
					if( conn.readyState == WS.OPEN ) {
						orig(buf);
						conn.connKey.connections.sent += buf.length;
					}// else throw new Error( "Connection is not open:" + conn.readyState + " while sending:" + buf );
				})(conn.send.bind(conn));
				return true;
			}
			try {
				conn.connKey.connections.read += _msg.length;
				var msg = JSON.parse( _msg );
			} catch(err) {
				console.log( "mesage parsing error:", err, "for message:", _msg );
				conn.close();
				return false;
			}
			//console.log( "userDatabase got", msg );
			if( msg.op == "hello" ) {
				conn.send( `{op:"addMethod",code:${jsonTaskMonitorExtensions}}` );
				return true;
			} else 
				if( handleMessage( conn, msg ) ) {
					return true;
				}else {
					console.log( "User Database PROTOCOL ERROR:", _msg );
				}
			return false;
		})
	} );

	_debug && console.log( "call firewall.Init (opening:", config.run.identity.raddr.address + ":" + config.run.identity.parts[3] )
	// firewall is used in this module in order to get the target
	// AUTH service, does not allocate a port.
	//console.log( Object.keys( firewall ) );

	firewall.setOnServiceRegistered( serviceAvailable );

    const externalIP = config.run.addresses[0].address;
    const internalIP = config.run.internal_addresses[0].address;
        
	firewall.init( externalIP, internalIP, config.run.identity.raddr.address + ":" + config.run.identity.parts[3]
    		, addMapping
			, handleMessage
			, ()=>{
		//x( parts[2], parts[3], raddr );
		firewall.allocateInternalPort( myName, (port, sid)=>{
            mySid = sid;
            
		 	//firewall.addMethod( userDatabaseExtensions );
				
			console.log( "And now we can start a https/websocket service" );
			https.Server("no.domain"
					, port // use assigned port
					, true // serve on internal addresses
					, serve // no content server
					, ()=>{	sack.loadComplete(); console.log( "task Monitor READY." );
						firewall.serviceAvailable( mySid );
			});
		} );
	} );
} );

function addMapping( id, options ) {
	if( options )  {
		// this is expecting an incoming authenticated application....
		console.log( "AddMapping got options:", options );
		let userinfo;
		//var userkey = transformUser( options.user );

		connectionKeys.set( id, userinfo = { id:id
				, client_id: options.client_id 
				, username: options.user
		} );
	} else  {
		console.log( "mapped witoutlogin? this would be another task monitor...? but even then Ishould send some options." );
	}
}

function handleMessage( ws, msg, _msg){
    if( msg.op === "getContent" ) {
        var data = vol.read( filePath );
        var outmsg = { op:"content", data:data };
        ws.send( JSON.stringify(outmsg))
    } else if( msg.op === "subscribe") {
        monitor.subscribe( ws );
    }
    return true;
}

function mapClientId( client_id ) {
	serviceIdMap.forEach( (map,key)=>{
		map.set( idGen.regenerator( clie))
	})
}


function serviceResult( service ) {
	//console.log( "Log sotry short, now have userdatabsae." );
	//console.log( "setup user database .....")
	userDb = service;
	userDb.service_id = myName;
/*
	if( (!readySent) && userDb && groupCore && chatCore )  {
		readySent = true;
		firewall.serviceAvailable( mySid );				
	}
*/

}

function serviceAvailable( service,sid,system ) {
    monitor.serviceAvailable(service); // there's not a good way to match this on a large system.
	console.log( "Service has become available... ", service, sid, system );
	if( service === "userDatabase" ) {
		firewall.requestService( "userDatabase", serviceResult )
		return;		
	}
	if( service === myName ) {
		if( mySid !== sid ) {
            console.log( "Another task monitor is online...." );
			firewall.elect( service, mySid, service.id );
			firewall.requestService( service, service=>{
				primaryUserDb = service;
				console.log( "sync with primary database" );
				primaryUserDb.sync( ()=>{
					
				} );
			} );
		}
		//} else
		//	pendingElects.push( service.id );
	}
//	if( !serviceIdMap.get( service )  ){
//		serviceIdMap.set( service, new Map() );
//	}
//	if( service === "groupCore") {
//		firewall.requestService( service, service=>{gCore=service} );
//	}
}
