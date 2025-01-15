const express = require('express');
const router = express.Router();
const { getTodos, createTodo, updateTodo, deleteTodo } = require('../controllers/todoController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all routes
router.use(authMiddleware);

router.route('/').get(getTodos).post(createTodo);
router.route('/:id').put(updateTodo).delete(deleteTodo);

module.exports = router; 