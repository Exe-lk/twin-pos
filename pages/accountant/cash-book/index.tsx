import React, { useContext, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTour } from '@reactour/tour';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import Swal from 'sweetalert2';

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

const Index: NextPage = () => {
	interface Row {
		date: string;
		description: string;
		price: number;
		url: string;
		type: string;
	}
	const currentDate = new Date();
	const year = currentDate.getFullYear();
	const month = String(currentDate.getMonth() + 1).padStart(2, '0');
	const day = String(currentDate.getDate()).padStart(2, '0');
	const formattedDate = `${year}-${month}-${day}`;
	const formattedDate1 = `${year}-${month}`;
	const [searchTerm, setSearchTerm] = useState('');
	const [searchmonth, setSearchmonth] = useState('');
	const [searchyear, setSearchyear] = useState(formattedDate1);
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
		console.log(searchyear)
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
		console.log(updatedRows);
		if (updatedRows.length == 0) {
			setAddincome(true);
		}
		setRows(updatedRows);
	};

	const deleteRow1 = (index: number) => {
		const updatedRows = rows1.filter((_, i) => i !== index);
		if (updatedRows.length == 0) {
			setAddexpenses(true);
		}
		setRows1(updatedRows);
	};

	const addRow = () => {
		setAddincome(false);
		setRows([
			...rows,
			{ date: formattedDate, description: '', price: 0, url: '', type: 'Incoming' },
		]);
	};

	const addRow1 = () => {
		setAddexpenses(false);
		setRows1([
			...rows1,
			{ date: formattedDate, description: '', price: 0, url: '', type: 'expenses' },
		]);
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
					console.log(addexpenses)
					setAddexpenses(false);
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
		setAddincome(true);

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
					setAddexpenses(true);
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
		setAddexpenses(true);

		const totalExpenses = newStatement
			.filter(
				(item) =>
					item.type === 'expenses' &&
					item.date.toLowerCase().includes(searchyear) &&
					item.date.toLowerCase().includes(searchmonth.toLowerCase()),
			)
			.reduce((total, item) => Number(total) + Number(item.price), 0);
		setTotleexpenses(totalExpenses);
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


	return (
		<PageWrapper>
			{/* Main page content */}

			<Page container='fluid'>
				<div className=''>
					<header className='row'>
						<div className='col-12'>
							<h2 className='text-center py-3 font-weight-bold'>Cash Book</h2>
						</div>
					</header>
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
						<div className='row'>
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
											{rows.map((row, index) => (
												<tr key={index}>
													<td>{index + 1}</td>
													<td>{formattedDate}</td>
													<td>
														<input
															type='text'
															className='form-control'
															value={row.description}
															onChange={(e) => {
																const updatedRows = [...rows];
																updatedRows[index].description =
																	e.target.value;
																setRows(updatedRows);
															}}
														/>
													</td>
													<td>
														<input
															type='number'
															className='form-control'
															value={row.price}
															onChange={(e) => {
																const updatedRows = [...rows];
																updatedRows[index].price = Number(
																	e.target.value,
																);
																setRows(updatedRows);
															}}
														/>
													</td>
													<td>
														<input
															type='file'
															className='form-control-file'
															disabled={choosefileincome}
															onChange={(e) => {
																const updatedRows = [...rows];
																updatedRows[index].url =
																	e.target.value;
																setRows(updatedRows);
															}}
														/>
													</td>
													<td>
														<button
															className='btn btn-danger'
															onClick={() => deleteRow(index)}
															disabled={incomedeleteB}>
															Cancel
														</button>
													</td>
												</tr>
											))}
											<tr hidden={addincome}>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td>
													<button
														className='btn btn-primary'
														onClick={incomeadd}
														disabled={incomeaddB}>
														Add
													</button>
												</td>
											</tr>
										</tbody>
									</table>
									<button className='btn btn-primary' onClick={addRow}>
										Add Row
									</button>
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
													<td>{formattedDate}</td>
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
																updatedRows[index].url =
																	e.target.value;
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
									<button className='btn btn-primary' onClick={addRow1}>
										Add Row
									</button>
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
				</div>
			</Page>
		</PageWrapper>
	);
};

export default Index;
