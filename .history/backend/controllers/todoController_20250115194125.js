const Todo = require('../models/Todo');

// Get all todos
exports.getTodos = async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user.id });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create todo
exports.createTodo = async (req, res) => {
    try {
        const { title, description } = req.body;
        const todo = await Todo.create({
            user: req.user.id,
            title,
            description
        });
        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update todo
exports.updateTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        if (todo.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedTodo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete todo
exports.deleteTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        if (todo.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await todo.remove();
        res.json({ message: 'Todo removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 