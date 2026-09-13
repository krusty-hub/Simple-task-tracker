const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data store for tasks
let tasks = [
    { id: 1, title: 'Learn HTML, CSS, and JS', completed: true },
    { id: 2, title: 'Build a Task Tracker', completed: false },
    { id: 3, title: 'Understand full-stack workflow', completed: false }
];
let currentId = 4;

// --- API Routes ---

// GET /api/tasks - Get all tasks
app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

// POST /api/tasks - Create a new task
app.post('/api/tasks', (req, res) => {
    const { title } = req.body;
    if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'Title is required' });
    }
    
    const newTask = {
        id: currentId++,
        title: title.trim(),
        completed: false
    };
    
    tasks.push(newTask);
    res.status(201).json(newTask);
});

// PUT /api/tasks/:id - Update a task (toggle completion)
app.put('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const { completed, title } = req.body;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    if (completed !== undefined) {
        task.completed = completed;
    }
    if (title !== undefined) {
        task.title = title.trim();
    }
    
    res.json(task);
});

// DELETE /api/tasks/:id - Delete a task
app.delete('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    tasks.splice(taskIndex, 1);
    res.status(204).send();
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
