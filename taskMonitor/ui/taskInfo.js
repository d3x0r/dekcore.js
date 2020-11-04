

function initTaskMonitor() {

        function getTaskState( task ) {
                if( task.ready ) return "Ready";
                return ""+task;
        }

        function makeTaskBlock( task ) {
                var block = { frame: document.createElement( "div" ),
                        state : null,
                        log : null,
                };
                block.className = "taskInfo";
                block.innerHTML =  `
                        <SPAN class="taskInfoHeader">Name</SPAN><span class="taskInfoDetail">${task.name}</SPAN><BR>
                        <SPAN class="taskInfoHeader">Status</SPAN><span ID="state" class="taskInfoDetail"></SPAN><BR>
                        <DIV class="taskLog" ID="log"></DIV>
                        `;
                block.state = querySelector(`[id="state"]`)
                block.log = querySelector(`[id="log"]`)
                return block;
        }


        function taskMonitorHandler( msg, data ) {
                if( !msg ) {
                        // request failed...
                        l.serverStatus.push( { msg:"Disconnected during request", at:new Date() } );
                        login.status.innerText = "Disconnected during request";
                        setTimeout( resetLoginStatus, 3000 );

                        console.log( "Fail:", data );
                        return;
                }
                
                if( msg.op === "task" ) {
                        
                }
        }


        return { 
                handler: taskMonitorHandler
        };
}