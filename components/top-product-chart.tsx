import React, { useEffect, useState } from 'react';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../components/bootstrap/Card';
import Chart, { IChartOptions } from '../components/extras/Chart';
import CommonStoryBtn from '../common/partial/other/CommonStoryBtn';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

interface Order {
	cid: string;
	amount: string;
	casheir: string;
	id: number;
	orders: { category: string, quentity: string }[];
	date: string;
	time: string;
	type: string;
}

const PieBasic = () => {
	const [state, setState] = useState<IChartOptions>({
		series: [],
		options: {
			chart: {
				width: 380,
				type: 'pie',
			},
			labels: [],
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
				const dataCollection = collection(firestore, 'orders');
				const querySnapshot = await getDocs(dataCollection);

				const allOrders = querySnapshot.docs.map((doc) => {
					const data = doc.data() as Order;
					return {
						...data,
						cid: doc.id,
					};
				});

				const itemCounts: { [key: string]: number } = {};

				allOrders.forEach(order => {
					order.orders.forEach((item:any) => {
						if (itemCounts[item.name]) {
							itemCounts[item.name] += parseInt(item.quentity, 10);
						} else {
							itemCounts[item.name] = parseInt(item.quentity, 10);
						}
					});
				});

				const categories = Object.keys(itemCounts);
				const series = Object.values(itemCounts);

				setState({
					series,
					options: {
						...state.options,
						labels: categories,
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
			<Card  style={{height:480}}>
				<CardHeader>
					<CardLabel icon='PieChart'>
						<CardTitle>
							Top Products  
						</CardTitle>
						<CardSubTitle>pie Chart</CardSubTitle>
					</CardLabel>
					
				</CardHeader>
				<CardBody>
					<Chart
						series={state.series}
						options={state.options}
						type={state.options.chart?.type}
						width={state.options.chart?.width}
					/>
				</CardBody>
			</Card>
		</div>
	);
};

export default PieBasic;
