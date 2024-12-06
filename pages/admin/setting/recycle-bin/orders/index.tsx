import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import useDarkMode from '../../../../../hooks/useDarkMode';
import PageWrapper from '../../../../../layout/PageWrapper/PageWrapper';
import SubHeader, {
	SubHeaderLeft,
	SubHeaderRight,
	SubheaderSeparator,
} from '../../../../../layout/SubHeader/SubHeader';
import Icon from '../../../../../components/icon/Icon';
import Input from '../../../../../components/bootstrap/forms/Input';
import Button from '../../../../../components/bootstrap/Button';
import Page from '../../../../../layout/Page/Page';
import Card, { CardBody } from '../../../../../components/bootstrap/Card';
import StockAddModal from '../../../../../components/custom/StockAddModal';
import StockEditModal from '../../../../../components/custom/StockEditModal';
import { doc, deleteDoc, collection, getDocs, query, where, updateDoc, writeBatch } from 'firebase/firestore';
import { firestore } from '../../../../../firebaseConfig';
import Dropdown, { DropdownToggle, DropdownMenu } from '../../../../../components/bootstrap/Dropdown';
import { getColorNameWithIndex } from '../../../../../common/data/enumColors';
import { getFirstLetter } from '../../../../../helpers/helpers';
import Swal from 'sweetalert2';
import showNotification from '../../../../../components/extras/showNotification';
// Define interfaces for data objects
interface Stock {
	cid: string;
	buy_price: number;
	item_id: string;
	location: string;
	quentity: string;
	status: string;
	sublocation: string;
	exp: string;
}
const Index: NextPage = () => {
	const { darkModeStatus } = useDarkMode(); // Dark mode
	const [searchTerm, setSearchTerm] = useState(''); // State for search term
	const [addModalStatus, setAddModalStatus] = useState<boolean>(false); // State for add modal status
	const [editModalStatus, setEditModalStatus] = useState<boolean>(false); // State for edit modal status
	const [stock, setStock] = useState<Stock[]>([]); // State for stock data
	const [id, setId] = useState<string>(''); // State for current stock item ID
	const [status, setStatus] = useState(true); // State for managing data fetching status
	// Fetch data from Firestore for stock
	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'stock');
				const q = query(dataCollection, where('active', '==', false));
				const querySnapshot = await getDocs(q);
				const firebaseData = querySnapshot.docs.map((doc) => {
					const data = doc.data() as Stock;
					return {
						...data,
						cid: doc.id,
					};
				});
				setStock(firebaseData);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, [editModalStatus, addModalStatus,status]); // Fetch data whenever editModalStatus or addModalStatus changes
	// Function to handle deletion of a stock item
	const handleClickDelete = async (id: string) => {
		try {
			const result = await Swal.fire({
				title: 'Are you sure?',
				text: 'You will not be able to recover this stock!',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, delete it!',
			});
			if (result.isConfirmed) {
				const docRef = doc(firestore, 'stock', id);
				await deleteDoc(docRef);
				// Show success message
				Swal.fire('Deleted!', 'item has been deleted.', 'success');
				if (status) {
					setStatus(false);
				} else {
					setStatus(true);
				}
			}
		} catch (error) {
			console.error('Error deleting document: ', error);
			Swal.fire('Error', 'Failed to delete employee.', 'error');
		}
	};
	useEffect(() => {
		let timerId: NodeJS.Timeout;
		const checkLowStock = () => {
			// Check if any stock item has a quantity less than 50
			const lowStockItem = stock.find((item) => parseInt(item.quentity) < 50);
			if (lowStockItem) {
				// Show notification
				showLowStockNotification(lowStockItem.item_id);
			}
			// Schedule the next check after 1 minute
			timerId = setTimeout(checkLowStock, 60000); // 1 minute = 60000 milliseconds
		};
		// Start checking for low stock items
		checkLowStock();
		// Cleanup function
		return () => clearTimeout(timerId);
	}, [stock]); //Check low stock whenever stock data changes
	// Function to show low stock notification
	const showLowStockNotification = (itemName: string) => {
		showNotification(
			'Insufficient Stock',
			`${itemName} stock quantity is less than 50. Manage your stock.`,
			'warning',
		);
	};
	const handleClickRestore= async (stock: any) => {
		try {
			const result = await Swal.fire({
				title: 'Are you sure?',
				// text: 'You will not be able to recover this stock!',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, Restore it!',
			});
			if (result.isConfirmed) {
				stock.active = true;

				let data: any = stock;
				const docRef = doc(firestore, 'stock', stock.cid);
				// Update the data
				updateDoc(docRef, data)
					.then(() => {
						Swal.fire('Restore!', 'item has been Restored.', 'success');
						if (status) {
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

			
			}
		} catch (error) {
			console.error('Error deleting document: ', error);
			Swal.fire('Error', 'Failed to delete employee.', 'error');
		}
	};
	 // Function to handle deletion of all stock items
	 const handleDeleteAll = async () => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: 'You will not be able to recover these stock items!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete all!',
            });
            if (result.isConfirmed) {
                const batch = writeBatch(firestore);
                stock.forEach((item) => {
                    const docRef = doc(firestore, 'stock', item.cid);
                    batch.delete(docRef);
                });
                await batch.commit();
                Swal.fire('Deleted!', 'All stock items have been deleted.', 'success');
                setStatus(!status);
            }
        } catch (error) {
            console.error('Error deleting all documents: ', error);
            Swal.fire('Error', 'Failed to delete all stock items.', 'error');
        }
    };

    // Function to handle restoration of all stock items
    const handleRestoreAll = async () => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, restore all!',
            });
            if (result.isConfirmed) {
                const batch = writeBatch(firestore);
                stock.forEach((item) => {
                    const docRef = doc(firestore, 'stock', item.cid);
                    batch.update(docRef, { active: true });
                });
                await batch.commit();
                Swal.fire('Restored!', 'All stock items have been restored.', 'success');
                setStatus(!status);
            }
        } catch (error) {
            console.error('Error restoring all documents: ', error);
            Swal.fire('Error', 'Failed to restore all stock items.', 'error');
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
						placeholder='Search stock...'
						onChange={(event: any) => {
							setSearchTerm(event.target.value);
						}}
						value={searchTerm}
					/>
				</SubHeaderLeft>
				<SubHeaderRight>
					<SubheaderSeparator />
					<Button
						icon='Delete'
						color='primary'
						isLight
						onClick={handleDeleteAll}
					>
						Delete All
					</Button>
					<Button
						icon='Restore'
						color='primary'
						onClick={handleRestoreAll}
						
					>
						Restore All
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page>
				<div className='row h-100'>
					<div className='col-12'>
						{/* Table for displaying stock data */}
						<Card stretch>
							<CardBody isScrollable className='table-responsive'>
								<table className='table table-modern table-hover'>
									<thead>
										<tr>
											<th>Name</th>
											<th>Unit Cost</th>
											<th>Location</th>
											<th>Sub Location</th>
											<th>EXP Date</th>
											<th>Quentity</th>
											<th>status</th>
											<th></th>
										</tr>
									</thead>
									<tbody>
										{stock
											.filter((values) => {
												if (searchTerm == '') {
													return values;
												} else if (
													values.item_id
														.toLowerCase()
														.includes(searchTerm.toLowerCase())
												) {
													return values;
												}
											})
											.map((stock, index) => (
												<tr key={stock.cid}>
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
																				stock.item_id,
																			)}
																		</span>
																	</div>
																</div>
															</div>
															<div className='flex-grow-1'>
																<div className='fs-6 fw-bold'>
																	{stock.item_id}
																</div>
															</div>
														</div>
													</td>
													<td>{stock.buy_price}</td>
													<td>{stock.location}</td>
													<td>{stock.sublocation}</td>
													<td>{stock.exp}</td>
													<td>{stock.quentity}</td>
													<td>{stock.status}</td>
													<td>
														<Button
															icon='Restore'
															tag='a'
															color='info'
															onClick={() =>
																handleClickRestore(stock)
															}>
															
														Restore
														</Button>
														<Button
															className='m-2'
															icon='Delete'
															color='warning'
															onClick={() =>
																handleClickDelete(stock.cid)
															}>
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
			{/* Modals for adding and editing stock items */}
			<StockAddModal setIsOpen={setAddModalStatus} isOpen={addModalStatus} id='' />
			<StockEditModal setIsOpen={setEditModalStatus} isOpen={editModalStatus} id={id} />
		</PageWrapper>
	);
};
export default Index;
