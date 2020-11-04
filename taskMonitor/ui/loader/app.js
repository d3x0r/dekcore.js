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

function initApp() {
	login.requestService( "chatment.taskmonitor", monitor.handler );
}



function resetLoginStatus() {
	layout.login.status.innerText = "";
}


