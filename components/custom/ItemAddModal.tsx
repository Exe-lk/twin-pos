import React, { FC, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, {ModalBody,ModalFooter,ModalHeader,ModalTitle,} from '../bootstrap/Modal';
import showNotification from '../extras/showNotification';
import Icon from '../icon/Icon';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import { collection, addDoc, doc, setDoc, getDocs } from 'firebase/firestore';
import { firestore, storage } from '../../firebaseConfig';
import Swal from 'sweetalert2';
import Select from '../bootstrap/forms/Select';
import Option, { Options } from '../bootstrap/Option';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

// Define the props for the ItemAddModal component
interface ItemAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}
interface Category {
	categoryname: string
}
// ItemAddModal component definition
const ItemAddModal: FC<ItemAddModalProps> = ({ id, isOpen, setIsOpen }) => {
    const [imageurl, setImageurl] = useState<any>(null);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [category, setCategory] = useState<Category[]>([]);
    //get data from database
	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'category');
				const querySnapshot = await getDocs(dataCollection);
				const firebaseData = querySnapshot.docs.map((doc) => {
					const data = doc.data() as Category;
					return {
						...data,
                    };
				});
                setCategory(firebaseData);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
        fetchData();
	}, []);
   //image upload 
	const handleUploadimage = async () => {
        if (imageurl) {
			// Assuming generatePDF returns a Promise
			const pdfFile = imageurl;
            const storageRef = ref(storage, `item/${pdfFile.name}`);
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
								resolve(url); // Resolve the Promise with the URL
							})
							.catch((error) => {
								console.error(error.message);
								reject(error.message);
							});
				    }
				);
			});
		} else {
			return ""
		}
	}
	const divRef: any = useRef(null);
    // Initialize formik for form management
	const formik = useFormik({
        initialValues: {
            category: '',
			image: "",
			name: '',
			price: '',
			quentity: 0,
			discount:0,
			reorderlevel: '',
			status:true
        },
		validate: (values) => {
			const errors: {
				category?: string;
				image?: string;
				name?: string;
				price?: string;
				quentity?: string;
				reorderlevel?: string;
			} = {};
           
            if (!values.name) {
				errors.name = 'Required';
			}
			if (!values.price) {
				errors.price = 'Required';
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
				const imgurl: any = await handleUploadimage()
				values.image = imgurl || "";
				values.status=true
                const documentId = '11005';
				const collectionRef = doc(firestore, 'item', id);
				setDoc(collectionRef, values).then(() => {
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
					Swal.close
					alert('An error occurred while adding the document. Please try again later.');
				});
			} catch (error) {
				console.error('Error during handleUpload: ', error);
				Swal.close
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
                    <FormGroup id='price' label='Price' className='col-md-6'>
						<Input
							type="number"
							onChange={formik.handleChange}
							value={formik.values.price}
                            onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.price}
							invalidFeedback={formik.errors.price}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='discount' label='Discount (%)' className='col-md-6'>
						<Input
							type="number"
							onChange={formik.handleChange}
							value={formik.values.discount}
                            onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.discount}
							invalidFeedback={formik.errors.discount}
							validFeedback='Looks good!'
						/>
					</FormGroup>
                    {/* <FormGroup id='category' label='Category' className='col-md-6'>
                       <Select
							ariaLabel='Default select example'
							placeholder='Open this select category'
							onChange={formik.handleChange}
							value={formik.values.category}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.category}
							invalidFeedback={formik.errors.category}
							validFeedback='Looks good!'>
							{
								category.map((item, index) => (
                                    <Option value={item.categoryname}>{item.categoryname}</Option>
								))
							}
						</Select>
					</FormGroup> */}
					<FormGroup id='quentity' label='Quantity' className='col-md-6'>
						<Input
							type='number'
							onChange={formik.handleChange}
							value={formik.values.quentity}
                            onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.quentity}
							invalidFeedback={formik.errors.quentity}
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
					{/* Barcode component */}
					<div ref={divRef}>
						{/* <Barcode value={formik.values.barcode} /> */}
					</div>
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
// Prop types definition for ItemAddModal component
ItemAddModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};
export default ItemAddModal;
