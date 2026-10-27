CREATE TABLE IF NOT EXISTS gym_records (
  kind TEXT NOT NULL,
  id TEXT NOT NULL,
  payload TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (kind, id)
);
CREATE INDEX IF NOT EXISTS gym_records_kind_updated ON gym_records(kind, updated_at);
CREATE TRIGGER IF NOT EXISTS gym_coach_rename AFTER UPDATE OF payload ON gym_records
WHEN OLD.kind = 'coach' AND json_extract(OLD.payload,'$.name') <> json_extract(NEW.payload,'$.name')
BEGIN
  UPDATE gym_records SET payload = json_set(payload,'$.owner',json_extract(NEW.payload,'$.name')), revision = revision + 1, updated_at = CURRENT_TIMESTAMP
    WHERE kind IN ('order','customer') AND json_extract(payload,'$.owner') = json_extract(OLD.payload,'$.name');
END;
CREATE TRIGGER IF NOT EXISTS gym_coach_delete AFTER DELETE ON gym_records
WHEN OLD.kind = 'coach'
BEGIN
  UPDATE gym_records SET payload = json_set(payload,'$.owner',''), revision = revision + 1, updated_at = CURRENT_TIMESTAMP
    WHERE kind IN ('order','customer') AND json_extract(payload,'$.owner') = json_extract(OLD.payload,'$.name');
END;
CREATE TRIGGER IF NOT EXISTS gym_store_rename AFTER UPDATE OF payload ON gym_records
WHEN OLD.kind = 'store' AND json_extract(OLD.payload,'$.name') <> json_extract(NEW.payload,'$.name')
BEGIN
  UPDATE gym_records SET payload = json_set(payload,'$.store',json_extract(NEW.payload,'$.name')), revision = revision + 1, updated_at = CURRENT_TIMESTAMP
    WHERE kind IN ('order','customer') AND json_extract(payload,'$.store') = json_extract(OLD.payload,'$.name');
END;
CREATE TRIGGER IF NOT EXISTS gym_restore AFTER INSERT ON gym_records
WHEN NEW.kind = 'restore'
BEGIN
  DELETE FROM gym_records WHERE kind IN ('order','customer','coach','store','course','settings');
  INSERT INTO gym_records(kind,id,payload,revision)
    SELECT json_extract(value,'$.kind'), json_extract(value,'$.id'), json_extract(value,'$.payload'), 1
    FROM json_each(NEW.payload,'$.records');
  DELETE FROM gym_records WHERE kind = 'restore' AND id = NEW.id;
END;
CREATE TRIGGER IF NOT EXISTS gym_order_customer AFTER INSERT ON gym_records
WHEN NEW.kind = 'order' AND json_extract(NEW.payload,'$.autoCustomer') = 1 AND NOT EXISTS (SELECT 1 FROM gym_records WHERE kind='restore')
BEGIN
  INSERT INTO gym_records(kind,id,payload)
    SELECT 'customer','order-' || NEW.id,json_object('name',json_extract(NEW.payload,'$.name'),'phone',json_extract(NEW.payload,'$.phone'),'course',json_extract(NEW.payload,'$.course'),'owner',COALESCE(json_extract(NEW.payload,'$.owner'),''),'store',COALESCE(json_extract(NEW.payload,'$.store'),''),'tags',json_array('新客'),'join',json_extract(NEW.payload,'$.time'))
    WHERE NOT EXISTS (SELECT 1 FROM gym_records WHERE kind='customer' AND json_extract(payload,'$.name')=json_extract(NEW.payload,'$.name') AND json_extract(payload,'$.phone')=json_extract(NEW.payload,'$.phone'));
END;
CREATE TRIGGER IF NOT EXISTS gym_order_fill_customer AFTER INSERT ON gym_records
WHEN NEW.kind = 'order' AND json_extract(NEW.payload,'$.autoCustomer') = 1 AND NOT EXISTS (SELECT 1 FROM gym_records WHERE kind='restore')
BEGIN
  UPDATE gym_records SET payload=json_set(payload,
      '$.owner',CASE WHEN COALESCE(json_extract(payload,'$.owner'),'')='' THEN COALESCE(json_extract(NEW.payload,'$.owner'),'') ELSE json_extract(payload,'$.owner') END,
      '$.store',CASE WHEN COALESCE(json_extract(payload,'$.store'),'')='' THEN COALESCE(json_extract(NEW.payload,'$.store'),'') ELSE json_extract(payload,'$.store') END),
    revision=revision+1,updated_at=CURRENT_TIMESTAMP
    WHERE kind='customer' AND json_extract(payload,'$.name')=json_extract(NEW.payload,'$.name') AND json_extract(payload,'$.phone')=json_extract(NEW.payload,'$.phone')
      AND ((COALESCE(json_extract(payload,'$.owner'),'')='' AND COALESCE(json_extract(NEW.payload,'$.owner'),'')!='') OR (COALESCE(json_extract(payload,'$.store'),'')='' AND COALESCE(json_extract(NEW.payload,'$.store'),'')!=''));
END;
CREATE TRIGGER IF NOT EXISTS gym_import AFTER INSERT ON gym_records
WHEN NEW.kind = 'import'
BEGIN
  INSERT INTO gym_records(kind,id,payload)
    SELECT 'course', json_extract(value,'$.id'), json_extract(value,'$.payload')
    FROM json_each(NEW.payload,'$.courses') AS incoming
    WHERE NOT EXISTS (SELECT 1 FROM gym_records AS current WHERE current.kind='course' AND json_extract(current.payload,'$.name')=json_extract(incoming.value,'$.payload.name'));
  INSERT INTO gym_records(kind,id,payload)
    SELECT 'order', json_extract(value,'$.id'), json_extract(value,'$.payload')
    FROM json_each(NEW.payload,'$.orders') AS incoming
    WHERE NOT EXISTS (SELECT 1 FROM gym_records AS current WHERE current.kind='order' AND json_extract(current.payload,'$.phone')=json_extract(incoming.value,'$.payload.phone'));
  DELETE FROM gym_records WHERE kind='import' AND id=NEW.id;
END;
CREATE TRIGGER IF NOT EXISTS gym_batch AFTER INSERT ON gym_records
WHEN NEW.kind = 'batch'
BEGIN
  SELECT CASE WHEN (SELECT count(*) FROM json_each(NEW.payload,'$.items')) !=
    (SELECT count(*) FROM gym_records AS current JOIN json_each(NEW.payload,'$.items') AS i
      ON current.kind='order' AND current.id=json_extract(i.value,'$.id') AND current.revision=json_extract(i.value,'$.revision'))
    THEN RAISE(ABORT,'batch conflict') END;
  UPDATE gym_records SET payload=json_set(payload,'$.settled',json('true'),'$.settledAt',json_extract(NEW.payload,'$.settledAt')),revision=revision+1,updated_at=CURRENT_TIMESTAMP
    WHERE kind='order' AND json_extract(NEW.payload,'$.action')='settle'
      AND id IN (SELECT json_extract(value,'$.id') FROM json_each(NEW.payload,'$.items'));
  DELETE FROM gym_records WHERE kind='order' AND json_extract(NEW.payload,'$.action')='delete'
      AND id IN (SELECT json_extract(value,'$.id') FROM json_each(NEW.payload,'$.items'));
  DELETE FROM gym_records WHERE kind='batch' AND id=NEW.id;
END;
CREATE TRIGGER IF NOT EXISTS gym_update_many AFTER INSERT ON gym_records
WHEN NEW.kind = 'update-many'
BEGIN
  SELECT CASE WHEN (SELECT count(*) FROM json_each(NEW.payload,'$.items')) !=
    (SELECT count(*) FROM gym_records AS current JOIN json_each(NEW.payload,'$.items') AS i
      ON current.kind=json_extract(i.value,'$.kind') AND current.id=json_extract(i.value,'$.id') AND current.revision=json_extract(i.value,'$.revision'))
    THEN RAISE(ABORT,'update conflict') END;
  UPDATE gym_records SET payload=(SELECT json_extract(i.value,'$.payload') FROM json_each(NEW.payload,'$.items') AS i WHERE json_extract(i.value,'$.kind')=gym_records.kind AND json_extract(i.value,'$.id')=gym_records.id),revision=revision+1,updated_at=CURRENT_TIMESTAMP
    WHERE EXISTS(SELECT 1 FROM json_each(NEW.payload,'$.items') AS i WHERE json_extract(i.value,'$.kind')=gym_records.kind AND json_extract(i.value,'$.id')=gym_records.id);
  DELETE FROM gym_records WHERE kind='update-many' AND id=NEW.id;
END;
