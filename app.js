// Authentication helper
function checkAuth() {
  const user = localStorage.getItem('wackyUser');
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return JSON.parse(user);
}

// Logout functionality
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      const user = JSON.parse(localStorage.getItem('wackyUser'));
      if (user) {
        notify('Logged Out', `See you soon, ${user.name}!`, 'logout');
      }
      localStorage.removeItem('wackyUser');
      window.location.href = 'login.html';
    });
  }
});

// Data retrieval functions
function getWorkouts() {
  const workouts = localStorage.getItem('wackyWorkouts');
  return workouts ? JSON.parse(workouts) : [];
}

function getGoals() {
  const goals = localStorage.getItem('wackyGoals');
  return goals ? JSON.parse(goals) : [];
}

function getStreak() {
  const streak = localStorage.getItem('wackyStreak');
  return streak ? parseInt(streak) : 0;
}

// Notification helper
function notify(title, body, tag) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, tag });
  }
}