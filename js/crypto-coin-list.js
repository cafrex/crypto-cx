/**
 *
 */
function drawCoinList() {

	var url = "https://min-api.cryptocompare.com/data/all/coinlist";

	$.ajax({
		url: url,
		dataType: 'json'
	}).done(function (results) {
		if(results.Response === responseSuccess) {
			var coins = [];
			//results.Data.forEach(function(elem) {
			Object.keys(results.Data).forEach(function(key) {
				var elem = results.Data[key];
				var coinDetails = { 'symbol': elem.Symbol,
									'name': elem.CoinName,
									'nameLowercase': elem.CoinName.toLowerCase(),
									'imageUrl': elem.ImageUrl
							};
				coins.push(coinDetails);
			});

			coins.sort(function(a,b) {return (a.nameLowercase > b.nameLowercase) ? 1 : ((b.nameLowercase > a.nameLowercase) ? -1 : 0);} );
			
			paintCoinListTable(coins);
		} else if(results.Response === responseError) {
			activateErrorMessage("DATA_ERROR", "Error recuperando lista de monedas: " + results.Message);
		} else {
			activateErrorMessage(null, "Error recuperando lista de monedas: " + results.Message);
		}
		
	}).fail(function () {
		activateErrorMessage('NO_DATA', "No se han recibido datos");
	});	
}

/**
 *
 */
function paintCoinListTable(coins) {

	coins.forEach(function(elem) {
		
		$('#coinListTable > tbody').append(
								'<tr>' + 
								'<td class="text-left">' +
								'<img class="iconCoinBig" src="https://www.cryptocompare.com' + elem.imageUrl + '">' +
								'</td>' + 
								'<td class="text-left">' + 
								elem.symbol + 
								'</td>' +
								'<td class="text-left">' + 
								elem.name + 
								'</td>' +
								'</tr>');

	});
}

