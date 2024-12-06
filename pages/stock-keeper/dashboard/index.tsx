import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import useDarkMode from '../../../hooks/useDarkMode';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft, SubHeaderRight, SubheaderSeparator } from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import Dropdown, { DropdownToggle, DropdownMenu } from '../../../components/bootstrap/Dropdown';
import COLORS, { getColorNameWithIndex } from '../../../common/data/enumColors';
import { getFirstLetter } from '../../../helpers/helpers';
import PaginationButtons from '../../../components/PaginationButtons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import StockChart from '../../../components/sock-monthly';
// Define interfaces for Seller and Stock
interface Seller {
  cid: string;
  name: string;
  phone: string;
  email: string;
  company_name: string;
  company_email: string;
  product: string[];
}
interface Stock {
  cid: string;
  buy_price: number;
  item_id: string;
  location: string;
  quentity: string;
  status: string;
  sublocation: string
  exp: string
  currentquentity: string;
  stockHistory: { stockout: string; date: string }[];
}
const Index: NextPage = () => {
  // State variables
  const { darkModeStatus } = useDarkMode();
  const [searchTerm, setSearchTerm] = useState("");
  const [addModalStatus, setAddModalStatus] = useState<boolean>(false);
  const [editModalStatus, setEditModalStatus] = useState<boolean>(false);
  const [id, setId] = useState<string>("");
  const [id1, setId1] = useState<string>("12356");
  const [status, setStatus] = useState(true);
  const [seller, setSeller] = useState<Seller[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(5);
  const [data, setData] = useState<{ labels: string[]; data: { [key: string]: number }[] }>({
    labels: [],
    data: [],
  });
  // Fetch stock data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataCollection = collection(firestore, 'stock');
        const querySnapshot = await getDocs(dataCollection);
        const firebaseData = querySnapshot.docs.map((doc) => {
          const data = doc.data() as Stock;
          return {
            ...data,
            cid: doc.id,
          };
        });
        setStock(firebaseData);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    fetchData();
  }, [editModalStatus, addModalStatus]);
  // Fetch seller data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataCollection = collection(firestore, 'seller');
        const querySnapshot = await getDocs(dataCollection);
        const firebaseData = querySnapshot.docs.map((doc) => {
          const data = doc.data() as Seller;
          return {
            ...data,
            cid: doc.id,
          };
        });
        setSeller(firebaseData);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    fetchData();
  }, [editModalStatus, addModalStatus]);
  // Fetch specific stock data from Firestore based on ID
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
        if (firebaseData.length > 0) {
          const stockData = firebaseData[0];
          setStock(stockData);
          const stockHistory = stockData.stockHistory;
          console.log('Stock History:', stockHistory);
        } else {
          console.error('Stock data not found for ID:', id);
        }
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    fetchData();
  }, [id]);
  // Function to aggregate stock out data by month
  const aggregateStockOutByMonth = (stockHistory: { stockout: string; date: string }[] | undefined) => {
    const aggregatedData: { [key: string]: number } = {};
    if (!stockHistory) {
      return aggregatedData;
    }
    stockHistory.forEach((entry) => {
      const date = new Date(entry.date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const key = `${year}-${month}`;
      if (aggregatedData[key]) {
        aggregatedData[key] += parseInt(entry.stockout);
      } else {
        aggregatedData[key] = parseInt(entry.stockout);
      }
    });
    return aggregatedData;
  };
  // Function to prepare data for graph
  const prepareGraphData = () => {
    const graphData: { labels: string[]; data: { [key: string]: number }[] } = {
      labels: [],
      data: [],
    };
    stock.forEach((item) => {
      const stockHistory = item.stockHistory;
      const aggregatedData = aggregateStockOutByMonth(stockHistory);
      graphData.labels = Object.keys(aggregatedData);
      Object.keys(aggregatedData).forEach((month, index) => {
        if (!graphData.data[index]) {
          graphData.data[index] = {};
        }
        graphData.data[index][item.item_id] = aggregatedData[month];
      });
    });
    return graphData;
  };
  // Update data state when stock changes
  useEffect(() => {
    const graphData = prepareGraphData();
    setData(graphData);
  }, [stock]);
  return (
    <PageWrapper>
     
      <Page>
        <div className='row'>
          <div className='col-9'>
          <StockChart />
          </div>
          <div className='col-3'>
            <Card stretch>
              <CardBody isScrollable className='table-responsive'>
                <div className="mb-3">
                  <h3>Lowest item in stock</h3>
                </div>
                <table className='table table-modern table-hover'>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Quentity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock.filter(stockItem => parseInt(stockItem.currentquentity) < 100).map((stockItem, index) => (
                      <tr key={stockItem.cid}>
                        <td>
                          <div className='d-flex align-items-center'>
                            <div className='flex-shrink-0'>
                              <div className='ratio ratio-1x1 me-3' style={{ width: 48 }}>
                                <div
                                  className={`bg-l${darkModeStatus ? 'o25' : '25'}-${getColorNameWithIndex(
                                    index
                                  )} text-${getColorNameWithIndex(index)} rounded-2 d-flex align-items-center justify-content-center`}>
                                  <span className='fw-bold'>{getFirstLetter(stockItem.item_id)}</span>
                                </div>
                              </div>
                            </div>
                            <div className='flex-grow-1'>
                              <div className='fs-6 fw-bold'>{stockItem.item_id}</div>
                            </div>
                          </div>
                        </td>
                        <td>{stockItem.currentquentity}</td>
                        <td>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
              {/* Pagination for lowest item in stock */}
              <PaginationButtons
                data={seller}
                label='items'
                setCurrentPage={setCurrentPage}
                currentPage={currentPage}
                perPage={perPage}
                setPerPage={setPerPage}
              />
            </Card>
          </div>
          <div className='col-6'>
            <Card stretch style={{ height: '400px' }}>
              <CardBody isScrollable className='table-responsive'>
                <div className="mb-3">
                   {/* Display available stock */}
                  <h3>Available stock</h3>
                </div>
                <table className='table table-modern table-hover'>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Unit Cost</th>
                      <th>Location</th>
                      <th>EXP Date</th>
                      <th>Quentity</th>
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
                        <td>
                          {stock.buy_price}
                        </td>
                        <td>
                          {stock.location}
                        </td>
                        <td>{stock.exp}</td>
                        <td>{stock.currentquentity}</td>
                        <td>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
               {/* Pagination for available stock */}
              <PaginationButtons
                data={stock}
                label='items'
                setCurrentPage={setCurrentPage}
                currentPage={currentPage}
                perPage={perPage}
                setPerPage={setPerPage}
              />
            </Card>
          </div>
          <div className='col-6'>
            <Card stretch>
              <CardBody isScrollable className='table-responsive'>
                <div className="mb-3">
                   {/* Display sellers details */}
                  <h3>Sellers Details</h3>
                </div>
                <table className='table table-modern table-hover'>
                  <thead>
                    <tr>
                      <th>Seller name</th>
                      <th>Company name</th>
                      <th>Seller email</th>
                      <th>Product</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seller.map((seller, index) => (
                      <tr key={seller.cid}>
                        <td>
                          <div className='d-flex align-items-center'>
                            <div className='flex-shrink-0'>
                              <div className='ratio ratio-1x1 me-3' style={{ width: 48 }}>
                                <div
                                  className={`bg-l${darkModeStatus ? 'o25' : '25'}-${getColorNameWithIndex(
                                    index
                                  )} text-${getColorNameWithIndex(index)} rounded-2 d-flex align-items-center justify-content-center`}>
                                  <span className='fw-bold'>{getFirstLetter(seller.name)}</span>
                                </div>
                              </div>
                            </div>
                            <div className='flex-grow-1'>
                              <div className='fs-6 fw-bold'>{seller.name}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {seller.company_name}
                        </td>
                        <td>{seller.email}</td>
                        <td>
                          <Dropdown>
                            <DropdownToggle hasIcon={false}>
                              <Button icon='List' color='primary' isLight>
                                View Products
                              </Button>
                            </DropdownToggle>
                            <DropdownMenu isAlignmentEnd size='md'>
                              {Array.isArray(seller.product) && seller.product.map((product, index) => (
                                <div key={index}>
                                  {product}
                                </div>
                              ))}
                            </DropdownMenu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
                {/* Pagination for sellers details */}
              <PaginationButtons
                data={seller}
                label='items'
                setCurrentPage={setCurrentPage}
                currentPage={currentPage}
                perPage={perPage}
                setPerPage={setPerPage}
              />
            </Card>
          </div>
        </div>
      </Page>
    </PageWrapper>
  );
}

export default Index