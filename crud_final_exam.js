require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

// Aiven MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false // Required for secure Aiven SSL connections
    }
});

const db = pool.promise();

// --- AUTOMATED TABLE INITIALIZATION ---
// This safely generates your table in Aiven when Render deploys the app
async function initializeDatabase() {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id VARCHAR(50) NOT NULL UNIQUE,
                full_name VARCHAR(100) NOT NULL,
                course VARCHAR(100) NOT NULL,
                year_level VARCHAR(20) NOT NULL,
                email_address VARCHAR(100) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await db.query(createTableQuery);
        console.log('Database table "students" verified or created successfully.');
    } catch (error) {
        console.error('Error during database table initialization:', error);
    }
}
initializeDatabase();

// --- ROUTING FRONTEND PAGES ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'views', 'register.html')));
app.get('/students-page', (req, res) => res.sendFile(path.join(__dirname, 'views', 'list.html')));
app.get('/edit-page', (req, res) => res.sendFile(path.join(__dirname, 'views', 'edit.html')));

// --- API ROUTES (CRUD OPERATIONS) ---

// 1. CREATE: Add a new student record
app.post('/api/students', async (req, res) => {
    const { student_id, full_name, course, year_level, email_address } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO students (student_id, full_name, course, year_level, email_address) VALUES (?, ?, ?, ?, ?)',
            [student_id, full_name, course, year_level, email_address]
        );
        res.status(201).json({ message: 'Student registered successfully!', studentId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error occurred or Student ID/Email already exists.' });
    }
});

// 2. READ: Fetch all student records
app.get('/api/students', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM students');
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve students.' });
    }
});

// 2b. READ: Fetch a single student record by primary ID (Used for updating)
app.get('/api/students/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error.' });
    }
});

// 3. UPDATE: Alter information of an existing student
app.put('/api/students/:id', async (req, res) => {
    const { student_id, full_name, course, year_level, email_address } = req.body;
    try {
        await db.query(
            'UPDATE students SET student_id = ?, full_name = ?, course = ?, year_level = ?, email_address = ? WHERE id = ?',
            [student_id, full_name, course, year_level, email_address, req.params.id]
        );
        res.status(200).json({ message: 'Student updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update student.' });
    }
});

// 4. DELETE: Drop a student record entirely
app.delete('/api/students/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM students WHERE id = ?', [req.params.id]);
        res.status(200).json({ message: 'Student record deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete student.' });
    }
});

// --- START APP SERVER ---
app.listen(PORT, () => {
    console.log(`Server running smoothly on port ${PORT}`);
});
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve students.' });
    }
});

// 2b. READ: Get single student by ID (for editing)
app.get('/api/students/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error.' });
    }
});

// 3. UPDATE: Update student information
app.put('/api/students/:id', async (req, res) => {
    const { student_id, full_name, course, year_level, email_address } = req.body;
    try {
        await db.query(
            'UPDATE students SET student_id = ?, full_name = ?, course = ?, year_level = ?, email_address = ? WHERE id = ?',
            [student_id, full_name, course, year_level, email_address, req.params.id]
        );
        res.status(200).json({ message: 'Student updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update student.' });
    }
});

// 4. DELETE: Remove student record
app.delete('/api/students/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM students WHERE id = ?', [req.params.id]);
        res.status(200).json({ message: 'Student record deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete student.' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running smoothly on port ${PORT}`);
});
