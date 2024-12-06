import React, { useEffect, useState } from 'react';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../components/bootstrap/Card';
import Chart, { IChartOptions } from '../components/extras/Chart';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

interface Order {
	cid: string;
	amount: string;
	casheir: string;
	id: number;
	orders: [];
	date: string;
	time: string;
	type: string;
}

const LineWithLabel = () => {
	const [state, setState] = useState<IChartOptions>({
		series: [],
		options: {
			chart: {
				height: 350,
				type: 'line',
				dropShadow: {
					enabled: false,
					color: '#000',
					top: 20,
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
				text: 'Daily Order Summary',
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
				categories: Array.from({ length: 24 }, (_, i) => `${i}:00`),
				title: {
					text: 'Time',
				},
			},
			yaxis: {
				title: {
					text: 'Amount (Rs)',
				},
				min: 0,
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
				const currentDate = new Date();
				const formattedDate = currentDate.toLocaleDateString();
				const dataCollection = collection(firestore, 'orders');
				const q = query(dataCollection, where('date', '==', formattedDate));
				const querySnapshot = await getDocs(q);

				const todaysOrders = querySnapshot.docs.map((doc) => {
					const data = doc.data() as Order;
					return {
						...data,
						cid: doc.id,
					};
				});

				const hourlySales = Array(24).fill(0);

				todaysOrders.forEach(order => {
					const hour = parseInt(order.time.split(':')[0], 10); // Extract the hour from the time string
					hourlySales[hour] += parseFloat(order.amount);
				});

				setState({
					series: [
						{
							name: 'Order Amount',
							data: hourlySales,
						},
					],
					options: {
						...state.options,
						xaxis: {
							...state.options.xaxis,
							categories: Array.from({ length: 24 }, (_, i) => `${i}:00`),
						},
					},
				});
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
                        Sales Summary <small>line</small>
						</CardTitle>
						<CardSubTitle>Chart</CardSubTitle>
					</CardLabel>
				</CardHeader>
				<CardBody>
					<Chart
						series={state.series}
						options={state.options}
						type={state.options.chart?.type}
						height={state.options.chart?.height}
					/>
				</CardBody>
			</Card>
		</div>
	);
};

export default LineWithLabel;
