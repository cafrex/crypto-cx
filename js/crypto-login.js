/**
 * 
 */
function loginFromScreen() {
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
				login(usr);
		    }
		}
	}
}

/**
 * 
 */
function login(user) {
	loginUser(user);
	window.document.location = "index.html";
}

/**
 * 
 */
function logout() {
	logoutUser();
	window.document.location = "login.html";
}

/**
 *
 */
function drawUsers() {
	
	var users = retrieveUsers();
	
	$('#users > tbody').find('tr').remove();
	
	if(users.length > 0) {
		users.forEach(function(elem) {
			$('#users > tbody').append(
							'<tr id="'+ elem + '">' + 
							'<td class="text-center">' +
							'<i class="fa fa-user fa-lg"></i>' +
							'<a href="javascript:login(\'' + elem + '\');" class="ml-20">' + elem + '</a>' + 
							'</td>' +
							'</tr>');
		});
	}
}