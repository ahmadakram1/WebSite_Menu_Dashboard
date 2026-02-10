-- backend/seed.sql (MySQL)
INSERT INTO restaurants (name_ar, name_en, phone, whatsapp, instagram)
VALUES ('مطعم تجريبي', 'Sample Restaurant', '0100000000', '0100000000', 'sample_restaurant');

INSERT INTO categories (name_ar, name_en, description_ar, description_en)
VALUES ('مقبلات', 'Starters', 'وصف مختصر', 'Short description');

INSERT INTO items (name_ar, name_en, price, description_ar, description_en, category_id)
VALUES ('بطاطس مقلية', 'French Fries', 20.00, 'وصف', 'Description', 1);

INSERT INTO admins (email, password)
VALUES ('admin@karakdose.com', '$2y$10$rsP58UjpdeuwSoCY/T16BeginUHPhdmsjhzM.q75hZPd1LnnWBRSG');
