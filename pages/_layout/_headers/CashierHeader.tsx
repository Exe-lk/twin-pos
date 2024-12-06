import React from 'react';
import Header, { HeaderLeft } from '../../../layout/Header/Header';
import Navigation from '../../../layout/Navigation/Navigation';
import {addminPagesMenu } from '../../../menu';
import useDeviceScreen from '../../../hooks/useDeviceScreen';
import CommonHeaderRight from './CommonHeaderRight';
import Button from '../../../components/bootstrap/Button';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';


const MyDefaultHeader = () => {
	const deviceScreen = useDeviceScreen();
    const router = useRouter();

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
		<Header>
			<HeaderLeft>
				{/* <Navigation
					menu={{ ...addminPagesMenu}}
					id='header-top-menu'
					horizontal={
						!!deviceScreen?.width &&
						deviceScreen.width >= Number(process.env.NEXT_PUBLIC_MOBILE_BREAKPOINT_SIZE)
					}
				/> */}
                <Button
					icon='Logout'
					className=''
					color='dark'
					size='sm'
					tag='button'
					onClick={handleLogout}>
						Logout
					</Button>
			</HeaderLeft>
			<CommonHeaderRight />
		</Header>
	);
};

export default MyDefaultHeader;
