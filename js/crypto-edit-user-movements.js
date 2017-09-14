/**
 * 
 * @param movements
 */
function drawEditableUserAccountMovements() {
	
	var movements = retrieveUserAccountMovements();
	
	$('#userAccountMovements_inputs > tbody').find('tr:gt(2)').remove();
	$('#userAccountMovements_outputs > tbody').find('tr:gt(2)').remove();
	
	if(movements != null && movements.inputs != null) {
		movements.inputs.forEach(function(elem) {
			$('#userAccountMovements_inputs > tbody').append(
							'<tr id="'+ elem.id + '">' + 
							'<td>' + elem.date + '</td>' + 
							'<td>' + elem.amount.formatNumber('CURRENCY') + '</td>' + 
							'<td class="text-right">' + 
							'<a href="javascript:deleteUserInputAccountMovement(\'' + elem.id + '\');" title="Borrar">' +
							'<img src="img/delete.png">' +
							'</a>' + 
							'</td>' +
							'</tr>');
		});
	}
	
	if(movements != null && movements.outputs != null) {
		movements.outputs.forEach(function(elem) {
			$('#userAccountMovements_outputs > tbody').append(
							'<tr id="'+ elem.id + '">' + 
							'<td>' + elem.date + '</td>' + 
							'<td>' + elem.amount.formatNumber('CURRENCY') + '</td>' +
							'<td class="text-right">' + 
							'<a href="javascript:deleteUserOutputAccountMovement(\'' + elem.id + '\');" title="Borrar">' +
							'<img src="img/delete.png">' +
							'</a>' + 
							'</td>' +
							'</tr>');
		});
	}
}

/**
 * 
 * @param id
 */
function deleteUserInputAccountMovement(id) {
	if(confirm("Se dispone a borrar un movimiento. ¿Desea continuar?")) {
		removeUserAccountMovement(id, 'INPUT');
		drawEditableUserAccountMovements();
	}
}

/**
 * 
 * @param id
 */
function deleteUserOutputAccountMovement(id) {
	if(confirm("Se dispone a borrar un movimiento. ¿Desea continuar?")) {
		removeUserAccountMovement(id, 'OUTPUT');
		drawEditableUserAccountMovements();
	}
}

/**
 * 
 * @param type (INPUT/OUTPUT)
 */
function showNewEditableUserMovement(type) {
	var divType;
	switch(type) {
		case 'INPUT':
			divType = 'Input';
			break;
		case 'OUTPUT':
			divType = 'Output';
			break;
	} 
	$('#new' + divType + 'Movement').show();
	$('#new' + divType + 'MovementButtons').show();
}

/**
 * 
 * @param type
 */
function storeNewEditableUserMovement(type) {
	var date;
	var amount;
	switch(type) {
		case 'INPUT':
			date = $('#inputUserMovement_date').val();
			amount = $('#inputUserMovement_amount').val();
			break;
		case 'OUTPUT':
			date = $('#outputUserMovement_date').val();
			amount = $('#outputUserMovement_amount').val();
			break;
	}
	
	var errors = [];
	var resultValidateDate = validateDate(date);
	if(resultValidateDate.error != null) {
		errors.push(resultValidateDate.error);
	} else {
		date = resultValidateDate.date;
	}
	
	var errorMessageAmount = validateNumber(amount, 0, 2);
	if(errorMessageAmount != null) {
		errors.push(errorMessageAmount);
	} else {
		amount = new Number(amount);
		if(amount <= 0) {
			errors.push("La cantidad introducida debe ser mayor que cero");
		}
	}
	
	if(errors.length == 0) {
		storeUserAccountMovement(date, new Number(amount), type);
		discardNewEditableUserMovement(type);
		drawEditableUserAccountMovements();
		activateSuccessMessage("Movimiento grabado correctamente", null);
	} else {
		var text = "<ul>";
		errors.forEach(function(elem) {
			text += "<li>" + elem + "</li>";
		});
		text += "</ul>";
		activateErrorMessage("No se ha grabado el movimiento", text);
	}
}

/**
 * 
 * @param type
 */
function discardNewEditableUserMovement(type) {
	deactivateMessages();
	
	switch(type) {
		case 'INPUT':
			$('#newInputMovement').hide();
			$('#newInputMovementButtons').hide();
			$('#inputUserMovement_date').val('');
			$('#inputUserMovement_amount').val('');
			break;
		case 'OUTPUT':
			$('#newOutputMovement').hide();
			$('#newOutputMovementButtons').hide();
			$('#outputUserMovement_date').val('');
			$('#outputUserMovement_amount').val('');
			break;
	}
}