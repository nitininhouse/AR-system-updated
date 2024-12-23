import React from 'react';

const OngoingAssignments = ({ assignments }) => {
    return (
        <div>
            {assignments.map((assignment) => (
                <div key={assignment.id}>
                    <h3>{assignment.title}</h3>
                    <p>{assignment.description}</p>
                    {/* Add other assignment details here */}
                </div>
            ))}
        </div>
    );
};

const CompletedAssignments = ({ assignments }) => {
    return (
        <div>
            {assignments.map((assignment) => (
                <div key={assignment.id}>
                    <h3>{assignment.title}</h3>
                    <p>{assignment.description}</p>
                    {/* Add other assignment details here */}
                </div>
            ))}
        </div>
    );
};

export { OngoingAssignments, CompletedAssignments };
