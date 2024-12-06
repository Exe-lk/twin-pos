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
import SellerAddModal from '../../../components/custom/SellerAddModal';
import SellerEditModal from '../../../components/custom/SellerEditModal';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import Dropdown, { DropdownToggle, DropdownMenu } from '../../../components/bootstrap/Dropdown';
import { getColorNameWithIndex } from '../../../common/data/enumColors';
import { getFirstLetter } from '../../../helpers/helpers';
import Swal from 'sweetalert2';
// Define interfaces for Seller
interface Seller {
	cid: string;
	name: string;
	phone: string;
	email: string;
	company_name: string;
	company_email: string;
	product: { category: string; name: string }[];
	status:boolean
}
const Index: NextPage = () => {
	const { darkModeStatus } = useDarkMode(); // Dark mode
	const [searchTerm, setSearchTerm] = useState('');
	const [addModalStatus, setAddModalStatus] = useState<boolean>(false); // State to control the visibility of the Add Seller modal
	const [editModalStatus,setEditModalStatus] = useState<boolean>(false); // State to control the visibility of the Edit Seller modal
	const [seller, setStock] = useState<Seller[]>([]); // State to store the seller data fetched from Firestore
	const [id, setId] = useState<string>(''); // State to store the ID of the seller being edited
	const [status, setStatus] = useState(true);
	// Effect hook to fetch data from Firestore when addModalStatus or editModalStatus changes
	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'seller'); // Reference to the 'seller' collection in Firestore
				const q = query(dataCollection, where('status', '==',true));
				const querySnapshot = await getDocs(q); // Fetching all documents from the collection
				const firebaseData = querySnapshot.docs.map((doc) => {
					const data = doc.data() as Seller; // Extracting data from each document
					return {
						...data,
						cid: doc.id, // Extracting data from each document
					};
				});
				setStock(firebaseData); // Updating the seller state with the fetched data
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, [editModalStatus, addModalStatus, status]); // Dependency array: useEffect runs when addModalStatus or editModalStatus changes
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
					const docRef = doc(firestore, 'seller', item.cid);
					// Update the data
					updateDoc(docRef, item)
						.then(() => {
							Swal.fire('Deleted!', 'seller has been deleted.', 'success');
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
					console.error('Error during deleting: ', error);
					Swal.close;
					alert('An error occurred during file upload. Please try again later.');
				}
			}
		} catch (error) {
			console.error('Error deleting document: ', error);
			Swal.fire('Error', 'Failed to delete seller.', 'error');
		}
	};
	
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
					{/* Dropdown for filter options */}

					<SubheaderSeparator />
					{/* Button to open the Add Seller modal */}
					<Button
						icon='AddCircleOutline'
						color='primary'
						isLight
						onClick={() => setAddModalStatus(true)}>
						Add Seller
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page>
				<div className='row h-100'>
					<div className='col-12'>
						{/* Table for displaying customer data */}
						<Card stretch>
							<CardBody isScrollable className='table-responsive'>
								<table className='table table-modern table-hover'>
									<thead>
										<tr>
											<th>Seller name</th>
											<th>Company name</th>
											<th>Company email</th>
											<th>Phone number</th>
											<th>Seller email</th>
											<th>Product</th>
											<th></th>
										</tr>
									</thead>
									<tbody>
										{seller.map((seller, index) => (
											<tr key={seller.cid}>
												<td>
													{/* Displaying seller name with first letter icon */}
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
																			seller.name,
																		)}
																	</span>
																</div>
															</div>
														</div>
														<div className='flex-grow-1'>
															<div className='fs-6 fw-bold'>
																{seller.name}
															</div>
														</div>
													</div>
												</td>
												<td>{seller.company_name}</td>
												<td>{seller.company_email}</td>
												<td>{seller.phone}</td>
												<td>{seller.email}</td>
												<td>
													{/* Dropdown to view seller's products */}
													<Dropdown>
														<DropdownToggle hasIcon={false}>
															<Button icon='List' color='primary'>
																View Products
															</Button>
														</DropdownToggle>
														<DropdownMenu isAlignmentEnd size='md'>
															{Array.isArray(seller.product) &&
																seller.product.map(
																	(product, index) => (
																		<div
																			key={index}
																			className='ps-2'>
																			{product.name}
																		</div>
																	),
																)}
														</DropdownMenu>
													</Dropdown>
												</td>
												<td>
														<Button
															icon='Edit'
															tag='a'
															color='info'
															onClick={() => (
																setEditModalStatus(true),
																setId(seller.cid)
															)}
															>
															Edit
														</Button>
														<Button
															className='m-2'
															icon='Delete'
															color='warning'
															onClick={() => handleClickDelete(seller)}
															>
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
			{/* Add Seller modal */}
			<SellerAddModal setIsOpen={setAddModalStatus} isOpen={addModalStatus} id='' />
			<SellerEditModal setIsOpen={setEditModalStatus} isOpen={editModalStatus} id={id} />

		</PageWrapper>
	);
};
export default Index;
