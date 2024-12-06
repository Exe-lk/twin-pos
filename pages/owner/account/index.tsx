import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import ThemeContext from '../../../context/themeContext';
import useDarkMode from '../../../hooks/useDarkMode';
import { TABS, TTabs } from '../../../common/type/helper';
import Page from '../../../layout/Page/Page';

import router from 'next/router';
import SubHeader, {
	SubHeaderLeft,
	SubHeaderRight,
	SubheaderSeparator,
} from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';
import Dropdown, { DropdownMenu, DropdownToggle } from '../../../components/bootstrap/Dropdown';
import Button from '../../../components/bootstrap/Button';
import * as XLSX from 'xlsx';
const Index: NextPage = () => {
	interface Row {
		date: string;
		description: string;
		price: number;
		url: string;
		type: string;
	}
	const [searchTerm, setSearchTerm] = useState('');
	const [searchmonth, setSearchmonth] = useState('');
	const [searchyear, setSearchyear] = useState('');
	const [statement, setStatement] = useState<Row[]>([]);
	const [rows, setRows] = useState<Row[]>([]);
	const [rows1, setRows1] = useState<Row[]>([]);
	const [totleincome, setTotleincome] = useState(0);
	const [totleexpenses, setTotleexpenses] = useState(0);
	const [addincome, setAddincome] = useState(true);
	const [addexpenses, setAddexpenses] = useState(true);
	const [choosefileincome, setChoosefileincome] = useState(false);
	const [choosefileexpenses, setChoosefileexpenses] = useState(false);
	const [progressdocument, setProgressdocument] = useState(false);
	const [progressdocument1, setProgressdocument1] = useState(false);
	const [incomeaddB, setIncomeaddB] = useState(false);
	const [incomeaddB1, setIncomeaddB1] = useState(false);
	const [incomedeleteB, setIncomedeleteB] = useState(false);
	const [incomedeleteB1, setIncomedeleteB1] = useState(false);
	const [progress, setProgress] = useState(0);
	const [progress1, setProgress1] = useState(0);

	useEffect(() => {
		updateTotals();
	}, [statement, searchmonth, searchyear]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'cashBook');
				const q = query(dataCollection, where('type', '==', 'Incoming'));
				const querySnapshot = await getDocs(dataCollection);

				const todaysStocks = querySnapshot.docs.map((doc) => {
					const data = doc.data() as Row;
					return {
						...data,
						cid: doc.id,
					};
				});
				setStatement(todaysStocks);
				console.log(todaysStocks);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, []);

	const updateTotals = () => {
		const totalIncome = statement
			.filter(
				(item) =>
					item.type === 'Incoming' &&
					item.date.toLowerCase().includes(searchyear) &&
					item.date.toLowerCase().includes(searchmonth.toLowerCase()),
			)
			.reduce((total, item) => Number(total) + Number(item.price), 0);
		setTotleincome(totalIncome);

		const totalExpenses = statement
			.filter(
				(item) =>
					item.type === 'expenses' &&
					item.date.toLowerCase().includes(searchyear) &&
					item.date.toLowerCase().includes(searchmonth.toLowerCase()),
			)
			.reduce((total, item) => Number(total) + Number(item.price), 0);
		setTotleexpenses(totalExpenses);
	};

	const deleteRow = (index: number) => {
		const updatedRows = rows.filter((_, i) => i !== index);
		setRows(updatedRows);
	};

	const deleteRow1 = (index: number) => {
		const updatedRows = rows1.filter((_, i) => i !== index);
		setRows1(updatedRows);
	};

	const addRow = () => {
		setAddincome(false);
		setRows([...rows, { date: '', description: '', price: 0, url: '', type: 'Incoming' }]);
	};

	const addRow1 = () => {
		setAddexpenses(false);
		setRows1([...rows1, { date: '', description: '', price: 0, url: '', type: 'expenses' }]);
	};

	const incomeadd = async () => {
		const newStatement = [...statement, ...rows];
		setStatement(newStatement);
		console.log(rows);

		try {
			const collectionRef = collection(firestore, 'cashBook');
			const addPromises = rows.map(async (row) => {
				try {
					await addDoc(collectionRef, row);
					return { success: true, data: row };
				} catch (error) {
					console.error('Error adding document: ', error);
					return { success: false, data: row, error };
				}
			});

			const results = await Promise.all(addPromises);

			const successfulAdds = results.filter((result) => result.success);
			const failedAdds = results.filter((result) => !result.success);

			if (successfulAdds.length > 0) {
				Swal.fire(
					'Added!',
					`${successfulAdds.length} income items have been added successfully.`,
					'success',
				);
			}

			if (failedAdds.length > 0) {
				console.error('Some documents failed to add:', failedAdds);
				Swal.fire({
					icon: 'warning',
					title: 'Partial Success',
					text: `${failedAdds.length} income items failed to add. Please check the console for details.`,
				});
			}
		} catch (error) {
			console.error('Error during handleUpload: ', error);
			Swal.fire({
				icon: 'error',
				title: 'Upload Error',
				text: 'An error occurred during file upload. Please try again later.',
			});
		}

		setRows([]);
		setAddincome(false);

		const totalIncome = newStatement
			.filter(
				(item) =>
					item.type === 'Incoming' &&
					item.date.toLowerCase().includes(searchyear) &&
					item.date.toLowerCase().includes(searchmonth.toLowerCase()),
			)
			.reduce((total, item) => Number(total) + Number(item.price), 0);
		setTotleincome(totalIncome);
	};

	const expensesadd = async () => {
		const newStatement = [...statement, ...rows1];
		setStatement(newStatement);
		console.log(rows1);

		try {
			const collectionRef = collection(firestore, 'cashBook');
			const addPromises = rows1.map(async (row) => {
				try {
					await addDoc(collectionRef, row);
					return { success: true, data: row };
				} catch (error) {
					console.error('Error adding document: ', error);
					return { success: false, data: row, error };
				}
			});

			const results = await Promise.all(addPromises);

			const successfulAdds = results.filter((result) => result.success);
			const failedAdds = results.filter((result) => !result.success);

			if (successfulAdds.length > 0) {
				Swal.fire(
					'Added!',
					`${successfulAdds.length} expense items have been added successfully.`,
					'success',
				);
			}

			if (failedAdds.length > 0) {
				console.error('Some documents failed to add:', failedAdds);
				Swal.fire({
					icon: 'warning',
					title: 'Partial Success',
					text: `${failedAdds.length} expense items failed to add. Please check the console for details.`,
				});
			}
		} catch (error) {
			console.error('Error during expense upload: ', error);
			Swal.fire({
				icon: 'error',
				title: 'Upload Error',
				text: 'An error occurred while adding expenses. Please try again later.',
			});
		}

		setRows1([]);
		setAddexpenses(false);

		const totalExpenses = newStatement
			.filter(
				(item) =>
					item.type === 'expenses' &&
					item.date.toLowerCase().includes(searchyear) &&
					item.date.toLowerCase().includes(searchmonth.toLowerCase()),
			)
			.reduce((total, item) =>Number(total) + Number(item.price), 0);
		setTotleexpenses(totalExpenses);
	};
	const handleExpenseFilter = (val: Row) => {
		if (val.type?.includes('expenses')) {
			if (searchTerm === '') {
				if (
					val.date.toLowerCase().includes(searchyear) &&
					val.date.toLowerCase().includes(searchmonth.toLowerCase())
				) {
					return val;
				}
			} else if (val.description.toLowerCase().includes(searchTerm.toLowerCase())) {
				if (
					val.date.toLowerCase().includes(searchyear) &&
					val.date.toLowerCase().includes(searchmonth.toLowerCase())
				) {
					return val;
				}
			}
		}
	};
	const handleIncomeFilter = (val: Row) => {
		if (val.type?.includes('Incoming')) {
			if (searchTerm === '') {
				if (
					val.date.toLowerCase().includes(searchyear) &&
					val.date.toLowerCase().includes(searchmonth.toLowerCase())
				) {
					return val;
				}
			} else if (val.description.toLowerCase().includes(searchTerm.toLowerCase())) {
				if (
					val.date.toLowerCase().includes(searchyear) &&
					val.date.toLowerCase().includes(searchmonth.toLowerCase())
				) {
					return val;
				}
			}
		}
	};

	const generatePDF = () => {
		const doc = new jsPDF();

		// Get the income table content
		const incomeTable = document.querySelectorAll('#income-table .table')[0];
		const incomeRows = incomeTable.querySelectorAll('tbody tr');
		let incomeContent = 'INCOME\n\n';
		incomeContent += 'No.  Date       Description      Price (Rs.)\n';
		incomeRows.forEach((row, index) => {
			const cols = row.querySelectorAll('td');
			if (cols.length === 4) {
				incomeContent += `${index + 1}    ${cols[1].innerText}    ${cols[2].innerText}    ${
					cols[3].innerText
				}\n`;
			}
		});
		incomeContent += `\nTotal Income: Rs ${totleincome}.00\n`;

		// Get the expenses table content
		const expensesTable = document.querySelectorAll('#income-table .table')[1];
		const expensesRows = expensesTable.querySelectorAll('tbody tr');
		let expensesContent = 'EXPENSES\n\n';
		expensesContent += 'No.  Date       Description      Price (Rs.)\n';
		expensesRows.forEach((row, index) => {
			const cols = row.querySelectorAll('td');
			if (cols.length === 4) {
				expensesContent += `${index + 1}    ${cols[1].innerText}    ${
					cols[2].innerText
				}    ${cols[3].innerText}\n`;
			}
		});
		expensesContent += `\nTotal Expenses: Rs ${totleexpenses}.00\n`;

		// Combine both contents
		const pdfContent = `${incomeContent}\n\n${expensesContent}`;

		// Add content to PDF
		const lines = doc.splitTextToSize(pdfContent, 180); // Wrap text at 180mm
		doc.text(lines, 10, 10);

		// Save the PDF
		doc.save('statement.pdf');
	};

	const generateCSVContent = (incomeData: Row[], expensesData: Row[]) => {
		const headers = ['Date', 'Description', 'Price', 'URL', 'Type'];
		const incomeRows = incomeData.map((row) => [ row.date, row.description, row.price, row.url, row.type]);
		const expensesRows = expensesData.map((row) => [row.date, row.description, row.price, row.url, row.type]);
	
		// Combine income and expenses data
		const combinedRows = [
			...incomeRows.map((row, index) => [ ...row]), // Add "Income" as the first column
			...expensesRows.map((row, index) => [ ...row]) // Add "Expenses" as the first column
		];
	
		const csvContent =
			'data:text/csv;charset=utf-8,' +
			[headers.join(','), ...combinedRows.map((row) => row.join(','))].join('\n');
	
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement('a');
		link.setAttribute('href', encodedUri);
		link.setAttribute('download', 'statement.csv');
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};
	const generateExcelContent = (incomeData: Row[], expensesData: Row[]) => {
		const headers = ['Date', 'Description', 'Price', 'URL', 'Type'];
		const incomeRows = incomeData.map((row) => [row.date, row.description, row.price, row.url, row.type]);
		const expensesRows = expensesData.map((row) => [row.date, row.description, row.price, row.url, row.type]);
	
		// Create worksheet
		const ws = XLSX.utils.aoa_to_sheet([]);
	
		// Add income headers and data
		XLSX.utils.sheet_add_aoa(ws, [['Income', '', '', '', '']], { origin: 'A1' });
		XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A2' });
		XLSX.utils.sheet_add_aoa(ws, incomeRows, { origin: 'A3' });
	
		// Add expenses headers and data
		XLSX.utils.sheet_add_aoa(ws, [['Expenses', '', '', '', '']], { origin: 'G1' });
		XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'G2' });
		XLSX.utils.sheet_add_aoa(ws, expensesRows, { origin: 'G3' });
	
		// Create workbook and add the worksheet
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Statement');
	
		// Write workbook and trigger download
		XLSX.writeFile(wb, 'statement.xlsx');
	};
	const handleExportCSV = () => {
		// const incomeData = statement.filter((item) => item.type === 'Incoming');
		// const expensesData = statement.filter((item) => item.type === 'expenses');
	
		// generateCSVContent(incomeData, expensesData);
		const incomeData = statement.filter((item) => item.type === 'Incoming');
		const expensesData = statement.filter((item) => item.type === 'expenses');
	
		generateExcelContent(incomeData, expensesData);
	};
	
	return (
		<PageWrapper>
			<Head>
				<title>Income & Expenses - Admin & Dashboard Template</title>
			</Head>
			<SubHeader>
				<SubHeaderLeft>
					<></>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Button color='info' onClick={generatePDF}>
						Export to PDF
					</Button>
					<Button color="primary" onClick={handleExportCSV}>
						Export CSV
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page container='fluid'>
				<main>
					<div className='form-group'>
						<label className='text'>Select month and year</label>
						<div className='form-row py-3'>
							<div className='col-md-4'>
								<input
									className='form-control'
									type='month'
									onChange={(e) => {
										setSearchyear(e.target.value);
									}}
									value={searchyear}
									placeholder='Enter year'
								/>
							</div>
						</div>
					</div>

					<div className='row' id='income-table'>
						<div className='col-lg-6'>
							<div className='form-group'>
								<p className='text-center font-weight-bold'>INCOME</p>
								<table className='table table-bordered'>
									<thead>
										<tr>
											<th scope='col'></th>
											<th scope='col'>Date</th>
											<th scope='col'>Description</th>
											<th scope='col'>Price (Rs.)</th>
										</tr>
									</thead>
									<tbody>
										{statement
											.filter(handleIncomeFilter)
											.map((statement, index) => (
												<tr key={index}>
													<td>{index + 1}</td>
													<td>{statement.date}</td>
													<td>{statement.description}</td>
													<td>{statement.price}.00</td>
												</tr>
											))}
									</tbody>
								</table>

								<div className='pt-4'>
									<hr />
									<div className='row'>
										<div className='col-md-12 d-flex justify-content-between'>
											<div>
												<h5>Total Incomes</h5>
											</div>
											<div>
												<h5>Rs {totleincome}.00</h5>
											</div>
										</div>
										<hr />
									</div>
								</div>
							</div>
						</div>
						<div className='col-lg-6 mt-4 mt-lg-0'>
							<div className='form-group'>
								<p className='text-center font-weight-bold'>EXPENSES</p>
								<table className='table table-bordered'>
									<thead>
										<tr>
											<th scope='col'></th>
											<th scope='col'>Date</th>
											<th scope='col'>Description</th>
											<th scope='col'>Price (Rs.)</th>
										</tr>
									</thead>
									<tbody>
										{statement
											.filter(handleExpenseFilter)
											.map((statement, index) => (
												<tr key={index}>
													<td>{index + 1}</td>
													<td>{statement.date}</td>
													<td>{statement.description}</td>
													<td>{statement.price}.00</td>
												</tr>
											))}
										{rows1.map((row, index) => (
											<tr key={index}>
												<td>{index + 1}</td>
												<td>
													<input
														type='date'
														className='form-control'
														value={row.date}
														onChange={(e) => {
															const updatedRows = [...rows1];
															updatedRows[index].date =
																e.target.value;
															setRows1(updatedRows);
														}}
													/>
												</td>
												<td>
													<input
														type='text'
														className='form-control'
														value={row.description}
														onChange={(e) => {
															const updatedRows = [...rows1];
															updatedRows[index].description =
																e.target.value;
															setRows1(updatedRows);
														}}
													/>
												</td>
												<td>
													<input
														type='number'
														className='form-control'
														value={row.price}
														onChange={(e) => {
															const updatedRows = [...rows1];
															updatedRows[index].price = Number(
																e.target.value,
															);
															setRows1(updatedRows);
														}}
													/>
												</td>
												<td>
													<input
														type='file'
														className='form-control-file'
														disabled={choosefileexpenses}
														onChange={(e) => {
															const updatedRows = [...rows1];
															updatedRows[index].url = e.target.value;
															setRows1(updatedRows);
														}}
													/>
												</td>
												<td>
													<button
														className='btn btn-danger'
														onClick={() => deleteRow1(index)}
														disabled={incomedeleteB1}>
														Cancel
													</button>
												</td>
											</tr>
										))}
										<tr hidden={addexpenses}>
											<td></td>
											<td></td>
											<td></td>
											<td></td>
											<td></td>
											<td>
												<button
													className='btn btn-primary'
													onClick={expensesadd}
													disabled={incomeaddB1}>
													Add
												</button>
											</td>
										</tr>
									</tbody>
								</table>
								{/* <button className='btn btn-primary' onClick={addRow1}>
										Add Row
									</button> */}
								<div className='pt-4'>
									<hr />
									<div className='row'>
										<div className='col-md-12 d-flex justify-content-between'>
											<div>
												<h5>Total Expenses</h5>
											</div>
											<div>
												<h5>Rs {totleexpenses}.00</h5>
											</div>
										</div>
										<div className='col-md-6'></div>
										<hr />
									</div>
								</div>
							</div>
						</div>
					</div>
				</main>
			</Page>
		</PageWrapper>
	);
};

export default Index;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale ?? 'en', ['common'])),
		},
	};
};
