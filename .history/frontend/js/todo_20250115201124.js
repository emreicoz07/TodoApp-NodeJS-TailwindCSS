const API_URL = 'http://localhost:5000/api';

// Show loading spinner
function showLoading() {
    document.getElementById('loading-spinner').classList.remove('hidden');
}

// Hide loading spinner
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

// Load todos
async function loadTodos() {
    try {
        showLoading();
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`${API_URL}/todos`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });

        const todos = await response.json();
        displayTodos(todos);
        updateTaskCount(todos);
    } catch (error) {
        console.error('Error:', error);
        showToast('Error loading tasks', 'error');
    } finally {
        hideLoading();
    }
}

// Update task count
function updateTaskCount(todos) {
    const total = todos.length;
    const completed = todos.filter(todo => todo.status === 'completed').length;
    document.getElementById('task-count').textContent = 
        `${completed}/${total} tasks completed`;
}

// Add todo
async function addTodo(title) {
    try {
        showLoading();
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ title })
        });

        if (response.ok) {
            loadTodos();
            document.getElementById('todo-title').value = '';
            showToast('Task added successfully');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error adding task', 'error');
    } finally {
        hideLoading();
    }
}

// Toggle todo status
async function toggleTodoStatus(id, currentStatus) {
    try {
        showLoading();
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ 
                status: currentStatus === 'completed' ? 'pending' : 'completed' 
            })
        });

        if (response.ok) {
            loadTodos();
            showToast('Task status updated');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error updating task', 'error');
    } finally {
        hideLoading();
    }
}

// Delete todo
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        showLoading();
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });

        if (response.ok) {
            loadTodos();
            showToast('Task deleted successfully');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error deleting task', 'error');
    } finally {
        hideLoading();
    }
}

// Display todos
function displayTodos(todos) {
    const todosList = document.getElementById('todos-list');
    todosList.innerHTML = '';

    const filterStatus = document.getElementById('filter-status').value;
    const filteredTodos = filterStatus === 'all' 
        ? todos 
        : todos.filter(todo => todo.status === filterStatus);

    filteredTodos.forEach(todo => {
        const todoElement = document.createElement('div');
        todoElement.className = 'todo-item flex items-center justify-between bg-white p-4 rounded-lg shadow hover:shadow-md transition-all duration-200';
        todoElement.innerHTML = `
            <div class="flex items-center space-x-4">
                <input type="checkbox" 
                       ${todo.status === 'completed' ? 'checked' : ''}
                       onchange="toggleTodoStatus('${todo._id}', '${todo.status}')"
                       class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500">
                <span class="${todo.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}">
                    ${todo.title}
                </span>
            </div>
            <div class="flex items-center space-x-2">
                <button onclick="deleteTodo('${todo._id}')" 
                        class="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        todosList.appendChild(todoElement);
    });
}

// Event listeners
document.getElementById('todo-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('todo-title').value.trim();
    if (title) {
        addTodo(title);
    }
});

document.getElementById('filter-status').addEventListener('change', () => {
    loadTodos();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        document.getElementById('nav-buttons').classList.remove('hidden');
    }
}); 