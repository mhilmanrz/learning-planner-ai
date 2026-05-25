const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const { authPayloadSchema } = require('../validator/auth-schema');
const { authLimiter } = require('../middleware/rateLimiter');
const { register, login, me } = require('../controller/auth');

router.post('/register', authLimiter, validate(authPayloadSchema), register);
router.post('/login', authLimiter, validate(authPayloadSchema), login);
router.get('/me', authenticate, me);

module.exports = router;
