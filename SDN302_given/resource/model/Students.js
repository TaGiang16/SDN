const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  id: { type: String },
  studentCode: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
});

module.exports = mongoose.model("Student", studentSchema, "students");
