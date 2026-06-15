/**
 * Migración de datos MySQL (local) → PostgreSQL (Render).
 *
 * Copia las tablas en orden seguro de claves foráneas, preservando los UUID.
 * Asume que el ESQUEMA DESTINO ya existe (lo crea la app al hacer el primer
 * deploy en Render con DB_SYNC=true). Este script solo mueve los DATOS.
 *
 * Uso:
 *   1) Levantá tu MySQL local con los datos a migrar.
 *   2) Definí TARGET_DATABASE_URL = External Database URL del Postgres de Render.
 *      (y opcionalmente SOURCE_DB_* si tu MySQL no usa los defaults)
 *   3) npm run migrate:db
 *
 * Es idempotente: usa ON CONFLICT DO NOTHING, podés re-correrlo sin duplicar.
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';
import pg from 'pg';

// Orden padre → hijo (respeta las FKs)
const TABLES = [
  'users',
  'perfumes',
  'customers',
  'orders',
  'order_items',
  'payments',
  'stock_movements',
  'wishlist_items',
];

const targetUrl = process.env.TARGET_DATABASE_URL;
if (!targetUrl) {
  console.error('❌ Falta TARGET_DATABASE_URL (External Database URL de Render).');
  process.exit(1);
}

/** Postgres (pg) trata los arrays como arrays nativos; para columnas json
 *  necesitamos pasar el valor como string. Convertimos cualquier objeto/array
 *  (que no sea Date) a JSON string. Los strings ya válidos se dejan tal cual. */
function normalize(value) {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value;
  if (Buffer.isBuffer(value)) return value;
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
}

async function main() {
  const source = await mysql.createConnection({
    host: process.env.SOURCE_DB_HOST || 'localhost',
    port: Number(process.env.SOURCE_DB_PORT || 3306),
    user: process.env.SOURCE_DB_USERNAME || 'root',
    password: process.env.SOURCE_DB_PASSWORD || 'secret',
    database: process.env.SOURCE_DB_DATABASE || 'ward_perfumes',
  });
  console.log('✅ Conectado al MySQL de origen');

  const target = new pg.Client({
    connectionString: targetUrl,
    ssl: { rejectUnauthorized: false },
  });
  await target.connect();
  console.log('✅ Conectado al PostgreSQL de destino\n');

  try {
    for (const table of TABLES) {
      const [rows] = await source.query(`SELECT * FROM \`${table}\``);
      if (!rows.length) {
        console.log(`• ${table}: 0 filas (omitido)`);
        continue;
      }

      const columns = Object.keys(rows[0]);
      const colList = columns.map((c) => `"${c}"`).join(', ');
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const sql = `INSERT INTO "${table}" (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

      let inserted = 0;
      for (const row of rows) {
        const values = columns.map((c) => normalize(row[c]));
        const res = await target.query(sql, values);
        inserted += res.rowCount;
      }
      console.log(`• ${table}: ${inserted}/${rows.length} filas migradas`);
    }
    console.log('\n🎉 Migración completada.');
  } finally {
    await source.end();
    await target.end();
  }
}

main().catch((err) => {
  console.error('\n❌ Error en la migración:', err.message);
  process.exit(1);
});
