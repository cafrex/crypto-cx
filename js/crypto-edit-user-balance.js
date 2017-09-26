/**
 * 
 */
function drawEditableUserCoinBalance() {
	var ucb = retrieveUserCoinBalance(getLoggedUser());
	
	var value;
	if(ucb.EUR != null) {
		value = ucb.EUR; 
	} else {
		value = 0; 
	}
	value = value.formatNumber('EDITABLE_CURRENCY');
	$('#userBalance_EUR').val(value);
	
	var value;
	if(ucb.BTC != null) {
		value = ucb.BTC; 
	} else {
		value = 0; 
	}
	value = value.formatNumber('EDITABLE_COIN');
	$('#userBalance_BTC').val(value);
	
	var value;
	if(ucb.ETH != null) {
		value = ucb.ETH; 
	} else {
		value = 0; 
	}
	value = value.formatNumber('EDITABLE_COIN');
	$('#userBalance_ETH').val(value);
	
	var value;
	if(ucb.LTC != null) {
		value = ucb.LTC; 
	} else {
		value = 0; 
	}
	value = value.formatNumber('EDITABLE_COIN');
	$('#userBalance_LTC').val(value);
	
	var value;
	if(ucb.XRP != null) {
		value = ucb.XRP; 
	} else {
		value = 0; 
	}
	value = value.formatNumber('EDITABLE_COIN');
	$('#userBalance_XRP').val(value);
}

/**
 * 
 */
function storeEditableUserCoinBalance() {
	
	var errorMsg_positive = "la cantidad introducida debe ser mayor o igual que cero";
	
	var ucb_EUR = $('#userBalance_EUR').val();
	var ucb_BTC = $('#userBalance_BTC').val();
	var ucb_ETH = $('#userBalance_ETH').val();
	var ucb_LTC = $('#userBalance_LTC').val();
	var ucb_XRP = $('#userBalance_XRP').val();
	
	var errors = [];
	
	var e_EUR = validateNumber(ucb_EUR, 0, 2); 
	if(e_EUR != null) {
		errors.push("Error EUR: " + e_EUR);
	} else {
		ucb_EUR = new Number(ucb_EUR);
		if(ucb_EUR < 0) {
			errors.push("Error EUR: " + errorMsg_positive);
		}
	}
	
	var e_BTC = validateNumber(ucb_BTC, 0, 8); 
	if(e_BTC != null) {
		errors.push("Error BTC: " + e_BTC);
	} else {
		ucb_BTC = new Number(ucb_BTC);
		if(ucb_BTC < 0) {
			errors.push("Error BTC: " + errorMsg_positive);
		}
	}
	
	var e_ETH = validateNumber(ucb_ETH, 0, 8); 
	if(e_ETH != null) {
		errors.push("Error ETH: " + e_ETH);
	} else {
		ucb_ETH = new Number(ucb_ETH);
		if(ucb_ETH < 0) {
			errors.push("Error ETH: " + errorMsg_positive);
		}
	}
	
	var e_LTC = validateNumber(ucb_LTC, 0, 8); 
	if(e_LTC != null) {
		errors.push("Error LTC: " + e_LTC);
	} else {
		ucb_LTC = new Number(ucb_LTC);
		if(ucb_LTC < 0) {
			errors.push("Error LTC: " + errorMsg_positive);
		}
	}
	
	var e_XRP = validateNumber(ucb_XRP, 0, 8); 
	if(e_XRP != null) {
		errors.push("Error XRP: " + e_XRP);
	} else {
		ucb_XRP = new Number(ucb_XRP);
		if(ucb_XRP < 0) {
			errors.push("Error XRP: " + errorMsg_positive);
		}
	}
	
	if(errors.length == 0) {
		storeUserCoinBalance('EUR', ucb_EUR, getLoggedUser());
		storeUserCoinBalance('BTC', ucb_BTC, getLoggedUser());
		storeUserCoinBalance('ETH', ucb_ETH, getLoggedUser());
		storeUserCoinBalance('LTC', ucb_LTC, getLoggedUser());
		storeUserCoinBalance('XRP', ucb_XRP, getLoggedUser());
		drawEditableUserCoinBalance();
		activateSuccessMessage("Datos grabados correctamente");
	} else {
		var text = "<ul>";
		errors.forEach(function(elem) {
			text += "<li>" + elem + "</li>";
		});
		text += "</ul>";
		activateErrorMessage("No se ha grabado el balance", text);
	}
}

/**
 * 
 */
function discardEditableUserCoinBalance() {
	deactivateMessages();
	drawEditableUserCoinBalance();
}

/**
 * 
 */
function clearUserCoinBalanceAction() {
	activateConfirmMessage("Se dispone a borrar todo el balance. ¿Desea continuar?", "clearUserCoinBalanceAction_after()");
}

/**
 * 
 */
function clearUserCoinBalanceAction_after() {
	if(confirm("Se dispone a borrar todo el balance. ¿Desea continuar?")) {
		clearUserCoinBalance(getLoggedUser());
		drawEditableUserCoinBalance();
		activateSuccessMessage("Balance borrado correctamente", null);
	}
}