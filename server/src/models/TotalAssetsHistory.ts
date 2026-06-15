import { dbGet, dbAll, dbRun } from '../database/connection.js';

export interface TotalAssetsHistoryData {
  id: number;
  userId: number;
  date: string;
  investmentTotal: number;
  bankTotal: number;
  otherTotal: number;
  nonInvestmentTotal: number;
  total: number;
  createdAt: string;
}

export interface CreateTotalAssetsHistoryData {
  date: string;
  investmentTotal: number;
  bankTotal: number;
  otherTotal: number;
  nonInvestmentTotal: number;
  total: number;
}

export class TotalAssetsHistoryModel {
  static async findByUserId(userId: number): Promise<TotalAssetsHistoryData[]> {
    const history = await dbAll(
      `SELECT 
        id, user_id as userId, date, 
        investment_total as investmentTotal, 
        bank_total as bankTotal, 
        other_total as otherTotal, 
        COALESCE(non_investment_total, 0.0) as nonInvestmentTotal,
        total, 
        created_at as createdAt
      FROM total_assets_history 
      WHERE user_id = ? 
      ORDER BY date DESC, created_at DESC`,
      [userId]
    );
    
    return history as TotalAssetsHistoryData[];
  }
  
  static async create(userId: number, data: CreateTotalAssetsHistoryData): Promise<TotalAssetsHistoryData> {
    const nonInvestmentTotal = data.nonInvestmentTotal !== undefined ? data.nonInvestmentTotal : 0.0;
    // Check if a record already exists for the same user and date
    const existing = await dbGet(
      `SELECT id FROM total_assets_history WHERE user_id = ? AND date = ?`,
      [userId, data.date]
    );

    if (existing) {
      // Update the existing record
      await dbRun(
        `UPDATE total_assets_history 
         SET investment_total = ?, bank_total = ?, other_total = ?, non_investment_total = ?, total = ?
         WHERE id = ?`,
        [data.investmentTotal, data.bankTotal, data.otherTotal, nonInvestmentTotal, data.total, (existing as any).id]
      );
      
      const record = await this.findById((existing as any).id, userId);
      if (!record) {
        throw new Error('Failed to update total assets history record');
      }
      return record;
    } else {
      // Insert a new record
      const result = await dbRun(
        `INSERT INTO total_assets_history 
          (user_id, date, investment_total, bank_total, other_total, non_investment_total, total) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, data.date, data.investmentTotal, data.bankTotal, data.otherTotal, nonInvestmentTotal, data.total]
      );
      
      const record = await this.findById(result.lastID, userId);
      if (!record) {
        throw new Error('Failed to create total assets history record');
      }
      return record;
    }
  }
  
  static async findById(id: number, userId: number): Promise<TotalAssetsHistoryData | null> {
    const record = await dbGet(
      `SELECT 
        id, user_id as userId, date, 
        investment_total as investmentTotal, 
        bank_total as bankTotal, 
        other_total as otherTotal, 
        COALESCE(non_investment_total, 0.0) as nonInvestmentTotal,
        total, 
        created_at as createdAt
      FROM total_assets_history 
      WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    
    return record as TotalAssetsHistoryData | null;
  }

  static async delete(id: number, userId: number): Promise<boolean> {
    const result = await dbRun(
      `DELETE FROM total_assets_history WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    return result.changes > 0;
  }
}
