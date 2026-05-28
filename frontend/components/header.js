function renderHeader(elementId) {
    const headerEl = document.getElementById(elementId);
    if (!headerEl) return;

    // ==========================================
    // 1. KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP
    // ==========================================
    let user = null;
    try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            user = JSON.parse(userStr);
        }
    } catch (e) {
        console.error("Lỗi đọc thông tin user từ localStorage", e);
    }

    // ==========================================
    // 2. XỬ LÝ KHỐI HIỂN THỊ TÊN / ĐĂNG NHẬP
    // ==========================================
    let userHtml = '';

    // Tự động nhận diện dù backend trả về name hay full_name
    const displayName = user ? (user.name || user.full_name) : null;

    if (displayName) {
        // ĐÃ ĐĂNG NHẬP: Bấm vào thì nhảy sang trang Quản trị (Admin) hoặc Hồ sơ (Customer)
        const profileLink = user.role === 'admin' ? 'admin.html' : 'account.html';

        userHtml = `
            <a href="${profileLink}" style="display:flex; align-items:center; gap:8px; color:#fff; text-decoration:none; margin: 0 15px;">
                <div style="width:32px; height:32px; border-radius:50%; background:#fff; color:#000; display:flex; align-items:center; justify-content:center;">
                    <i class="fa-solid fa-user"></i>
                </div>
                <span style="font-weight:600;">${displayName}</span>
            </a>
        `;
    } else {
        // CHƯA ĐĂNG NHẬP: Bấm vào thì bay sang trang Đăng nhập
        userHtml = `
            <a href="auth.html" style="display:flex; align-items:center; gap:8px; color:#fff; text-decoration:none; margin: 0 15px;">
                <div style="width:32px; height:32px; border-radius:50%; background:#fff; color:#000; display:flex; align-items:center; justify-content:center;">
                    <i class="fa-solid fa-user"></i>
                </div>
                <span style="font-weight:600;">Đăng nhập / Đăng ký</span>
            </a>
        `;
    }

    // Lấy số lượng giỏ hàng hiện tại (hiện số 0 nếu chưa có gì)
    const cartQty = getCartQuantity();

    // ==========================================
    // 3. RENDER GIAO DIỆN HEADER MỚI
    // ==========================================
    headerEl.innerHTML = `
        <style>
        .top-menu-item{
        color:#ccc;
        text-decoration:none;
        font-size:13px;
        display:flex;
        align-items:center;
        gap:6px;
        }

        .top-menu-item:hover{
        color:#fff;
        }

        .search-box{
        display:flex;
        flex:1;
        max-width:500px;
        background:#fff;
        border-radius:4px;
        overflow:hidden;
        margin:0 20px;
        }

        .search-box input{
        flex:1;
        border:none;
        padding:10px 15px;
        outline:none;
        }

        .search-box button{
        background:none;
        border:none;
        padding:0 15px;
        cursor:pointer;
        }

        .header-mid-link{
        display:flex;
        align-items:center;
        gap:8px;
        color:#fff;
        text-decoration:none;
        font-weight:600;
        margin:0 15px;
        }

        /* showroom */

        .showroom-container{
        position:relative;
        }

        .map-box{

        display:none;

        position:absolute;

        top:35px;

        right:0;

        width:550px;

        background:#fff;

        z-index:99999;

        box-shadow:
        0 8px 25px rgba(0,0,0,.25);

        }

        .showroom-container:hover .map-box{

        display:block;

        }

        .address{

        padding:15px;

        font-weight:700;

        border-bottom:
        1px solid #eee;
        }

        iframe{

        width:100%;

        height:320px;

        border:0;

        }


        /* mega menu */

        .category-wrapper{

        position:relative;

        display:inline-block;
        }

        .category-title{

        color:#ef4444;

        font-weight:700;

        cursor:pointer;

        font-size:15px;
        }

        .mega-menu{

        position:absolute;

        display:flex;

        width:1000px;

        height:420px;

        top:40px;

        left:0;

        background:#fff;

        box-shadow:
        0 10px 30px rgba(0,0,0,.15);

        opacity:0;

        visibility:hidden;

        transition:.3s;

        z-index:9999;
        }

        .category-wrapper:hover .mega-menu{

        opacity:1;

        visibility:visible;
        }

        .left-menu{

        width:260px;

        border-right:
        1px solid #eee;
        }

        .menu-item{

        padding:16px;

        cursor:pointer;

        border-bottom:
        1px solid #f3f4f6;
        }

        .menu-item:hover{

        background:#f8f8f8;

        color:red;
        }

        .right-menu{

        padding:20px;

        flex:1;
        }

        .content{

        display:none;

        gap:80px;
        }

        .content.active{

        display:flex;
        }

        .col{

        display:flex;

        flex-direction:column;
        }

        .col h4{

        color:#ef4444;
        }

        .col a{

        margin:8px 0;

        cursor:pointer;

        text-decoration:none;

        color:#333;
        }

        .col a:hover{

        color:red;
        }
</style>

        <div style="background: #000; padding: 6px 0;">
            <div style="max-width: 1400px; margin: 0 auto; padding: 0 15px; display: flex; justify-content: flex-end; gap: 20px;">
                <div class="showroom-container">
                    <a href="#" class="top-menu-item">
                        <i class="fa-solid fa-location-dot" style="color:#ef4444;"></i>
                        Hệ thống showroom
                    </a>

                    <div class="map-box">

                        <div class="address">
                            <b>ĐỊA CHỈ:</b>
                            EIU Computer - 
                            Nam Kỳ Khởi Nghĩa - HCM
                        </div>

                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4869.272468079415!2d106.66650969999999!3d11.0526552!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d1d7df763eaf%3A0xf4323e44f2867057!2sEastern%20International%20University!5e1!3m2!1sen!2s!4v1779166113687!5m2!1sen!2s" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>

                    </div>
                </div>
                <a href="contact.html" class="top-menu-item" style="color:#fbbf24;"><i class="fa-solid fa-headset"></i> Tư vấn bán hàng</a>
                <a href="#" class="top-menu-item"><i class="fa-solid fa-file-contract"></i> Chính sách bảo hành</a>
                <a href="#" class="top-menu-item"><i class="fa-solid fa-credit-card"></i> Mua trả góp</a>
                <a href="#" class="top-menu-item"><i class="fa-solid fa-newspaper"></i> Tin tức</a>
            </div>
        </div>

        <div style="background: #111827; padding: 15px 0;">
            <div style="max-width: 1400px; margin: 0 auto; padding: 0 15px; display: flex; align-items: center; justify-content: space-between;">
                
                <a href="index.html" style="font-size: 28px; font-weight: 900; color: #fff; text-decoration: none; letter-spacing: 1px;">
                    EIU COMPUTER
                </a>

                <div class="search-box">
                    <input type="text" placeholder=" Nhập nội dung tìm kiếm...">
                    <button><i class="fa-solid fa-magnifying-glass" style="color:#2b90ef; font-size:18px;"></i></button>
                </div>

                <div style="display: flex; align-items: center;">
                    <a href="sale.html" class="header-mid-link">
                        <div style="width:32px; height:32px; border-radius:50%; background:#fff; color:#ef4444; display:flex; align-items:center; justify-content:center;">
                            <i class="fa-solid fa-bolt"></i>
                        </div>
                        Giá sốc
                    </a>

                    <a href="build-pc.html" class="header-mid-link">
                        <div style="width:32px; height:32px; border-radius:50%; background:#fff; color:#6b7280; display:flex; align-items:center; justify-content:center;">
                            <i class="fa-solid fa-desktop"></i>
                        </div>
                        <div style="line-height: 1.2;">Xây dựng<br>cấu hình</div>
                    </a>

                    ${userHtml}

                    <a href="cart.html" style="display:flex; align-items:center; gap:8px; color:#fff; text-decoration:none; border: 1px solid rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 6px; margin-left:10px;">
                        <i class="fa-solid fa-cart-shopping"></i>
                        <span style="font-weight:600;">Giỏ hàng (<span id="headerCartCount">${cartQty}</span>)</span>
                    </a>
                </div>
            </div>
        </div>

        <div style="background: #fff; border-bottom: 1px solid #e5e7eb;">
            <div style="background:#fff;border-bottom:1px solid #e5e7eb;">

                <div style="
                max-width:1400px;
                margin:0 auto;
                padding:12px 15px;

                display:flex;
                align-items:center;

                position:relative;
                ">

                    <!-- DANH MỤC -->

                    <div class="category-wrapper">

                        <div class="category-title">

                            <i class="fa-solid fa-bars"
                            style="margin-right:6px;"></i>

                            DANH MỤC SẢN PHẨM

                        </div>


                        <div class="mega-menu">

                            <!-- MENU TRÁI -->

                            <div class="left-menu">

                                <div class="menu-item"
                                data-target="laptop">

                                    Laptop - Máy tính xách tay

                                </div>


                                <div class="menu-item"
                                data-target="pc">

                                    PC Gaming

                                </div>


                                <div class="menu-item"
                                data-target="linhkien">

                                    Linh kiện máy tính

                                </div>


                                <div class="menu-item"
                                data-target="gear">

                                    Gaming Gear

                                </div>

                            </div>


                            <!-- MENU PHẢI -->

                            <div class="right-menu">

                                <!-- Laptop -->

                                <div
                                id="laptop"
                                class="content active">

                                    <div class="col">

                                        <h4>
                                        Laptop theo hãng
                                        </h4>

                                        <a>Acer</a>
                                        <a>Asus</a>
                                        <a>MSI</a>
                                        <a>Dell</a>

                                    </div>


                                    <div class="col">

                                        <h4>
                                        Laptop theo nhu cầu
                                        </h4>

                                        <a>Gaming</a>
                                        <a>Văn phòng</a>
                                        <a>Đồ họa</a>

                                    </div>

                                </div>



                                <!-- PC -->

                                <div
                                id="pc"
                                class="content">

                                    <div class="col">

                                        <h4>
                                        PC THEO CPU
                                        </h4>

                                        <a>Core i5</a>
                                        <a>Core i7</a>
                                        <a>Ryzen 5</a>

                                    </div>
                                    <div class="col">

                                        <h4>
                                        PC OFFICE
                                        </h4>

                                        <a>Cấu hình core i7</a>
                                        <a>Cấu hình core i5</a>
                                        <a>Cấu hình core i3</a>
                                        <a>Cấu hình Ryzen 5</a>
                                        <a>Cấu hình Ryzen 3</a>

                                    </div>
                                    <div class="col">

                                        <h4>
                                        MINI PC
                                        </h4>

                                        <a>Mini PC Intel</a>
                                        <a>Mini PC Asus i5</a>
                                        <a>Mini PC Gigabyte</a>
                                        <a>Mini PC MSI</a>
                                        <a>Mini PC Acer</a>

                                    </div>

                                </div>



                                <!-- Gaming -->

                                <div
                                id="gear"
                                class="content">

                                    <div class="col">

                                        <h4>
                                        Gaming Gear
                                        </h4>

                                        <a>Chuột</a>
                                        <a>Bàn phím</a>
                                        <a>Tai nghe</a>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>



                    <!-- HOTLINE -->

                    <div style="
                    margin-left:auto;

                    background:#ef4444;

                    color:#fff;

                    font-weight:800;

                    padding:8px 30px;

                    font-size:15px;

                    clip-path:
                    polygon(
                    15px 0%,
                    100% 0%,
                    100% 100%,
                    0% 100%
                    );
                    ">

                        HOTLINE:
                        012.345.6789

                    </div>

                </div>

                </div>
            </div>
        </div>
    `;

}
function getCartQuantity() {

    let buildCart =
        JSON.parse(
            localStorage.getItem(
                "pc_build"
            )
        ) || {};

    let regularCart =
        JSON.parse(
            localStorage.getItem(
                "cart"
            )
        ) || [];

    return (
        Object.keys(buildCart)
            .length
        +
        regularCart.length
    );

}


function updateCartCount() {

    const cartEl =
        document.getElementById(
            "headerCartCount"
        );

    if (cartEl) {

        cartEl.innerText =
            getCartQuantity();

    }

}



document.addEventListener(
    "mouseover",

    () => {

        const items =
            document.querySelectorAll(
                ".menu-item"
            );

        items.forEach(item => {

            item.addEventListener(
                "mouseenter",

                () => {

                    document
                        .querySelectorAll(
                            ".content"
                        )

                        .forEach(c =>
                            c.classList.remove(
                                "active"
                            ));

                    document
                        .getElementById(
                            item.dataset.target
                        )
                        .classList.add(
                            "active"
                        );

                });

        });

    });