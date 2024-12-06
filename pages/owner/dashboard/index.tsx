import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import useDarkMode from '../../../hooks/useDarkMode';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, {
	SubHeaderLeft,
	SubHeaderRight,
	SubheaderSeparator,
} from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../../../components/bootstrap/Card';
import { doc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import Dropdown, { DropdownToggle, DropdownMenu } from '../../../components/bootstrap/Dropdown';
import COLORS, { getColorNameWithIndex } from '../../../common/data/enumColors';
import { getFirstLetter } from '../../../helpers/helpers';
import TopChart from '../../../components/top-product-chart';
import SellsChart from '../../../components/sells-chart';
import StockChart from '../../../components/sock-monthly';
import Cashier from '../../../components/cashier';
import PaginationButtons from '../../../components/PaginationButtons';
import Incom from '../../../components/income-expenses';
import YearIncome from'../../../components/year-income'
import Profit from '../../../components/profit-chart';
interface Item {
	cid: string;
	category: number;
	image: string;
	name: string;
	price: number;
	quentity: number;
	reorderlevel: number;
}
interface User {
	cid: string;
	image: string;
	name: string;
	position: string;
	email: string;
	password: string;
	mobile: number;
	pin_number: number;
}
interface Stock {
	cid: string;
	buy_price: number;
	item_id: string;
	location: string;
	quentity: string;
	status: string;
	sublocation: string;
	exp: string;
	currentquentity: string;
	stockHistory: { stockout: string; date: string }[];
}
// Define the functional component for the index page
const Index: NextPage = () => {
	return (
		<PageWrapper>
			<Page>
				<div className='row'>
					<div className='col-7'>
						<StockChart />
					</div>
					<div className='col-5'>
						<Profit />
					</div>
					<div className='col-12'>
						<SellsChart />
					</div>
					<div className='col-4'>
						<TopChart />
					</div>

					<div className='col-8'>
						<Cashier />
					</div>
					<div className='col-12'>
						<Incom />
					</div>
                    <div className='col-12'>
						<YearIncome/>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};
export default Index;
