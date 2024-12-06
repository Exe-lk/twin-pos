import React from 'react';
import AdminHeader from '../pages/_layout/_headers/AdminHeader';
import CashierHeader from '../pages/_layout/_headers/CashierHeader';
import AccountHeader from '../pages/_layout/_headers/AccountHeader';
import StockHeader from '../pages/_layout/_headers/StockHeader';
import DataentryHeader from '../pages/_layout/_headers/DataentryHeader';
import OwnerHeader from '../pages/_layout/_headers/OwnerHeader';




const headers = [


	{
		path: `/admin/*`,
		element: <AdminHeader />,
	},
	{
		path: `/cashier/*`,
		element: <CashierHeader />,
	},
	
	{
		path: `/accountant/*`,
		element: <AccountHeader />,
	},
	{
		path: `/dataentry-operater/*`,
		element: <DataentryHeader />,
	},
	{
		path: `/stock-keeper/*`,
		element: <StockHeader />,
	},
	{
		path: `/owner/*`,
		element: <OwnerHeader />,
	},

];

export default headers;
