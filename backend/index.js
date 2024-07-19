require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const connectionString = process.env.MONGO_CONNECTION_STRING;

mongoose.connect(connectionString)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB', err);
    });

const app = express();

app.use(express.json());
app.use(cookieParser());

const corsOptions = {
    origin: 'https://just-note-it-39vm.vercel.app', // Replace with your frontend's origin
    credentials: true, // Enable credentials (cookies, authorization headers, etc.)
};
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

const { authenticateToken } = require('./utilities');
const { createAccount, loginUser, getUser } = require('./controllers/User');
const { addNote, editNote, getAllNotes, deleteNote, updateIsPinned, searchEngine } = require('./controllers/Note');

app.get('/', (req, res) => {
    res.json({ data: 'hello' });
});

// Create Account
app.post('/create-account', createAccount);

// Login User
app.post('/login', loginUser);

// Get User
app.get('/get-user', authenticateToken, getUser);

// Add notes
app.post('/add-note', authenticateToken, addNote);

// Edit Notes
app.put('/edit-note/:noteId', authenticateToken, editNote);

// Get all notes
app.get('/get-all-notes', authenticateToken, getAllNotes);

// Delete note
app.delete('/delete-note/:noteId', authenticateToken, deleteNote);

// Update isPinned
app.put('/update-note-isPinned/:noteId', authenticateToken, updateIsPinned);

// Search note
app.get('/search-notes/', authenticateToken, searchEngine);

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});

module.exports = app;
