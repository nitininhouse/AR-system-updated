import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('reviewee'); 
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
  
    try {
      const userResponse = await axios.post('http://127.0.0.1:8000/register/', { 
        username,
        email,
        password,
      });
      console.log(userResponse.data);
  
      const userId = userResponse.data.id;  
      const roleId = role === 'reviewee' ? 1 : 2;  
  
      
      await axios.post('http://127.0.0.1:8000/userrole/', {
        user: userId,  
        role: roleId,  
      });
  
      navigate('/login');
    } catch (error) {
      if (error.response) {
        console.error('Registration failed:', error.response.data);
      } else {
        console.error('Registration failed:', error.message);
      }
    }
};

  

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-semibold text-center mb-6">Register</h1>
        <form onSubmit={handleRegister}>
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
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <div className="mb-4">
            <label className="block text-gray-700">Register as:</label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="reviewee">Reviewee</option>
              <option value="reviewer">Reviewer</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Register
          </button>
        </form>
        <p className="text-center mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-blue-500 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage; 
