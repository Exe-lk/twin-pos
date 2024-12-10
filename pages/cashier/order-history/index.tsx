import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import Card, { CardBody, CardTitle } from '../../../components/bootstrap/Card';
import { number } from 'prop-types';
import Dropdown, {
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from '../../../components/bootstrap/Dropdown';
import Button from '../../../components/bootstrap/Button';

interface Orders {
	id: string;
	cid: string;
	casheir: string;
	date: string;
	amount: string;
	time: string;
	orders: { category: string; price: number | string; name: string; quentity: any }[];
}
interface User {
	cid: string;
	image: string;
	name: string;
	position: string;
	email: string;
	mobile: number;
	NIC: number;
	profile_picture: string;
}

const Index: React.FC = () => {
	const [searchyear, setSearchyear] = useState<number>(new Date().getFullYear());
	const [searchmonth, setSearchmonth] = useState<string>('');
	const [searchDate, setSearchDate] = useState<string>('');
	const [orders, setOrders] = useState<Orders[]>([]);
	const [filteredOrders, setFilteredOrders] = useState<Orders[]>([]);
	const [user, setUser] = useState<User[]>([]);
	const [expandedRow, setExpandedRow] = useState(null);

	const toggleRow = (index: any) => {
		setExpandedRow(expandedRow === index ? null : index);
	};
	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'orders');
				const querySnapshot = await getDocs(dataCollection);
				const firebaseData = querySnapshot.docs.map((doc) => {
					const data = doc.data() as Orders;
					return {
						...data,
						cid: doc.id,
					};
				});
				setOrders(firebaseData);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'user');
				const querySnapshot = await getDocs(dataCollection);
				const firebaseData = querySnapshot.docs.map((doc) => {
					const data = doc.data() as User;
					return {
						...data,
						cid: doc.id,
					};
				});
				setUser(firebaseData);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		const filterOrdersByDate = () => {
			return orders.filter((order) => {
				const orderDate = new Date(order.date);
				const orderYear = orderDate.getFullYear();
				const orderMonth = orderDate.toLocaleString('default', { month: 'short' });
				const formattedSearchDate = new Date(searchDate).toDateString();

				console.log(`Order Date: ${order.date}, Year: ${orderYear}, Month: ${orderMonth}`);
				console.log(
					`Search Year: ${searchyear}, Search Month: ${searchmonth}, Search Date: ${searchDate}`,
				);

				if (searchDate && new Date(order.date).toDateString() !== formattedSearchDate) {
					return false;
				}
				if (searchmonth && searchmonth !== orderMonth) {
					return false;
				}
				if (searchyear && searchyear !== orderYear) {
					return false;
				}
				return true;
			});
		};

		setFilteredOrders(filterOrdersByDate());
	}, [orders, searchyear, searchmonth, searchDate]);

	const getCashierName = (email: string) => {
		const user1 = user.find((user: { email: string }) => user.email === email);
		return user1 ? user1.name : 'Unknown';
	};
    const handleExport = (format:any) => {
        if (format === 'csv') {
          // Flatten data
          const csvRows = [
            ['Date', 'Start Time', 'End Time', 'Cashier', 'Bill No', 'Sub Total', 'Item Name', 'Unit Price', 'Discount', 'Quantity', 'Total Price'], // Header row
          ];
      
          orders.forEach((order) => {
            // Add the main order row
            csvRows.push([
              order.date,
              order.time,
              order.time,
              getCashierName(order.casheir),
              order.id,
              order.amount,
              '', // Empty columns for item details
              '',
              '',
              '',
              '',
            ]);
      
            // Add rows for each item
            order.orders.forEach((item:any) => {
              csvRows.push([
                '', // Empty columns for the order details
                '',
                '',
                '',
                '',
                '',
                item.name,
                item.price,
                item.discount,
                item.quantity,
                item.price * item.quantity,
              ]);
            });
          });
      
          // Convert to CSV string
          const csvContent =
            'data:text/csv;charset=utf-8,' +
            csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
      
          // Download CSV
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute('download', 'purchasing_history.csv');
          document.body.appendChild(link); // Required for Firefox
          link.click();
          document.body.removeChild(link);
        }
      };
      
	return (
		<>
			<PageWrapper>
				<Page>
					<div className='row h-100'>
						<div className='col-12'>
							<Card stretch>
								<CardTitle className='d-flex justify-content-between align-items-center m-4'>
									<div className='flex-grow-1 text-center text-primary'>
										Purchasing History
									</div>
									<Dropdown>
										<DropdownToggle hasIcon={false}>
											<Button icon='UploadFile' color='warning'>
												Export
											</Button>
										</DropdownToggle>
										<DropdownMenu isAlignmentEnd>
											<DropdownItem onClick={() => handleExport('csv')}>
												Download CSV
											</DropdownItem>
										</DropdownMenu>
									</Dropdown>
								</CardTitle>
								<CardBody isScrollable className='table-responsive'>
									{/* <div className='mt-2 mb-4'>
										Select date :
										<input
											type='date'
											onChange={(e: any) => setSearchDate(e.target.value)}
											value={searchDate}
											className='px-3 py-2 ms-4 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
										/>
									</div> */}
									<table className='table table-hover table-bordered border-primary'>
										<thead className={'table-dark border-primary'}>
											<tr>
												<th>Date</th>
												<th>Start Time</th>
												<th>End Time</th>
												<th>Cashier</th>
												<th>Bill No</th>
												<th>Sub Total</th>
											</tr>
										</thead>
										<tbody>
											{orders.map((order, index) => (
												<React.Fragment key={index}>
													<tr
														onClick={() => toggleRow(index)}
														style={{ cursor: 'pointer' }}>
														<td>{order.date}</td>
														<td>{order.time}</td>
														<td>{order.time}</td>
														<td>{getCashierName(order.casheir)}</td>
														<td>{order.id}</td>
														<td>{order.amount}</td>
													</tr>
													{expandedRow === index && (
														<tr>
															<td colSpan={6}>
																<table className='table table-hover table-bordered border-warning'>
																	<thead
																		className={
																			'table-dark border-warning'
																		}>
																		<tr>
																			<th>Item</th>
																			<th>Unit Price</th>
																			<th>Discount</th>
																			<th>Quantity</th>
																			<th>Total Price</th>
																		</tr>
																	</thead>
																	<tbody>
																		{order.orders.map(
																			(
																				data: any,
																				dataIndex,
																			) => (
																				<tr key={dataIndex}>
																					<td>
																						{data.name}
																					</td>
																					<td>
																						{data.price}
																					</td>
																					<td>
																						{
																							data.discount
																						}
																					</td>
																					<td>
																						{
																							data.quantity
																						}
																					</td>
																					<td>
																						{data.price *
																							data.quantity}
																					</td>
																				</tr>
																			),
																		)}
																	</tbody>
																</table>
															</td>
														</tr>
													)}
												</React.Fragment>
											))}
										</tbody>
									</table>
								</CardBody>
							</Card>
						</div>
					</div>
				</Page>
			</PageWrapper>
		</>
	);
};

export default Index;
