// ============================================
// STATE MANAGEMENT
// ============================================
const AppState = {
  tasks: [],
  darkMode: false,
  currentTaskId: null,
  longPressTimer: null,
  longPressDuration: 750 // 750ms for long-press
};

// ============================================
// LOCALSTORAGE KEYS
// ============================================
const STORAGE_KEYS = {
  TASKS: 'todoapp_tasks',
  DARK_MODE: 'todoapp_darkmode'
};

// ============================================
// INITIALIZATION
// ============================================
function init() {
  loadFromLocalStorage();
  setupEventListeners();
  renderTasks();
  applyTheme();
}

// ============================================
// LOCALSTORAGE MANAGEMENT
// ============================================
function loadFromLocalStorage() {
  // Load tasks
  const tasksJSON = localStorage.getItem(STORAGE_KEYS.TASKS);
  if (tasksJSON) {
    try {
      AppState.tasks = JSON.parse(tasksJSON);
    } catch (e) {
      console.error('Error parsing tasks:', e);
      AppState.tasks = [];
      // Clear corrupt data
      localStorage.removeItem(STORAGE_KEYS.TASKS);
    }
  }

  // Load dark mode preference
  const darkModeValue = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
  AppState.darkMode = darkModeValue === 'true';
}

function saveTasksToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(AppState.tasks));
  } catch (e) {
    console.error('Error saving tasks:', e);
    // Handle quota exceeded error
    if (e.name === 'QuotaExceededError') {
      alert('Storage quota exceeded. Please delete some tasks to free up space.');
    } else if (e.name === 'SecurityError') {
      console.warn('LocalStorage is disabled or unavailable');
      alert('Unable to save tasks. LocalStorage may be disabled in your browser.');
    }
  }
}

function saveDarkModeToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, AppState.darkMode.toString());
  } catch (e) {
    console.error('Error saving dark mode preference:', e);
  }
}

// ============================================
// TASK MANAGEMENT
// ============================================
function createTask(text) {
  // Validate and sanitize input
  const trimmedText = text.trim();
  if (!trimmedText) {
    return null;
  }

  // Limit text length to prevent storage issues
  const maxLength = 1000;
  const sanitizedText = trimmedText.length > maxLength
    ? trimmedText.substring(0, maxLength)
    : trimmedText;

  const task = {
    id: generateUniqueId(),
    text: sanitizedText,
    completed: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  return task;
}

function addTask(text) {
  const task = createTask(text);
  if (!task) return;

  AppState.tasks.push(task); // Add to end
  saveTasksToLocalStorage();
  renderTasks();

  // Clear input
  document.getElementById('taskInput').value = '';
}

function toggleTaskCompletion(taskId) {
  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.completed = !task.completed;
  task.updatedAt = Date.now();

  saveTasksToLocalStorage();
  renderTasks();
}

function editTask(taskId, newText) {
  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task) return;

  const trimmedText = newText.trim();
  if (!trimmedText) {
    // Delete if empty
    deleteTask(taskId);
    return;
  }

  task.text = trimmedText;
  task.updatedAt = Date.now();

  saveTasksToLocalStorage();
  renderTasks();
}

function deleteTask(taskId) {
  AppState.tasks = AppState.tasks.filter(t => t.id !== taskId);
  saveTasksToLocalStorage();
  renderTasks();
}

// ============================================
// RENDERING
// ============================================
function renderTasks() {
  const tasksList = document.getElementById('tasksList');
  const emptyState = document.getElementById('emptyState');

  if (AppState.tasks.length === 0) {
    tasksList.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  const tasksHTML = AppState.tasks.map(task => createTaskHTML(task)).join('');
  tasksList.innerHTML = tasksHTML;

  // Attach event listeners to newly created task elements
  attachTaskEventListeners();
}

function createTaskHTML(task) {
  const completedClass = task.completed ? 'completed' : '';
  const checkedAttr = task.completed ? 'checked' : '';

  // Escape HTML to prevent XSS
  const escapedText = escapeHTML(task.text);

  return `
    <div class="task-item ${completedClass}" data-task-id="${task.id}" role="listitem">
      <input
        type="checkbox"
        class="task-checkbox"
        ${checkedAttr}
        aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}"
      >
      <div class="task-text">${escapedText.replace(/\n/g, '<br>')}</div>
    </div>
  `;
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
  // Add task button
  document.getElementById('addTaskBtn').addEventListener('click', handleAddTask);

  // Enter key in textarea (with Shift+Enter for new line)
  document.getElementById('taskInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTask();
    }
  });

  // Dark mode toggle
  document.getElementById('darkModeToggle').addEventListener('change', toggleDarkMode);

  // Context menu buttons
  document.getElementById('editTaskBtn').addEventListener('click', handleEditTask);
  document.getElementById('deleteTaskBtn').addEventListener('click', handleDeleteTask);
  document.getElementById('cancelMenuBtn').addEventListener('click', hideContextMenu);

  // Backdrop click
  document.getElementById('backdrop').addEventListener('click', hideContextMenu);

  // Prevent context menu on long press (mobile)
  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.task-item')) {
      e.preventDefault();
    }
  });
}

function attachTaskEventListeners() {
  const taskItems = document.querySelectorAll('.task-item');

  taskItems.forEach(taskItem => {
    const taskId = taskItem.dataset.taskId;
    const checkbox = taskItem.querySelector('.task-checkbox');

    // Checkbox toggle
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      toggleTaskCompletion(taskId);
    });

    // Touch events for long press
    taskItem.addEventListener('touchstart', handleTouchStart, { passive: true });
    taskItem.addEventListener('touchend', handleTouchEnd);
    taskItem.addEventListener('touchmove', handleTouchMove);

    // Mouse events for desktop long press
    taskItem.addEventListener('mousedown', handleMouseDown);
    taskItem.addEventListener('mouseup', handleMouseUp);
    taskItem.addEventListener('mouseleave', handleMouseLeave);
  });
}

function handleAddTask() {
  const taskInput = document.getElementById('taskInput');
  const text = taskInput.value;
  addTask(text);
}

// ============================================
// LONG PRESS IMPLEMENTATION
// ============================================
function handleTouchStart(e) {
  const taskItem = e.currentTarget;
  const taskId = taskItem.dataset.taskId;

  // Don't trigger if touching checkbox
  if (e.target.closest('.task-checkbox')) {
    return;
  }

  AppState.currentTaskId = taskId;
  taskItem.classList.add('pressing');

  // Start long press timer
  AppState.longPressTimer = setTimeout(() => {
    showContextMenu(taskId);
    taskItem.classList.remove('pressing');

    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, AppState.longPressDuration);
}

function handleTouchEnd(e) {
  clearTimeout(AppState.longPressTimer);
  e.currentTarget.classList.remove('pressing');
}

function handleTouchMove(e) {
  // Cancel long press if finger moves
  clearTimeout(AppState.longPressTimer);
  e.currentTarget.classList.remove('pressing');
}

function handleMouseDown(e) {
  // Same as touchstart but for mouse
  if (e.target.closest('.task-checkbox')) {
    return;
  }

  const taskItem = e.currentTarget;
  const taskId = taskItem.dataset.taskId;

  AppState.currentTaskId = taskId;
  taskItem.classList.add('pressing');

  AppState.longPressTimer = setTimeout(() => {
    showContextMenu(taskId);
    taskItem.classList.remove('pressing');
  }, AppState.longPressDuration);
}

function handleMouseUp(e) {
  clearTimeout(AppState.longPressTimer);
  e.currentTarget.classList.remove('pressing');
}

function handleMouseLeave(e) {
  clearTimeout(AppState.longPressTimer);
  e.currentTarget.classList.remove('pressing');
}

// ============================================
// CONTEXT MENU
// ============================================
function showContextMenu(taskId) {
  AppState.currentTaskId = taskId;

  const contextMenu = document.getElementById('contextMenu');
  const backdrop = document.getElementById('backdrop');

  contextMenu.classList.add('active');
  backdrop.classList.add('active');
  contextMenu.setAttribute('aria-hidden', 'false');
  backdrop.setAttribute('aria-hidden', 'false');

  // Trap focus in menu
  document.getElementById('editTaskBtn').focus();
}

function hideContextMenu() {
  const contextMenu = document.getElementById('contextMenu');
  const backdrop = document.getElementById('backdrop');

  contextMenu.classList.remove('active');
  backdrop.classList.remove('active');
  contextMenu.setAttribute('aria-hidden', 'true');
  backdrop.setAttribute('aria-hidden', 'true');

  AppState.currentTaskId = null;
}

function handleEditTask() {
  const task = AppState.tasks.find(t => t.id === AppState.currentTaskId);
  if (!task) return;

  hideContextMenu();

  // Create inline editor
  const taskItem = document.querySelector(`[data-task-id="${task.id}"]`);
  if (!taskItem) return;

  const taskText = taskItem.querySelector('.task-text');

  const textarea = document.createElement('textarea');
  textarea.value = task.text;
  textarea.className = 'task-edit-textarea';
  textarea.rows = 3;

  taskText.replaceWith(textarea);
  textarea.focus();
  textarea.select();

  // Save on blur or Enter (without Shift)
  const saveEdit = () => {
    const newText = textarea.value;
    editTask(task.id, newText);
  };

  textarea.addEventListener('blur', saveEdit, { once: true });
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    }
    if (e.key === 'Escape') {
      renderTasks(); // Cancel edit
    }
  });
}

function handleDeleteTask() {
  if (!AppState.currentTaskId) return;

  // Add confirmation
  const confirmed = confirm('Are you sure you want to delete this task?');
  if (confirmed) {
    deleteTask(AppState.currentTaskId);
  }

  hideContextMenu();
}

// ============================================
// DARK MODE
// ============================================
function toggleDarkMode() {
  AppState.darkMode = !AppState.darkMode;
  applyTheme();
  saveDarkModeToLocalStorage();
}

function applyTheme() {
  const root = document.documentElement;
  const toggle = document.getElementById('darkModeToggle');

  if (AppState.darkMode) {
    root.setAttribute('data-theme', 'dark');
    toggle.checked = true;
  } else {
    root.removeAttribute('data-theme');
    toggle.checked = false;
  }

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content',
      AppState.darkMode ? '#1a1a1a' : '#ffffff'
    );
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function generateUniqueId() {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================
// INITIALIZE APP
// ============================================
document.addEventListener('DOMContentLoaded', init);
