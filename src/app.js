const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Path to our todos data file
const todosFilePath = path.join(__dirname, '../data/todos.json');

// Helper function to read todos from file
function readTodos() {
    try {
        const data = fs.readFileSync(todosFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist or is empty, return empty array
        return [];
    }
}

// Helper function to write todos to file
function writeTodos(todos) {
    fs.writeFileSync(todosFilePath, JSON.stringify(todos, null, 2));
}

// GET /todos - Fetch all todos
app.get('/todos', (req, res) => {
    const todos = readTodos();
    res.json(todos);
});

// GET /todos/:id - Fetch a single todo by ID
app.get('/todos/:id', (req, res) => {
    const todos = readTodos();
    const todo = todos.find(t => t.id === parseInt(req.params.id));
    
    if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
});

// POST /todos - Create a new todo
app.post('/todos', (req, res) => {
    const { title, description } = req.body;
    
    // Validate input
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }
    
    const todos = readTodos();
    
    const newTodo = {
        id: todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1,
        title: title,
        description: description || '',
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.push(newTodo);
    writeTodos(todos);
    
    res.status(201).json(newTodo);
});

// PUT /todos/:id - Update a todo (mark complete, edit title/description)
app.put('/todos/:id', (req, res) => {
    const { title, description, completed } = req.body;
    const todos = readTodos();
    const todoIndex = todos.findIndex(t => t.id === parseInt(req.params.id));
    
    if (todoIndex === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    
    // Update only the fields that are provided
    if (title !== undefined) todos[todoIndex].title = title;
    if (description !== undefined) todos[todoIndex].description = description;
    if (completed !== undefined) todos[todoIndex].completed = completed;
    
    todos[todoIndex].updatedAt = new Date().toISOString();
    writeTodos(todos);
    
    res.json(todos[todoIndex]);
});

// DELETE /todos/:id - Delete a todo
app.delete('/todos/:id', (req, res) => {
    const todos = readTodos();
    const todoIndex = todos.findIndex(t => t.id === parseInt(req.params.id));
    
    if (todoIndex === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    
    const deletedTodo = todos[todoIndex];
    todos.splice(todoIndex, 1);
    writeTodos(todos);
    
    res.json({ message: 'Todo deleted successfully', todo: deletedTodo });
});

// DELETE /todos - Delete all todos (useful for testing)
app.delete('/todos', (req, res) => {
    writeTodos([]);
    res.json({ message: 'All todos deleted successfully' });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = app;