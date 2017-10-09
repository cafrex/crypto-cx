/**
 * 
 * @param movements
 */
function drawEditableUsers() {
	
	var users = retrieveUsers();
	
	$('#editableUsers > tbody').find('tr').remove();
	
	if(users.length > 0) {
		users.forEach(function(elem) {
			$('#editableUsers > tbody').append(
							'<tr id="'+ elem + '">' + 
							'<td>' +
							'<i class="fa fa-user fa-lg mr-10"></i>' + elem +
							'</td>' + 
							'<td class="text-right">' + 
							'<a href="javascript:deleteUser(\'' + elem + '\');" title="Borrar">' +
							'<i class="fa fa-trash fa-lg"></i>' +
							'</a>' + 
							'</td>' +
							'</tr>');
		});
	}
}

/**
 * 
 * @param user
 */
function deleteUser(user) {
	activateConfirmMessage("Se dispone a borrar un usuario. ¿Desea continuar?", "deleteUser_after('" + user + "')");
}

/**
 * 
 * @param user
 */
function deleteUser_after(user) {
	removeUser(user);
	drawEditableUsers();
	activateSuccessMessage("Usuario borrado correctamente", null);
}

/**
 * 
 */
function clearAllUsers() {
	activateConfirmMessage("Se dispone a borrar todos los usuarios. ¿Desea continuar?", "clearAllUser_after()");
}

/**
 * 
 */
function clearAllUser_after() {
	clearAllUserData();
	drawEditableUsers();
	activateSuccessMessage("Usuarios borrados correctamente", null);
}

