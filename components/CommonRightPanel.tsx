import React, { FC, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import OffCanvas, { OffCanvasBody } from './bootstrap/OffCanvas';
import Dropdown, {
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from './bootstrap/Dropdown';
import Button from './bootstrap/Button';
import useDarkMode from '../hooks/useDarkMode';
import Swal from 'sweetalert2';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

interface IUserAppointment {
	[key: string]: 'Approved' | 'Pending' | 'Canceled';
}
interface ICommonRightPanel {
	setOpen(...args: unknown[]): unknown;
	isOpen: boolean;
	orderedItems: any;
	id:number
}
interface Company {
	cid: string;
	image: string;
	company_name: string;
	phone: string;
	tax: number;
	address: string;
	email:string

}

const CommonRightPanel: FC<ICommonRightPanel> = ({ setOpen, isOpen, orderedItems,id }) => {
	const { themeStatus, darkModeStatus } = useDarkMode();
	const [company, setCompany] = useState<Company>();
	const USER_APPOINTMENT: IUserAppointment = {
		APPROVED: 'Approved',
		PENDING: 'Pending',
		CANCELED: 'Canceled',
	};
	const [activeUserAppointmentTab, setActiveUserAppointmentTab] = useState<
		IUserAppointment['key']
	>(USER_APPOINTMENT.APPROVED);
	const handleActiveUserAppointmentTab = (tabName: IUserAppointment['key']) => {
		setActiveUserAppointmentTab(tabName);
	};
	const currentDate = new Date().toLocaleDateString('en-CA');
	const currentTime = new Date().toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
	});
	
	// Ref for printable content
	const printRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'company');
				const q = query(dataCollection, where('__name__', '==', "001"));
				const querySnapshot = await getDocs(q);
				const firebaseData: any = querySnapshot.docs.map((doc) => {
					const data = doc.data() as Company;
					return {
						...data,
						cid: doc.id,
					};
				});
			
				await setCompany(firebaseData[0])
				
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, []);
	
	// Function to handle print
	const handlePrint = () => {
		const content = printRef.current;
		const originalContents = document.body.innerHTML;
		if (content) {
			// Set the body content to the content of the print area
			document.body.innerHTML = content.outerHTML;
			window.print();
			// Revert the body content after printing
			document.body.innerHTML = originalContents;
		}
	};

	return (
		<OffCanvas setOpen={setOpen} isOpen={isOpen} isRightPanel>
			<OffCanvasBody className='p-4'>
				<div className='row mb-5'>
					<div className='col'>
						<div className='d-flex align-items-center'>
							<div className='h5 mb-0 text-muted'>
								<strong>Bill</strong>
							</div>
						</div>
					</div>
					<div className='col-auto'>
						<Dropdown>
							<DropdownToggle hasIcon={false}>
								<Button
									icon='MoreHoriz'
									color={themeStatus}
									hoverShadow='default'
									isLight={darkModeStatus}
								/>
							</DropdownToggle>
							<DropdownMenu isAlignmentEnd>
								<DropdownItem>
									<Button
										color='link'
										icon='Close'
										onClick={() => {
											setOpen(false);
										}}>
										Close
									</Button>
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				</div>
				<div>
					<div className='d-flex justify-content-end mb-3'>
						{/* Print button */}
						<Button className='btn btn-success w-100' onClick={handlePrint}>
							Print
						</Button>
					</div>
					
					{/* This is the printable content */}
					<div
						ref={printRef} // Attach the ref here
						style={{ fontSize: '12px', backgroundColor: 'white', color: 'black' }}
						className='p-3'>
						<center>
							<img src={company?.image} style={{ height: 50, width: 100 }} alt="" />
							<h6>{company?.company_name}</h6>
							<p>
								{company?.address}
								<br />
								{company?.phone}
							</p>
						</center>
						<p>
							{currentDate}&emsp;&emsp;&emsp;{currentTime}
						</p>
						<hr />
						
						<div className='row'>
							<div className='col-sm-3 mb-3 mb-sm-0'>ITEM</div>
							<div className='col-sm-3'>QTY</div>
							<div className='col-sm-3'>PRICE</div>
							<div className='col-sm-3'>AMOUNT</div>
						</div>
						<hr />

						{orderedItems.map(({ name, quentity, price }: any, index: any) => (
							<div className='row' key={index}>
								<div className='col-sm-3 mb-3 mb-sm-0'>{name}</div>
								<div className='col-sm-3'>{quentity}</div>
								<div className='col-sm-3'>{price}.00</div>
								<div className='col-sm-3'>{quentity * price}.00</div>
							</div>
						))}

						<hr />
						<div className='d-flex justify-content-between'>
							<div>
								<strong>Net Total</strong>
							</div>
							<div>
								<strong>
									LKR:{' '}
									{orderedItems.reduce(
										(total: any, item: any) =>
											total + item.quentity * item.price,
										0,
									)}
									.00
								</strong>
							</div>
						</div>
						<hr />
						<br />
						<center style={{ fontSize: '11px' }}>
							Please call our hotline {company?.phone}
							<br />
							for your valued suggestions and comments.
						</center>
					</div>
				</div>
			</OffCanvasBody>
		</OffCanvas>
	);
};

CommonRightPanel.propTypes = {
	setOpen: PropTypes.func.isRequired,
	isOpen: PropTypes.bool.isRequired,
};

export default CommonRightPanel;
