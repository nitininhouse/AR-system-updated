import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AssignmentDetailsnew = () => {
    const { id } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [reviewers, setReviewers] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [iterationNumber, setIterationNumber] = useState('');
    const [commentText, setCommentText] = useState('');
    const [status, setStatus] = useState('Pending');
    const [error, setError] = useState("");

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

                const submissionsResponse = await fetch(`http://127.0.0.1:8000/assignments/${id}/submissions/`);
                if (!submissionsResponse.ok) throw new Error("Failed to fetch submissions");

                const submissionsData = await submissionsResponse.json();
                setSubmissions(submissionsData);

                const reviewsResponse = await fetch(`http://127.0.0.1:8000/assignments/${id}/reviews/`);
                if (!reviewsResponse.ok) throw new Error("Failed to fetch reviews");

                const reviewsData = await reviewsResponse.json();
                setReviews(reviewsData);
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

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        if (!token) {
            setError("User is not authenticated.");
            return;
        }

        const decodedToken = jwtDecode(token);
        const reviewerId = decodedToken.user_id;

        const reviewData = {
            assignment: id,
            reviewer: reviewerId,
            iteration_number: iterationNumber,
            comments: commentText,
            status: status.toLowerCase() 
        };

        const response = await fetch(`http://127.0.0.1:8000/assignments/${id}/reviews/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reviewData)
        });

        if (response.ok) {
            const newReview = await response.json();
            setReviews([...reviews, newReview]); // Update reviews
            setIterationNumber('');
            setCommentText('');
            setStatus('Pending');
        } else {
            const errorData = await response.json();
            console.error("Submission Error:", errorData);
            setError("Failed to submit review.");
        }
    };

    // Calculate final status
    const getFinalStatus = () => {
        if (reviews.length === 0) return "Pending"; // Default status if no reviews
        const lastReview = reviews[reviews.length - 1]; // Get last review
        return lastReview.status.charAt(0).toUpperCase() + lastReview.status.slice(1); // Capitalize first letter
    };

    if (error) return <div className="text-red-500 text-center">{error}</div>;
    if (!assignment) return <div className="text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200 w-full max-w-2xl">
                <h1 className="text-3xl font-bold text-blue-700 mb-4 text-center">{assignment.title}</h1>
                

<div className={`flex items-center justify-center p-4 rounded-lg shadow-md 
    ${getFinalStatus() === "Pending" ? 'bg-red-100 border border-red-400 text-red-800' : 'bg-green-100 border border-green-400 text-green-800'}`}>
    <div className="text-center">
        <h2 className="text-xl font-bold mb-1">
            Final Status: {getFinalStatus()}
        </h2>
        <p className="text-sm">
            {getFinalStatus() === "Pending" ? 'Awaiting review.' : 'All reviews completed!'}
        </p>
    </div>
</div>

                <div className="mb-4">
                    <p className="text-lg"><strong>Description:</strong> {assignment.description}</p>
                    <p className="text-lg"><strong>Due Date:</strong> {assignment.due_date}</p>
                    <p className="text-lg"><strong>Created By:</strong> {assignment.created_by || "N/A"}</p>
                </div>

                <h2 className="text-2xl font-semibold mt-6 mb-2 text-blue-600">Reviewers:</h2>
                <ul className="list-disc pl-5 mb-4">
                    {reviewers.map((reviewer) => (
                        <li key={reviewer.id} className="text-lg text-gray-800">{reviewer.email}</li>
                    ))}
                </ul>

                {assignment.file && (
                    <div className="mt-4">
                        <strong>File:</strong>{" "}
                        <button
                            onClick={handleFileDownload}
                            className="text-blue-600 underline hover:text-blue-800"
                        >
                            Download File
                        </button>
                    </div>
                )}

                {/* Final Status Display */}
                

                


                {/* Display Submissions */}
                <h2 className="text-2xl font-semibold mt-6 mb-2 text-blue-600">Submissions:</h2>
                <ul className="list-disc pl-5">
                    {submissions.length > 0 ? (
                        submissions.map((submission) => (
                            <li key={submission.id} className="mb-4 p-4 bg-blue-50 rounded-lg shadow-sm">
                                <p className="text-lg"><strong>Submitted By:</strong> {submission.submitted_by_email}</p>
                                <p className="text-lg"><strong>Attachment:</strong> 
                                    <a href={submission.attachment} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">{submission.attachment}</a>
                                </p>
                                <p className="text-lg"><strong>Comment:</strong> {submission.comments || "No comments"}</p>
                            </li>
                        ))
                    ) : (
                        <p className="text-lg">No submissions found.</p>
                    )}
                </ul>

                {/* Review Form */}
                <form onSubmit={handleReviewSubmit} className="mt-6">
                    <h2 className="text-xl font-semibold text-blue-600 mb-2">Submit Review:</h2>
                    <label className="block mb-2">
                        Iteration Number:
                        <input
                            type="number"
                            value={iterationNumber}
                            onChange={(e) => setIterationNumber(e.target.value)}
                            required
                            className="block w-full border border-gray-300 rounded-lg p-2"
                        />
                    </label>
                    <label className="block mb-2">
                        Comments:
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            required
                            className="block w-full border border-gray-300 rounded-lg p-2"
                        />
                    </label>
                    <label className="block mb-2">
                        Status:
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="block w-full border border-gray-300 rounded-lg p-2"
                        >
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </label>
                    <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">Submit</button>
                </form>

                {/* Display Reviews */}
                <h2 className="text-2xl font-semibold mt-6 mb-2 text-blue-600">Reviews:</h2>
                <ul className="list-disc pl-5">
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <li key={review.id} className={`mb-4 p-4 rounded-lg shadow-sm ${review.status === 'completed' ? 'bg-green-100' : 'bg-red-100'}`}>
                                <p className="text-lg"><strong>Reviewer:</strong> {review.reviewer.email}</p>
                                <p className="text-lg"><strong>Iteration:</strong> {review.iteration_number}</p>
                                <p className="text-lg"><strong>Comments:</strong> {review.comments}</p>
                                <p className={`text-lg font-bold ${review.status === 'completed' ? 'text-green-500' : 'text-red-500'}`}>
                                    Status: {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                                </p>
                            </li>
                        ))
                    ) : (
                        <p className="text-lg">No reviews yet.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default AssignmentDetailsnew;
