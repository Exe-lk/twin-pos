import React, { useEffect, useRef, useState } from 'react';
import Button from './bootstrap/Button';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import Card, { CardActions, CardBody, CardHeader, CardLabel, CardTitle } from './bootstrap/Card';
import classNames from 'classnames';
import useDarkMode from '../hooks/useDarkMode';
import { getFirstLetter, priceFormat } from '../helpers/helpers';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import Input from './bootstrap/forms/Input';
import { isatty } from 'tty';

// Define TypeScript interfaces for Category and Item
interface Category {
	cid: string;
	categoryname: string;
}

interface Item {
	cid: string;
	category: string;
	image: string;
	name: string;
	price: number;
	quentity: number;
	reorderlevel: number;
}

// Define props for the Keyboard component
interface KeyboardProps {
	orderedItems: Item[];
	setOrderedItems: React.Dispatch<React.SetStateAction<Item[]>>;
	isActive: boolean;
	setActiveComponent: React.Dispatch<React.SetStateAction<'additem' | 'edit'>>;

}

const Index: React.FC<KeyboardProps> = ({
	orderedItems,
	setOrderedItems,
	isActive,
	setActiveComponent,
	
}) => {
	// Custom hook to manage dark mode
	const { darkModeStatus } = useDarkMode();

	// State variables
	const [category1, setCategory1] = useState<string>('');
	const [category, setCategory] = useState<Category[]>([]);
	const [items, setItems] = useState<Item[]>([]);
	const [input, setInput] = useState<string>('');
	const keyboard = useRef<any>(null);
	const [showPopup, setShowPopup] = useState<boolean>(false);
	const [popupInput, setPopupInput] = useState<any>("");
	const [selectedItem, setSelectedItem] = useState<Item | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const popupInputRef = useRef<HTMLInputElement>(null);

	const [layout, setLayout] = useState<string>('default');
	const [focusedIndex, setFocusedIndex] = useState<number>(0);

	// Fetch categories from Firestore on component mount
	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'category');
				const querySnapshot = await getDocs(dataCollection);
				const firebaseData = querySnapshot.docs.map((doc) => {
					const data = doc.data() as Category;
					return {
						...data,
						cid: doc.id,
					};
				});
				setCategory(firebaseData);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, []);

	// Fetch items from Firestore on component mount
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

	// Handle input change
	const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		const input = event.target.value;
		const numericInput = input.replace(/\D/g, '');
		setInput(numericInput);
		if (keyboard.current) {
			keyboard.current.setInput(numericInput);
		}
	};

	// Handle virtual keyboard input change
	const onChange = (input: string) => {
		const numericInput = input.replace(/\D/g, '');
		if (showPopup) {
			//   setPopupInput(numericInput);
		} else {
			setInput(numericInput);
		}
		console.log('Input changed', numericInput);
	};

	// Handle key press events on virtual keyboard
	const onKeyPress = (button: string) => {
		console.log('Button pressed', button);
		if (button === '{shift}' || button === '{lock}') handleShift();
	};

	// Toggle between default and shift layouts on virtual keyboard
	const handleShift = () => {
		const newLayoutName = layout === 'default' ? 'shift' : 'default';
		setLayout(newLayoutName);
	};

	// Handle OK button click in the popup
	const handlePopupOk = async () => {
		if(popupInput<=0){
			return
		}
		if (selectedItem) {
			console.log(popupInput);
			const updatedItem = { ...selectedItem, quentity: Number(popupInput) };
			console.log(updatedItem);
			await setOrderedItems((prevItems: any) => {
				const itemIndex = prevItems.findIndex((item: any) => item.cid === updatedItem.cid);
				if (itemIndex > -1) {
					const updatedItems = [...prevItems];
					updatedItems[itemIndex] = updatedItem;
					return updatedItems;
				} else {
					return [...prevItems, updatedItem];
				}
			});
			setPopupInput("");
			console.log('Selected item data:', orderedItems);
		}
		setShowPopup(false);
		setFocusedIndex(-1);
	};

	// Handle Cancel button click in the popup
	const handlePopupCancel = () => {
		setShowPopup(false);
	};

	// Open the popup to enter quantity
	const handlePopupOpen = async (selectedIndex1: any) => {
		setSelectedItem(items[selectedIndex1] || null);
		setShowPopup(true);
	};

	// Handle input change in the popup
	const onChangePopupInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const input: any = event.target.value;

		await setPopupInput(input);
		await console.log(popupInput);
	};

	// Handle keyboard events for navigation and actions
	const handleKeyPress = async (event: KeyboardEvent) => {
		if (!isActive) return;
		if (event.key === 'ArrowDown') {
			setFocusedIndex((prevIndex) => (prevIndex + 1) % items.length);
		} else if (event.key === 'ArrowUp') {
			setFocusedIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			if (showPopup) {
				const button = document.querySelector('.btn.btn-success') as HTMLButtonElement;
				if (button) {
					button.click();
				}
			} else if(focusedIndex>=0){
				handlePopupOpen(focusedIndex);
			}
		} else if (event.key === 'ArrowLeft') {
			setActiveComponent('additem');
			setFocusedIndex(0);
		} else if (event.key === 'ArrowRight') {
			setActiveComponent('edit');
			setFocusedIndex(-1);
		}
	};

	// Add event listener for keyboard events
	useEffect(() => {
		window.addEventListener('keydown', handleKeyPress);

		return () => {
			window.removeEventListener('keydown', handleKeyPress);
		};
	}, [items, focusedIndex, showPopup, isActive]);

	// Focus input in the popup when it is shown
	useEffect(() => {
		if (showPopup) {
			popupInputRef.current?.focus();
		}
	}, [showPopup]);

	return (
		<div>
			<div>
				<Button
					className='btn btn-outline-warning'
					onClick={() => {
						setCategory1('');
					}}>
					All
				</Button>
				{category.map((category, index) => (
					<Button
						key={index}
						className='btn btn-outline-warning'
						onClick={() => {
							setCategory1(category.categoryname);
						}}>
						{category.categoryname}
					</Button>
				))}
			</div>
			<div>
				<Card className='mt-4' style={{ height: '40vh' }}>
					<CardHeader>
						<CardLabel>
							<CardTitle>Item</CardTitle>
						</CardLabel>
						<CardActions>
							<Button color='info' isLink icon='Summarize' tag='a'>
								View
							</Button>
						</CardActions>
					</CardHeader>
					<CardBody isScrollable>
						<div className='row g-3'>
							{items
								.filter((val) => {
									if (input === '') {
										if (category1 === '') {
											return val;
										} else if (category1.includes(val.category)) {
											return val;
										}
									} else if (val.cid.includes(input)) {
										if (category1 === '') {
											return val;
										} else if (category1.includes(val.category)) {
											return val;
										}
									}
									return null;
								})
								.map((item: Item, index: any) => (
									<div
										key={index}
										className={classNames('col-12 ', {
											'bg-info': index === focusedIndex,
										})}
										onClick={async () => {
											handlePopupOpen(index);
										}}>
										<div className='row p-1'>
											<div className='col d-flex align-items-center'>
												<div className='flex-shrink-0'>
													<div
														className='ratio ratio-1x1 me-3'
														style={{ width: 48 }}>
														<div
															className={classNames(
																'rounded-2',
																'd-flex align-items-center justify-content-center',
																{
																	'bg-l10-dark': !darkModeStatus,
																	'bg-l90-dark': darkModeStatus,
																},
															)}>
															<span className='fw-bold'>
																{getFirstLetter(item.name)}
															</span>
														</div>
													</div>
												</div>
												<div className='flex-grow-1'>
													<div className='fs-6'>{item.name}</div>
													<div className='text-muted'>
														<small>{item.category}</small>
													</div>
												</div>
											</div>
											<div className='col-auto text-end'>
												<div>
													<strong>{priceFormat(item.price)}</strong>
												</div>
												<div className='text-muted'>
													<small>{item.cid}</small>
												</div>
											</div>
										</div>
									</div>
								))}
						</div>
					</CardBody>
				</Card>
				<div>
					<Input
						id='keyboardinput'
						className='form-control mb-4 p-2'
						value={input}
						placeholder='Tap on the virtual keyboard to start'
						onChange={onChangeInput}
						ref={inputRef}
					/>
					<Keyboard
						className='keyboard w-100 bg-dark text-light'
						keyboardRef={(r) => (keyboard.current = r)}
						layoutName={layout}
						onChange={onChange}
						onKeyPress={onKeyPress}
						layout={{
							default: ['1 2 3', '4 5 6', '7 8 9', '0 {bksp}'],
						}}
					/>
					<style>
						{`
            .hg-button {
                background-color: #1F2128 !important;
                color: #fff !important;
                border: 1px solid #555 !important;
                 
            }

            .hg-button:hover {
                background-color: #555 !important;
            }

            .hg-button:active {
                background-color: #666 !important;
            }
            .simple-keyboard {
                  background-color: #343a40;
                 
            }

            .simple-keyboard .hg-button {
                  background-color: #495057;
                  color: #ffffff;
                  height:6vh
            }

            .simple-keyboard .hg-button:active,
            .simple-keyboard .hg-button:hover {
                      background-color: #6c757d;
            }
            `}
					</style>
				</div>
			</div>
			{showPopup && (
				<div
				className='position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-black bg-opacity-50'
				style={{ zIndex: 1050 }}>
				<div
					className={classNames('p-4 rounded-4', {
						'bg-l10-dark': !darkModeStatus,
						'bg-dark': darkModeStatus,
					})}
					style={{ zIndex: 1051, width: 600 }}>
						<h4 className='mb-4'>Enter a Quantity</h4>
						<Input
							type='number'
							value={popupInput}
							onChange={(e: any) => {
								setPopupInput(e.target.value);
							}}
							min={1}
							className='form-control mb-4 p-2'
							ref={popupInputRef}
						/>

						<div className='d-flex justify-content-end' >
							<button onClick={handlePopupCancel} className='btn btn-danger me-2'>
								Cancel
							</button>
							<button className='btn btn-success' onClick={handlePopupOk}>
								OK
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Index;
