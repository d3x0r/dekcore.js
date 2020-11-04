

function initLogin() {
	var login= {
		page: document.getElementById("loginPage"),
		account: document.getElementById("account"),
		password: document.getElementById("password"),
		button: document.getElementById("login"),
		status: document.getElementById( "loginStatus")
	};



	function resetLoginStatus() {
		login.status.innerText = "";
	}

	var onConnectService, onConnectCallback;
	function makeLogin( login ) {

		login.button.addEventListener( "click", ()=>{
			protocol.request( onConnectService, login.account.value, login.password.value, onConnectCallback );
		})

	}
	
	makeLogin( login );

	return {
			requestService( service, callback ) {
				onConnectService = service;
				onConnectCallback = callback;
			},
		resetLoginStatus : resetLoginStatus,
		page : login.page,
		showStatus( msg ) {
			login.status.innerText = msg;
		}
	}
}