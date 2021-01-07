
exports.Filter = Filter;

var stream = /*await*/ require('./browser-stream/index.js');
var filter_base = await require( "./filter_base.js")
class trim_newline extends stream.Transform {

constructor(options) {
    options = options || {};
    options.decodeStrings = false;
    stream.Transform.call(this, options);
}

_transform (chunk, encoding, callback) {
	// chunk is given as 'buffer' and is a buffer
	var string = chunk.toString();
	//console.log( "newline:", string );

	if( ( string.lastIndexOf( "\r\n" ) === string.length-2 )||( string.lastIndexOf( "\n" ) === string.length-1 ) ) {
        	var newstr = string.replace( /\n|\r\n/, "" )
		//console.log( "stripped return" );
		this.push( newstr );
		//console.log( `transform called with ${newstr}...` );
	}
	else {
		this.push( chunk );
    }
	callback()
}

}

function Filter() {
	return filter_base.Filter(  new trim_newline() );
}

