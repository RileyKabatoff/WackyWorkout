// USER SESSION MANAGEMENT
// FIX: Instead of loading currentUser once, create a function that always gets fresh data
function getCurrentUser() {
  const userData = sessionStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : null;
}

// Initialize currentUser
let currentUser = getCurrentUser();

// Helper function to check if user is logged in
function requireAuth() {
  currentUser = getCurrentUser(); // CRITICAL: Refresh user data from sessionStorage
  if (!currentUser) {
    alert('Please log in to access this page');
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`http://localhost:3000${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'API request failed');
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}


// VARIABLE EXAMPLE - let keyword declares a block-scoped variable that CAN be changed/reassigned
let secretAccessGranted = false;

// Secret password for accessing hidden section
const SECRET_PASSWORD = "WACKY2025";


// THEME MANAGEMENT - Load saved theme on page load
(function() {
  const savedTheme = sessionStorage.getItem('wackyWorkoutTheme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }
})();


// Logout functionality
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to logout?')) {
        // Clear session storage
        sessionStorage.removeItem('currentUser');
        currentUser = null; // Also clear the variable
        
        // Redirect to login page
        window.location.href = 'login.html';
      }
    });
  }
});




// FETCH WORKOUTS FROM DATABASE - Uses API call to server
async function getWorkouts() {
  currentUser = getCurrentUser(); // FIX: Always refresh user data
  if (!currentUser) return [];
  
  try {
    const workouts = await apiCall(`/api/workouts/${currentUser.userId}`);
    return workouts;
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return [];
  }
}


// FETCH GOALS FROM DATABASE - Uses API call to server
async function getGoals() {
  currentUser = getCurrentUser(); // FIX: Always refresh user data
  if (!currentUser) return [];
  
  try {
    const goals = await apiCall(`/api/goals/${currentUser.userId}`);
    return goals;
  } catch (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
}


async function getStreak() {
  currentUser = getCurrentUser(); // FIX: Always refresh user data
  if (!currentUser) return 0;
  
  try {
    const userData = await apiCall(`/api/user/${currentUser.userId}`);
    return userData.streak || 0; // Changed to always default to 0
  } catch (error) {
    console.error('Error fetching streak:', error);
<<<<<<< HEAD
    return 0; // Changed to return 0 instead of cached value
=======
    return currentUser ? currentUser.streak : 0;
>>>>>>> befb0c2fda1fc86263898742a0d5ab13d1d55f6a
  }
}


function notify(title, body, tag) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, tag });
  }
}


async function calculateStats() {
  currentUser = getCurrentUser(); // FIX: Always refresh user data
  if (!currentUser) return { total: 0, reps: 0, weight: 0, duration: 0 };
  
  try {
    const stats = await apiCall(`/api/stats/${currentUser.userId}`);
    return {
      total: stats.total_workouts || 0,
      reps: stats.total_reps || 0,
      weight: stats.total_weight || 0,
      duration: stats.total_duration || 0
    };
  } catch (error) {
    console.error('Error calculating stats:', error);
    return { total: 0, reps: 0, weight: 0, duration: 0 };
  }
}



function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

// FORM VALIDATION - Validates workout form inputs
function validateWorkoutForm(exerciseName, sets, reps, duration, weight) {
  if (!exerciseName || exerciseName.trim() === '') {
    alert('Please enter an exercise name');
    return false;
  }
  
  if (isNaN(sets) || sets <= 0) {
    alert('Sets must be a positive number');
    return false;
  }
  
  if (isNaN(reps) || reps <= 0) {
    alert('Reps must be a positive number');
    return false;
  }
  
  if (isNaN(duration) || duration <= 0) {
    alert('Duration must be a positive number');
    return false;
  }
  
  if (isNaN(weight) || weight < 0) {
    alert('Weight must be a non-negative number');
    return false;
  }
  
  return true;
}


function validateInputOnType(inputElement, validationType) {
  inputElement.addEventListener('input', function() {
    const value = this.value;
    let isValid = true;
    
    switch(validationType) {
      case 'email':
        isValid = validateEmail(value);
        break;
      case 'number':
        isValid = !isNaN(value) && value > 0;
        break;
      case 'text':
        isValid = value.trim().length > 0;
        break;
    }
    
    if (value === '') {
      this.style.borderColor = '#dc2626';
    } else if (isValid) {
      this.style.borderColor = '#34d399';
    } else {
      this.style.borderColor = '#ef4444';
    }
  });
}



// CHANGE FORMATTING - Toggle visibility of elements
function toggleElement(elementId) {
  const element = document.getElementById(elementId);
  if (element.style.display === 'none' || element.style.display === '') {
    element.style.display = 'block';
  } else {
    element.style.display = 'none';
  }
}

<<<<<<< HEAD
// CHANGE FORMATTING - Change theme/appearance with sessionStorage persistence
=======
// CHANGE FORMATTING - Change theme/appearance
>>>>>>> befb0c2fda1fc86263898742a0d5ab13d1d55f6a
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle('light-mode');
  
  if (body.classList.contains('light-mode')) {
    sessionStorage.setItem('wackyWorkoutTheme', 'light');
  } else {
    sessionStorage.setItem('wackyWorkoutTheme', 'dark');
  }
}

// CHANGE HTML CONTENT - Updates text content of an element
function updateStreakDisplay(streakCount) {
  const streakElement = document.getElementById('streakNumber');
  if (streakElement) {
    streakElement.textContent = streakCount;
  }
}


// ADD/REMOVE ELEMENT - Dynamically add input fields
function addExerciseField() {
  const container = document.getElementById('exerciseFieldsContainer');
  if (container) {
    const newField = document.createElement('div');
    newField.className = 'form-group';
    newField.innerHTML = `
      <input type="text" placeholder="Additional exercise" class="dynamic-exercise-field">
      <button type="button" onclick="removeExerciseField(this)" class="btn btn-secondary" style="width: auto; padding: 0.5rem 1rem; margin-top: 0.5rem;">Remove</button>
    `;
    container.appendChild(newField);
  }
}

// ADD/REMOVE ELEMENT - Remove dynamically added fields
function removeExerciseField(button) {
  const fieldContainer = button.parentElement;
  fieldContainer.remove();
}



// SECRET SECTION - Check password and grant access
function checkSecretPassword() {
  const passwordInput = document.getElementById('secretPasswordInput');
  const secretSection = document.getElementById('secretSection');
  const passwordError = document.getElementById('passwordError');
  
  if (passwordInput && passwordInput.value === SECRET_PASSWORD) {
    secretAccessGranted = true;
    if (secretSection) {
      secretSection.style.display = 'block';
    }
    if (passwordError) {
      passwordError.style.display = 'none';
    }
    passwordInput.value = '';
    alert('Access granted! Welcome to the secret statistics section.');
  } else {
    if (passwordError) {
      passwordError.style.display = 'block';
      passwordError.textContent = 'Incorrect password. Try again.';
    }
  }
}


// ADDITIONAL COMPONENT 1 - Real-time character counter for textarea
function updateCharacterCount(textareaId, counterId) {
  const textarea = document.getElementById(textareaId);
  const counter = document.getElementById(counterId);
  
  if (textarea && counter) {
    const currentLength = textarea.value.length;
    counter.textContent = `${currentLength} characters`;
  }
}

// ADDITIONAL COMPONENT 2 - Filter workout list by exercise type
function filterWorkouts(searchTerm) {
  const workoutItems = document.querySelectorAll('.workout-item');
  
  workoutItems.forEach(item => {
    const exerciseName = item.querySelector('.workout-name').textContent.toLowerCase();
    if (exerciseName.includes(searchTerm.toLowerCase())) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}



// FUNCTION EXPLANATION - calculateTotalProgress()
function calculateTotalProgress(workouts) {
  return workouts.reduce((totals, workout) => {
    totals.totalSets += workout.sets || 0;
    totals.totalReps += (workout.sets * workout.reps) || 0;
    totals.totalWeight += workout.weight || 0;
    totals.totalDuration += workout.duration || 0;
    return totals;
  }, { totalSets: 0, totalReps: 0, totalWeight: 0, totalDuration: 0 });
}



// INITIATE ACTION - Form submit handler
function handleFormSubmit(event, formId) {
  event.preventDefault();
  
  const form = document.getElementById(formId);
  if (form) {
    const formData = new FormData(form);
    console.log('Form submitted:', Object.fromEntries(formData));
    
    alert('Form submitted successfully! Data will be processed by Python backend.');
    form.reset();
  }
}