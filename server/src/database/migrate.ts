import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { dbRun, dbAll } from './connection.js';
import { Logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  try {
    Logger.info('Starting database migration...');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      await dbRun(statement);
      Logger.debug('Executed:', statement.substring(0, 50) + '...');
    }
    
    // Alter existing tables if columns are missing
    try {
      const otherAssetCols = await dbAll('PRAGMA table_info(other_assets)') as any[];
      if (!otherAssetCols.some(col => col.name === 'is_investment')) {
        Logger.info("Adding column 'is_investment' to table 'other_assets'...");
        await dbRun('ALTER TABLE other_assets ADD COLUMN is_investment INTEGER DEFAULT 1');
      }
    } catch (e) {
      Logger.warn('Failed to alter other_assets table (column may already exist):', e);
    }

    try {
      const historyCols = await dbAll('PRAGMA table_info(total_assets_history)') as any[];
      if (!historyCols.some(col => col.name === 'non_investment_total')) {
        Logger.info("Adding column 'non_investment_total' to table 'total_assets_history'...");
        await dbRun('ALTER TABLE total_assets_history ADD COLUMN non_investment_total REAL DEFAULT 0.0');
      }
    } catch (e) {
      Logger.warn('Failed to alter total_assets_history table (column may already exist):', e);
    }

    Logger.info('Database migration completed successfully!');
  } catch (error) {
    Logger.error('Migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

migrate();
