// Load todos
async function loadTodos() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`${API_URL}/todos`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });

        const todos = await response.json();
        displayTodos(todos);
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading todos');
    }
}

// Add todo
async function addTodo(title) {
    try {
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
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding todo');
    }
}

// Delete todo
async function deleteTodo(id) {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });

        if (response.ok) {
            loadTodos();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting todo');
    }
}

// Display todos
function displayTodos(todos) {
    const todosList = document.getElementById('todos-list');
    todosList.innerHTML = '';

    todos.forEach(todo => {
        const todoElement = document.createElement('div');
        todoElement.className = 'flex items-center justify-between bg-white p-4 rounded shadow';
        todoElement.innerHTML = `
            <span>${todo.title}</span>
            <div>
                <button onclick="deleteTodo('${todo._id}')" 
                        class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                    Delete
                </button>
            </div>
        `;
        todosList.appendChild(todoElement);
    });
}

// Event listeners
document.getElementById('todo-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('todo-title').value;
    addTodo(title);
}); 