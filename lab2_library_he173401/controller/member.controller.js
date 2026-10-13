const Member = require('../model/member.model');

// GET: retrieve all members
exports.getAllMembers = async (req, res) => {
    try {
        const members = await Member.find();
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET: retrieve a member by ID
exports.getMemberById = async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        res.status(200).json(member);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createMember = async (req, res) => {
    try {
        req.body.isActive = true;
        const member = await Member.create(req.body);
        res.status(201).json(member);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateMember = async (req, res) => {
    try {
        const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        res.status(200).json(member);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteMember = async (req, res) => {
    try {
        const member = await Member.findByIdAndDelete(req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        res.status(200).json({ message: 'Member deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};