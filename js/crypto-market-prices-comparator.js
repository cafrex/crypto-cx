var coinChart;
var coinSelected;
var frequencySelected;

/**
 * 
 * @param chartId
 * @param fullData
 * <pre>
 * { 	coin: coinCode,
 * 		ts: [times in millis],
 * 		prices: [
 * 					{ market: marketCode,
 * 					  prices: [prices]
 * 					}
 * 				]
 * }
 * </pre>
 */
function buildPricesChart(chartId, fullData, dateMode) {

	var labelBlanks = " ";
	
	var chartOptions = {
			type: 'line',
			data: {
	        	labels: [],
	        	datasets: []
			},
			options: {
		        scales: {
		        	xAxes: [{
		        		ticks: {
		        			callback: function(value, index, values) {
		        				return labelBlanks + new Date(value).formatDate(dateMode);
		        			},
		                    autoSkip: true,
		                    maxRotation: 0,
		                    minRotation: 45
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
		        	intersect: false,
		            mode: 'label',
		            callbacks: {
		            	label: function(tooltipItem, data) {
		                    var datasetLabel = data.datasets[tooltipItem.datasetIndex].label;
		                    return datasetLabel + ": " + tooltipItem.yLabel.formatNumber('CURRENCY');
		                },
		                title: function(tooltipItem, data) {
                			return new Date(data.labels[tooltipItem[0].index]).formatDate('FULL');
		                }
		            }
		        }
		    }
	    };
	
	if(coinChart != null) {
		coinChart.destroy();
	}
	
	var ctx = document.getElementById(chartId).getContext('2d');
	coinChart = new Chart(ctx, chartOptions);
	
	if(fullData.ts != null) {
		fullData.ts.forEach(function(elem) {
			coinChart.data.labels.push(elem.dateMillis);
		});
		
		fullData.prices.forEach(function(elem) {
			
			var prices = [];
			elem.prices.forEach(function(price) {
				prices.push(price);
			});
			
			coinChart.data.datasets.push({
		    	label: elem.market,
		        data: prices,
		        backgroundColor: 'rgba(54, 162, 235,0.2)',
		        borderColor: 'rgba(54, 162, 235,1)',
		        borderWidth: '1',
		        pointRadius: 0,
		        yAxisID: "y-axis-price"
			});
		});
	}
	
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
						'prices': []
					};
			results.Data.forEach(function(elem) {
				var price = { 	'dateMillis': elem.time * 1000,
								'price': elem.close
							};
				data.prices.push(price);
			});
			
			buildPricesChart(chartId, data, dateMode);
			updatePricesChartValues(frequency, data);
		} else if(results.Response === responseError) {
			activateErrorMessage("DATA_ERROR", "Error recuperando datos de la gráfica de precios: " + results.Message);
		} else {
			activateErrorMessage(null, "Error recuperando datos de la gráfica de precios: " + results.Message);
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
				updateUserProfitability(userMovements, coinData, retrieveUserCoinBalance(getLoggedUser()));
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
				updateUserProfitability(userMovements, coinData, retrieveUserCoinBalance(getLoggedUser()));
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
				updateUserProfitability(userMovements, coinData, retrieveUserCoinBalance(getLoggedUser()));
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
				updateUserProfitability(userMovements, coinData, retrieveUserCoinBalance(getLoggedUser()));
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
 * @param coinData
 * @param userCoinBalance
 */
function updateUserValues(coinData, userCoinBalance) {
	var ueurb = 0;
	if(userCoinBalance != null && userCoinBalance.EUR != null && !isNaN(userCoinBalance.EUR)) {
		ueurb = userCoinBalance.EUR;
	}
	$('#currentVolumeEur_value').html(ueurb.formatNumber('CURRENCY'));
		
	if(!isNaN(coinData.BTC.currentPriceEUR)) {
		var ucb = 0; 
		if(userCoinBalance != null && userCoinBalance.BTC != null) {
			ucb = userCoinBalance.BTC;
		}
		$('#currentVolumeEur_BTC_value').html((ucb * coinData.BTC.currentPriceEUR).formatNumber('CURRENCY'));
		$('#currentVolumeCoin_BTC_value').html(ucb.formatNumber('COIN'));
		$('#currentPrice_BTC_EUR').html(coinData.BTC.currentPriceEUR.formatNumber('CURRENCY'));
		$('#variationPrice_BTC_EUR').html(coinData.BTC.variationPriceEUR.formatNumber('CURRENCY'));
		$('#variationPercent_BTC').html(coinData.BTC.variationPercent.formatNumber('PERCENT'));
		
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
		$('#currentVolumeEur_ETH_value').html((ucb * coinData.ETH.currentPriceEUR).formatNumber('CURRENCY'));
		$('#currentVolumeCoin_ETH_value').html(ucb.formatNumber('COIN'));
		$('#currentPrice_ETH_EUR').html(coinData.ETH.currentPriceEUR.formatNumber('CURRENCY'));
		$('#variationPrice_ETH_EUR').html(coinData.ETH.variationPriceEUR.formatNumber('CURRENCY'));
		$('#variationPercent_ETH').html(coinData.ETH.variationPercent.formatNumber('PERCENT'));
		
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
		$('#currentVolumeEur_LTC_value').html((ucb * coinData.LTC.currentPriceEUR).formatNumber('CURRENCY'));
		$('#currentVolumeCoin_LTC_value').html(ucb.formatNumber('COIN'));
		$('#currentPrice_LTC_EUR').html(coinData.LTC.currentPriceEUR.formatNumber('CURRENCY'));
		$('#variationPrice_LTC_EUR').html(coinData.LTC.variationPriceEUR.formatNumber('CURRENCY'));
		$('#variationPercent_LTC').html(coinData.LTC.variationPercent.formatNumber('PERCENT'));
		
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
		$('#currentVolumeEur_XRP_value').html((ucb * coinData.XRP.currentPriceEUR).formatNumber('CURRENCY'));
		$('#currentVolumeCoin_XRP_value').html(ucb.formatNumber('COIN'));
		$('#currentPrice_XRP_EUR').html(coinData.XRP.currentPriceEUR.formatNumber('CURRENCY', 4));
		$('#variationPrice_XRP_EUR').html(coinData.XRP.variationPriceEUR.formatNumber('CURRENCY', 4));
		$('#variationPercent_XRP').html(coinData.XRP.variationPercent.formatNumber('PERCENT', 4));
		
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
		$('#currentVolumeTotalEur_value').html(currentVolumeTotalEur.formatNumber('CURRENCY'));
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
function repaintMarketPricesScreen(coin, frequency) {
	
	clearScreenData();
	
	toggleRefreshMark();
	
	frequencySelected = frequency;
	coinSelected = coin;
	
	selectCoinButton('buttonCoin_' + coinSelected);
	selectFrequencyButton('buttonFrequency_' + frequencySelected);
	
	switch(frequencySelected) {
		case '1H':
			drawPricesChart('chart', coinSelected, 'MINUTE', 60);
			break;
		case '24H':
			drawPricesChart('chart', coinSelected, 'MINUTE', 24 * 60);
			break;
		case '1D':
			//calculamos el numero de minutos transcurridos del dia
			var now = new Date();
			var beginOfDay = new Date(now.getTime());
			beginOfDay.setHours(0);
			beginOfDay.setMinutes(0);
			beginOfDay.setSeconds(0);
			beginOfDay.setMilliseconds(0);
			var diffMillis = now.getTime() - beginOfDay.getTime();
			drawPricesChart('chart', coinSelected, 'MINUTE', (diffMillis / 1000 / 60).toFixed(0));
			break;
		case '2D':
			//calculamos el numero de minutos transcurridos en 2 dias
			var now = new Date();
			var beginOfDay = new Date(now.getTime());
			beginOfDay.setHours(0);
			beginOfDay.setMinutes(0);
			beginOfDay.setSeconds(0);
			beginOfDay.setMilliseconds(0);
			var diffMillis = now.getTime() - beginOfDay.getTime() + (24 * 60 * 60 * 1000 * 1);
			drawPricesChart('chart', coinSelected, 'HOUR', (diffMillis / 1000 / 60 / 60).toFixed(0));
			break;
		case '3D':
			//calculamos el numero de minutos transcurridos en 3 dias
			var now = new Date();
			var beginOfDay = new Date(now.getTime());
			beginOfDay.setHours(0);
			beginOfDay.setMinutes(0);
			beginOfDay.setSeconds(0);
			beginOfDay.setMilliseconds(0);
			var diffMillis = now.getTime() - beginOfDay.getTime() + (24 * 60 * 60 * 1000 * 2);
			drawPricesChart('chart', coinSelected, 'HOUR', (diffMillis / 1000 / 60 / 60).toFixed(0));
			break;
		case '4D':
			//calculamos el numero de minutos transcurridos en 4 dias
			var now = new Date();
			var beginOfDay = new Date(now.getTime());
			beginOfDay.setHours(0);
			beginOfDay.setMinutes(0);
			beginOfDay.setSeconds(0);
			beginOfDay.setMilliseconds(0);
			var diffMillis = now.getTime() - beginOfDay.getTime() + (24 * 60 * 60 * 1000 * 3);
			drawPricesChart('chart', coinSelected, 'HOUR', (diffMillis / 1000 / 60 / 60).toFixed(0));
			break;
		case '1S':
			drawPricesChart('chart', coinSelected, 'HOUR', 7 * 24);
			break;
		case '1M':
			drawPricesChart('chart', coinSelected, 'HOUR', 30 * 24);
			break;
		case '3M':
			drawPricesChart('chart', coinSelected, 'DAY', 90);
			break;
		case '6M':
			drawPricesChart('chart', coinSelected, 'DAY', 180);
			break;
		case '1A':
			drawPricesChart('chart', coinSelected, 'DAY', 365);
			break;
	}
	
	drawUserData(userCoinBalance, uam);
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

