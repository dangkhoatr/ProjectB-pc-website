-- ==================================================
-- KHỞI TẠO DATABASE: MASTER V3 (GỘP KHO & CHUẨN HÓA ADMIN)
-- ==================================================
CREATE DATABASE IF NOT EXISTS eiu_computer;
USE eiu_computer;

-- Tắt khóa ngoại để dọn dẹp sạch sẽ
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS product_bundles, order_items, orders, admins, customers, users;
DROP TABLE IF EXISTS product_tags, item_tags, tags, product_attribute_values, category_attributes, attributes;
DROP TABLE IF EXISTS item_specifications, specifications, products, part_items, categories, part_categories;

SET FOREIGN_KEY_CHECKS = 1;

-- ==================================================
-- PHẦN 1: TÀI KHOẢN & HỒ SƠ (CHỨA ADMIN BATMAN)
-- ==================================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer') DEFAULT 'customer',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
  customer_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id INT UNIQUE DEFAULT NULL,
  customer_code VARCHAR(20) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE DEFAULT NULL,
  cccd VARCHAR(20) UNIQUE DEFAULT NULL,
  address TEXT DEFAULT NULL,
  loyalty_points INT UNSIGNED DEFAULT 0,
  note TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
-- PHẦN 2: DANH MỤC & SẢN PHẨM NHẤT QUÁN (EAV CORE)
-- ==================================================
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY, 
    name VARCHAR(100) NOT NULL  
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE, 
  image_url LONGTEXT,       
  price INT UNSIGNED NOT NULL DEFAULT 0,
  old_price INT UNSIGNED DEFAULT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'active', 
  badge VARCHAR(20),
  description TEXT,
  preset_json JSON,         
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Bảng Bundle cho PC bộ sau này
CREATE TABLE product_bundles (
  parent_id INT NOT NULL,
  child_id INT NOT NULL,
  quantity INT UNSIGNED DEFAULT 1,
  PRIMARY KEY (parent_id, child_id),
  FOREIGN KEY (parent_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (child_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ==================================================
-- PHẦN 3: THÔNG SỐ ĐỘNG (EAV PATTERN) & ĐƠN HÀNG
-- ==================================================
CREATE TABLE attributes (
    id VARCHAR(50) PRIMARY KEY, 
    name VARCHAR(100) NOT NULL, 
    unit VARCHAR(20) NULL       
);

CREATE TABLE product_attribute_values (
    product_id INT NOT NULL,
    attribute_id VARCHAR(50) NOT NULL,
    value VARCHAR(255) NOT NULL, 
    PRIMARY KEY (product_id, attribute_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id CHAR(36) NOT NULL,
  order_code VARCHAR(50) NOT NULL UNIQUE,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'Đang xử lý',
  total_amount INT UNSIGNED NOT NULL DEFAULT 0,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT DEFAULT NULL,
  product_name VARCHAR(255) NOT NULL,
  category_name VARCHAR(100),
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  price INT UNSIGNED NOT NULL, 
  product_image LONGTEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ==================================================
-- PHẦN 4: BƠM DỮ LIỆU SIÊU SẠCH (CỨU TOÀN BỘ DATA CŨ)
-- ==================================================

-- 1. TẠO TÀI KHOẢN ADMIN BATMAN NGAY TỪ ĐẦU 
INSERT INTO users (email, phone, password_hash, role, is_verified) VALUES 
('batman@eiu.edu.vn', '012345678', '$2b$10$XU.sQYtZ9vQyG1xI81XFHuF.40E.M6t0QoI/Gi7xWf5f8b9Q5qu6a', 'admin', TRUE);

-- Data Admin của Khoa (Đã thêm sđt ảo để chống lỗi)
INSERT INTO users (email, phone, password_hash, role, is_verified) VALUES 
('admin@eiu.edu.vn', '000000001', '$2b$10$KeFX7Orb...', 'admin', TRUE),
('khoa.tran.cit20@eiu.edu.vn', '000000002', '$2b$10$KeFX7Orb...', 'admin', TRUE);

INSERT INTO admins (user_id, full_name, employee_code) VALUES 
(1, 'Batman', 'EMP-BATMAN');

-- 2. ĐỊNH NGHĨA DANH MỤC TỔNG HỢP
INSERT IGNORE INTO categories (id, name) VALUES 
('cpu', 'Vi xử lý (CPU)'), ('mainboard', 'Bo mạch chủ'), ('ram', 'Bộ nhớ trong (RAM)'),
('ssd', 'Ổ cứng SSD'), ('hdd', 'Ổ cứng HDD'), ('vga', 'Card màn hình (VGA)'),
('psu', 'Nguồn (PSU)'), ('case', 'Vỏ Case'), ('monitor', 'Màn hình'),
('keyboard', 'Bàn phím'), ('mouse', 'Chuột'), ('fan', 'Quạt tản nhiệt'), 
('pc_set', 'PC Lắp Ráp Sẵn');

-- 3. CỨU DỮ LIỆU TỪ BẢNG PRODUCTS CŨ (Giữ nguyên)
INSERT INTO products (id, category_id, name, slug, image_url, price, old_price, stock, status, badge, description, preset_json) VALUES
(1, 'cpu', 'Intel Core i5-12400F', 'intel-core-i5-12400f', 'uploads/parts/Intel Core i5-12400F.jpg', 3500000, 3900000, 20, 'sale', 'HOT', 'CPU quốc dân cho nhu cầu Gaming tầm trung.', '{"brand":"Intel"}'),
(2, 'vga', 'Card màn hình RTX 4060', 'vga-rtx-4060', 'uploads/parts/RTX 4060.jpg', 8500000, 9500000, 5, 'sale', 'SALE', 'Hiệu năng đồ họa vượt trội với kiến trúc Ada Lovelace.', '{"brand":"Nvidia"}'),
(3, 'ram', 'RAM 32GB DDR4', 'ram-32gb-ddr4', 'uploads/parts/32GB DDR4.jpg', 2200000, NULL, 15, 'active', NULL, 'Đa nhiệm mượt mà, phù hợp mọi bo mạch chủ DDR4.', '{}'),
(4, 'mainboard', 'Asus ROG STRIX B550-F GAMING', 'asus-rog-strix-b550-f-gaming', 'image/mainboard-asus-rog-strix-b550-f-gaming.jpg', 4990000, 5500000, 8, 'sale', 'HOT', 'Bo mạch chủ cao cấp, hỗ trợ PCIe 4.0 và Wi-Fi 6.', '{}'),
(5, 'monitor', 'LG UltraGear 27GS75Q-B 27 inch', 'lg-ultragear-27gs75q-b', 'image/LG UltraGear 27GS75Q-B .jpg', 6990000, 7500000, 10, 'active', 'NEW', 'Màn hình IPS 2K 144Hz chuyên game cực mượt.', '{}'),
(6, 'mouse', 'Chuột RAZER DeathAdder V2', 'razer-deathadder-v2', 'image/RAZER DeathAdder V2.jpg', 1490000, 1890000, 12, 'sale', 'SALE', 'Huyền thoại form cầm công thái học của dân FPS.', '{}'),
(7, 'case', 'Vỏ case Inwin 925 Black Full Tower', 'inwin-925-black', 'image/vo-case-Inwin-925-Black - Full Tower.jpg', 10990000, 11900000, 2, 'active', NULL, 'Case Full Tower nhôm kính cực kỳ sang trọng.', '{}'),
(8, 'keyboard', 'Bàn phím FANTECH MAXFIT 67 WHITE', 'fantech-maxfit-67', 'image/FANTECH MAXFIT 67 WHITE.jpg', 1600000, 1800000, 20, 'sale', 'HOT', 'Bàn phím cơ layout 65% nhỏ gọn, switch gõ siêu êm.', '{}'),
(9, 'fan', 'Tản nhiệt khí JONSBO CR-1000 EVO', 'jonsbo-cr-1000-evo', 'image/tan-nhiet-khi-cpu-jonsbo-cr-1000-evo-black-color-rgb.jpg', 389000, 590000, 30, 'sale', 'HOT', 'Quạt tản nhiệt quốc dân, LED RGB rực rỡ.', '{}');

-- 4. CỨU DỮ LIỆU TỪ BẢNG PART_ITEMS CŨ VÀO CHUNG BẢNG PRODUCTS MỚI
-- (Tự cấp ID nối tiếp, tự gán danh mục chữ, tự set kho mặc định là 10 để Admin thấy được)
INSERT INTO products (category_id, name, slug, price, stock, image_url, preset_json) VALUES 
('cpu', 'AMD Ryzen 5 5600X', 'amd-ryzen-5-5600x', 3900000, 10, 'uploads/parts/AMD Ryzen 5 5600X.jpg', '{}'),
('mainboard', 'Mainboard B660M', 'mainboard-b660m', 2200000, 10, 'uploads/parts/B660M.jpg', '{}'),
('mainboard', 'Mainboard B760M', 'mainboard-b760m', 2900000, 10, 'uploads/parts/B760M.jpg', '{}'),
('ram', 'RAM 16GB DDR4', 'ram-16gb-ddr4', 1200000, 15, 'uploads/parts/16GB DDR4.jpg', '{}'),
('ssd', 'SSD 512GB NVMe', 'ssd-512gb-nvme', 1300000, 20, 'uploads/parts/SSD 512GB.jpg', '{}'),
('ssd', 'SSD 1TB NVMe', 'ssd-1tb-nvme', 2300000, 10, 'uploads/parts/SSD 1TB.jpg', '{}'),
('hdd', 'HDD 1TB WD Blue', 'hdd-1tb-wd-blue', 950000, 10, 'uploads/parts/HDD 1TB.jpg', '{}'),
('hdd', 'HDD 2TB Seagate', 'hdd-2tb-seagate', 1450000, 5, 'uploads/parts/HDD 2TB.jpg', '{}'),
('vga', 'VGA RTX 3060 12GB', 'vga-rtx-3060-12gb', 7500000, 5, 'uploads/parts/RTX 3060.jpg', '{}'),
('psu', 'Nguồn 650W Bronze', 'nguon-650w-bronze', 1100000, 10, 'uploads/parts/650W Bronze.jpg', '{}');
USE eiu_computer;

-- Trả lại 2 cột xác thực cho bảng users
ALTER TABLE users ADD COLUMN verify_token VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN token_expiry DATETIME DEFAULT NULL;
UPDATE users SET role = 'admin', is_verified = 1 WHERE email = 'giakiet189@gmail.com';

-- Gắn luôn thẻ nhân viên cho ngầu
INSERT INTO admins (user_id, full_name, employee_code) 
SELECT id, 'Gia Kiệt', 'EMP-VIP' FROM users WHERE email = 'giakiet189@gmail.com';
USE eiu_computer;
ALTER TABLE products ADD COLUMN description TEXT NULL AFTER name; 