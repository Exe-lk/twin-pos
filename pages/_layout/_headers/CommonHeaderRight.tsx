import React, { FC, ReactNode, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'next-i18next';
import classNames from 'classnames';
import { useTour } from '@reactour/tour';
import { useRouter } from 'next/router';
import Button, { IButtonProps } from '../../../components/bootstrap/Button';
import { HeaderRight } from '../../../layout/Header/Header';
import OffCanvas, {
	OffCanvasBody,
	OffCanvasHeader,
	OffCanvasTitle,
} from '../../../components/bootstrap/OffCanvas';
import Alert from '../../../components/bootstrap/Alert';
import Dropdown, {
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from '../../../components/bootstrap/Dropdown';
import Icon from '../../../components/icon/Icon';
import ThemeContext from '../../../context/themeContext';
import LANG, { getLangWithKey, ILang } from '../../../lang';
import showNotification from '../../../components/extras/showNotification';
import useDarkMode from '../../../hooks/useDarkMode';
import Popovers from '../../../components/bootstrap/Popovers';
import Spinner from '../../../components/bootstrap/Spinner';
import useMounted from '../../../hooks/useMounted';
import Avatar from '../../../components/Avatar';
import UserImage2 from '../../../assets/img/wanna/wanna1.png';

import axios from 'axios';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';

interface ICommonHeaderRightProps {
	beforeChildren?: ReactNode;
	afterChildren?: ReactNode;
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
const CommonHeaderRight: FC<ICommonHeaderRightProps> = ({ beforeChildren, afterChildren }) => {
	const router = useRouter();
	const { darkModeStatus, setDarkModeStatus } = useDarkMode();
	const { fullScreenStatus, setFullScreenStatus } = useContext(ThemeContext);
	const [user, setUser] = useState<any>();
	const styledBtn: IButtonProps = {
		color: darkModeStatus ? 'dark' : 'light',
		hoverShadow: 'default',
		isLight: !darkModeStatus,
		size: 'lg',
	};
	const [offcanvasStatus, setOffcanvasStatus] = useState(false);

	const [orderData, setOrdersData] = useState([]);
	const [item, setItem] = useState<Item[]>([]);
	const [stockData, setStockData] = useState([]);
	const [quantityDifference, setQuantityDifference] = useState([]);
	

	//get stock count
	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'stock');
				const q = query(dataCollection, where('active', '==', true));
				const querySnapshot = await getDocs(q);
				const firebaseData = querySnapshot.docs.map((doc) => {
					const data = doc.data();
					return {
						...data,
						cid: doc.id,
					};
				});

				// Create a dictionary to group by item_id and sum quantities
				const stockDictionary: any = {};

				firebaseData.forEach((item: any) => {
					if (stockDictionary[item.item_id]) {
						stockDictionary[item.item_id] += item.quentity;
					} else {
						stockDictionary[item.item_id] = item.quentity;
					}
				});

				// Convert dictionary to array of objects
				const filteredData: any = Object.keys(stockDictionary).map((item_id) => ({
					item_id,
					quantity: stockDictionary[item_id],
				}));

				console.log(filteredData);
				setStockData(filteredData);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, []);

	//grt sells quentity 
	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'orders');
				const querySnapshot = await getDocs(dataCollection);
				const firebaseData = querySnapshot.docs.map((doc) => {
					const data = doc.data();
					return {
						...data,
						cid: doc.id,
					};
				});

				// Create a dictionary to group by name and sum quantities
				const ordersDictionary: any = {};

				firebaseData.forEach((order: any) => {
					order.orders.forEach((item: any) => {
						if (ordersDictionary[item.name]) {
							ordersDictionary[item.name] += item.quentity;
						} else {
							ordersDictionary[item.name] = item.quentity;
						}
					});
				});

				// Convert dictionary to array of objects
				const filteredData: any = Object.keys(ordersDictionary).map((name) => ({
					name,
					quantity: ordersDictionary[name],
				}));

				console.log(filteredData);
				setOrdersData(filteredData);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		const calculateQuantityDifference = () => {
			const differenceArray: any = [];

			stockData.forEach((stockItem: any) => {
				const orderItem: any = orderData.find(
					(order: any) => order.name === stockItem.item_id,
				);
				if (orderItem) {
					const difference = stockItem.quantity - orderItem.quantity;
					differenceArray.push({
						item_id: stockItem.item_id,
						quantity_difference: difference,
					});
				}
			});
			console.log(differenceArray);
			setQuantityDifference(differenceArray);
		};

		if (stockData.length > 0 && orderData.length > 0) {
			calculateQuantityDifference();
		}
	}, [stockData, orderData]);
	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'item');
				const q = query(dataCollection, where('status', '==', true));
				const querySnapshot = await getDocs(q);
				const firebaseData: any = querySnapshot.docs.map((doc) => {
					const data = doc.data();
					return {
						...data,
						cid: doc.id,
					};
				});
				const tempId = parseInt(firebaseData[firebaseData.length - 1].cid) + 1;

				setItem(firebaseData);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, []);

	return (
		<HeaderRight>
			<div className='row g-3'>
				{beforeChildren}

				{/* Dark Mode */}
				<div className='col-auto mt-4'>
					<Popovers trigger='hover' desc='Dark / Light mode'>
						<Button
							// eslint-disable-next-line react/jsx-props-no-spreading
							{...styledBtn}
							onClick={() => setDarkModeStatus(!darkModeStatus)}
							className='btn-only-icon'
							data-tour='dark-mode'>
							<Icon
								icon={darkModeStatus ? 'DarkMode' : 'LightMode'}
								color={darkModeStatus ? 'info' : 'warning'}
								className='btn-icon'
							/>
						</Button>
					</Popovers>
				</div>

				{/*	Full Screen */}
				<div className='col-auto mt-4'>
					<Popovers trigger='hover' desc='Fullscreen'>
						<Button
							// eslint-disable-next-line react/jsx-props-no-spreading
							{...styledBtn}
							icon={fullScreenStatus ? 'FullscreenExit' : 'Fullscreen'}
							onClick={() => setFullScreenStatus(!fullScreenStatus)}
							aria-label='Toggle dark mode'
						/>
					</Popovers>
				</div>
				<div className='col-auto mt-4'>
					<Button
						{...styledBtn}
						icon='Notifications'
						onClick={() => setOffcanvasStatus(true)}
						aria-label='Notifications'
					/>
				</div>
				<div className='col-auto'>
					<Button aria-label='Toggle dark mode' >
						<div className='col d-flex align-items-center'>
							{user?.imageurl ? (
								<img
									src={user.imageurl}
									className='me-3'
									alt={user.name}
									style={{ width: '50px', height: '50px', borderRadius: '50%' }}
								/>
							) : (
								<div className='me-3'>
									<Avatar src={UserImage2} size={48} color='primary' />
								</div>
							)}
							<div>
								<div className='fw-bold fs-6 mb-0'>{user?.name}</div>
								<div className='text-muted'>
									<small>{user?.role}</small>
								</div>
							</div>
						</div>
					</Button>
				</div>

				{afterChildren}
			</div>
			<OffCanvas
				id='notificationCanvas'
				titleId='offcanvasExampleLabel'
				placement='end'
				isOpen={offcanvasStatus}
				setOpen={setOffcanvasStatus}>
				<OffCanvasHeader setOpen={setOffcanvasStatus}>
					<OffCanvasTitle id='offcanvasExampleLabel'>Notifications</OffCanvasTitle>
				</OffCanvasHeader>
				<OffCanvasBody>
					{item.map((item, index) => (
						<>
							{quantityDifference.filter((val: any) => {
								if (val.quantity_difference < item.reorderlevel) {
									return val;
								}
							})
							.map((quentity: any, index) => (
								<Alert icon='Inventory2' isLight color='warning' className='flex-nowrap'>
						{item.name} stock quantity is less than {item.reorderlevel}. Manage your stock.
					</Alert>
							))}
						</>
					))}
					
				</OffCanvasBody>
			</OffCanvas>
		</HeaderRight>
	);
};
CommonHeaderRight.propTypes = {
	beforeChildren: PropTypes.node,
	afterChildren: PropTypes.node,
};
CommonHeaderRight.defaultProps = {
	beforeChildren: null,
	afterChildren: null,
};

export default CommonHeaderRight;
