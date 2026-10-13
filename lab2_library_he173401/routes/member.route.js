const express = require('express');
const router = express.Router();
const memberController = require("../controller/member.controller");
// GET: retrieve all members
router.get('/', memberController.getAllMembers);

// GET: retrieve a member by ID
router.get('/:id', memberController.getMemberById);

// POST: add a new member
router.post('/', memberController.createMember);

// PUT: update member information
router.put('/:id', memberController.updateMember);

// DELETE: remove a member
router.delete('/:id', memberController.deleteMember);

module.exports = router;