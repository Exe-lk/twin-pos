import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, {ModalBody,ModalFooter,ModalHeader,ModalTitle,} from '../bootstrap/Modal';
import showNotification from '../extras/showNotification';
import Icon from '../icon/Icon';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import { collection,query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firestore, storage } from '../../firebaseConfig';
import Swal from 'sweetalert2';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import Select from '../bootstrap/forms/Select';
import Option from '../bootstrap/Option';
// Define the props for the UserEditModal component
interface UserEditModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}
interface User {
    cid: string;
    image: string;
    name: string;
    position: string;
    email: string;
    password: string;
    mobile: string;
    pin_number: string;
	NIC:string;
}
// UserEditModal component definition
const UserEditModal: FC<UserEditModalProps> = ({ id, isOpen, setIsOpen }) => {
	const data: User = {
		cid: "",
		image:"",
        name: '',
        position: '',
        email: '',
        password: '',
        mobile: '',
        pin_number:'',
		NIC:""
	}
	const [user, setStock] = useState<User>(data);
	const [imageurl, setImageurl] = useState<any>(null);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	//fetch data from database
	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'user');
				const q = query(dataCollection, where('__name__', '==', id));
				const querySnapshot = await getDocs(q);
				const firebaseData: any = querySnapshot.docs.map((doc) => {
					const data = doc.data() as User;
					return {
						...data,
						cid: doc.id,
					};
				});
				await setStock(firebaseData[0])
                console.log('Firebase Data:', user);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
        fetchData();
	}, [id]);

	//upload image to database
	const handleUploadimage = async () => {
		if (imageurl) {
			 // Assuming generatePDF returns a Promise
			 const pdfFile = imageurl;
			 console.log(imageurl)
			 const storageRef = ref(storage, `user/${pdfFile.name}`);
			 const uploadTask = uploadBytesResumable(storageRef, pdfFile);
			 return new Promise((resolve, reject) => {
				 uploadTask.on(
					 'state_changed',
					 (snapshot) => {
						 const progress1 = Math.round(
							 (snapshot.bytesTransferred / snapshot.totalBytes) * 100
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
					 }
				 );
			 });
		 } else {
			 return user.image
		 }
	}
	
    // Initialize formik for form management
	const formik = useFormik({
        initialValues: {
			image:"",
            name: '',
            position: '',
            email: '',
            password: '',
            mobile: '',
            pin_number:'',
			NIC:""
        },
		validate: (values) => {
			const errors: {
				cid?: string;
                position?: string;
				image?: string;
				name?: string;
				email?: string;
                password?: string;
				mobile?: string;
                pin_number?: string;
				NIC?:string;
			} = {};
            if (!user.position) {
				errors.position = 'Required';
			}
			if (!user.NIC) {
				errors.NIC = 'Required';
			}
            if (!user.name) {
				errors.name = 'Required';
			}
		    if (!user.email) {
				errors.email = 'Required';
			}
            if (!user.password) {
				errors.password = 'Required';
			}
            if (!user.mobile) {
				errors.mobile = 'Required';
			}
            if (!user.pin_number) {
				errors.pin_number = 'Required';
			}
			return errors;
		},
		onSubmit: async (values) => {
			try {
				Swal.fire({
					title: "Processing...",
					html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
					allowOutsideClick: false,
					showCancelButton: false,
					showConfirmButton: false,
				});
				user.password=user.NIC
                let data: any = user
				const imgurl: any = await handleUploadimage()
				data.image = imgurl || "";
				const docRef = doc(firestore, "user", id);
				// Update the data
				updateDoc(docRef, data).then(() => {
                    setIsOpen(false);
					showNotification(
						<span className='d-flex align-items-center'>
							<Icon icon='Info' size='lg' className='me-1' />
							<span>Successfully Added</span>
						</span>,
						'user has been update successfully',
					);
					Swal.fire('Added!', 'user has been add successfully.', 'success');
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
				<ModalTitle id="">{'Edit Stock'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='name' label='Name' onChange={formik.handleChange} className='col-md-6'>
						<Input
							onChange={(e: any) => { user.name = e.target.value }}
							value={user?.name}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.name}
							invalidFeedback={formik.errors.name}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='position' label='Position'onChange={formik.handleChange} className='col-md-6'>
					
					<Select
						ariaLabel='Default select example'
					
						onChange={(e: any) => { user.position = e.target.value }}
						value={user?.position}
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
                    <FormGroup id='email' label='Email' onChange={formik.handleChange} className='col-md-6'>
						<Input
							onChange={(e: any) => { user.email = e.target.value }}
							value={user?.email}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.email}
							invalidFeedback={formik.errors.email}
							validFeedback='Looks good!'
                        />
					</FormGroup>
					<FormGroup id='mobile' label='Mobile number' onChange={formik.handleChange} className='col-md-6'>
						<Input
							onChange={(e: any) => { user.mobile = e.target.value }}
							value={user?.mobile}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.mobile}
							invalidFeedback={formik.errors.mobile}
							validFeedback='Looks good!'
                        />
					</FormGroup>
					<FormGroup id='NIC' label='NIC' onChange={formik.handleChange} className='col-md-6'>
						<Input
							onChange={(e: any) => { user.NIC = e.target.value }}
							value={user?.NIC}
                            onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.NIC}
							invalidFeedback={formik.errors.NIC}
							validFeedback='Looks good!'
                        />
					</FormGroup>
					<FormGroup id='pin_number' label='PIN number' onChange={formik.handleChange} className='col-md-6'>
						<Input
							onChange={(e: any) => { user.pin_number = e.target.value }}
							value={user?.pin_number}
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
					{selectedImage && <img src={selectedImage} className="mx-auto d-block mb-4" alt="Selected Profile Picture" style={{ width: '200px', height: '200px', }} />}
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
UserEditModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};
export default UserEditModal;
