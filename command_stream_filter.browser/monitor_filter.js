
exports.Filter = Filter;

var stream = /*await*/ require('./browser-stream/index.js');

class parse extends stream.Transform
{
	constructor(pattern,options) {
		super();
	  options = options || {};
	  options.decodeStrings = false;
	  stream.Transform.call(this,options)

	  this.pattern = pattern
	}

	_transform = function(chunk, encoding, callback) {
	// chunk is given as 'buffer' and is a buffer
	console.log( `monitor : [${encoding}]${chunk}` );
	console.log( chunk );
	//console.log( `transform called with ${chunk}   ${string}` );
	this.push( chunk );
	callback()
}

   }

function	Filter() {
	var tmp = {
        	filter : new parse()
        	, connectInput : function(stream) { 
                	stream.pipe( this.filter );
                }
                ,connectOutput : function(stream) { 
                	this.filter.pipe( stream );
                } 
        };
        return tmp;

}



