-- ==================================================
-- KHỞI TẠO DATABASE
-- ==================================================
CREATE DATABASE IF NOT EXISTS eiu_computer;
USE eiu_computer;

-- Tạm tắt khóa ngoại để dọn dẹp sạch sẽ nếu chạy lại
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS product_tags;
DROP TABLE IF EXISTS item_tags;
DROP TABLE IF EXISTS tags;

DROP TABLE IF EXISTS product_attribute_values;
DROP TABLE IF EXISTS category_attributes;
DROP TABLE IF EXISTS attributes;

DROP TABLE IF EXISTS item_specifications;
DROP TABLE IF EXISTS specifications;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS part_items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS part_categories;

SET FOREIGN_KEY_CHECKS = 1;

-- ==================================================
-- PHẦN 1: TÀI KHOẢN & HỒ SƠ (RBAC + TOKEN)
-- ==================================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer') DEFAULT 'customer',
  is_verified BOOLEAN DEFAULT FALSE,
  verify_token VARCHAR(255) DEFAULT NULL,
  token_expiry DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  loyalty_points INT DEFAULT 0, 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  employee_code VARCHAR(50) UNIQUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==================================================
-- PHẦN 2: DANH MỤC & SẢN PHẨM 
-- ==================================================
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY, -- vd: cpu, vga, ram, monitor...
    name VARCHAR(100) NOT NULL  -- vd: Vi xử lý, Card màn hình...
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE, -- slug_cho_url
  image_url LONGTEXT,       -- Chứa Base64 hoặc link ảnh
  price INT NOT NULL DEFAULT 0,
  old_price INT DEFAULT NULL,
  stock INT NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, sale, out_of_stock
  badge VARCHAR(20),
  description TEXT,
  preset_json JSON,         -- Tùy chọn cho việc lưu PC cấu hình sẵn
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- (Bảng cũ của ông dùng cho Build PC - Tôi vẫn giữ lại)
CREATE TABLE part_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  part_key VARCHAR(50) NOT NULL UNIQUE,
  label VARCHAR(100) NOT NULL
);

CREATE TABLE part_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  image VARCHAR(255) DEFAULT NULL,
  FOREIGN KEY (category_id) REFERENCES part_categories(id) ON DELETE CASCADE
);

-- ==================================================
-- PHẦN 3: THÔNG SỐ ĐỘNG (EAV PATTERN XỊN XÒ ĐỂ TÌM KIẾM)
-- ==================================================
-- Bảng lưu Tên thuộc tính (Ví dụ: Dung lượng, Socket, Kích thước...)
CREATE TABLE attributes (
    id VARCHAR(50) PRIMARY KEY, 
    name VARCHAR(100) NOT NULL, 
    unit VARCHAR(20) NULL       
);

-- Bảng quy định Danh mục nào có Thuộc tính nào (Ví dụ: RAM thì có Dung lượng)
CREATE TABLE category_attributes (
    category_id VARCHAR(50) NOT NULL,
    attribute_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (category_id, attribute_id),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE
);

-- Bảng lưu Giá trị cụ thể của sản phẩm (Ví dụ: Sản phẩm P1 có Dung lượng = 32GB)
CREATE TABLE product_attribute_values (
    product_id INT NOT NULL,
    attribute_id VARCHAR(50) NOT NULL,
    value VARCHAR(255) NOT NULL, 
    PRIMARY KEY (product_id, attribute_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE
);

-- (Bảng thông số Build PC cũ - Giữ nguyên)
CREATE TABLE specifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL, 
  unit VARCHAR(20)            
);

CREATE TABLE item_specifications (
  item_id INT NOT NULL,
  spec_id INT NOT NULL,
  spec_value VARCHAR(255) NOT NULL,
  PRIMARY KEY (item_id, spec_id),
  FOREIGN KEY (item_id) REFERENCES part_items(id) ON DELETE CASCADE,
  FOREIGN KEY (spec_id) REFERENCES specifications(id) ON DELETE CASCADE
);

-- ==================================================
-- PHẦN 4: TEM KHUYẾN MÃI (TAGS)
-- ==================================================
CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tag_name VARCHAR(50) NOT NULL UNIQUE, 
  bg_color VARCHAR(20) DEFAULT '#dc2626', 
  text_color VARCHAR(20) DEFAULT '#ffffff',
  discount_percent INT DEFAULT 0 
);

CREATE TABLE item_tags (
  item_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (item_id, tag_id),
  FOREIGN KEY (item_id) REFERENCES part_items(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE product_tags (
  product_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (product_id, tag_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- ==================================================
-- PHẦN 5: ĐƠN HÀNG (TRANSACTIONS)
-- ==================================================
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_code VARCHAR(50) NOT NULL UNIQUE,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'Đang xử lý',
  total_amount INT NOT NULL DEFAULT 0,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  category_name VARCHAR(100),
  quantity INT NOT NULL DEFAULT 1,
  price INT NOT NULL, 
  product_image LONGTEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ==================================================
-- PHẦN 6: DATA MẪU CƠ BẢN
-- ==================================================
-- 1. Data Admin (Pass: 123456)
INSERT INTO users (email, password_hash, role, is_verified) VALUES 
('admin@eiu.edu.vn', '$2b$10$XU.sQYtZ9vQyG1xI81XFHuF.40E.M6t0QoI/Gi7xWf5f8b9Q5qu6a', 'admin', TRUE);

INSERT INTO admins (user_id, full_name, employee_code) VALUES 
(1, 'Quản Trị Viên', 'EMP-001');

-- 2. Danh mục chuẩn (Categories)
INSERT INTO categories (id, name) VALUES 
('cpu', 'Vi xử lý (CPU)'),
('vga', 'Card màn hình (VGA)'),
('ram', 'Bộ nhớ trong (RAM)'),
('mainboard', 'Bo mạch chủ'),
('monitor', 'Màn hình'),
('case', 'Vỏ Case'),
('ssd', 'Ổ cứng SSD');

-- 3. Từ điển Thuộc tính (Attributes - Dùng để tìm kiếm)
INSERT INTO attributes (id, name, unit) VALUES
('brand', 'Thương hiệu', NULL),
('socket', 'Socket hỗ trợ', NULL),
('cores', 'Số nhân', NULL),
('capacity', 'Dung lượng', 'GB'),
('size', 'Kích thước', 'inch'),
('refresh_rate', 'Tần số quét', 'Hz');

-- 4. Trói buộc Thuộc tính vào Danh mục
-- CPU thì có Hãng, Socket, Số nhân
INSERT INTO category_attributes (category_id, attribute_id) VALUES
('cpu', 'brand'), ('cpu', 'socket'), ('cpu', 'cores');
-- RAM thì có Hãng, Dung lượng
INSERT INTO category_attributes (category_id, attribute_id) VALUES
('ram', 'brand'), ('ram', 'capacity');
-- Màn hình thì có Hãng, Kích thước, Tần số quét
INSERT INTO category_attributes (category_id, attribute_id) VALUES
('monitor', 'brand'), ('monitor', 'size'), ('monitor', 'refresh_rate');

-- 5. Bơm Sản Phẩm
INSERT INTO products (category_id, name, slug, image_url, price, old_price, stock, status, badge, description) VALUES
('cpu', 'Intel Core i9 14900K', 'intel-core-i9-14900k', 'https://placehold.co/100x100?text=CPU', 15500000, 16000000, 12, 'active', NULL, 'CPU khủng nhất năm'),
('ram', 'Corsair Vengeance 32GB', 'corsair-vengeance-32gb', 'https://placehold.co/100x100?text=RAM', 3200000, 3500000, 5, 'sale', 'HOT', 'RAM 32GB cho Game thủ'),
('monitor', 'Màn hình LG 24 inch 144Hz', 'man-hinh-lg-24-inch', 'https://placehold.co/100x100?text=Monitor', 3500000, 4000000, 10, 'active', 'NEW', 'Màn hình chiến game');

-- 6. Gắn Thông Số cho từng Sản phẩm (EAV Value)
-- Cấu hình cho con CPU (id=1)
INSERT INTO product_attribute_values (product_id, attribute_id, value) VALUES
(1, 'brand', 'Intel'), (1, 'socket', 'LGA 1700'), (1, 'cores', '24');
-- Cấu hình cho con RAM (id=2)
INSERT INTO product_attribute_values (product_id, attribute_id, value) VALUES
(2, 'brand', 'Corsair'), (2, 'capacity', '32');
-- Cấu hình cho cái Màn hình (id=3)
INSERT INTO product_attribute_values (product_id, attribute_id, value) VALUES
(3, 'brand', 'LG'), (3, 'size', '24'), (3, 'refresh_rate', '144');
SELECT * FROM customers;
USE eiu_computer;

SELECT 
    u.id AS user_id,
    a.full_name, 
    u.email, 
    a.employee_code,
    u.role,
    u.is_verified,
    u.password_hash
FROM users u
JOIN admins a ON u.id = a.user_id;
UPDATE users SET role = 'admin' WHERE email = 'giakiet189@gmail.com';
INSERT INTO admins (user_id, full_name, employee_code)
SELECT id, 'Sếp Tổng EIU', 'EMP-999' FROM users WHERE email = 'giakiet189@gmail.com';
USE eiu_computer;

-- 1. XÓA SẠCH DỮ LIỆU RÁC ĐỂ BƠM HÀNG XỊN VÀO
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE product_attribute_values;
TRUNCATE TABLE products;
TRUNCATE TABLE part_items;
TRUNCATE TABLE part_categories;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. BƠM 17 DANH MỤC BUILD PC (Bảng part_categories)
INSERT INTO part_categories (id, part_key, label) VALUES 
(1, 'cpu', 'Bộ vi xử lý'), (2, 'main', 'Bo mạch chủ'), (3, 'ram', 'RAM'), 
(4, 'ssd', 'SSD'), (5, 'hdd', 'HDD'), (6, 'vga', 'VGA'), 
(7, 'psu', 'Nguồn'), (8, 'case', 'Vỏ case'), (9, 'monitor', 'Màn hình'), 
(10, 'keyboard', 'Bàn phím'), (11, 'mouse', 'Chuột'), (12, 'headset', 'Tai nghe'), 
(13, 'fan', 'Fan case'), (14, 'aircool', 'Tản nhiệt khí'), (15, 'aio', 'Tản nhiệt nước AIO'), 
(16, 'custom', 'Tản nhiệt nước Custom'), (17, 'windows', 'Windows bản quyền');

-- 3. BỔ SUNG CÁC DANH MỤC CÒN THIẾU CHO BẢNG SẢN PHẨM CHÍNH (Categories)
INSERT IGNORE INTO categories (id, name) VALUES 
('keyboard', 'Bàn phím'), ('mouse', 'Chuột'), ('fan', 'Quạt tản nhiệt');

-- 4. BƠM SẢN PHẨM VÀO TRANG CHỦ / ADMIN / SALE (Lấy đúng tên ảnh trong máy ông)
INSERT INTO products (id, category_id, name, slug, image_url, price, old_price, stock, status, badge, description) VALUES
(1, 'cpu', 'Intel Core i5-12400F', 'intel-core-i5-12400f', 'uploads/parts/Intel Core i5-12400F.jpg', 3500000, 3900000, 20, 'sale', 'HOT', 'CPU quốc dân cho nhu cầu Gaming tầm trung.'),
(2, 'vga', 'Card màn hình RTX 4060', 'vga-rtx-4060', 'uploads/parts/RTX 4060.jpg', 8500000, 9500000, 5, 'sale', 'SALE', 'Hiệu năng đồ họa vượt trội với kiến trúc Ada Lovelace.'),
(3, 'ram', 'RAM 32GB DDR4', 'ram-32gb-ddr4', 'uploads/parts/32GB DDR4.jpg', 2200000, NULL, 15, 'active', NULL, 'Đa nhiệm mượt mà, phù hợp mọi bo mạch chủ DDR4.'),
(4, 'mainboard', 'Asus ROG STRIX B550-F GAMING', 'asus-rog-strix-b550-f-gaming', 'image/mainboard-asus-rog-strix-b550-f-gaming.jpg', 4990000, 5500000, 8, 'sale', 'HOT', 'Bo mạch chủ cao cấp, hỗ trợ PCIe 4.0 và Wi-Fi 6.'),
(5, 'monitor', 'LG UltraGear 27GS75Q-B 27 inch', 'lg-ultragear-27gs75q-b', 'image/LG UltraGear 27GS75Q-B .jpg', 6990000, 7500000, 10, 'active', 'NEW', 'Màn hình IPS 2K 144Hz chuyên game cực mượt.'),
(6, 'mouse', 'Chuột RAZER DeathAdder V2', 'razer-deathadder-v2', 'image/RAZER DeathAdder V2.jpg', 1490000, 1890000, 12, 'sale', 'SALE', 'Huyền thoại form cầm công thái học của dân FPS.'),
(7, 'case', 'Vỏ case Inwin 925 Black Full Tower', 'inwin-925-black', 'image/vo-case-Inwin-925-Black - Full Tower.jpg', 10990000, 11900000, 2, 'active', NULL, 'Case Full Tower nhôm kính cực kỳ sang trọng.'),
(8, 'keyboard', 'Bàn phím FANTECH MAXFIT 67 WHITE', 'fantech-maxfit-67', 'image/FANTECH MAXFIT 67 WHITE.jpg', 1600000, 1800000, 20, 'sale', 'HOT', 'Bàn phím cơ layout 65% nhỏ gọn, switch gõ siêu êm.'),
(9, 'fan', 'Tản nhiệt khí JONSBO CR-1000 EVO', 'jonsbo-cr-1000-evo', 'image/tan-nhiet-khi-cpu-jonsbo-cr-1000-evo-black-color-rgb.jpg', 389000, 590000, 30, 'sale', 'HOT', 'Quạt tản nhiệt quốc dân, LED RGB rực rỡ.');

-- 5. BƠM THUỘC TÍNH (EAV) CHO SẢN PHẨM TRÊN
INSERT INTO product_attribute_values (product_id, attribute_id, value) VALUES
(1, 'brand', 'Intel'), (1, 'socket', 'LGA 1700'), (1, 'cores', '6'),
(3, 'brand', 'Corsair'), (3, 'capacity', '32'),
(5, 'brand', 'LG'), (5, 'size', '27'), (5, 'refresh_rate', '144');

-- 6. BƠM LINH KIỆN BUILD PC (Nhận chuẩn cha mẹ, không bị lỗi 1452 nữa)
INSERT INTO part_items (category_id, name, price, image) VALUES 
(1, 'Intel Core i5-12400F', 3500000, 'uploads/parts/Intel Core i5-12400F.jpg'),
(1, 'AMD Ryzen 5 5600X', 3900000, 'uploads/parts/AMD Ryzen 5 5600X.jpg'),
(2, 'Mainboard B660M', 2200000, 'uploads/parts/B660M.jpg'),
(2, 'Mainboard B760M', 2900000, 'uploads/parts/B760M.jpg'),
(3, 'RAM 16GB DDR4', 1200000, 'uploads/parts/16GB DDR4.jpg'),
(3, 'RAM 32GB DDR4', 2200000, 'uploads/parts/32GB DDR4.jpg'),
(4, 'SSD 512GB NVMe', 1300000, 'uploads/parts/SSD 512GB.jpg'),
(4, 'SSD 1TB NVMe', 2300000, 'uploads/parts/SSD 1TB.jpg'),
(5, 'HDD 1TB WD Blue', 950000, 'uploads/parts/HDD 1TB.jpg'),
(5, 'HDD 2TB Seagate', 1450000, 'uploads/parts/HDD 2TB.jpg'),
(6, 'VGA RTX 3060 12GB', 7500000, 'uploads/parts/RTX 3060.jpg'),
(6, 'VGA RTX 4060 8GB', 8500000, 'uploads/parts/RTX 4060.jpg'),
(7, 'Nguồn 650W Bronze', 1100000, 'uploads/parts/650W Bronze.jpg');
SELECT * FROM admins;