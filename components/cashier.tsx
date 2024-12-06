import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../firebaseConfig.js";
import { format } from "date-fns";
import Card, {
  CardActions,
  CardBody,
  CardHeader,
  CardLabel,
  CardSubTitle,
  CardTitle,
} from "./bootstrap/Card";
import CommonStoryBtn from "../common/partial/other/CommonStoryBtn";
import Chart, { IChartOptions } from "./extras/Chart";

interface Order {
  cid: string;
  casheir: string;
  date: string;
}

function Cashier() {
  const [sampleData, setSampleData] = useState<Order[]>([]);
  const [chartOptions, setChartOptions] = useState<any>({
    series: [],
		options: {
			chart: {
				height: 350,
				type: 'line',
				dropShadow: {
					enabled: false,
					color: '#000',
					top: 20,
					left: 7,
					blur: 10,
					opacity: 0.2,
				},
				toolbar: {
					show: true,
				},
			},
			tooltip: {
				theme: 'dark',
			},
			dataLabels: {
				enabled: true,
			},
			stroke: {
				curve: 'smooth',
			},
			title: {
				text: 'Daily Order Summary',
				align: 'left',
			},
			grid: {
				borderColor: '#e7e7e7',
				row: {
					colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
					opacity: 0.5,
				},
			},
			markers: {
				size: 1,
			},
			xaxis: {
				categories: Array.from({ length: 24 }, (_, i) => `${i}:00`),
				title: {
					text: 'Cashier',
				},
			},
			yaxis: {
				title: {
					text: 'Amount (Rs)',
				},
				min: 0,
			},
			legend: {
				position: 'top',
				horizontalAlign: 'right',
				floating: true,
				offsetY: -25,
				offsetX: -5,
			},
		},
	});

  const currentDate = new Date();
				const formattedDate = currentDate.toLocaleDateString();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataCollection = collection(firestore, "orders");
        const q = query(dataCollection, where("date", "==", formattedDate));
        const querySnapshot = await getDocs(q);

        const todaysStocks = querySnapshot.docs.map((doc) => {
          const data = doc.data() as Order;
          return {
            ...data,
            cid: doc.id,
          };
        });
        setSampleData(todaysStocks);

        const cashierCounts: any = {};

        for (const transaction of todaysStocks) {
          const cashier = transaction.casheir;
          if (cashierCounts[cashier]) {
            cashierCounts[cashier]++;
          } else {
            cashierCounts[cashier] = 1;
          }
        }

        const cashierCountsArray = Object.entries(cashierCounts).map(
          ([email, count]) => ({
            email,
            count,
          })
        );

        setChartOptions({
          series: [
            {
              name: 'Counts',
              data: cashierCountsArray.map(item => item.count),
            },
          ],
          options: {
            chart: {
              type: 'line',
              height: 350,
            },
            xaxis: {
              categories: cashierCountsArray.map(item => item.email),
            },
            yaxis: {
              title: {
                text: 'Counts',
              },
            },
            tooltip: {
              y: {
                formatter(val:any) {
                  return `${val} counts`;
                },
              },
            },
          },
        });

      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, [formattedDate]);

  return (
    <div className='col-lg-12'>
      <Card stretch>
        <CardHeader>
          <CardLabel icon='LineChart'>
            <CardTitle>
            Cashier Report
             
            </CardTitle>
            <CardSubTitle>  <small>line</small></CardSubTitle>
          </CardLabel>
         
        </CardHeader>
        <CardBody>
          <Chart
            series={chartOptions.series}
            options={chartOptions.options}
            type='line'
            height={350}
          />
        </CardBody>
      </Card>
    </div>
  );
}

export default Cashier;
