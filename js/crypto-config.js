
var cryptoConfig = {
		environment: "prd",
		defaultChartCoinSelected: "XRP",
		adminUsersList: ["david"],
		menu: [
			{	id: "menu_dashboard",
				visible: true,
				onlyAdminVisible: false
			},
			{	id: "menu_editUserBalance",
				visible: true,
				onlyAdminVisible: false
			},
			{	id: "menu_editUserProfitBase",
				visible: true,
				onlyAdminVisible: false
			},
			{	id: "menu_editUserMovements",
				visible: true,
				onlyAdminVisible: false
			},
			{	id: "menu_marketPricesComparator",
				visible: false,
				onlyAdminVisible: false
			},
			{	id: "menu_usersAdministrator",
				visible: true,
				onlyAdminVisible: true
			}
		],
		defaultCoins: ["BTC",
		               "ETH",
		               "LTC",
		               "XRP"
		               ]
};


