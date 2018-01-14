/**
 * 
 */
function drawTotalUserAccountMovements() {
	
	var movements = retrieveUserAccountMovements(getLoggedUser());

	var totalInput = 0;
	var totalWithdrawal = 0;
	var totalInvestment = 0;

	if(movements != null && movements.inputs != null) {
		movements.inputs.forEach(function(elem) {
			totalInput += elem.amount;
		});
	}
	
	if(movements != null && movements.outputs != null) {
		movements.outputs.forEach(function(elem) {
			totalWithdrawal += elem.amount;
		});
	}

	if(totalInput > totalWithdrawal) {
		totalInvestment = totalInput - totalWithdrawal;
	}

	$('#userMovements_input').html(totalInput.formatNumber('CURRENCY'));
	$('#userMovements_withdrawal').html(totalWithdrawal.formatNumber('CURRENCY'));
	$('#userMovements_investment').html(totalInvestment.formatNumber('CURRENCY'));
}

/**
 * 
 */
function drawEditableUserAccountMovements() {
	
	var movements = retrieveUserAccountMovements(getLoggedUser());
	
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
							'<i class="fa fa-trash fa-lg"></i>' +
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
							'<i class="fa fa-trash fa-lg"></i>' +
							'</a>' + 
							'</td>' +
							'</tr>');
		});
	}

	drawTotalUserAccountMovements();
}

/**
 * 
 * @param id
 */
function deleteUserInputAccountMovement(id) {
	activateConfirmMessage("Se dispone a borrar un movimiento. ¿Desea continuar?", "deleteUserInputAccountMovement_after('" + id + "')");
}

/**
 * 
 * @param id
 */
function deleteUserInputAccountMovement_after(id) {
	removeUserAccountMovement(id, 'INPUT', getLoggedUser());
	drawEditableUserAccountMovements();
	activateSuccessMessage("Movimiento borrado correctamente", null);
}

/**
 * 
 * @param id
 */
function deleteUserOutputAccountMovement(id) {
	activateConfirmMessage("Se dispone a borrar un movimiento. ¿Desea continuar?", "deleteUserOutputAccountMovement_after('" + id + "')");
}

/**
 * 
 * @param id
 */
function deleteUserOutputAccountMovement_after(id) {
	removeUserAccountMovement(id, 'OUTPUT', getLoggedUser());
	drawEditableUserAccountMovements();
	activateSuccessMessage("Movimiento borrado correctamente", null);
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
	
	date = date.trim();
	amount = amount.trim();
	
	var errors = [];
	if(date.isEmpty()) {
		errors.push("Debe introducir una fecha");
	} else {
		var resultValidateDate = validateDate(date);
		if(resultValidateDate.error != null) {
			errors.push(resultValidateDate.error);
		} else {
			date = resultValidateDate.date;
		}
	}
	
	if(amount.isEmpty()) {
		errors.push("Debe introducir una cantidad");
	} else {
		var errorMessageAmount = validateNumber(amount, 0, 2);
		if(errorMessageAmount != null) {
			errors.push(errorMessageAmount);
		} else {
			amount = new Number(amount);
			if(amount <= 0) {
				errors.push("La cantidad introducida debe ser mayor que cero");
			}
		}
	}
	
	if(errors.length == 0) {
		storeUserAccountMovement(date, new Number(amount), type, getLoggedUser());
		emptyNewEditableUserMovement(type);
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
function emptyNewEditableUserMovement(type) {
	switch(type) {
		case 'INPUT':
			$('#inputUserMovement_date').val('');
			$('#inputUserMovement_amount').val('');
			break;
		case 'OUTPUT':
			$('#outputUserMovement_date').val('');
			$('#outputUserMovement_amount').val('');
			break;
	}
}

/**
 * 
 * @param type
 */
function discardNewEditableUserMovement(type) {
	deactivateMessages();
	emptyNewEditableUserMovement(type);
	switch(type) {
		case 'INPUT':
			$('#newInputMovement').hide();
			$('#newInputMovementButtons').hide();
			break;
		case 'OUTPUT':
			$('#newOutputMovement').hide();
			$('#newOutputMovementButtons').hide();
			break;
	}
}

/**
 * 
 */
function clearUserAccountMovementsAction() {
	activateConfirmMessage("Se dispone a borrar todos los movimientos. ¿Desea continuar?", "clearUserAccountMovementsAction_after()");
}

/**
 * 
 */
function clearUserAccountMovementsAction_after() {
	clearUserAccountMovements(getLoggedUser());
	drawEditableUserAccountMovements();
	activateSuccessMessage("Movimientos borrados correctamente", null);
}