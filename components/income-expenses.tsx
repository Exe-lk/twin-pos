import React, { useEffect, useState } from 'react';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../components/bootstrap/Card';
import Chart, { IChartOptions } from '../components/extras/Chart';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

interface Row {
	date: string;
	description: string;
	price: number | string;
	url: string;
	type: string;
}

const LineWithLabel = () => {
	const [chartOptions, setChartOptions] = useState<IChartOptions>({
		series: [
			{
				name: 'Income',
				data: [],
			},
			{
				name: 'Expenses',
				data: [],
			},
		],
		options: {
			chart: {
				height: 350,
				type: 'line',
				dropShadow: {
					enabled: true,
					color: '#000',
					top: 18,
					left: 7,
					blur: 10,
					opacity: 0.2,
				},
				toolbar: {
					show: true,
				},
			},
			tooltip: {
				theme: 'dark',

			},
			dataLabels: {
				enabled: true,
			},
			stroke: {
				curve: 'smooth',
			},
			title: {
				text: '',
				align: 'left',
			},
			grid: {
				borderColor: '#e7e7e7',
				row: {
					colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
					opacity: 0.5,
				},
			},
			markers: {
				size: 1,
			},
			xaxis: {
				categories: [
					'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
					'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
				],
				title: {
					text: 'Month',
				},
			},
			yaxis: {
				title: {
					text: 'Amount',
				},
				min: 0,
			},
			legend: {
				position: 'bottom',
				horizontalAlign: 'right',
				floating: true,
				offsetY: 0,
				offsetX: -5,
                
			},
		},
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'cashBook');
				const querySnapshot = await getDocs(dataCollection);

				const allOrders = querySnapshot.docs.map((doc) => {
					const data = doc.data() as Row;
					return {
						...data,
						price: parseFloat(data.price as string),
					};
				});

				const incomeData: { [key: string]: number } = {};
				const expenseData: { [key: string]: number } = {};

				allOrders.forEach((order) => {
					const date = new Date(order.date);
					const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;

					if (order.type.toLowerCase() === 'incoming') {
						if (incomeData[yearMonth]) {
							incomeData[yearMonth] += order.price;
						} else {
							incomeData[yearMonth] = order.price;
						}
					} else if (order.type.toLowerCase() === 'expenses') {
						if (expenseData[yearMonth]) {
							expenseData[yearMonth] += order.price;
						} else {
							expenseData[yearMonth] = order.price;
						}
					}
				});

				const currentYear = new Date().getFullYear();
				const categories = Array.from({ length: 12 }, (_, i) => `${currentYear}-${i + 1}`);
				const incomeSeries = categories.map((category) => incomeData[category] || 0);
				const expenseSeries = categories.map((category) => expenseData[category] || 0);

				setChartOptions((prevState) => ({
					series: [
						{
							name: 'Income',
							data: incomeSeries,
						},
						{
							name: 'Expenses',
							data: expenseSeries,
						},
					],
					options: {
						...prevState.options,
						xaxis: {
							...prevState.options.xaxis,
							categories: categories.map((category) => {
								const [year, month]:any = category.split('-');
								return new Date(year, month - 1).toLocaleString('default', { month: 'short' });
							}),
						},
					},
				}));
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, []);

	return (
		<div className='col-lg-12'>
			<Card stretch>
				<CardHeader>
					<CardLabel icon='ShowChart' iconColor='warning'>
						<CardTitle>
							Income and Expenses <small>line</small>
						</CardTitle>
						<CardSubTitle>Chart</CardSubTitle>
					</CardLabel>
				</CardHeader>
				<CardBody>
					<Chart
						series={chartOptions.series}
						options={chartOptions.options}
						type={chartOptions.options.chart?.type}
						height={chartOptions.options.chart?.height}
					/>
				</CardBody>
			</Card>
		</div>
	);
};

export default LineWithLabel;
