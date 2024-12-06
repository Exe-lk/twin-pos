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
import COLORS, { getColorNameWithIndex } from '../../../common/data/enumColors';
import { firestore } from '../../../firebaseConfig';
import Dropdown, { DropdownToggle, DropdownMenu } from '../../../components/bootstrap/Dropdown';
import { getFirstLetter } from '../../../helpers/helpers';
import { collection, getDocs, query, where } from 'firebase/firestore';
import PaginationButtons from '../../../components/PaginationButtons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import StockChart from '../../../components/sock-monthly';
// Define the interface for stock data
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
// Define the functional component for the index page
const Index: NextPage = () => {
  const [id] = useState<string>("");// State for current stock ID
  const [stock, setStock] = useState<Stock[]>([]);// State for stock data
  const [currentPage, setCurrentPage] = useState(1);// State for current page number
  const [perPage, setPerPage] = useState<number>(5);// State for items per page
  const [addModalStatus] = useState<boolean>(false); // State for add modal status
  const [editModalStatus] = useState<boolean>(false);// State for edit modal status
  const { darkModeStatus } = useDarkMode();// Get dark mode status from custom hook
  const [searchTerm, setSearchTerm] = useState("");// State for search term
  const [data, setData] = useState<{ labels: string[]; data: { [key: string]: number }[] }>({ // State for graph data
    labels: [],
    data: [],
  });
  // Fetch stock data from Firestore on component mount or when add/edit modals are toggled
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
   // Fetch specific stock data when ID changes
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
   // Update graph data when stock data changes
  useEffect(() => {
    const graphData = prepareGraphData();
    setData(graphData);
  }, [stock]);
   // JSX for rendering the page
  return (
    <PageWrapper>
    
      <Page>
        <div className='row h-100'>
          <div className='col-6'>
          <StockChart />
          </div>
          <div className='col-6'>
            <Card stretch style={{height:"480px"}}>
              <CardBody isScrollable className='table-responsive'>
                <h3>Available stock</h3>
                 {/* Table for displaying available stock */}
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
                           {/* Display stock item details */}
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
                        <td>{stock.quentity}</td>
                        <td>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
               {/* Pagination buttons for navigating through stock items */}
              <PaginationButtons
                data={stock}
                label='items'
                setCurrentPage={setCurrentPage}
                currentPage={currentPage}
                perPage={perPage}
                setPerPage={setPerPage} />
            </Card>
          </div>
        </div>
      </Page>
    </PageWrapper>
  );
}
export default Index