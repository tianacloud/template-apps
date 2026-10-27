CREATE TABLE IF NOT EXISTS am_tables (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', color TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, fields_json TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS am_assets (id TEXT PRIMARY KEY, table_id TEXT NOT NULL, data_json TEXT NOT NULL, updated_at TEXT NOT NULL, FOREIGN KEY(table_id) REFERENCES am_tables(id));
CREATE INDEX IF NOT EXISTS am_assets_table_idx ON am_assets(table_id);
CREATE TABLE IF NOT EXISTS am_racks (id TEXT PRIMARY KEY, table_id TEXT NOT NULL, code TEXT NOT NULL, name TEXT NOT NULL, u_total INTEGER NOT NULL, row_label TEXT NOT NULL DEFAULT '', x INTEGER NOT NULL DEFAULT 0, y INTEGER NOT NULL DEFAULT 0, UNIQUE(table_id,code), FOREIGN KEY(table_id) REFERENCES am_tables(id));
CREATE TABLE IF NOT EXISTS am_files (id TEXT PRIMARY KEY, table_id TEXT NOT NULL, asset_id TEXT NOT NULL, name TEXT NOT NULL, path TEXT NOT NULL, size INTEGER NOT NULL, created_at TEXT NOT NULL, FOREIGN KEY(asset_id) REFERENCES am_assets(id));
CREATE TABLE IF NOT EXISTS am_restore_history (id TEXT PRIMARY KEY, restored_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS am_restore_queue (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
CREATE TRIGGER IF NOT EXISTS am_restore_apply AFTER INSERT ON am_restore_queue BEGIN
  DELETE FROM am_files;
  DELETE FROM am_assets;
  DELETE FROM am_racks;
  DELETE FROM am_tables;
  INSERT INTO am_tables(id,name,type,description,color,sort_order,fields_json)
    SELECT json_extract(value,'$.id'),json_extract(value,'$.name'),json_extract(value,'$.type'),json_extract(value,'$.description'),json_extract(value,'$.color'),json_extract(value,'$.sort_order'),json_extract(value,'$.fields_json') FROM json_each(NEW.payload,'$.tables');
  INSERT INTO am_assets(id,table_id,data_json,updated_at)
    SELECT json_extract(value,'$.id'),json_extract(value,'$.table_id'),json_extract(value,'$.data_json'),json_extract(value,'$.updated_at') FROM json_each(NEW.payload,'$.assets');
  INSERT INTO am_racks(id,table_id,code,name,u_total,row_label,x,y)
    SELECT json_extract(value,'$.id'),json_extract(value,'$.table_id'),json_extract(value,'$.code'),json_extract(value,'$.name'),json_extract(value,'$.u_total'),json_extract(value,'$.row_label'),json_extract(value,'$.x'),json_extract(value,'$.y') FROM json_each(NEW.payload,'$.racks');
  INSERT INTO am_files(id,table_id,asset_id,name,path,size,created_at)
    SELECT json_extract(value,'$.id'),json_extract(value,'$.table_id'),json_extract(value,'$.asset_id'),json_extract(value,'$.name'),json_extract(value,'$.path'),json_extract(value,'$.size'),json_extract(value,'$.created_at') FROM json_each(NEW.payload,'$.attachments');
  INSERT INTO am_restore_history(id,restored_at) VALUES(NEW.id,datetime('now'));
  DELETE FROM am_restore_queue WHERE id=NEW.id;
END;
