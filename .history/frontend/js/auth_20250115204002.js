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

// Register function
async function register(username, email, password) {
    try {
        // Input validation
        if (!username || !email || !password) {
            showToast('Tüm alanları doldurunuz', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Geçerli bir email adresi giriniz', 'error');
            return;
        }

        // Password validation
        if (password.length < 6) {
            showToast('Şifre en az 6 karakter olmalıdır', 'error');
            return;
        }

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
            // Clear form
            document.getElementById('register-username').value = '';
            document.getElementById('register-email').value = '';
            document.getElementById('register-password').value = '';
            
            localStorage.setItem('user', JSON.stringify(data));
            showToast('Kayıt başarılı! Yönlendiriliyorsunuz...', 'success');
            
            // Delay redirect to show success message
            setTimeout(() => {
                showDashboard();
            }, 1500);
        } else {
            throw new Error(data.message || 'Kayıt işlemi başarısız');
        }
    } catch (error) {
        console.error('Kayıt hatası:', error);
        showToast(error.message || 'Kayıt sırasında bir hata oluştu', 'error');
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
            showToast('Giriş başarılı!', 'success');
            showDashboard();
        } else {
            showToast(data.message || 'Geçersiz email veya şifre', 'error');
        }
    } catch (error) {
        console.error('Giriş hatası:', error);
        showToast('Giriş sırasında bir hata oluştu', 'error');
    } finally {
        hideLoading();
    }
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    showToast('Başarıyla çıkış yapıldı', 'success');
    window.history.pushState({}, '', '/login');
    showLoginForm();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            await register(username, email, password);
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            await login(email, password);
        });
    }
});

// Show/Hide loading spinner
function showLoading() {
    document.getElementById('loading-spinner').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-spinner').classList.add('hidden');
}

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