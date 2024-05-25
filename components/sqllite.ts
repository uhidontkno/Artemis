import sqllite from "bun:sqlite";

// database operations
export function dbopen(addr: string, create: boolean = true): sqllite {
  return new sqllite(addr, { create: create });
}
export function dbmaketable(db: sqllite, table: string, errorExist: boolean = false) {
  const sql = `SELECT name FROM sqlite_master WHERE type='table' AND name=?`;
  const stmt = db.prepare(sql);
  const result = stmt.get(table);

  if (!result) {
    db.exec(`CREATE TABLE ${table} (name TEXT PRIMARY KEY, value TEXT)`);
  } else if (result && errorExist) {
    throw new Error("Table exists")
  }
}
export function dbdroptable(db: sqllite, table: string) {
  // https://xkcd.com/327/
  const sql = `SELECT name FROM sqlite_master WHERE type='table' AND name=?`;
  const stmt = db.prepare(sql);
  const result = stmt.get(table);
  if (result) {
    db.run(`DROP TABLE ${table};`);
  }
}
export function dbwrite(
  db: sqllite,
  table: string,
  name: string,
  value: string,
  mode: string = "overwrite",
) {
  dbmaketable(db, table);

  const sql = `SELECT * FROM ${table} WHERE name = ?`;
  const stmt = db.prepare(sql);
  const result = stmt.get(name);

  if (!result) {
    const stmtInsert = db.prepare(
      `INSERT INTO ${table} (name, value) VALUES (?, ?)`,
    );
    stmtInsert.run(name, value);
    // return;
  }

  if (mode == "overwrite") {
    const stmtUpdate = db.prepare(
      `UPDATE ${table} SET value = ? WHERE name = ?`,
    );
    stmtUpdate.run(value, name);
  } else if (mode == "append") {
    const stmtAppend = db.prepare(
      `UPDATE ${table} SET value = value || ? WHERE name = ?`,
    );
    stmtAppend.run(value, name);
  }
}
export function dbread(db: sqllite, table: string, name: string) {
  dbmaketable(db, table);
  const sql = `SELECT value FROM ${table} WHERE name = ?`;
  const stmt = db.prepare(sql);
  const result = stmt.get(name);
  return result;
}
export default {dbdroptable,dbmaketable,dbopen,dbread,dbwrite}