import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RevieweeDashboard from './RevieweeDashboard';

import Welcome from './Welcome';


const Dashboard = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');

    console.log("Fetched token:", token);
    console.log("Fetched user role:", userRole);

    if (!token) {
      navigate('/login');  // Redirect to login if not authenticated
    } else {
      setRole(userRole);  // Set user role from local storage
    }
  }, [navigate]);

  if (role === '1') {
    return <RevieweeDashboard />;
  } else if (role === '2') {
    return <Welcome/>;
  } else {
    return <p>Loading...</p>;
  }
};

export default Dashboard;
