const db = require('../utils/db');

class Tasks {
  async create({
    goal_id,
    title,
    description,
    duration_estimate,
    planned_date,
    planned_slot,
    status,
    source,
    rationale,
  }) {
    const result = await db.query(
      `INSERT INTO tasks
        (goal_id,
        title,
        description,
        duration_estimate,
        planned_date,
        planned_slot,
        status,
        source,
        rationale)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
      [
        goal_id,
        title,
        description,
        duration_estimate,
        planned_date,
        planned_slot,
        status,
        source,
        rationale,
      ],
    );
    return result.rows[0];
  }



  async findByWeekStart(userId, weekStart, weekEnd) {
    const result = await db.query(
      `SELECT * FROM tasks
        WHERE goal_id IN (SELECT id FROM goals WHERE user_id = $1)
        AND planned_date BETWEEN $2 AND $3
        ORDER BY planned_date, planned_slot`,
      [userId, weekStart, weekEnd],
    );
    return result.rows;
  }

  /** Semua task milik goal — ownership di-check via JOIN goals */
  async findByGoalId(goalId, userId) {
    const result = await db.query(
      `SELECT t.* FROM tasks t
        INNER JOIN goals g ON g.id = t.goal_id
        WHERE t.goal_id = $1 AND g.user_id = $2
        ORDER BY t.planned_date ASC, t.planned_slot ASC`,
      [goalId, userId],
    );
    return result.rows;
  }

  /** Task milik satu goal dalam rentang minggu tertentu */
  async findByGoalAndWeek(goalId, userId, weekStart, weekEnd) {
    const result = await db.query(
      `SELECT t.* FROM tasks t
        INNER JOIN goals g ON g.id = t.goal_id
        WHERE t.goal_id = $1 AND g.user_id = $2
          AND t.planned_date BETWEEN $3 AND $4
        ORDER BY t.planned_date ASC, t.planned_slot ASC`,
      [goalId, userId, weekStart, weekEnd],
    );
    return result.rows;
  }

  async updateStatus(id, userId, status) {
    const result = await db.query(
      `UPDATE tasks SET status = $1
       WHERE id = $2
         AND goal_id IN (SELECT id FROM goals WHERE user_id = $3)
       RETURNING *`,
      [status, id, userId],
    );
    return result.rows[0];
  }
}

module.exports = new Tasks();
