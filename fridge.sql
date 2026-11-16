USE recipe_app_db;

-- 1. Actualizăm tabelul existent user_fridge cu coloanele noi
ALTER TABLE user_fridge
ADD COLUMN expiry_date DATE NULL AFTER unit,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 2. Populăm tabelul ingredients cu alimente de bază
INSERT IGNORE INTO ingredients (name, category, default_unit) VALUES
('Ouă', 'Lactate și Ouă', 'pcs'),
('Lapte', 'Lactate și Ouă', 'ml'),
('Unt', 'Lactate și Ouă', 'g'),
('Smântână', 'Lactate și Ouă', 'g'),
('Cașcaval', 'Lactate și Ouă', 'g'),
('Piept de pui', 'Carne și Pește', 'g'),
('Roșii', 'Legume', 'g'),
('Castraveți', 'Legume', 'g'),
('Ceapă galbenă', 'Legume', 'pcs'),
('Cartofi', 'Legume', 'g'),
('Făină albă', 'Cămară', 'g'),
('Orez basmati', 'Cămară', 'g'),
('Paste penne', 'Cămară', 'g'),
('Ulei de măsline', 'Uleiuri și Sosuri', 'ml'),
('Sare', 'Condimente', 'tsp'),
('Piper negru', 'Condimente', 'tsp');