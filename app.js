// STATIC DATA (will be replaced with SQL/Python backend)


const staticWorkouts = [
  {
    id: 1,
    exercise: 'Push-ups',
    sets: 3,
    reps: 20,
    duration: 15,
    weight: 0,
    date: '2025-10-20',
    difficulty: 'moderate'
  },
  {
    id: 2,
    exercise: 'Squats',
    sets: 4,
    reps: 15,
    duration: 20,
    weight: 135,
    date: '2025-10-21'
  },
  {
    id: 3,
    exercise: 'Bench Press',
    sets: 5,
    reps: 10,
    duration: 30,
    weight: 185,
    date: '2025-10-22'
  },
  {
    id: 4,
    exercise: 'Pull-ups',
    sets: 3,
    reps: 12,
    duration: 18,
    weight: 0,
    date: '2025-10-22'
  },
  {
    id: 5,
    exercise: 'Deadlift',
    sets: 4,
    reps: 8,
    duration: 25,
    weight: 225,
    date: '2025-10-23'
  }
];

const staticGoals = [
  {
    id: 1,
    name: '1000 Push-ups',
    target: 1000,
    progress: 1000,
    deadline: '2025-10-15',
    completed: true
  },
  {
    id: 2,
    name: '500 Squats',
    target: 500,
    progress: 350,
    deadline: '2025-11-01',
    completed: false
  },
  {
    id: 3,
    name: '100 Pull-ups',
    target: 100,
    progress: 45,
    deadline: '2025-10-30',
    completed: false
  }
];


// VARIABLE EXAMPLE - let keyword declares a block-scoped variable that CAN be changed/reassigned
// Type: Boolean (true/false value)
// Can be changed: YES - let variables can be reassigned to new values
// Example: secretAccessGranted starts as false but can be changed to true when password is correct
let secretAccessGranted = false;

// Secret password for accessing hidden section
const SECRET_PASSWORD = "WACKY2025";


// THEME MANAGEMENT - Load saved theme on page load
// This code runs immediately when the script loads to apply the saved theme preference
// Uses sessionStorage to persist theme choice across page navigation (but not after closing browser)
(function() {
  const savedTheme = sessionStorage.getItem('wackyWorkoutTheme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }
})();


// Logout functionality
// EVENT LISTENER - This code demonstrates how event listeners work
// addEventListener() attaches an event handler to the document that waits for DOMContentLoaded event
// When the DOM is fully loaded, the callback function executes, setting up click handlers
// The click event listener on logoutBtn waits for user clicks and triggers the logout confirmation
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to logout?')) {
        window.location.href = 'login.html';
      }
    });
  }
});




function getWorkouts() {
  return staticWorkouts;
}


function getGoals() {
  return staticGoals;
}


function getStreak() {
  return 7;
}


function notify(title, body, tag) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, tag });
  }
}


function calculateStats(workouts) {
  return {
    total: workouts.length,
    reps: workouts.reduce((sum, w) => sum + (w.sets * w.reps), 0),
    weight: workouts.reduce((sum, w) => sum + w.weight, 0),
    duration: workouts.reduce((sum, w) => sum + w.duration, 0)
  };
}



// FORM VALIDATION - Email validation function
function validateEmail(email) {
  // Regular expression pattern to check if email format is valid
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

// FORM VALIDATION - Validates workout form inputs
function validateWorkoutForm(exerciseName, sets, reps, duration, weight) {
  // CONTROL FLOW - Type: if/else conditional statements
  // Why used: To check different validation conditions and execute different code paths
  // What it does: Tests each input value against validation rules - if a test fails, 
  // an alert is shown and function returns false to prevent form submission
  // Each if statement checks a specific condition, and only if all pass does the function return true
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

// CHANGE FORMATTING - Change theme/appearance with sessionStorage persistence
// This version saves the theme preference only for the current session
// sessionStorage stores the theme choice ('light' or 'dark') until the browser is closed
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle('light-mode');
  
  // Save theme preference to sessionStorage (only lasts for current session)
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
// How it works: 
// 1. Takes an array of workout objects as a parameter
// 2. Uses the reduce() method to iterate through each workout in the array
// 3. For each workout, it adds the workout's values (sets, reps, weight, duration) to running totals
// 4. The accumulator object 'totals' starts with all values at 0
// 5. After processing all workouts, returns an object containing the summed totals
// 6. The || 0 provides a default value of 0 if a property is undefined
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
    
    // Placeholder for Python backend integration
    
    alert('Form submitted successfully! Data will be processed by Python backend.');
    form.reset();
  }
}