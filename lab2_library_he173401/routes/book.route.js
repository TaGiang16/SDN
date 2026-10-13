const express = require('express');
const router = express.Router();
const bookController = require("../controller/book.controller")

// GET: retrieve all books
router.get('/', bookController.getAllBooks);

// GET: retrieve a book by ID
router.get('/:id', bookController.getBookById);

// POST: add a new book
router.post('/', bookController.creatBook);

// PUT: update book information
router.put('/:id', bookController.updateBook);

// DELETE: remove a book
router.delete('/:id', bookController.deleteBook);

module.exports = router;
