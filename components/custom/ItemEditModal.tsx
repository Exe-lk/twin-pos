import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, {ModalBody,ModalFooter,ModalHeader,ModalTitle,
} from '../bootstrap/Modal';
import showNotification from '../extras/showNotification';
import Icon from '../icon/Icon';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firestore, storage } from '../../firebaseConfig';
import Swal from 'sweetalert2';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import Select from '../bootstrap/forms/Select';
import Option, { Options } from '../bootstrap/Option';

// Define the props for the ItemEditModal component
interface ItemEditModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}
interface Item {
	cid: string;
	image: string;
	name: string;
	price: number;
	quentity: number;
	category: string;
	reorderlevel: number;
	discount:number
}
interface Category {
	categoryname: string
}
// ItemEditModal component definition
const ItemEditModal: FC<ItemEditModalProps> = ({ id, isOpen, setIsOpen }) => {
	const data: Item = {
		cid: "",
		image: "",
		name: "",
		price: 0,
		category: "",
		quentity: 0,
		reorderlevel: 0,
		discount:0
    }
	const [item, setItem] = useState<Item>(data);
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
   //fetch data from database
	useEffect(() => {
		const fetchData = async () => {
			try {
                const dataCollection = collection(firestore, 'item');
				const q = query(dataCollection, where('__name__', '==', id));
				const querySnapshot = await getDocs(q);
				const firebaseData: any = querySnapshot.docs.map((doc) => {
					const data = doc.data() as Item;
					return {
						...data,
						cid: doc.id,
					};
				});
				await setItem(firebaseData[0])
				await setSelectedImage(firebaseData[0].image)
                await console.log('Firebase Data:', item);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
        fetchData();
	}, [id]);
    const handleUploadimage = async () => {
       if (imageurl) {
			// Assuming generatePDF returns a Promise
			const pdfFile = imageurl;
			console.log(imageurl)
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
			return item.image
		}
	}
    // Initialize formik for form management
	const formik = useFormik({
        initialValues: {
			cid: "",
			image: "",
			name: "",
			price: 0,
			quentity: 0,
			reorderlevel: 0,
			category: "",
			discount:0
		},
		validate: (values) => {
			const errors: {
				cid?: string;
				image?: string;
				name?: string;
				price?: string;
				quentity?: string;
				reorderlevel?: string;
				category?: string
            } = {};
            if (!item.name) {
				errors.name = 'Required';
			}
            if (!item.price) {
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
				let data: any = item
				const imgurl: any = await handleUploadimage()
				data.image = imgurl || "";
                const docRef = doc(firestore, "item", id);
				// Update the data
				updateDoc(docRef, data).then(() => {
                    setIsOpen(false);
					showNotification(
						<span className='d-flex align-items-center'>
							<Icon icon='Info' size='lg' className='me-1' />
							<span>Successfully Update</span>
						</span>,
						'Item has been update successfully',
					);
					Swal.fire('Added!', 'Item has been update successfully.', 'success');
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
				<ModalTitle id="">{'Edit Stock'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='name' label='Name' onChange={formik.handleChange} className='col-md-6'>
						<Input
                            value={item.name}
							onChange={(e: any) => { item.name = e.target.value }}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.name}
							invalidFeedback={formik.errors.name}
							validFeedback='Looks good!'
                        />
					</FormGroup>
                    <FormGroup id='price' label='Price' onChange={formik.handleChange} className='col-md-6'>
						<Input
							type="number"
							onChange={(e: any) => { item.price = e.target.value }}
							value={item.price}
                            onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.price}
							invalidFeedback={formik.errors.price}
							validFeedback='Looks good!'
						/>
					</FormGroup>
                    <FormGroup id='discount' label='Discount (%)' onChange={formik.handleChange} className='col-md-6'>
					<Input
							type='number'
                            value={item.discount}
							onChange={(e: any) => { item.discount = e.target.value }}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.discount}
							invalidFeedback={formik.errors.discount}
							validFeedback='Looks good!'
                        />
                    </FormGroup>
					<FormGroup id='quentity' label='quantity' onChange={formik.handleChange} className='col-md-6'>
						<Input
							type='number'
                            value={item.quentity}
							onChange={(e: any) => { item.quentity = e.target.value }}
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
ItemEditModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};
export default ItemEditModal;
