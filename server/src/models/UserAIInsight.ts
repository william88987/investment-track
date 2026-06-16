import { dbGet, dbRun } from '../database/connection.js';

export interface UserAIInsight {
  userId: number;
  feedback: string;
  generatedAt: string;
  updatedAt: string;
}

export class UserAIInsightModel {
  static async findByUserId(userId: number): Promise<UserAIInsight | null> {
    const insight = await dbGet(
      `SELECT 
        user_id as userId, feedback, generated_at as generatedAt, updated_at as updatedAt
      FROM user_ai_insights 
      WHERE user_id = ?`,
      [userId]
    );
    
    return insight as UserAIInsight | null;
  }
  
  static async save(userId: number, feedback: string, generatedAt: string): Promise<void> {
    await dbRun(
      `INSERT OR REPLACE INTO user_ai_insights (user_id, feedback, generated_at)
       VALUES (?, ?, ?)`,
      [userId, feedback, generatedAt]
    );
  }
}
