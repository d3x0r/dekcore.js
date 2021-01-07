
var stream = require('stream')
var util = require('util')

class Grep extends stream.Transform {
constructor(pattern) {
  super();

  this.pattern = pattern
}

_transform (chunk, encoding, callback) {
	// chunk is given as 'buffer' and is a buffer
	//console.log( chunk );
	//console.log( encoding );
	//var string = chunk.toString()
	console.log( `transform called with ${chunk}   ${string}` );
  	if (string.match(this.pattern)) {
		this.push(chunk)
        }

	callback()
}
}



var grep = new Grep(/foo/)
process.stdin.pipe(grep)
grep.pipe(process.stdout)


