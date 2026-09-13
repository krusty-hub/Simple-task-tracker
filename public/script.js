document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let tasks = [];
    let currentFilter = 'all';

    // Fetch tasks from backend
    async function fetchTasks() {
        try {
            const response = await fetch('/api/tasks');
            tasks = await response.json();
            renderTasks();
        } catch (error) {
            console.error('Error fetching tasks:', error);
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="ph ph-warning-circle" style="color: var(--danger-color)"></i>
                    <p>Failed to load tasks. Is the server running?</p>
                </div>
            `;
        }
    }

    // Add a new task
    async function addTask(title) {
        if (!title.trim()) return;
        
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: title.trim() }),
            });
            
            const newTask = await response.json();
            tasks.push(newTask);
            renderTasks();
            taskInput.value = '';
        } catch (error) {
            console.error('Error adding task:', error);
        }
    }

    // Toggle task completion
    async function toggleTask(id, completed) {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed: !completed }),
            });
            
            const updatedTask = await response.json();
            tasks = tasks.map(t => t.id === id ? updatedTask : t);
            renderTasks();
        } catch (error) {
            console.error('Error toggling task:', error);
        }
    }

    // Delete a task
    async function deleteTask(id) {
        try {
            await fetch(`/api/tasks/${id}`, {
                method: 'DELETE',
            });
            
            tasks = tasks.filter(t => t.id !== id);
            renderTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }

    // Render tasks based on filter
    function renderTasks() {
        taskList.innerHTML = '';
        
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(t => t.completed);
        }

        if (tasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="ph ph-check-circle"></i>
                    <p>No tasks yet. Add one above!</p>
                </div>
            `;
            return;
        }

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="ph ph-magnifying-glass"></i>
                    <p>No ${currentFilter} tasks found.</p>
                </div>
            `;
            return;
        }

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <div class="task-content" data-id="${task.id}">
                    <div class="checkbox">
                        <i class="ph-bold ph-check"></i>
                    </div>
                    <span class="task-title">${escapeHTML(task.title)}</span>
                </div>
                <button class="delete-btn" aria-label="Delete Task" data-id="${task.id}">
                    <i class="ph ph-trash"></i>
                </button>
            `;

            // Toggle listener
            const taskContent = li.querySelector('.task-content');
            taskContent.addEventListener('click', () => toggleTask(task.id, task.completed));

            // Delete listener
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Add slide out animation before deleting
                li.style.transform = 'translateX(100%)';
                li.style.opacity = '0';
                setTimeout(() => deleteTask(task.id), 300);
            });

            taskList.appendChild(li);
        });
    }

    // Utility to prevent XSS
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Event Listeners
    addTaskBtn.addEventListener('click', () => {
        addTask(taskInput.value);
    });

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask(taskInput.value);
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active class
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update filter and re-render
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    // Initial load
    fetchTasks();
});
