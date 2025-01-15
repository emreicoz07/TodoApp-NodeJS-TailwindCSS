const Todo = require('../models/Todo');

// Get all todos
exports.getTodos = async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single todo
exports.getTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        // Check user ownership
        if (todo.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(todo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create todo
exports.createTodo = async (req, res) => {
    try {
        const { title, description } = req.body;
        
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const todo = await Todo.create({
            user: req.user.id,
            title,
            description,
            status: 'pending'
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

        // Check user ownership
        if (todo.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
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

        // Check user ownership
        if (todo.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await todo.deleteOne();
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 