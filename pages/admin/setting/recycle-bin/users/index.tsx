import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
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
import UserAddModal from '../../../../../components/custom/UserAddModal';
import UserEditModal from '../../../../../components/custom/UserEditModal';
import { doc, deleteDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { firestore } from '../../../../../firebaseConfig';
import Dropdown, { DropdownToggle, DropdownMenu } from '../../../../../components/bootstrap/Dropdown';
import { getColorNameWithIndex } from '../../../../../common/data/enumColors';
import { getFirstLetter } from '../../../../../helpers/helpers';
import Swal from 'sweetalert2';

interface User {
	cid: string;
	image: string;
	name: string;
	position: string;
	email: string;
	password: string;
	mobile: number;
	pin_number: number;
}

const Index: NextPage = () => {
	// Dark mode
	const { darkModeStatus } = useDarkMode();
	const [searchTerm, setSearchTerm] = useState('');
	const [addModalStatus, setAddModalStatus] = useState<boolean>(false);
	const [editModalStatus, setEditModalStatus] = useState<boolean>(false);
	const [user, setuser] = useState<User[]>([]);
	const [id, setId] = useState<string>('');
	const [status, setStatus] = useState(true);

	//get user data from database
	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'user');
				const q = query(dataCollection, where('status', '==', false));
				const querySnapshot = await getDocs(q);
				const firebaseData = querySnapshot.docs.map((doc) => {
					const data = doc.data() as User;
					return {
						...data,
						cid: doc.id,
					};
				});
				setuser(firebaseData);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, [editModalStatus, addModalStatus,status]);

	//delete user
	const handleClickDelete = async (id: string) => {
		try {
			const result = await Swal.fire({
				title: 'Are you sure?',
				text: 'You will not be able to recover this user!',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, delete it!',
			});
			if (result.isConfirmed) {
				const docRef = doc(firestore, 'user', id);
				await deleteDoc(docRef);
				// Show success message
				Swal.fire('Deleted!', 'user has been deleted.', 'success');
				if (status) {
					setStatus(false);
				} else {
					setStatus(true);
				}
			}
		} catch (error) {
			console.error('Error deleting document: ', error);
			Swal.fire('Error', 'Failed to delete user.', 'error');
		}
	};

    const handleClickRestore = async (user:any) => {
		try {
			const result = await Swal.fire({
				title: 'Are you sure?',
				// text: 'You will not be able to recover this user!',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, Restore it!',
			});
			if (result.isConfirmed) {
				try {
					user.status = true;
					const docRef = doc(firestore, 'user', user.cid);
					// Update the data
					updateDoc(docRef, user)
						.then(() => {
							// Show success message

							if (status) {
								setStatus(false);
							} else {
								setStatus(true);
							}
							Swal.fire('Restored!', 'user has been restored.', 'success');
						})
						.catch((error) => {
							console.error('Error adding document: ', error);
							alert(
								'An error occurred while adding the document. Please try again later.',
							);
						});
				} catch (error) {
					console.error('Error during handleUpload: ', error);
					alert('An error occurred during file upload. Please try again later.');
				}
			}
		} catch (error) {
			console.error('Error deleting document: ', error);
			Swal.fire('Error', 'Failed to delete user.', 'error');
		}
	};
	const handleDeleteAll = async () => {
		try {
			const result = await Swal.fire({
				title: 'Are you sure?',
				text: 'You will not be able to recover these users!',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, delete them!',
			});
			if (result.isConfirmed) {
				const promises = user.map((u) => deleteDoc(doc(firestore, 'user', u.cid)));
				await Promise.all(promises);
				Swal.fire('Deleted!', 'All users have been deleted.', 'success');
				setStatus((prevStatus) => !prevStatus);
			}
		} catch (error) {
			console.error('Error deleting documents: ', error);
			Swal.fire('Error', 'Failed to delete users.', 'error');
		}
	};

	const handleRestoreAll = async () => {
		try {
			const result = await Swal.fire({
				title: 'Are you sure?',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, restore them!',
			});
			if (result.isConfirmed) {
				const promises = user.map((u:any) => {
					u.status = true;
					return updateDoc(doc(firestore, 'user', u.cid), u);
				});
				await Promise.all(promises);
				Swal.fire('Restored!', 'All users have been restored.', 'success');
				setStatus((prevStatus) => !prevStatus);
			}
		} catch (error) {
			console.error('Error updating documents: ', error);
			Swal.fire('Error', 'Failed to restore users.', 'error');
		}
	};

	return (
		<PageWrapper>
			<SubHeader>
				<SubHeaderLeft>
					{/* Search input  */}
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
						// onChange={formik.handleChange}
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
						{/* Table for displaying user data */}
						<Card stretch>
							<CardBody isScrollable className='table-responsive'>
								<table className='table table-modern table-hover'>
									<thead>
										<tr>
											<th>User</th>
											<th>Position</th>
											<th>Email</th>
											<th>Mobile number</th>
											<th>Password</th>
											<th>PIN number</th>
											<th></th>
										</tr>
									</thead>
									<tbody>
										{user.map((user, index) => (
											<tr key={user.cid}>
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
																		{getFirstLetter(user.name)}
																	</span>
																</div>
															</div>
														</div>
														<div className='flex-grow-1'>
															<div className='fs-6 fw-bold'>
																{user.name}
															</div>
															<div className='text-muted'>
																<Icon icon='Label' />{' '}
																<small>{user.cid}</small>
															</div>
														</div>
													</div>
												</td>
												<td>{user.position}</td>
												<td>{user.email}</td>
												<td>{user.mobile}</td>
												<td>{user.password}</td>
												<td>{user.pin_number}</td>
												<td>
													<Button
														icon='Restore'
														tag='a'
														color='info'
														onClick={() => handleClickRestore(user)}>
														Restore
													</Button>
													<Button
														className='m-2'
														icon='Delete'
														color='warning'
														onClick={() => handleClickDelete(user.cid)}>
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
			<UserAddModal setIsOpen={setAddModalStatus} isOpen={addModalStatus} id='' />
			<UserEditModal setIsOpen={setEditModalStatus} isOpen={editModalStatus} id={id} />
		</PageWrapper>
	);
};
export default Index;
