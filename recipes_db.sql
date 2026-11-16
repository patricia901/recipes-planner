USE recipe_app_db;

-- Inserăm 3 rețete de test
INSERT INTO recipes (id, author_id, title, description, instructions, prep_time_minutes, servings, is_public) VALUES
(1, 1, 'Omletă cu cașcaval și roșii', 'Mic dejun rapid, sățios și bogat în proteine.', 
 '["Bate ouăle într-un bol cu un praf de sare și piper.", "Topește untul într-o tigaie antiaderentă la foc mediu.", "Toarnă ouăle, adaugă cașcavalul ras și roșiile tăiate cubulețe.", "Împăturește omleta și servește-o caldă."]', 
 10, 1, TRUE),

(2, 1, 'Piept de pui la tigaie cu roșii', 'Prânz ușor și gustos în mai puțin de 25 de minute.', 
 '["Condimentează pieptul de pui cu sare și piper.", "Încinge uleiul de măsline în tigaie și rumenește puiul 6-7 minute pe fiecare parte.", "Adaugă roșiile tăiate felii în ultimele 3 minute și lasă-le să se înmoaie ușor."]', 
 25, 2, TRUE),

(3, 1, 'Clătite clasice', 'Desert rapid cu ingrediente pe care le ai mereu în casă.', 
 '["Amestecă ouăle cu laptele și un praf de sare.", "Încorporează treptat făina până obții un aluat fluid.", "Coace clătitele într-o tigaie unsă cu puțin unt."]', 
 20, 4, TRUE);

-- Legăm ingredientele de fiecare rețetă
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES
-- Rețeta 1: Omletă (3 Ouă, 50g Cașcaval, 100g Roșii, 10g Unt)
(1, 1, 3, 'pcs'),
(1, 5, 50, 'g'),
(1, 7, 100, 'g'),
(1, 3, 10, 'g'),

-- Rețeta 2: Piept de pui (400g Piept de pui, 200g Roșii, 15ml Ulei de măsline)
(2, 6, 400, 'g'),
(2, 7, 200, 'g'),
(2, 14, 15, 'ml'),

-- Rețeta 3: Clătite (2 Ouă, 250ml Lapte, 150g Făină albă, 20g Unt)
(3, 1, 2, 'pcs'),
(3, 2, 250, 'ml'),
(3, 11, 150, 'g'),
(3, 3, 20, 'g');