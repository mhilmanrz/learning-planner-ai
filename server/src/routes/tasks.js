// TODO: Implementasikan task endpoints.
// Lihat modul Cycle 1 (POST — accept flow) dan Cycle 2 (GET, PATCH status).
// POST /, GET /, PATCH /:id/status
const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const { taskPayloadSchema } = require('../validator/task-schema');
const { createTask, getTasksByWeekStart, updateTaskStatus } = require('../controller/tasks');

router.post('/', authenticate, validate(taskPayloadSchema), createTask);
router.get('/', authenticate, getTasksByWeekStart);
router.patch('/:id/status', authenticate, updateTaskStatus);

module.exports = router;
