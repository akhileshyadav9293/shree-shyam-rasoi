/**
 * db.js — lowdb-based JSON file database.
 *
 * Uses lowdb v1 (CommonJS compatible, no native deps).
 * Data is persisted to server/data/rasoi.json
 */
const low   = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path  = require('path');
const fs    = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE  = path.join(DATA_DIR, 'rasoi.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const adapter = new FileSync(DB_FILE);
const db = low(adapter);

// Set defaults (schema)
db.defaults({
  customers:  [],
  deliveries: [],   // [{ date, customerId, lunch, dinner }]
  expenses:   [],
  payments:   [],
  settings:   { app_pin: '', app_username: '' },
}).write();

module.exports = db;
