import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import useDarkMode from '../../../hooks/useDarkMode';
import { PER_COUNT } from '../../../components/PaginationButtons';
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
import StockEditModal from '../../../components/custom/locationEditModal';
import { doc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import Dropdown, { DropdownToggle, DropdownMenu } from '../../../components/bootstrap/Dropdown';
import { getColorNameWithIndex } from '../../../common/data/enumColors';
import { getFirstLetter } from '../../../helpers/helpers';
import showNotification from '../../../components/extras/showNotification';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Checks, { ChecksGroup } from '../../../components/bootstrap/forms/Checks';
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
	const [addModalStatus, setAddModalStatus] = useState<boolean>(false); // State to control the visibility of the Add Stock modal
	const [editModalStatus, setEditModalStatus] = useState<boolean>(false); // State to control the visibility of the Edit Stock modal
	const [stock, setStock] = useState<Stock[]>([]); // State to store stock data fetched from Firestore
	const [id, setId] = useState<string>(''); // State to store the ID of the stock being edited
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const position = [
		{ position: 'Reserve store' },
		{ position: 'main store' },
		{ position: 'showroom' },
	];
	//get data from database
	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'stock'); // Reference to the 'stock' collection in Firestore
				const querySnapshot = await getDocs(dataCollection); // Fetching all documents from the collection
				const firebaseData = querySnapshot.docs.map((doc) => {
					const data = doc.data() as Stock;
					return {
						...data,
						cid: doc.id, // Adding the document ID as 'cid' in the data object
					};
				});
				setStock(firebaseData); // Updating the stock state with the fetched data
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, [editModalStatus, addModalStatus]); // Dependency array: useEffect runs when editModalStatus or addModalStatus changes

	// useEffect(() => {
	// 	let timerId: NodeJS.Timeout;
	// 	const checkLowStock = () => {
	// 		// Check if any stock item has a quantity less than 50
	// 		const lowStockItem = stock.find((item) => parseInt(item.quentity) < 50);
	// 		if (lowStockItem) {
	// 			// Show notification
	// 			showLowStockNotification(lowStockItem.item_id);
	// 		}
	// 		// Schedule the next check after 1 minute
	// 		timerId = setTimeout(checkLowStock, 50000); // 1 minute = 60000 milliseconds
	// 	};
	// 	// Start checking for low stock items
	// 	checkLowStock();
	// 	// Cleanup function
	// 	return () => clearTimeout(timerId);
	// }, [stock]);
	// // Function to show low stock notification
	// const showLowStockNotification = (itemName: string) => {
	// 	showNotification(
	// 		'Insufficient Stock',
	// 		`${itemName} stock quantity is less than 50. Manage your stock.`,
	// 		'warning',
	// 	);
	// };
	return (
		<PageWrapper>
			<Head>
				<></>
			</Head>
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
					<Dropdown>
						<DropdownToggle hasIcon={false}>
							<Button
								icon='FilterAlt'
								color='dark'
								isLight
								className='btn-only-icon position-relative'></Button>
						</DropdownToggle>
						<DropdownMenu isAlignmentEnd size='lg'>
							<div className='container py-2'>
								<div className='row g-3'>
									<FormGroup label='Category type' className='col-12'>
										<ChecksGroup>
											{position.map((category, index) => (
												<Checks
													key={category.position}
													id={category.position}
													label={category.position}
													name={category.position}
													value={category.position}
													checked={selectedCategories.includes(
														category.position,
													)}
													onChange={(event: any) => {
														const { checked, value } = event.target;
														setSelectedCategories(
															(prevCategories) =>
																checked
																	? [...prevCategories, value] // Add category if checked
																	: prevCategories.filter(
																			(category) =>
																				category !== value,
																	  ), // Remove category if unchecked
														);
													}}
												/>
											))}
										</ChecksGroup>
									</FormGroup>
								</div>
							</div>
						</DropdownMenu>
					</Dropdown>
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
											.filter((val) => {
												if (searchTerm === '') {
													if (!selectedCategories.length) {
														return true; // Show all items if no categories selected
													} else {
														return selectedCategories.includes(
															val.location.toString(),
														);
													}
												} else if (
													val.item_id
														.toLowerCase()
														.includes(searchTerm.toLowerCase())
												) {
													if (!selectedCategories.length) {
														return true; // Show all items if no categories selected
													} else {
														return selectedCategories.includes(
															val.location.toString(),
														);
													}
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
															icon='Location'
															tag='a'
															color='info'
															onClick={() => (
																setEditModalStatus(true),
																setId(stock.cid)
															)}>
															Change Location
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
			{/* Edit Stock modal */}
			<StockEditModal setIsOpen={setEditModalStatus} isOpen={editModalStatus} id={id} />
		</PageWrapper>
	);
};
export default Index;
