import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import showNotification from '../extras/showNotification';
import Icon from '../icon/Icon';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import Swal from 'sweetalert2';
import Select from '../bootstrap/forms/Select';
import Option, { Options } from '../bootstrap/Option';

// Define the props for the CustomerEditModal component
interface ICustomerEditModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}
interface Stock {
	cid: string;
	buy_price: number;
	item_id: string;
	location: string;
	quentity: string;
	status: string;
	sublocation: string;
	exp: string;
	active: boolean;
}
interface Item {
	cid: string;
	category: number;
	image: string;
	name: string;
	price: number;
	quentity: number;
	reorderlevel: number;
}
// CustomerEditModal component definition
const CustomerEditModal: FC<ICustomerEditModalProps> = ({ id, isOpen, setIsOpen }) => {
	const data: Stock = {
		cid: '',
		buy_price: 0,
		item_id: '',
		location: '',
		quentity: '',
		status: '',
		sublocation: '',
		exp: '',
		active: true,
	};
	const [stock, setStock] = useState<Stock>(data);
	const [item, setItem] = useState<Item[]>([]);
	const [searchTerm, setSearchTerm] = useState('');

	//get data from database
	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'item');
				const querySnapshot = await getDocs(dataCollection);
				const firebaseData = querySnapshot.docs.map((doc) => {
					const data = doc.data() as Item;
					return {
						...data,
						cid: doc.id,
					};
				});

				setItem(firebaseData);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, []);

	// Logic for filtering options based on search term
	const filteredOptions = item.filter((item) =>
		item.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	//fetch data from database
	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'stock');
				const q = query(dataCollection, where('__name__', '==', id));
				const querySnapshot = await getDocs(q);
				const firebaseData: any = querySnapshot.docs.map((doc) => {
					const data = doc.data() as Stock;
					return {
						...data,
						cid: doc.id,
					};
				});
				await setStock(firebaseData[0]);

				console.log('Firebase Data:', stock);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};

		fetchData();
	}, [id]);

	// Initialize formik for form management
	const formik = useFormik({
		initialValues: {
			item_id: '',
			location: '',
			sublocation: '',
			exp: '',
			buy_price: '',
			quentity: '',
			status: '',
		},
		validate: (values) => {
			const errors: {
				item_id?: string;
				location?: string;
				sublocation?: string;
				exp?: string;
				buy_price?: string;
				quentity?: string;
				status?: string;
			} = {};
			if (!stock.buy_price) {
				errors.buy_price = 'Required';
			}

			if (!stock.item_id) {
				errors.item_id = 'Required';
			}
			if (!stock.location) {
				errors.location = 'Required';
			}
			if (!stock.quentity) {
				errors.quentity = 'Required';
			}
			if (!stock.status) {
				errors.status = 'Required';
			}
			if (!stock.sublocation) {
				errors.sublocation = 'Required';
			}

			return errors;
		},
		onSubmit: async (values) => {
			try {
				let data: any = stock;
				const docRef = doc(firestore, 'stock', id);
				// Update the data
				updateDoc(docRef, data)
					.then(() => {
						setIsOpen(false);
						showNotification(
							<span className='d-flex align-items-center'>
								<Icon icon='Info' size='lg' className='me-1' />
								<span>Successfully Added</span>
							</span>,
							'Stock has been edit successfully',
						);
						Swal.fire('Added!', 'Stock has been add successfully.', 'success');
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
		},
	});

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader setIsOpen={setIsOpen} className='p-4'>
				<ModalTitle id=''>{'Edit Stock'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<Input
						type='text'
						placeholder='Search...'
						value={searchTerm}
						onChange={(e: any) => setSearchTerm(e.target.value)}
					/>
					<FormGroup
						id='item_id'
						label='Item Name'
						onChange={formik.handleChange}
						className='col-md-6'>
						<Select
							ariaLabel='Default select example'
							onChange={(e: any) => {
								stock.item_id = e.target.value;
							}}
							value={stock?.item_id}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.item_id}
							invalidFeedback={formik.errors.item_id}
							validFeedback='Looks good!'>
							{filteredOptions.map((option, index) => (
								<Option value={option.name}>{option.name}</Option>
							))}
						</Select>
					</FormGroup>

					<FormGroup
						id='buy_price'
						label='Unit cost'
						onChange={formik.handleChange}
						className='col-md-6'>
						<Input
							type='number'
							onChange={(e: any) => {
								stock.buy_price = e.target.value;
							}}
							value={stock?.buy_price}
							min={0}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.buy_price}
							invalidFeedback={formik.errors.buy_price}
							validFeedback='Looks good!'
						/>
					</FormGroup>

					<FormGroup
						id='location'
						label='Location'
						onChange={formik.handleChange}
						className='col-md-6'>
						<Select
							ariaLabel='Default select example'
							placeholder='Open this select location'
							onChange={(e: any) => {
								stock.location = e.target.value;
							}}
							value={stock?.location}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.location}
							invalidFeedback={formik.errors.location}
							validFeedback='Looks good!'>
							<Option value='reserve store'>Reserve Store</Option>
							<Option value='main store'>Main Store</Option>
							<Option value='showroom'>Showroom</Option>
						</Select>
					</FormGroup>
					<FormGroup
						id='sublocation'
						label='Sub Location'
						onChange={formik.handleChange}
						className='col-md-6'>
						<Input
							onChange={(e: any) => {
								stock.sublocation = e.target.value;
							}}
							value={stock?.sublocation}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.sublocation}
							invalidFeedback={formik.errors.sublocation}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup
						id='exp'
						label='EXP Date'
						onChange={formik.handleChange}
						className='col-md-6'>
						<Input
							type='date'
							onChange={(e: any) => {
								stock.exp = e.target.value;
							}}
							value={stock?.exp}
							onBlur={formik.handleBlur}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup
						id='quentity'
						label='Quentity'
						onChange={formik.handleChange}
						className='col-md-6'>
						<Input
							type='number'
							onChange={(e: any) => {
								stock.quentity = e.target.value;
							}}
							value={stock?.quentity}
							min={1}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.quentity}
							invalidFeedback={formik.errors.quentity}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup
						id='status'
						label='Status'
						onChange={formik.handleChange}
						className='col-md-6'>
						<Select
							ariaLabel='Default select example'
							placeholder='Open this select status'
							onChange={(e: any) => {
								stock.status = e.target.value;
							}}
							value={stock?.status}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.status}
							invalidFeedback={formik.errors.status}
							validFeedback='Looks good!'>
							<Option value='Paid'>Paid</Option>
							<Option value='Half Payment'>Half Payment</Option>
							<Option value='Not Paid'>Not Paid</Option>
						</Select>
					</FormGroup>
				</div>
			</ModalBody>
			<ModalFooter className='px-4 pb-4'>
				{/* Save button to submit the form */}
				<Button color='info' onClick={formik.handleSubmit}>
					Save
				</Button>
			</ModalFooter>
		</Modal>
	);
};
// If 'id' is not present, return null (modal won't be rendered)
// Prop types definition for CustomerEditModal component
CustomerEditModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default CustomerEditModal;
