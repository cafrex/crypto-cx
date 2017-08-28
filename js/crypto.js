var coinSelected;
var frequencySelected;
var showVolumeSelected;
var coinChart;
var pieCoinChart;
var pricesChartVisible = false;
var endDataLoad;

/**
 * 
 * @param chartId
 * @param labels
 * @param fullData
 * @param showVolume
 */
function buildPricesChart(chartId, labels, fullData, showVolume) {

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
	
	if(showVolume) {
		chartOptions.options.scales.yAxes.push({
					        	position: "right",
					            id: "y-axis-volume",
					        	ticks: { 
					        		beginAtZero: false
					        	}
							});
	}

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
	
	
	
	if(showVolume) {
		
		coinChart.data.datasets.push({
	    	label: 'Volumen desde',
	        data: fullData.volumeFrom,
	        backgroundColor: 'rgba(54, 162, 235, 0)',
	        borderColor: 'rgba(214, 76, 44, 1)',
	        borderWidth: '1',
	        pointRadius: 0,
	        yAxisID: "y-axis-volume"
		});

		coinChart.data.datasets.push({
	    	label: 'Volumen hasta',
	        data: fullData.volumeTo,
	        backgroundColor: 'rgba(54, 162, 235, 0)',
	        borderColor: 'rgba(13, 102, 22, 1)',
	        borderWidth: '1',
	        pointRadius: 0,
	        yAxisID: "y-axis-volume"
		});
	}
	
	coinChart.update();
}

/**
 * 
 * @param chartId
 * @param labels
 * @param data
 */
function buildPieChart(chartId, labels, data) {
	
	var chartOptions = {
			type: 'doughnut',
			data: {
	        	labels: labels,
	        	datasets: []
			}
	    };

	if(pieCoinChart != null) {
		pieCoinChart.destroy();
	}
	
	var ctx = document.getElementById(chartId).getContext('2d');
	pieCoinChart = new Chart(ctx, chartOptions);
	
	pieCoinChart.data.datasets.push({
        data: data,
        backgroundColor: [
                          'rgba(51, 87, 160, 0.2)',
                          'rgba(51, 160, 53, 0.2)',
                          'rgba(96, 14, 50, 0.2)',
                          'rgba(219, 123, 63, 0.2)',
                          'rgba(201, 195, 191, 0.2)'
                          ],
        borderColor: [
						'rgba(51, 87, 160, 1)',
						'rgba(51, 160, 53, 1)',
						'rgba(96, 14, 50, 1)',
						'rgba(219, 123, 63, 1)',
						'rgba(201, 195, 191, 1)'
                      ],
        borderWidth: '1'
	});
	
	pieCoinChart.update(0);
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
 * @param showVolume
 */
function drawPricesChart(chartId, coin, frequency, limit, showVolume) {

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
		if(limit <= 1 * 24) {
			dateMode = 'HOUR';
		} else if(limit <= 30 * 24) {
			dateMode = 'DAY_MONTH';
		} else {
			dateMode = 'MONTH_YEAR';
		}
	} else if(frequency == 'MINUTE') {
		url += 'histominute';
		if(limit <= 1 * 24 * 60) {
			dateMode = 'HOUR';
		} else if(limit <= 30 * 24 * 60) {
			dateMode = 'DAY_MONTH';
		} else {
			dateMode = 'MONTH_YEAR';
		}
	}
	
	url += '?fsym=' + coin;
	
	url += '&tsym=EUR';
	
	url += '&limit=' + limit;
	
	/* mercado */
	//url += '&e=Coinbase';
	
	$.ajax({
		url: url,
		dataType: 'json'
	}).done(function (results) {
		var labels = [];
		var data = {'coin': coin,
				'price': [],
				'volumeFrom': [],
				'volumeTo': []
				};
		data.coin = coin;
		
		
		results.Data.forEach(function(elem) {
			labels.push((new Date(elem.time * 1000)).formatDate(dateMode));
			data.price.push(elem.close);
			data.volumeFrom.push(elem.volumefrom);
			data.volumeTo.push(elem.volumeto);
		});
		
		buildPricesChart(chartId, labels, data, showVolume);
		updatePricesChartValues(frequency, data.price);
		
	}).fail(function () {
		activateChartError('NO_DATA');
	}
	);
}

/**
 * 
 * @param userCoinData
 */
function drawUserData(userCoinData, userMovements) {
	
	var coinData = {
			'BTC': {
				'currentPriceEUR': 0,
				'variationPriceEUR': 0,
				'variationPercent': 0
			},
			'ETH': {
				'currentPriceEUR': 0,
				'variationPriceEUR': 0,
				'variationPercent': 0
			},
			'LTC': {
				'currentPriceEUR': 0,
				'variationPriceEUR': 0,
				'variationPercent': 0
			},
			'XRP': {
				'currentPriceEUR': 0,
				'variationPriceEUR': 0,
				'variationPercent': 0
			}
		};

	var urlBTC = 'https://www.cryptocompare.com/api/data/coinsnapshot?fsym=BTC&tsym=EUR';
	var urlETH = 'https://www.cryptocompare.com/api/data/coinsnapshot?fsym=ETH&tsym=EUR';
	var urlLTC = 'https://www.cryptocompare.com/api/data/coinsnapshot?fsym=LTC&tsym=EUR';
	var urlXRP = 'https://www.cryptocompare.com/api/data/coinsnapshot?fsym=XRP&tsym=EUR';
	
	$.ajax({
		url: urlBTC,
		dataType: 'json'
	}).done(function (results) {
		var currentPrice = parseFloat(results.Data.AggregatedData.PRICE);
		var firstPrice = results.Data.AggregatedData.OPEN24HOUR;
		var variationPrice = currentPrice - firstPrice;
		var variationPercent = variationPrice / firstPrice;
		coinData.BTC.currentPriceEUR = currentPrice;
		coinData.BTC.variationPriceEUR = variationPrice;
		coinData.BTC.variationPercent = variationPercent;
		
		$.ajax({
			url: urlETH,
			dataType: 'json'
		}).done(function (results) {
			var currentPrice = parseFloat(results.Data.AggregatedData.PRICE);
			var firstPrice = results.Data.AggregatedData.OPEN24HOUR;
			var variationPrice = currentPrice - firstPrice;
			var variationPercent = variationPrice / firstPrice;
			coinData.ETH.currentPriceEUR = currentPrice;
			coinData.ETH.variationPriceEUR = variationPrice;
			coinData.ETH.variationPercent = variationPercent;
			
			$.ajax({
				url: urlLTC,
				dataType: 'json'
			}).done(function (results) {
				var currentPrice = parseFloat(results.Data.AggregatedData.PRICE);
				var firstPrice = results.Data.AggregatedData.OPEN24HOUR;
				var variationPrice = currentPrice - firstPrice;
				var variationPercent = variationPrice / firstPrice;
				coinData.LTC.currentPriceEUR = currentPrice;
				coinData.LTC.variationPriceEUR = variationPrice;
				coinData.LTC.variationPercent = variationPercent;
				
				$.ajax({
					url: urlXRP,
					dataType: 'json'
				}).done(function (results) {
					var currentPrice = parseFloat(results.Data.AggregatedData.PRICE);
					var firstPrice = results.Data.AggregatedData.OPEN24HOUR;
					var variationPrice = currentPrice - firstPrice;
					var variationPercent = variationPrice / firstPrice;
					coinData.XRP.currentPriceEUR = currentPrice;
					coinData.XRP.variationPriceEUR = variationPrice;
					coinData.XRP.variationPercent = variationPercent;
					
					updateUserValues(coinData, userCoinData);
					updateUserProfitability(userMovements, coinData, userCoinBalance);
					
					endDataLoad = true;
					});
				
				});
			
			});
			
		});
		
}

/**
 * 
 * @param data
 * @returns {Array}
 */
function normalizeData(data) {
	var min = -1;
	var max = -1;
	data.forEach(function(ele) {
		if(min == -1) {
			min = ele;
		}
		else if(min > ele) {
			min = ele;
		}
		
		if(max < ele) {
			max = ele;
		}
	});
	
	var datosN = [];
	data.forEach(function(ele) {
		datosN.push((ele - min) / (max - min));
	});
	
	return datosN;
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
	var divisa = 'EUR';
	var locale = 'es-ES';
	
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
	var divisaEUR = 'EUR';
	var locale = 'es-ES';

	var fracDigitsCoin = 8;

	$('#currentVolumeEur_value').html(userCoinBalance.EUR.toLocaleString(locale, {style: 'currency', currency: divisaEUR}));
	
	$('#currentPrice_BTC_EUR').html(coinData.BTC.currentPriceEUR.toLocaleString(locale, {style: 'currency', currency: divisaEUR}));
	$('#currentVolumeEur_BTC_value').html((userCoinBalance.BTC * coinData.BTC.currentPriceEUR).toLocaleString(locale, {style: 'currency', currency: divisaEUR}));
	$('#currentVolumeCoin_BTC_value').html(userCoinBalance.BTC.toLocaleString(locale, {style: 'decimal', minimumFractionDigits: fracDigitsCoin}));
	$('#variationPrice_BTC_EUR').html(coinData.BTC.variationPriceEUR.toLocaleString(locale, {style: 'currency', currency: divisaEUR}));
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
	
	$('#currentPrice_ETH_EUR').html(coinData.ETH.currentPriceEUR.toLocaleString(locale, {style: 'currency', currency: divisaEUR}));
	$('#currentVolumeEur_ETH_value').html((userCoinBalance.ETH * coinData.ETH.currentPriceEUR).toLocaleString(locale, {style: 'currency', currency: divisaEUR}));
	$('#currentVolumeCoin_ETH_value').html(userCoinBalance.ETH.toLocaleString(locale, {style: 'decimal', minimumFractionDigits: fracDigitsCoin}));
	$('#variationPrice_ETH_EUR').html(coinData.ETH.variationPriceEUR.toLocaleString(locale, {style: 'currency', currency: divisaEUR}));
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

	$('#currentPrice_LTC_EUR').html(coinData.LTC.currentPriceEUR.toLocaleString(locale, {style: 'currency', currency: divisaEUR}));
	$('#currentVolumeEur_LTC_value').html((userCoinBalance.LTC * coinData.LTC.currentPriceEUR).toLocaleString(locale, {style: 'currency', currency: divisaEUR}));
	$('#currentVolumeCoin_LTC_value').html(userCoinBalance.LTC.toLocaleString(locale, {style: 'decimal', minimumFractionDigits: fracDigitsCoin}));
	$('#variationPrice_LTC_EUR').html(coinData.LTC.variationPriceEUR.toLocaleString(locale, {style: 'currency', currency: divisaEUR}));
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
	
	$('#currentPrice_XRP_EUR').html(coinData.XRP.currentPriceEUR.toLocaleString(locale, {style: 'currency', currency: divisaEUR, minimumFractionDigits: 4}));
	$('#currentVolumeEur_XRP_value').html((userCoinBalance.XRP * coinData.XRP.currentPriceEUR).toLocaleString(locale, {style: 'currency', currency: divisaEUR}));
	$('#currentVolumeCoin_XRP_value').html(userCoinBalance.XRP.toLocaleString(locale, {style: 'decimal', minimumFractionDigits: fracDigitsCoin}));
	$('#variationPrice_XRP_EUR').html(coinData.XRP.variationPriceEUR.toLocaleString(locale, {style: 'currency', currency: divisaEUR, minimumFractionDigits: 4}));
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
	
	var currentVolumeTotalEur = userCoinBalance.EUR	
									+ (userCoinBalance.BTC * coinData.BTC.currentPriceEUR)
									+ (userCoinBalance.ETH * coinData.ETH.currentPriceEUR)
									+ (userCoinBalance.LTC * coinData.LTC.currentPriceEUR)
									+ (userCoinBalance.XRP * coinData.XRP.currentPriceEUR);
	
	$('#currentVolumeTotalEur_value').html(currentVolumeTotalEur.toLocaleString(locale, {style: 'currency', currency: divisaEUR}));
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
 * @param showVolume
 */
function repaintScreen(coin, frequency, showVolume) {
	
	endDataLoad = false;
	toggleRefreshMark();
	
	clearScreenData();
	
	frequencySelected = frequency;
	coinSelected = coin;
	showVolumeSelected = showVolume;
	
	selectCoinButton('buttonCoin_' + coinSelected);
	selectFrequencyButton('buttonFrequency_' + frequencySelected);
	
	if($('#chartPricesContainer').is(':visible')) {
		pricesChartVisible = true;
		if(frequencySelected == '1H') {
			drawPricesChart('chart', coinSelected, 'MINUTE', 60, showVolume);
		} else if(frequencySelected == '24H') {
			drawPricesChart('chart', coinSelected, 'MINUTE', 24 * 60, showVolume);
		} else if(frequencySelected == '1D') {
			//calcular el numero de minutos transcurridos del dia
			var now = new Date();
			var beginOfDay = new Date(now.getTime());
			beginOfDay.setHours(0);
			beginOfDay.setMinutes(0);
			beginOfDay.setSeconds(0);
			beginOfDay.setMilliseconds(0);
			
			var diffMillis = now.getTime() - beginOfDay.getTime();
			
			drawPricesChart('chart', coinSelected, 'MINUTE', (diffMillis / 1000 / 60).toFixed(0), showVolume);
		} else if(frequencySelected == '1S') {
			drawPricesChart('chart', coinSelected, 'HOUR', 7 * 24, showVolume);
		} else if(frequencySelected == '1M') {
			drawPricesChart('chart', coinSelected, 'HOUR', 30 * 24, showVolume);
		} else if(frequencySelected == '3M') {
			drawPricesChart('chart', coinSelected, 'DAY', 90, showVolume);
		} else if(frequencySelected == '6M') {	
			drawPricesChart('chart', coinSelected, 'DAY', 180, showVolume);
		} else if(frequencySelected == '1A') {	
			drawPricesChart('chart', coinSelected, 'DAY', 365, showVolume);
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
	
	$('#userAccountMovements_inputs tbody').find('tr:gt(0)').remove();
	$('#userAccountMovements_outputs tbody').find('tr:gt(0)').remove();
	
	movements.inputs.forEach(function(elem) {
		$('#userAccountMovements_inputs tbody').append(
						'<tr>' + 
						'<td>' + elem.date + '</td>' + 
						'<td>' + elem.amount.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'}) + '</td>' + 
						'</tr>');
	});
	
	movements.outputs.forEach(function(elem) {
		$('#userAccountMovements_outputs tbody').append(
						'<tr>' + 
						'<td>' + elem.date + '</td>' + 
						'<td>' + elem.amount.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'}) + '</td>' + 
						'</tr>');
	});
}

/**
 * 
 * @param movements
 */
function updateUserProfitability(movements, coinData, userCoinBalance) {
	var divisa = 'EUR';
	var locale = 'es-ES';
	
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
function togglePricesChart() {
	$('#chartPricesContainer').toggle(0, function() {
		if($(this).is(":visible")) {
			$('#chartPricesToggleButton').html('Ocultar gráfica');
			repaintScreen(coinSelected, frequencySelected);
			pricesChartVisible = true;
		} else {
			$('#chartPricesToggleButton').html('Mostrar gráfica');
			pricesChartVisible = false;
		}
	});
}

/**
 * 
 */
function clearScreenData() {
	$('.updatableData').html('---');
	$('.valueUp').removeClass('valueUp');
	$('.valueDown').removeClass('valueDown');
}

/**
 *  control de redimensionado de pantalla
 */
$(window).resize(function() {
	var resizeId;
	var delta = 200;
    clearTimeout(resizeId);
    resizeId = setTimeout(function() {
    	if(!pricesChartVisible) {
        	pricesChartVisible = true;
        	repaintScreen(coinSelected, frequencySelected);
        }
    }, delta);
});


/**
 *
 */
function toggleRefreshMark() {
	var refreshId;
	var delta = 100;
    clearTimeout(refreshId);
    refreshId = setTimeout(function() {
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