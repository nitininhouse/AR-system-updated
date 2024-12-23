import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log("Attempting to login with:", { username, password });
  
     
      const tokenResponse = await axios.post('http://127.0.0.1:8000/api/token/', {
        username,
        password,
      });
  
      console.log("Login successful, token response:", tokenResponse.data);
  
      // Store tokens in localStorage
      localStorage.setItem('access_token', tokenResponse.data.access);
      localStorage.setItem('refresh_token', tokenResponse.data.refresh);
  
      // Step 2: Fetch user details from /users/
      const userResponse = await axios.get('http://127.0.0.1:8000/users/', {
        headers: { Authorization: `Bearer ${tokenResponse.data.access}` },
      });
  
      console.log("Fetched user details:", userResponse.data);
  
      
      const currentUser = userResponse.data.find(user => user.username === username);
      if (!currentUser) {
        throw new Error('User not found in the user list');
      }
  
      const userId = currentUser.id;
  
     
      const userRoleResponse = await axios.get(`http://127.0.0.1:8000/userrole/${userId-7}/`, {
        headers: { Authorization: `Bearer ${tokenResponse.data.access}` },
      });
  
      console.log("Fetched user role:", userRoleResponse.data);
  
     
      const userRole = userRoleResponse.data.role; 
      localStorage.setItem('user_role', String(userRole));
  
    
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed', error.response?.data || error.message);
    }
  };
  
  
  
  

  const handleGoogleLogin = (response) => {
    if (response && response.tokenId) {
        fetch('http://127.0.0.1:8000/api/google-login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: response.tokenId }), 
        })
        .then((res) => {
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        })
        .then((data) => {
            console.log('Login success:', data);
           
        })
        .catch((error) => {
            console.error('Google login failed', error);
        });
    } else {
        console.error('Google login failed: No token received');
    }
};



  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-semibold text-center mb-6">Login</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Login
          </button>
        </form>
        <GoogleOAuthProvider clientId='340686318598-c8kpdafjh60iadrusbauhl205cgrfkam.apps.googleusercontent.com'>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={(error) => console.error('Login failed', error)}
          />
        </GoogleOAuthProvider>
        <p className="text-center mt-4">
          Don’t have an account?{' '}
          <a href="/register" className="text-blue-500 hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
