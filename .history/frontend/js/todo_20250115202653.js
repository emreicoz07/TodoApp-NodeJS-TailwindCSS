const API_URL = 'http://localhost:5000/api';

// Get auth token
function getAuthHeader() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' } : {};
}

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
        const response = await fetch(`${API_URL}/todos`, {
            headers: getAuthHeader()
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('user');
                window.location.reload();
                return;
            }
            throw new Error('Failed to load todos');
        }

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

// Add todo
async function addTodo(title) {
    try {
        showLoading();
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ title })
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('user');
                window.location.reload();
                return;
            }
            throw new Error('Failed to add todo');
        }

        const todo = await response.json();
        showToast('Task added successfully', 'success');
        document.getElementById('todo-title').value = '';
        loadTodos();
    } catch (error) {
        console.error('Error:', error);
        showToast('Error adding task', 'error');
    } finally {
        hideLoading();
    }
}

// Toggle todo status
async function toggleTodo(id, currentStatus) {
    try {
        showLoading();
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify({
                status: currentStatus === 'completed' ? 'pending' : 'completed'
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('user');
                window.location.reload();
                return;
            }
            throw new Error('Failed to update todo');
        }

        loadTodos();
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
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('user');
                window.location.reload();
                return;
            }
            throw new Error('Failed to delete todo');
        }

        showToast('Task deleted successfully', 'success');
        loadTodos();
    } catch (error) {
        console.error('Error:', error);
        showToast('Error deleting task', 'error');
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

// Display todos
function displayTodos(todos) {
    const todosList = document.getElementById('todos-list');
    const filterStatus = document.getElementById('filter-status').value;
    
    const filteredTodos = filterStatus === 'all' 
        ? todos 
        : todos.filter(todo => todo.status === filterStatus);

    todosList.innerHTML = '';
    
    filteredTodos.forEach(todo => {
        const todoElement = document.createElement('div');
        todoElement.className = `todo-item bg-white p-4 rounded-lg shadow-md flex items-center justify-between ${todo.status === 'completed' ? 'opacity-75' : ''}`;
        todoElement.innerHTML = `
            <div class="flex items-center space-x-4">
                <button onclick="toggleTodo('${todo._id}', '${todo.status}')" 
                        class="text-gray-500 hover:text-indigo-600">
                    <i class="fas ${todo.status === 'completed' ? 'fa-check-circle text-green-500' : 'fa-circle'}"></i>
                </button>
                <span class="${todo.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}">
                    ${todo.title}
                </span>
            </div>
            <div class="flex items-center space-x-2">
                <button onclick="editTodo('${todo._id}')" 
                        class="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50">
                    <i class="fas fa-edit"></i>
                </button>
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
    } else {
        showToast('Please enter a task title', 'error');
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

// Edit todo
async function editTodo(id) {
    const title = prompt('Enter new title:');
    if (!title) return;

    try {
        showLoading();
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify({ title })
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('user');
                window.location.reload();
                return;
            }
            throw new Error('Failed to update todo');
        }

        showToast('Task updated successfully', 'success');
        loadTodos();
    } catch (error) {
        console.error('Error:', error);
        showToast('Error updating task', 'error');
    } finally {
        hideLoading();
    }
}

// Get single todo
async function getTodo(id) {
    try {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            headers: getAuthHeader()
        });

        if (!response.ok) {
            throw new Error('Failed to get todo');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        showToast('Error getting task details', 'error');
    }
} 