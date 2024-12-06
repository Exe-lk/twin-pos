import React, { useContext, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import PageWrapper from '../../../../../layout/PageWrapper/PageWrapper';
import useDarkMode from '../../../../../hooks/useDarkMode';
import Page from '../../../../../layout/Page/Page';
import { firestore } from '../../../../../firebaseConfig';
import SubHeader, {
	SubHeaderLeft,
	SubHeaderRight,
	SubheaderSeparator,
} from '../../../../../layout/SubHeader/SubHeader';
import Icon from '../../../../../components/icon/Icon';
import Input from '../../../../../components/bootstrap/forms/Input';
import Dropdown, { DropdownMenu, DropdownToggle } from '../../../../../components/bootstrap/Dropdown';
import Button from '../../../../../components/bootstrap/Button';
import Card, { CardBody } from '../../../../../components/bootstrap/Card';
import { collection, deleteDoc, doc, getDocs, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import CategoryAddModal from '../../../../../components/custom/CategoryAddModal';
import CategoryEditModal from '../../../../../components/custom/CategoryEditModal';
import Swal from 'sweetalert2';
// Define the interface for category data
interface Category {
	cid: string;
	categoryname: string;
	status:boolean
}
// Define the functional component for the index page
const Index: NextPage = () => {
	const { darkModeStatus } = useDarkMode(); // Dark mode
	const [searchTerm, setSearchTerm] = useState(''); // State for search term
	const [addModalStatus, setAddModalStatus] = useState<boolean>(false); // State for add modal status
	const [editModalStatus, setEditModalStatus] = useState<boolean>(false); // State for edit modal status
	const [category, setcategory] = useState<Category[]>([]); // State for category data
	const [id, setId] = useState<string>(''); // State for current category ID
	const [status, setStatus] = useState(true); // State for managing data fetching status
	// Fetch category data from Firestore on component mount or when add/edit modals are toggled
	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'category');
				const q = query(dataCollection, where('status', '==', false));
				const querySnapshot = await getDocs(q);
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
	}, [editModalStatus, addModalStatus,status]);
	const customOptions = {
		width: 3,
		color: '#FF0000',
	};
	// Function to handle deletion of a category
	const handleClickRestore= async (category:any) => {
		try {
			const result = await Swal.fire({
				title: 'Are you sure?',
				// text: 'You will not be able to recover this category!',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, restore it!',
			});
			if (result.isConfirmed) {
				category.status=true
				let data: any =category
				const docRef = doc(firestore, "category", category.cid);
				
				updateDoc(docRef, data).then(() => {
					if (status) {
						setStatus(false);
					} else {
						setStatus(true);
					}
					
					Swal.fire('Restore!', 'category has been restore successfully.', 'success');
				}).catch((error) => {
					console.error('Error adding document: ', error);
					alert('An error occurred while adding the document. Please try again later.');
				});
				
				
			}
		} catch (error) {
			console.error('Error deleting document: ', error);
			Swal.fire('Error', 'Failed to delete category.', 'error');
		}
	};
    const handleClickDelete = async (id: string) => {
		try {
			const result = await Swal.fire({
				title: 'Are you sure?',
				text: 'You will not be able to recover this category!',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, delete it!',
			});
			if (result.isConfirmed) {
				const docRef = doc(firestore, 'category', id);
				await deleteDoc(docRef);
				Swal.fire('Deleted!', 'category has been deleted.', 'success');
				// Toggle status to trigger data re-fetch from Firestore
				if (status) {
					setStatus(false);
				} else {
					setStatus(true);
				}
			}
		} catch (error) {
			console.error('Error deleting document: ', error);
			Swal.fire('Error', 'Failed to delete category.', 'error');
		}
	};
	const handleDeleteAll = async () => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: 'You will not be able to recover these categories!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete all!',
            });
            if (result.isConfirmed) {
                const batch = writeBatch(firestore);
                category.forEach((cat) => {
                    const docRef = doc(firestore, 'category', cat.cid);
                    batch.delete(docRef);
                });
                await batch.commit();
                Swal.fire('Deleted!', 'All categories have been deleted.', 'success');
                setStatus(!status);
            }
        } catch (error) {
            console.error('Error deleting all documents: ', error);
            Swal.fire('Error', 'Failed to delete all categories.', 'error');
        }
    };

    // Function to handle restoration of all categories
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
                category.forEach((cat) => {
                    const docRef = doc(firestore, 'category', cat.cid);
                    batch.update(docRef, { status: true });
                });
                await batch.commit();
                Swal.fire('Restored!', 'All categories have been restored.', 'success');
                setStatus(!status);
            }
        } catch (error) {
            console.error('Error restoring all documents: ', error);
            Swal.fire('Error', 'Failed to restore all categories.', 'error');
        }
    };

	// JSX for rendering the page
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
					{/* Button to open New category */}
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
						{/* Table for displaying customer data */}
						<Card stretch>
							<CardBody isScrollable className='table-responsive'>
								{/* <table className='table table-modern table-hover'> */}
								<table className='table table-modern table-hover text-center'>
									<thead>
										<tr>
											<th>Category name</th>
											<th></th>
										</tr>
									</thead>
									<tbody>
										{category
											.filter((values) => {
												if (searchTerm == '') {
													return values;
												} else if (
													values.categoryname
														.toLowerCase()
														.includes(searchTerm.toLowerCase())
												) {
													return values;
												}
											})
											.map((category, index) => (
												<tr key={category.cid}>
													<td>{category.categoryname}</td>
													<td>
														<Button
															icon='Restore'
															tag='a'
															color='info'
															onClick={() =>
																handleClickRestore(category)
															}>
															Restore
														</Button>
                                                        <Button
															className='m-2'
															icon='Delete'
															color='warning'
															onClick={() =>
																handleClickDelete(category.cid)
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
			<CategoryAddModal setIsOpen={setAddModalStatus} isOpen={addModalStatus} id='' />
			<CategoryEditModal setIsOpen={setEditModalStatus} isOpen={editModalStatus} id={id} />
		</PageWrapper>
	);
};
export default Index;
