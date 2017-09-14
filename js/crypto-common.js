var defaultCurrency = 'EUR';
var defaultLocale = 'es-ES';
var defaultValueUnloadData = '---';
var defaultFracDigitsCurrency = 2;
var defaultFracDigitsCoin = 8;
var defaultFracDigitsPercent = 2;

var activeMenu = null;

var lastId;
var seedId = 1;

var responseSuccess = "Success";
var responseError = "Error";

var user;
var prop_userCoinBalance = "userCoinBalance";
var prop_userMovements = "userMovements";

$(document).ready(function() {
	
	menuFix();
	
	$('#copyrightYear').html(new Date().getFullYear());
	
	if(isDevEnvironment()) {
		$('#environment').html("(dev)");
		$("#devTools").show();
	} else {
		$("#devTools").hide();
	}
	
});

/**
 * 
 * @param mode (FULL, DAY_MONTH_YEAR, DAY_MONTH_FULLYEAR, HOUR, DAY_MONTH, MONTH_YEAR)
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
  var yyyy = this.getFullYear();

  switch(mode) {
  	case 'FULL':
  		res = dd + '/' + mm + '/' + yy + ' ' + hh + ':' + MM;
  		break;
  	case 'DAY_MONTH_YEAR':
  		res = dd + '/' + mm + '/' + yy;
  		break;
  	case 'DAY_MONTH_FULLYEAR':
  		res = dd + '/' + mm + '/' + yyyy;
  		break;
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
 */
Array.prototype.sortMovementsByDate = function() {
	return this.sort(function(d1, d2) {
		return dateToMillis(d1.date) - dateToMillis(d2.date);
	});
}

/**
 * 
 * @returns {Boolean}
 */
function isDevEnvironment() {
	return cryptoConfig.environment == "dev";
}

/**
 * 
 * @param idMenu
 */
function selectMenu(idMenu) {
	$('#' + idMenu).addClass('active');
	$('#' + idMenu + ' > a').prop('href', '#');
}

/*
 * 
 */
function menuFix() {
	cryptoConfig.menu.forEach(function(elem) {
		if(elem.visible) {
			$("#" + elem.id).show(0);
		}
	});
}

/**
 * 
 * @param date (format dd/mm/yyyy)
 * @returns {"error": "", "date": ""}
 */
function validateDate(date) {
	
	var res = { 'error': null,
				'date': null
				};
	var ok = true;
	var dAux = date;
	
	if(date == null || date == undefined) {
		ok = false;
	} else {
		if(!isNaN(date)) {
			ok = false;
		} else {
			var partes = date.split("/");
			if(partes.length != 3) {
				ok = false;
			} else {
				
				dAux = new Date(partes[2], partes[1] - 1, partes[0], 0, 0, 0, 0);
				
				partes[0] = partes[0].length<2?"0" + partes[0]:partes[0];
				partes[1] = partes[1].length<2?"0" + partes[1]:partes[1];
				partes[2] = partes[2].length<4?"0" + partes[2]:partes[2];
				
				if(partes[0].length < 2 || partes[1].length < 2 || partes[2].length < 4) {
					ok = false;
				} else {
					var d = new Date(partes[2], partes[1] - 1, partes[0], 0, 0, 0, 0);
					
					if(dAux.getTime() != d.getTime()) {
						ok = false;
					}
				}
			}
		}
	}
	
	if(!ok) {
		res.error = "Formato de fecha incorrecto";
	} else {
		res.date = dAux.formatDate('DAY_MONTH_FULLYEAR');
	}
	
	return res;
}

/**
 * 
 * @param number
 * @param minDecimalPlaces
 * @param maxDecimalPlaces
 */
function validateNumber(number, minDecimalPlaces, maxDecimalPlaces) {
	var res = null;
	if(isNaN(number)) {
		res = "Formato de número incorrecto";
	} else {
		var parts = number.toString().split(".");
		if(minDecimalPlaces != null && minDecimalPlaces != undefined && minDecimalPlaces > 0) {
			if(parts.length != 2 || (parts.length == 2 && parts[1].length < minDecimalPlaces)) {
				res = "El número de decimales mínimo es " + minDecimalPlaces;
			}
		}
		
		if(maxDecimalPlaces != null && maxDecimalPlaces != undefined && maxDecimalPlaces > 0) {
			if(parts.length == 2 && parts[1].length > maxDecimalPlaces) {
				res = "El número de decimales máximo es " + maxDecimalPlaces;
			}
		}
	}
	
	return res;
}

/**
 * 
 * @param date
 */
function dateToMillis(date) {
	var day = date.substring(0, 2);
	var month = date.substring(3, 5);
	var year = date.substring(6, 10);
	
	var res = new Date(year, month, day, 0, 0, 0, 0);
	return res.getTime();
}

/**
 * 
 * @returns
 */
function getId() {
	var res = (new Date().getTime()).toString();
	if(lastId != null && lastId == res) {
		seedId++;
	} else {
		seedId = 1;
	}
	lastId = res;
	
	var seedIdAux = seedId.toString();
	while(seedIdAux.length < 3) {
		seedIdAux = "0" + seedIdAux;
	}
	res += seedIdAux;
	return res;
}

/**
 * 
 * @param type
 */
function activateErrorMessage(type, message) {
	deactivateMessages();
	
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
			$('#errorMessage_title').html(type);
			$('#errorMessage_text').html(message);
	}

	$('#errorMessage').show();
	$('html').animate({scrollTop: '0px'}, 100);
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
	deactivateMessages();
	
	$('#successMessage_title').html(title);
	$('#successMessage_text').html(text);
	$('#successMessage').show(0);
	$('html').animate({scrollTop: '0px'}, 100);
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
	var ucb = localStorage.getItem(prop_userCoinBalance + "_" + user);
	if(ucb === null) {
		ucbJson = {}; 
	} else {
		ucbJson = JSON.parse(ucb);
	}
	ucbJson[coin] = Number(balance);
	localStorage.setItem(prop_userCoinBalance + "_" + user, JSON.stringify(ucbJson));
}

/**
 * 
 */
function retrieveUserCoinBalance() {
	checkLocalStorage();
	var ucbJson = {};
	var ucb = localStorage.getItem(prop_userCoinBalance + "_" + user);
	if(ucb != null) {
		ucbJson = JSON.parse(ucb);
	}
	
	return ucbJson;
}

/**
 * 
 */
function clearUserCoinBalance() {
	checkLocalStorage();
	localStorage.removeItem(prop_userCoinBalance + "_" + user, null);
}

/**
 * 
 * @param date
 * @param balance
 * @param type (INPUT/OUTPUT)
 */
function storeUserAccountMovement(date, balance, type) {
	checkLocalStorage();
	
	var ucbJson;
	var ucb = localStorage.getItem(prop_userMovements + "_" + user);
	if(ucb === null) {
		ucbJson = {}; 
	} else {
		ucbJson = JSON.parse(ucb);
	}
	
	switch(type) {
		case 'INPUT':
			if(ucbJson.inputs == null) {
				ucbJson.inputs = [];
			}
			ucbJson.inputs.push({'id': getId(), 'date': date, 'amount': Number(balance)});
			break;
		case 'OUTPUT':
			if(ucbJson.outputs == null) {
				ucbJson.outputs = [];
			}
			ucbJson.outputs.push({'id': getId(), 'date': date, 'amount': Number(balance)});
			break;
	}
	
	localStorage.setItem(prop_userMovements + "_" + user, JSON.stringify(ucbJson));
}

/**
 * 
 * @param id
 * @param type (INPUT/OUTPUT)
 */
function removeUserAccountMovement(id, type) {
	checkLocalStorage();
	
	var ucbJson;
	var ucb = localStorage.getItem(prop_userMovements + "_" + user);
	if(ucb != null) {
		ucbJson = JSON.parse(ucb);
	}
	
	switch(type) {
		case 'INPUT':
			if(ucbJson.inputs != null) {
				var arrAux = [];
				ucbJson.inputs.forEach(function(elem) {
					if(elem.id != id) {
						arrAux.push(elem);
					}
				});
				ucbJson.inputs = arrAux;
			}
			break;
		case 'OUTPUT':
			if(ucbJson.outputs != null) {
				var arrAux = [];
				ucbJson.outputs.forEach(function(elem) {
					if(elem.id != id) {
						arrAux.push(elem);
					}
				});
				ucbJson.outputs = arrAux;
			}
			break;
	}
	
	localStorage.setItem(prop_userMovements + "_" + user, JSON.stringify(ucbJson));
}

/**
 * 
 */
function retrieveUserAccountMovements() {
	checkLocalStorage();
	var ucbJson = {};
	var ucb = localStorage.getItem(prop_userMovements + "_" + user);
	if(ucb != null) {
		ucbJson = JSON.parse(ucb);
	}
	
	if(ucbJson.inputs != null) {
		ucbJson.inputs = ucbJson.inputs.sortMovementsByDate().reverse();
	}
	
	if(ucbJson.outputs != null) {
		ucbJson.outputs = ucbJson.outputs.sortMovementsByDate().reverse();
	}
	
	return ucbJson;
}

/**
 * 
 */
function clearUserAccountMovements() {
	checkLocalStorage();
	localStorage.removeItem(prop_userMovements + "_" + user, null);
}