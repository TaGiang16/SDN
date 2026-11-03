const express = require('express');
const router = express.Router();
const controller = require("../controller/controller");

//req2
router.get('/classes/:classId/students', controller.getStudentsInClass);

//req3
router.get('/classes/:classId/attendance-summary', controller.getAttendanceSummaryOfAClass);

//req4
router.get('/students/:studentId/attendances', controller.getAttendanceHistoryOfAStudent);

//req5
router.post('/classes/:classId/attendances', controller.createOrUpdate);
module.exports = router;