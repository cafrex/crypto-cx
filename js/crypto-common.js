var defaultCurrency = 'EUR';
var defaultLocale = 'es-ES';
var defaultValueUnloadData = '---';
var defaultFracDigitsCurrency = 2;
var defaultFracDigitsCoin = 8;
var defaultFracDigitsPercent = 2;

var lastId;
var seedId = 1;

var responseSuccess = "Success";
var responseError = "Error";

var prop_users = "cryptoCxUsers";
var prop_user = "cryptoCxUser";
var prop_userCoinBalance = "userCoinBalance";
var prop_userMovements = "userMovements";

$(document).ready(function() {

	fixMenu();
	
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
 * @returns {String}
 */
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

/**
 * 
 * @param search
 * @returns {Boolean}
 */
String.prototype.endsWith = function(search) {
	return this.indexOf(search, this.length - search.length) !== -1;
};

/**
 * 
 * @returns {Boolean}
 */
String.prototype.isEmpty = function() {
	return this.trim().length == 0;
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
	if(!isUserAllowed(getLoggedUser(), idMenu)) {
		window.document.location = "index.html";
	} else {
		$('#' + idMenu).addClass('active');
		$('#' + idMenu + ' > a').prop('href', '#');
	}
}

/*
 * 
 */
function fixMenu() {
	var usr = getLoggedUser();
	if(usr != null || usr != undefined || usr != "") {
		$("#loggedUser_left").html(usr);
		$("#loggedUser_right").html(usr);
	}
	
	cryptoConfig.menu.forEach(function(elem) {
		if(elem.visible) {
			if(elem.onlyAdminVisible) {
				if(isAdminUser(usr)) {
					$("#" + elem.id).show(0);
				}
			} else {
				$("#" + elem.id).show(0);
			}
		}
	});
}

/**
 * 
 * @param date
 * formats:
 * dd/mm/yyyy
 * yyyy-mm-dd
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
		
		var regexp1 = /^\d{1,2}[\/]\d{1,2}[\/]\d{4}$/;
		var regexp2 = /^\d{4}[-]\d{1,2}[-]\d{1,2}$/;

		var splitter;

		if(regexp1.test(date)) {
			splitter = "/";
		} else if(regexp2.test(date)) {
			splitter = "-";
		} else {
			ok = false;
		}

		if(ok) {
			var partes = date.split(splitter);
			if(partes.length != 3) {
				ok = false;
			} else {
				var dd;
				var mm;
				var yy;

				switch (splitter){
					case "/":
						dd = partes[0];
						mm = partes[1];
						yy = partes[2];
						break;
					case "-":
						dd = partes[2];
						mm = partes[1];
						yy = partes[0];
						break;
				}

				dAux = new Date(yy, mm - 1, dd, 0, 0, 0, 0);
				
				dd = dd.length<2?"0" + dd:dd;
				mm = mm.length<2?"0" + mm:mm;
				
				if(dd.length != 2 || mm.length != 2 || yy.length != 4) {
					ok = false;
				} else {
					var d = new Date(yy, mm - 1, dd, 0, 0, 0, 0);
					
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
 * @returns {String}
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
 * @param message
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
		case 'USER_NOT_LOGGED':
			$('#errorMessage_title').html("El usuario no ha iniciado sesión");
			break;
		default:
			$('#errorMessage_title').html(type);
			$('#errorMessage_text').html(message);
	}

	$('#errorMessage').fadeIn(500);
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
 * @param title
 * @param text
 */
function activateSuccessMessage(title, text) {
	deactivateMessages();
	
	$('#successMessage_title').html(title);
	$('#successMessage_text').html(text);
	$('#successMessage').fadeIn(500);
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
 * @param message
 * @param callback
 */
function activateConfirmMessage(message, callback) {
	bootbox.confirm({
		message: message,
		buttons: {
			cancel: {
				label: '<i class="fa fa-times"></i> No',
				className: 'btn-danger'
			},
			confirm: {
				label: '<i class="fa fa-check"></i> Si',
				className: 'btn-success'
			}
		},
		callback: function (result) {
			if(result) {
				eval(callback);
			}
		}
	});
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
 * @param user
 */
function storeUserCoinBalance(coin, balance, user) {
	if(checkLocalStorage()) {
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
}

/**
 * 
 * @param user
 * @returns {json}
 */
function retrieveUserCoinBalance(user) {
	if(checkLocalStorage()) {
		var ucbJson = {};
		var ucb = localStorage.getItem(prop_userCoinBalance + "_" + user);
		if(ucb != null) {
			ucbJson = JSON.parse(ucb);
		}
		return ucbJson;
	}
}

/**
 * 
 * @param user
 */
function clearUserCoinBalance(user) {
	if(checkLocalStorage()) {
		localStorage.removeItem(prop_userCoinBalance + "_" + user, null);
	}
}

/**
 * 
 * @param date
 * @param balance
 * @param type (INPUT/OUTPUT)
 * @param user
 */
function storeUserAccountMovement(date, balance, type, user) {
	if(checkLocalStorage()) {
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
}

/**
 * 
 * @param id
 * @param type (INPUT/OUTPUT)
 * @param user
 */
function removeUserAccountMovement(id, type, user) {
	if(checkLocalStorage()) {
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
}

/**
 * 
 * @param user
 * @returns {json}
 */
function retrieveUserAccountMovements(user) {
	if(checkLocalStorage()) {
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
}

/**
 * 
 * @param user
 */
function clearUserAccountMovements(user) {
	if(checkLocalStorage()) {
		localStorage.removeItem(prop_userMovements + "_" + user, null);
	}
}

/**
 * 
 * @returns {String}
 */
function getLoggedUser() {
	return localStorage.getItem(prop_user);
}

/**
 * 
 * @param user
 * @returns {Boolean}
 */
function isAdminUser(user) {
	return cryptoConfig.adminUsersList.indexOf(user) >= 0;
}

/**
 * 
 */
function checkUser() {
	if(!window.document.location.pathname.endsWith("login.html")) {
		var usr = getLoggedUser();
		if(usr == null || usr == undefined || usr == "") {
			window.document.location = "login.html";
		}
	}
}

/**
 * 
 * @param user
 * @param menu
 * @returns {Boolean}
 */
function isUserAllowed(user, menu) {
	var res = true;
	if(menu != null) {
		var isAdmin = isAdminUser(user);
		cryptoConfig.menu.forEach(function(elem) {
			if(menu == elem.id) {
				if(!elem.onlyAdminVisible) {
					res = true;
				} else {
					res = isAdminUser(user);
				}
			}
		});
	}
	return res;
}

/**
 * 
 * @param user
 */
function loginUser(user) {
	if(checkLocalStorage()) {
		user = user.toLowerCase();
		localStorage.setItem(prop_user, user);
		storeUser(user);
	}
}

/**
 * 
 */
function logoutUser() {
	if(checkLocalStorage()) {
		localStorage.removeItem(prop_user);
	}
}

/**
 * 
 * @param user
 */
function storeUser(user) {
	if(checkLocalStorage()) {
		var usersJson;
		var users = localStorage.getItem(prop_users);
		if(users === null) {
			usersJson = { "users": [] }; 
		} else {
			usersJson = JSON.parse(users);
		}
		
		if(usersJson.users.indexOf(user) < 0) {
			usersJson.users.push(user);
			localStorage.setItem(prop_users, JSON.stringify(usersJson));
		}
	}
}

/**
 * 
 * @returns {Array}
 */
function retrieveUsers() {
	var res = [];
	if(checkLocalStorage()) {
		var usersJson = null;
		var users = localStorage.getItem(prop_users);
		if(users != null) {
			usersJson = JSON.parse(users);
			res = usersJson.users;
		}
	}
	return res;
}

/**
 * 
 * @param user
 */
function removeUser(user) {
	if(checkLocalStorage()) {
		var usersJson;
		var users = localStorage.getItem(prop_users);
		if(users != null) {
			usersJson = JSON.parse(users);
		}
		
		if(usersJson != null && usersJson.users != null && usersJson.users.length > 0) {
			var arrAux = [];
			usersJson.users.forEach(function(elem) {
				if(elem != user) {
					arrAux.push(elem);
				}
			});
			usersJson.users = arrAux;
		}
		
		localStorage.setItem(prop_users, JSON.stringify(usersJson));
	}
}

/**
 * 
 */
function clearAllUserData() {
	var users = retrieveUsers();
	users.forEach(function(elem) {
		clearUserAccountMovements(elem);
		clearUserCoinBalance(elem);
	});
	localStorage.removeItem(prop_users);
}

/*
 * ejecuciones previas a la carga de la pagina
 */
checkUser();
