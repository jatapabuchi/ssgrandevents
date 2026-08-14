const MAX_OTP_ATTEMPTS = 3;
let otpAttempts = 0;
let otpTimerInterval = null;

// Check if user was in OTP section when page loads
window.addEventListener('load', () => {
    const savedEmail = localStorage.getItem('loginEmail');
    const savedOtpTime = localStorage.getItem('otpTime');
    
    if (savedEmail && savedOtpTime) {
        const timeElapsed = (Date.now() - parseInt(savedOtpTime)) / 1000;
        if (timeElapsed < 300) { // OTP still valid (5 minutes)
            document.getElementById('phone-section').style.display = 'none';
            document.getElementById('otp-section').style.display = 'block';
            document.getElementById('phone').value = savedEmail;
            startOTPTimer(300 - Math.floor(timeElapsed));
        } else {
            localStorage.removeItem('loginEmail');
            localStorage.removeItem('otpTime');
        }
    }
});

async function sendOTP() {
    const email = document.getElementById('phone').value;
    
    if (!email || !email.includes('@')) {
        showMessage('Please enter valid email address', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('phone-section').style.display = 'none';
            document.getElementById('otp-section').style.display = 'block';
            showMessage('OTP sent to your email (valid for 5 minutes)', 'success');
            
            // Save to localStorage so page stays open when switching tabs
            localStorage.setItem('loginEmail', email);
            localStorage.setItem('otpTime', Date.now());
            
            otpAttempts = 0;
            startOTPTimer(300);
        } else {
            showMessage(data.message || 'Failed to send OTP', 'error');
        }
    } catch (error) {
        showMessage('Error sending OTP', 'error');
    }
}







function showMessage(text, type) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = type;
    message.style.display = 'block';
}

async function resendOTP() {
    const email = localStorage.getItem('loginEmail');
    if (!email) {
        showMessage('Please enter email first', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('New OTP sent to your email', 'success');
            localStorage.setItem('otpTime', Date.now());
            otpAttempts = 0;
            document.getElementById('otp').value = '';
            if (otpTimerInterval) clearInterval(otpTimerInterval);
            startOTPTimer(300);
        } else {
            showMessage(data.message || 'Failed to resend OTP', 'error');
        }
    } catch (error) {
        showMessage('Error resending OTP', 'error');
    }
}

async function verifyOTP() {
    const email = localStorage.getItem('loginEmail');
    const otp = document.getElementById('otp').value;
    
    if (!otp || otp.length !== 6) {
        showMessage('Please enter 6-digit OTP', 'error');
        return;
    }
    
    otpAttempts++;
    
    if (otpAttempts > MAX_OTP_ATTEMPTS) {
        showMessage('Too many attempts. Please request new OTP', 'error');
        if (otpTimerInterval) clearInterval(otpTimerInterval);
        setTimeout(() => {
            localStorage.removeItem('loginEmail');
            localStorage.removeItem('otpTime');
            location.reload();
        }, 2000);
        return;
    }
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            if (otpTimerInterval) clearInterval(otpTimerInterval);
            localStorage.setItem('token', data.token);
            localStorage.setItem('tokenExpiry', data.expiresAt);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('loginTime', Date.now());
            
            localStorage.removeItem('loginEmail');
            localStorage.removeItem('otpTime');
            
            showMessage('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showMessage(`Invalid OTP (${MAX_OTP_ATTEMPTS - otpAttempts} attempts left)`, 'error');
        }
    } catch (error) {
        showMessage('Error verifying OTP', 'error');
    }
}

function startOTPTimer(initialTime = 300) {
    if (otpTimerInterval) clearInterval(otpTimerInterval);
    
    let timeLeft = initialTime;
    
    const updateTimer = () => {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        const timerEl = document.getElementById('otp-timer');
        if (timerEl) {
            timerEl.textContent = `⏱️ OTP expires in ${mins}:${secs.toString().padStart(2, '0')}`;
        }
    };
    
    updateTimer();
    
    const timer = setInterval(() => {
        timeLeft--;
        updateTimer();
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            showMessage('OTP expired. Please request new OTP', 'error');
            setTimeout(() => {
                localStorage.removeItem('loginEmail');
                localStorage.removeItem('otpTime');
                location.reload();
            }, 2000);
        }
    }, 1000);
    
    otpTimerInterval = timer;
}

function showMessage(text, type) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = type;
    message.style.display = 'block';
}
