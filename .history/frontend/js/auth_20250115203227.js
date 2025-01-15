// Show/hide forms and manage navigation visibility
function showLoginForm() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('nav-buttons').classList.add('hidden');
    window.history.pushState({}, '', '/login');
}

function showRegisterForm() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('nav-buttons').classList.add('hidden');
    window.history.pushState({}, '', '/register');
}

function showDashboard() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('nav-buttons').classList.remove('hidden');
    window.history.pushState({}, '', '/dashboard');
    loadTodos();
}

// Show loading spinner
function showLoading() {
    document.getElementById('loading-spinner').classList.remove('hidden');
}

// Hide loading spinner
function hideLoading() {
    document.getElementById('loading-spinner').classList.add('hidden');
}

// Register function
async function register(username, email, password) {
    try {
        showLoading();
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data));
            showToast('Registration successful!', 'success');
            showDashboard();
        } else {
            showToast(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast('An error occurred during registration', 'error');
    } finally {
        hideLoading();
    }
}

// Login function
async function login(email, password) {
    try {
        showLoading();
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data));
            showToast('Login successful!', 'success');
            showDashboard();
        } else {
            showToast(data.message || 'Invalid email or password', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('An error occurred during login', 'error');
    } finally {
        hideLoading();
    }
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    showToast('Logged out successfully', 'success');
    window.history.pushState({}, '', '/login');
    showLoginForm();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Register form submission
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        await register(username, email, password);
    });

    // Login form submission
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        await login(email, password);
    });

    // Navigation links
    document.getElementById('register-link').addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterForm();
    });

    document.getElementById('login-link').addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });
});

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle text-green-500' : 'fa-exclamation-circle text-red-500'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Check if user is logged in
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        // Verify token validity
        fetch(`${API_URL}/users/verify`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        .then(response => {
            if (response.ok) {
                showDashboard();
            } else {
                localStorage.removeItem('user');
                showLoginForm();
            }
        })
        .catch(() => {
            localStorage.removeItem('user');
            showLoginForm();
        });
    } else {
        showLoginForm();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Hide dashboard and nav buttons initially
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('nav-buttons').classList.add('hidden');
    
    // Check authentication
    checkAuth();
}); 