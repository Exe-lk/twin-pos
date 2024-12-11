import React, { useEffect, useState } from 'react';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import 'react-simple-keyboard/build/css/index.css';
import Swal from 'sweetalert2';
import Card, { CardBody, CardFooter } from '../../../components/bootstrap/Card';
import { Dropdown } from 'primereact/dropdown';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Checks, { ChecksGroup } from '../../../components/bootstrap/forms/Checks';
import { printReceipt } from '../../../helpers/print';

interface Category {
	id: number;
}
interface Item {
	cid: string;
	category: string;
	image: string;
	name: string;
	price: number;
	quentity: number;
	quantity: number;
	reorderlevel: number;
	discount: number;
}

function index() {
	const [toggleRightPanel, setToggleRightPanel] = useState(true);
	const [orderedItems, setOrderedItems] = useState<Item[]>([]);
	const [items, setItems] = useState<Item[]>([]);
	const [selectedProduct, setSelectedProduct] = useState<string>('');
	const [quantity, setQuantity] = useState<number>(1);
	const [payment, setPayment] = useState(true);
	const [amount, setAmount] = useState<number>(0);
	const [id, setId] = useState<number>(1530);
	const [casher, setCasher] = useState<any>({});
	const currentDate = new Date().toLocaleDateString('en-CA');
	const currentTime = new Date().toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
	});
	const [lines, setLines] = useState<string[]>([
		'Welcome to XYZ Store!',
		'Item A - $10.00',
		'Item B - $15.00',
		'-------------------',
		'Total - $25.00',
		'Thank you!',
	]);
	useEffect(() => {
		const cashier = localStorage.getItem('user');
		if (cashier) {
			const jsonObject = JSON.parse(cashier);
			console.log(jsonObject);
			setCasher(jsonObject);
		}
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'orders');
				const querySnapshot = await getDocs(dataCollection);
				const firebaseData = querySnapshot.docs
					.map((doc) => {
						const data = doc.data() as Category;
						return {
							...data,
						};
					})
					.sort((a, b) => b.id - a.id); // Sort by id in ascending order
				setId(firebaseData[0].id + 1 || 1500);
				console.log(firebaseData[0].id + 1);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};

		fetchData();
	}, []);
	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'item');
				const q = query(dataCollection, where('status', '==', true));
				const querySnapshot = await getDocs(q);
				const firebaseData = querySnapshot.docs.map((doc) => {
					const data = doc.data() as Item;
					return {
						...data,
						cid: doc.id,
					};
				});
				setItems(firebaseData);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, []);

	const handlePopupOk = async () => {
		if (!selectedProduct || quantity <= 0) {
			Swal.fire('Error', 'Please select a product and enter a valid quantity.', 'error');
			return;
		}

		// Find the selected item in the original items list
		const selectedItem = items.find((item) => item.cid === selectedProduct);
		if (selectedItem) {
			// Check if the item is already in the orderedItems array
			const existingItemIndex = orderedItems.findIndex(
				(item) => item.cid === selectedProduct,
			);

			let updatedItems;

			if (existingItemIndex !== -1) {
				// Item already exists; replace it with the new value
				updatedItems = [...orderedItems];
				updatedItems[existingItemIndex] = {
					...selectedItem,
					quantity,
				};
			} else {
				// Item doesn't exist; add it as a new entry
				updatedItems = [...orderedItems, { ...selectedItem, quantity }];
			}

			setOrderedItems(updatedItems);

			// Reset form fields
			setSelectedProduct('');
			setQuantity(1);

			Swal.fire('Success', 'Item added/replaced successfully.', 'success');
		} else {
			Swal.fire('Error', 'Selected item not found.', 'error');
		}
	};

	const handleDeleteItem = (cid: string) => {
		// Filter out the item with the matching cid
		const updatedItems = orderedItems.filter((item) => item.cid !== cid);
		setOrderedItems(updatedItems);

		Swal.fire('Success', 'Item removed successfully.', 'success');
	};
	const calculateTotal = () => {
		return orderedItems
			.reduce(
				(sum, val) =>
					sum +
					val.price * val.quantity -
					((val.price * val.quantity) / 100) * val.discount,
				0,
			)
			.toFixed(2);
	};

	const addbill = async () => { 
		if (amount >= Number(calculateTotal())) {
			try {
				const result = await Swal.fire({
					title: 'Are you sure?',
					text: 'You will not be able to recover this status!',
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: 'Yes, Print Bill!',
				});
	
				if (result.isConfirmed) {
					printReceipt(lines);
					const totalAmount = calculateTotal();
					const currentDate = new Date();
					const formattedDate = currentDate.toLocaleDateString();
	
					const values = {
						orders: orderedItems,
						time: currentTime,
						date: formattedDate,
						casheir: casher.email,
						amount: Number(totalAmount),
						type: payment ? 'cash' : 'card',
						id: id,
					};
	
					console.log(orderedItems);
	
					const collectionRef = collection(firestore, 'orders');
	
					// Save the order
					await addDoc(collectionRef, values);
	
					// Update the item quantities
					const updatePromises = orderedItems.map(async (order) => {
						const itemRef = doc(firestore, 'item', order.cid);
						const newQuantity = order.quentity - order.quantity; // Calculate new quantity
						await updateDoc(itemRef, {
							quentity: newQuantity > 0 ? newQuantity : 0, // Ensure quantity doesn't go below zero
						});
					});
	
					// Wait for all updates to complete
					await Promise.all(updatePromises);
	
					Swal.fire(
						'Added!',
						'Bill has been added successfully.',
						'success',
					);
					setOrderedItems([]);
					setAmount(0);
				}
			} catch (error) {
				console.error('Error during handleUpload: ', error);
				alert('An error occurred. Please try again later.');
			}
		} else {
			Swal.fire('Warning..!', 'Insufficient amount', 'error');
		}
	};
	
	return (
		<PageWrapper className=''>
			<div className='row m-4'>
				{/* First Card with two cards at the bottom occupying full width */}
				<div className='col-8 mb-3 mb-sm-0'>
					<Card stretch className='mt-4 ' style={{ height: '75vh' }}>
						<CardBody isScrollable>
							<table className='table table-hover table-bordered border-primary'>
								<thead className={'table-dark border-primary'}>
									<tr>
										<th>Product</th>
										<th>Qty</th>
										<th>U/Price(LKR)</th>
										<th>D/Amount(LKR)</th>
										<th>Net Value(LKR)</th>
										<th></th>
									</tr>
								</thead>
								<tbody>
									{orderedItems.map((val: any, index: any) => (
										<tr>
											<td>{val.name}</td>
											<td>{val.quantity}</td>
											<td>{val.price}</td>
											<td>
												{((val.price * val.quantity) / 100) * val.discount}
											</td>
											<td>
												{val.price * val.quantity -
													((val.price * val.quantity) / 100) *
														val.discount}
											</td>
											<td>
												<Button
													icon='delete'
													onClick={() =>
														handleDeleteItem(val.cid)
													}></Button>
											</td>
										</tr>
									))}
									<tr>
										<td colSpan={4} className='text fw-bold'>
											Total
										</td>
										<td className='fw-bold'>{calculateTotal()}</td>
										<td></td>
									</tr>
								</tbody>
							</table>
						</CardBody>
						<CardFooter className='pb-1'>
							{/* Two cards side by side occupying full width */}
							<div className='d-flex w-100'>
								<Card className='col-4 flex-grow-1 me-2'>
									<CardBody>
										<FormGroup
											id='product'
											label='Product Name'
											className='col-12'>
											<Dropdown
												aria-label='State'
												editable 
												placeholder='-- Select Product --'
												className='selectpicker col-12'
												options={
													items
														? items.map((type: any) => ({
																value: type.cid,
																label: type.name,
														  }))
														: [{ value: '', label: 'No Data' }]
												}
												onChange={(e: any) =>
													setSelectedProduct(e.target.value)
												}
												// onBlur={formik.handleBlur}
												value={selectedProduct}
												
											/>
											{/* <Select
												ariaLabel='Default select example'
												onChange={(e: any) =>
													setSelectedProduct(e.target.value)
												}
												value={selectedProduct}
												placeholder='Select Item'
												validFeedback='Looks good!'>
												{items.map((option, index) => (
													<Option key={index} value={option.cid}>
														{option.name}
													</Option>
												))}
											</Select> */}
										</FormGroup>
										<FormGroup
											id='quantity'
											label='Quantity'
											className='col-12 mt-2'>
											<Input
												type='number'
												onChange={(e: any) =>
													setQuantity(Number(e.target.value))
												}
												value={quantity}
												min={1}
												validFeedback='Looks good!'
											/>
										</FormGroup>
										<div className='d-flex justify-content-end mt-2'>
											{/* <button className='btn btn-danger me-2'>Cancel</button> */}
											<button
												className='btn btn-success'
												onClick={handlePopupOk}>
												ADD
											</button>
										</div>
									</CardBody>
								</Card>
								<Card className='flex-grow-1 ms-2'>
									<CardBody>
										<>
											<ChecksGroup isInline className='pt-2'>
												<Checks
													// type='switch'
													id='inlineCheckOne'
													label='Cash'
													name='checkOne'
													checked={payment}
													onClick={(e) => {
														setPayment(true);
													}}
												/>
												<Checks
													// type='switch'
													id='inlineCheckTwo'
													label='Card'
													name='checkOne'
													checked={!payment}
													onClick={(e) => {
														setPayment(false);
													}}
												/>
											</ChecksGroup>
											<FormGroup
												id='amount'
												label='Amount'
												className='col-12 mt-2'>
												<Input
													type='number'
													onChange={(e: any) => {
														let value = e.target.value;

														// Remove leading zero if it's the first character
														if (
															value.length > 1 &&
															value.startsWith('0')
														) {
															value = value.substring(1); // Remove the first character
														}

														setAmount(value); // Update the state with the modified value
													}}
													value={amount}
													min={0}
													validFeedback='Looks good!'
												/>
											</FormGroup>
										
											<Button
												color='success'
												className='mt-4 w-100'
												onClick={addbill}>
												Process
											</Button>
										</>
									</CardBody>
								</Card>
							</div>
						</CardFooter>
					</Card>
				</div>

				{/* Second Card */}
				<div className='col-4'>
					<Card stretch className='mt-4 p-4' style={{ height: '75vh' }}>
						<CardBody isScrollable>
							<div
								// ref={printRef} // Attach the ref here
								style={{
									width: '300px',
									fontSize: '12px',
									backgroundColor: 'white',
									color: 'black',
								}}
								className='p-3'>
								<center>
									<h6>TWIN CLOTHING</h6>
									<p>
										144/1. KATUWANA ROAD,
										<br />
										HOMAGAMA.
										<br />
										TEL : - 0112 - 894991
									</p>
								</center>
								<div className='d-flex justify-content-between align-items-center mt-4'>
									<div>
										<p className='mb-0'>CASHIER</p>
										<p className='mb-0'>UNIT NO: 2 &emsp;</p>
									</div>
									<div className='text-end'>
										<p className='mb-0'>START TIME:{currentTime}</p>
										<p className='mb-0'>INVOICE NO:{id}</p>
									</div>
								</div>

								<hr />
								<hr />
								<p>Product &emsp;Qty&emsp; U/Price&emsp; D/Amt&emsp; Net Value</p>

								<hr />

								{orderedItems.map(
									({ cid, name, quantity, price, discount }: any, index: any) => (
										<p>
											{index + 1}. {name}
											<br />
											{cid}&emsp;&emsp;&emsp;{quantity}&emsp;&emsp;{price}
											.00&emsp;&emsp; {((price * quantity) / 100) *
												discount}{' '}
											&emsp;
											{price * quantity -
												((price * quantity) / 100) * discount}
										</p>
									),
								)}

								<hr />
								<div className='d-flex justify-content-between'>
									<div>
										<strong>SUB Total</strong>
									</div>
									<div>
										<strong>{calculateTotal()}</strong>
									</div>
								</div>
								<hr />
								<div className='d-flex justify-content-between'>
									<div>Cash Received</div>
									<div>{amount}.00</div>
								</div>
								<div className='d-flex justify-content-between'>
									<div>Balance</div>
									<div>{amount - Number(calculateTotal())}</div>
								</div>
								<div className='d-flex justify-content-between'>
									<div>No.Of Pieces</div>
									<div>{orderedItems.length}</div>
								</div>
								<div className='d-flex justify-content-between'>
									<div>DATE : {currentDate}</div>
								</div>
								<hr />
								<center>THANK YOU COME AGAIN</center>
								<hr />

								<center style={{ fontSize: '11px' }}>
									Please call our hotline
									<br />
									for your valued suggestions and comments.
								</center>
							</div>
						</CardBody>
					</Card>
				</div>
			</div>

			{/* <CommonRightPanel
				setOpen={setToggleRightPanel}
				isOpen={toggleRightPanel}
				orderedItems={orderedItems}
			/> */}
		</PageWrapper>
	);
}

export default index;
