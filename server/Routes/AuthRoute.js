
const express = require('express');
const router = express.Router();
const { Signup, Login, getSignup, userVerification } = require("../Controllers/AuthController");

router.route('/signup').get(getSignup).post(Signup);
router.route('/login').post(Login);
router.post('/', userVerification);

module.exports = router;
