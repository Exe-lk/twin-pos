import React, { useEffect, useState } from 'react';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardTitle,
} from './bootstrap/Card';
import classNames from 'classnames';
import useDarkMode from '../hooks/useDarkMode';
import { getFirstLetter, priceFormat } from '../helpers/helpers';
import Input from './bootstrap/forms/Input';
import Dropdown, {
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from './bootstrap/Dropdown';
import Button from './bootstrap/Button';
import { or } from 'firebase/firestore';
interface Item {
	cid: string;
	category: string;
	image: string;
	name: string;
	price: number;
	quentity: number;
	reorderlevel: number;
}
interface KeyboardProps {
    orderedItems: Item[];
    setOrderedItems: React.Dispatch<React.SetStateAction<Item[]>>;
    isActive: boolean;
    setActiveComponent: React.Dispatch<React.SetStateAction<'additem' | 'edit'>>;
}

const Index: React.FC<KeyboardProps>  = ({ orderedItems, setOrderedItems, isActive,setActiveComponent }: any) => {
	const { themeStatus } = useDarkMode();
	const { darkModeStatus } = useDarkMode();
    const [focusedIndex, setFocusedIndex] = useState<number>(0);
	const handleDelete = (index: number) => {
		setOrderedItems((prevItems: any) =>
			prevItems.filter((item: any, i: number) => i !== index),
		);
	};
	const handleQuantityChange = (index: number, newQuantity: number) => {
		setOrderedItems((prevItems: any) =>
			prevItems.map((item: any, i: number) =>
				i === index ? { ...item, quentity: newQuantity } : item,
			),
		);
	};
    const handleKeyPress = (event: KeyboardEvent) => {
        if (!isActive) return;
      
        if (event.key === 'ArrowDown') {
          setFocusedIndex((prevIndex) => (prevIndex + 1) % orderedItems.length);
        } else if (event.key === 'ArrowUp') {
          setFocusedIndex((prevIndex) => (prevIndex - 1 + orderedItems.length) % orderedItems.length);
        } else if (event.key === 'ArrowLeft') {
          setActiveComponent('additem');
          setFocusedIndex(-1);
        } else if (event.key === 'ArrowRight') {
          setActiveComponent('edit');
          setFocusedIndex(0);
        }else if (event.key.toLowerCase() === 'd') {
            handleDelete(focusedIndex)
          }
      };
    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [orderedItems, focusedIndex,isActive]);
	return (
		<div>
			<Card className='mt-4' style={{ height: '75vh' }}>
				<CardHeader borderSize={1}>
					<CardLabel icon='AssignmentTurnedIn' iconColor='danger'>
						<CardTitle tag='h4' className='h5'>
							Order Items
						</CardTitle>
					</CardLabel>
				</CardHeader>
				<CardBody isScrollable className='table-responsive'>
					{orderedItems.map((order: Item, index: any) => (
						<Card  key={index}
                        className={classNames('col-12 p-3', {
                            'bg-info': index === focusedIndex,
                        })}>
							<div className={classNames('todo-item')}>
								<div className='col d-flex align-items-center'>
									{order.image ? (
										<div className='flex-shrink-0'>
											<div
												className='ratio ratio-1x1 me-3'
												style={{ width: 48 }}>
												<img src={order.image}></img>
											</div>
										</div>
									) : (
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
														{getFirstLetter(order.name)}
													</span>
												</div>
											</div>
										</div>
									)}

									<div className='flex-grow-1'>
										<div className='fs-6'>{order.name}</div>
										<div className='text-muted'>
											<small>{order.category}</small>
										</div>
									</div>
									<div className='me-2'>
										<Input
											type='number'
											value={order.quentity}
											onChange={(e: any) =>
												handleQuantityChange(
													index,
													parseInt(e.target.value),
												)
											}
											className='form-control '
										/>
									</div>
									<div className='me-2'>
										<strong>{priceFormat(order.quentity * order.price)}</strong>
									</div>
								</div>
								<div className='todo-extras'>
									<span>
										<Button
											icon='Delete'
											onClick={() => handleDelete(index)}></Button>
									</span>
								</div>
							</div>
						</Card>
					))}
				</CardBody>
			</Card>
		</div>
	);
};

export default Index;
