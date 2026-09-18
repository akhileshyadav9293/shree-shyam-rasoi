/**
 * database.js — SQLite database setup using better-sqlite3.
 *
 * - Creates server/data/rasoi.db with all required tables.
 * - On first run, auto-migrates existing rasoi.json data into SQLite.
 * - Exports the `db` (Database instance) for use in routes.
 */

const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE  = path.join(DATA_DIR, 'rasoi.db');
const JSON_FILE = path.join(DATA_DIR, 'rasoi.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_FILE);

// ─── Performance pragmas ──────────────────────────────────────────────────────
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Create Tables ────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id               TEXT PRIMARY KEY,
    name             TEXT NOT NULL DEFAULT '',
    phone            TEXT DEFAULT '',
    address          TEXT DEFAULT '',
    plan             TEXT DEFAULT 'both',
    serviceType      TEXT DEFAULT 'monthly',
    tiffinRate       REAL DEFAULT 0,
    monthlyAmount    REAL DEFAULT 0,
    monthlyPrice     REAL DEFAULT 0,
    discount         REAL DEFAULT 0,
    advance          REAL DEFAULT 0,
    skippedDays      INTEGER DEFAULT 0,
    adjustmentAmount REAL DEFAULT 0,
    status           TEXT DEFAULT 'active',
    createdAt        TEXT,
    updatedAt        TEXT
  );

  CREATE TABLE IF NOT EXISTS deliveries (
    date       TEXT NOT NULL,
    customerId TEXT NOT NULL,
    lunch      INTEGER DEFAULT 0,
    dinner     INTEGER DEFAULT 0,
    PRIMARY KEY (date, customerId)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id          TEXT PRIMARY KEY,
    amount      REAL DEFAULT 0,
    category    TEXT DEFAULT 'other',
    description TEXT DEFAULT '',
    date        TEXT,
    createdAt   TEXT
  );

  CREATE TABLE IF NOT EXISTS payments (
    id          TEXT PRIMARY KEY,
    customerId  TEXT DEFAULT '',
    amount      REAL DEFAULT 0,
    date        TEXT,
    description TEXT DEFAULT '',
    createdAt   TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT DEFAULT ''
  );
`);

// ─── Seed default settings rows ───────────────────────────────────────────────
db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('app_pin', '')`).run();
db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('app_username', '')`).run();
db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('fast2sms_api_key', '')`).run();

// ─── One-time migration from rasoi.json ───────────────────────────────────────
if (fs.existsSync(JSON_FILE)) {
  try {
    const json = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
    console.log('📦 Migrating rasoi.json → rasoi.db ...');

    const insertCustomer = db.prepare(`
      INSERT OR IGNORE INTO customers
        (id, name, phone, address, plan, serviceType, tiffinRate, monthlyAmount,
         monthlyPrice, discount, advance, skippedDays, adjustmentAmount, status, createdAt, updatedAt)
      VALUES
        (@id, @name, @phone, @address, @plan, @serviceType, @tiffinRate, @monthlyAmount,
         @monthlyPrice, @discount, @advance, @skippedDays, @adjustmentAmount, @status, @createdAt, @updatedAt)
    `);

    const insertDelivery = db.prepare(`
      INSERT OR IGNORE INTO deliveries (date, customerId, lunch, dinner)
      VALUES (@date, @customerId, @lunch, @dinner)
    `);

    const insertExpense = db.prepare(`
      INSERT OR IGNORE INTO expenses (id, amount, category, description, date, createdAt)
      VALUES (@id, @amount, @category, @description, @date, @createdAt)
    `);

    const insertPayment = db.prepare(`
      INSERT OR IGNORE INTO payments (id, customerId, amount, date, description, createdAt)
      VALUES (@id, @customerId, @amount, @date, @description, @createdAt)
    `);

    const upsertSetting = db.prepare(`
      INSERT INTO settings (key, value) VALUES (@key, @value)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    // Run migration in a transaction for speed & safety
    db.transaction(() => {
      for (const c of (json.customers || [])) {
        insertCustomer.run({
          id: c.id, name: c.name || '', phone: c.phone || '',
          address: c.address || '', plan: c.plan || 'both',
          serviceType: c.serviceType || 'monthly',
          tiffinRate: Number(c.tiffinRate) || 0,
          monthlyAmount: Number(c.monthlyAmount) || 0,
          monthlyPrice: Number(c.monthlyPrice) || 0,
          discount: Number(c.discount) || 0,
          advance: Number(c.advance) || 0,
          skippedDays: Number(c.skippedDays) || 0,
          adjustmentAmount: Number(c.adjustmentAmount) || 0,
          status: c.status || 'active',
          createdAt: c.createdAt || new Date().toISOString(),
          updatedAt: c.updatedAt || new Date().toISOString(),
        });
      }

      for (const d of (json.deliveries || [])) {
        insertDelivery.run({
          date: d.date, customerId: d.customerId,
          lunch: d.lunch ? 1 : 0, dinner: d.dinner ? 1 : 0,
        });
      }

      for (const e of (json.expenses || [])) {
        insertExpense.run({
          id: e.id, amount: Number(e.amount) || 0,
          category: e.category || 'other', description: e.description || '',
          date: e.date, createdAt: e.createdAt,
        });
      }

      for (const p of (json.payments || [])) {
        insertPayment.run({
          id: p.id, customerId: p.customerId || '',
          amount: Number(p.amount) || 0, date: p.date,
          description: p.description || '', createdAt: p.createdAt,
        });
      }

      const settings = json.settings || {};
      for (const [key, value] of Object.entries(settings)) {
        upsertSetting.run({ key, value: String(value || '') });
      }
    })();

    // Rename old JSON as backup instead of deleting
    fs.renameSync(JSON_FILE, JSON_FILE + '.bak');
    console.log('✅ Migration complete! Old data saved as rasoi.json.bak');
  } catch (err) {
    console.error('⚠️  Migration error (non-fatal):', err.message);
  }
}

module.exports = db;
