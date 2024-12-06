import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';

interface Orders {
    cid: string;
    casheir: string;
    date: string;
    amount: string;
    orders: { category: string; price: number | string }[];
}
interface User {
    cid: string;
    image: string;
    name: string;
    position: string;
    email: string;
    mobile: number;
    NIC: number;
    profile_picture: string;
}

const Index: React.FC = () => {
    const [searchyear, setSearchyear] = useState<number>(new Date().getFullYear());
    const [searchmonth, setSearchmonth] = useState<string>('');
    const [searchDate, setSearchDate] = useState<string>('');
    const [orders, setOrders] = useState<Orders[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Orders[]>([]);
    const [user, setUser] = useState<User[]>([]);
    const [selectedCashier, setSelectedCashier] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dataCollection = collection(firestore, 'orders');
                const querySnapshot = await getDocs(dataCollection);
                const firebaseData = querySnapshot.docs.map((doc) => {
                    const data = doc.data() as Orders;
                    return {
                        ...data,
                        cid: doc.id,
                    };
                });
                setOrders(firebaseData);
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dataCollection = collection(firestore, 'user');
                const querySnapshot = await getDocs(dataCollection);
                const firebaseData = querySnapshot.docs.map((doc) => {
                    const data = doc.data() as User;
                    return {
                        ...data,
                        cid: doc.id,
                    };
                });
                setUser(firebaseData);
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const filterOrdersByDate = () => {
            return orders.filter((order) => {
                const orderDate = new Date(order.date);
                const orderYear = orderDate.getFullYear();
                const orderMonth = orderDate.toLocaleString('default', { month: 'short' });
                const formattedSearchDate = new Date(searchDate).toDateString();

                console.log(`Order Date: ${order.date}, Year: ${orderYear}, Month: ${orderMonth}`);
                console.log(
                    `Search Year: ${searchyear}, Search Month: ${searchmonth}, Search Date: ${searchDate}`,
                );

                if (searchDate && new Date(order.date).toDateString() !== formattedSearchDate) {
                    return false;
                }
                if (searchmonth && searchmonth !== orderMonth) {
                    return false;
                }
                if (searchyear && searchyear !== orderYear) {
                    return false;
                }
                return true;
            });
        };

        setFilteredOrders(filterOrdersByDate());
    }, [orders, searchyear, searchmonth, searchDate]);

    const calculateTotalPrice = () => {
        const cashierTotalPrices: { [key: string]: number } = {};

        filteredOrders.forEach((order) => {
            if (!cashierTotalPrices[order.casheir]) {
                cashierTotalPrices[order.casheir] = 0;
            }

            const price =
                typeof order.amount === 'string' ? parseFloat(order.amount) : order.amount;
            cashierTotalPrices[order.casheir] += price;
        });

        return cashierTotalPrices;
    };

    const getordercount = (email: string) => {
        let count: any = 0;
        filteredOrders.forEach((order) => {
            if (order.casheir === email) {
                count = count + 1;
            }
        });

        return count;
    };

    const uniqueCashiers = Array.from(new Set(orders.map((order) => order.casheir)));
    const cashierTotalPrices = calculateTotalPrice();

    const getCashierName = (email: string) => {
        const user1 = user.find((user: { email: string }) => user.email === email);
        return user1 ? user1.name : 'Unknown';
    };

    return (
        <>
            <PageWrapper>
                <Page>
                    <div className='row h-100'>
                        <div className='col-12'>
                            <Card stretch>
                                <CardBody isScrollable className='table-responsive'>
                                    <div className='mt-2 mb-4'>
                                        Select date :
                                        <input
                                            type='date'
                                            onChange={(e: any) => setSearchDate(e.target.value)}
                                            value={searchDate}
                                            className='px-3 py-2 ms-4 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        />
                                    </div>
                                    <table className='table table-modern table-hover'>
                                        <thead>
                                            <tr>
                                                <th>Cashier name</th>
                                                <th>Cashier email</th>
                                                <th>Order count</th>
                                                <th>Total Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {uniqueCashiers.map((casheir, index) => (
                                                <>
                                                    <tr
                                                        key={index}
                                                        onClick={() =>
                                                            setSelectedCashier(
                                                                selectedCashier === casheir
                                                                    ? null
                                                                    : casheir,
                                                            )
                                                        }>
                                                        <td>{getCashierName(casheir)}</td>
                                                        <td>{casheir}</td>
                                                        <td>{getordercount(casheir)}</td>
                                                        <td colSpan={2}>
                                                            {cashierTotalPrices[
                                                                casheir
                                                            ]?.toFixed(2) || 0}
                                                        </td>
                                                    </tr>
                                                    {selectedCashier === casheir && (
                                                        <tr>
                                                            <td colSpan={4}>
                                                                <table className='table table-modern table-hover'>
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Date</th>
                                                                            <th>amount(Rs)</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {orders
                                                                            .filter((val) => {
                                                                                if (
                                                                                    val.casheir ==
                                                                                    casheir
                                                                                ) {
                                                                                    return val;
                                                                                }
                                                                            })
                                                                            .map(
                                                                                (order, index) => (
                                                                                    <tr key={index}>
                                                                                        <td>
                                                                                            {
                                                                                                order.date
                                                                                            }
                                                                                        </td>
                                                                                        <td>
                                                                                            {
                                                                                                order.amount
                                                                                            }
                                                                                        </td>
                                                                                    </tr>
                                                                                ),
                                                                            )}
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            ))}
                                        </tbody>
                                    </table>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </Page>
            </PageWrapper>
        </>
    );
};

export default Index;
