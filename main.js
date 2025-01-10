$(document).ready(function () {
    loadTasks();
    applyDarkModeFromStorage();

    $('#addTaskBtn').click(function () {
        Swal.fire({
            title: 'Añadir Tarea',
            html: `
                <input type="text" id="taskTitle" class="swal2-input" placeholder="Título">
                <textarea id="taskDescription" class="swal2-textarea" placeholder="Descripción"></textarea>
            `,
            showCancelButton: true,
            cancelButtonText: 'Volver',
            confirmButtonText: 'Añadir',
            preConfirm: () => {
                const title = $('#taskTitle').val().trim();
                const description = $('#taskDescription').val().trim();

                if (!title || !description) {
                    Swal.showValidationMessage('¡El título y la descripción son obligatorios!');
                }

                return { title, description };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const { title, description } = result.value;
                addTask(title, description, 'todoColumn');
            }
        });
    });

    $('#darkModeToggle').click(function () {
        $('body').toggleClass('dark-mode');
        const isDarkMode = $('body').hasClass('dark-mode');
        localStorage.setItem('darkMode', isDarkMode); 
        updateDarkModeButton(isDarkMode);
    });
});

function addTask(title, description, columnId) {
    const task = { title, description };
    saveTask(task, columnId);
    renderTask(task, columnId);
}

function renderTask(task, columnId) {
    const taskCard = $(
        `<div class="card task-card">
            <div class="card-body">
                <h5 class="card-title">${task.title}</h5>
                <p class="card-text">${task.description}</p>
                <div class="d-flex justify-content-between">
                    <button class="btn btn-success move-task-btn-right" style="display: ${columnId === 'doneColumn' ? 'none' : 'inline-block'};">
                        <i class="bi bi-arrow-right-circle"></i>
                    </button>
                    <button class="btn btn-warning move-task-btn-left" style="display: ${columnId === 'todoColumn' ? 'none' : 'inline-block'};">
                        <i class="bi bi-arrow-left-circle"></i>
                    </button>
                    <button class="btn btn-danger delete-task-btn">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>`
    );

    taskCard.find('.move-task-btn-right').click(function () {
        const currentColumn = taskCard.parent();

        if (currentColumn.is('#todoColumn')) {
            $('#doingColumn').append(taskCard);
            updateTaskColumn(task, 'doingColumn');
            taskCard.find('.move-task-btn-left').show();
        } else if (currentColumn.is('#doingColumn')) {
            $('#doneColumn').append(taskCard);
            updateTaskColumn(task, 'doneColumn');
            taskCard.find('.move-task-btn-right').hide();
        }
    });

    taskCard.find('.move-task-btn-left').click(function () {
        const currentColumn = taskCard.parent();

        if (currentColumn.is('#doingColumn')) {
            $('#todoColumn').append(taskCard);
            updateTaskColumn(task, 'todoColumn');
            taskCard.find('.move-task-btn-left').hide();
        } else if (currentColumn.is('#doneColumn')) {
            $('#doingColumn').append(taskCard);
            updateTaskColumn(task, 'doingColumn');
            taskCard.find('.move-task-btn-right').show();
        }
    });

    taskCard.find('.delete-task-btn').click(function () {
        taskCard.remove();
        deleteTask(task);
    });

    $(`#${columnId}`).append(taskCard);
}

function saveTask(task, columnId) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || {};
    if (!tasks[columnId]) {
        tasks[columnId] = [];
    }
    tasks[columnId].push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function deleteTask(task) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || {};
    Object.keys(tasks).forEach(columnId => {
        tasks[columnId] = tasks[columnId].filter(t => t.title !== task.title || t.description !== task.description);
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateTaskColumn(task, newColumnId) {
    deleteTask(task);
    saveTask(task, newColumnId);
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || {};
    Object.keys(tasks).forEach(columnId => {
        tasks[columnId].forEach(task => {
            renderTask(task, columnId);
        });
    });
}

function applyDarkModeFromStorage() {
    const isDarkMode = JSON.parse(localStorage.getItem('darkMode')) || false;
    if (isDarkMode) {
        $('body').addClass('dark-mode');
    }
    updateDarkModeButton(isDarkMode);
}

function updateDarkModeButton(isDarkMode) {
    if (isDarkMode) {
        $('#darkModeIcon').addClass('bi-sun');
        $('#darkModeIcon').removeClass('bi-moon-stars');
        $('#darkModeToggle').html('<i id="darkModeIcon" class="bi bi-sun"></i> Modo Claro');
    } else {
        $('#darkModeIcon').removeClass('bi-sun');
        $('#darkModeIcon').addClass('bi-moon-stars');
        $('#darkModeToggle').html('<i id="darkModeIcon" class="bi bi-moon-stars"></i> Modo Oscuro');
    }
}