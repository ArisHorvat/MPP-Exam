import React from 'react';

const PartyIcon = ({ party, size = 80, className = "" }) => {
    // Define party colors
    const partyColors = {
        'Democratic Party': '#4CAF50',
        'Republican Party': '#2196F3', 
        'Independent': '#FF9800',
        'Green Party': '#9C27B0',
        'Libertarian Party': '#F44336',
        'default': '#667eea'
    };

    // Get party initials (first letter of each word)
    const getPartyInitials = (partyName) => {
        return partyName.split(' ').map(word => word[0]).join('');
    };

    // Get color for party
    const getPartyColor = (partyName) => {
        return partyColors[partyName] || partyColors.default;
    };

    const initials = getPartyInitials(party);
    const color = getPartyColor(party);

    const iconStyle = {
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: size * 0.3,
        fontWeight: 'bold',
        fontFamily: 'Arial, sans-serif',
        border: '3px solid #eee',
        transition: 'all 0.3s ease'
    };

    return (
        <div style={iconStyle} className={className}>
            {initials}
        </div>
    );
};

export default PartyIcon; 