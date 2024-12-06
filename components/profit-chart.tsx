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

const PieChart = () => {
	const [chartOptions, setChartOptions] = useState<IChartOptions>({
		series: [],
		options: {
			chart: {
				width: 510,
				type: 'pie',
			},
			labels: ['Profit', 'Income', 'Expenses'],
			responsive: [
				{
					breakpoint: 480,
					options: {
						chart: {
							width: 200,
						},
					
						legend: {
							position: 'bottom',
							horizontalAlign: 'right',
							floating: true,
							offsetY: -25,
							offsetX: -5,
						},
					},
				},
			],
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

				let totalIncome = 0;
				let totalExpenses = 0;

				allOrders.forEach((order) => {
					if (order.type.toLowerCase() === 'incoming') {
						totalIncome += order.price;
					} else if (order.type.toLowerCase() === 'expenses') {
						totalExpenses += order.price;
					}
				});

				const profit = totalIncome - totalExpenses;

				setChartOptions((prevState) => ({
					series: [profit, totalIncome, totalExpenses],
					options: {
						...prevState.options,
					},
				}));
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, []);

	return (
		<div className='col-lg-12' >
			<Card stretch style={{height:480}}>
				<CardHeader>
					<CardLabel icon='ShowChart' iconColor='warning'>
						<CardTitle>
							Profit, Income, and Expenses <small>pie</small>
						</CardTitle>
						<CardSubTitle>Chart</CardSubTitle>
					</CardLabel>
				</CardHeader>
				<CardBody>
					<Chart
						series={chartOptions.series}
						options={chartOptions.options}
						type={chartOptions.options.chart?.type}
						width={chartOptions.options.chart?.width}
					/>
				</CardBody>
			</Card>
		</div>
	);
};

export default PieChart;
