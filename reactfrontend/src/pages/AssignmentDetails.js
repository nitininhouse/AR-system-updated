import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';


const AssignmentDetails = () => {
    const { id } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [reviewers, setReviewers] = useState([]);
    const [attachment, setAttachment] = useState("");
    const [comments, setComments] = useState("");
    const [reviewComments, setReviewComments] = useState([]);
    const [error, setError] = useState("");
    const [finalStatus, setFinalStatus] = useState("Pending");

    useEffect(() => {
        const fetchAssignmentDetails = async () => { 
            try {
                const assignmentResponse = await fetch(`http://127.0.0.1:8000/assignments/${id}/`);
                if (!assignmentResponse.ok) throw new Error("Failed to fetch assignment details");
                       
                const assignmentData = await assignmentResponse.json();
                setAssignment(assignmentData);

                const reviewersResponse = await fetch(`http://127.0.0.1:8000/assignments/${id}/reviewers/`);
                if (!reviewersResponse.ok) throw new Error("Failed to fetch reviewers");

                const reviewersData = await reviewersResponse.json();
                setReviewers(reviewersData);

                const reviewsResponse = await fetch(`http://127.0.0.1:8000/assignments/${id}/reviews/`);
                if (!reviewsResponse.ok) throw new Error("Failed to fetch review comments");

                const reviewsData = await reviewsResponse.json();
                setReviewComments(reviewsData);

                const latestReview = reviewsData.reduce((latest, review) =>
                    review.id > latest.id ? review : latest, { id: -1, status: "Pending" }
                );
                setFinalStatus(latestReview.status);
            } catch (err) {
                console.error(err);
                setError("An error occurred while loading the assignment details.");
            }
        };

        fetchAssignmentDetails();
    }, [id]);

    const handleFileDownload = () => {
        if (assignment && assignment.file) {
            const link = document.createElement('a');
            link.href = assignment.file;
            link.download = assignment.file.split('/').pop();
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            setError("File not available for download.");
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/assignments/${id}/submissions/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify({
                    attachment,
                    comments,
                }),
            });

            if (!response.ok) throw new Error("Failed to submit the assignment.");
            
            alert("Assignment submitted successfully!");
            setAttachment("");
            setComments("");
        } catch (err) {
            console.error(err);
            setError("An error occurred while submitting the assignment.");
        }
    };

    if (error) return <div className="text-red-500">{error}</div>;
    if (!assignment) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <h1 className="text-2xl font-bold text-blue-600 mb-6">{assignment.title}</h1>
            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 w-full max-w-lg">
                
                {/* Final Status */}
                

<div className={`flex items-center justify-center p-4 rounded-lg shadow-md 
    ${finalStatus === "Pending" ? 'bg-red-100 border border-red-400 text-red-800' : 'bg-green-100 border border-green-400 text-green-800'}`}>
    <div className="text-center">
        <h2 className="text-xl font-bold mb-1">
            Final Status: {finalStatus}
        </h2>
        
    </div>
</div>


                <p><strong>Description:</strong> {assignment.description}</p>
                <p><strong>Due Date:</strong> {assignment.due_date}</p>
                <p><strong>Created By:</strong> {assignment.created_by || "N/A"}</p>

                <h2 className="text-lg font-semibold mt-4">Reviewers:</h2>
                <ul className="list-disc pl-5">
                    {reviewers.map((reviewer) => (
                        <li key={reviewer.id}>{reviewer.email}</li>
                    ))}
                </ul>

                {assignment.file && (
                    <div className="mt-4">
                        <strong>File:</strong>{" "}
                        <button onClick={handleFileDownload} className="text-blue-500 underline">
                            Download File
                        </button>
                    </div>
                )}

                {/* Submission Form */}
                <div className="mt-6">
                    <label className="block mb-2 font-semibold">Attachment Link:</label>
                    <input
                        type="url"
                        value={attachment}
                        onChange={(e) => setAttachment(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md mb-4"
                        placeholder="Enter assignment link"
                        required
                    />

                    <label className="block mb-2 font-semibold">Comments:</label>
                    <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md mb-4"
                        placeholder="Enter any comments"
                    />

                    <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-md">
                        Submit Assignment
                    </button>
                </div>

                {/* Review Comments */}
                <h2 className="text-lg font-semibold mt-6">Review Comments:</h2>
                <ul className="list-disc pl-5 mt-2">
                    {reviewComments.length > 0 ? (
                        reviewComments.map((review) => (
                            <li 
                                key={review.id} 
                                className={`mb-4 p-4 rounded-md shadow-sm ${review.status === 'Pending' ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}
                            >
                                <p><strong>Iteration:</strong> {review.iteration_number}</p>
                                <p><strong>Status:</strong> {review.status}</p>
                                <p><strong>Comments:</strong> {review.comments || "No comments"}</p>
                                
                            </li>
                        ))
                    ) : (
                        <p className="text-lg">No review comments available.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default AssignmentDetails;
