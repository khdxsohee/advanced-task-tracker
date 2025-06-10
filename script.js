document.addEventListener('DOMContentLoaded', () => {
    const taskListDiv = document.getElementById('taskList');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskModal = document.getElementById('taskModal');
    const closeModalButton = document.querySelector('.close-button');
    const taskForm = document.getElementById('taskForm');
    const taskSearchInput = document.getElementById('taskSearchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const statusFilter = document.getElementById('statusFilter');

    // Form input elements
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskCategoryInput = document.getElementById('taskCategory');
    const taskPriorityInput = document.getElementById('taskPriority');
    const taskDueDateInput = document.getElementById('taskDueDate');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let editingTaskId = null;

    // Function to render tasks
    function renderTasks() {
        taskListDiv.innerHTML = ''; // Clear current tasks

        const searchTerm = taskSearchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;
        const selectedPriority = priorityFilter.value;
        const selectedStatus = statusFilter.value;

        const filteredTasks = tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm) ||
                                  task.description.toLowerCase().includes(searchTerm);
            const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
            const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
            const matchesStatus = selectedStatus === 'all' ||
                                  (selectedStatus === 'completed' && task.completed) ||
                                  (selectedStatus === 'pending' && !task.completed);

            return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
        });

        if (filteredTasks.length === 0) {
            taskListDiv.innerHTML = '<p>No tasks found matching your criteria. Try adding a new task!</p>';
            return;
        }

        filteredTasks.forEach(task => {
            const taskCard = document.createElement('div');
            taskCard.classList.add('task-card');
            taskCard.dataset.id = task.id;

            if (task.completed) {
                taskCard.classList.add('completed');
            }
            taskCard.classList.add(`priority-${task.priority}`); // Add priority class for styling

            const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date';

            taskCard.innerHTML = `
                <h3>${task.title}</h3>
                <p>${task.description || 'No description provided.'}</p>
                <div class="task-meta">
                    <span>Category: ${task.category}</span>
                    <span>Due: ${dueDate}</span>
                </div>
                <div class="task-actions">
                    <button class="complete-btn ${task.completed ? '' : 'pending'}" data-id="${task.id}">
                        ${task.completed ? 'Completed' : 'Mark Complete'}
                    </button>
                    <button class="edit-btn" data-id="${task.id}">Edit</button>
                    <button class="delete-btn" data-id="${task.id}">Delete</button>
                </div>
            `;
            taskListDiv.appendChild(taskCard);
        });

        addEventListenersToTaskButtons();
    }

    // Function to add event listeners to dynamically created buttons
    function addEventListenersToTaskButtons() {
        document.querySelectorAll('.complete-btn').forEach(button => {
            button.onclick = (e) => toggleTaskComplete(e.target.dataset.id);
        });
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.onclick = (e) => openTaskModal(e.target.dataset.id);
        });
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.onclick = (e) => deleteTask(e.target.dataset.id);
        });
    }

    // Function to open the Add/Edit Task Modal
    function openTaskModal(id = null) {
        taskModal.style.display = 'block';
        if (id) {
            editingTaskId = id;
            document.getElementById('modalTitle').textContent = 'Edit Task';
            const task = tasks.find(t => t.id === id);
            if (task) {
                taskTitleInput.value = task.title;
                taskDescriptionInput.value = task.description;
                taskCategoryInput.value = task.category;
                taskPriorityInput.value = task.priority;
                taskDueDateInput.value = task.dueDate;
            }
        } else {
            editingTaskId = null;
            document.getElementById('modalTitle').textContent = 'Add New Task';
            taskForm.reset(); // Clear form for new task
        }
    }

    // Function to close the modal
    function closeTaskModal() {
        taskModal.style.display = 'none';
    }

    // Save/Update Task
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newTask = {
            id: editingTaskId || Date.now().toString(),
            title: taskTitleInput.value.trim(),
            description: taskDescriptionInput.value.trim(),
            category: taskCategoryInput.value,
            priority: taskPriorityInput.value,
            dueDate: taskDueDateInput.value,
            completed: editingTaskId ? tasks.find(t => t.id === editingTaskId).completed : false // Keep existing completion status
        };

        if (editingTaskId) {
            tasks = tasks.map(task =>
                task.id === editingTaskId ? newTask : task
            );
        } else {
            tasks.push(newTask);
        }

        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        closeTaskModal();
    });

    // Toggle Task Completion
    function toggleTaskComplete(id) {
        tasks = tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }

    // Delete Task
    function deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== id);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
        }
    }

    // Event Listeners
    addTaskBtn.addEventListener('click', () => openTaskModal());
    closeModalButton.addEventListener('click', closeTaskModal);

    window.addEventListener('click', (event) => {
        if (event.target == taskModal) {
            closeTaskModal();
        }
    });

    // Filter and Search Event Listeners
    taskSearchInput.addEventListener('input', renderTasks);
    categoryFilter.addEventListener('change', renderTasks);
    priorityFilter.addEventListener('change', renderTasks);
    statusFilter.addEventListener('change', renderTasks);

    // Initial render
    renderTasks();
});