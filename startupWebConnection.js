const stream = await require( "stream" );
const g = this;

function localClientFilter(options) {
        this.ws = options.ws;
        options = options || {};
        options.decodeStrings = false;
                stream.Duplex.call(this,options)
    }
    var isPrompt = false;
    util.inherits(localClientFilter, stream.Duplex)

    localClientFilter.prototype._read = function( size ) {}
    localClientFilter.prototype.prompt = function( s ) {
        isPrompt = true;
        this.write( s );
    }

    localClientFilter.prototype._write = function( chunk, decoding, callback ) {
    if( this.ws.readyState === 1 ) 
	        this.ws.send( JSON.stringify( {op:'write', prompt:isPrompt, data:chunk.toString( 'utf8' )} ) );
        isPrompt= false;
        callback();
    }


return require("sack.vfs" ).then(sack=>{

    sack.WebSocket.Thread.accept(Λ,async (id,ws)=>{ 
        if( id !== Λ ) {
            console.log( "Accept key is not correct?", id, Λ );
            return false;
        }
        const shellCommands = await require( "./Sentience/shell.js");
        const shell = (shellCommands).Filter( this );
        var nl;

        await require(  './command_stream_filter/strip_newline.js' ).then( (newline)=>{
                nl = newline.Filter();
                var output = new localClientFilter({ws:ws});
                //var cmd = commandFilter.Filter();
                g.io.output = (out)=>{
                    output.write( out );
                }
                g.io.prompt = (prompt)=>{
                    output.prompt(prompt);
                }
                //nl.connectInput( process.stdin );
                nl.connectOutput( shell.filter );
                shell.connectOutput( output );
        }).catch(err=>console.log( "SOMSDFLKSDJFLKJ:", err))
    
			let lastTick = Date.now();
			function tick() {
				const now = Date.now();
				if( ( now - lastTick ) > 30000 ){
					lastTick = now;
					ws.ping();
				}
				setTimeout( tick, 15000 );
    		}
			tick();
        //console.log( "Setup message handeler..." );        
        ws.onmessage( function( msg ) {
				lastTick = Date.now();
            // this goes out the socket that a message has come in on?
            // only this thread is different than the receiving thread.
            //console.log( "Got message:", msg );
            var msg_ = JSOX.parse( msg );    
            if( msg_.op === "write" ) {   
                nl.write( msg_.data );
            }  
        } );  
        ws.onclose( function() {  
                //console.log( "Remote closed" );  
        } );
        ws.resume();
        // after this point, can log... 
    });
    
})

