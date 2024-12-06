import React, { FC, useCallback, useContext, useState } from 'react';
import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import classNames from 'classnames';
import Link from 'next/link';
import PropTypes from 'prop-types';
import AuthContext from '../context/authContext';
import useDarkMode from '../hooks/useDarkMode';
import PageWrapper from '../layout/PageWrapper/PageWrapper';
import Page from '../layout/Page/Page';
import Card, { CardBody } from '../components/bootstrap/Card';
import Button from '../components/bootstrap/Button';
import FormGroup from '../components/bootstrap/forms/FormGroup';
import Input from '../components/bootstrap/forms/Input';
import Select from '../components/bootstrap/forms/Select';
import axios from 'axios';
import Swal from 'sweetalert2';
import PostDataService from '../services/postservice';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, firestore } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
interface ILoginHeaderProps {
	isNewUser?: boolean;
}
const LoginHeader: FC<ILoginHeaderProps> = () => {
	return (
		<>
			<div className='text-center h1 fw-bold mt-5'>Welcome,</div>
			<div className='text-center h4 text-muted mb-5'>Sign in to continue!</div>
		</>
	);
};

interface User {
	password: string;
	email: string;
	position: string;
}

interface ILoginProps {
	isSignUp?: boolean;
}
const Login: NextPage<ILoginProps> = ({ isSignUp }) => {
	const router = useRouter();
	const { darkModeStatus } = useDarkMode();
	const [users, setUsers] = useState<User[]>([]);
	const { setUser } = useContext(AuthContext);

	const signInUser = async (email: string, password: string) => {
		try {
			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;

			return user;
		} catch (error) {
			console.error('Error signing in:', error);
			return null;
		}
	};

	//login
	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			email: '',
			password: '',
		},
		validate: (values) => {
			const errors: { email?: string; password?: string } = {};

			if (!values.email) {
				errors.email = 'Required';
			}

			if (!values.password) {
				errors.password = 'Required';
			}

			return errors;
		},

		onSubmit: async (values) => {
			try {
				const user = await signInUser(values.email, values.password);

				if (user) {
					if (setUser) {
						setUser(values.email);
					}
					await Swal.fire({
						icon: 'success',
						title: 'Login Successful',
						text: 'You have successfully logged in!',
					});

					// Store user information in session

					const usersCollection = collection(firestore, 'user');

					const q = query(usersCollection, where('email', '==', values.email));

					const querySnapshot = await getDocs(q);

					const firebaseData = querySnapshot.docs.map((doc) => {
						const data = doc.data();
						return {
							...data,
							_id: doc.id,
						};
					});

					if (!querySnapshot.empty) {
						const userData = querySnapshot.docs[0].data();
						localStorage.setItem('user', JSON.stringify(userData));
						console.log(userData.position);
						switch (userData.position) {
							case 'Admin':
								router.push('/admin/dashboard');
								break;
							case 'Cashier':
								router.push('/cashier/bills');
								break;

							case 'Stock keeper':
								router.push('/stock-keeper/dashboard');
								break;
							case 'Accountant':
								router.push('/accountant/dashboard');
								break;
							case 'Owner':
								router.push('/Owner/dashboard');
								break;
							case 'Data entry operator':
								router.push('/dataentry-operater/dashboard');
								break;
						}
					}

					// router.push('/employeepages/dashboard');
				} else {
					await Swal.fire({
						icon: 'error',
						title: 'Invalid Credentials',
						text: 'Username and password do not match. Please try again.',
					});
				}
			} catch (error) {
				console.error('Error occurred:', error);
				Swal.fire('Error', 'An unexpected error occurred', 'error');
			}
		},
	});

	return (
		<PageWrapper
			isProtected={false}
			// className={classNames({ 'bg-dark': !singUpStatus, 'bg-light': singUpStatus })}
		>
			<Head>
				<title> Login</title>
			</Head>
			<Page className='p-0'>
				<div className='row h-100 align-items-center justify-content-center'>
					<div className='col-xl-4 col-lg-6 col-md-8 shadow-3d-container'>
						<Card className='shadow-3d-dark' data-tour='login-page'>
							<CardBody>
								<div className='text-center my-5'>
									<Link
										href='/'
										className={classNames(
											'text-decoration-none  fw-bold display-2',
											{
												'text-dark': !darkModeStatus,
												'text-light': darkModeStatus,
											},
										)}>
										{/* <Logo width={200} /> */}
									</Link>
								</div>

								<LoginHeader />

								<form className='row g-4'>
									<>
										<div className='col-12'>
											<FormGroup
												id='email'
												label='Your email'
												className='col-md-12'>
												<Input
													autoComplete='username'
													value={formik.values.email}
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													isValid={formik.isValid}
													isTouched={formik.touched.email}
													invalidFeedback={formik.errors.email}
												/>
											</FormGroup>
											<FormGroup
												id='password'
												label='Password'
												className='col-md-12'>
												<Input
													type='password'
													value={formik.values.password}
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													isValid={formik.isValid}
													isTouched={formik.touched.password}
													invalidFeedback={formik.errors.password}
												/>
											</FormGroup>
										</div>
										<div className='col-12'>
											<Button
												color='warning'
												className='w-100 py-3'
												onClick={formik.handleSubmit}>
												Login
											</Button>
										</div>
									</>
								</form>
							</CardBody>
						</Card>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};
Login.propTypes = {
	isSignUp: PropTypes.bool,
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		// @ts-ignore
		...(await serverSideTranslations(locale, ['common', 'menu'])),
	},
});

export default Login;
