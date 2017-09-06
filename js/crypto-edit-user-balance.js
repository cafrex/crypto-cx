/**
 * 
 */
function drawEditableUserCoinBalance() {
	var ucb = retrieveUserCoinBalance();
	
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
 * @param value
 * @returns
 */
function fixNumberLocaleFormatEditable(value) {
	var res = value;
	res = res.replaceAll(",", ".");
	return res;
}

/**
 * 
 */
function storeEditedUserCoinBalance() {
	
	var ucb_EUR = fixNumberLocaleFormatEditable($('#userBalance_EUR').val());
	storeUserCoinBalance('EUR', ucb_EUR);
	
	var ucb_BTC = fixNumberLocaleFormatEditable($('#userBalance_BTC').val());
	storeUserCoinBalance('BTC', ucb_BTC);
	
	var ucb_ETH = fixNumberLocaleFormatEditable($('#userBalance_ETH').val());
	storeUserCoinBalance('ETH', ucb_ETH);
	
	var ucb_LTC = fixNumberLocaleFormatEditable($('#userBalance_LTC').val());
	storeUserCoinBalance('LTC', ucb_LTC);
	
	var ucb_XRP = fixNumberLocaleFormatEditable($('#userBalance_XRP').val());
	storeUserCoinBalance('XRP', ucb_XRP);
	
	drawEditableUserCoinBalance();
	
	activateSuccessMessage("Datos grabados correctamente");
}