import React, { useState } from 'react';
import axios from 'axios';

const CreateAssignment = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [teamName, setTeamName] = useState('');
    const [teamMembersUsernames, setTeamMembersUsernames] = useState(['']);  // List of team member usernames
    const [dueDate, setDueDate] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');

    // Handle form submission for assignment creation
    const handleCreateAssignment = async () => {
        try {
            // Step 1: Create team by sending POST request
            const teamResponse = await axios.post('http://127.0.0.1:8000/teams/', {
                team_name: teamName,
                members: teamMembersUsernames,  // List of team members' usernames
            });

            const teamId = teamResponse.data.id;  // Get the created team ID

            // Step 2: Create assignment
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('team', teamId);  // Use team ID
            formData.append('due_date', dueDate);
            if (file) formData.append('file', file);

            // Optional: Include reviewer details if needed
            const reviewers = teamMembersUsernames.map(username => ({
                username: username,  // Assuming you want to store usernames in assignment
            }));

            formData.append('reviewers', JSON.stringify(reviewers));  // Send reviewers as JSON

            await axios.post('http://127.0.0.1:8000/assignments/', formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            alert('Assignment created successfully!');
        } catch (error) {
            setError('Failed to create assignment. Please check the inputs.');
            console.error('Error creating assignment:', error);
        }
    };

    // UI with Tailwind CSS for a clean layout
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Create New Assignment</h2>

            {/* Assignment Form */}
            <div className="mb-4">
                <label className="block font-medium mb-2">Title</label>
                <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter assignment title"
                />
            </div>

            <div className="mb-4">
                <label className="block font-medium mb-2">Description</label>
                <textarea
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter assignment description"
                />
            </div>

            <div className="mb-4">
                <label className="block font-medium mb-2">Team Name</label>
                <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team name"
                />
            </div>

            <div className="mb-4">
                <label className="block font-medium mb-2">Team Members (Usernames)</label>
                {teamMembersUsernames.map((username, index) => (
                    <div key={index} className="flex space-x-2">
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            value={username}
                            onChange={(e) => {
                                const newTeamMembers = [...teamMembersUsernames];
                                newTeamMembers[index] = e.target.value;
                                setTeamMembersUsernames(newTeamMembers);
                            }}
                            placeholder="Enter team member username"
                        />
                        <button
                            className="bg-red-500 text-white px-2 py-1 rounded-lg"
                            onClick={() => {
                                const newTeamMembers = teamMembersUsernames.filter((_, idx) => idx !== index);
                                setTeamMembersUsernames(newTeamMembers);
                            }}
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <button
                    className="bg-blue-500 text-white px-2 py-1 mt-2 rounded-lg"
                    onClick={() => setTeamMembersUsernames([...teamMembersUsernames, ''])}
                >
                    Add Member
                </button>
            </div>

            <div className="mb-4">
                <label className="block font-medium mb-2">Due Date</label>
                <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label className="block font-medium mb-2">Upload File (Optional)</label>
                <input
                    type="file"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    onChange={(e) => setFile(e.target.files[0])}
                />
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg"
                onClick={handleCreateAssignment}
            >
                Create Assignment
            </button>
        </div>
    );
};

export default CreateAssignment;
