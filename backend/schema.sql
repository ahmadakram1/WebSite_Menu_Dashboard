-- backend/schema.sql (MySQL)
CREATE TABLE restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name_ar VARCHAR(150) NOT NULL,
  name_en VARCHAR(150) NOT NULL,
  logo VARCHAR(255) NULL,
  phone VARCHAR(30) NULL,
  whatsapp VARCHAR(30) NULL,
  instagram VARCHAR(120) NULL,
  theme_bg VARCHAR(32) NULL,
  theme_card VARCHAR(32) NULL,
  theme_text VARCHAR(32) NULL,
  theme_muted VARCHAR(32) NULL,
  theme_accent VARCHAR(32) NULL,
  theme_accent2 VARCHAR(32) NULL,
  theme_border VARCHAR(32) NULL,
  font_family VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name_ar VARCHAR(150) NOT NULL,
  name_en VARCHAR(150) NOT NULL,
  description_ar TEXT NULL,
  description_en TEXT NULL,
  image VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name_ar VARCHAR(150) NOT NULL,
  name_en VARCHAR(150) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description_ar TEXT NULL,
  description_en TEXT NULL,
  image VARCHAR(255) NULL,
  category_id INT NULL,
  CONSTRAINT fk_items_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

