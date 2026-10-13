// thực hiện kỹ thuật định tuyến
const express = require("express");
const router = express.Router(); //router là 1 mini express

router.use('/loans', require('./loan.route')); //định tuyến cho các yc liên quan đến mượn sách
router.use('/books', require('./book.route')); //định tuyến cho các yc liên quan đến sách
router.use('/members', require('./member.route')); //định tuyến cho các yc liên quan đến người dùng
module.exports = router;