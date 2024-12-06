import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
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
import Card, { CardBody } from '../../../components/bootstrap/Card';
import StockAddModal from '../../../components/custom/ItemAddModal';
import StockEditModal from '../../../components/custom/ItemEditModal';
import { doc, deleteDoc, collection, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import Dropdown, { DropdownToggle, DropdownMenu } from '../../../components/bootstrap/Dropdown';
import { getColorNameWithIndex } from '../../../common/data/enumColors';
import { getFirstLetter } from '../../../helpers/helpers';
import Barcode from 'react-barcode';
import Swal from 'sweetalert2';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Checks, { ChecksGroup } from '../../../components/bootstrap/forms/Checks';
import showNotification from '../../../components/extras/showNotification';
// Define interfaces for data objects
interface Item {
	cid: string;
	category: number;
	image: string;
	name: string;
	price: number;
	quentity: number;
	reorderlevel: number;
}
interface Category {
	cid: string;
	categoryname: string;
}
interface stock {
	quentity: number;
	item_id: string;
}
const Index: NextPage = () => {
	const { darkModeStatus } = useDarkMode(); // Dark mode
	const [searchTerm, setSearchTerm] = useState(''); // State for search term
	const [addModalStatus, setAddModalStatus] = useState<boolean>(false); // State for add modal status
	const [editModalStatus, setEditModalStatus] = useState<boolean>(false); // State for edit modal status
	const [item, setItem] = useState<Item[]>([]); // State for stock data
	const [category, setcategory] = useState<Category[]>([]);
	const [orderData, setOrdersData] = useState([]);
	const [stockData, setStockData] = useState([]);
	const [id, setId] = useState<string>(''); // State for current stock item ID
	const [id1, setId1] = useState<string>('12356'); // State for new item ID
	const [status, setStatus] = useState(true);
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [quantityDifference, setQuantityDifference] = useState([]);
	// State for managing data fetching status
	// Fetch data from Firestore for items
	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'item');
				const q = query(dataCollection, where('status', '==', true));
				const querySnapshot = await getDocs(q);
				const firebaseData = querySnapshot.docs.map((doc) => {
					const data = doc.data() as Item;
					return {
						...data,
						cid: doc.id,
					};
				});
				const tempId = parseInt(firebaseData[firebaseData.length - 1].cid) + 1;
				setId1(tempId.toString());
				setItem(firebaseData);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, [editModalStatus, addModalStatus, status]); // Fetch data whenever editModalStatus or addModalStatus changes
	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'category');
				const querySnapshot = await getDocs(dataCollection);
				const firebaseData = querySnapshot.docs.map((doc) => {
					const data = doc.data() as Category;
					return {
						...data,
						cid: doc.id,
					};
				});
				setcategory(firebaseData);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, [editModalStatus, addModalStatus, status]);

	//get stock count
	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'stock');
				const q = query(dataCollection, where('active', '==', true));
				const querySnapshot = await getDocs(q);
				const firebaseData = querySnapshot.docs.map((doc) => {
					const data = doc.data();
					return {
						...data,
						cid: doc.id,
					};
				});

				// Create a dictionary to group by item_id and sum quantities
				const stockDictionary: any = {};

				firebaseData.forEach((item: any) => {
					if (stockDictionary[item.item_id]) {
						stockDictionary[item.item_id] += item.quentity;
					} else {
						stockDictionary[item.item_id] = item.quentity;
					}
				});

				// Convert dictionary to array of objects
				const filteredData: any = Object.keys(stockDictionary).map((item_id) => ({
					item_id,
					quantity: stockDictionary[item_id],
				}));

				console.log(filteredData);
				setStockData(filteredData);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, [editModalStatus, addModalStatus, status]);

	//grt sells quentity count
	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'orders');
				const querySnapshot = await getDocs(dataCollection);
				const firebaseData = querySnapshot.docs.map((doc) => {
					const data = doc.data();
					return {
						...data,
						cid: doc.id,
					};
				});

				// Create a dictionary to group by name and sum quantities
				const ordersDictionary: any = {};

				firebaseData.forEach((order: any) => {
					order.orders.forEach((item: any) => {
						if (ordersDictionary[item.name]) {
							ordersDictionary[item.name] += item.quentity;
						} else {
							ordersDictionary[item.name] = item.quentity;
						}
					});
				});

				// Convert dictionary to array of objects
				const filteredData: any = Object.keys(ordersDictionary).map((name) => ({
					name,
					quantity: ordersDictionary[name],
				}));

				console.log(filteredData);
				setOrdersData(filteredData);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, [editModalStatus, addModalStatus, status]);

	useEffect(() => {
		const calculateQuantityDifference = () => {
			const differenceArray: any = [];

			stockData.forEach((stockItem: any) => {
				const orderItem: any = orderData.find(
					(order: any) => order.name === stockItem.item_id,
				);
				if (orderItem) {
					const difference = stockItem.quantity - orderItem.quantity;
					differenceArray.push({
						item_id: stockItem.item_id,
						quantity_difference: difference,
					});
				}
			});
			console.log(differenceArray);
			setQuantityDifference(differenceArray);
		};

		if (stockData.length > 0 && orderData.length > 0) {
			calculateQuantityDifference();
		}
	}, [stockData, orderData]);


	// Function to handle deletion of an item
	const handleClickDelete = async (item: any) => {
		try {
			const result = await Swal.fire({
				title: 'Are you sure?',

				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, delete it!',
			});
			if (result.isConfirmed) {
				try {
					item.status = false;
					const docRef = doc(firestore, 'item', item.cid);
					// Update the data
					updateDoc(docRef, item)
						.then(() => {
							Swal.fire('Deleted!', 'item has been deleted.', 'success');
							if (status) {
								// Toggle status to trigger data refetch
								setStatus(false);
							} else {
								setStatus(true);
							}
						})
						.catch((error) => {
							console.error('Error adding document: ', error);

							alert(
								'An error occurred while adding the document. Please try again later.',
							);
						});
				} catch (error) {
					console.error('Error during handleUpload: ', error);
					Swal.close;
					alert('An error occurred during file upload. Please try again later.');
				}
			}
		} catch (error) {
			console.error('Error deleting document: ', error);
			Swal.fire('Error', 'Failed to delete employee.', 'error');
		}
	};
	// Return the JSX for rendering the page
	return (
		<PageWrapper>
			<SubHeader>
				<SubHeaderLeft>
					{/* Search input */}
					<label
						className='border-0 bg-transparent cursor-pointer me-0'
						htmlFor='searchInput'>
						<Icon icon='Search' size='2x' color='primary' />
					</label>
					<Input
						id='searchInput'
						type='search'
						className='border-0 shadow-none bg-transparent'
						placeholder='Search...'
						onChange={(event: any) => {
							setSearchTerm(event.target.value);
						}}
						value={searchTerm}
					/>
				</SubHeaderLeft>
				<SubHeaderRight>
					
					<SubheaderSeparator />
					{/* Button to open  New Item modal */}
					<Button
						icon='AddCircleOutline'
						color='primary'
						isLight
						onClick={() => setAddModalStatus(true)}>
						New Item
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page>
				<div className='row h-100'>
					<div className='col-12'>
						{/* Table for displaying customer data */}
						<Card stretch>
							<CardBody isScrollable className='table-responsive'>
							<table className='table table-hover table-bordered border-primary'>
							<thead className={'table-dark border-primary'}>
										<tr>
											<th>Name</th>
											<th>Price</th>
											<th>Quentity</th>
											<th>Discount</th>
											<th>BarCode</th>
											<th></th>
											{/* <th><Button icon='PersonAdd' color='primary' isLight onClick={() => setAddModalStatus(true)}>
                        New Item
                      </Button></th> */}
										</tr>
									</thead>
									<tbody>
										{item
											.filter((val) => {
												if (searchTerm === '') {
													if (!selectedCategories.length) {
														return true; // Show all items if no categories selected
													} else {
														return selectedCategories.includes(
															val.category.toString(),
														);
													}
												} else if (
													val.name
														.toLowerCase()
														.includes(searchTerm.toLowerCase())
												) {
													if (!selectedCategories.length) {
														return true; // Show all items if no categories selected
													} else {
														return selectedCategories.includes(
															val.category.toString(),
														);
													}
												}
											})
											.map((item:any, index) => (
												<tr key={item.cid}>
													<td>
														<div className='d-flex align-items-center'>
															<div className='flex-shrink-0'>
																<div
																	className='ratio ratio-1x1 me-3'
																	style={{ width: 48 }}>
																	<div
																		className={`bg-l${
																			darkModeStatus
																				? 'o25'
																				: '25'
																		}-${getColorNameWithIndex(
																			index,
																		)} text-${getColorNameWithIndex(
																			index,
																		)} rounded-2 d-flex align-items-center justify-content-center`}>
																		<span className='fw-bold'>
																			{getFirstLetter(
																				item.name,
																			)}
																		</span>
																	</div>
																</div>
															</div>
															<div className='flex-grow-1'>
																<div className='fs-6 fw-bold'>
																	{item.name}
																</div>
																<div className='text-muted'>
																	<Icon icon='Label' />{' '}
																	<small>{item.cid}</small>
																</div>
															</div>
														</div>
													</td>
													<td>{item.price}</td>
													<td>
														{/* {quantityDifference
															.filter((val: any) => {
																if (
																	val.item_id.includes(item.name)
																) {
																	return val;
																}
															})
															.map((quentity: any, index) => (
																<>{quentity.quantity_difference}</>
															))} */}
															{item.quentity}
															
													</td>
													<td>
														{item.discount}%
													</td>
													{/* <td>{item.reorderlevel}</td> */}
													<td>
														<Barcode
															value={item.cid}
															width={1}
															height={30}
															fontSize={16}
														/>
													</td>
													<td>
														<Button
															icon='Edit'
															tag='a'
															color='info'
															onClick={() => (
																setEditModalStatus(true),
																setId(item.cid)
															)}>
															Edit
														</Button>
														<Button
															className='m-2'
															icon='Delete'
															color='warning'
															onClick={() => handleClickDelete(item)}>
															Delete
														</Button>
													</td>
												</tr>
											))}
									</tbody>
								</table>
							</CardBody>
						</Card>
					</div>
				</div>
			</Page>
			<StockAddModal setIsOpen={setAddModalStatus} isOpen={addModalStatus} id={id1} />
			<StockEditModal setIsOpen={setEditModalStatus} isOpen={editModalStatus} id={id} />
		</PageWrapper>
	);
};
export default Index;
