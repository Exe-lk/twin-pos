import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, {ModalBody,ModalFooter,ModalHeader,ModalTitle,} from '../bootstrap/Modal';
import showNotification from '../extras/showNotification';
import Icon from '../icon/Icon';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import { collection, addDoc } from 'firebase/firestore';
import { firestore, storage } from '../../firebaseConfig';
import Swal from 'sweetalert2';
import { NULL } from 'sass';

// Define the props for the CategoryEditModal component
interface CategoryEditModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}
// CategoryEditModal component definition
const CategoryEditModal: FC<CategoryEditModalProps> = ({ id, isOpen, setIsOpen }) => {
    // Initialize formik for form management
	const formik = useFormik({
        initialValues: {
			categoryname: '',
			status:true
		},
		validate: (values) => {
			const errors: {
				categoryname?: string;
			} = {};
			if (!values.categoryname) {
				errors.categoryname = 'Required';
			}
			return errors;
		},
		onSubmit: async (values) => {
			try {
				values.status=true
                const collectionRef = collection(firestore, 'category');
				addDoc(collectionRef, values).then(() => {
					
					showNotification(
						<span className='d-flex align-items-center'>
							<Icon icon='Info' size='lg' className='me-1' />
							<span>Successfully Added</span>
						</span>,
						'category has been added successfully',
					);
					Swal.fire('Added!', 'category has been add successfully.', 'success');
				
					setIsOpen(false);
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
				<ModalTitle id="">{'New Category'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='categoryname' label='Category name' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.categoryname}
                            onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.categoryname}
							invalidFeedback={formik.errors.categoryname}
							validFeedback='Looks good!'
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
CategoryEditModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};
export default CategoryEditModal;



