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

const LineChartYearOverYear = () => {
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
					show: false,
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
				text: 'Year-over-Year Growth in Key Metrics',
				align: 'left',
			},
			grid: {
				borderColor: '#e7e7e7',
				row: {
					colors: ['#f3f3f3', 'transparent'],
					opacity: 0.5,
				},
			},
			markers: {
				size: 1,
			},
			xaxis: {
				categories: [],
				title: {
					text: 'Year',
				},
			},
			yaxis: {
				title: {
					text: 'Amount',
				},
			},
			legend: {
				position: 'top',
				horizontalAlign: 'right',
				floating: true,
				offsetY: -25,
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
						year: new Date(data.date).getFullYear(),
					};
				});

				const yearlyData = allOrders.reduce((acc:any, order) => {
					const { year, type, price } = order;

					if (!acc[year]) {
						acc[year] = { income: 0, expenses: 0 };
					}

					if (type.toLowerCase() === 'incoming') {
						acc[year].income += price;
					} else if (type.toLowerCase() === 'expenses') {
						acc[year].expenses += price;
					}

					return acc;
				}, {});

				const years = Object.keys(yearlyData).sort();
				const incomeData = years.map(year => yearlyData[year].income);
				const expensesData = years.map(year => yearlyData[year].expenses);

				setChartOptions((prevState) => ({
					series: [
						{
							name: 'Income',
							data: incomeData,
						},
						{
							name: 'Expenses',
							data: expensesData,
						},
					],
					options: {
						...prevState.options,
						xaxis: {
							...prevState.options.xaxis,
							categories: years,
						},
					},
				}));
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, []);
//return JSX
	return (
		<div className='col-lg-12'>
			<Card stretch>
				<CardHeader>
					<CardLabel icon='ShowChart' iconColor='warning'>
						<CardTitle>
							Year-over-Year Growth <small>line</small>
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

export default LineChartYearOverYear;
