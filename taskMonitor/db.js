

const vfs = require( 'sack.vfs');
const JSON = vfs.JSON6;

const fc = require( 'file_cluster.js');
const idGen = require( 'id_generator.js' );
fc.init();


var mydbConfig;
fc.cvol.readJSON( "startup.json", (config)=>mydbConfig = config );
if( !mydbConfig ) {
	fc.cvol.write( "startup.json", JSON.stringify( mydbConfig = { 
		dbKey:idGen.generator()
		, k:[idGen.generator(), idGen.generator()]
		}))
}

var dbVol;
try {
	dbVol = vfs.Volume( "taskDb", './core/'+mydbConfig.dbKey, mydbConfig.k[0], mydbConfig.k[1] );
} catch(err) {
	dbVol = vfs.Volume( "taskDb", './core/'+mydbConfig.dbKey, 1, mydbConfig.k[0], mydbConfig.k[1] );
}
const db = dbVol.Sqlite( "task.db" );

db.makeTable( `create table taskPermissions ( allowed char PRIMARY KEY )` );
db.makeTable( `create table systems( system char,
            `)
db.makeTable( `create table task ( task_id char PRIMARY KEY,
    owner char,
    name char,

    )`)