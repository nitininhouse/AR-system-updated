import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const Welcome = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [assignments, setAssignments] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const getToken = () => localStorage.getItem('access_token');

    useEffect(() => {
        const token = getToken();

        if (token) {
            const decodedToken = jwtDecode(token);
            const memberId = decodedToken.user_id;

            fetch(`http://127.0.0.1:8000/members/${memberId}/assignments/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch assignments");
                }
                return response.json();
            })
            .then((data) => {
                setAssignments(data);
            })
            .catch((error) => {
                console.error("Error fetching assignments:", error);
                setError("Could not load assignments.");
            });
        }
    }, []);

    const filteredAssignments = assignments.filter(assignment =>
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCardClick = (id) => {
        navigate(`/assignments/${id}`);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center">
            <header className="w-full bg-blue-600 text-white flex justify-between items-center p-4">
                <h1 className="text-2xl font-semibold">Hello, Welcome!</h1>
                <div className="flex items-center space-x-2 cursor-pointer">
                    <span className="text-sm">Profile</span>
                    <img 
                        src="https://via.placeholder.com/32" 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full" 
                    />
                </div>
            </header>

            <div className="w-full flex justify-center mt-6">
                <input 
                    type="text" 
                    placeholder="Search assignments..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-80 p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <main className="flex-grow flex flex-col items-center justify-center space-y-6 mt-6">
                {filteredAssignments.map((assignment) => (
                    <div 
                        key={assignment.id} 
                        className="w-80 bg-white shadow-md rounded-lg p-6 border border-gray-200 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCardClick(assignment.id)}
                    >
                        <h2 className="text-xl font-semibold text-gray-800">{assignment.title}</h2>
                        <p className="text-gray-500">Due Date: {assignment.due_date}</p>
                    </div>
                ))}
                {filteredAssignments.length === 0 && !error && (
                    <p className="text-gray-500 mt-4">No assignments found</p>
                )}
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </main>
        </div>
    );
};

export default Welcome;
