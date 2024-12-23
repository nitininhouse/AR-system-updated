import React, { useState } from 'react';
import { Calendar, Users, FileText, Upload, X, Briefcase } from 'lucide-react';
import { jwtDecode } from "jwt-decode";



const AssignmentForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    team_name: '', 
    members: [],
    reviewers: [],
    file: null,
  });
  const [memberEmail, setMemberEmail] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Retrieve the token from local storage
  const getToken = () => localStorage.getItem('access_token');

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const token = getToken();
  
    // Ensure the due_date is in the correct format (YYYY-MM-DD)
    const dueDateFormatted = new Date(formData.due_date);

    const dueDate = dueDateFormatted.toISOString().split('T')[0]; // Format to YYYY-MM-DD
  
    // Team data to be sent to the /teams endpoint
    const teamData = {
      team_name: formData.team_name,
      members: formData.members,
    };
  
    try {
      // Send POST request to /teams with token authorization
      const teamResponse = await fetch('http://127.0.0.1:8000/teams/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(teamData),
      });
  
      if (!teamResponse.ok) {
        throw new Error('Error creating team');
      }
  
      const teamResult = await teamResponse.json();
      const teamId = teamResult.id; // Get the created team ID
  
      // Prepare assignment data to send to the /assignments endpoint
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('due_date', dueDate); // Use the formatted date
      formDataToSend.append('team', teamId);
      
      // Append each reviewer separately
      formData.reviewers.forEach(reviewer => {
        formDataToSend.append('reviewers', reviewer);
      });
  
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }
  
      // Send POST request to /assignments with token authorization
      const assignmentResponse = await fetch('http://127.0.0.1:8000/assignments/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });
  
      if (assignmentResponse.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        setFormData({
          title: '',
          description: '',
          due_date: '',
          team_name: '',
          members: [],
          reviewers: [],
          file: null,
        });
      } else {
        const errorData = await assignmentResponse.json();
        console.error('Assignment creation error:', errorData); // Log the error response for debugging
        throw new Error('Error creating assignment');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  // Helper functions for handling members, reviewers, and file changes
  const addMember = () => {
    if (memberEmail && !formData.members.includes(memberEmail)) {
      setFormData({
        ...formData,
        members: [...formData.members, memberEmail],
      });
      setMemberEmail('');
    }
  };

  const removeMember = (emailToRemove) => {
    setFormData({
      ...formData,
      members: formData.members.filter((email) => email !== emailToRemove),
    });
  };

  const addReviewer = () => {
    if (reviewerEmail && !formData.reviewers.includes(reviewerEmail)) {
      setFormData({
        ...formData,
        reviewers: [...formData.reviewers, reviewerEmail],
      });
      setReviewerEmail('');
    }
  };

  const removeReviewer = (emailToRemove) => {
    setFormData({
      ...formData,
      reviewers: formData.reviewers.filter((email) => email !== emailToRemove),
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      file: file,
    });
  };

  const removeFile = () => {
    setFormData({
      ...formData,
      file: null,
    });
  };


  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-8">Create New Assignment</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Assignment Title
              </label>
              <input
                type="text"
                placeholder="Enter assignment title"
                value={formData.title}  
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              /> 
            </div>

            {/* Team Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Team Name
              </label>
              <input
                type="text"
                placeholder="Enter team name"
                value={formData.team_name}
                onChange={(e) => setFormData({...formData, team_name: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                placeholder="Enter assignment description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                required
              />
            </div>

            {/* Due Date Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Members Section */}
            <div className="space-y-4">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Members
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter member email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="button" 
                  onClick={addMember}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Add Member
                </button>
              </div>

              <div className="space-y-2">
                {formData.members.map((email, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <span className="text-sm">{email}</span>
                    <button
                      type="button"
                      onClick={() => removeMember(email)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviewers Section */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Reviewers</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter reviewer email"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="button" 
                  onClick={addReviewer}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Add Reviewer
                </button>
              </div>

              <div className="space-y-2">
                {formData.reviewers.map((email, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <span className="text-sm">{email}</span>
                    <button
                      type="button"
                      onClick={() => removeReviewer(email)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload File
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
              {formData.file && (
                <div className="flex items-center mt-2">
                  <span className="text-sm">{formData.file.name}</span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create Assignment
            </button>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 text-green-700 p-4 rounded-md">
                Assignment created successfully!
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignmentForm;
