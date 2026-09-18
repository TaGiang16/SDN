const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GET all articles
app.get('/articles', (req, res) => {
    try {
        res.status(200).end('Will send all the articles to you!');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST a new article   
app.post('/articles', (req, res) => {
    try {
        res.status(201).end(`Will add the article: ${req.body.name} with details: ${req.body.description}`);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT a new article
app.put('/articles', (req, res) => {
    try {
        res.status(403).end('PUT operation not supported on /articles');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE all articles
app.delete('/articles', (req, res) => {
    try {
        res.status(200).end('Will delete all articles');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;