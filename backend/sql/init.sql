CREATE DATABASE IF NOT EXISTS eiu_computer;
USE eiu_computer;

-- ==========================================
-- 1. DROP BẢNG CŨ (Theo thứ tự để không dính lỗi Khóa ngoại)
-- ==========================================
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS part_items;
DROP TABLE IF EXISTS part_categories;

-- ==========================================
-- 2. TẠO BẢNG TÀI KHOẢN & HỒ SƠ (CHUẨN RBAC)
-- ==========================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  employee_code VARCHAR(50) UNIQUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- 3. TẠO BẢNG SẢN PHẨM & LINH KIỆN
-- ==========================================
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

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  image VARCHAR(255),
  price INT NOT NULL,
  old_price INT DEFAULT NULL,
  badge VARCHAR(20),
  description TEXT,
  category VARCHAR(50), -- Đã tích hợp sẵn cột category vào đây
  preset_json JSON
);

-- ==========================================
-- 4. TẠO BẢNG ĐƠN HÀNG
-- ==========================================
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
  product_image VARCHAR(255),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ==========================================
-- 5. INSERT DỮ LIỆU MẪU TÀI KHOẢN (Để test Login)
-- Mật khẩu mẫu ở đây là '123456' đã được mã hóa Bcrypt
-- ==========================================
INSERT INTO users (email, password_hash, role) VALUES 
('admin@eiu.edu.vn', '$2b$10$XU.sQYtZ9vQyG1.../Gi7xWf5f8b9Q5q', 'admin'),
('giakiet@example.com', '$2b$10$XU.sQYtZ9vQyG1.../Gi7xWf5f8b9Q5q', 'customer');

INSERT INTO customers (user_id, full_name, phone, address) VALUES 
(2, 'Nguyễn Gia Kiệt', '0912345678', 'Đại học Quốc Tế Miền Đông (EIU), Thành phố mới Bình Dương');

INSERT INTO admins (user_id, full_name, employee_code) VALUES 
(1, 'Quản Trị Viên', 'EMP-001');

-- ==========================================
-- 6. INSERT DỮ LIỆU SẢN PHẨM & LINH KIỆN
-- ==========================================
INSERT INTO part_categories (part_key, label) VALUES
('cpu', 'Bộ vi xử lý'), ('main', 'Bo mạch chủ'), ('ram', 'RAM'), 
('ssd', 'SSD'), ('hdd', 'HDD'), ('vga', 'VGA'), ('psu', 'Nguồn'), 
('case', 'Vỏ case'), ('monitor', 'Màn hình'), ('keyboard', 'Bàn phím'), 
('mouse', 'Chuột'), ('headset', 'Tai nghe'), ('fan', 'Fan case'), 
('aircool', 'Tản nhiệt khí'), ('aio', 'Tản nhiệt nước AIO'), 
('custom', 'Tản nhiệt nước Custom'), ('windows', 'Windows bản quyền');

-- Insert Part Items
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'Intel Core i5-12400F', 3500000, 'uploads/parts/Intel Core i5-12400F.jpg' FROM part_categories WHERE part_key='cpu';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'AMD Ryzen 5 5600X', 3900000, 'uploads/parts/AMD Ryzen 5 5600X.jpg' FROM part_categories WHERE part_key='cpu';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'B660M', 2200000, 'uploads/parts/B660M.jpg' FROM part_categories WHERE part_key='main';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'B760M', 2900000, 'uploads/parts/B760M.jpg' FROM part_categories WHERE part_key='main';
INSERT INTO part_items (category_id, name, price, image) SELECT id, '16GB DDR4', 1200000, 'uploads/parts/16GB DDR4.jpg' FROM part_categories WHERE part_key='ram';
INSERT INTO part_items (category_id, name, price, image) SELECT id, '32GB DDR4', 2200000, 'uploads/parts/32GB DDR4.jpg' FROM part_categories WHERE part_key='ram';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'SSD 512GB', 1300000, 'uploads/parts/SSD 512GB.jpg' FROM part_categories WHERE part_key='ssd';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'SSD 1TB', 2300000, 'uploads/parts/SSD 1TB.jpg' FROM part_categories WHERE part_key='ssd';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'HDD 1TB', 900000, 'uploads/parts/HDD 1TB.jpg' FROM part_categories WHERE part_key='hdd';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'HDD 2TB', 1500000, 'uploads/parts/HDD 2TB.jpg' FROM part_categories WHERE part_key='hdd';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'RTX 3060', 7500000, 'uploads/parts/RTX 3060.jpg' FROM part_categories WHERE part_key='vga';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'RTX 4060', 9500000, 'uploads/parts/RTX 4060.jpg' FROM part_categories WHERE part_key='vga';
INSERT INTO part_items (category_id, name, price, image) SELECT id, '650W Bronze', 1200000, 'uploads/parts/650W Bronze.jpg' FROM part_categories WHERE part_key='psu';
INSERT INTO part_items (category_id, name, price, image) SELECT id, '750W Gold', 1800000, 'uploads/parts/750W Gold.jpg' FROM part_categories WHERE part_key='psu';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'Case Mid Tower', 1000000, 'uploads/parts/Case Mid Tower.jpg' FROM part_categories WHERE part_key='case';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'Case Full Tower', 1800000, 'uploads/parts/Case Full Tower.jpg' FROM part_categories WHERE part_key='case';
INSERT INTO part_items (category_id, name, price, image) SELECT id, '24 inch FHD', 3000000, 'uploads/parts/24 inch FHD.jpg' FROM part_categories WHERE part_key='monitor';
INSERT INTO part_items (category_id, name, price, image) SELECT id, '27 inch QHD', 5200000, 'uploads/parts/27 inch QHD.jpg' FROM part_categories WHERE part_key='monitor';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'Phím cơ', 600000, 'uploads/parts/Phím cơ.jpg' FROM part_categories WHERE part_key='keyboard';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'Phím văn phòng', 300000, 'uploads/parts/Phím văn phòng.jpg' FROM part_categories WHERE part_key='keyboard';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'Chuột gaming', 400000, 'uploads/parts/Chuột gaming.jpg' FROM part_categories WHERE part_key='mouse';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'Chuột văn phòng', 200000, 'uploads/parts/Chuột văn phòng.jpg' FROM part_categories WHERE part_key='mouse';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'Tai nghe gaming', 800000, 'uploads/parts/Tai nghe gaming.jpg' FROM part_categories WHERE part_key='headset';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'Tai nghe thường', 400000, 'uploads/parts/Tai nghe thường.jpg' FROM part_categories WHERE part_key='headset';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'Fan RGB', 300000, 'uploads/parts/Fan RGB.jpg' FROM part_categories WHERE part_key='fan';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'Fan thường', 150000, 'uploads/parts/Fan thường.jpg' FROM part_categories WHERE part_key='fan';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'Tản khí Cooler Master', 700000, 'uploads/parts/Tản khí Cooler Master.jpg' FROM part_categories WHERE part_key='aircool';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'Tản khí Noctua', 1500000, 'uploads/parts/Tản khí Noctua.jpg' FROM part_categories WHERE part_key='aircool';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'AIO 240mm', 2500000, 'uploads/parts/AIO 240mm.jpg' FROM part_categories WHERE part_key='aio';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'AIO 360mm', 4200000, 'uploads/parts/AIO 360mm.jpg' FROM part_categories WHERE part_key='aio';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'Custom cơ bản', 5000000, 'uploads/parts/Custom cơ bản.jpg' FROM part_categories WHERE part_key='custom';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'Custom cao cấp', 9000000, 'uploads/parts/Custom cao cấp.jpg' FROM part_categories WHERE part_key='custom';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'Windows 11 Home', 1200000, 'uploads/parts/Windows 11 Home.jpg' FROM part_categories WHERE part_key='windows';
INSERT INTO part_items (category_id, name, price, image) SELECT id, 'Windows 11 Pro', 2500000, 'uploads/parts/Windows 11 Pro.jpg' FROM part_categories WHERE part_key='windows';

-- Insert Products (Đã gộp Category và sửa đúng Image Link)
INSERT INTO products (name, slug, image, price, old_price, badge, description, category, preset_json) VALUES
('Mainboard Asus ROG STRIX B550-F GAMING', 'mainboard-asus-rog-strix-b550-f-gaming', 'image/mainboard-asus-rog-strix-b550-f-gaming.jpg', 4999000, 5290000, '-6%', 'Mainboard Asus ROG STRIX B550-F GAMING', 'mainboard', JSON_OBJECT('main', JSON_OBJECT('name', 'Asus ROG STRIX B550-F GAMING', 'price', 4999000, 'qty', 1))),
('Vỏ case Inwin 925 Black - Full Tower', 'vo-case-inwin-925-black-full-tower', 'image/Vỏ case Inwin 925 Black - Full Tower.jpg', 10990000, 11990000, '-9%', 'Vỏ case Inwin 925 Black - Full Tower', 'case', JSON_OBJECT('case', JSON_OBJECT('name', 'Inwin 925 Black Full Tower', 'price', 10990000, 'qty', 1))),
('Mainboard Asus PRIME B550M-K', 'mainboard-asus-prime-b550m-k', 'image/Mainboard Asus PRIME B550M-K.jpg', 1999000, 2599000, '-24%', 'Mainboard Asus PRIME B550M-K', 'mainboard', JSON_OBJECT('main', JSON_OBJECT('name', 'Asus PRIME B550M-K', 'price', 1999000, 'qty', 1))),
('Bộ cấu hình Gaming phổ thông', 'bo-cau-hinh-gaming-pho-thong', 'image/Bộ cấu hình Gaming phổ thông.jpg', 15990000, 20990000, '-24%', 'Bộ cấu hình Gaming phổ thông', 'pc', JSON_OBJECT('cpu', JSON_OBJECT('name', 'AMD Ryzen 5 5600X', 'price', 3900000, 'qty', 1), 'ram', JSON_OBJECT('name', '16GB DDR4', 'price', 1200000, 'qty', 1), 'vga', JSON_OBJECT('name', 'RTX 3060', 'price', 7500000, 'qty', 1))),
('Màn hình VSP IP2512S1 24.5 inch 120Hz', 'man-hinh-vsp-ip2512s1', 'image/VSP IP2512S124.5 inch  FHD  IPS  120Hz  1ms.jpg', 1999000, 2999000, 'HOT', 'Mức giá dễ tiếp cận, phù hợp nhu cầu gaming phổ thông.', 'monitor', NULL),
('Chuột gaming RAZER DeathAdder V2', 'chuot-razer-deathadder-v2', 'image/RAZER DeathAdder V2.jpg', 1499000, 1899000, '-21%', 'Form cầm quen thuộc, cảm biến ổn định.', 'gear', NULL),
('Tản nhiệt JONSBO CR-1000 EVO', 'tan-nhiet-jonsbo-cr-1000', 'image/tan-nhiet-khi-cpu-jonsbo-cr-1000-evo-black-color-rgb.jpg', 389000, 590000, 'SALE', 'Giải pháp tản khí hiệu quả cho cấu hình phổ thông.', 'cooling', NULL);