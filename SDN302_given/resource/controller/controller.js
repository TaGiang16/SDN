const Class = require('../model/Classes');
const Student = require('../model/Students');
const Attendance = require('../model/Attendances');
const Subject = require('../model/Subjects');
exports.getStudentsInClass = async (req, res) => {
    const { classId } = req.params;
    const { status } = req.query;

    if (!classId) {
        return res.status(400).json({ error: `Invalid classId: ${classId}` });
    }
    if (!["enrolled", "dropped"].includes(status)) {
        return res.status(400).json({ error: `Invalid status: ${status || ""}` });
    }

    try {
        const classRecord = await Class.findById(classId).populate("enrollments.studentId");
        if (!classRecord) {
            return res.status(404).json({ error: `Class with id = ${classId} not found` });
        }

        const students = classRecord.enrollments
            .filter((enrollment) => enrollment.status === status && enrollment.studentId)
            .map(({ studentId }) => ({
                id: studentId._id,
                studentCode: studentId.studentCode,
                fullName: studentId.fullName,
                email: studentId.email,
            }));
        return res.status(200).json(students);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.getAttendanceSummaryOfAClass = async (req, res) => {
    const { classId } = req.params;
    if (!(classId)) {
        return res.status(400).json({ error: `Invalid classId: ${classId}` });
    }

    try {
        const classRecord = await Class.findById(classId).populate("enrollments.studentId");
        if (!classRecord) {
            return res.status(404).json({ error: `Class with id = ${classId} not found` });
        }

        const enrolledStudents = classRecord.enrollments.filter(
            (enrollment) => enrollment.status === "enrolled" && enrollment.studentId
        );
        const attendances = await Attendance.find({ classId });
        const summary = enrolledStudents.map(({ studentId }) => {
            const studentAttendances = attendances.filter(
                (attendance) => attendance.studentId.toString() === studentId._id.toString()
            );
            const present = studentAttendances.filter((attendance) => attendance.status === "PRESENT").length;
            const absent = studentAttendances.filter((attendance) => attendance.status === "ABSENT").length;
            const totalSessions = studentAttendances.length;
            const attendanceRate = totalSessions === 0
                ? 0
                : Math.round((present / totalSessions) * 1000) / 10;

            return {
                studentCode: studentId.studentCode,
                fullName: studentId.fullName,
                totalSessions,
                present,
                absent,
                attendanceRate,
                warning: attendanceRate < 80,
            };
        });

        return res.status(200).json(summary);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.getAttendanceHistoryOfAStudent = async (req, res) => {
    const { studentId } = req.params;
    if (!(studentId)) {
        return res.status(400).json({ error: `Invalid studentId: ${studentId}` });
    }

    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: `Student with id = ${studentId} not found` });
        }

        const attendanceRecords = await Attendance.find({ studentId })
            .sort({ date: -1 })
            .populate({
                path: "classId",
                populate: { path: "subjectId" },
            });

        const formattedRecords = attendanceRecords.map((a) => ({
            id: a._id,
            className: a.classId?.className || "N/A",
            subjectName: a.classId?.subjectId?.name || "N/A",
            date: a.date,
            status: a.status,
        }));
        return res.status(200).json(formattedRecords);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.createOrUpdate =async (req, res) => {
  const { classId } = req.params;
  const { date, records } = req.body;

  if (!(classId)) {
    return res.status(400).json({ error: `Invalid classId: ${classId}` });
  }
  if (!date) {
    return res.status(400).json({ error: "Date is required" });
  }

  const sessionDate = new Date(date);
  if (Number.isNaN(sessionDate.getTime())) {
    return res.status(400).json({ error: "Invalid date" });
  }
  if (sessionDate > new Date()) {
    return res.status(400).json({ error: "Date cannot be in the future" });
  }
  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: "Records must be a non-empty array" });
  }

  try {
    const classRecord = await Class.findById(classId).populate("enrollments.studentId");
    if (!classRecord) {
      return res.status(404).json({ error: `Class with id = ${classId} not found` });
    }

    const enrolledIds = classRecord.enrollments
      .filter((enrollment) => enrollment.status === "enrolled")
      .map((enrollment) => enrollment.studentId?._id.toString())
      .filter(Boolean);
    const recordsByStudent = new Map();

    for (const record of records) {
      if (!record.studentId || !isValidObjectId(record.studentId)) {
        return res.status(400).json({ error: `Invalid studentId: ${record.studentId || ""}` });
      }
      if (!["PRESENT", "ABSENT"].includes(record.status)) {
        return res.status(400).json({ error: `Invalid status: ${record.status || ""}` });
      }
      const normalizedStudentId = record.studentId.toString().toLowerCase();
      if (!enrolledIds.includes(normalizedStudentId)) {
        return res.status(400).json({
          error: `Student ${normalizedStudentId} does not belong to class`,
        });
      }
      if (recordsByStudent.has(normalizedStudentId)) {
        return res.status(400).json({ error: `Duplicate attendance for student ${normalizedStudentId}` });
      }
      recordsByStudent.set(normalizedStudentId, record.status);
    }

    const missingStudentId = enrolledIds.find((id) => !recordsByStudent.has(id));
    if (missingStudentId) {
      const missingStudent = classRecord.enrollments.find(
        (enrollment) => enrollment.studentId?._id.toString() === missingStudentId
      )?.studentId;
      return res.status(400).json({
        error: `Missing attendance for student ${missingStudent?.studentCode || missingStudentId} (${missingStudent?.fullName || "Unknown"})`,
      });
    }

    const dayStart = new Date(sessionDate);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
    const existingCount = await Attendance.countDocuments({
      classId,
      studentId: { $in: [...recordsByStudent.keys()] },
      date: { $gte: dayStart, $lt: dayEnd },
    });

    const operations = [...recordsByStudent.entries()].map(([studentId, status]) => ({
      updateOne: {
        filter: {
          classId,
          studentId,
          date: { $gte: dayStart, $lt: dayEnd },
        },
        update: { $set: { classId, studentId, date: dayStart, status } },
        upsert: true,
      },
    }));
    await Attendance.bulkWrite(operations);

    const present = [...recordsByStudent.values()].filter((status) => status === "PRESENT").length;
    const absent = recordsByStudent.size - present;
    return res.status(existingCount > 0 ? 200 : 201).json({
      message: "Attendance recorded successfully",
      totalRecords: recordsByStudent.size,
      present,
      absent,
      updatedCount: existingCount,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
