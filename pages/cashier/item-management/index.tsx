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
import StockEditModal1 from '../../../components/custom/Changeqty';
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
	const [editModalStatus1, setEditModalStatus1] = useState<boolean>(false);
	const [item, setItem] = useState<Item[]>([]); // State for stock data
	const [id, setId] = useState<string>(''); // State for current stock item ID
	const [id1, setId1] = useState<string>('12356'); // State for new item ID
	const [status, setStatus] = useState(true);

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
	}, [editModalStatus, addModalStatus, status, editModalStatus1]); // Fetch data whenever editModalStatus or addModalStatus changes

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
											<th>Quantity</th>
											<th>Discount</th>
											<th></th>
										
										</tr>
									</thead>
									<tbody>
										{item
											.filter((val) => {
												if (searchTerm === '') {
													return val;
												} else if (
													val.name
														.toLowerCase()
														.includes(searchTerm.toLowerCase()) ||
													val.cid
														.toLowerCase()
														.includes(searchTerm.toLowerCase())
												) {
													return val;
												}
											})
											.map((item: any, index) => (
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
													<td>{item.quentity}</td>
													<td>{item.discount}%</td>

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
															icon='Edit'
															className='m-2'
															tag='a'
															color='success'
															onClick={() => (
																setEditModalStatus1(true),
																setId(item.cid)
															)}>
															Add new stock
														</Button>
														<Button
															// className='m-2'
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
			<StockEditModal1 setIsOpen={setEditModalStatus1} isOpen={editModalStatus1} id={id} />
		</PageWrapper>
	);
};
export default Index;
