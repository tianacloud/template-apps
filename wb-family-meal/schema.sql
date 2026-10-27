CREATE TABLE IF NOT EXISTS family (id INTEGER PRIMARY KEY CHECK(id=1), name TEXT NOT NULL DEFAULT '奶绿家今天的饭');
CREATE TABLE IF NOT EXISTS members (id INTEGER PRIMARY KEY AUTOINCREMENT, owner_id TEXT NOT NULL UNIQUE, family_id INTEGER NOT NULL DEFAULT 1, nickname TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'diner', created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, family_id INTEGER NOT NULL DEFAULT 1, name TEXT NOT NULL, icon_key TEXT NOT NULL DEFAULT 'bowl', sort_order INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS dishes (id INTEGER PRIMARY KEY AUTOINCREMENT, family_id INTEGER NOT NULL DEFAULT 1, category_id INTEGER, name TEXT NOT NULL, description TEXT DEFAULT '', price REAL DEFAULT 0, tags TEXT DEFAULT '[]', image_path TEXT, is_active INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0, upload_key TEXT UNIQUE);
CREATE TABLE IF NOT EXISTS fridge_items (id INTEGER PRIMARY KEY AUTOINCREMENT, family_id INTEGER NOT NULL DEFAULT 1, name TEXT NOT NULL, qty REAL NOT NULL DEFAULT 1, unit TEXT NOT NULL DEFAULT '份', category TEXT NOT NULL DEFAULT 'other', expire_at TEXT, note TEXT DEFAULT '', created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, family_id INTEGER NOT NULL DEFAULT 1, owner_id TEXT NOT NULL, orderer_name TEXT NOT NULL, meal_type TEXT NOT NULL, note TEXT DEFAULT '', serve_date TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', total_count INTEGER NOT NULL DEFAULT 0, items_json TEXT NOT NULL DEFAULT '[]', seen_by_cook INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL REFERENCES orders(id), dish_id INTEGER, dish_name TEXT NOT NULL, dish_image TEXT, qty INTEGER NOT NULL DEFAULT 1, note TEXT DEFAULT '');

CREATE TRIGGER IF NOT EXISTS orders_insert_items AFTER INSERT ON orders BEGIN
  INSERT INTO order_items(order_id,dish_id,dish_name,dish_image,qty,note)
  SELECT NEW.id, json_extract(value,'$.dishId'), json_extract(value,'$.name'), json_extract(value,'$.imagePath'), COALESCE(json_extract(value,'$.qty'),1), COALESCE(json_extract(value,'$.note'),'') FROM json_each(NEW.items_json);
END;
