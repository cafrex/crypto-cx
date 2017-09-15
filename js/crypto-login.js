/**
 * 
 */
function login() {
	var usr = $('#user').val();
	loginUser(usr);
	window.document.location("index.html");
}

/**
 * 
 */
function logout() {
	logoutUser();
	window.document.location("login.html");
}
