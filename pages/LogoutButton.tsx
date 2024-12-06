// LogoutButton.tsx
import React from 'react';
//import { Button } from '../components/bootstrap/Button';
import { useRouter } from 'next/router';
import Button from '../components/bootstrap/Button';

interface LogoutButtonProps {
  onLogout: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  const router = useRouter();

  const handleLogout = () => {
    // Clear user information from session
    localStorage.removeItem('user');

    // Optional: Perform any additional logout logic, e.g., sign out from Firebase
    // auth.signOut();

    // Update user context or perform other necessary actions
    onLogout();

    // Redirect to the login page or any other desired page
    router.push('/');
  };

  return (
    <div className='text-center mt-3'>
      {/* <Button color='danger' onClick={handleLogout}>
        Logout
      </Button> */}
      <Button
				icon="Logout"
				className="w-100"
				color="dark"
				size="sm"
				tag="button"
				onClick={handleLogout} 
				
			>
			
			</Button>
    </div>
  );
};

export default LogoutButton;
