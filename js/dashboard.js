const SESSION_TIMEOUT = 30 * 60 * 1000;
let activityTimer;
let allBookings = [];
let allHotels = [];
let filteredBookings = [];
let currentView = 'table';
let currentPage = 1;
let itemsPerPage = 25;
let selectedBookings = [];
let currentSort = { field: 'date', direction: 'asc' };
let currentCalendarDate = new Date();

function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function checkAuth() {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    const lastActivity = localStorage.getItem('lastActivity');
    
    if (!token) {
        redirectToLogin('Session expired. Please login again.');
        return;
    }
    
    if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
        redirectToLogin('Session expired. Please login again.');
        return;
    }
    
    if (lastActivity && Date.now() - parseInt(lastActivity) > SESSION_TIMEOUT) {
        redirectToLogin('Session expired due to inactivity.');
        return;
    }
    
    updateActivity();
    startActivityMonitor();
}

function updateActivity() {
    localStorage.setItem('lastActivity', Date.now());
}

function startActivityMonitor() {
    ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
        document.addEventListener(event, updateActivity, { once: false, passive: true });
    });
    
    activityTimer = setInterval(() => {
        const lastActivity = localStorage.getItem('lastActivity');
        if (Date.now() - parseInt(lastActivity) > SESSION_TIMEOUT) {
            clearInterval(activityTimer);
            redirectToLogin('Session expired due to inactivity.');
        }
    }, 60000);
}

function redirectToLogin(message) {
    localStorage.clear();
    alert(message);
    window.location.href = 'login.html';
}

checkAuth();

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tab + '-tab').classList.add('active');
    event.target.classList.add('active');
    
    if (tab === 'dashboard') loadDashboard();
    else if (tab === 'bookings') loadBookings();
    else if (tab === 'hotels') loadHotels();
    else if (tab === 'users') loadUsers();
}

// DASHBOARD
async function loadDashboard() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${CONFIG.API_URL}/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401) {
            redirectToLogin('Session expired. Please login again.');
            return;
        }
        
        const bookings = await response.json();
        const dateFrom = document.getElementById('dash-date-from').value;
        const dateTo = document.getElementById('dash-date-to').value;
        const hotelFilter = document.getElementById('dash-hotel-filter').value;
        const statusFilter = document.getElementById('dash-status-filter').value;
        
        let filtered = bookings.filter(b => {
            const bookingDate = new Date(b.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (bookingDate < today) return false;
            if (dateFrom && bookingDate < new Date(dateFrom)) return false;
            if (dateTo && bookingDate > new Date(dateTo)) return false;
            if (hotelFilter && b.hotelName !== hotelFilter) return false;
            if (statusFilter && b.status !== statusFilter) return false;
            
            return true;
        });
        
        const total = filtered.length;
        const confirmed = filtered.filter(b => b.status === 'confirmed').length;
        const pending = filtered.filter(b => b.status === 'pending').length;
        const revenue = filtered.reduce((sum, b) => sum + (parseFloat(b.amountPaid) || 0), 0);
        
        document.getElementById('dash-total').textContent = total;
        document.getElementById('dash-confirmed').textContent = confirmed;
        document.getElementById('dash-pending').textContent = pending;
        document.getElementById('dash-revenue').textContent = '₹' + revenue.toLocaleString();
        
        const tbody = document.getElementById('dashboard-tbody');
        tbody.innerHTML = filtered.map(b => `
            <tr>
                <td>${new Date(b.date).toLocaleDateString()}</td>
                <td>${esc(b.guestName)}</td>
                <td>${esc(b.hotelName) || '-'}</td>
                <td>${esc(b.pax) || '-'}</td>
                <td><span class="status-badge status-${esc(b.status)}">${esc(b.status)}</span></td>
                <td><span class="status-badge payment-${esc(b.paymentStatus)}">${esc(b.paymentStatus)}</span></td>
                <td>₹${esc(b.amountPaid) || 0}</td>
            </tr>
        `).join('');
        
        populateHotelFilter(bookings);
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function populateHotelFilter(bookings) {
    const hotels = [...new Set(bookings.map(b => b.hotelName).filter(h => h))];
    const select = document.getElementById('dash-hotel-filter');
    const current = select.value;
    select.innerHTML = '<option value="">All Hotels</option>' + 
        hotels.map(h => `<option value="${h}">${h}</option>`).join('');
    select.value = current;
}

// ADVANCED VIEW FUNCTIONS
function switchView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.view-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(view + '-view').classList.add('active');
    
    if (view === 'table') displayBookings(filteredBookings);
    else if (view === 'card') displayBookingsCards(filteredBookings);
    else if (view === 'calendar') displayCalendar();
}

function displayBookingsCards(bookings) {
    const container = document.getElementById('cards-container');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = itemsPerPage === 'all' ? bookings.length : startIndex + parseInt(itemsPerPage);
    const pageBookings = bookings.slice(startIndex, endIndex);
    
    container.innerHTML = pageBookings.map(b => `
        <div class="booking-card">
            <div class="card-header">
                <div class="card-title">${esc(b.guestName)}</div>
                <div class="card-date">${new Date(b.date).toLocaleDateString()}</div>
            </div>
            <div class="card-details">
                <div class="card-detail"><span>📞 Phone:</span><span>${esc(b.guestPhone) || '-'}</span></div>
                <div class="card-detail"><span>📍 Location:</span><span>${esc(b.guestLocation) || '-'}</span></div>
                <div class="card-detail"><span>🏨 Hotel:</span><span>${esc(b.hotelName) || '-'}</span></div>
                <div class="card-detail"><span>👥 Pax:</span><span>${esc(b.pax) || '-'}</span></div>
                <div class="card-detail"><span>📊 Status:</span><span class="status-badge status-${esc(b.status)}">${esc(b.status) || 'pending'}</span></div>
                <div class="card-detail"><span>💳 Payment:</span><span class="status-badge payment-${esc(b.paymentStatus)}">${esc(b.paymentStatus) || 'unpaid'}</span></div>
                <div class="card-detail"><span>💰 Amount:</span><span>₹${esc(b.amountPaid) || 0}</span></div>
            </div>
            <div class="card-actions">
                <button class="action-btn edit-btn" onclick='editBooking(${JSON.stringify(b)})'>Edit</button>
                <button class="action-btn delete-btn" onclick="deleteBooking('${esc(b.id)}')">Delete</button>
            </div>
        </div>
    `).join('');
    
    updatePagination('card-pagination', bookings.length);
}

function displayCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    document.getElementById('calendar-month').textContent = 
        new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid = document.getElementById('calendar-grid');
    
    let html = '';
    
    // Add day headers
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        html += `<div style="background:#f0f0f0;padding:0.5rem;font-weight:600;text-align:center;">${day}</div>`;
    });
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day other-month"></div>';
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isToday = date.toDateString() === new Date().toDateString();
        const dayBookings = filteredBookings.filter(b => 
            new Date(b.date).toDateString() === date.toDateString()
        );
        
        html += `
            <div class="calendar-day ${isToday ? 'today' : ''}">
                <div style="font-weight:600;margin-bottom:0.5rem;">${day}</div>
                ${dayBookings.map(b => `
                    <div class="calendar-event" onclick='editBooking(${JSON.stringify(b)})'>
                        ${esc(b.guestName)} - ${esc(b.hotelName) || 'No Hotel'}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    grid.innerHTML = html;
}

function previousMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    displayCalendar();
}

function nextMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    displayCalendar();
}

function updatePagination(containerId, totalItems) {
    if (itemsPerPage === 'all') return;
    
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const container = document.getElementById(containerId);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    if (currentPage > 1) {
        html += `<button class="page-btn" onclick="changePage(${currentPage - 1})">‹ Previous</button>`;
    }
    
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    
    if (currentPage < totalPages) {
        html += `<button class="page-btn" onclick="changePage(${currentPage + 1})">Next ›</button>`;
    }
    
    html += `<span style="margin-left:1rem;color:#666;">Page ${currentPage} of ${totalPages}</span>`;
    container.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    if (currentView === 'table') displayBookings(filteredBookings);
    else if (currentView === 'card') displayBookingsCards(filteredBookings);
}

function toggleSelectAll() {
    const selectAll = document.getElementById('select-all') || document.getElementById('header-checkbox');
    const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
    
    checkboxes.forEach(cb => {
        cb.checked = selectAll.checked;
        const bookingId = cb.getAttribute('data-booking-id');
        if (selectAll.checked) {
            if (!selectedBookings.includes(bookingId)) selectedBookings.push(bookingId);
        } else {
            selectedBookings = selectedBookings.filter(id => id !== bookingId);
        }
    });
    
    updateBulkActions();
}

function toggleBookingSelection(bookingId) {
    if (selectedBookings.includes(bookingId)) {
        selectedBookings = selectedBookings.filter(id => id !== bookingId);
    } else {
        selectedBookings.push(bookingId);
    }
    updateBulkActions();
}

function updateBulkActions() {
    const bulkActions = document.querySelector('.bulk-actions');
    if (selectedBookings.length > 0) {
        bulkActions.style.display = 'flex';
    } else {
        bulkActions.style.display = 'none';
    }
}

function executeBulkAction() {
    const action = document.getElementById('bulk-action').value;
    if (!action || selectedBookings.length === 0) return;
    
    if (action === 'delete') {
        if (confirm(`Delete ${selectedBookings.length} selected bookings?`)) {
            selectedBookings.forEach(id => deleteBooking(id, false));
            selectedBookings = [];
            loadBookings();
        }
    } else if (action === 'export') {
        exportSelectedBookings();
    } else {
        // Update status for selected bookings
        const newStatus = action === 'confirm' ? 'confirmed' : 'completed';
        selectedBookings.forEach(id => updateBookingStatus(id, newStatus));
        selectedBookings = [];
        loadBookings();
    }
    
    document.getElementById('bulk-action').value = '';
    updateBulkActions();
}

function sortTable(field) {
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = field;
        currentSort.direction = 'asc';
    }
    filterBookings();
}

function exportBookings() {
    const csv = generateCSV(filteredBookings);
    downloadCSV(csv, 'bookings-export.csv');
}

function exportSelectedBookings() {
    const selected = allBookings.filter(b => selectedBookings.includes(b.id));
    const csv = generateCSV(selected);
    downloadCSV(csv, 'selected-bookings.csv');
}

function generateCSV(bookings) {
    const headers = ['Date', 'Guest Name', 'Phone', 'Location', 'Hotel', 'Pax', 'Status', 'Payment Status', 'Amount Paid'];
    const rows = bookings.map(b => [
        b.date,
        b.guestName,
        b.guestPhone || '',
        b.guestLocation || '',
        b.hotelName || '',
        b.pax || '',
        b.status || '',
        b.paymentStatus || '',
        b.amountPaid || '0'
    ]);
    
    return [headers, ...rows].map(row => 
        row.map(field => `"${field}"`).join(',')
    ).join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function resetFilters() {
    document.getElementById('search-booking').value = '';
    document.getElementById('date-range-filter').value = 'current-upcoming';
    document.getElementById('status-filter').value = '';
    document.getElementById('payment-filter').value = '';
    document.getElementById('location-filter').value = '';
    document.getElementById('sort-filter').value = 'date-asc';
    document.getElementById('per-page').value = '25';
    
    currentSort = { field: 'date', direction: 'asc' };
    currentPage = 1;
    itemsPerPage = 25;
    
    filterBookings();
}

function saveView() {
    const viewConfig = {
        search: document.getElementById('search-booking').value,
        dateRange: document.getElementById('date-range-filter').value,
        status: document.getElementById('status-filter').value,
        payment: document.getElementById('payment-filter').value,
        location: document.getElementById('location-filter').value,
        sort: document.getElementById('sort-filter').value,
        perPage: document.getElementById('per-page').value,
        view: currentView
    };
    
    localStorage.setItem('savedBookingView', JSON.stringify(viewConfig));
    alert('View saved successfully!');
}

function loadSavedView() {
    const saved = localStorage.getItem('savedBookingView');
    if (saved) {
        const config = JSON.parse(saved);
        document.getElementById('search-booking').value = config.search || '';
        document.getElementById('date-range-filter').value = config.dateRange || 'current-upcoming';
        document.getElementById('status-filter').value = config.status || '';
        document.getElementById('payment-filter').value = config.payment || '';
        document.getElementById('location-filter').value = config.location || '';
        document.getElementById('sort-filter').value = config.sort || 'date-asc';
        document.getElementById('per-page').value = config.perPage || '25';
        
        if (config.view && config.view !== 'table') {
            switchView(config.view);
        }
    }
}
function showNewBookingForm() {
    document.getElementById('booking-form').style.display = 'block';
    document.getElementById('booking-form-title').textContent = 'New Booking';
    resetBookingForm();
    window.scrollTo(0, 0);
}

function cancelBookingForm() {
    document.getElementById('booking-form').style.display = 'none';
    resetBookingForm();
}

async function loadBookings() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${CONFIG.API_URL}/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401) {
            redirectToLogin('Session expired. Please login again.');
            return;
        }
        
        const bookings = await response.json();
        allBookings = bookings;
        
        // Populate location filter
        const locations = [...new Set(bookings.map(b => b.guestLocation).filter(l => l))];
        const locationSelect = document.getElementById('location-filter');
        locationSelect.innerHTML = '<option value="">All Locations</option>' + 
            locations.map(l => `<option value="${l}">${l}</option>`).join('');
        
        loadSavedView();
        filterBookings();
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

function displayBookings(bookings) {
    const tbody = document.getElementById('bookings-tbody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = itemsPerPage === 'all' ? bookings.length : startIndex + parseInt(itemsPerPage);
    const pageBookings = bookings.slice(startIndex, endIndex);
    
    tbody.innerHTML = pageBookings.map(b => `
        <tr>
            <td><input type="checkbox" data-booking-id="${esc(b.id)}" onchange="toggleBookingSelection('${esc(b.id)}')"></td>
            <td>${new Date(b.date).toLocaleDateString()}</td>
            <td>${esc(b.guestName)}</td>
            <td>${esc(b.guestPhone) || '-'}</td>
            <td>${esc(b.guestLocation) || '-'}</td>
            <td>${esc(b.hotelName) || '-'}</td>
            <td>${esc(b.pax) || '-'}</td>
            <td><span class="status-badge status-${esc(b.status)}">${esc(b.status) || 'pending'}</span></td>
            <td><span class="status-badge payment-${esc(b.paymentStatus)}">${esc(b.paymentStatus) || 'unpaid'}</span></td>
            <td>₹${(b.amountPaid || 0).toLocaleString()}</td>
            <td>
                <button class="action-btn edit-btn" onclick='editBooking(${JSON.stringify(b)})'>Edit</button>
                <button class="action-btn delete-btn" onclick="deleteBooking('${esc(b.id)}')">Delete</button>
            </td>
        </tr>
    `).join('');
    
    updatePagination('pagination', bookings.length);
    document.getElementById('results-count').textContent = `${bookings.length} bookings found`;
}

function filterBookings() {
    const search = document.getElementById('search-booking').value.toLowerCase();
    const dateRange = document.getElementById('date-range-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    const paymentFilter = document.getElementById('payment-filter').value;
    const locationFilter = document.getElementById('location-filter').value;
    const sortFilter = document.getElementById('sort-filter').value;
    itemsPerPage = document.getElementById('per-page').value;
    
    let filtered = allBookings.filter(b => {
        const matchSearch = b.guestName.toLowerCase().includes(search) || 
                          (b.guestPhone && b.guestPhone.includes(search)) ||
                          (b.hotelName && b.hotelName.toLowerCase().includes(search)) ||
                          (b.guestLocation && b.guestLocation.toLowerCase().includes(search));
        const matchStatus = !statusFilter || b.status === statusFilter;
        const matchPayment = !paymentFilter || b.paymentStatus === paymentFilter;
        const matchLocation = !locationFilter || b.guestLocation === locationFilter;
        
        // Date range filtering
        const bookingDate = new Date(b.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let matchDate = true;
        if (dateRange === 'current-upcoming') {
            matchDate = bookingDate >= today;
        } else if (dateRange === 'completed') {
            matchDate = b.status === 'completed';
        } else if (dateRange === 'this-month') {
            const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            matchDate = bookingDate >= thisMonth && bookingDate < nextMonth;
        } else if (dateRange === 'next-month') {
            const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            const monthAfter = new Date(today.getFullYear(), today.getMonth() + 2, 1);
            matchDate = bookingDate >= nextMonth && bookingDate < monthAfter;
        } else if (dateRange === 'custom') {
            const dateFrom = document.getElementById('date-from').value;
            const dateTo = document.getElementById('date-to').value;
            if (dateFrom) matchDate = matchDate && bookingDate >= new Date(dateFrom);
            if (dateTo) matchDate = matchDate && bookingDate <= new Date(dateTo);
        }
        
        return matchSearch && matchStatus && matchPayment && matchLocation && matchDate;
    });
    
    // Sorting
    const [sortField, sortDir] = sortFilter.split('-');
    filtered.sort((a, b) => {
        let aVal = a[sortField] || '';
        let bVal = b[sortField] || '';
        
        if (sortField === 'date') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        } else if (sortField === 'amountPaid') {
            aVal = parseFloat(aVal) || 0;
            bVal = parseFloat(bVal) || 0;
        } else {
            aVal = aVal.toString().toLowerCase();
            bVal = bVal.toString().toLowerCase();
        }
        
        if (sortDir === 'desc') {
            return aVal < bVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
    });
    
    filteredBookings = filtered;
    currentPage = 1;
    
    // Show/hide custom date range
    const customDate = document.querySelector('.custom-date');
    if (dateRange === 'custom') {
        customDate.style.display = 'block';
    } else {
        customDate.style.display = 'none';
    }
    
    if (currentView === 'table') displayBookings(filtered);
    else if (currentView === 'card') displayBookingsCards(filtered);
    else if (currentView === 'calendar') displayCalendar();
}

async function saveBooking() {
    // Validate mandatory fields
    const errors = [];
    const guestName = document.getElementById('guest-name').value.trim();
    const guestPhone = document.getElementById('guest-phone').value.trim();
    const guestLocation = document.getElementById('guest-location').value.trim();
    const date = document.getElementById('date').value;
    const status = document.getElementById('booking-status').value;
    
    // Clear previous errors
    document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-group input, .form-group select').forEach(el => el.classList.remove('error'));
    
    if (!guestName) {
        errors.push('Guest Name is required');
        document.getElementById('guest-name').classList.add('error');
    }
    
    if (!guestPhone) {
        errors.push('Phone number is required');
        document.getElementById('guest-phone').classList.add('error');
        document.getElementById('phone-error').textContent = 'Phone number is required';
        document.getElementById('phone-error').classList.add('show');
    } else if (!/^[0-9]{10}$/.test(guestPhone)) {
        errors.push('Phone number must be exactly 10 digits');
        document.getElementById('guest-phone').classList.add('error');
        document.getElementById('phone-error').textContent = 'Phone number must be exactly 10 digits';
        document.getElementById('phone-error').classList.add('show');
    }
    
    if (!guestLocation) {
        errors.push('Location is required');
        document.getElementById('guest-location').classList.add('error');
        document.getElementById('location-error').textContent = 'Location is required';
        document.getElementById('location-error').classList.add('show');
    }
    
    if (!date) {
        errors.push('Date is required');
        document.getElementById('date').classList.add('error');
    }
    
    if (!status) {
        errors.push('Status is required');
        document.getElementById('booking-status').classList.add('error');
        document.getElementById('status-error').textContent = 'Status is required';
        document.getElementById('status-error').classList.add('show');
    }
    
    if (errors.length > 0) {
        alert('Please fix the following errors:\n\n' + errors.join('\n'));
        return;
    }
    
    const token = localStorage.getItem('token');
    const bookingId = document.getElementById('booking-id').value;
    
    const booking = {
        guestName,
        guestPhone,
        guestLocation,
        guestAddress: document.getElementById('guest-address').value,
        date,
        hotelName: document.getElementById('hotel-name').value,
        pax: document.getElementById('pax').value,
        trainingName: document.getElementById('training-name').value,
        occup: document.getElementById('occup').value,
        hRate: document.getElementById('h-rate').value,
        gRate: document.getElementById('g-rate').value,
        day1Req: document.getElementById('day1-req').value,
        day2Req: document.getElementById('day2-req').value,
        ledWall: document.getElementById('led-wall').value,
        lcd: document.getElementById('lcd').value,
        audio: document.getElementById('audio').value,
        status,
        paymentStatus: document.getElementById('payment-status').value,
        amountPaid: document.getElementById('amount-paid').value
    };
    
    const method = bookingId ? 'PUT' : 'POST';
    const url = bookingId ? `${CONFIG.API_URL}/bookings/${bookingId}` : `${CONFIG.API_URL}/bookings`;
    
    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(booking)
        });
        
        if (response.ok) {
            cancelBookingForm();
            loadBookings();
            alert('Booking saved successfully');
        }
    } catch (error) {
        alert('Error saving booking');
    }
}

function editBooking(booking) {
    document.getElementById('booking-form').style.display = 'block';
    document.getElementById('booking-form-title').textContent = 'Edit Booking';
    document.getElementById('booking-id').value = booking.id;
    document.getElementById('guest-name').value = booking.guestName;
    document.getElementById('guest-phone').value = booking.guestPhone || '';
    document.getElementById('guest-location').value = booking.guestLocation || '';
    document.getElementById('guest-address').value = booking.guestAddress || '';
    document.getElementById('date').value = booking.date;
    document.getElementById('hotel-name').value = booking.hotelName || '';
    document.getElementById('pax').value = booking.pax || '';
    document.getElementById('training-name').value = booking.trainingName || '';
    document.getElementById('occup').value = booking.occup || '';
    document.getElementById('h-rate').value = booking.hRate || '';
    document.getElementById('g-rate').value = booking.gRate || '';
    document.getElementById('day1-req').value = booking.day1Req || '';
    document.getElementById('day2-req').value = booking.day2Req || '';
    document.getElementById('led-wall').value = booking.ledWall || '';
    document.getElementById('lcd').value = booking.lcd || '';
    document.getElementById('audio').value = booking.audio || '';
    document.getElementById('booking-status').value = booking.status || 'pending';
    document.getElementById('payment-status').value = booking.paymentStatus || 'unpaid';
    document.getElementById('amount-paid').value = booking.amountPaid || '';
    window.scrollTo(0, 0);
}

async function deleteBooking(id) {
    if (!confirm('Delete this booking?')) return;
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/bookings/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            loadBookings();
            alert('Booking deleted');
        }
    } catch (error) {
        alert('Error deleting booking');
    }
}

function resetBookingForm() {
    document.getElementById('booking-id').value = '';
    document.getElementById('guest-name').value = '';
    document.getElementById('guest-phone').value = '';
    document.getElementById('guest-location').value = '';
    document.getElementById('guest-address').value = '';
    document.getElementById('date').value = '';
    document.getElementById('hotel-name').value = '';
    document.getElementById('pax').value = '';
    document.getElementById('training-name').value = '';
    document.getElementById('occup').value = '';
    document.getElementById('h-rate').value = '';
    document.getElementById('g-rate').value = '';
    document.getElementById('day1-req').value = '';
    document.getElementById('day2-req').value = '';
    document.getElementById('led-wall').value = '';
    document.getElementById('lcd').value = '';
    document.getElementById('audio').value = '';
    document.getElementById('booking-status').value = '';
    document.getElementById('payment-status').value = 'unpaid';
    document.getElementById('amount-paid').value = '';
    
    // Clear errors
    document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-group input, .form-group select').forEach(el => el.classList.remove('error'));
}

// HOTELS
async function loadHotels() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${CONFIG.API_URL}/hotels`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401) {
            redirectToLogin('Session expired. Please login again.');
            return;
        }
        
        const hotels = await response.json();
        allHotels = hotels;
        const tbody = document.getElementById('hotels-tbody');
        
        tbody.innerHTML = hotels.map(h => `
            <tr>
                <td>${esc(h.hotelName)}</td>
                <td>${esc(h.buffetRate)}</td>
                <td>${esc(h.hiTea)}</td>
                <td>${esc(h.cpSingle)}</td>
                <td>${esc(h.totalRooms)}</td>
                <td>${esc(h.banquetCapacity)}</td>
                <td>
                    <button class="action-btn edit-btn" onclick='editHotel(${JSON.stringify(h)})'>Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteHotel('${esc(h.id)}')">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading hotels:', error);
    }
}

async function saveHotel() {
    const token = localStorage.getItem('token');
    const hotelId = document.getElementById('hotel-id').value;
    
    const hotel = {
        hotelName: document.getElementById('hotel-name-input').value,
        buffetRate: document.getElementById('buffet-rate').value,
        hiTea: document.getElementById('hi-tea').value,
        cpSingle: document.getElementById('cp-single').value,
        cpDouble: document.getElementById('cp-double').value,
        cpTriple: document.getElementById('cp-triple').value,
        apSingle: document.getElementById('ap-single').value,
        apDouble: document.getElementById('ap-double').value,
        apTriple: document.getElementById('ap-triple').value,
        sglApMeal: document.getElementById('sgl-ap-meal').value,
        dbleApMeal: document.getElementById('dble-ap-meal').value,
        tripApMeal: document.getElementById('trip-ap-meal').value,
        totalRooms: document.getElementById('total-rooms').value,
        banquetCapacity: document.getElementById('banquet-capacity').value
    };
    
    const method = hotelId ? 'PUT' : 'POST';
    const url = hotelId ? `${CONFIG.API_URL}/hotels/${hotelId}` : `${CONFIG.API_URL}/hotels`;
    
    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(hotel)
        });
        
        if (response.ok) {
            resetHotelForm();
            loadHotels();
            alert('Hotel saved successfully');
        }
    } catch (error) {
        alert('Error saving hotel');
    }
}

function editHotel(hotel) {
    document.getElementById('hotel-id').value = hotel.id;
    document.getElementById('hotel-name-input').value = hotel.hotelName;
    document.getElementById('buffet-rate').value = hotel.buffetRate;
    document.getElementById('hi-tea').value = hotel.hiTea;
    document.getElementById('cp-single').value = hotel.cpSingle;
    document.getElementById('cp-double').value = hotel.cpDouble;
    document.getElementById('cp-triple').value = hotel.cpTriple;
    document.getElementById('ap-single').value = hotel.apSingle;
    document.getElementById('ap-double').value = hotel.apDouble;
    document.getElementById('ap-triple').value = hotel.apTriple;
    document.getElementById('sgl-ap-meal').value = hotel.sglApMeal;
    document.getElementById('dble-ap-meal').value = hotel.dbleApMeal;
    document.getElementById('trip-ap-meal').value = hotel.tripApMeal;
    document.getElementById('total-rooms').value = hotel.totalRooms;
    document.getElementById('banquet-capacity').value = hotel.banquetCapacity;
}

async function deleteHotel(id) {
    if (!confirm('Delete this hotel?')) return;
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/hotels/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            loadHotels();
            alert('Hotel deleted');
        }
    } catch (error) {
        alert('Error deleting hotel');
    }
}

function resetHotelForm() {
    document.getElementById('hotel-id').value = '';
    document.getElementById('hotel-name-input').value = '';
    document.getElementById('buffet-rate').value = '';
    document.getElementById('hi-tea').value = '';
    document.getElementById('cp-single').value = '';
    document.getElementById('cp-double').value = '';
    document.getElementById('cp-triple').value = '';
    document.getElementById('ap-single').value = '';
    document.getElementById('ap-double').value = '';
    document.getElementById('ap-triple').value = '';
    document.getElementById('sgl-ap-meal').value = '';
    document.getElementById('dble-ap-meal').value = '';
    document.getElementById('trip-ap-meal').value = '';
    document.getElementById('total-rooms').value = '';
    document.getElementById('banquet-capacity').value = '';
}

// USERS
async function loadUsers() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${CONFIG.API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401) {
            redirectToLogin('Session expired. Please login again.');
            return;
        }
        
        const users = await response.json();
        const tbody = document.getElementById('users-tbody');
        
        tbody.innerHTML = users.map(u => `
            <tr>
                <td>${esc(u.email)}</td>
                <td>${esc(u.name)}</td>
                <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                <td>
                    ${u.email !== 'ssgrandevents@gmail.com' ? `<button class="action-btn delete-btn" onclick="deleteUser('${esc(u.email)}')">Delete</button>` : '<span style="color:#999">Protected</span>'}
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function createUser() {
    const email = document.getElementById('new-user-email').value;
    const name = document.getElementById('new-user-name').value;
    
    if (!email || !name) {
        alert('Email and name are required');
        return;
    }
    
    const token = localStorage.getItem('token');
    const currentUserEmail = localStorage.getItem('userEmail');
    
    try {
        await fetch(`${CONFIG.API_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentUserEmail })
        });
        
        const otp = prompt(`OTP sent to ${currentUserEmail}. Enter OTP to create user:`);
        if (!otp) return;
        
        const response = await fetch(`${CONFIG.API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email, name, otp })
        });
        
        if (response.ok) {
            alert('User created successfully');
            document.getElementById('new-user-email').value = '';
            document.getElementById('new-user-name').value = '';
            loadUsers();
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to create user');
        }
    } catch (error) {
        alert('Error creating user');
    }
}

async function deleteUser(email) {
    if (!confirm(`Delete user ${email}?`)) return;
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/users/${email}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            alert('User deleted');
            loadUsers();
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to delete user');
        }
    } catch (error) {
        alert('Error deleting user');
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

loadDashboard();