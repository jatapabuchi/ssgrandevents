async function loadEvents() {
    // Public page - no events display needed for corporate site
    const eventsList = document.getElementById('events-list');
    if (eventsList) {
        eventsList.innerHTML = '<p>Contact us for upcoming corporate events and training programs</p>';
    }
}
