CREATE DATABASE SaleManagement_lab3;
USE Salemanagement_lab3;

	CREATE TABLE clients (
    Client_Number VARCHAR(10),
    Client_Name VARCHAR(25) NOT NULL,
    Address VARCHAR(30),
    City VARCHAR(30),
    Pincode INT NOT NULL,
    Province CHAR(25),
    Amount_Paid DECIMAL(15 , 4 ),
    Amount_Due DECIMAL(15 , 4 ),
    CHECK (Client_Number LIKE 'C%'),
    PRIMARY KEY (Client_Number)
);
CREATE TABLE product (
    Product_Number VARCHAR(15),
    Product_Name VARCHAR(25) NOT NULL UNIQUE,
    Quantity_On_Hand INT NOT NULL,
    Quantity_Sell INT NOT NULL,
    Sell_Price DECIMAL(15 , 4 ) NOT NULL,
    Cost_Price DECIMAL(15 , 4 ) NOT NULL,
    CHECK (Product_Number LIKE 'P%'),
    CHECK (Cost_Price <> 0),
    PRIMARY KEY (Product_Number)
);
create table Salesman(
    Salesman_Number varchar(15),
    Salesman_Name varchar(25) not null,
    Address varchar(30),
    City varchar(30),
    Pincode int not null,
    Province char(25) default('Viet Nam'),
    Salary decimal(15,4) not null,
    Sales_Target int not null,
    Target_Achieved int,
    Phone char(10) not null unique,
    check(Salesman_Number like 'S%'),
    check(Salary>0),
    check(Sales_Target>0),
    primary key(Salesman_Number)
);
CREATE TABLE SalesOrder (
    Order_Number VARCHAR(15),
    Order_Date DATE,
    Client_Number VARCHAR(15),
    Salesman_Number VARCHAR(15),
    Delivery_Status CHAR(15),
    Delivery_Date DATE,
    Order_Status VARCHAR(15),
    PRIMARY KEY (Order_Number),
    FOREIGN KEY (Client_Number)
        REFERENCES clients (Client_Number),
    FOREIGN KEY (Salesman_Number)
        REFERENCES salesman (Salesman_Number),
    CHECK (Order_Number LIKE 'O%'),
    CHECK (Client_Number LIKE 'C%'),
    CHECK (Salesman_Number LIKE 'S%'),
    CHECK (Delivery_Status IN ('Delivered' , 'On Way', 'Ready to Ship')),
    CHECK (Delivery_Date > Order_Date),
    CHECK (Order_Status IN ('In Process' , 'Successful', 'Cancelled'))
);
CREATE TABLE SalesOrderDetails (
    Order_Number VARCHAR(15),
    Product_Number VARCHAR(15),
    Order_Quantity INT,
    CHECK (order_number LIKE 'O%'),
    CHECK (Product_Number LIKE 'P%'),
    PRIMARY KEY (Order_Number , Product_Number),
    FOREIGN KEY (Order_Number)
        REFERENCES salesorder (Order_Number),
    FOREIGN KEY (Product_Number)
        REFERENCES product (Product_Number)
);
drop TABLE SalesOrderDetails;
show TABLE status;
-- thêm dữ liệu vào bảng clients
INSERT INTO clients
VALUES
('C101','Mai Xuan','Phu Hoa','Dai An',700001,'Binh Duong',10000,5000),
('C102','Le Xuan','Phu Hoa','Thu Dau Mot',700051,'Binh Duong',18000,3000),
('C103','Trinh Huu','Phu Loi','Da Lat',700051,'Lam Dong ',7000,3200),
('C104','Tran Tuan','Phu Tan','Thu Dau Mot',700080,'Binh Duong',8000,0),
('C105','Ho Nhu','Chanh My','Hanoi',700005,'Hanoi',7000,150),
('C106','Tran Hai','Phu Hoa','Ho Chi Minh',700002,'Ho Chi Minh',7000,1300),
('C107','Nguyen Thanh ','Hoa Phu','Dai An',700023,'Binh Duong',8500,7500),
('C108','Nguyen Sy','Tan An','Da Lat',700032,'Lam Dong ',15000,1000),
('C109','Duong Thanh','Phu Hoa','Ho Chi Minh',700011,'Ho Chi Minh',12000,8000),
('C110','Tran Minh','Phu My','Hanoi',700005,'Hanoi',9000,1000);

-- kiểm tra 
SELECT * FROM clients;

-- thêm dữ liệu vào bảng product
INSERT INTO product
VALUES ('P1001','TV',10,30,1000,800),
	('P1002','Laptop',12,25,1500,1100),
	('P1003','AC',23,10,400,300),
	('P1004','Modem',22,16,250,230),
	('P1005','Pen',19,13,12,8),
	('P1006','Mouse',5,10,100,105),
	('P1007','Keyboard',45,60,120,90),
	('P1008','Headset',63,75,50,40);
    
INSERT INTO salesman 
VALUES ('S001','Huu','Phu Tan','Ho Chi Minh',700002,'Ho Chi Minh',15000,50,35,'0902361123'),
	('S002','Phat','Tan An','Hanoi',700005,'Hanoi',25000,100,110,'0903216542'),
	('S003','Khoa','Phu Hoa','Thu Dau Mot',700051,'Binh Duong',17500,40,30,'0904589632'),
	('S004','Tien','Phu Hoa','Dai An',700023,'Binh Duong',16500,70,72,'0908654723'),
	('S005','Deb','Hoa Phu','Thu Dau Mot',700051,'Binh Duong',13500,60,48,'0903213659'),
	('S006','Tin','Chanh My','Da Lat',700032,'Lam Dong',20000,80,55,'0907853497');
    
INSERT INTO salesorder
VALUES ('O20001','2022-01-15','C101','S003','Delivered','2022-02-10','Successful'),
('O20002','2022-01-25','C102','S003','Delivered','2022-02-15','Cancelled'),
('O20003','2022-01-31','C103','S002','Delivered','2022-04-03','Successful'),
('O20004','2022-02-10','C104','S003','Delivered','2022-04-23','Successful'),
('O20005','2022-02-18','C101','S003','On Way',null,'Cancelled'),
('O20006','2022-02-22','C105','S005','Ready to Ship',null,'In Process'),
('O20007','2022-04-03','C106','S001','Delivered','2022-05-08','Successful'),
('O20008','2022-04-16','C102','S006','Ready to Ship',null,'In Process'),
('O20009','2022-04-24','C101','S004','On Way',null,'Successful'),
('O20010','2022-04-29','C106','S006','Delivered','2022-05-08','Successful'),
('O20011','2022-05-08','C107','S005','Ready to Ship',null,'Cancelled'),
('O20012','2022-05-12','C108','S004','On Way',null,'Successful'),
('O20013','2022-05-16','C109','S001','Ready to Ship',null,'In Process'),
('O20014','2022-05-16','C110','S001','On Way',null,'Successful');

INSERT INTO salesorderdetails
VALUES ('O20001','P1001',5),
('O20001','P1002',4),
('O20002','P1007',10),
('O20003','P1003',12),
('O20004','P1004',3),
('O20005','P1001',8),
('O20005','P1008',15),
('O20005','P1002',14),
('O20006','P1002',5),
('O20007','P1005',6),
('O20008','P1004',8),
('O20009','P1008',2),
('O20010','P1006',11),
('O20010','P1001',9),
('O20011','P1007',6),
('O20012','P1005',3),
('O20012','P1001',2),
('O20013','P1006',10),
('O20014','P1002',20);
-- hiện cấu trúc bảng(Schema)
DESC Clients;
DESC Product;
DESC Salesman;
DESC Salesorder;
DESC Salesorderdetails;
-- hiện nội dung bảng
SELECT * FROM Clients;
SELECT * FROM Product;
SELECT * FROM Salesman;
SELECT * FROM Salesorder;
SELECT * FROM Salesorderdetails;

-- test
SELECT sha2('123456', 224);

-- update
SELECT * FROM clients;

-- cập nhật province là HCM cho tất cả khách hàng có province là BÌnh Dương
UPDATE clients
set province = ' HO CHI MINH City', city = 'TDM'
where province = 'Binh Duong'; 

 -- cập nhật city thành phố HO CHI MINH cho các khách hàng ko có address có chứa chữ 'Phu'
 UPDATE clients
 set city = 'Ho Chi Minh'
 WHERE address = 'Phu';
 SET SQL_SAFE_UPDATES = 0;
 CREATE TABLE ProductCost AS
SELECT Product_Name, Cost_Price
FROM Product;
SELECT Product_Name, Sell_Price, Cost_Price,
       ((Sell_Price - Cost_Price) / Cost_Price) * 100 AS Profit_Percentage
FROM Product;
SELECT Salesman_Name, Sales_Target, Target_Achieved,
    CASE
        WHEN (Target_Achieved / Sales_Target) >= 0.75 THEN 'Good'
        WHEN (Target_Achieved / Sales_Target) >= 0.50 THEN 'Average'
        ELSE 'Poor'
    END AS Remarks
FROM Salesman;
SELECT Product_Name, (Quantity_On_Hand + Quantity_Sell) AS Total_Quantity
FROM Product;
-- Thêm cột
ALTER TABLE Product ADD Total_Quantity INT;

-- Cập nhật giá trị cho cột mới
SET SQL_SAFE_UPDATES = 0;
UPDATE Product
SET Total_Quantity = Quantity_On_Hand + Quantity_Sell;
SET SQL_SAFE_UPDATES = 1;
-- Thêm cột Discount_Rate nếu chưa tồn tại
ALTER TABLE Product ADD Discount_Rate INT;

-- Cập nhật theo điều kiện
SET SQL_SAFE_UPDATES = 0;
UPDATE Product
SET Discount_Rate = CASE
    WHEN Quantity_On_Hand > 10 THEN 10
    ELSE 5
END;
SET SQL_SAFE_UPDATES = 1;
SET SQL_SAFE_UPDATES = 0;
UPDATE Product
SET Discount_Rate = CASE
    WHEN Quantity_On_Hand >= 20 THEN 10
    WHEN Quantity_On_Hand >= 10 THEN 5
    WHEN Quantity_On_Hand > 5 THEN 3
    ELSE 0
END;
SET SQL_SAFE_UPDATES = 1;
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE product_attribute_values;
TRUNCATE TABLE products;
TRUNCATE TABLE part_items;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. BƠM DANH MỤC CÒN THIẾU VÀO BẢNG CATEGORIES (Cho Admin)
INSERT IGNORE INTO categories (id, name) VALUES 
('keyboard', 'Bàn phím'), 
('mouse', 'Chuột'), 
('fan', 'Quạt tản nhiệt');

-- 3. BƠM SẢN PHẨM TRANG CHỦ / ADMIN / SALE (Lấy đúng tên ảnh trong máy)
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

-- 4. GẮN THUỘC TÍNH (EAV) ĐỂ LỌC TRONG ADMIN
INSERT INTO product_attribute_values (product_id, attribute_id, value) VALUES
(1, 'brand', 'Intel'), (1, 'socket', 'LGA 1700'), (1, 'cores', '6'),
(3, 'brand', 'Corsair'), (3, 'capacity', '32'),
(5, 'brand', 'LG'), (5, 'size', '27'), (5, 'refresh_rate', '144');

-- 5. BƠM DỮ LIỆU BUILD PC (Bảng part_items - Dùng ảnh uploads/parts/ thật)
-- Đảm bảo category_id khớp với part_categories (1:cpu, 2:main, 3:ram, 4:ssd, 5:hdd, 6:vga, 7:psu)
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
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE part_items;
TRUNCATE TABLE part_categories;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. BƠM ĐỦ 17 DANH MỤC VÀO BẢNG CHỨA (Ép cứng ID từ 1 đến 17)
INSERT INTO part_categories (id, part_key, label) VALUES 
(1, 'cpu', 'Bộ vi xử lý'),
(2, 'main', 'Bo mạch chủ'),
(3, 'ram', 'RAM'),
(4, 'ssd', 'SSD'),
(5, 'hdd', 'HDD'),
(6, 'vga', 'VGA'),
(7, 'psu', 'Nguồn'),
(8, 'case', 'Vỏ case'),
(9, 'monitor', 'Màn hình'),
(10, 'keyboard', 'Bàn phím'),
(11, 'mouse', 'Chuột'),
(12, 'headset', 'Tai nghe'),
(13, 'fan', 'Fan case'),
(14, 'aircool', 'Tản nhiệt khí'),
(15, 'aio', 'Tản nhiệt nước AIO'),
(16, 'custom', 'Tản nhiệt nước Custom'),
(17, 'windows', 'Windows bản quyền');

-- 3. BƠM LINH KIỆN CON (Bây giờ thì thoải mái nhận cha nhận mẹ không bao giờ lỗi)
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