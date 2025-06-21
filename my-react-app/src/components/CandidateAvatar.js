import React, { useState } from 'react';
import PartyIcon from './PartyIcon';

const CandidateAvatar = ({ candidate, size = 80, className = "" }) => {
    const [imageError, setImageError] = useState(false);

    // If candidate has an image URL and no error occurred, show the image
    if (candidate.image && candidate.image.trim() !== "" && !imageError) {
        return (
            <img
                src={candidate.image}
                alt={candidate.name}
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #eee',
                    transition: 'all 0.3s ease'
                }}
                className={className}
                onError={() => setImageError(true)}
            />
        );
    }

    // Fallback to party icon if no image or image failed to load
    return (
        <PartyIcon 
            party={candidate.party} 
            size={size}
            className={className}
        />
    );
};

export default CandidateAvatar; 