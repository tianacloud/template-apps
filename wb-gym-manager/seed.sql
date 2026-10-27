INSERT OR IGNORE INTO gym_records(kind,id,payload) VALUES
('settings','default','{"mode":"custom","fixedRate":15,"countDue":true}'),
('course','personal','{"name":"私教课","rate":15,"price":3600}'),
('course','group','{"name":"团课","rate":12,"price":599}'),
('course','annual','{"name":"年卡","rate":10,"price":2880}'),
('course','trial','{"name":"体验课","rate":8,"price":99}');
