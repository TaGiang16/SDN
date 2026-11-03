const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  id: { type: String, required: true },
  className: { type: String, required: true },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  lecturerName: { type: String, required: true },
  status: { type: String, enum: ["OPEN", "CLOSED"], default: "OPEN" },
  enrollments: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
      status: {
        type: String,
        enum: ["enrolled", "dropped"],
        default: "enrolled",
      },
    },
  ],
});

module.exports = mongoose.model("Class", classSchema, "classes");
