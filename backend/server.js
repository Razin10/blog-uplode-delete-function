const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


const mongoURI = process.env.MONGO_URI; 


const initializeMarks = async () => {
    const existingMarks = await Marks.findOne();
    if (!existingMarks) {
        const newMarks = new Marks({ value: 100 });
        await newMarks.save();
        console.log('Marks initialized');
    } else {
        console.log('Marks already exist');
    }
};


mongoose.connect(mongoURI)
    .then(() => {
        console.log('MongoDB connected successfully');
        initializeMarks();
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });
     
    
// MongoDB Schema
const cardSchema = new mongoose.Schema({
    title: String,
    description: String,
    uploadDate: String,
    isPublic: { type: Boolean, default: true }, // New field for visibility
});

const marksSchema = new mongoose.Schema({
    value: Number,
});

const Card = mongoose.model('Card', cardSchema);
const Marks = mongoose.model('Marks', marksSchema);


// Routes

// Get current marks
app.get('/api/marks', async (req, res) => {
    const marks = await Marks.findOne();
    res.json(marks);
});

// Save a new card and update marks
app.post('/api/cards', async (req, res) => {
    const { title, description, uploadDate, isPublic } = req.body;

    const newCard = new Card({ title, description, uploadDate, isPublic });
    await newCard.save();

    const marks = await Marks.findOne();
    if (marks) {
        marks.value += 10; // Increase marks by 10
        await marks.save();
    }

    res.json(newCard);
});

app.delete('/api/cards/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Card.findByIdAndDelete(id);
        res.status(204).send(); // No content
    } catch (error) {
        res.status(500).json({ message: 'Error deleting card', error });
    }
});

// Initialize marks if not already set
app.post('/api/initializeMarks', async (req, res) => {
    const existingMarks = await Marks.findOne();
    if (!existingMarks) {
        const newMarks = new Marks({ value: 100 });
        await newMarks.save();
    }
    res.sendStatus(200);
});


app.post('/api/cards', async (req, res) => {
    const card = new Card(req.body);
    try {
        const savedCard = await card.save();
        res.status(201).json(savedCard);
    } catch (error) {
        res.status(400).json({ message: 'Error saving card', error });
    }
});

app.get('/api/cards', async (req, res) => {
    try {
        const cards = await Card.find();
        res.status(200).json(cards);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving cards', error });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});                                                                               