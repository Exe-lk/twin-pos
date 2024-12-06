import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../firebaseConfig.js';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from './bootstrap/Card';
import CommonStoryBtn from '../common/partial/other/CommonStoryBtn';
import Chart, { IChartOptions } from './extras/Chart';

interface Stock {
	cid: string;
	buy_price: number;
	item_id: string;
	location: string;
	quentity: string;
	status: string;
	sublocation: string;
	exp: string;
	date: string;
}

function StockChart() {
	const [stock, setStock] = useState<Stock[]>([]);
	const [columnBasic, setColumnBasic] = useState<IChartOptions>({
		series: [],
		options: {
			chart: {
				type: 'bar',
				height: 350,
			},
			plotOptions: {
				bar: {
					horizontal: false,
					columnWidth: '55%',
					
				},
			},
			dataLabels: {
				enabled: false,
			},
			stroke: {
				show: true,
				width: 2,
				colors: ['transparent'],
			},
			xaxis: {
				categories: [],
			},
			yaxis: {
				title: {
					text: '$ (thousands)',
				},
			},
			fill: {
				opacity: 1,
			},
			tooltip: {
				y: {
					formatter(val) {
						return `$ ${val} thousands`;
					},
				},
			},
		},
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const currentDate = new Date();
				const formattedDate = currentDate.toLocaleDateString();
				const dataCollection = collection(firestore, 'stock');
				
				const querySnapshot = await getDocs(dataCollection);

				const todaysStocks = querySnapshot.docs.map((doc) => {
					const data = doc.data() as Stock;
					return {
						...data,
						cid: doc.id,
					};
				});

				setStock(todaysStocks);

				const grossProductData = todaysStocks.reduce((acc: any, item) => {
					const { item_id, quentity, buy_price } = item;
					const quantity = parseInt(quentity, 10);
					const totalPrice = buy_price * quantity;

					if (!acc[item_id]) {
						acc[item_id] = {
							item_id,
							totalQuantity: 0,
							totalPrice: 0,
						};
					}

					acc[item_id].totalQuantity += quantity;
					acc[item_id].totalPrice += totalPrice;

					return acc;
				}, {});

				const grossProductArray = Object.values(grossProductData);

				const itemIdArray = grossProductArray.map((item: any) => item.item_id);
				const totalPriceArray = grossProductArray.map((item: any) => item.totalPrice);

				setColumnBasic({
					series: [
						{
							name: 'Net Profit',
							data: totalPriceArray,
						},
					],
					options: {
						chart: {
							type: 'bar',
							height: 350,
						},
						plotOptions: {
							bar: {
								horizontal: false,
								columnWidth: '55%',
								
							},
						},
						dataLabels: {
							enabled: false,
						},
						stroke: {
							show: true,
							width: 2,
							colors: ['transparent'],
						},
						xaxis: {
							categories: itemIdArray,
						},
						yaxis: {
							title: {
								text: 'Rs (thousands)',
							},
						},
						fill: {
							opacity: 1,
						},
						tooltip: {
							y: {
								formatter(val) {
									return `Rs ${val} thousands`;
								},
							},
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
					<CardLabel icon='BarChart'>
						<CardTitle>
						Monthly Stock  <small>bar</small>
						</CardTitle>
						<CardSubTitle>Chart</CardSubTitle>
					</CardLabel>
					
				</CardHeader>
				<CardBody>
					<Chart
						series={columnBasic.series}
						options={columnBasic.options}
						type='bar'
						height={350}
					/>
				</CardBody>
			</Card>
		</div>
	);
}

export default StockChart;
