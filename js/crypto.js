var coinSelected;
var frequencySelected;
var coinChart;
var defaultCurrency = 'EUR';
var defaultLocale = 'es-ES';
var defaultValueUnloadData = '---';
var defaultFracDigitsCoin = 8;

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

  if(mode == 'HOUR') {
	  res = hh + ':' + MM;
  } else if(mode == 'DAY_MONTH') {
	  res = dd + '/' + mm;
  } else if(mode == 'MONTH_YEAR') {
	  res = mm + '/' + yy;
  } else {
	  res = 'NO_DATE_MODE';
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
 * @param chartId
 * @param labels
 * @param fullData
 */
function buildPricesChart(chartId, labels, fullData) {

	var labelBlanks = "  ";
	
	var chartOptions = {
			type: 'line',
			data: {
	        	labels: labels,
	        	datasets: []
			},
			options: {
		        scales: {
		        	xAxes: [{
		        		ticks: {
		        			callback: function(value, index, values) {
		        				return labelBlanks + value;
		        			},
		                    autoSkip: true,
		                    maxRotation: 0,
		                    minRotation: 0
		        		}
		        	}],
		            yAxes: [{
	                    position: "left",
	                    id: "y-axis-price",
		                ticks: {
		                    beginAtZero: false
		                }
		            }]
		        },
		        legend: {
		            display: false
		        },
		        tooltips: {
		        	intersect: true,
		            mode: 'index'
		        }
		    }
	    };
	
	if(coinChart != null) {
		coinChart.destroy();
	}
	
	var ctx = document.getElementById(chartId).getContext('2d');
	coinChart = new Chart(ctx, chartOptions);
	
	coinChart.data.datasets.push({
    	label: fullData.coin,
        data: fullData.price,
        backgroundColor: 'rgba(54, 162, 235,0.2)',
        borderColor: 'rgba(54, 162, 235,1)',
        borderWidth: '1',
        pointRadius: 0,
        yAxisID: "y-axis-price"
	});
	
	coinChart.update();
}

/**
 * Cuando la frecuencia es DAY el parametro limit se interpreta como días.
 * Cuando la frecuencia es HOUR el parametro limit se interpreta como horas.
 * Cuando la frecuencia es MINUTE el parametro limit se interpreta como minutos.
 * 
 * @param chartId
 * @param coin
 * @param frequency
 * @param limit
 */
function drawPricesChart(chartId, coin, frequency, limit) {

	var dateMode;
	
	$('#chartContainer').show();

	var url = 'https://min-api.cryptocompare.com/data/';
	
	if(frequency == 'DAY') {
		url += 'histoday';
		if(limit <= 1) {
			dateMode = 'HOUR';
		} else if(limit <= 30) {
			dateMode = 'DAY_MONTH';
		} else {
			dateMode = 'MONTH_YEAR';
		}
	} else if(frequency == 'HOUR') {
		url += 'histohour';
		if(limit <= 24) {
			dateMode = 'HOUR';
		} else if(limit <= 30 * 24) {
			dateMode = 'DAY_MONTH';
		} else {
			dateMode = 'MONTH_YEAR';
		}
	} else if(frequency == 'MINUTE') {
		url += 'histominute';
		if(limit <= 24 * 60) {
			dateMode = 'HOUR';
		} else if(limit <= 30 * 24 * 60) {
			dateMode = 'DAY_MONTH';
		} else {
			dateMode = 'MONTH_YEAR';
		}
	}
	
	url += '?fsym=' + coin;
	
	url += '&tsym=' + defaultCurrency;
	
	url += '&limit=' + limit;
	
	/* mercado */
	//url += '&e=Coinbase';
	
	$.ajax({
		url: url,
		dataType: 'json'
	}).done(function (results) {
		if(results.Response === responseSuccess) {
			var labels = [];
			var data = {'coin': coin,
					'price': []
					};
			data.coin = coin;
			results.Data.forEach(function(elem) {
				labels.push((new Date(elem.time * 1000)).formatDate(dateMode));
				data.price.push(elem.close);
			});
			
			buildPricesChart(chartId, labels, data);
			updatePricesChartValues(frequency, data.price);
		} else if(results.Response === responseError) {
			activateErrorMessage("DATA_ERROR", "Error recuperando datos de la gráfica de precios. " + results.Message);
		} else {
			activateErrorMessage(null, "Error recuperando datos de la gráfica de precios. " + results.Message);
		}
		
	}).fail(function () {
		activateErrorMessage('NO_DATA', "No se han recibido datos");
	});
}

/**
 * 
 * @param userCoinData
 * @param userMovements
 */
function drawUserData(userCoinData, userMovements) {
	
	var coinData = {
			'BTC': {
				'currentPriceEUR': defaultValueUnloadData,
				'variationPriceEUR': defaultValueUnloadData,
				'variationPercent': defaultValueUnloadData
			},
			'ETH': {
				'currentPriceEUR': defaultValueUnloadData,
				'variationPriceEUR': defaultValueUnloadData,
				'variationPercent': defaultValueUnloadData
			},
			'LTC': {
				'currentPriceEUR': defaultValueUnloadData,
				'variationPriceEUR': defaultValueUnloadData,
				'variationPercent': defaultValueUnloadData
			},
			'XRP': {
				'currentPriceEUR': defaultValueUnloadData,
				'variationPriceEUR': defaultValueUnloadData,
				'variationPercent': defaultValueUnloadData
			}
		};
	
	//calculo de 24 horas desde ahora en milisegundos
	var now = new Date().getTime();
	var _24hSecs = ((now - (24 * 3600 * 1000)) / 1000).toFixed(0);
	
	var url = "https://min-api.cryptocompare.com/data/histominute";
	var url_fsym = "?fsym=";
	var url_tsym = "&tsym=" + defaultCurrency;
	var url_limit = "&limit=1";
	var url_toTs = "&toTs=" + _24hSecs;
	
	var urlBTC_24h = url + url_fsym + "BTC" + url_tsym + url_limit + url_toTs;
	var urlBTC_now = url + url_fsym + "BTC" + url_tsym + url_limit;
	
	var urlETH_24h = url + url_fsym + "ETH" + url_tsym + url_limit + url_toTs;
	var urlETH_now = url + url_fsym + "ETH" + url_tsym + url_limit;
	
	var urlLTC_24h = url + url_fsym + "LTC" + url_tsym + url_limit + url_toTs;
	var urlLTC_now = url + url_fsym + "LTC" + url_tsym + url_limit;
	
	var urlXRP_24h = url + url_fsym + "XRP" + url_tsym + url_limit + url_toTs;
	var urlXRP_now = url + url_fsym + "XRP" + url_tsym + url_limit;
	
	// ---- BTC
	var _24hPriceBTC;
	var _nowPriceBTC;
	$.ajax({
		url: urlBTC_24h,
		dataType: 'json'
	}).done(function (results) {
		if(results.Response === responseSuccess) {
			_24hPriceBTC = results.Data[1].close;
		} else if(results.Response === responseError) {
			activateErrorMessage("DATA_ERROR", "Error recuperando precio de BTC. " + results.Message);
		} else {
			activateErrorMessage(null, "Error recuperando precio de BTC. " + results.Message);
		}
		
		$.ajax({
			url: urlBTC_now,
			dataType: 'json'
		}).done(function (results) {
			if(results.Response === responseSuccess) {
				_nowPriceBTC = results.Data[1].close;
				
				var variationPrice = _nowPriceBTC - _24hPriceBTC;
				var variationPercent = variationPrice / _24hPriceBTC;
				coinData.BTC.currentPriceEUR = _nowPriceBTC;
				coinData.BTC.variationPriceEUR = variationPrice;
				coinData.BTC.variationPercent = variationPercent;
				
				updateUserValues(coinData, userCoinData);
				updateUserProfitability(userMovements, coinData, retrieveUserCoinBalance());
			} else if(results.Response === responseError) {
				activateErrorMessage("DATA_ERROR", "Error recuperando precio de BTC. " + results.Message);
			} else {
				activateErrorMessage(null, "Error recuperando precio de BTC. " + results.Message);
			}
		});
	});
	
	// ---- ETH
	var _24hPriceETH;
	var _nowPriceETH;
	$.ajax({
		url: urlETH_24h,
		dataType: 'json'
	}).done(function (results) {
		if(results.Response === responseSuccess) {
			_24hPriceETH = results.Data[1].close;
		} else if(results.Response === responseError) {
			activateErrorMessage("DATA_ERROR", "Error recuperando precio de ETH. " + results.Message);
		} else {
			activateErrorMessage(null, "Error recuperando precio de ETH. " + results.Message);
		}
		
		$.ajax({
			url: urlETH_now,
			dataType: 'json'
		}).done(function (results) {
			if(results.Response === responseSuccess) {
				_nowPriceETH = results.Data[1].close;
				
				var variationPrice = _nowPriceETH - _24hPriceETH;
				var variationPercent = variationPrice / _24hPriceETH;
				coinData.ETH.currentPriceEUR = _nowPriceETH;
				coinData.ETH.variationPriceEUR = variationPrice;
				coinData.ETH.variationPercent = variationPercent;
				
				updateUserValues(coinData, userCoinData);
				updateUserProfitability(userMovements, coinData, retrieveUserCoinBalance());
			} else if(results.Response === responseError) {
				activateErrorMessage("DATA_ERROR", "Error recuperando precio de ETH. " + results.Message);
			} else {
				activateErrorMessage(null, "Error recuperando precio de ETH. " + results.Message);
			}
		});
	});
	
	// ---- LTC
	var _24hPriceLTC;
	var _nowPriceLTC;
	$.ajax({
		url: urlLTC_24h,
		dataType: 'json'
	}).done(function (results) {
		if(results.Response === responseSuccess) {
			_24hPriceLTC = results.Data[1].close;
		} else if(results.Response === responseError) {
			activateErrorMessage("DATA_ERROR", "Error recuperando precio de LTC. " + results.Message);
		} else {
			activateErrorMessage(null, "Error recuperando precio de LTC. " + results.Message);
		}
		
		$.ajax({
			url: urlLTC_now,
			dataType: 'json'
		}).done(function (results) {
			if(results.Response === responseSuccess) {
				_nowPriceLTC = results.Data[1].close;
				
				var variationPrice = _nowPriceLTC - _24hPriceLTC;
				var variationPercent = variationPrice / _24hPriceLTC;
				coinData.LTC.currentPriceEUR = _nowPriceLTC;
				coinData.LTC.variationPriceEUR = variationPrice;
				coinData.LTC.variationPercent = variationPercent;
				
				updateUserValues(coinData, userCoinData);
				updateUserProfitability(userMovements, coinData, retrieveUserCoinBalance());
			} else if(results.Response === responseError) {
				activateErrorMessage("DATA_ERROR", "Error recuperando precio de LTC. " + results.Message);
			} else {
				activateErrorMessage(null, "Error recuperando precio de LTC. " + results.Message);
			}
		});
	});
	
	// ---- XRP
	var _24hPriceXRP;
	var _nowPriceXRP;
	$.ajax({
		url: urlXRP_24h,
		dataType: 'json'
	}).done(function (results) {
		if(results.Response === responseSuccess) {
			_24hPriceXRP = results.Data[1].close;
		} else if(results.Response === responseError) {
			activateErrorMessage("DATA_ERROR", "Error recuperando precio de XRP. " + results.Message);
		} else {
			activateErrorMessage(null, "Error recuperando precio de XRP. " + results.Message);
		}
		
		$.ajax({
			url: urlXRP_now,
			dataType: 'json'
		}).done(function (results) {
			if(results.Response === responseSuccess) {
				_nowPriceXRP = results.Data[1].close;
				
				var variationPrice = _nowPriceXRP - _24hPriceXRP;
				var variationPercent = variationPrice / _24hPriceXRP;
				coinData.XRP.currentPriceEUR = _nowPriceXRP;
				coinData.XRP.variationPriceEUR = variationPrice;
				coinData.XRP.variationPercent = variationPercent;
				
				updateUserValues(coinData, userCoinData);
				updateUserProfitability(userMovements, coinData, retrieveUserCoinBalance());
			} else if(results.Response === responseError) {
				activateErrorMessage("DATA_ERROR", "Error recuperando precio de XRP. " + results.Message);
			} else {
				activateErrorMessage(null, "Error recuperando precio de XRP. " + results.Message);
			}
		});
	});
}

/**
 * 
 * @param frequency
 * @param data
 */
function updatePricesChartValues(frequency, data) {
	var divisa = defaultCurrency;
	var locale = defaultLocale;
	
	var currentPrice = data[data.length-1];
	var firstPrice = data[0];
	var variationPrice = currentPrice - firstPrice;
	var variationPercent = variationPrice / firstPrice;

	var fracDigits = 2;
	if(Math.abs(variationPrice) < 0.1) {
		fracDigits = 4;
	}
	
	$('#currentPrice').html(currentPrice.toLocaleString(locale, {style: 'currency', currency: divisa, minimumFractionDigits: fracDigits}));
	$('#variationPrice_value').html(variationPrice.toLocaleString(locale, {style: 'currency', currency: divisa, minimumFractionDigits: fracDigits}));
	$('#variationPercent_value').html(variationPercent.toLocaleString(locale, {style: 'percent', minimumFractionDigits: 2}));
	
	$('#variationPrice').removeClass('valueUp').removeClass('valueDown');
	$('#variationPercent').removeClass('valueUp').removeClass('valueDown');
	
	if(variationPrice >= 0) {
		$('#variationPrice').addClass('valueUp');
		$('#variationPercent').addClass('valueUp');
	} else {
		$('#variationPrice').addClass('valueDown');
		$('#variationPercent').addClass('valueDown');
	}
}

/**
 * 
 * @param coinData
 * @param userCoinBalance
 */
function updateUserValues(coinData, userCoinBalance) {
	var divisa = defaultCurrency;
	var locale = defaultLocale;

	var ueurb = 0;
	if(userCoinBalance != null && userCoinBalance.EUR != null && !isNaN(userCoinBalance.EUR)) {
		ueurb = userCoinBalance.EUR;
	}
	$('#currentVolumeEur_value').html(ueurb.toLocaleString(locale, {style: 'currency', currency: divisa}));
		
	if(!isNaN(coinData.BTC.currentPriceEUR)) {
		var ucb = 0; 
		if(userCoinBalance != null && userCoinBalance.BTC != null) {
			ucb = userCoinBalance.BTC;
		}
		$('#currentVolumeEur_BTC_value').html((ucb * coinData.BTC.currentPriceEUR).toLocaleString(locale, {style: 'currency', currency: divisa}));
		$('#currentVolumeCoin_BTC_value').html(ucb.toLocaleString(locale, {style: 'decimal', minimumFractionDigits: defaultFracDigitsCoin}));
		$('#currentPrice_BTC_EUR').html(coinData.BTC.currentPriceEUR.toLocaleString(locale, {style: 'currency', currency: divisa}));
		$('#variationPrice_BTC_EUR').html(coinData.BTC.variationPriceEUR.toLocaleString(locale, {style: 'currency', currency: divisa}));
		$('#variationPercent_BTC').html(coinData.BTC.variationPercent.toLocaleString(locale, {style: 'percent', minimumFractionDigits: 2}));
		$('#variationPrice_BTC_EUR').removeClass('valueUp').removeClass('valueDown');
		$('#variationPercent_BTC').removeClass('valueUp').removeClass('valueDown');
		
		if(coinData.BTC.variationPriceEUR >= 0) {
			$('#variationPrice_BTC_EUR').addClass('valueUp');
			$('#variationPercent_BTC').addClass('valueUp');
		} else {
			$('#variationPrice_BTC_EUR').addClass('valueDown');
			$('#variationPercent_BTC').addClass('valueDown');
		}
	}
	
	if(!isNaN(coinData.ETH.currentPriceEUR)) {
		var ucb = 0; 
		if(userCoinBalance != null && userCoinBalance.ETH != null) {
			ucb = userCoinBalance.ETH;
		}
		$('#currentVolumeEur_ETH_value').html((ucb * coinData.ETH.currentPriceEUR).toLocaleString(locale, {style: 'currency', currency: divisa}));
		$('#currentVolumeCoin_ETH_value').html(ucb.toLocaleString(locale, {style: 'decimal', minimumFractionDigits: defaultFracDigitsCoin}));
		$('#currentPrice_ETH_EUR').html(coinData.ETH.currentPriceEUR.toLocaleString(locale, {style: 'currency', currency: divisa}));
		$('#variationPrice_ETH_EUR').html(coinData.ETH.variationPriceEUR.toLocaleString(locale, {style: 'currency', currency: divisa}));
		$('#variationPercent_ETH').html(coinData.ETH.variationPercent.toLocaleString(locale, {style: 'percent', minimumFractionDigits: 2}));
		$('#variationPrice_ETH_EUR').removeClass('valueUp').removeClass('valueDown');
		$('#variationPercent_ETH').removeClass('valueUp').removeClass('valueDown');
		
		if(coinData.ETH.variationPriceEUR >= 0) {
			$('#variationPrice_ETH_EUR').addClass('valueUp');
			$('#variationPercent_ETH').addClass('valueUp');
		} else {
			$('#variationPrice_ETH_EUR').addClass('valueDown');
			$('#variationPercent_ETH').addClass('valueDown');
		}
	}
	
	if(!isNaN(coinData.LTC.currentPriceEUR)) {
		var ucb = 0; 
		if(userCoinBalance != null && userCoinBalance.LTC != null) {
			ucb = userCoinBalance.LTC;
		}
		$('#currentVolumeEur_LTC_value').html((ucb * coinData.LTC.currentPriceEUR).toLocaleString(locale, {style: 'currency', currency: divisa}));
		$('#currentVolumeCoin_LTC_value').html(ucb.toLocaleString(locale, {style: 'decimal', minimumFractionDigits: defaultFracDigitsCoin}));
		$('#currentPrice_LTC_EUR').html(coinData.LTC.currentPriceEUR.toLocaleString(locale, {style: 'currency', currency: divisa}));
		$('#variationPrice_LTC_EUR').html(coinData.LTC.variationPriceEUR.toLocaleString(locale, {style: 'currency', currency: divisa}));
		$('#variationPercent_LTC').html(coinData.LTC.variationPercent.toLocaleString(locale, {style: 'percent', minimumFractionDigits: 2}));
		$('#variationPrice_LTC_EUR').removeClass('valueUp').removeClass('valueDown');
		$('#variationPercent_LTC').removeClass('valueUp').removeClass('valueDown');
		
		if(coinData.LTC.variationPriceEUR >= 0) {
			$('#variationPrice_LTC_EUR').addClass('valueUp');
			$('#variationPercent_LTC').addClass('valueUp');
		} else {
			$('#variationPrice_LTC_EUR').addClass('valueDown');
			$('#variationPercent_LTC').addClass('valueDown');
		}
	}

	if(!isNaN(coinData.XRP.currentPriceEUR)) {
		var ucb = 0; 
		if(userCoinBalance != null && userCoinBalance.XRP != null) {
			ucb = userCoinBalance.XRP;
		}
		$('#currentVolumeEur_XRP_value').html((ucb * coinData.XRP.currentPriceEUR).toLocaleString(locale, {style: 'currency', currency: divisa}));
		$('#currentVolumeCoin_XRP_value').html(ucb.toLocaleString(locale, {style: 'decimal', minimumFractionDigits: defaultFracDigitsCoin}));
		$('#currentPrice_XRP_EUR').html(coinData.XRP.currentPriceEUR.toLocaleString(locale, {style: 'currency', currency: divisa, minimumFractionDigits: 4}));
		$('#variationPrice_XRP_EUR').html(coinData.XRP.variationPriceEUR.toLocaleString(locale, {style: 'currency', currency: divisa, minimumFractionDigits: 4}));
		$('#variationPercent_XRP').html(coinData.XRP.variationPercent.toLocaleString(locale, {style: 'percent', minimumFractionDigits: 4}));
		$('#variationPrice_XRP_EUR').removeClass('valueUp').removeClass('valueDown');
		$('#variationPercent_XRP').removeClass('valueUp').removeClass('valueDown');
		
		if(coinData.XRP.variationPriceEUR >= 0) {
			$('#variationPrice_XRP_EUR').addClass('valueUp');
			$('#variationPercent_XRP').addClass('valueUp');
		} else {
			$('#variationPrice_XRP_EUR').addClass('valueDown');
			$('#variationPercent_XRP').addClass('valueDown');
		}
	}
	
	var currentVolumeTotalEur = 0;
	if(userCoinBalance != null) {
		if(userCoinBalance.EUR != null) {
			currentVolumeTotalEur += userCoinBalance.EUR; 
		}	
		
		if(userCoinBalance.BTC != null) {
			currentVolumeTotalEur += userCoinBalance.BTC * coinData.BTC.currentPriceEUR;
		}
		
		if(userCoinBalance.ETH != null) {
			currentVolumeTotalEur += userCoinBalance.ETH * coinData.ETH.currentPriceEUR;
		}
		
		if(userCoinBalance.LTC != null) {
			currentVolumeTotalEur += userCoinBalance.LTC * coinData.LTC.currentPriceEUR;
		}
		
		if(userCoinBalance.XRP != null) {
			currentVolumeTotalEur += userCoinBalance.XRP * coinData.XRP.currentPriceEUR;
		}
	}
	
	if(!isNaN(currentVolumeTotalEur)) {
		$('#currentVolumeTotalEur_value').html(currentVolumeTotalEur.toLocaleString(locale, {style: 'currency', currency: divisa}));
	}
}

/**
 * 
 * @param buttonId
 */
function selectFrequencyButton(buttonId) {
	$('.buttonFrequency').removeClass('buttonFrequency_selected');
	$('.buttonFrequency').addClass('buttonFrequency_deselected');
	
	$('#' + buttonId).removeClass('buttonFrequency_deselected');
	$('#' + buttonId).addClass('buttonFrequency_selected');
}

/**
 * 
 * @param buttonId
 */
function selectCoinButton(buttonId) {
	$('.buttonCoin').removeClass('buttonCoin_selected');
	$('.buttonCoin').addClass('buttonCoin_deselected');
	
	$('#' + buttonId).removeClass('buttonCoin_deselected');
	$('#' + buttonId).addClass('buttonCoin_selected');
}

/**
 * 
 * @param coin
 * @param frequency
 */
function repaintDashboardScreen(coin, frequency, userCoinBalance) {
	
	clearScreenData();
	
	toggleRefreshMark();
	
	frequencySelected = frequency;
	coinSelected = coin;
	
	selectCoinButton('buttonCoin_' + coinSelected);
	selectFrequencyButton('buttonFrequency_' + frequencySelected);
	
	if($('#chartPricesContainer').is(':visible')) {
		pricesChartVisible = true;
		if(frequencySelected == '1H') {
			drawPricesChart('chart', coinSelected, 'MINUTE', 60);
		} else if(frequencySelected == '24H') {
			drawPricesChart('chart', coinSelected, 'MINUTE', 24 * 60);
		} else if(frequencySelected == '1D') {
			//calculamos el numero de minutos transcurridos del dia
			var now = new Date();
			var beginOfDay = new Date(now.getTime());
			beginOfDay.setHours(0);
			beginOfDay.setMinutes(0);
			beginOfDay.setSeconds(0);
			beginOfDay.setMilliseconds(0);
			
			var diffMillis = now.getTime() - beginOfDay.getTime();
			
			drawPricesChart('chart', coinSelected, 'MINUTE', (diffMillis / 1000 / 60).toFixed(0));
		} else if(frequencySelected == '1S') {
			drawPricesChart('chart', coinSelected, 'HOUR', 7 * 24);
		} else if(frequencySelected == '1M') {
			drawPricesChart('chart', coinSelected, 'HOUR', 30 * 24);
		} else if(frequencySelected == '3M') {
			drawPricesChart('chart', coinSelected, 'DAY', 90);
		} else if(frequencySelected == '6M') {	
			drawPricesChart('chart', coinSelected, 'DAY', 180);
		} else if(frequencySelected == '1A') {	
			drawPricesChart('chart', coinSelected, 'DAY', 365);
		}
	}
	
	var uam = retrieveUserAccountMovements();
	drawUserData(userCoinBalance, uam);
	paintUserAccountMovements(uam);
}

/**
 * 
 * @param movements
 */
function paintUserAccountMovements(movements) {
	
	var locale = defaultLocale;
	
	$('#userAccountMovements_inputs tbody').find('tr:gt(0)').remove();
	$('#userAccountMovements_outputs tbody').find('tr:gt(0)').remove();
	
	movements.inputs.forEach(function(elem) {
		$('#userAccountMovements_inputs tbody').append(
						'<tr>' + 
						'<td>' + elem.date + '</td>' + 
						'<td>' + elem.amount.toLocaleString(locale, {style: 'currency', currency: defaultCurrency}) + '</td>' + 
						'</tr>');
	});
	
	movements.outputs.forEach(function(elem) {
		$('#userAccountMovements_outputs tbody').append(
						'<tr>' + 
						'<td>' + elem.date + '</td>' + 
						'<td>' + elem.amount.toLocaleString(locale, {style: 'currency', currency: defaultCurrency}) + '</td>' + 
						'</tr>');
	});
}

/**
 * 
 * @param movements
 * @param coinData
 * @param userCoinBalance
 */
function updateUserProfitability(movements, coinData, userCoinBalance) {
	var divisa = defaultCurrency;
	var locale = defaultLocale;
	
	var input = 0;
	var output = 0;
	var currentInput = 0;
	var profit = 0;
	
	movements.inputs.forEach(function(elem) {
		input += elem.amount;
	});
	
	movements.outputs.forEach(function(elem) {
		output += elem.amount;
	});
	
	currentInput = input - output;
	
	var currentVolumeTotalEur = 0;
	if(userCoinBalance != null) {
		if(userCoinBalance.EUR != null) {
			currentVolumeTotalEur += userCoinBalance.EUR; 
		}	
		
		if(userCoinBalance.BTC != null) {
			currentVolumeTotalEur += userCoinBalance.BTC * coinData.BTC.currentPriceEUR;
		}
		
		if(userCoinBalance.ETH != null) {
			currentVolumeTotalEur += userCoinBalance.ETH * coinData.ETH.currentPriceEUR;
		}
		
		if(userCoinBalance.LTC != null) {
			currentVolumeTotalEur += userCoinBalance.LTC * coinData.LTC.currentPriceEUR;
		}
		
		if(userCoinBalance.XRP != null) {
			currentVolumeTotalEur += userCoinBalance.XRP * coinData.XRP.currentPriceEUR;
		}
		profit = currentVolumeTotalEur - currentInput;
	}
	
	$('#userProfitability_input').html(input.toLocaleString(locale, {style: 'currency', currency: divisa})); 
	$('#userProfitability_output').html(output.toLocaleString(locale, {style: 'currency', currency: divisa}));
	$('#userProfitability_currentInput').html(currentInput.toLocaleString(locale, {style: 'currency', currency: divisa}));
	if(!isNaN(profit)) {
		$('#userProfitability_profit').html(profit.toLocaleString(locale, {style: 'currency', currency: divisa}));
	}
}

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
	$('#successMessage').show();
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
function toggleUserMovements() {
	$('#userMovements').toggle(500, function() {
		if($(this).is(":visible")) {
			$('#userMovementsToggleButton').html('Ocultar movimientos');
		} else {
			$('#userMovementsToggleButton').html('Mostrar movimientos');
		}
	});
}

/**
 * 
 */
function clearScreenData() {
	$('.updatableData').html(defaultValueUnloadData);
	$('.valueUp').removeClass('valueUp');
	$('.valueDown').removeClass('valueDown');
}

/**
 *
 */
function toggleRefreshMark() {
	var refreshId;
	var delta = 100;
	clearTimeout(refreshId);
	refreshId = setTimeout(function() {
		var endDataLoad = ($(".updatableData:contains('" + defaultValueUnloadData + "')").length == 0) ;
		if(!endDataLoad) {
			$('#buttonRefresh').hide(0);
			$('#refreshMark').show(0);
			toggleRefreshMark();
		} else {
			$('#refreshMark').hide(0);
			$('#buttonRefresh').show(0);
		}
	}, delta);
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

/**
 * 
 */
function drawEditableUserCoinBalance() {
	var locale = defaultLocale;
	var ucb = retrieveUserCoinBalance();
	
	var value;
	if(ucb.EUR != null) {
		value = ucb.EUR; 
	} else {
		value = 0; 
	}
	$('#userBalance_EUR').val(value.toLocaleString(locale, {style: 'decimal', useGrouping: false, minimumFractionDigits: 2, maxFractionDigits: 2}));
	
	var value;
	if(ucb.BTC != null) {
		value = ucb.BTC; 
	} else {
		value = 0; 
	}
	$('#userBalance_BTC').val(value.toLocaleString(locale, {style: 'decimal', useGrouping: false, minimumFractionDigits: defaultFracDigitsCoin}));
	
	var value;
	if(ucb.ETH != null) {
		value = ucb.ETH; 
	} else {
		value = 0; 
	}
	$('#userBalance_ETH').val(value.toLocaleString(locale, {style: 'decimal', useGrouping: false, minimumFractionDigits: defaultFracDigitsCoin}));
	
	var value;
	if(ucb.LTC != null) {
		value = ucb.LTC; 
	} else {
		value = 0; 
	}
	$('#userBalance_LTC').val(value.toLocaleString(locale, {style: 'decimal', useGrouping: false, minimumFractionDigits: defaultFracDigitsCoin}));
	
	var value;
	if(ucb.XRP != null) {
		value = ucb.XRP; 
	} else {
		value = 0; 
	}
	$('#userBalance_XRP').val(value.toLocaleString(locale, {style: 'decimal', useGrouping: false, minimumFractionDigits: defaultFracDigitsCoin}));
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