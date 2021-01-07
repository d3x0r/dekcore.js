var Stream = module.exports = require('./Stream.js');

Stream.Readable = require('./Readable.js');
Stream.Writable = require('./Writable.js');
Stream.Duplex = require('./Duplex.js');
Stream.Transform = require('./Transform.js');
//Stream.PassThrough = require('./Passthrough');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;