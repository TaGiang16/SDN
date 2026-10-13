const express = require('express');
const Loan = require('../model/loan.model');

const router = express.Router();

// GET: retrieve all borrowing records
router.get('/', async (req, res) => {
    try {
        const loans = await Loan.find().populate('book').populate('member');
        res.status(200).json(loans);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET: retrieve a borrowing record by ID
router.get('/:id', async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id).populate('book').populate('member');
        if (!loan) {
            return res.status(404).json({ message: 'Loan record not found' });
        }
        res.status(200).json(loan);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST: create a new borrowing record
router.post('/', async (req, res) => {
    try {
        const loan = await Loan.create(req.body);
        res.status(201).json(loan);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET: retrieve borrowing records belonging to a specific member
router.get('/member/:memberId', async (req, res) => {
    try {
        const loans = await Loan.find({ member: req.params.memberId }).populate('book').populate('member');
        res.status(200).json(loans);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;