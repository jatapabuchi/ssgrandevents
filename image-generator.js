// Generate placeholder images as data URLs
function generatePlaceholderImage(title, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 400, 300);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, adjustColor(color, -30));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 300);
    
    // Icon/Text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📸', 200, 120);
    
    // Title
    ctx.font = 'bold 24px Arial';
    ctx.fillText(title, 200, 220);
    
    return canvas.toDataURL('image/png');
}

function adjustColor(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 +
        (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255))
        .toString(16).slice(1);
}

// Image configurations
const images = {
    'venue.jpg': { title: 'SS Grand Events Venue', color: '#667eea' },
    'corporate-events.jpg': { title: 'Corporate Events', color: '#3498db' },
    'vacation-planning.jpg': { title: 'Vacation Planning', color: '#2ecc71' },
    'room-booking.jpg': { title: 'Room Booking', color: '#e74c3c' },
    'residential-events.jpg': { title: 'Residential Events', color: '#f39c12' },
    'vendor-coordination.jpg': { title: 'Vendor Coordination', color: '#9b59b6' },
    'team-outing.jpg': { title: 'Team Outing & Budget', color: '#1abc9c' }
};

// Generate and set images on page load
document.addEventListener('DOMContentLoaded', function() {
    Object.keys(images).forEach(filename => {
        const config = images[filename];
        const dataUrl = generatePlaceholderImage(config.title, config.color);
        
        // Set all img tags with matching src
        const imgs = document.querySelectorAll(`img[src="${filename}"]`);
        imgs.forEach(img => {
            img.src = dataUrl;
        });
    });
});
