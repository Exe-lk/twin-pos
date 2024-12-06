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
import StockAddModal from '../../../components/custom/StockAddModal';
import StockEditModal from '../../../components/custom/StockEditModal';
import { doc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import Dropdown, { DropdownToggle, DropdownMenu } from '../../../components/bootstrap/Dropdown';
import { getColorNameWithIndex } from '../../../common/data/enumColors';
import { getFirstLetter } from '../../../helpers/helpers';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Checks, { ChecksGroup } from '../../../components/bootstrap/forms/Checks';
// Define the interface for stock data
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
// Define the functional component for the index page
const Index: NextPage = () => {
	const { darkModeStatus } = useDarkMode(); // Dark mode
	const [searchTerm, setSearchTerm] = useState(''); // State for search term
	const [addModalStatus, setAddModalStatus] = useState<boolean>(false); // State for add modal status
	const [editModalStatus, setEditModalStatus] = useState<boolean>(false); // State for edit modal status
	const [stock, setStock] = useState<Stock[]>([]); // State for stock data
	const [id, setId] = useState<string>(''); // State for current stock ID
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const position = [
		{ position: 'Reserve store' },
		{ position: 'main store' },
		{ position: 'showroom' },
	];
	// Fetch stock data from Firestore
	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'stock');
				const querySnapshot = await getDocs(dataCollection);
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
	}, [editModalStatus, addModalStatus]);
	return (
		<PageWrapper>
			<Head>
				<> {/* Place head content here if needed */}</>
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
					<SubheaderSeparator />
					{/* Button to open new stock modal */}
					<Button
						icon='AddCircleOutline'
						color='primary'
						isLight
						onClick={() => setAddModalStatus(true)}>
						New Stock
					</Button>
				</SubHeaderRight>
			</SubHeader>
			{/* Main page content */}
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
										{/* Map through each stock item */}
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
														{/* Display stock item details */}
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
														{/* Button to open edit stock modal */}
														<Button
															icon='Edit'
															tag='a'
															color='info'
															onClick={() => (
																setEditModalStatus(true),
																setId(stock.cid)
															)}>
															Edit
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
			{/* Modals for adding and editing stock */}
			<StockAddModal setIsOpen={setAddModalStatus} isOpen={addModalStatus} id='' />
			<StockEditModal setIsOpen={setEditModalStatus} isOpen={editModalStatus} id={id} />
		</PageWrapper>
	);
};
export default Index;
