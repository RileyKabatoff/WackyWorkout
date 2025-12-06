# Wacky Workout Tracker - System Architecture Diagram

```
╔════════════════════════════════════════════════════════════════════════════╗
║                            USER'S WEB BROWSER                              ║
║                         http://localhost:5000                              ║
╚════════════════════════════════════════════════════════════════════════════╝
                                    │
                                    │ HTTP Request
                                    ↓
╔════════════════════════════════════════════════════════════════════════════╗
║                     FLASK PYTHON SERVER (Port 5000)                        ║
║                                                                            ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │                    STATIC FILE SERVING                            │    ║
║  │  • login.html, index.html, progress.html, etc.                   │    ║
║  │  • styles.css (styling)                                           │    ║
║  │  • app.js (frontend JavaScript)                                   │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                                                            ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │              PYTHON VISUALIZATION ENDPOINTS                       │    ║
║  │                                                                    │    ║
║  │  GET /api/python/visualize/weekly/<user_id>                      │    ║
║  │     └─→ Line chart (workout trends)                              │    ║
║  │                                                                    │    ║
║  │  GET /api/python/visualize/exercises/<user_id>                   │    ║
║  │     └─→ Pie chart (exercise distribution)                        │    ║
║  │                                                                    │    ║
║  │  GET /api/python/visualize/strength/<user_id>                    │    ║
║  │     └─→ Bar chart (strength progression)                         │    ║
║  │                                                                    │    ║
║  │  POST /api/python/visualize/custom                               │    ║
║  │     └─→ Custom chart (user-defined parameters)                   │    ║
║  │                                                                    │    ║
║  │  GET /api/python/calculate/volume/<user_id>                      │    ║
║  │     └─→ Training volume statistics                               │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                                                            ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │                  PYTHON LIBRARIES                                 │    ║
║  │  • Matplotlib - Chart generation                                 │    ║
║  │  • NumPy - Numerical calculations                                │    ║
║  │  • SQLite3 - Database queries                                    │    ║
║  │  • Base64 - Image encoding                                       │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
╚════════════════════════════════════════════════════════════════════════════╝
                                    │
                                    │ SQL Queries (Read-Only)
                                    ↓
╔════════════════════════════════════════════════════════════════════════════╗
║                        SQLite DATABASE                                     ║
║                      workout_tracker.db                                    ║
║                                                                            ║
║  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐             ║
║  │  users         │  │  workouts      │  │  goals         │             ║
║  ├────────────────┤  ├────────────────┤  ├────────────────┤             ║
║  │• user_id (PK)  │  │• workout_id(PK)│  │• goal_id (PK)  │             ║
║  │• username      │  │• user_id (FK)  │  │• user_id (FK)  │             ║
║  │• email         │  │• exercise_name │  │• goal_name     │             ║
║  │• password      │  │• sets          │  │• target_value  │             ║
║  │• full_name     │  │• reps          │  │• current_prog. │             ║
║  │• streak        │  │• weight        │  │• deadline      │             ║
║  │• created_at    │  │• duration      │  │• is_completed  │             ║
║  └────────────────┘  │• workout_date  │  └────────────────┘             ║
║                      │• difficulty    │                                   ║
║                      │• notes         │                                   ║
║                      └────────────────┘                                   ║
╚════════════════════════════════════════════════════════════════════════════╝
                                    ↑
                                    │ SQL Queries (Read/Write)
                                    │
╔════════════════════════════════════════════════════════════════════════════╗
║                    EXPRESS NODE.JS SERVER (Port 3000)                      ║
║                                                                            ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │                 AUTHENTICATION ENDPOINTS                          │    ║
║  │                                                                    │    ║
║  │  POST /api/register                                               │    ║
║  │     └─→ Create new user account (bcrypt password hashing)        │    ║
║  │                                                                    │    ║
║  │  POST /api/login                                                  │    ║
║  │     └─→ Authenticate user, return session data                   │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                                                            ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │                    WORKOUT CRUD ENDPOINTS                         │    ║
║  │                                                                    │    ║
║  │  GET    /api/workouts/<user_id>                                  │    ║
║  │  POST   /api/workouts                                             │    ║
║  │  DELETE /api/workouts/<workout_id>                               │    ║
║  │                                                                    │    ║
║  │  GET    /api/stats/<user_id>                                     │    ║
║  │  GET    /api/user/<user_id>                                      │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                                                            ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │                     GOAL ENDPOINTS                                │    ║
║  │                                                                    │    ║
║  │  GET    /api/goals/<user_id>                                     │    ║
║  │  POST   /api/goals                                                │    ║
║  │  DELETE /api/goals/<goal_id>                                     │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                                                            ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │                    NODE.JS LIBRARIES                              │    ║
║  │  • Express - Web framework                                        │    ║
║  │  • bcrypt - Password hashing                                      │    ║
║  │  • SQLite3 - Database operations                                  │    ║
║  │  • CORS - Cross-origin support                                    │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
╚════════════════════════════════════════════════════════════════════════════╝
                                    ↑
                                    │ API Calls (AJAX/Fetch)
                                    │
╔════════════════════════════════════════════════════════════════════════════╗
║                        FRONTEND JAVASCRIPT (app.js)                        ║
║                                                                            ║
║  • User authentication logic                                              ║
║  • Form validation and submission                                         ║
║  • API calls to both Express (3000) and Flask (5000)                     ║
║  • DOM manipulation and UI updates                                        ║
║  • Session management (sessionStorage)                                    ║
║  • Theme toggling (dark/light mode)                                       ║
╚════════════════════════════════════════════════════════════════════════════╝


═══════════════════════════════════════════════════════════════════════════
                            DATA FLOW EXAMPLES
═══════════════════════════════════════════════════════════════════════════

EXAMPLE 1: User Logs In
─────────────────────────
1. User enters email/password in login.html
2. app.js sends POST to Express:3000/api/login
3. Express queries users table in database
4. Express validates password with bcrypt
5. Express returns user data (200 OK)
6. app.js stores user in sessionStorage
7. Browser redirects to index.html

EXAMPLE 2: User Logs Workout
─────────────────────────────
1. User fills form in logging.html
2. app.js sends POST to Express:3000/api/workouts
3. Express validates data
4. Express inserts into workouts table
5. Express returns success (201 Created)
6. app.js redirects to dashboard
7. Dashboard fetches updated workout list

EXAMPLE 3: User Views Progress Charts
──────────────────────────────────────
1. User navigates to progress.html
2. app.js sends GET to Flask:5000/api/python/visualize/weekly/1
3. Flask queries workouts table for last 7 days
4. Flask aggregates data (COUNT, SUM)
5. Flask generates matplotlib line chart
6. Flask encodes chart as base64 PNG
7. Flask returns JSON with image data (200 OK)
8. app.js displays image in <img> tag

EXAMPLE 4: User Creates Custom Chart
─────────────────────────────────────
1. User selects date range and metric in form
2. app.js sends POST to Flask:5000/api/python/visualize/custom
3. Flask parses JSON request body
4. Flask queries database with date filters
5. Flask generates chart based on selected metric
6. Flask returns base64 image (200 OK)
7. app.js updates custom chart container

EXAMPLE 5: User Sets Goal
──────────────────────────
1. User fills goal form in goals.html
2. app.js sends POST to Express:3000/api/goals
3. Express validates goal data
4. Express inserts into goals table
5. Express returns success (201 Created)
6. app.js re-fetches and displays updated goals list


═══════════════════════════════════════════════════════════════════════════
                         SEPARATION OF CONCERNS
═══════════════════════════════════════════════════════════════════════════

LAYER 1: PRESENTATION (Frontend)
─────────────────────────────────
Files: HTML, CSS, JavaScript in static/
Responsibility: 
  • Display UI to user
  • Handle user interactions
  • Validate form inputs
  • Make API calls
  • Update DOM based on responses
Does NOT:
  • Access database directly
  • Perform business logic
  • Store sensitive data

LAYER 2: BUSINESS LOGIC (Express)
──────────────────────────────────
Files: server.js
Responsibility:
  • User authentication
  • Password encryption
  • CRUD operations
  • Data validation
  • Session management
Does NOT:
  • Generate visualizations
  • Perform complex analytics
  • Serve static files

LAYER 3: ANALYTICS (Flask/Python)
──────────────────────────────────
Files: app.py
Responsibility:
  • Data visualization
  • Statistical calculations
  • Chart generation
  • Complex aggregations
  • Serve static files
Does NOT:
  • Handle authentication
  • Modify database (read-only for analytics)
  • Manage user sessions

LAYER 4: DATA PERSISTENCE (SQLite)
───────────────────────────────────
Files: workout_tracker.db
Responsibility:
  • Store all application data
  • Maintain data integrity
  • Support queries from backends
Does NOT:
  • Expose itself to frontend
  • Perform business logic
  • Generate visualizations


═══════════════════════════════════════════════════════════════════════════
                            TECHNOLOGY STACK
═══════════════════════════════════════════════════════════════════════════

Frontend Technologies:
  • HTML5 - Semantic markup
  • CSS3 - Styling with gradients, flexbox, grid
  • Vanilla JavaScript - No frameworks, modern ES6+

Backend Technologies:
  • Node.js v14+ - JavaScript runtime
  • Express.js v5 - Web application framework
  • Python 3.8+ - Data science backend
  • Flask 3.0 - Python web framework

Database:
  • SQLite 3 - Embedded relational database

Libraries & Packages:
  • bcrypt - Password hashing
  • CORS - Cross-origin resource sharing
  • Matplotlib - Chart generation
  • NumPy - Numerical computing
  • Body-parser - Request parsing

Development Tools:
  • npm - Node package manager
  • pip - Python package manager
  • sessionStorage - Client-side storage


═══════════════════════════════════════════════════════════════════════════
                         SECURITY CONSIDERATIONS
═══════════════════════════════════════════════════════════════════════════

1. Password Security:
   • Passwords hashed with bcrypt (10 rounds)
   • Never stored in plain text
   • Salt automatically generated

2. SQL Injection Prevention:
   • Parameterized queries used throughout
   • User input sanitized
   • No string concatenation in SQL

3. Session Management:
   • User data stored in sessionStorage
   • No sensitive data in localStorage
   • Session cleared on logout

4. CORS Configuration:
   • Configured for local development
   • Production should restrict origins

5. Input Validation:
   • Frontend validation for UX
   • Backend validation for security
   • Type checking on all inputs
```
