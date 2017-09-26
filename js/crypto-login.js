/**
 * 
 */
function login() {
	var usr = $('#user').val();
	if(usr == null || usr == undefined) {
		activateErrorMessage("El usuario no puede estar vacío");
	} else {
		usr = usr.trim();
		if(usr.length == 0) {
			activateErrorMessage("El usuario no puede estar vacío");
		} else {
			var reWhiteSpace = new RegExp("/^\s+$/");
		    if (reWhiteSpace.test(usr)) {
		    	activateErrorMessage("El usuario no puede contener espacios");
		    } else if(usr.length < 5) {
		    	activateErrorMessage("El usuario debe tener al menos 5 caracteres");
		    } else {
				loginUser(usr);
				window.document.location = "index.html";
		    }
		}
	}
}

/**
 * 
 */
function logout() {
	logoutUser();
	window.document.location = "login.html";
}
