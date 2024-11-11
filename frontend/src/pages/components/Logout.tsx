import React from 'react';
import { FiLogOut } from 'react-icons/fi'; // Using `react-icons` for LogOut icon

// Import Button component from a library or your custom component
import Button from './Button'; // Adjust path based on your project structure

// Define the component props type
interface LogoutProps {
  onLogout: () => void;
}

export default function Logout({ onLogout }: LogoutProps) {
  return (

          <Button onClick={onLogout} className="flex items-center">
            <FiLogOut className="mr-2 h-4 w-4" /> 
            Log out
          </Button> 
      
   
  );
}
