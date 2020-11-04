"use strict";


const layout = {
	defaultError: {page: document.getElementById("defaultError") },
	login: {
		page: document.getElementById("loginPage"),
	},
};

var login = initLogin();
var monitor = initTaskMonitor();
setTimeout( initApp, 0 );

var visible = layout.defaultError.page;
function switchPage( page ) {
	var newPage = page;

	if( !protocol.loggedIn ) {
		if( newPage !== layout.login.page && newPage !== layout.messages.page )
			newPage = layout.login.page;
	} 

	if( newPage && newPage.onChange)
		newPage.onChange();

	if( newPage !== visible ) {
		visible.style.visibility = "hidden";
		(visible= newPage).style.visibility = "visible";
	}

}

function initApp() {
	if( window.parent !== window ) {
		protocol.setAuth( window.parent.loginService.getAuth() )
		l.messageControl.recv( "got auth socket...", new Date() );

		l.wsTaskMon = protocol.request( "chatment.taskmonitor", null, null, chatHandler );
		l.messageControl.recv( "Requested chat from protocol auth socket...", new Date() );
	} else
		protocol.connect(messageHandler);

	switchPage( layout.login.page );
	login.requestService( "chatment.taskmonitor", monitor.handler );
}

function messageHandler(msg) {
	//console.log( "handle event:", msg );
	switch (true) {
		case msg.op === "status":
			login.showStatus( msg.status );
			console.log( "status:", msg.status );
			break;
		case msg.op === "login":
			//switchPage( layout.login.page );
			console.log( "login ready" );
			break;
	}
}


function resetLoginStatus() {
	layout.login.status.innerText = "";
}


