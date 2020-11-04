
var sack = require( "sack.vfs" );
const JSON = sack.JSON6;
try {
var taskConfig = require( "./tasks.json6" );
} catch( err ) {
	console.log( "You need a tasks.json6 config.", err );
}
var tasks = {};

var myName = "Task Monitor";
if( process.argv > 2 ) {
	myName = process.argv[2];
}

const admin = ['FT61QtkxPd9$kjo2Sd4N85tsW_cYtFLcbPlROKdJu$k='];

var remotes = [];
const monitor = {
	serviceAvailable(name) {
		var task = taskConfig.find( task=>{
			task.serviceName === name;
		})
		if( task ) {
			RelinkThing( l, "ready", task );
			task.flags.bWaitForReady = 0;
			task.flags.bStarted = 1;
			// at this point dependant tasks will be able to start...
			LoadTasks();
		}
	},
	subscribe(ws) {
		remotes.push(ws);
		var states = [];
		taskConfig.forEach( task=>status.push( getTaskState( task ) ) );
		var outmsg = { op:"taskStates", tasks:status };
		ws.send( JSON.stringify(outmsg));
	},
};

console.log( "Hello from Task Monitor script" );

const remoteRequire = require( "myRequire.js" );
module.exports = exports = monitor;
remoteRequire.provide( "./taskMon.js", monitor );

function getTaskState( task ) {
	const remoteRequire = require( "myRequire.js" );
	var state = { name:task.name,
		waiting: task.flags.bWaiting,
		ready : task.flags.bReady,
		schedule: task.flags.bScheduled,
	};
	return state;
}

function sendState( task, state ) {
	remotes.forEach( ws=>{
		ws.send( JSON.stringify( {op:"state", task:task.name, [state]:state }) );
	})
}

function processConfig() {
	//console.log( "config:", taskConfig );
	taskConfig.forEach( (task,id)=>{
		tasks[task.name] = task;
		task.id = id;
		task.requiredBy = [];
		task.requires = [];
	    task.spawns = [];
		task.last_launch_time = 0;
		task.restart = task.restart || false;
		task.suspend = task.suspend || false;
		task.flags =  {
			bStarted :0,
			bFailedSpawn :0,
			bStopped :0, // task has been terminated - presumably during our exit-path... a
			bTooFast :0, // re-starts happen tooo fast... this stops bad tasks
			bTimeout :0, // indicates that the ready_timeout is set (might be 0)
			bRemote :0, // task is meant for a remote box...
			bScheduled :0,
			bScheduling :0,
			bWaiting :0, // waiting for WHOAMI (so we can start launching tasks again)
			bWaitForStart :0, // waiting for IM_STARTING
			bWaitForReady :0, // waiting for IM_READY
			bWaitAgain :0,
			bExclusive :0, // when this is running, no other task may be running
		};
		task.next = null;
		task.me = null;
		task.meName = null;
	} )
	taskConfig.forEach( task=>{
		if( task.require )
		task.require.forEach( (req,n)=>{
			tasks[req].requiredBy.push( task );
			task.requires[n] = tasks[req];
		} );
	
	} )
}


var l = {
	suspend : false,
	spawnActive : false,
	choked : null,
	schedule : null,
	ready : null,
	current_task : null,
}

function relinkThing( list, listMember, item ) {
	if( item.me ) {
		//console.log( "unlink from", item.meName, "into", listMember )
		if( item.me[item.meName] = item.next ) { item.next.me = item.me; item.next.meName = item.meName; }
	}
	if( list[listMember] ) {
		list[listMember].me = item;
		list[listMember].meName = "next";
	}
	item.next = list[listMember];
	list[listMember] = item;
	item.me = list;
	item.meName = listMember;
}

function scheduleTask( task )
{
	var tick;
	if( !task )
		return;
	if( task.restart )
	{
		if( task.spawns.length ) {
			console.log( task.name, "already spawned..." );
			return;
		}
	}
	if( task.suspend )
	{
		console.log( "Task suspended - not scheduling." );
		return;
	}
	if( task.flags.bScheduling )
	{
		console.log( "Task ", task.name, "is already being scheduled... circular dependancy?" );
		return;
	}
	task.flags.bScheduling = 1;
	tick = Date.now();
	if( task.last_launch_time )
	{
		if( ( tick - task.last_launch_time ) < task.minLaunchTime )
		{
			task.flags.bTooFast = true;
			console.log( `Choked restart of ${task.name}... ended ${tick - task.last_launch_time}ms ago... speed violation of ${task.min_launch_time}` );
			relinkThing( l, "choked", task );
			return;
		}
	}
	task.last_launch_time = tick;
	if( !l.suspend )
	{
		task.requires.forEach( req_task=>{
			if( !req_task.flags.bScheduled )
				ScheduleTask( req_task );
		} );
		_debug && console.log( "Scheduling", task.name );
		relinkThing( l, "schedule", task );
		task.flags.bScheduled = true;
	}
	task.flags.bScheduling = false;
}

//--------------------------------------------------------------------------

function scheduleTasks()
{
	if( !l.suspend )
	{
		taskConfig.forEach( task => {
			_debug && console.log( "Scheduling (initial)... ", task.name );
				scheduleTask( task );
		} );
	}
}


function go() {
	scheduleTasks();
}

processConfig();
go();
LoadTasks();

//---------------------------------------------------

function KillDependants( task )
{
	// this small bit of code needs to be recursive...
	// so that we kill all dependants of dependants of this task...
	//console.log( "A GOOD TASK IS DEAD!" );
	task.requiredBy.forEach( (dependant)=>{
		console.log( "Terminating dependant program %s", dependant.name );
		//dependant.flags.bStopped = 1;
		dependant.spawns.forEach( info=>
		{
			console.log( "begin terminate" );
			info.terminate();//TerminateProgram( info );
			console.log( "done terminate" );
		});
	} );
}

//--------------------------------------------------------------------------

function WaitingForDependancies(  task )
{
	return task.requires.find( required=>{
		// if it's opional, and the launch failed... not waiting
		// bfailedspawn is worse than btoofast
		//console.log( `${task.name} requires ${required.name} ${required.flags.bOptional} ${required.flags.bFailedSpawn} ${required.flags.bStarted}`)
		if( required.flags.bOptional &&
			required.flags.bFailedSpawn )
			return 0;
		if( !required.flags.bStarted )
		{
			return 1;
		}

	})
}

//--------------------------------------------------------------------------

function taskStartWait( task ) {
	//console.log( "Done waiting... result?" );
	// may have ended before this ticks.
	if( task.flags.bWaiting )
	{
		//console.log( "Task %s appears to not be summoner aware.\n", task.name );
		//console.log( "Forcing start...\n" );
		task.flags.bWaiting = 0;
		task.flags.bStarted = 1;
		relinkThing( l, "ready", task );
		_debug && console.log( "Task became ready; do loadTasks pass()")
		LoadTasks();
		//WakeThread( l.pLoadingThread );
	}
}


function LoadTasks()
{
	var  started;
	var task;
	//l.pLoadingThread = MakeThread();
	do
	{
		var nextTask;
		started = 0;
		if( l.spawnActive )
		{
			console.log( "spawning..." );
			return;
		}
		// don't load anything while suspended
		if( l.suspend )
		{
			console.log( "suspended." );
			return;
		}
		if( false ) {
			console.log( "Schedule Contains:");
			for( task = l.schedule; task; task = task.next )
				console.log( task.name )
		}
		for( task = l.schedule; task; task = nextTask )
		{
			var task_info;
			nextTask = task.next;
			// next task in for loop.
			if( l.spawnActive )
				if( task.flags.bStarted )
				{
					console.log( "Task started... and still in list?" );
					//DebugBreak();
					UnlinkThing( task );
					continue;
				}
			if( task.flags.bWaiting )
			{
				continue;
			}
			if( WaitingForDependancies( task ) )
			{
				continue;
			}
			//if( task.args ) task.args.forEach( p=>	console.log( "Arg:", p ) );

			task.flags.bWaiting = 1;
			task.launch_count++;
			// this should only contain one thing,
			// however for ease of moving this node
										// from list to list, this should be regarded as a list.
			//DebugBreak();
			relinkThing( l, "current_task", task );
			l.spawnActive = 1;
			started++;
			task.last_launch_time = Date.now();
			var task_info = startTask( task );
			if( task_info.isRunning() )
			{
				task.spawns.push( task_info );
				function wait(task) {
					setTimeout( ()=>taskStartWait(task), task.assumeReadyIn )
				} wait(task);
			}
			else
			{
				console.log( "failed spawn", task.name, task );
				// task ended callback may still get invoked?
				//console.log( "in fact, END TASK may have already been invoked, but WILL definatly get invoked." );
				task.flags.bFailedSpawn = 1;
 			}
			l.spawnActive = 0;
		}
	} while( started );
	_debug && console.log( "Done with a pass to load tasks." );
}

LoadTasks();

//--------------------------------------------------------------------------

function startTask( task ) {
	var taskInfo = {
		bin:task.program,
		args:task.args,
		work:task.path,
		binary:false,
		input:taskOut,
		end:taskEnded
	}

	// LPP_OPTION_DO_NOT_HIDE|LPP_OPTION_NEW_GROUP
	var task_info = sack.Task( taskInfo );
	_debug && console.log( "Started:", task_info, task.name );

	function taskOut( buffer ) {
		var now = new Date().toISOString();
		var lines = buffer.split( "\n" );
		lines.forEach( line=>{
			if( !line.length ) return;
			//console.log( "buffer end:", buffer.charCodeAt( buffer.length-1), buffer.charCodeAt( buffer.length-2))
			console.log( now +" " +task.name + ":" + line );
		})
		remotes.forEach( ws=>{
			ws.send( `{op:"output",task:"${JSON.escape(task.name)}",data:"${JSON.escape(buffer)}"`);
		});
	}

	function taskEnded( )
	{
		//uintptr_t psv, PTASK_INFO task_ended
		console.log( "Task ", task.name," has exited." );
		//console.log( "finding task info in task.spawns %p %p", &task.spawns, task_ended );
		if( task.flags.bWaiting )
		{
			console.log( "Task %s exited while we were waiting for it to begin.\n", task.name );
			task.flags.bFailedSpawn = 1;
		 }
		if( task.flags.bWaitForStart || task.flags.bWaitForReady )
		{
			console.log( "Task got a little further but still died before it began...\n" );
			console.log( "It appears to be slightly summoner aware.\n" );
			task.flags.bFailedSpawn = 1;
		}
		//_debug && 
		console.log( "last spawn is %d %d %d"
				 , task.flags.bStopped
				 , task.restart
				 , task.flags.bFailedSpawn
				 , endedTaskIndex
				 );
	
		_debug && console.log( "this task is ", task.name, task.spawns, task_info );
		task.flags.bWaiting = 0;
		task.flags.bStarted = 0;
		var endedTaskIndex = task.spawns.findIndex( spawn=>spawn===task_info);
		console.log( "found taskinfo?", endedTaskIndex )
		if( endedTaskIndex >= 0 )
		{
			console.log( "Killing dependants", task.spawns );
			KillDependants( task );
			console.log( "Delete from spawn" );
			task.spawns.splice( endedTaskIndex, 1 );
			console.log( "task.spawns : ", task.name, task.spawns.length );
			if( !task.flags.bStopped
				&& task.restart
				&& !task.flags.bFailedSpawn ) {
					console.log( "Re-schedule task that ended..." );
				scheduleTask( task );
				LoadTasks();
			}
			//console.log( "wake loader" );
			//WakeThread( l.pLoadingThread );
			//DebugBreak();
		}
		else
		{
			console.log( "Task not found as tracked spawn...not started? why am I here?" );
			//DebugBreak(); // this should basically NEVER happen.
			// if I didn't get a task_info, then this routine will NOT be
			// called.
		}
	}
	return task_info;	
}


//--------------------------------------------------------------------------

function UnloadTask( task, bShutdown )
{
	KillDependants( task );
	console.log( "Terminating program ", task.name );
	task.flags.bStopped = bShutdown;
	task.spawns.forEach( info=>{
		console.log( "begin terminate" );
		info.terminate();//TerminateProgram( info );
		console.log( "end terminate" );
	})
}

function UnloadTasks( )
{
	taskConfig.forEach( task=>{
		UnloadTask( task, TRUE );
	})
}

//--------------------------------------------------------------------------

// this is done by the task module, but there's no order in
// in that; this terminates dependants before their dependency
function ATEXIT_DoUnloadTasks()
{
	UnloadTasks();
}

