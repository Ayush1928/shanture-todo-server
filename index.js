const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 5000;

//Middlewares
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
    user: process.env.PG_USERNAME,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT || 5432,
});

// Fetch all tasks
app.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
    }
});

// Add new task
app.post('/tasks', async (req, res) => {
    try {
        const { description } = req.body;
        const result = await pool.query('INSERT INTO tasks (description, completed) VALUES ($1, $2) RETURNING *', [description, false]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

// Mark task as completed
app.put('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('UPDATE tasks SET completed = NOT completed WHERE id = $1 RETURNING *', [id]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

// Delete task
app.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.json({ message: 'Task deleted' });
    } catch (err) {
        console.error(err.message);
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
