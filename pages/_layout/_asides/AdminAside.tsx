import React, { useContext, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'next-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Brand from '../../../layout/Brand/Brand';
import Navigation, { NavigationLine } from '../../../layout/Navigation/Navigation';
import User from '../../../layout/User/User';
import {

	addminPagesMenu,
	logoutmenu
} from '../../../menu';
import ThemeContext from '../../../context/themeContext';
import Card, { CardBody } from '../../../components/bootstrap/Card';

import Hand from '../../../assets/img/hand.png';
import Icon from '../../../components/icon/Icon';
import Button from '../../../components/bootstrap/Button';
import useDarkMode from '../../../hooks/useDarkMode';
import Aside, { AsideBody, AsideFoot, AsideHead } from '../../../layout/Aside/Aside';
import logo from "../../../assets/logos/Logo.png"
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';

const DefaultAside = () => {
	// Context for theme
	const { asideStatus, setAsideStatus } = useContext(ThemeContext);

	// State to manage document status
	const [doc, setDoc] = useState(
		(typeof window !== 'undefined' &&
			localStorage.getItem('facit_asideDocStatus') === 'true') ||
		false,
	);

	// Translation hook
	const { t } = useTranslation(['common', 'menu']);

	const router = useRouter();
	// Dark mode hook
	const { darkModeStatus } = useDarkMode();

	// Function to handle logout button click
	const handleLogout = async () => {
		try {
			const result = await Swal.fire({
				title: 'Are you sure?',
				// text: 'You will not be able to recover this user!',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, Log out',
			});
			if (result.isConfirmed) {
				try {
					localStorage.removeItem('user');

					router.push('/');
				} catch (error) {
					console.error('Error during handleUpload: ', error);
					alert('An error occurred during file upload. Please try again later.');
				}
			}
		} catch (error) {
			console.error('Error deleting document: ', error);
			Swal.fire('Error', 'Failed to Log out user.', 'error');
		}
	};
	return (
		<Aside>
			<AsideHead>
				{/* <img src={logo}style={{width:"50%"}} hidden={!asideStatus}/>  */}
				<Brand asideStatus={asideStatus} setAsideStatus={setAsideStatus} />
			</AsideHead>
			<AsideBody>
				{/* Navigation menu for 'My Pages' */}
				<Navigation menu={addminPagesMenu} id='aside-dashboard' />

			</AsideBody>
			<AsideFoot>
				{/* <div onClick={() => { localStorage.removeItem('token') }}>
					<Navigation menu={logoutmenu} id='aside-dashboard' />

				</div> */}
				<Button
					icon='Logout'
					className='w-100'
					color='dark'
					size='lg'
					tag='button'
					onClick={handleLogout}>
						
					</Button>
			</AsideFoot>
		</Aside>
	);
};

// Static props for server-side translations
export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		// @ts-ignore
		...(await serverSideTranslations(locale, ['common', 'menu'])),
	},
});

export default DefaultAside;
