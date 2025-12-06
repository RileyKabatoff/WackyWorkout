# Wacky Workout Tracker 

A full-stack fitness tracking web application built with **Flask (Python)**, **SQLite**, and **JavaScript**. Track your workouts, set goals, visualize your progress, and maintain your fitness streak!

![Version](https://img.shields.io/badge/version-1.0.0-red)
![Python](https://img.shields.io/badge/python-3.8+-blue)
![Flask](https://img.shields.io/badge/flask-3.0.0-green)

---

## Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Using the Application](#-using-the-application)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Technologies Used](#-technologies-used)
- [Troubleshooting](#-troubleshooting)
- [Credits](#-credits)

---

## Features

### Core Functionality
- **User Authentication** - Register new accounts and secure login
- **Workout Logging** - Track exercises with sets, reps, weight, duration, and notes
- **Goal Setting** - Create fitness goals with target values and deadlines
- **Progress Tracking** - Visual progress bars showing goal completion
- **Streak Counter** - Track consecutive workout days
- **Search & Filter** - Find workouts quickly by exercise name
- **Dark/Light Mode** - Toggle between themes for comfort

### Advanced Features
- **Python Data Visualizations**
  - Weekly performance line charts
  - Exercise distribution pie charts
  - Strength progress bar charts
  - Custom date range analysis
- **Training Volume Calculator** - Automatic calculation of Sets × Reps × Weight
- **7-Day Summary** - Quick overview of recent training
- **Top Exercises Ranking** - See your most frequent exercises
- **Secret Stats Section** - Hidden advanced analytics (Password: `WACKY2025`)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8 or higher** - [Download Python](https://www.python.org/downloads/)
- **pip** (Python package manager - comes with Python)
- **Web Browser** (Chrome, Firefox, Safari, Edge)

### Check Your Python Version
```bash
python --version
# or
python3 --version
```

---

## Installation

### Step 1: Extract Project Files

Unzip the project folder and ensure you have the following structure:

```
wacky-workout-tracker/
│
├── app.py                      # Flask backend server
├── workout_tracker.db          # SQLite database
├── requirements.txt            # Python dependencies
├── README.md                   # This file
│
└── static/                     # Frontend files
    ├── index.html              # Dashboard page
    ├── logging.html            # Log workout page
    ├── login.html              # Login/register page
    ├── goals.html              # Goals management page
    ├── progress.html           # Progress visualizations page
    ├── about.html              # About/FAQ page
    ├── app.js                  # JavaScript utilities
    └── styles.css              # Styling
```

### Step 2: Install Required Python Packages

Open a terminal/command prompt in the project directory and run:

```bash
pip install -r requirements.txt
```

Or if you're using Python 3 explicitly:

```bash
pip3 install -r requirements.txt
```

This will install:
- Flask 3.0.0 (Web framework)
- Flask-CORS 4.0.0 (Cross-origin resource sharing)
- matplotlib 3.8.2 (Data visualization)
- numpy 1.26.2 (Numerical operations)
- Werkzeug 3.0.1 (WSGI utilities)

If its telling you pip doesnt exist even though you know you set your venv to this folder and youre getting really frustrated because it dumb and stupid and you want to throw your computer I EVEN CREATED A NEW FUCKING VENV AND ITS NOT WORKING

slap this into your powershell
.venv\Scripts\Activate.ps1 

---

## Running the Application

### Start the Flask Server

1. **Navigate to the project directory** in your terminal:
   ```bash
   cd path/to/wacky-workout-tracker
   ```

2. **Run the Flask application**:
   ```bash
   python app.py
   ```
   
   Or with Python 3:
   ```bash
   python3 app.py
   ```

3. **You should see output like this:**
   ```
   Starting Wacky Workout Tracker Flask Server...
   Server running at http://localhost:5000
   Press CTRL+C to stop the server
    * Serving Flask app 'app'
    * Debug mode: on
    * Running on http://127.0.0.1:5000
   ```

### Access the Application

4. **Open your web browser** and navigate to:
   ```
   http://localhost:5000
   ```

5. **You should see the login page!**

### Stop the Server

To stop the Flask server, press:
- **Windows:** `CTRL + C`
- **Mac/Linux:** `CTRL + C` or `CMD + C`

---

## Using the Application

### First Time Setup

#### Option 1: Use Demo Account
The fastest way to explore the app:
- **Email:** `demo@workout.com`
- **Password:** `Demo123!`

#### Option 2: Create New Account
1. Click **"Sign up here"** on the login page
2. Fill in:
   - Full Name
   - Username
   - Email
   - Password (minimum 6 characters)
   - Confirm Password
3. Click **"CREATE ACCOUNT"**
4. Log in with your new credentials

---

## Features Guide

### 1. Dashboard (index.html)
**What you can do:**
- View your current streak
- See total statistics (workouts, reps, weight, minutes)
- Browse your 5 most recent workouts
- Search workouts by exercise name
- Delete workouts
- Access secret advanced statistics (Password: `WACKY2025`)
- Toggle dark/light mode

### 2. Log Workout (logging.html)
**How to log a workout:**
1. Enter exercise name (e.g., "Push-ups", "Squats")
2. Enter sets and reps
3. Enter duration in minutes
4. Enter weight in lbs (optional - enter 0 for bodyweight)
5. Select workout date (defaults to today)
6. Choose difficulty level (easy/moderate/hard/extreme)
7. Optionally add time of day
8. Optionally add workout notes
9. Click **"LOG WORKOUT"**

**Tips:**
- Character counter shows how long your notes are
- You can add multiple exercises (currently logs one at a time)
- Date defaults to today but can be changed for past workouts

### 3. Goals (goals.html)
**Creating a goal:**
1. Enter goal name (e.g., "1000 Push-ups", "Run 50 miles")
2. Enter target number
3. Select deadline date
4. Click **"CREATE GOAL"**

**Goal tracking:**
- Progress bars show completion percentage
- Goals automatically track based on matching exercise names
- Completed goals turn green ✅
- Delete goals when no longer needed

### 4. Progress (progress.html)
**Available visualizations:**

1. **Custom Analysis Tool**
   - Select start and end dates
   - Choose metric (workout count, reps, or weight)
   - Generate personalized charts

2. **Weekly Performance Chart**
   - Line graph showing last 7 days
   - Tracks workout frequency and total reps

3. **Exercise Distribution**
   - Pie chart showing exercise breakdown
   - Identifies training balance

4. **Strength Progress**
   - Bar chart comparing average vs maximum weights
   - Shows strength gains per exercise

5. **Training Volume Calculator**
   - Calculates total volume (Sets × Reps × Weight)
   - Breaks down by exercise

6. **Last 7 Days Summary**
   - Daily cards showing workout stats
   - Quick overview of recent activity

7. **Top 5 Exercises**
   - Ranked list of most frequent exercises

### 5. About (about.html)
- Meet the creators
- Frequently Asked Questions
- Fitness resources

---

## Project Structure

### Backend (Python/Flask)
**File:** `app.py` (900 lines)

**Key Components:**
- `WorkoutAnalyzer` class - Handles workout data analysis
- `calculate_volume` lambda - Calculates training volume
- Database functions - SQLite connection and queries
- API endpoints - 15 REST API routes
- Visualization endpoints - Generate matplotlib charts

**Database:** `workout_tracker.db` (SQLite)

**Tables:**
- `users` - User accounts and authentication
- `workouts` - Workout logs with all details
- `goals` - User fitness goals with progress tracking

### Frontend (HTML/CSS/JavaScript)
**Files:**
- `index.html` - Dashboard with statistics
- `logging.html` - Workout logging form
- `goals.html` - Goal management interface
- `progress.html` - Data visualizations
- `about.html` - Information and FAQ
- `login.html` - Authentication
- `styles.css` - Complete styling (826 lines)
- `app.js` - Frontend utilities (478 lines)

---

## API Endpoints

### Authentication
- `POST /api/register` - Create new user
- `POST /api/login` - Authenticate user

### Workouts
- `GET /api/workouts/<user_id>` - Get all workouts
- `POST /api/workouts` - Create workout
- `DELETE /api/workouts/<workout_id>` - Delete workout

### Goals
- `GET /api/goals/<user_id>` - Get all goals
- `POST /api/goals` - Create goal
- `DELETE /api/goals/<goal_id>` - Delete goal

### Statistics
- `GET /api/user/<user_id>` - Get user profile with streak
- `GET /api/stats/<user_id>` - Get aggregate statistics

### Visualizations (using python)
- `GET /api/python/visualize/weekly/<user_id>` - Weekly chart
- `GET /api/python/visualize/exercises/<user_id>` - Exercise pie chart
- `GET /api/python/visualize/strength/<user_id>` - Strength bar chart
- `GET /api/python/calculate/volume/<user_id>` - Training volume
- `POST /api/python/visualize/custom` - Custom date range chart

**All endpoints return JSON with appropriate HTTP status codes:**
- 200 OK - Success
- 201 Created - Resource created
- 400 Bad Request - Invalid input
- 401 Unauthorized - Authentication failed
- 404 Not Found - Resource not found
- 500 Internal Server Error - Server error

---

## Technologies Used

### Backend
- **Python 3.8+** - Programming language
- **Flask 3.0.0** - Web framework
- **SQLite** - Database
- **matplotlib 3.8.2** - Data visualization
- **numpy 1.26.2** - Numerical operations

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with dark/light mode
- **JavaScript (ES6+)** - Interactivity and API calls
- **Fetch API** - Asynchronous HTTP requests

### Features
- **RESTful API** - Clean API design
- **CORS Enabled** - Cross-origin requests
- **Session Storage** - Client-side user sessions
- **Base64 Encoding** - Image data transmission
- **Responsive Design** - Mobile-friendly layouts

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "Port 5000 is already in use"
**Problem:** Another application is using port 5000

**Solution A:** Kill the process using port 5000
- **Windows:**
  ```bash
  netstat -ano | findstr :5000
  taskkill /PID <PID_NUMBER> /F
  ```
- **Mac/Linux:**
  ```bash
  lsof -ti:5000 | xargs kill -9
  ```

**Solution B:** Change the port in `app.py` (line 856):
```python
app.run(debug=True, host='0.0.0.0', port=5001)
```
Then access at: `http://localhost:5001`

---

#### 2. "ModuleNotFoundError: No module named 'flask'"
**Problem:** Required packages not installed

**Solution:** Install packages:
```bash
pip install -r requirements.txt
```

If that doesn't work, install individually:
```bash
pip install Flask==3.0.0
pip install Flask-CORS==4.0.0
pip install matplotlib==3.8.2
pip install numpy==1.26.2
```

---

#### 3. Charts not loading on Progress page
**Problem:** Python visualization endpoints not responding

**Troubleshooting:**
1. Check Flask server is running (terminal should show no errors)
2. Check browser console for errors (F12 → Console tab)
3. Verify you have workout data logged
4. Ensure matplotlib is installed:
   ```bash
   pip show matplotlib
   ```

**Common Error:** "No data available"
- **Cause:** No workouts logged yet
- **Solution:** Log some workouts first on the Logging page

---

#### 4. "Database connection failed"
**Problem:** Database file missing or corrupted

**Solution:**
1. Ensure `workout_tracker.db` is in the same directory as `app.py`
2. Check file permissions (should be readable/writable)
3. If corrupted, restore from backup or recreate database

---

#### 5. Login not working
**Problem:** Invalid credentials or session issues

**Solutions:**
- **For demo account:** Use exactly `demo@workout.com` / `Demo123!`
- **For new accounts:** Password must be at least 6 characters
- **Clear browser cache:** CTRL+SHIFT+DELETE
- **Try incognito/private mode**
- **Check browser console for errors** (F12)

---

#### 6. "CORS policy" errors in browser console
**Problem:** Cross-origin request blocked

**Solution:** Ensure Flask-CORS is installed and enabled (should be automatic)
```bash
pip install Flask-CORS
```

Verify in `app.py` line 22:
```python
CORS(app)  # This should be present
```

---

#### 7. Images/Charts showing as broken
**Problem:** Base64 encoding issue or API error

**Check:**
1. Look in browser console for error messages
2. Check Flask terminal for Python errors
3. Verify user has logged workouts
4. Test API endpoint directly: `http://localhost:5000/api/python/visualize/weekly/1`

---

#### 8. Styling looks broken or missing
**Problem:** CSS file not loading

**Solution:**
1. Verify `styles.css` is in the `static/` folder
2. Check browser console for 404 errors
3. Hard refresh: CTRL+SHIFT+R (Windows) or CMD+SHIFT+R (Mac)
4. Clear browser cache

---

#### 9. "Cannot connect to localhost"
**Problem:** Flask server not running

**Solution:**
1. Make sure you ran `python app.py`
2. Check terminal for error messages
3. Look for the line: `Running on http://127.0.0.1:5000`
4. Verify no firewall blocking port 5000

---

#### 10. Python version issues
**Problem:** Using Python 2.x instead of 3.x

**Check version:**
```bash
python --version
```

**If version is 2.x, use Python 3 explicitly:**
```bash
python3 app.py
pip3 install -r requirements.txt
```

---

### Still Having Issues?

1. **Check Flask Terminal Output** - Look for error messages
2. **Check Browser Console** - Press F12 → Console tab
3. **Verify File Structure** - Ensure all files are in correct locations
4. **Check Database** - Ensure `workout_tracker.db` exists
5. **Restart Everything:**
   ```bash
   # Stop Flask server (CTRL+C)
   # Restart
   python app.py
   # Refresh browser (CTRL+SHIFT+R)
   ```


## Credits

**Created by:** Riley Kabatoff & Patrick Barr  
**Organization:** Riley and Patrick Group LTD  
**Course:** NETA 1245 Intro to programming & Database  
**Institution:** Red Deer College  
**Date:** December 2024

**Purpose:** This application was created to solve the problem of forgetting workout details and losing track of fitness progress. We built it for ourselves and hope others find it useful too!

---

## License

This project is created for educational purposes as part of a college programming course.

---

## Future Enhancements

Potential features for future versions:
- Export workout data to CSV/Excel
- Exercise library with instructions
- Workout templates and routines
- Social features (share achievements)
- Mobile app version
- Integration with fitness trackers
- Nutrition tracking
- Progressive overload calculator
- Exercise form videos
- AI-powered workout recommendations

---

## Support

For questions or issues:
- **Email:** Riley.kabatoff@rdpolytech.ca/Patrick.barr@rdpolytech.ca


**Made with 💪 and Python**
