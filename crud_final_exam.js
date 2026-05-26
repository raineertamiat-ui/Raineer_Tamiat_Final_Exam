const express = require('express');
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Assets out of the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection with Aiven SSL Requirements
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'defaultdb',
    port: process.env.DB_PORT || 25060,
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to Aiven MySQL:', err.message);
        return;
    }
    console.log('Successfully connected to Aiven Cloud Database.');
});

// ==================== HTML VIEW ROUTING ====================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/list', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'list.html'));
});

app.get('/edit', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'edit.html'));
});

// ==================== BACKEND API ENDPOINTS (CRUD) ====================

// READ ALL
app.get('/api/students', (req, res) => {
    const sql = 'SELECT * FROM students ORDER BY created_at DESC';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// READ SINGLE
app.get('/api/students/:id', (req, res) => {
    const sql = 'SELECT * FROM students WHERE id = ?';
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Student not found' });
        res.json(results[0]);
    });
});

// CREATE
app.post('/api/students', (req, res) => {
    const { student_id, full_name, course, year_level, email_address } = req.body;
    if (!student_id || !full_name || !course || !year_level || !email_address) {
        return res.status(400).json({ error: 'All structural fields are required.' });
    }

    const sql = 'INSERT INTO students (student_id, full_name, course, year_level, email_address) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [student_id, full_name, course, year_level, email_address], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Student registered successfully', id: result.insertId });
    });
});

// UPDATE
app.put('/api/students/:id', (req, res) => {
    const { student_id, full_name, course, year_level, email_address } = req.body;
    const sql = 'UPDATE students SET student_id = ?, full_name = ?, course = ?, year_level = ?, email_address = ? WHERE id = ?';
    
    db.query(sql, [student_id, full_name, course, year_level, email_address, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Record variant match missing.' });
        res.json({ message: 'Student record updated successfully' });
    });
});

// DELETE
app.delete('/api/students/:id', (req, res) => {
    const sql = 'DELETE FROM students WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Target record untraceable.' });
        res.json({ message: 'Student record deleted successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server environment processing live on port ${PORT}`);
});