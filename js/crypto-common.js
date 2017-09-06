var coinSelected;
var frequencySelected;
var defaultCurrency = 'EUR';
var defaultLocale = 'es-ES';
var defaultValueUnloadData = '---';
var defaultFracDigitsCurrency = 2;
var defaultFracDigitsCoin = 8;
var defaultFracDigitsPercent = 2;

var responseSuccess = "Success";
var responseError = "Error";

var prop_user;
var prop_userCoinBalance = "userCoinBalance";
var prop_userMovements = "userMovements";

/**
 * 
 * @param mode (HOUR, DAY_MONTH, MONTH_YEAR)
 * @returns {String}
 */
Date.prototype.formatDate = function(mode) {
  var mm = this.getMonth() + 1;
  mm = mm>=10?mm:'0'+mm;
  var dd = this.getDate();
  dd = dd>=10?dd:'0'+dd;
  var hh = this.getHours();
  hh = hh>=10?hh:'0'+hh;
  var MM = this.getMinutes();
  MM = MM>=10?MM:'0'+MM;
  var yy = this.getFullYear() % 100;
  yy = yy>=10?yy:'0'+yy;

  switch(mode) {
  	case 'HOUR':
  		res = hh + ':' + MM;
  		break;
  	case 'DAY_MONTH':
  		res = dd + '/' + mm;
  		break;
  	case 'MONTH_YEAR':
  		res = mm + '/' + yy;
  		break;
  	default:
  		res = 'NO_DATE_MODE';
  }
  
  return res;
};

/**
 * 
 * @param mode (CURRENCY, PERCENT, COIN, EDITABLE_CURRENCY, EDITABLE_COIN)
 * @param minFractionDigits
 * @param maxFractionDigits
 */
Number.prototype.formatNumber = function(mode, minFractionDigits, maxFractionDigits) {
  var res = 0;
  
  var minFd = 0;
  if(minFractionDigits == null || minFractionDigits == "") {
	  switch(mode) {
	  	case 'CURRENCY':
	  	case 'EDITABLE_CURRENCY':
	  		minFd = defaultFracDigitsCurrency;
  			break;
	  	case 'COIN':
	  	case 'EDITABLE_COIN':
	  		minFd = defaultFracDigitsCoin;
  			break;
	  	case 'PERCENT':
	  		minFd = defaultFracDigitsPercent;
  			break;
	  }
  } else {
	  minFd = minFractionDigits;
  }
  
  var maxFd = 0;
  if(maxFractionDigits == null || maxFractionDigits == "") {
	  switch(mode) {
	  	case 'CURRENCY':
	  	case 'EDITABLE_CURRENCY':
	  		maxFd = defaultFracDigitsCurrency;
  			break;
	  	case 'COIN':
	  	case 'EDITABLE_COIN':
	  		maxFd = defaultFracDigitsCoin;
  			break;
	  	case 'PERCENT':
	  		maxFd = defaultFracDigitsPercent;
  			break;
	  }
  } else {
	  maxFd = maxFractionDigits;
  }
  
  if(maxFd < minFd) {
	  maxFd = minFd;
  }
  
  switch(mode) {
	case 'CURRENCY':
		res = this.toLocaleString(defaultLocale, {style: 'currency', currency: defaultCurrency, minimumFractionDigits: minFd, maximumFractionDigits: maxFd});
		break;
	case 'PERCENT':
		res = this.toLocaleString(defaultLocale, {style: 'percent', minimumFractionDigits: minFd, maximumFractionDigits: maxFd});
		break;
	case 'COIN':
		res = this.toLocaleString(defaultLocale, {style: 'decimal', minimumFractionDigits: minFd, maximumFractionDigits: maxFd});
		break;
	case 'EDITABLE_CURRENCY':
		res = this.toLocaleString('en-US', {style: 'decimal', useGrouping: false, minimumFractionDigits: minFd, maximumFractionDigits: maxFd});
		break;
	case 'EDITABLE_COIN':
		res = this.toLocaleString('en-US', {style: 'decimal', useGrouping: false, minimumFractionDigits: minFd, maximumFractionDigits: maxFd});
		break;
  }
  
  return res;
};

/**
 * 
 * @param search
 * @param replacement
 * @returns
 */
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

/**
 * 
 * @param type
 */
function activateErrorMessage(type, message) {

	var content = "Error desconocido";

	switch(type) {
		case 'NO_DATA':
			$('#errorMessage_title').html("Recepción de datos incorrecta");
			break;
		case 'DATA_ERROR':
			$('#errorMessage_title').html("Recepción de datos incorrecta");
			$('#errorMessage_text').html(message);
			break;
		case 'STORAGE_ERROR':
			$('#errorMessage_title').html("Error de almacenamiento");
			$('#errorMessage_text').html(message);
			break;
		case 'NUMBER_FORMAT':
			$('#errorMessage_title').html("Error de formato");
			$('#errorMessage_text').html(message);
			break;
		default:
			$('#errorMessage_title').html("Error desconocido");
			$('#errorMessage_text').html(message);
	}

	$('#errorMessage').show();
}

/**
 * 
 */
function deactivateErrorMessage() {
	$('#errorMessage').hide(0);
}

/**
 * 
 * @param type
 */
function activateSuccessMessage(title, text) {
	$('#successMessage_title').html(title);
	$('#successMessage_text').html(text);
	$('#successMessage').show(0);
}

/**
 * 
 */
function deactivateSuccessMessage() {
	$('#successMessage').hide(0);
}

/**
 * 
 */
function deactivateMessages() {
	$('.alert').hide(0);
}

/**
 * 
 * @returns {Boolean}
 */
function checkLocalStorage() {
	var ok = true;
	if (typeof(Storage) === "undefined") {
		ok = false;
		activateErrorMessage("STORAGE_ERROR", "Error accediendo al almacenamiento local.");
	}
	return ok;
}

/**
 * 
 * @param coin
 * @param balance
 */
function storeUserCoinBalance(coin, balance) {
	checkLocalStorage();
	
	var ucbJson;
	var ucb = localStorage.getItem(prop_userCoinBalance + "_" + prop_user);
	if(ucb === null) {
		ucbJson = {}; 
	} else {
		ucbJson = JSON.parse(ucb);
	}
	ucbJson[coin] = Number(balance);
	localStorage.setItem(prop_userCoinBalance + "_" + prop_user, JSON.stringify(ucbJson));
}

/**
 * 
 */
function retrieveUserCoinBalance() {
	checkLocalStorage();
	var ucbJson = {};
	var ucb = localStorage.getItem(prop_userCoinBalance + "_" + prop_user);
	if(ucb != null) {
		ucbJson = JSON.parse(ucb);
	}
	
	//solo para poder tener el nuevo formato de pantalla
	ucbJson = userCoinBalanceStatic;
	
	return ucbJson;
}

/**
 * 
 */
function clearUserCoinBalance() {
	checkLocalStorage();
	localStorage.removeItem(prop_userCoinBalance + "_" + prop_user, null);
}

/**
 * 
 * @returns
 */
function retrieveUserAccountMovements() {
	return userAccountMovementsStatic;
}

