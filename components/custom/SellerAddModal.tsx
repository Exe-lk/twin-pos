import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
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

interface Category {
	categoryId: string;
	categoryname: string;
}
interface Item {
	itemId: string;
	name: string;
	category: string;
}
// Define the props for the SellerAddModal component
interface SellerAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}
interface Product {
	category: string;
	name: string;
}
// SellerAddModal component definition
const SellerAddModal: FC<SellerAddModalProps> = ({ id, isOpen, setIsOpen }) => {
	const [categories, setCategories] = useState<Category[]>([]);
	const [items, setItems] = useState<Item[]>([]);
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const querySnapshot = await getDocs(collection(firestore, 'category'));
				const fetchedCategories: Category[] = [];
				querySnapshot.forEach((doc) => {
					const data = doc.data();
					fetchedCategories.push({
						categoryId: doc.id,
						categoryname: data.categoryname,
					});
				});
				setCategories(fetchedCategories);
			} catch (error) {
				console.error('Error fetching categories:', error);
			}
		};

		fetchCategories();
	}, []);

	useEffect(() => {
		const fetchItems = async () => {
			try {
				const querySnapshot = await getDocs(collection(firestore, 'item'));
				const fetchedItems: Item[] = [];
				querySnapshot.forEach((doc) => {
					const data = doc.data();
					fetchedItems.push({
						itemId: doc.id,
						name: data.name,
						category: data.category,
					});
				});
				setItems(fetchedItems);
			} catch (error) {
				console.error('Error fetching Items:', error);
			}
		};

		fetchItems();
	}, []);

	// Initialize formik for form management
	const formik = useFormik({
		initialValues: {
			name: '',
			phone: '',
			email: '',
			company_name: '',
			company_email: '',
			product: [{ category: '', name: '' }],
			status:true
		},
		validate: (values) => {
			const errors: {
				name?: string;
				phone?: string;
				email?: string;
				company_name?: string;
				company_email?: string;
				products?: string[];
			} = {};
			if (!values.name) {
				errors.name = 'Required';
			}
			if (!values.phone) {
				errors.phone = 'Required';
			}
			if (!values.email) {
				errors.email = 'Required';
			}
			if (!values.company_name) {
				errors.company_name = 'Required';
			}
			if (!values.company_email) {
				errors.company_email = 'Required';
			}
			// if (!values.product) {
			// 	errors.product = 'Required';
			// }
			return errors;
		},
		onSubmit: async (values) => {
			try {
				console.log(values);
				values.status=true
				const collectionRef = collection(firestore, 'seller');
				addDoc(collectionRef, values)
					.then(() => {
						setIsOpen(false);
						showNotification(
							<span className='d-flex align-items-center'>
								<Icon icon='Info' size='lg' className='me-1' />
								<span>Successfully Added</span>
							</span>,
							'Seller has been added successfully',
						);
						Swal.fire('Added!', 'Seller has been add successfully.', 'success');
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
	// Function to handle adding a new product input field
	const addProductField = () => {
		formik.setValues({
			...formik.values,
			product: [...formik.values.product, { category: '', name: '' }],
		});
	};
	const removeProductField = (index: number) => {
		const newProducts = [...formik.values.product];
		newProducts.splice(index, 1);
		formik.setValues({
			...formik.values,
			product: newProducts,
		});
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader setIsOpen={setIsOpen} className='p-4'>
				<ModalTitle id=''>{'New Seller'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='name' label='Name' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.name}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.name}
							invalidFeedback={formik.errors.name}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='phone' label='Phone' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.phone}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.phone}
							invalidFeedback={formik.errors.phone}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='email' label='Email' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.email}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.email}
							invalidFeedback={formik.errors.email}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='company_name' label='Company name' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.company_name}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.company_name}
							invalidFeedback={formik.errors.company_name}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='company_email' label='company email' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.company_email}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.company_email}
							invalidFeedback={formik.errors.company_email}
							validFeedback='Looks good!'
						/>
					</FormGroup>

					{formik.values.product.map((product, index) => (
						<FormGroup
							key={index}
							id={`product-${index}`}
							label={`Product ${index + 1}`}
							className='col-md-6'>
							<div className='d-flex align-items-center'>
								<Select
									ariaLabel='Select Product'
									value={product.category} // Use category value
									onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
										const newProducts = [...formik.values.product];
										newProducts[index] = {
											...newProducts[index],
											category: event.target.value,
										}; // Update category
										formik.setFieldValue('product', newProducts);
									}}>
									<Option value='' disabled>
										Select Product
									</Option>
									{categories.map((category) => (
										<Option
											key={category.categoryId}
											value={category.categoryname}>
											{category.categoryname}
										</Option>
									))}
								</Select>
								{product.category && ( // Show item dropdown only when category is selected
									<Select
										ariaLabel={`Select item for ${product.category}`} // Use selected category
										value={product.name} // Use item name value
										onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
											const newProducts = [...formik.values.product];
											newProducts[index] = {
												...newProducts[index],
												name: event.target.value,
											}; // Update item name
											formik.setFieldValue('product', newProducts);
										}}>
										<Option value='' disabled>
											Select Item
										</Option>
										{items
											.filter((item) => item.category === product.category) // Filter items based on selected category
											.map((item) => (
												<Option key={item.itemId} value={item.name}>
													{item.name}
												</Option>
											))}
									</Select>
								)}
								<button
									type='button'
									onClick={() => removeProductField(index)}
									className='btn btn-outline-danger ms-2'>
									<Icon icon='Delete' />
								</button>
							</div>
						</FormGroup>
					))}

					{/* Button to add new product input field */}
					<div className='col-md-12'>
						<Button color='info' onClick={addProductField}>
							Add Product
						</Button>
					</div>
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
// Prop types definition for SellerEditModal component
SellerAddModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};
export default SellerAddModal;
