/*========================================================================
  DAILY GOALS FUNCTIONALITY 
========================================================================*/
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function loadDailyGoals() {
  return JSON.parse(localStorage.getItem('gm_dailyGoals') || '[]');
}

function saveDailyGoals(goals) {
  localStorage.setItem('gm_dailyGoals', JSON.stringify(goals));
}

function dailyReset(goals) {
  const lastDate = localStorage.getItem('gm_lastReset');
  const today = todayISO();
  if (lastDate !== today) {
    goals.forEach(g => (g.completed = false));
    localStorage.setItem('gm_lastReset', today);
    saveDailyGoals(goals);
  }
  return goals;
}

function renderDailyGoals(goals) {
  const dailyList = document.getElementById('dailyGoalsList');
  dailyList.innerHTML = '';
  goals.forEach((goal, idx) => {
    const item = document.createElement('div');
    item.className = 'goal-item' + (goal.completed ? ' completed' : '');
    
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = goal.completed;
    cb.disabled = goal.completed;
    
    const label = document.createElement('span');
    label.textContent = goal.text;
    
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'delete-btn';
    
    cb.addEventListener('change', () => {
      goal.completed = true;
      saveDailyGoals(goals);
      renderDailyGoals(goals);
    });
    delBtn.addEventListener('click', () => {
      goals.splice(idx, 1);
      saveDailyGoals(goals);
      renderDailyGoals(goals);
    });
    
    item.append(cb, label, delBtn);
    dailyList.appendChild(item);
  });
}

function addDailyGoal() {
  const dailyInput = document.getElementById('dailyInput');
  const text = dailyInput.value.trim();
  if (!text) return;
  const goals = loadDailyGoals();
  goals.push({ text, completed: false });
  saveDailyGoals(goals);
  dailyInput.value = '';
  toggleDailyAddUI(false);
  renderDailyGoals(goals);
}

function toggleDailyAddUI(show) {
  const showInputDaily = document.getElementById('showInputDaily');
  const dailyInput = document.getElementById('dailyInput');
  const submitDaily = document.getElementById('submitDaily');
  if (show) {
    dailyInput.style.display = 'block';
    submitDaily.style.display = 'block';
    showInputDaily.style.display = 'none';
    dailyInput.focus();
  } else {
    dailyInput.style.display = 'none';
    submitDaily.style.display = 'none';
    showInputDaily.style.display = 'inline-block';
  }
}

/*========================================================================
  MAIN GOALS FUNCTIONALITY 
========================================================================*/
const MAIN_GOALS_KEY = 'gm_mainGoals';
const ARCHIVED_GOALS_KEY = 'gm_archivedMainGoals';

function loadMainGoals() {
  return JSON.parse(localStorage.getItem(MAIN_GOALS_KEY) || '[]');
}
function saveMainGoals(goals) {
  localStorage.setItem(MAIN_GOALS_KEY, JSON.stringify(goals));
}
function loadArchivedGoals() {
  return JSON.parse(localStorage.getItem(ARCHIVED_GOALS_KEY) || '[]');
}
function saveArchivedGoals(arr) {
  localStorage.setItem(ARCHIVED_GOALS_KEY, JSON.stringify(arr));
}

// Called when a goal is finished to add it to the archive immediately.
function moveFinishedGoalToArchive(goal) {
  let archived = loadArchivedGoals();
  // Check if already archived (we compare startDate for uniqueness)
  if (!archived.some(g => g.startDate === goal.startDate)) {
    archived.push(goal);
    saveArchivedGoals(archived);
  }
}

// Render Main Goals active list: show goals that are not finished,
// or finished less than 24 hours ago.
function renderMainGoals() {
  const allGoals = loadMainGoals();
  const now = new Date();
  const dayInMs = 24 * 60 * 60 * 1000;
  // Show active goals (unfinished OR finished less than a day ago)
  const activeGoals = allGoals.filter(g => {
    return !g.completed || (g.completed && (now - new Date(g.endDate) < dayInMs));
  });
  
  const container = document.getElementById('mainGoalsList');
  container.innerHTML = '';
  
  activeGoals.forEach((goal, idx) => {
    const mainItem = document.createElement('div');
    mainItem.className = 'main-goal-item' + (goal.completed ? ' completed' : '');
    
    // Create header with two rows: top row (checkbox, goal name, delete button)
    // and bottom row (Add Subtask button)
    const headerDiv = document.createElement('div');
    
    const topRow = document.createElement('div');
    topRow.className = 'goal-top';
    
    const leftDiv = document.createElement('div');
    leftDiv.className = 'goal-left';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = goal.completed;
    checkbox.disabled = goal.completed;
    const goalLabel = document.createElement('span');
    goalLabel.textContent = goal.text;
    leftDiv.append(checkbox, goalLabel);
    
    const rightDiv = document.createElement('div');
    rightDiv.className = 'goal-right';
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    rightDiv.append(deleteBtn);
    
    topRow.append(leftDiv, rightDiv);
    
    // Bottom row for the "Add Subtask" button.
    const bottomRow = document.createElement('div');
    bottomRow.className = 'goal-bottom';
    const addSubtaskBtn = document.createElement('button');
    addSubtaskBtn.textContent = 'Add Subtask';
    addSubtaskBtn.className = 'add-subtask-btn';
    bottomRow.append(addSubtaskBtn);
    
    headerDiv.append(topRow, bottomRow);
    
    // Subtask container placed beneath the header.
    const subtaskContainer = document.createElement('div');
    subtaskContainer.className = 'subtask-container';

    if (goal.subtasks && goal.subtasks.length > 0) {
      goal.subtasks.forEach((subtask, subIdx) => {
        const subItem = document.createElement('div');
        subItem.className = 'subtask-item';
        
        const subLeftDiv = document.createElement('div');
        subLeftDiv.className = 'subtask-left';
        const subCheckbox = document.createElement('input');
        subCheckbox.type = 'checkbox';
        subCheckbox.checked = subtask.completed;
        const subLabel = document.createElement('span');
        subLabel.textContent = subtask.text;
        subLeftDiv.append(subCheckbox, subLabel);
        
        const subRightDiv = document.createElement('div');
        subRightDiv.className = 'subtask-right';
        const subDeleteBtn = document.createElement('button');
        subDeleteBtn.textContent = 'Delete';
        subDeleteBtn.className = 'delete-btn';
        subRightDiv.append(subDeleteBtn);
        
        subItem.append(subLeftDiv, subRightDiv);
        subtaskContainer.appendChild(subItem);
        
        subCheckbox.addEventListener('change', () => {
          subtask.completed = subCheckbox.checked;
          // If all subtasks are done then auto-complete the main goal.
          const doneCount = goal.subtasks.filter(s => s.completed).length;
          if (doneCount === goal.subtasks.length && goal.subtasks.length > 0) {
            goal.completed = true;
            goal.endDate = new Date().toISOString();
            checkbox.checked = true;
            checkbox.disabled = true;
            moveFinishedGoalToArchive(goal);
          }
          saveMainGoals(allGoals);
          renderMainGoals();
        });
        
        subDeleteBtn.addEventListener('click', () => {
          goal.subtasks.splice(subIdx, 1);
          saveMainGoals(allGoals);
          renderMainGoals();
        });
      });
      
      // Add progress indicator
      const progressIndicator = document.createElement('div');
      progressIndicator.className = 'progress-indicator';
      const doneCount = goal.subtasks.filter(s => s.completed).length;
      const total = goal.subtasks.length;
      const percentage = Math.round((doneCount / total) * 100);
      progressIndicator.textContent = `Progress: ${percentage}%`;
      subtaskContainer.appendChild(progressIndicator);
    }
    
    addSubtaskBtn.addEventListener('click', () => {
      if (subtaskContainer.querySelector('.subtask-input')) return;
      const subInput = document.createElement('input');
      subInput.placeholder = 'Enter subtask';
      subInput.className = 'subtask-input';
      const subSubmit = document.createElement('button');
      subSubmit.textContent = 'Submit';
      subSubmit.addEventListener('click', () => {
        const text = subInput.value.trim();
        if (text) {
          if (!goal.subtasks) goal.subtasks = [];
          goal.subtasks.push({ text: text, completed: false });
          saveMainGoals(allGoals);
          renderMainGoals();
        }
      });
      subtaskContainer.append(subInput, subSubmit);
      subInput.focus();
    });
    
    checkbox.addEventListener('change', () => {
      goal.completed = true;
      goal.endDate = new Date().toISOString();
      moveFinishedGoalToArchive(goal);
      saveMainGoals(allGoals);
      renderMainGoals();
    });
    
    deleteBtn.addEventListener('click', () => {
      // Remove from main goals storage.
      const unArchived = allGoals.filter((_, i) => i !== idx);
      saveMainGoals(unArchived);
      renderMainGoals();
    });
    
    mainItem.append(headerDiv, subtaskContainer);
    container.appendChild(mainItem);
  });
}

function addMainGoal() {
  const mainInput = document.getElementById('mainInput');
  const text = mainInput.value.trim();
  if (!text) return;
  const goals = loadMainGoals();
  goals.push({
    text: text,
    completed: false,
    subtasks: [],
    startDate: new Date().toISOString(),
    endDate: null
  });
  saveMainGoals(goals);
  mainInput.value = '';
  toggleMainAddUI(false);
  renderMainGoals();
}

function toggleMainAddUI(show) {
  const showInputMain = document.getElementById('showInputMain');
  const mainInput = document.getElementById('mainInput');
  const submitMain = document.getElementById('submitMain');
  if (show) {
    mainInput.style.display = 'block';
    submitMain.style.display = 'block';
    showInputMain.style.display = 'none';
    mainInput.focus();
  } else {
    mainInput.style.display = 'none';
    submitMain.style.display = 'none';
    showInputMain.style.display = 'inline-block';
  }
}

/*========================================================================
  ARCHIVED VIEW FUNCTIONALITY 
========================================================================*/
// Helper: Format ISO date string to "MM - DD - YYYY"
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const month = ('0' + (d.getMonth() + 1)).slice(-2);
  const day = ('0' + d.getDate()).slice(-2);
  const year = d.getFullYear();
  return `${month} - ${day} - ${year}`;
}

function showArchived() {
  // Load all finished main goals from MAIN_GOALS_KEY.
  const allGoals = loadMainGoals();
  const finishedGoals = allGoals.filter(g => g.completed);
  const archivedContainer = document.getElementById('archivedGoalsList');
  archivedContainer.innerHTML = '';
  finishedGoals.forEach(goal => {
    const div = document.createElement('div');
    div.textContent = `${goal.text} | Started: ${formatDate(goal.startDate)} | Ended: ${formatDate(goal.endDate)}`;
    archivedContainer.appendChild(div);
  });
  // Compute the percentage of daily goals finished yesterday.
  // (For now we use a dummy value—replace this logic with real calculations when available.)
  document.getElementById('dailyFinishedPct').textContent =
    'Yesterday Daily Goals Finished: 80%';
  // Show the overlay with an expand animation.
  const archiveOverlay = document.getElementById('archivedView');
  archiveOverlay.classList.add('show');
}

function hideArchived() {
  const archiveOverlay = document.getElementById('archivedView');
  archiveOverlay.classList.remove('show');
}

/*========================================================================
  EVENT LISTENERS & INITIALISATION
========================================================================*/
document.addEventListener('DOMContentLoaded', () => {
  let dailyGoals = loadDailyGoals();
  dailyGoals = dailyReset(dailyGoals);
  renderDailyGoals(dailyGoals);
  renderMainGoals();
});

document.getElementById('showInputDaily').addEventListener('click', () =>
  toggleDailyAddUI(true)
);
document.getElementById('submitDaily').addEventListener('click', addDailyGoal);
document.getElementById('dailyInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addDailyGoal();
});

document.getElementById('showInputMain').addEventListener('click', () =>
  toggleMainAddUI(true)
);
document.getElementById('submitMain').addEventListener('click', addMainGoal);
document.getElementById('mainInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addMainGoal();
});

document.getElementById('viewArchivedBtn').addEventListener('click', showArchived);
document.getElementById('closeArchivedBtn').addEventListener('click', hideArchived);
