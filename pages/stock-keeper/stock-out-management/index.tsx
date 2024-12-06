import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import useDarkMode from '../../../hooks/useDarkMode';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft, SubHeaderRight, SubheaderSeparator } from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import StockAddModal from '../../../components/custom/StockOutAddModal';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import Dropdown, { DropdownToggle, DropdownMenu } from '../../../components/bootstrap/Dropdown';
import { getColorNameWithIndex } from '../../../common/data/enumColors';
import { getFirstLetter } from '../../../helpers/helpers';
import showNotification from '../../../components/extras/showNotification';
interface Stock {
  cid: string;
  item_id: string;
  quentity: string;
  location: string;
}
const Index: NextPage = () => {
  const { darkModeStatus } = useDarkMode();// Dark mode
  const [searchTerm, setSearchTerm] = useState("");// State for search term
  const [addModalStatus, setAddModalStatus] = useState<boolean>(false);// State to control the visibility of the StockAddModal
  const [editModalStatus, setEditModalStatus] = useState<boolean>(false);
  const [stock, setStock] = useState<Stock[]>([]);// State to store stock data fetched from Firestore
  const [id, setId] = useState<string>(""); // State to store the ID of the selected stock item
   // Fetch data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataCollection = collection(firestore, 'stock');// Reference to the 'stock' collection in Firestore
        const querySnapshot = await getDocs(
          query(dataCollection, where('location', '==', 'showroom')) // Query to get stock items where location is 'showroom'
        );
        const firebaseData = querySnapshot.docs.map((doc) => {
          const data = doc.data() as Stock;// Extracting data from each document
          return {
            ...data,
            cid: doc.id,// Adding the document ID as 'cid' in the data object
          };
        });
        setStock(firebaseData); // Updating the stock state with the fetched data
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    fetchData();
  }, [editModalStatus, addModalStatus]);// Dependency array: useEffect runs when editModalStatus or addModalStatus changes
  // Check for low stock items
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    const checkLowStock = () => {
      // Check if any stock item has a quantity less than 50
      const lowStockItem = stock.find(item => parseInt(item.quentity) < 50);
      if (lowStockItem) {
        // Show notification
        showLowStockNotification(lowStockItem.item_id);
      }
      // Schedule the next check after 1 minute
      timerId = setTimeout(checkLowStock, 50000); // 1 minute = 60000 milliseconds
    };
    // Start checking for low stock items
    checkLowStock();
    // Cleanup function
    return () => clearTimeout(timerId);
  }, [stock]);
  // Function to show low stock notification
  const showLowStockNotification = (itemName: string) => {
    showNotification(
      'Insufficient Stock',
      `${itemName} stock quantity is less than 50. Manage your stock.`,
      'warning'
    );
  };
  return (
    <PageWrapper>
      <Head>
        <>
        </>
      </Head>
      <SubHeader>
        <SubHeaderLeft>
          {/* Search input */}
          <label className='border-0 bg-transparent cursor-pointer me-0' htmlFor='searchInput'>
            <Icon icon='Search' size='2x' color='primary' />
          </label>
          <Input
            id='searchInput'
            type='search'
            className='border-0 shadow-none bg-transparent'
            placeholder='Search stock...'
            onChange={(event: any) => { setSearchTerm(event.target.value); }}
            value={searchTerm}
          />
        </SubHeaderLeft>
        
      </SubHeader>
      <Page>
        <div className='row h-100'>
          <div className='col-12'>
              {/* Table for displaying stock data */}
            <Card stretch>
              <CardBody isScrollable className='table-responsive'>
                <table className='table table-modern table-hover'>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quentity</th>
                      <th>Stock out</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock.map((stock, index) => (
                      <tr key={stock.cid}>
                        <td>
                          <div className='d-flex align-items-center'>
                            <div className='flex-shrink-0'>
                              <div className='ratio ratio-1x1 me-3' style={{ width: 48 }}>
                                <div
                                  className={`bg-l${darkModeStatus ? 'o25' : '25'}-${getColorNameWithIndex(
                                    index
                                  )} text-${getColorNameWithIndex(index)} rounded-2 d-flex align-items-center justify-content-center`}>
                                  <span className='fw-bold'>{getFirstLetter(stock.item_id)}</span>
                                </div>
                              </div>
                            </div>
                            <div className='flex-grow-1'>
                              <div className='fs-6 fw-bold'>{stock.item_id}</div>
                            </div>
                          </div>
                        </td>
                        <td>{stock.quentity}</td>
                        <td>
                          {/* Button to initiate stock out */}
                          <Button icon='AddCircleOutline' color='primary' isLight onClick={() => (setAddModalStatus(true), setId(stock.cid))}>
                            Stock out
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </div>
        </div>
      </Page>
       {/* StockAddModal component to handle stock out */}
      <StockAddModal setIsOpen={setAddModalStatus} isOpen={addModalStatus} id={id} />
    </PageWrapper>
  );
};
export default Index;



