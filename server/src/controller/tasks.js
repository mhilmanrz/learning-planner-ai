const logger = require('../utils/logger');
const Tasks = require('../models/tasks');
const { InvariantError, NotFoundError, ClientError } = require('../exceptions');
const { getWeekEnd } = require('../utils/week');

const VALID_STATUSES = ['todo', 'done', 'skip'];

const createTask = async (req, res, next) => {
  try {
    const data = req.validated;
    const task = await Tasks.create({ ...data, status: 'todo' });

    if (!task) {
      return next(new InvariantError('Gagal membuat task'));
    }

    logger.info({
      request_id: req.requestId,
      action: 'task_created',
      source: data.source,
      task_id: task.id,
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

const getTasksByWeekStart = async (req, res, next) => {
  try {
    const { week_start: weekStart, goal_id: goalId } = req.query;

    // Mode 1: filter per goal (dipakai GoalDetail)
    if (goalId && !weekStart) {
      const tasks = await Tasks.findByGoalId(goalId, req.user.id);
      return res.json(tasks);
    }

    // Mode 2: filter per minggu (dipakai Dashboard & Progress)
    if (!weekStart) {
      return next(
        new ClientError('Parameter week_start diperlukan (format: YYYY-MM-DD)'),
      );
    }

    const weekEnd = getWeekEnd(new Date(weekStart));

    // Mode 3: filter per minggu + per goal (dipakai GoalDetail dengan week_start)
    if (goalId) {
      const tasks = await Tasks.findByGoalAndWeek(goalId, req.user.id, weekStart, weekEnd);
      return res.json(tasks);
    }

    const tasks = await Tasks.findByWeekStart(req.user.id, weekStart, weekEnd);
    return res.json(tasks);
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return next(new ClientError(`Status tidak valid. Harus salah satu dari: ${VALID_STATUSES.join(', ')}`));
    }
    const task = await Tasks.updateStatus(req.params.id, req.user.id, status);
    if (!task) return next(new NotFoundError('Task tidak ditemukan'));
    res.json(task);
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasksByWeekStart, updateTaskStatus };
