const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  id: { type: String },
  code: { type: String, required: true },
  name: { type: String, required: true },
  credits: { type: Number, required: true },
  status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
});

module.exports = mongoose.model("Subject", subjectSchema, "subjects");
