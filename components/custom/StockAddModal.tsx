import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, } from '../bootstrap/Modal';
import showNotification from '../extras/showNotification';
import Icon from '../icon/Icon';
import FormGroup from '..//bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { firestore, storage } from '../../firebaseConfig';
import Swal from 'sweetalert2';
import Select from '../bootstrap/forms/Select';
import Option, { Options } from '../bootstrap/Option';

// Define the props for the StockAddModal component
interface StockAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
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
// StockAddModal component definition
const StockAddModal: FC<StockAddModalProps> = ({ id, isOpen, setIsOpen }) => {

	const [item, setItem] = useState<Item[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const currentDate = new Date();
	const formattedDate = currentDate.toLocaleDateString();
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
	const filteredOptions = item.filter(item =>
		item.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Initialize formik for form management
	const formik = useFormik({
		initialValues: {
			item_id: '',
			location: 'Reserve store',
			sublocation: "",
			exp: '',
			buy_price: '',
			quentity: '',
			status: "",
			date:formattedDate,
			active:true

		},
		validate: (values) => {
			const errors: {
				item_id?: string;
				location?: string;
				sublocation?: string;
				exp?: string;
				buy_price?: string;
				quentity?: string;
				status?: string
			} = {};
			if (!values.buy_price) {
				errors.buy_price = 'Required';
			}
			if (!values.item_id) {
				errors.item_id = 'Required';
			}
			if (!values.location) {
				errors.location = 'Required';
			}
			if (!values.quentity) {
				errors.quentity = 'Required';
			}
			if (!values.status) {
				errors.status = 'Required';
			}
			if (!values.sublocation) {
				errors.sublocation = 'Required';
			}
			return errors;
		},
		onSubmit: async (values) => {
			try {
				values.active=true
				const collectionRef = collection(firestore, 'stock');
				addDoc(collectionRef, values).then(() => {
					setIsOpen(false);
					showNotification(
						<span className='d-flex align-items-center'>
							<Icon icon='Info' size='lg' className='me-1' />
							<span>Successfully Added</span>
						</span>,
						'Stock has been added successfully',
					);
					Swal.fire('Added!', 'Stock has been add successfully.', 'success');
				}).catch((error) => {
					console.error('Error adding document: ', error);
					alert('An error occurred while adding the document. Please try again later.');
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
				<ModalTitle id="">{'New Stock'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>

					<Input
						type="text"
						placeholder="Search..."
						value={searchTerm}
						onChange={(e: any) => setSearchTerm(e.target.value)}
					/>
					<FormGroup id='item_id' label='Item Name' className='col-md-6'>
						<Select
							ariaLabel='Default select example'
							onChange={formik.handleChange}
							value={formik.values.item_id}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							placeholder='Select Item'
							isTouched={formik.touched.item_id}
							invalidFeedback={formik.errors.item_id}
							validFeedback='Looks good!'>
							{filteredOptions.map((option, index) => (
								<Option value={option.name}>{option.name}</Option>
							))}
						</Select>
					</FormGroup>
					<FormGroup id='buy_price' label='Unit cost' className='col-md-6'>
						<Input
							type="number"
							onChange={formik.handleChange}
							value={formik.values.buy_price}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.buy_price}
							invalidFeedback={formik.errors.buy_price}
							min={0}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='location' label='Location' className='col-md-6'>
						<Input
							disabled={true}
							onChange={formik.handleChange}
							value={formik.values.location}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.location}
							invalidFeedback={formik.errors.location}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='sublocation' label='Sub Location' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.sublocation}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.sublocation}
							invalidFeedback={formik.errors.sublocation}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='exp' label='EXP Date' className='col-md-6'>
						<Input
							type='date'
							onChange={formik.handleChange}
							value={formik.values.exp}
							onBlur={formik.handleBlur}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='quentity' label='Quentity' className='col-md-6'>
						<Input
							type='number'
							onChange={formik.handleChange}
							value={formik.values.quentity}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.quentity}
							invalidFeedback={formik.errors.quentity}
							min={1}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='status' label='Status' className='col-md-6'>
						<Select
							ariaLabel='Default select example'
							placeholder='Open this select status'
							onChange={formik.handleChange}
							value={formik.values.status}
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
				<Button color='info' onClick={formik.handleSubmit} >
					Save
				</Button>
			</ModalFooter>
		</Modal>
	);
}
// Prop types definition for CustomerEditModal component
StockAddModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};
export default StockAddModal;
