
// DEPENDENCIES - Import required Node.js modules
const express = require('express');           // Web framework for creating server
const sqlite3 = require('sqlite3').verbose(); // SQLite database driver
const cors = require('cors');                 // Cross-Origin Resource Sharing
const bodyParser = require('body-parser');    // Parse incoming request bodies
const bcrypt = require('bcrypt');             // Password hashing library
const path = require('path');                 // File path utilities

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

const app = express();
const PORT = 3000;

app.use(cors());                                    // Enable CORS for all routes
app.use(bodyParser.json());                         // Parse JSON request bodies
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});
app.use(express.static(path.join(__dirname)));      // Serve static files (HTML, CSS, JS)

// DATA TYPE: Database Connection Object
// Creates a connection to the SQLite database file
const db = new sqlite3.Database('./workout_tracker.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database: workout_tracker.db');
  }
});

// ============================================================================
// TABLE CREATION - CREATE (part of CRUD)
// SQL DATA TYPES USED: INTEGER, TEXT, REAL, DATE, DATETIME
// ============================================================================

// TRANSACTION #1 - Database Initialization Transaction
// A transaction ensures all table creations succeed or fail together
// This maintains database integrity during setup
db.serialize(() => {
  console.log('🔧 Setting up database tables...');

  // Begin transaction for table creation
  db.run('BEGIN TRANSACTION');

  // ------------------------------------------------------------------------
  // TABLE 1: USERS TABLE
  // Stores user account information
  // ------------------------------------------------------------------------
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      -- INTEGER: Whole number, PRIMARY KEY: Unique identifier
      -- AUTOINCREMENT: Automatically increments for each new user
      
      username TEXT NOT NULL UNIQUE,
      -- TEXT: String data type for storing text
      -- NOT NULL: Field cannot be empty (DATA VALIDATION)
      -- UNIQUE: No two users can have same username (DATA VALIDATION)
      
      email TEXT NOT NULL UNIQUE,
      -- Stores email address, must be unique
      
      password_hash TEXT NOT NULL,
      -- Stores hashed password (never store plain text passwords!)
      
      full_name TEXT,
      -- Optional field for user's full name
      
      streak INTEGER DEFAULT 0,
      -- INTEGER: Stores consecutive workout days
      -- DEFAULT: Sets initial value to 0 (DATA MANIPULATION)
      
      total_workouts INTEGER DEFAULT 0,
      -- Tracks total number of workouts logged
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      -- DATETIME: Stores date and time
      -- DEFAULT CURRENT_TIMESTAMP: Auto-sets to creation time
      
      last_login DATETIME
      -- Tracks when user last logged in
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating users table:', err.message);
      db.run('ROLLBACK'); // Cancel transaction on error
    } else {
      console.log('✅ Users table created/verified');
    }
  });

  // ------------------------------------------------------------------------
  // TABLE 2: LOGGED_WORKOUTS TABLE
  // Stores individual workout entries
  // JOINABLE: Links to users table via user_id (FOREIGN KEY)
  // ------------------------------------------------------------------------
  db.run(`
    CREATE TABLE IF NOT EXISTS logged_workouts (
      workout_id INTEGER PRIMARY KEY AUTOINCREMENT,
      -- Unique identifier for each workout
      
      user_id INTEGER NOT NULL,
      -- FOREIGN KEY: References users.user_id (creates relationship)
      -- This makes tables JOINABLE - we can combine data from both tables
      
      exercise_name TEXT NOT NULL,
      -- Name of the exercise performed
      
      sets INTEGER NOT NULL CHECK(sets > 0),
      -- CHECK constraint: Ensures sets is always positive (DATA VALIDATION)
      
      reps INTEGER NOT NULL CHECK(reps > 0),
      -- CHECK constraint: Ensures reps is always positive
      
      weight REAL DEFAULT 0,
      -- REAL: Floating point number for decimal values (e.g., 135.5 lbs)
      -- Used for weight that might include decimals
      
      duration INTEGER NOT NULL,
      -- Duration in minutes (INTEGER is sufficient)
      
      difficulty TEXT CHECK(difficulty IN ('easy', 'moderate', 'hard', 'extreme')),
      -- CHECK with IN: Only allows specific values (DATA VALIDATION)
      
      workout_date DATE NOT NULL,
      -- DATE: Stores date without time component
      
      workout_time TEXT,
      -- Stores time of day workout was performed
      
      notes TEXT,
      -- Optional notes about the workout
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      -- Timestamp of when record was created
      
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      -- FOREIGN KEY CONSTRAINT: Creates relationship between tables
      -- ON DELETE CASCADE: If user is deleted, their workouts are also deleted
      -- This maintains REFERENTIAL INTEGRITY between tables
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating logged_workouts table:', err.message);
      db.run('ROLLBACK');
    } else {
      console.log('✅ Logged_workouts table created/verified');
    }
  });

 // ------------------------------------------------------------------------
  // TABLE 3: GOALS TABLE
  // Stores user fitness goals
  // JOINABLE: Links to users table via user_id (FOREIGN KEY)
  // ------------------------------------------------------------------------
  db.run(`
    CREATE TABLE IF NOT EXISTS goals (
      goal_id INTEGER PRIMARY KEY AUTOINCREMENT,
      -- INTEGER: Whole number, PRIMARY KEY: Unique identifier
      -- AUTOINCREMENT: Automatically increments for each new goal
      
      user_id INTEGER NOT NULL,
      -- FOREIGN KEY: References users.user_id (creates relationship)
      -- This makes tables JOINABLE - we can combine data from both tables
      
      goal_name TEXT NOT NULL,
      -- TEXT: Name/description of the goal (e.g., "1000 Push-ups")
      
      target_value INTEGER NOT NULL CHECK(target_value > 0),
      -- INTEGER: Target number to achieve
      -- CHECK constraint: Ensures target is always positive (DATA VALIDATION)
      
      current_progress INTEGER DEFAULT 0 CHECK(current_progress >= 0),
      -- INTEGER: Current progress toward goal
      -- DEFAULT: Sets initial value to 0 (DATA MANIPULATION)
      -- CHECK constraint: Progress cannot be negative
      
      deadline DATE,
      -- DATE: Target completion date (optional)
      
      is_completed INTEGER DEFAULT 0 CHECK(is_completed IN (0, 1)),
      -- INTEGER: Used as boolean (0 = false, 1 = true)
      -- SQLite doesn't have native boolean, so we use INTEGER with CHECK
      -- CHECK constraint: Only allows 0 or 1 (DATA VALIDATION)
      
      completed_date DATE,
      -- DATE: When goal was completed (NULL if not completed)
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      -- DATETIME: Timestamp of when goal was created
      
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      -- FOREIGN KEY CONSTRAINT: Creates relationship between tables
      -- ON DELETE CASCADE: If user is deleted, their goals are also deleted
      -- This maintains REFERENTIAL INTEGRITY between tables
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating goals table:', err.message);
      db.run('ROLLBACK');
    } else {
      console.log('✅ Goals table created/verified');
    }
  });

  // Commit transaction - makes all changes permanent
  db.run('COMMIT', (err) => {
    if (err) {
      console.error('❌ Transaction commit failed:', err.message);
    } else {
      console.log('✅ Database initialization transaction completed');
      
      // After tables are created, populate demo data
      populateDemoData();
    }
  });
});

// ============================================================================
// POPULATE DEMO USER DATA - Part of CREATE (CRUD)
// SQL POPULATION using INSERT statements
// ============================================================================

function populateDemoData() {
  console.log('📊 Checking for demo data...');

  // Check if demo user already exists
  db.get('SELECT user_id FROM users WHERE email = ?', ['demo@workout.com'], (err, row) => {
    if (err) {
      console.error('Error checking for demo user:', err.message);
      return;
    }

    if (row) {
      console.log('ℹ️  Demo user already exists. Skipping population.');
      return;
    }

    // TRANSACTION #2 - Demo Data Population Transaction
    // Ensures demo user and workouts are created together
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // Hash the password for security
      const hashedPassword = bcrypt.hashSync('Demo123!', 10);

      // INSERT demo user - SQL POPULATION
      db.run(`
        INSERT INTO users (username, email, password_hash, full_name, streak, total_workouts)
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['DemoUser', 'demo@workout.com', hashedPassword, 'Demo User', 7, 5],
      function(err) {
        if (err) {
          console.error('Error inserting demo user:', err.message);
          db.run('ROLLBACK');
          return;
        }

        const demoUserId = this.lastID;
        console.log(`✅ Demo user created with ID: ${demoUserId}`);

        // INSERT demo workouts - SQL POPULATION
        const demoWorkouts = [
          ['Push-ups', 3, 20, 0, 15, 'moderate', '2025-11-10', '07:30', 'Great morning workout!'],
          ['Squats', 4, 15, 135, 20, 'hard', '2025-11-11', '18:00', 'Legs are burning!'],
          ['Bench Press', 5, 10, 185, 30, 'hard', '2025-11-12', '12:00', 'New PR today!'],
          ['Pull-ups', 3, 12, 0, 18, 'moderate', '2025-11-12', '12:30', 'Added to chest day'],
          ['Deadlift', 4, 8, 225, 25, 'extreme', '2025-11-13', '17:00', 'Feeling strong!']
        ];

        const insertWorkout = db.prepare(`
          INSERT INTO logged_workouts 
          (user_id, exercise_name, sets, reps, weight, duration, difficulty, workout_date, workout_time, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        demoWorkouts.forEach(workout => {
          insertWorkout.run(demoUserId, ...workout);
        });

        

        insertWorkout.finalize((err) => {
          if (err) {
            console.error('Error inserting demo workouts:', err.message);
            db.run('ROLLBACK');
          } else {
            // INSERT demo goals - SQL POPULATION
        const demoGoals = [
          ['1000 Push-ups', 1000, 1000, '2025-11-15', 1, '2025-11-15'],
          ['500 Squats', 500, 350, '2025-12-01', 0, null],
          ['100 Pull-ups', 100, 45, '2025-11-30', 0, null]
        ];

        const insertGoal = db.prepare(`
          INSERT INTO goals 
          (user_id, goal_name, target_value, current_progress, deadline, is_completed, completed_date)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        demoGoals.forEach(goal => {
          insertGoal.run(demoUserId, ...goal);
        });

        insertGoal.finalize((err) => {
          if (err) {
            console.error('Error inserting demo goals:', err.message);
            db.run('ROLLBACK');
          } else {
            console.log('✅ Demo goals inserted');
          }
        });
            db.run('COMMIT', (err) => {
              if (err) {
                console.error('Transaction commit failed:', err.message);
              } else {
                console.log('✅ Demo data population completed successfully!');
                console.log('📧 Demo Login: demo@workout.com');
                console.log('🔑 Demo Password: Demo123!');
              }
            });
          }
        });
      });
    });
  });
}

// ============================================================================
// API ROUTES - CRUD OPERATIONS
// ============================================================================

// ----------------------------------------------------------------------------
// CREATE - User Registration (part of CRUD)
// ----------------------------------------------------------------------------
app.post('/api/register', (req, res) => {
  const { email, password, username, fullName } = req.body;

  // Hash password for security
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: 'Error hashing password' });
    }

    // SQL INSERT - Creating new user
    db.run(`
      INSERT INTO users (username, email, password_hash, full_name)
      VALUES (?, ?, ?, ?)
    `, [username, email, hash, fullName], function(err) {
      if (err) {
        return res.status(400).json({ error: 'User already exists or invalid data' });
      }

      res.json({
        message: 'User registered successfully',
        userId: this.lastID
      });
    });
  });
});

// ----------------------------------------------------------------------------
// READ - User Login (part of CRUD)
// Uses SELECT to read data from database
// ----------------------------------------------------------------------------
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // SQL SELECT - Reading user data
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password with stored hash
    bcrypt.compare(password, user.password_hash, (err, match) => {
      if (err || !match) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login timestamp - SQL UPDATE
      db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?', [user.user_id]);

      res.json({
        message: 'Login successful',
        user: {
          userId: user.user_id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          streak: user.streak,
          totalWorkouts: user.total_workouts
        }
      });
    });
  });
});

app.get('/api/user/:userId', (req, res) => {
  const userId = req.params.userId;

  // SQL SELECT - Reading fresh user data
  db.get('SELECT user_id, username, email, full_name, streak, total_workouts FROM users WHERE user_id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: user.user_id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      streak: user.streak,
      totalWorkouts: user.total_workouts
    });
  });
});

// ----------------------------------------------------------------------------
// CREATE - Log New Workout (part of CRUD)
// FORM INPUT population - Data comes from logging.html form
// ----------------------------------------------------------------------------
app.post('/api/workouts', (req, res) => {
  const {
    userId,
    exerciseName,
    sets,
    reps,
    weight,
    duration,
    difficulty,
    workoutDate,
    workoutTime,
    notes
  } = req.body;

  // TRANSACTION #3 - Workout Logging Transaction
  // Ensures workout is logged AND user stats are updated together
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Insert workout
    db.run(`
      INSERT INTO logged_workouts 
      (user_id, exercise_name, sets, reps, weight, duration, difficulty, workout_date, workout_time, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, exerciseName, sets, reps, weight, duration, difficulty, workoutDate, workoutTime, notes],
    function(err) {
      if (err) {
        console.error('Error logging workout:', err.message);
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Failed to log workout' });
      }

      const workoutId = this.lastID;

      // Update user's total workout count
      db.run(`
        UPDATE users 
        SET total_workouts = total_workouts + 1 
        WHERE user_id = ?
      `, [userId], (err) => {
        if (err) {
          console.error('Error updating user stats:', err.message);
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Failed to update stats' });
        }

        db.run('COMMIT', (err) => {
          if (err) {
            return res.status(500).json({ error: 'Transaction failed' });
          }

          res.json({
            message: 'Workout logged successfully',
            workoutId: workoutId
          });
        });
      });
    });
  });
});

// ----------------------------------------------------------------------------
// READ - Get User's Workouts (part of CRUD)
// FILTERING - Uses WHERE clause to filter by user_id
// SORTING - Uses ORDER BY to sort results by date (newest first)
// ----------------------------------------------------------------------------
app.get('/api/workouts/:userId', (req, res) => {
  const userId = req.params.userId;

  // SQL SELECT with FILTERING and SORTING
  db.all(`
    SELECT 
      workout_id,
      exercise_name,
      sets,
      reps,
      weight,
      duration,
      difficulty,
      workout_date,
      workout_time,
      notes,
      created_at
    FROM logged_workouts
    WHERE user_id = ?
    ORDER BY workout_date DESC, created_at DESC
    -- SORTING: ORDER BY sorts results by date (descending = newest first)
  `, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(rows);
  });
});

// ----------------------------------------------------------------------------
// READ - Get Workout Statistics with AGGREGATION and GROUPING
// AGGREGATING - Uses COUNT, SUM, AVG functions
// GROUPING - Uses GROUP BY to group data by exercise
// ----------------------------------------------------------------------------
app.get('/api/stats/:userId', (req, res) => {
  const userId = req.params.userId;

  // AGGREGATION Query - Calculate summary statistics
  db.get(`
    SELECT 
      COUNT(*) as total_workouts,
      -- AGGREGATION: COUNT counts total number of records
      
      SUM(sets * reps) as total_reps,
      -- AGGREGATION: SUM adds up all calculated rep totals
      
      SUM(weight) as total_weight,
      -- AGGREGATION: SUM adds up all weight lifted
      
      SUM(duration) as total_duration,
      -- AGGREGATION: SUM adds up all workout durations
      
      AVG(duration) as avg_duration,
      -- AGGREGATION: AVG calculates average workout duration
      
      MAX(weight) as max_weight
      -- AGGREGATION: MAX finds highest weight lifted
    FROM logged_workouts
    WHERE user_id = ?
  `, [userId], (err, stats) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(stats);
  });
});

// ----------------------------------------------------------------------------
// READ - Get Exercise Breakdown with GROUPING
// GROUPING - Groups workouts by exercise name and counts them
// SORTING - Orders by frequency (most performed exercises first)
// ----------------------------------------------------------------------------
app.get('/api/exercise-breakdown/:userId', (req, res) => {
  const userId = req.params.userId;

  db.all(`
    SELECT 
      exercise_name,
      COUNT(*) as session_count,
      -- GROUPING: Count how many times each exercise was performed
      
      SUM(sets * reps) as total_reps,
      AVG(weight) as avg_weight,
      MAX(weight) as max_weight
    FROM logged_workouts
    WHERE user_id = ?
    GROUP BY exercise_name
    -- GROUPING: GROUP BY combines rows with same exercise_name
    
    ORDER BY session_count DESC
    -- SORTING: Show most frequently performed exercises first
    
    LIMIT 10
  `, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(rows);
  });
});

// ----------------------------------------------------------------------------
// READ - Get Recent Workouts with SUBQUERY
// SUBQUERY - Uses nested SELECT to get dates with workouts
// ----------------------------------------------------------------------------
app.get('/api/recent-workouts/:userId', (req, res) => {
  const userId = req.params.userId;

  db.all(`
    SELECT 
      workout_id,
      exercise_name,
      sets,
      reps,
      weight,
      duration,
      workout_date
    FROM logged_workouts
    WHERE user_id = ?
    AND workout_date IN (
      -- SUBQUERY: This nested SELECT finds the 5 most recent workout dates
      SELECT DISTINCT workout_date
      FROM logged_workouts
      WHERE user_id = ?
      ORDER BY workout_date DESC
      LIMIT 5
    )
    ORDER BY workout_date DESC, created_at DESC
  `, [userId, userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(rows);
  });
});

// ----------------------------------------------------------------------------
// UPDATE - Edit Workout (part of CRUD)
// ----------------------------------------------------------------------------
app.put('/api/workouts/:workoutId', (req, res) => {
  const workoutId = req.params.workoutId;
  const {
    exerciseName,
    sets,
    reps,
    weight,
    duration,
    difficulty,
    notes
  } = req.body;

  // SQL UPDATE - Modifying existing workout
  db.run(`
    UPDATE logged_workouts
    SET 
      exercise_name = ?,
      sets = ?,
      reps = ?,
      weight = ?,
      duration = ?,
      difficulty = ?,
      notes = ?
    WHERE workout_id = ?
  `, [exerciseName, sets, reps, weight, duration, difficulty, notes, workoutId],
  function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update workout' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    res.json({ message: 'Workout updated successfully' });
  });
});

// ----------------------------------------------------------------------------
// DELETE - Delete Workout (part of CRUD)
// ----------------------------------------------------------------------------
app.delete('/api/workouts/:workoutId', (req, res) => {
  const workoutId = req.params.workoutId;

  // TRANSACTION #4 - Workout Deletion Transaction
  // Ensures workout is deleted AND user stats are updated together
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Get user_id before deleting
    db.get('SELECT user_id FROM logged_workouts WHERE workout_id = ?', [workoutId], (err, row) => {
      if (err || !row) {
        db.run('ROLLBACK');
        return res.status(404).json({ error: 'Workout not found' });
      }

      const userId = row.user_id;

      // SQL DELETE - Removing workout record
      db.run('DELETE FROM logged_workouts WHERE workout_id = ?', [workoutId], function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Failed to delete workout' });
        }

        // Update user's total workout count
        db.run(`
          UPDATE users 
          SET total_workouts = total_workouts - 1 
          WHERE user_id = ?
        `, [userId], (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Failed to update stats' });
          }

          db.run('COMMIT', (err) => {
            if (err) {
              return res.status(500).json({ error: 'Transaction failed' });
            }

            res.json({ message: 'Workout deleted successfully' });
          });
        });
      });
    });
  });
});

// ============================================================================
// GOALS API ROUTES - CRUD OPERATIONS FOR GOALS
// ============================================================================

// ----------------------------------------------------------------------------
// CREATE - Create New Goal (part of CRUD)
// FORM INPUT population - Data comes from goals.html form
// ----------------------------------------------------------------------------
app.post('/api/goals', (req, res) => {
  const { userId, goalName, targetValue, deadline } = req.body;

  // Validate required fields
  if (!userId || !goalName || !targetValue) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // SQL INSERT - Creating new goal
  db.run(`
    INSERT INTO goals (user_id, goal_name, target_value, deadline)
    VALUES (?, ?, ?, ?)
  `, [userId, goalName, targetValue, deadline || null], function(err) {
    if (err) {
      console.error('Error creating goal:', err.message);
      return res.status(500).json({ error: 'Failed to create goal' });
    }

    res.json({
      message: 'Goal created successfully',
      goalId: this.lastID
    });
  });
});

// ----------------------------------------------------------------------------
// READ - Get User's Goals (part of CRUD)
// FILTERING - Uses WHERE clause to filter by user_id
// SORTING - Uses ORDER BY to sort results
// ----------------------------------------------------------------------------
app.get('/api/goals/:userId', (req, res) => {
  const userId = req.params.userId;

  // SQL SELECT with FILTERING and SORTING
  db.all(`
    SELECT 
      goal_id,
      goal_name,
      target_value,
      current_progress,
      deadline,
      is_completed,
      completed_date,
      created_at
    FROM goals
    WHERE user_id = ?
    -- FILTERING: WHERE clause filters goals for specific user
    
    ORDER BY 
      is_completed ASC,
      deadline ASC,
      created_at DESC
    -- SORTING: Show active goals first, then by deadline, then by creation date
    -- ASC = ascending (0 before 1, so incomplete goals show first)
    -- DESC = descending (newest first)
  `, [userId], (err, rows) => {
    if (err) {
      console.error('Error fetching goals:', err.message);
      return res.status(500).json({ error: 'Failed to fetch goals' });
    }

    res.json(rows);
  });
});

// ----------------------------------------------------------------------------
// UPDATE - Update Goal Progress (part of CRUD)
// ----------------------------------------------------------------------------
app.put('/api/goals/:goalId/progress', (req, res) => {
  const goalId = req.params.goalId;
  const { progress } = req.body;

  // TRANSACTION #5 - Goal Progress Update Transaction
  // Updates progress and checks if goal is completed
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Get goal details first
    db.get('SELECT target_value FROM goals WHERE goal_id = ?', [goalId], (err, goal) => {
      if (err || !goal) {
        db.run('ROLLBACK');
        return res.status(404).json({ error: 'Goal not found' });
      }

      const isCompleted = progress >= goal.target_value ? 1 : 0;
      const completedDate = isCompleted ? new Date().toISOString().split('T')[0] : null;

      // Update goal with new progress
      db.run(`
        UPDATE goals
        SET 
          current_progress = ?,
          is_completed = ?,
          completed_date = ?
        WHERE goal_id = ?
      `, [progress, isCompleted, completedDate, goalId], function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Failed to update goal' });
        }

        db.run('COMMIT', (err) => {
          if (err) {
            return res.status(500).json({ error: 'Transaction failed' });
          }

          res.json({
            message: 'Goal updated successfully',
            isCompleted: isCompleted === 1
          });
        });
      });
    });
  });
});

// ----------------------------------------------------------------------------
// DELETE - Delete Goal (part of CRUD)
// ----------------------------------------------------------------------------
app.delete('/api/goals/:goalId', (req, res) => {
  const goalId = req.params.goalId;

  // SQL DELETE - Removing goal record
  db.run('DELETE FROM goals WHERE goal_id = ?', [goalId], function(err) {
    if (err) {
      console.error('Error deleting goal:', err.message);
      return res.status(500).json({ error: 'Failed to delete goal' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully' });
  });
});

// ----------------------------------------------------------------------------
// BONUS: JOIN QUERY - Combines data from users and logged_workouts tables
// Shows user information alongside their workout data
// ----------------------------------------------------------------------------
app.get('/api/user-workouts/:userId', (req, res) => {
  const userId = req.params.userId;

  // SQL JOIN - Combines users and logged_workouts tables
  db.all(`
    SELECT 
      u.username,
      u.email,
      u.full_name,
      u.streak,
      u.total_workouts,
      w.workout_id,
      w.exercise_name,
      w.sets,
      w.reps,
      w.weight,
      w.duration,
      w.difficulty,
      w.workout_date,
      w.notes
    FROM users u
    INNER JOIN logged_workouts w ON u.user_id = w.user_id
    -- INNER JOIN: Combines rows from both tables where user_id matches
    -- u.user_id = w.user_id is the JOIN condition (links the tables)
    
    WHERE u.user_id = ?
    ORDER BY w.workout_date DESC
  `, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(rows);
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('');
  console.log('================================================================================');
  console.log('🔥 WACKY WORKOUT TRACKER SERVER STARTED 🔥');
  console.log('================================================================================');
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`📂 Serving static files from: ${__dirname}`);
  console.log(`💾 Database: workout_tracker.db`);
  console.log('');
  console.log('📋 Available endpoints:');
  console.log('   POST   /api/register');
  console.log('   POST   /api/login');
  console.log('   POST   /api/workouts');
  console.log('   GET    /api/workouts/:userId');
  console.log('   GET    /api/stats/:userId');
  console.log('   GET    /api/exercise-breakdown/:userId');
  console.log('   GET    /api/recent-workouts/:userId');
  console.log('   GET    /api/user-workouts/:userId (JOIN query)');
  console.log('   PUT    /api/workouts/:workoutId');
  console.log('   DELETE /api/workouts/:workoutId');
  console.log('================================================================================');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
});