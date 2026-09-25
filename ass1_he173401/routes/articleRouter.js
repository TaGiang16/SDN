const express = require('express');
const router = express.Router();
const data = require('../data.json');

router.get('/', (req, res) => {
    try {
        res.status(200).json(data.articles);
    } catch (error) {
        res.json({ error: error.message });
    }
});

router.get('/:id', (req, res) => {
    try {
        const article = data.articles.find(item => item.id === Number(req.params.id));

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        res.status(200).json(article);
    } catch (error) {
        res.json({ error: error.message });
    }
});

router.post('/', (req, res) => {
    try {
        const { title, content, author, date } = req.body;

        if (!title || !content || !author || !date) {
            return res.status(400).json({ message: 'Missing required article fields' });
        }

        const id = data.articles.length ? data.articles[data.articles.length - 1].id + 1 : 1;
        const newArticle = { id, title, content, author, date };

        data.articles.push(newArticle);
        res.status(201).json(newArticle);
    } catch (error) {
        res.json({ error: error.message });
    }
});

router.put('/:id', (req, res) => {
    try {
        const articleId = Number(req.params.id);
        const articleIndex = data.articles.findIndex(a => a.id === articleId);

        if (articleIndex === -1) {
            return res.status(404).json({ message: 'Article not found' });
        }

        const { title, content, author, date } = req.body;
        data.articles[articleIndex] = { id: articleId, title, content, author, date };

        res.status(200).json(data.articles[articleIndex]);
    } catch (error) {
        res.json({ error: error.message });
    }
});

router.delete('/:id', (req, res) => {
    try {
        const articleId = Number(req.params.id);
        const articleIndex = data.articles.findIndex(a => a.id === articleId);

        if (articleIndex === -1) {
            return res.status(404).json({ message: 'Article not found' });
        }

        const deletedArticle = data.articles.splice(articleIndex, 1);
        res.status(200).json(deletedArticle[0]);
    } catch (error) {
        res.json({ error: error.message });
    }
});

module.exports = router;