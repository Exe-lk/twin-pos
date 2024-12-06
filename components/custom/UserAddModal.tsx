import React, { FC, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import showNotification from '../extras/showNotification';
import Icon from '../icon/Icon';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import { collection, addDoc } from 'firebase/firestore';
import { firestore, storage,auth } from '../../firebaseConfig';
import Swal from 'sweetalert2';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import Select from '../bootstrap/forms/Select';
import Option from '../bootstrap/Option';
import { createUserWithEmailAndPassword } from 'firebase/auth';

// Define the props for the UserAddModal component
interface UserAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}
// UserAddModal component definition
const UserAddModal: FC<UserAddModalProps> = ({ id, isOpen, setIsOpen }) => {
	const [imageurl, setImageurl] = useState<any>(null);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	//image upload
	const handleUploadimage = async () => {
		if (imageurl) {
			// Assuming generatePDF returns a Promise
			const pdfFile = imageurl;
			console.log(imageurl);
			const storageRef = ref(storage, `user/${pdfFile.name}`);
			const uploadTask = uploadBytesResumable(storageRef, pdfFile);
			return new Promise((resolve, reject) => {
				uploadTask.on(
					'state_changed',
					(snapshot) => {
						const progress1 = Math.round(
							(snapshot.bytesTransferred / snapshot.totalBytes) * 100,
						);
					},
					(error) => {
						console.error(error.message);
						reject(error.message);
					},
					() => {
						getDownloadURL(uploadTask.snapshot.ref)
							.then((url) => {
								console.log('File uploaded successfully. URL:', url);

								console.log(url);
								resolve(url);
							})
							.catch((error) => {
								console.error(error.message);
								reject(error.message);
							});
					},
				);
			});
		}
	};

	// Initialize formik for form management
	const formik = useFormik({
		initialValues: {
			image: '',
			name: '',
			position: '',
			email: '',
			password: '',
			mobile: '',
			pin_number: '',
			NIC:"",
			status:true
		},
		validate: (values) => {
			const errors: {
				position?: string;
				image?: string;
				name?: string;
				email?: string;
				password?: string;
				mobile?: string;
				pin_number?: string;
				NIC?:string;
			} = {};
			if (!values.position) {
				errors.position = 'Required';
			}
			if (!values.name) {
				errors.name = 'Required';
			}
			if (!values.email) {
				errors.email = 'Required';
			}
			
			if (!values.mobile) {
				errors.mobile = 'Required';
			}
			if (!values.pin_number) {
				errors.pin_number = 'Required';
			}
			if (!values.NIC) {
				errors.NIC = 'Required';
			}
			return errors;
		},
		onSubmit: async (values) => {
			try {
				Swal.fire({
					title: 'Processing...',
					html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
					allowOutsideClick: false,
					showCancelButton: false,
					showConfirmButton: false,
				});
				const imgurl: any = await handleUploadimage();
				values.image = imgurl || '';
				values.password=values.NIC
				values.status=true
				const collectionRef = collection(firestore, 'user');
				addDoc(collectionRef, values)
					.then(async () => {
						try {
							await createUserWithEmailAndPassword(auth,values.email, values.password);
							// User registration successful
						  } catch (err) {
							Swal.fire('Error..!', 'user has been add befor', 'error');
						  }
						setIsOpen(false);
						showNotification(
							<span className='d-flex align-items-center'>
								<Icon icon='Info' size='lg' className='me-1' />
								<span>Successfully Added</span>
							</span>,
							'User has been added successfully',
						);
						Swal.fire('Added!', 'user has been add successfully.', 'success');
					})
					.catch((error) => {
						console.error('Error adding document: ', error);
						Swal.close;
						alert(
							'An error occurred while adding the document. Please try again later.',
						);
					});
			} catch (error) {
				console.error('Error during handleUpload: ', error);
				Swal.close;
				alert('An error occurred during file upload. Please try again later.');
			}
		},
	});
	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader setIsOpen={setIsOpen} className='p-4'>
				<ModalTitle id=''>{'New user'}</ModalTitle>
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
					<FormGroup id='position' label='Position' className='col-md-6'>
					
						<Select
							ariaLabel='Default select example'
						
							onChange={formik.handleChange}
							value={formik.values.position}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.position}
							invalidFeedback={formik.errors.position}>
							<Option value={'Admin'}>Admin</Option>
							<Option value={'Stock keeper'}>Stock keeper</Option>
							<Option value={'Data entry operator'}>Data entry operator</Option>
							<Option value={'Accountant'}>Accountant</Option>
							<Option value={'Cashier'}>Cashier</Option>
						</Select>
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
					<FormGroup id='mobile' label='Mobile number' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.mobile}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.mobile}
							invalidFeedback={formik.errors.mobile}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='NIC' label='NIC' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.NIC}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.NIC}
							invalidFeedback={formik.errors.NIC}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='pin_number' label='PIN number' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.pin_number}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.pin_number}
							invalidFeedback={formik.errors.pin_number}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup label='Profile Picture' className='col-md-6'>
						<Input
							type='file'
							onChange={(e: any) => {
								setImageurl(e.target.files[0]);
								// Display the selected image
								setSelectedImage(URL.createObjectURL(e.target.files[0]));
							}}
						/>
					</FormGroup>
					{selectedImage && (
						<img
							src={selectedImage}
							className='mx-auto d-block mb-4'
							alt='Selected Profile Picture'
							style={{ width: '200px', height: '200px' }}
						/>
					)}
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
// Prop types definition for UserAddModal component
UserAddModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};
export default UserAddModal;
