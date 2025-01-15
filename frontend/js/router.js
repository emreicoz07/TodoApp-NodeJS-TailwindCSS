// Define routes
const routes = {
    '/': 'login',
    '/login': 'login',
    '/register': 'register',
    '/dashboard': 'dashboard',
    '/tasks': 'dashboard'
};

// Router function
function router() {
    const path = window.location.pathname;
    const route = routes[path] || 'login';

    // Hide all pages
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('nav-buttons').classList.add('hidden');

    // Check authentication for protected routes
    const user = JSON.parse(localStorage.getItem('user'));
    if ((path === '/dashboard' || path === '/tasks') && !user?.token) {
        window.history.pushState({}, '', '/login');
        showLoginForm();
        return;
    }

    // Show appropriate page
    switch(route) {
        case 'login':
            showLoginForm();
            window.history.pushState({}, '', '/login');
            break;
        case 'register':
            showRegisterForm();
            window.history.pushState({}, '', '/register');
            break;
        case 'dashboard':
            if (user?.token) {
                showDashboard();
                window.history.pushState({}, '', '/dashboard');
            } else {
                window.history.pushState({}, '', '/login');
                showLoginForm();
            }
            break;
    }
}

// Handle navigation
window.addEventListener('popstate', router);
window.addEventListener('DOMContentLoaded', router); 