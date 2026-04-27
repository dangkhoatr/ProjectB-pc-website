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
    const cartQty = localStorage.getItem("cart_quantity") || 0;

    // ==========================================
    // 3. RENDER GIAO DIỆN HEADER MỚI
    // ==========================================
    headerEl.innerHTML = `
        <style>
            .top-menu-item { color: #ccc; text-decoration: none; font-size: 13px; display: flex; align-items: center; gap: 6px; }
            .top-menu-item:hover { color: #fff; }
            .search-box { display: flex; flex: 1; max-width: 500px; background: #fff; border-radius: 4px; overflow: hidden; margin: 0 20px; }
            .search-box input { flex: 1; border: none; padding: 10px 15px; outline: none; }
            .search-box button { background: none; border: none; padding: 0 15px; cursor: pointer; color: #666; }
            .header-mid-link { display: flex; align-items: center; gap: 8px; color: #fff; text-decoration: none; font-weight: 600; margin: 0 15px; }
        </style>

        <div style="background: #000; padding: 6px 0;">
            <div style="max-width: 1400px; margin: 0 auto; padding: 0 15px; display: flex; justify-content: flex-end; gap: 20px;">
                <a href="#" class="top-menu-item"><i class="fa-solid fa-location-dot" style="color:#ef4444;"></i> Hệ thống showroom</a>
                <a href="#" class="top-menu-item" style="color:#fbbf24;"><i class="fa-solid fa-headset"></i> Tư vấn bán hàng</a>
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
                    <input type="text" placeholder="Tất cả danh mục | Nhập nội dung tìm kiếm...">
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
            <div style="max-width: 1400px; margin: 0 auto; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center;">
                <div style="color: #ef4444; font-weight: 700; font-size: 15px; cursor: pointer;">
                    <i class="fa-solid fa-bars" style="margin-right: 6px;"></i> DANH MỤC SẢN PHẨM
                </div>
                <div style="background: #ef4444; color: #fff; font-weight: 800; padding: 8px 30px; font-size: 15px; clip-path: polygon(15px 0%, 100% 0%, 100% 100%, 0% 100%);">
                    HOTLINE: 012.345.6789
                </div>
            </div>
        </div>
    `;
}