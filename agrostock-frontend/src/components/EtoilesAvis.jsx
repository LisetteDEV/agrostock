import React from 'react';

const EtoilesAvis = ({ rating, count }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="d-flex align-items-center gap-1">
            <div className="text-warning d-flex">
                {[...Array(fullStars)].map((_, i) => <span key={`f-${i}`}>*</span>)}
                {hasHalfStar && <span>1/2</span>}
                {[...Array(emptyStars)].map((_, i) => <span key={`e-${i}`} className="text-muted opacity-50">*</span>)}
            </div>
            {count !== undefined && <span className="text-muted small ms-1">({count})</span>}
        </div>
    );
};

export default EtoilesAvis;
