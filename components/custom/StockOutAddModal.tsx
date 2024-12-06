import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, {ModalBody,ModalFooter,ModalHeader,ModalTitle,} from '../bootstrap/Modal';
import showNotification from '../extras/showNotification';
import { collection, addDoc, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import Icon from '../icon/Icon';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import { firestore, storage } from '../../firebaseConfig';
import Swal from 'sweetalert2';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';



// Define the props for the StockAddModal component
interface StockAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}
interface Stock {
	cid: string;
	quentity: string;
    item_id: string;
	currentquentity: string;
	stockHistory: { stockout: string; date: string }[];
}

// StockAddModal component definition
const StockAddModal: FC<StockAddModalProps> = ({ id, isOpen, setIsOpen }) => {
    
    const [stock, setStock] = useState<Stock>();
	//const [showLowStockNotification, setShowLowStockNotification] = useState(true); // State to track whether to show low stock notification
    //get data from database
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
						stockHistory: data.stockHistory || []
					};
				});
				await setStock(firebaseData[0])
				
                
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
        fetchData();
	}, [id]);
    // Initialize formik for form management
	const formik = useFormik({
        initialValues: {
			stockout: '',
            cid: '',
			date: new Date(), 
		},
		validate: (values) => {
			const errors: {
				stockout?: string;
			} = {};
			if (!values.stockout) {
				errors.stockout = 'Required';
			}
			return errors;
		},
		// Inside the onSubmit handler of StockAddModal component


		onSubmit: async (values) => {
			try {
				// Check if stock exists
				if (!stock) {
					throw new Error('Stock data not available.');
				}
		
				// Calculate new quantity by subtracting stockout value
				const newQuantity = parseInt(stock.quentity) - parseInt(values.stockout);
				 // Update the stock history array with new stock out value and date
				 const newStockHistory = [...stock.stockHistory, { stockout: values.stockout, date: values.date.toISOString() }];
                
		
				// Update the Firestore document with the new quantity
				await updateDoc(doc(firestore, 'stock', stock.cid), {
					quentity: newQuantity.toString(),
					stockHistory: newStockHistory,
				});
		
				// Show success notification
				showNotification('success', 'Stock updated successfully.');
		
				// Close the modal
				setIsOpen(false);
			} catch (error) {
				console.error('Error updating stock:', error);
				// Show error notification
				showNotification('error', 'Failed to update stock. Please try again later.');
			}
		},
		
		
		
});




	
    return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader setIsOpen={setIsOpen} className='p-4'>
				<ModalTitle id="">{'Stock Out'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='stockout' label='Stock out quantity' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.stockout}
                            onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.stockout}
							invalidFeedback={formik.errors.stockout}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='date' label='Date' className='col-md-6'>
                        <DatePicker
                            selected={formik.values.date}
                            onChange={(date) => formik.setFieldValue('date', date)}
                            dateFormat='yyyy-MM-dd'
                        />
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
StockAddModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};
export default StockAddModal;



