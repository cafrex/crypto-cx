var coinSelected;
var frequencySelected;
var coinChart;
var defaultCurrency = 'EUR';
var defaultLocale = 'es-ES';
var defaultValueUnloadData = '---';

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
		        				return labelBlanks + value + labelBlanks;
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
		
	}).fail(function () {
		activateChartError('NO_DATA');
	});
}

/**
 * 
 * @param userCoinData
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
	
	var urlBTC_24h = 'https://min-api.cryptocompare.com/data/histominute?fsym=BTC&tsym=' + defaultCurrency + "&limit=1" + "&toTs=" + _24hSecs;
	var urlBTC_now = 'https://min-api.cryptocompare.com/data/histominute?fsym=BTC&tsym=' + defaultCurrency + "&limit=1";
	
	var urlETH_24h = 'https://min-api.cryptocompare.com/data/histominute?fsym=ETH&tsym=' + defaultCurrency + "&limit=1" + "&toTs=" + _24hSecs;
	var urlETH_now = 'https://min-api.cryptocompare.com/data/histominute?fsym=ETH&tsym=' + defaultCurrency + "&limit=1";
	
	var urlLTC_24h = 'https://min-api.cryptocompare.com/data/histominute?fsym=LTC&tsym=' + defaultCurrency + "&limit=1" + "&toTs=" + _24hSecs;
	var urlLTC_now = 'https://min-api.cryptocompare.com/data/histominute?fsym=LTC&tsym=' + defaultCurrency + "&limit=1";
	
	var urlXRP_24h = 'https://min-api.cryptocompare.com/data/histominute?fsym=XRP&tsym=' + defaultCurrency + "&limit=1" + "&toTs=" + _24hSecs;
	var urlXRP_now = 'https://min-api.cryptocompare.com/data/histominute?fsym=XRP&tsym=' + defaultCurrency + "&limit=1";
	
	// ---- BTC
	var _24hPriceBTC;
	var _nowPriceBTC;
	$.ajax({
		url: urlBTC_24h,
		dataType: 'json'
	}).done(function (results) {
		_24hPriceBTC = results.Data[1].close;
		
		$.ajax({
			url: urlBTC_now,
			dataType: 'json'
		}).done(function (results) {
			_nowPriceBTC = results.Data[1].close;
			
			var variationPrice = _nowPriceBTC - _24hPriceBTC;
			var variationPercent = variationPrice / _24hPriceBTC;
			coinData.BTC.currentPriceEUR = _nowPriceBTC;
			coinData.BTC.variationPriceEUR = variationPrice;
			coinData.BTC.variationPercent = variationPercent;
			
			updateUserValues(coinData, userCoinData);
			updateUserProfitability(userMovements, coinData, userCoinBalance);
		});
	});
	
	// ---- ETH
	var _24hPriceETH;
	var _nowPriceETH;
	$.ajax({
		url: urlETH_24h,
		dataType: 'json'
	}).done(function (results) {
		_24hPriceETH = results.Data[1].close;
		
		$.ajax({
			url: urlETH_now,
			dataType: 'json'
		}).done(function (results) {
			_nowPriceETH = results.Data[1].close;
			
			var variationPrice = _nowPriceETH - _24hPriceETH;
			var variationPercent = variationPrice / _24hPriceETH;
			coinData.ETH.currentPriceEUR = _nowPriceETH;
			coinData.ETH.variationPriceEUR = variationPrice;
			coinData.ETH.variationPercent = variationPercent;
			
			updateUserValues(coinData, userCoinData);
			updateUserProfitability(userMovements, coinData, userCoinBalance);
		});
	});
	
	// ---- LTC
	var _24hPriceLTC;
	var _nowPriceLTC;
	$.ajax({
		url: urlLTC_24h,
		dataType: 'json'
	}).done(function (results) {
		_24hPriceLTC = results.Data[1].close;
		
		$.ajax({
			url: urlLTC_now,
			dataType: 'json'
		}).done(function (results) {
			_nowPriceLTC = results.Data[1].close;
			
			var variationPrice = _nowPriceLTC - _24hPriceLTC;
			var variationPercent = variationPrice / _24hPriceLTC;
			coinData.LTC.currentPriceEUR = _nowPriceLTC;
			coinData.LTC.variationPriceEUR = variationPrice;
			coinData.LTC.variationPercent = variationPercent;
			
			updateUserValues(coinData, userCoinData);
			updateUserProfitability(userMovements, coinData, userCoinBalance);
		});
	});
	
	// ---- XRP
	var _24hPriceXRP;
	var _nowPriceXRP;
	$.ajax({
		url: urlXRP_24h,
		dataType: 'json'
	}).done(function (results) {
		_24hPriceXRP = results.Data[1].close;
		
		$.ajax({
			url: urlXRP_now,
			dataType: 'json'
		}).done(function (results) {
			_nowPriceXRP = results.Data[1].close;
			
			var variationPrice = _nowPriceXRP - _24hPriceXRP;
			var variationPercent = variationPrice / _24hPriceXRP;
			coinData.XRP.currentPriceEUR = _nowPriceXRP;
			coinData.XRP.variationPriceEUR = variationPrice;
			coinData.XRP.variationPercent = variationPercent;
			
			updateUserValues(coinData, userCoinData);
			updateUserProfitability(userMovements, coinData, userCoinBalance);
		});
	});
}


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

	var fracDigitsCoin = 8;

	if(userCoinBalance.EUR != defaultValueUnloadData) {
		$('#currentVolumeEur_value').html(userCoinBalance.EUR.toLocaleString(locale, {style: 'currency', currency: divisa}));
	}
		
	if(coinData.BTC.currentPriceEUR != defaultValueUnloadData) {
		$('#currentPrice_BTC_EUR').html(coinData.BTC.currentPriceEUR.toLocaleString(locale, {style: 'currency', currency: divisa}));
		$('#currentVolumeEur_BTC_value').html((userCoinBalance.BTC * coinData.BTC.currentPriceEUR).toLocaleString(locale, {style: 'currency', currency: divisa}));
		$('#currentVolumeCoin_BTC_value').html(userCoinBalance.BTC.toLocaleString(locale, {style: 'decimal', minimumFractionDigits: fracDigitsCoin}));
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
	
	if(coinData.ETH.currentPriceEUR != defaultValueUnloadData) {
		$('#currentPrice_ETH_EUR').html(coinData.ETH.currentPriceEUR.toLocaleString(locale, {style: 'currency', currency: divisa}));
		$('#currentVolumeEur_ETH_value').html((userCoinBalance.ETH * coinData.ETH.currentPriceEUR).toLocaleString(locale, {style: 'currency', currency: divisa}));
		$('#currentVolumeCoin_ETH_value').html(userCoinBalance.ETH.toLocaleString(locale, {style: 'decimal', minimumFractionDigits: fracDigitsCoin}));
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
	
	if(coinData.LTC.currentPriceEUR != defaultValueUnloadData) {
		$('#currentPrice_LTC_EUR').html(coinData.LTC.currentPriceEUR.toLocaleString(locale, {style: 'currency', currency: divisa}));
		$('#currentVolumeEur_LTC_value').html((userCoinBalance.LTC * coinData.LTC.currentPriceEUR).toLocaleString(locale, {style: 'currency', currency: divisa}));
		$('#currentVolumeCoin_LTC_value').html(userCoinBalance.LTC.toLocaleString(locale, {style: 'decimal', minimumFractionDigits: fracDigitsCoin}));
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
	
	if(coinData.XRP.currentPriceEUR != defaultValueUnloadData) {
		$('#currentPrice_XRP_EUR').html(coinData.XRP.currentPriceEUR.toLocaleString(locale, {style: 'currency', currency: divisa, minimumFractionDigits: 4}));
		$('#currentVolumeEur_XRP_value').html((userCoinBalance.XRP * coinData.XRP.currentPriceEUR).toLocaleString(locale, {style: 'currency', currency: divisa}));
		$('#currentVolumeCoin_XRP_value').html(userCoinBalance.XRP.toLocaleString(locale, {style: 'decimal', minimumFractionDigits: fracDigitsCoin}));
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
		
	var currentVolumeTotalEur = userCoinBalance.EUR	
									+ (userCoinBalance.BTC * coinData.BTC.currentPriceEUR)
									+ (userCoinBalance.ETH * coinData.ETH.currentPriceEUR)
									+ (userCoinBalance.LTC * coinData.LTC.currentPriceEUR)
									+ (userCoinBalance.XRP * coinData.XRP.currentPriceEUR);
	
	$('#currentVolumeTotalEur_value').html(currentVolumeTotalEur.toLocaleString(locale, {style: 'currency', currency: divisa}));
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
function repaintScreen(coin, frequency) {
	
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
			//calcular el numero de minutos transcurridos del dia
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
	
	drawUserData(userCoinBalance, userAccountMovements);
	paintUserAccountMovements(userAccountMovements);
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
	
	var currentVolumeTotalEur = userCoinBalance.EUR	
								+ (userCoinBalance.BTC * coinData.BTC.currentPriceEUR)
								+ (userCoinBalance.ETH * coinData.ETH.currentPriceEUR)
								+ (userCoinBalance.LTC * coinData.LTC.currentPriceEUR)
								+ (userCoinBalance.XRP * coinData.XRP.currentPriceEUR);
	profit = currentVolumeTotalEur - currentInput;
	
	$('#userProfitability_input').html(input.toLocaleString(locale, {style: 'currency', currency: divisa})); 
	$('#userProfitability_output').html(output.toLocaleString(locale, {style: 'currency', currency: divisa}));
	$('#userProfitability_currentInput').html(currentInput.toLocaleString(locale, {style: 'currency', currency: divisa}));
	$('#userProfitability_profit').html(profit.toLocaleString(locale, {style: 'currency', currency: divisa}));
}

/**
 * 
 * @param type
 */
function activateChartError(type) {

	var content = "Error desconocido";

	switch(type) {
		case 'NO_DATA':
			content = "No se han recibido datos";
			break;
	}

	$('#chartErrorContainer').html(content).show();
	$('#chartContainer').hide(0);

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
