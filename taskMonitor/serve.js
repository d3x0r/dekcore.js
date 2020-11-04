
const vfs = require( 'sack.vfs');
const vol = vfs.Volume();
const path = require( 'path' );
const config = require( "./config.js" );


const _debug = false;

module.exports = exports = function( internal, req, res ) {

	var filePath;
	filePath = config.run.defaults.webRoot + unescape(req.url);
	if (filePath === config.run.defaults.webRoot + ''
		||filePath === config.run.defaults.webRoot + '/'
		||filePath === config.run.defaults.webRoot + '.'
		||filePath === config.run.defaults.webRoot + './'
		) 
	filePath = './ui/index.html';
	console.log( "Serve:", filePath );
	_debug && console.log( "Request is from:", req.connection.remoteAddress );
				// req.connection.remotePort
				// req.headers.origin?  // not impelmented yet for sure in request
	var extname = path.extname(filePath);
	var contentType = 'text/html';
	switch (extname) {
		  case '.js':
			  contentType = 'text/javascript';
			  break;
		  case '.css':
			  contentType = 'text/css';
			  break;
		  case '.json':
			  contentType = 'application/json';
			  break;
		  case '.png':
			  contentType = 'image/png';
			  break;
		  case '.jpg':
			  contentType = 'image/jpg';
			  break;
		  case '.wav':
			  contentType = 'audio/wav';
			  break;
	}
		
		
	_debug && console.log( "serving a relative...", req.url, filePath );
	if( vol.exists( filePath  ) ) {
		var content;
		if( filePath.endsWith( ".js.html" ) )
			content = process( req, vol.read( filePath ).toString() );
		else {
			var tmp = vol.read( filePath );
			if( tmp )
				content = tmp;//.toString();
			else {
				res.writeHead(404);
				res.end('<HTML><head><script src="userAuth/unauthorized.js"></script></head></HTML>');
										return;
			}
		}
		res.writeHead(200, { 'Content-Type': contentType });
                //console.log( "send buffer...", content );
		res.end(content);
		_debug && console.log( "serve.js:ending with success...", content.length );
	}
	else{
		_debug && console.log( "exists on", filePath, "is false.")
		res.writeHead(404);
		res.end('<HTML><head><script src="userAuth/unauthorized.js"></script></head></HTML>');
	}
}

function process( HTML ) {
	var page = eval("`"+HTML+"`");
	return page;
}

// define this.session and this.bodyCGI.sesskey
const session_header = '${(function(_this) {                                     \
	if( _this.content ) {                                                    \
		_this.bodyCGI = _this.content.split( "&" ).reduce( (acc,line)=>{ \
			line = line.replace( /[\+]/g, " " );                     \
			var l=line.split( "=" );                                 \
			if( l[0].includes("%") )                                 \
				l[0] = decodeURIComponent(l[0]);                 \
			if( l[1].includes("%") )                                 \
				l[1] = decodeURIComponent(l[1]);                 \
			acc[l[0]]=l[1]; return acc; }, {} );                     \
	}                                                                        \
	_this.bodyCGI = _this.bodyCGI || { sesskey:idGen.generator() };          \
	_this.session = sessions.get( _this.bodyCGI.sesskey );                   \
	if( !_this.session ) {                                                   \
		_this.session = {                                                \
			created : Date.now()                                     \
			, updated: Date.now()                                    \
			, connection: _this.connection                            \
		};                                                               \
		sessions.set( _this.bodyCGI.sesskey, _this.session );            \
	}                                                                        \
        else {                                                                   \
		if( _this.connection.remoteAddress !== _this.session.connection.remoteAddress ) { \
                        return "<SCRIPT>location.href = location.href;</SCRIPT>";  \
		}                                                                \
        }                                                                        \
	_this.session.updated = Date.now();                                      \
	return "";                                                               \
})(this) }\n';


function process( ThisState, HTML ) {
	if( HTML.includes( "\\" ) ) HTML = HTML.replace( /[\\]/g, "\\\\`" );
	if( HTML.includes( "`" ) ) HTML = HTML.replace( /[`]/g, "\`" );
	//n> var tstr = "${this.x}?"; new Function("return `" + tstr + "`").call({x:1})
	try {
		//console.log( ["return `",session_header,HTML,"`"].join("") )
		var page = new Function( "idGen", "sessions", ["return `",session_header,HTML,"`"].join("")).call( ThisState, idGen, sessions );
	} catch( err ) {
		console.log( "Fault:", err, err.toString() );
		return err.toString();
	}
	return page;
}

// delete sessions that have been unused for 1 hour.
function timeoutSessions() {
	var now = Date.now();
	sessions.forEach( (val,key,map)=>{
		if( now - val.updated < ( 4 * 15 * 60 * 1000 ) )
			sessions.delete( key );
	} );
	setTimeout( timeoutSessions, 5 * 60 * 1000 );
}
timeoutSessions();
