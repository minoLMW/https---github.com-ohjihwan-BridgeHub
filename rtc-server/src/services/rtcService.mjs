// src/service/rtcService.mjs
import { pool } from '../util/mysql.mjs';

export async function getNicknameById(memberId) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      'SELECT nickname FROM members WHERE id = ? AND status = "ACTIVE"',
      [memberId]
    );
    return rows.length > 0 ? rows[0].nickname : null;
  } finally {
    conn.release();
  }
}
