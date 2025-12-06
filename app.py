# Flask Backend Application
# This is the unified Python backend that handles ALL functionality:
# - User authentication
# - CRUD operations for workouts and goals
# - Data visualization and statistics
# - Serving frontend files

# ALOT OF THIS FILE IS FROM OLD server.js 
# HAD TO SWAP FROM EXPRESS TO FLASK SO EVERYTHING HAD TO DO IN A app.py FILE


from flask import Flask, render_template, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime, timedelta
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import base64
from functools import reduce

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

DATABASE = 'workout_tracker.db'
#Initialize database with required tables and demo data
#Automatic init_database() function with demo data
def init_database():
    
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            streak INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS workouts (
            workout_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            exercise_name TEXT NOT NULL,
            sets INTEGER NOT NULL,
            reps INTEGER NOT NULL,
            duration INTEGER NOT NULL,
            weight REAL DEFAULT 0,
            workout_date DATE NOT NULL,
            difficulty TEXT,
            workout_time TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS goals (
            goal_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            goal_name TEXT NOT NULL,
            target_value INTEGER NOT NULL,
            current_progress INTEGER DEFAULT 0,
            deadline DATE,
            is_completed BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    ''')
    
    cursor.execute('''
        INSERT OR IGNORE INTO users (user_id, full_name, username, email, password, streak)
        VALUES (1, 'Demo User', 'demo', 'demo@workout.com', 'Demo123!', 5)
    ''')
    
    cursor.execute('''
        INSERT OR IGNORE INTO workouts (workout_id, user_id, exercise_name, sets, reps, duration, weight, workout_date, difficulty)
        VALUES 
            (1, 1, 'Push-ups', 3, 15, 10, 0, date('now', '-2 days'), 'moderate'),
            (2, 1, 'Squats', 4, 12, 15, 135, date('now', '-2 days'), 'hard'),
            (3, 1, 'Pull-ups', 3, 8, 10, 0, date('now', '-1 day'), 'hard'),
            (4, 1, 'Bench Press', 4, 10, 20, 185, date('now', '-1 day'), 'moderate'),
            (5, 1, 'Deadlift', 3, 8, 15, 225, date('now'), 'hard'),
            (6, 1, 'Running', 1, 1, 30, 0, date('now'), 'moderate')
    ''')
    
    cursor.execute('''
        INSERT OR IGNORE INTO goals (goal_id, user_id, goal_name, target_value, current_progress, deadline)
        VALUES 
            (1, 1, '1000 Push-ups', 1000, 350, date('now', '+30 days')),
            (2, 1, '500 Pull-ups', 500, 150, date('now', '+45 days')),
            (3, 1, 'Bench Press 200lbs', 200, 185, date('now', '+60 days'))
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database initialized successfully!")

def get_db_connection():

    try:
        conn = sqlite3.connect(DATABASE)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        # Exception Handling
        # This try-except block handles potential SQLite connection errors.
        # If the database file is missing, corrupted, or locked, this will catch
        # the exception and raise a custom error message instead of crashing the app.
        raise Exception(f"Database connection failed: {str(e)}")


class WorkoutAnalyzer:
    # Class *THIS IS NEWWWW*
    # This class encapsulates all workout analysis logic, demonstrating object-oriented programming principles.
    # It maintains separation of concerns by grouping related analytical methods together.
    # The class takes a user_id and provides methods to analyze workout data, calculate statistics, and generate visualizations.
    # This follows the Single Responsibility Principle 
    # the class is solely responsible for workout data analysis.

    
    def __init__(self, user_id):
        self.user_id = user_id
        self.conn = get_db_connection()
    
    def get_user_workouts(self):

        cursor = self.conn.execute(
            'SELECT * FROM workouts WHERE user_id = ? ORDER BY workout_date DESC',
            (self.user_id,)
        )
        return cursor.fetchall()
    
    def calculate_weekly_stats(self):
        # Calculate workout statistics for the past 7 days

        seven_days_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
        
        cursor = self.conn.execute('''
            SELECT 
                workout_date,
                COUNT(*) as workout_count,
                SUM(sets * reps) as total_reps,
                SUM(weight) as total_weight,
                SUM(duration) as total_duration
            FROM workouts
            WHERE user_id = ? AND workout_date >= ?
            GROUP BY workout_date
            ORDER BY workout_date
        ''', (self.user_id, seven_days_ago))
        
        return cursor.fetchall()
    
    def get_exercise_distribution(self):

        cursor = self.conn.execute('''
            SELECT exercise_name, COUNT(*) as count
            FROM workouts
            WHERE user_id = ?
            GROUP BY exercise_name
            ORDER BY count DESC
            LIMIT 10
        ''', (self.user_id,))
        
        return cursor.fetchall()
    
    def calculate_strength_progress(self):

        cursor = self.conn.execute('''
            SELECT 
                exercise_name,
                AVG(weight) as avg_weight,
                MAX(weight) as max_weight
            FROM workouts
            WHERE user_id = ? AND weight > 0
            GROUP BY exercise_name
            ORDER BY avg_weight DESC
            LIMIT 8
        ''', (self.user_id,))
        
        return cursor.fetchall()
    
    def close(self):
        # Close database connection

        self.conn.close()


# Lambda Function *SUPER NEW AS WELL*
# This lambda function calculates the total volume (sets × reps × weight) for a workout.
# Lambda functions are anonymous, inline functions useful for simple operations.
# Here it's used as a callback for data transformation, demonstrating functional programming.
# The lambda takes a workout row and returns the calculated volume metric.
calculate_volume = lambda workout: workout['sets'] * workout['reps'] * workout['weight']


@app.route('/')
def index():
    # Serve the main login page

    return send_from_directory('static', 'login.html')


@app.route('/<path:path>')
def serve_static(path):
    # Serve static files
    return send_from_directory('static', path)


# AUTHENTICATION ENDPOINTS


@app.route('/api/register', methods=['POST']) #POST
def register():

    try:
        data = request.get_json()
        full_name = data.get('fullName')
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not all([full_name, username, email, password]):
            return jsonify({'error': 'All fields are required'}), 400
        
        conn = get_db_connection()
        try:
            conn.execute('''
                INSERT INTO users (full_name, username, email, password, streak, created_at)
                VALUES (?, ?, ?, ?, 0, datetime('now'))
            ''', (full_name, username, email, password))
            conn.commit()
            
            return jsonify({'message': 'User created successfully'}), 201
            
        except sqlite3.IntegrityError:
            return jsonify({'error': 'Username or email already exists'}), 400
        finally:
            conn.close()
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/login', methods=['POST']) #post
def login():

    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        conn = get_db_connection()
        user = conn.execute(
            'SELECT * FROM users WHERE email = ?',
            (email,)
        ).fetchone()
        conn.close()
        
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        if password == user['password']:
            return jsonify({
                'user': {
                    'userId': user['user_id'],
                    'username': user['username'],
                    'email': user['email'],
                    'fullName': user['full_name'],
                    'streak': user['streak']
                }
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# WORKOUT CRUD ENDPOINTS

@app.route('/api/workouts/<int:user_id>', methods=['GET']) #GET
def get_workouts(user_id):

    try:
        conn = get_db_connection()
        workouts = conn.execute('''
            SELECT * FROM workouts 
            WHERE user_id = ? 
            ORDER BY workout_date DESC, created_at DESC
        ''', (user_id,)).fetchall()
        conn.close()
        
        return jsonify([dict(w) for w in workouts]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/workouts', methods=['POST'])
def create_workout():

    try:
        data = request.get_json()
        
        required_fields = ['userId', 'exerciseName', 'sets', 'reps', 'duration', 'weight', 'workoutDate']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        conn = get_db_connection()
        cursor = conn.execute('''
            INSERT INTO workouts 
            (user_id, exercise_name, sets, reps, duration, weight, workout_date, difficulty, workout_time, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ''', (
            data['userId'],
            data['exerciseName'],
            data['sets'],
            data['reps'],
            data['duration'],
            data['weight'],
            data['workoutDate'],
            data.get('difficulty'),
            data.get('workoutTime'),
            data.get('notes')
        ))
        
        workout_id = cursor.lastrowid
        
        update_user_streak(conn, data['userId'])
        update_goal_progress(conn, data['userId'], data['exerciseName'], data['sets'] * data['reps'])
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Workout created', 'workoutId': workout_id}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/workouts/<int:workout_id>', methods=['DELETE']) #DELETE
def delete_workout(workout_id):

    try:
        conn = get_db_connection()
        conn.execute('DELETE FROM workouts WHERE workout_id = ?', (workout_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Workout deleted'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/stats/<int:user_id>', methods=['GET']) #GET
def get_user_stats(user_id):

    try:
        conn = get_db_connection()
        stats = conn.execute('''
            SELECT 
                COUNT(*) as total_workouts,
                COALESCE(SUM(sets * reps), 0) as total_reps,
                COALESCE(SUM(weight), 0) as total_weight,
                COALESCE(SUM(duration), 0) as total_duration
            FROM workouts
            WHERE user_id = ?
        ''', (user_id,)).fetchone()
        conn.close()
        
        return jsonify(dict(stats)), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/user/<int:user_id>', methods=['GET']) #GET
def get_user(user_id):

    try:
        conn = get_db_connection()
        user = conn.execute(
            'SELECT user_id, username, email, full_name, streak FROM users WHERE user_id = ?',
            (user_id,)
        ).fetchone()
        conn.close()
        
        if user:
            return jsonify(dict(user)), 200
        else:
            return jsonify({'error': 'User not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# GOAL ENDPOINTS

@app.route('/api/goals/<int:user_id>', methods=['GET']) #GET
def get_goals(user_id):

    try:
        conn = get_db_connection()
        goals = conn.execute('''
            SELECT * FROM goals 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        ''', (user_id,)).fetchall()
        conn.close()
        
        return jsonify([dict(g) for g in goals]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/goals', methods=['POST']) #POST
def create_goal():

    try:
        data = request.get_json()
        
        if not all(k in data for k in ['userId', 'goalName', 'targetValue']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        conn = get_db_connection()
        cursor = conn.execute('''
            INSERT INTO goals 
            (user_id, goal_name, target_value, current_progress, deadline, is_completed, created_at)
            VALUES (?, ?, ?, 0, ?, 0, datetime('now'))
        ''', (
            data['userId'],
            data['goalName'],
            data['targetValue'],
            data.get('deadline')
        ))
        
        goal_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Goal created', 'goalId': goal_id}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/goals/<int:goal_id>', methods=['DELETE']) #DELETE
def delete_goal(goal_id):

    try:
        conn = get_db_connection()
        conn.execute('DELETE FROM goals WHERE goal_id = ?', (goal_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Goal deleted'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# HELPER FUNCTIONS

def update_user_streak(conn, user_id):

    try:
        last_workout = conn.execute('''
            SELECT MAX(workout_date) as last_date
            FROM workouts
            WHERE user_id = ?
        ''', (user_id,)).fetchone()
        
        if last_workout and last_workout['last_date']:
            today = datetime.now().date()
            last_date = datetime.strptime(last_workout['last_date'], '%Y-%m-%d').date()
            
            if last_date == today:
                pass  
            elif (today - last_date).days == 1:
                conn.execute('UPDATE users SET streak = streak + 1 WHERE user_id = ?', (user_id,))
            else:
                conn.execute('UPDATE users SET streak = 1 WHERE user_id = ?', (user_id,))
    except Exception as e:
        print(f"Error updating streak: {e}")


def update_goal_progress(conn, user_id, exercise_name, reps_completed):

    try:
        goals = conn.execute('''
            SELECT goal_id, goal_name, target_value, current_progress
            FROM goals
            WHERE user_id = ? AND is_completed = 0
        ''', (user_id,)).fetchall()
        
        for goal in goals:
            if exercise_name.lower() in goal['goal_name'].lower():
                new_progress = goal['current_progress'] + reps_completed
                is_completed = 1 if new_progress >= goal['target_value'] else 0
                
                conn.execute('''
                    UPDATE goals 
                    SET current_progress = ?, is_completed = ?
                    WHERE goal_id = ?
                ''', (new_progress, is_completed, goal['goal_id']))
                
    except Exception as e:
        print(f"Error updating goal progress: {e}")


# PYTHON VISUALIZATION ENDPOINTS

# This endpoint uses the GET HTTP method to retrieve workout statistics.
# GET is appropriate here because we're fetching data without modifying server state.
# The endpoint returns JSON data with a 200 status code on success or 500 on error.
@app.route('/api/python/stats/<int:user_id>', methods=['GET'])
def get_python_stats(user_id):

    try:
        analyzer = WorkoutAnalyzer(user_id)
        
        # Get weekly stats
        weekly_stats = analyzer.calculate_weekly_stats()
        
        # Get exercise distribution
        exercise_dist = analyzer.get_exercise_distribution()
        
        # Get strength progress
        strength_progress = analyzer.calculate_strength_progress()
        
        analyzer.close()
        
        # Format data for frontend
        weekly_data = {
            'dates': [row['workout_date'] for row in weekly_stats],
            'workouts': [row['workout_count'] for row in weekly_stats],
            'reps': [row['total_reps'] for row in weekly_stats],
            'weight': [row['total_weight'] for row in weekly_stats],
            'duration': [row['total_duration'] for row in weekly_stats]
        }
        
        exercise_data = {
            'labels': [row['exercise_name'] for row in exercise_dist],
            'counts': [row['count'] for row in exercise_dist]
        }
        
        strength_data = {
            'exercises': [row['exercise_name'] for row in strength_progress],
            'avg_weights': [float(row['avg_weight']) for row in strength_progress],
            'max_weights': [float(row['max_weight']) for row in strength_progress]
        }
        
        return jsonify({
            'success': True,
            'weekly': weekly_data,
            'exercises': exercise_data,
            'strength': strength_data
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/python/visualize/weekly/<int:user_id>', methods=['GET'])
def visualize_weekly(user_id):
    # Visual 1
    # This generates a line chart showing workout metrics over the past 7 days.
    # A line chart is appropriate here because:
    # 1. It shows trends over time effectively
    # 2. Multiple metrics can be displayed on the same chart for comparison
    # 3. Users can see patterns in their workout frequency and intensity
    # 4. The continuous lines help identify upward/downward trends in performance
    # This temporal visualization helps users understand their consistency and progress.

    try:
        analyzer = WorkoutAnalyzer(user_id)
        weekly_stats = analyzer.calculate_weekly_stats()
        analyzer.close()
        
        if not weekly_stats:
            return jsonify({'error': 'No data available'}), 404
        
        # Extract data
        dates = [row['workout_date'] for row in weekly_stats]
        workouts = [row['workout_count'] for row in weekly_stats]
        reps = [row['total_reps'] or 0 for row in weekly_stats]
        
        # Create figure
        fig, ax1 = plt.subplots(figsize=(10, 6))
        
        # Plot workout count
        color = '#dc2626'
        ax1.set_xlabel('Date', fontsize=12, fontweight='bold')
        ax1.set_ylabel('Workout Count', color=color, fontsize=12, fontweight='bold')
        ax1.plot(dates, workouts, color=color, marker='o', linewidth=2, label='Workouts')
        ax1.tick_params(axis='y', labelcolor=color)
        ax1.grid(True, alpha=0.3)
        
        # Create second y-axis for reps
        ax2 = ax1.twinx()
        color = '#059669'
        ax2.set_ylabel('Total Reps', color=color, fontsize=12, fontweight='bold')
        ax2.plot(dates, reps, color=color, marker='s', linewidth=2, label='Reps')
        ax2.tick_params(axis='y', labelcolor=color)
        
        plt.title('Weekly Workout Performance', fontsize=14, fontweight='bold', pad=20)
        plt.xticks(rotation=45, ha='right')
        fig.tight_layout()
        
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', dpi=100, bbox_inches='tight')
        img_buffer.seek(0)
        img_base64 = base64.b64encode(img_buffer.read()).decode()
        plt.close()
        
        return jsonify({
            'success': True,
            'image': f'data:image/png;base64,{img_base64}'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/python/visualize/exercises/<int:user_id>', methods=['GET'])
def visualize_exercises(user_id):
    # Visual 2
    # This generates a pie chart showing exercise distribution.
    # A pie chart is appropriate here because:
    # 1. It effectively shows proportions and percentages of a whole
    # 2. Users can quickly see which exercises dominate their routine
    # 3. The visual makes it easy to identify imbalanced workout programs
    # 4. Color-coded segments provide immediate visual understanding
    # 5. Percentages help users see if they're diversifying their workouts
    # This helps users understand the composition of their workout routine at a glance.

    try:
        analyzer = WorkoutAnalyzer(user_id)
        exercise_dist = analyzer.get_exercise_distribution()
        analyzer.close()
        
        if not exercise_dist:
            return jsonify({'error': 'No data available'}), 404
        
        # Extract data
        labels = [row['exercise_name'] for row in exercise_dist]
        counts = [row['count'] for row in exercise_dist]
        
        # Create pie chart
        fig, ax = plt.subplots(figsize=(10, 8))
        colors = plt.cm.Reds(range(50, 250, 200//len(labels)))
        
        wedges, texts, autotexts = ax.pie(
            counts,
            labels=labels,
            autopct='%1.1f%%',
            colors=colors,
            startangle=90,
            textprops={'fontsize': 10, 'fontweight': 'bold'}
        )
        
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontsize(11)
            autotext.set_fontweight('bold')
        
        plt.title('Exercise Distribution', fontsize=14, fontweight='bold', pad=20)
        plt.axis('equal')
        
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', dpi=100, bbox_inches='tight')
        img_buffer.seek(0)
        img_base64 = base64.b64encode(img_buffer.read()).decode()
        plt.close()
        
        return jsonify({
            'success': True,
            'image': f'data:image/png;base64,{img_base64}'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/python/visualize/strength/<int:user_id>', methods=['GET'])
def visualize_strength(user_id):
    # Additional Visual
    # This generates a bar chart showing strength progression per exercise.
    # Bar charts are ideal for comparing discrete categories (exercises) and showing
    # both average and maximum values side-by-side. This helps users identify which
    # exercises they're progressing in and where they might be plateauing.

    try:
        analyzer = WorkoutAnalyzer(user_id)
        strength_data = analyzer.calculate_strength_progress()
        analyzer.close()
        
        if not strength_data:
            return jsonify({'error': 'No data available'}), 404
        
        # Extract data
        exercises = [row['exercise_name'] for row in strength_data]
        avg_weights = [float(row['avg_weight']) for row in strength_data]
        max_weights = [float(row['max_weight']) for row in strength_data]
        
        # Create bar chart
        fig, ax = plt.subplots(figsize=(12, 6))
        x = range(len(exercises))
        width = 0.35
        
        bars1 = ax.bar([i - width/2 for i in x], avg_weights, width, 
                       label='Average Weight', color='#dc2626', alpha=0.8)
        bars2 = ax.bar([i + width/2 for i in x], max_weights, width,
                       label='Max Weight', color='#059669', alpha=0.8)
        
        ax.set_xlabel('Exercise', fontsize=12, fontweight='bold')
        ax.set_ylabel('Weight (lbs)', fontsize=12, fontweight='bold')
        ax.set_title('Strength Progress by Exercise', fontsize=14, fontweight='bold', pad=20)
        ax.set_xticks(x)
        ax.set_xticklabels(exercises, rotation=45, ha='right')
        ax.legend()
        ax.grid(True, axis='y', alpha=0.3)
        
        fig.tight_layout()
        
        # Convert to base64
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', dpi=100, bbox_inches='tight')
        img_buffer.seek(0)
        img_base64 = base64.b64encode(img_buffer.read()).decode()
        plt.close()
        
        return jsonify({
            'success': True,
            'image': f'data:image/png;base64,{img_base64}'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/python/calculate/volume/<int:user_id>', methods=['GET'])
def calculate_total_volume(user_id):
    # Calculate total training volume using SQL database data
    # Volume = Sets × Reps × Weight for all workouts

    try:
        conn = get_db_connection()
        cursor = conn.execute('''
            SELECT sets, reps, weight, exercise_name
            FROM workouts
            WHERE user_id = ? AND weight > 0
        ''', (user_id,))
        
        workouts = cursor.fetchall()
        conn.close()
        
        if not workouts:
            return jsonify({'success': True, 'total_volume': 0, 'breakdown': []})
        
        # Calculate volume using lambda function
        volumes = []
        for workout in workouts:
            volume = calculate_volume(workout)
            volumes.append({
                'exercise': workout['exercise_name'],
                'volume': volume
            })
        
        # Calculate total using reduce
        total_volume = reduce(lambda acc, item: acc + item['volume'], volumes, 0)
        
        
        exercise_volumes = {}
        for item in volumes:
            exercise = item['exercise']
            if exercise not in exercise_volumes:
                exercise_volumes[exercise] = 0
            exercise_volumes[exercise] += item['volume']
        
        breakdown = [{'exercise': k, 'volume': v} for k, v in exercise_volumes.items()]
        breakdown.sort(key=lambda x: x['volume'], reverse=True)
        
        return jsonify({
            'success': True,
            'total_volume': total_volume,
            'breakdown': breakdown[:10]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/python/visualize/custom', methods=['POST'])
def visualize_custom():
    # HTML Form and JavaScript Integration
    # This endpoint receives data from an HTML form via JavaScript fetch.
    # The user can select date ranges and metrics to customize the visualization.
    # This demonstrates:
    # 1. POST method for receiving form data
    # 2. JSON request body parsing
    # 3. Dynamic chart generation based on user input
    # 4. Integration between frontend forms and Python backend
    # The form allows users to filter and customize what data they want to see.

    try:
        data = request.get_json()
        user_id = data.get('userId')
        metric = data.get('metric', 'workouts')
        start_date = data.get('startDate')
        end_date = data.get('endDate')
        
        # Conditional Statement
        # This conditional checks which metric the user selected and adjusts the query accordingly.
        # It demonstrates decision-making logic where different paths are taken based on user input.
        # The if-elif-else structure ensures the correct data is retrieved for visualization.
        if metric == 'reps':
            query_field = 'SUM(sets * reps)'
            ylabel = 'Total Reps'
            color = '#059669'
        elif metric == 'weight':
            query_field = 'SUM(weight)'
            ylabel = 'Total Weight (lbs)'
            color = '#7c3aed'
        else:  # workouts
            query_field = 'COUNT(*)'
            ylabel = 'Workout Count'
            color = '#dc2626'
        
        conn = get_db_connection()
        cursor = conn.execute(f'''
            SELECT 
                workout_date,
                {query_field} as value
            FROM workouts
            WHERE user_id = ? AND workout_date BETWEEN ? AND ?
            GROUP BY workout_date
            ORDER BY workout_date
        ''', (user_id, start_date, end_date))
        
        results = cursor.fetchall()
        conn.close()
        
        if not results:
            return jsonify({'error': 'No data for selected range'}), 404
        
        dates = [row['workout_date'] for row in results]
        values = [row['value'] or 0 for row in results]
        
        # Create chart
        fig, ax = plt.subplots(figsize=(10, 6))
        ax.plot(dates, values, color=color, marker='o', linewidth=2)
        ax.fill_between(dates, values, alpha=0.3, color=color)
        ax.set_xlabel('Date', fontsize=12, fontweight='bold')
        ax.set_ylabel(ylabel, fontsize=12, fontweight='bold')
        ax.set_title(f'Custom {metric.capitalize()} Analysis', fontsize=14, fontweight='bold', pad=20)
        ax.grid(True, alpha=0.3)
        plt.xticks(rotation=45, ha='right')
        fig.tight_layout()
        
        # Convert to base64
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', dpi=100, bbox_inches='tight')
        img_buffer.seek(0)
        img_base64 = base64.b64encode(img_buffer.read()).decode()
        plt.close()
        
        return jsonify({
            'success': True,
            'image': f'data:image/png;base64,{img_base64}'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    print("Initializing database...")
    init_database()
    
    print("Starting Wacky Workout Tracker Flask Server...")
    print("Server running at http://localhost:5000")
    print("Demo login: demo@workout.com / Demo123!")
    print("Press CTRL+C to stop the server")
    
    app.run(debug=True, host='0.0.0.0', port=5000)