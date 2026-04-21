function renderHeader(targetId = "header") {
  const el = document.getElementById(targetId);
  if (!el) return;

  el.innerHTML = `
    <header class="site-header">
      <div class="header-top">
        <div class="header-inner">
          <div class="header-logo">
            <a href="Main.html" class="header-logo-text">EIU COMPUTER</a>
          </div>

          <div class="header-center">
            <div class="top-links">
              <div class="showroom-wrap">
                <a href="#" class="showroom-link">📍 Hệ thống showroom</a>

                <div class="showroom-dropdown">
                  <div class="showroom-title">
                    <b>ĐỊA CHỈ:</b> EIU Computer - Bình Dương
                  </div>

                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3915.8127628283733!2d106.66392941133005!3d11.052660453990931!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d1d7df763eaf%3A0xf4323e44f2867057!2zxJDhuqFpIGjhu41jIFF14buRYyB04bq_IE1p4buBbiDEkMO0bmc!5e0!3m2!1svi!2s!4v1773253281765!5m2!1svi!2s"
                    width="400"
                    height="300"
                    style="border:0;"
                    allowfullscreen=""
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade">
                  </iframe>
                </div>
              </div>

              <a href="contact.html" class="pill">🎧 Tư vấn bán hàng</a>
              <a href="#">🧾 Chính sách bảo hành</a>
              <a href="#">💳 Mua trả góp</a>
              <a href="#">📰 Tin tức</a>
            </div>

            <div class="search-bar">
              <select class="search-category" id="globalSearchCategory">
                <option value="">Tất cả danh mục</option>
                <option>Laptop - Máy tính xách tay</option>
                <option>PC Đồ Họa, Workstation</option>
                <option>PC Gaming, Streaming</option>
                <option>Linh Kiện Máy Tính</option>
                <option>Monitor - Màn hình</option>
                <option>Gaming Gear</option>
                <option>Tản Nhiệt - Cooling</option>
                <option>Thiết Bị Mạng</option>
                <option>Phụ Kiện Các Loại</option>
              </select>

              <input
                type="text"
                id="globalSearchInput"
                placeholder="Nhập nội dung tìm kiếm..."
              />
              <button type="button" id="globalSearchBtn">🔍</button>
            </div>
          </div>

          <div class="header-actions">
            <a href="giásốc.html" class="header-action">
              <span class="action-icon">⚡</span>
              <span>Giá sốc</span>
            </a>

            <a href="A.html" class="header-action">
              <span class="action-icon">🧾</span>
              <span>Xây dựng<br>cấu hình</span>
            </a>

            <a href="auth.html" class="header-action" id="headerAccountBtn">
              <span class="action-icon">👤</span>
              <span id="headerAccountName">TÀI KHOẢN</span>
            </a>

            <div class="header-cart" id="sharedHeaderCart">
              <div class="cart-icon">🛒</div>
              <div class="cart-text">
                Giỏ hàng (<span id="sharedCartCount">0</span>)
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="header-bottom">
        <div class="header-inner header-bottom-inner">
          <div class="product-menu-wrap">
            <div class="product-menu">☰ DANH MỤC SẢN PHẨM</div>

            <div class="product-dropdown">
              <a href="#" class="product-item">💻 Laptop - Máy tính xách tay</a>
              <a href="#" class="product-item">🖥 PC Đồ Họa, Workstation</a>
              <a href="#" class="product-item">🎮 PC Gaming, Streaming</a>
              <a href="#" class="product-item">🧩 Linh Kiện Máy Tính</a>
              <a href="#" class="product-item">🖥 Monitor - Màn hình</a>
              <a href="#" class="product-item">🎧 Gaming Gear</a>
              <a href="#" class="product-item">❄️ Tản Nhiệt - Cooling</a>
              <a href="#" class="product-item">📶 Thiết Bị Mạng</a>
              <a href="#" class="product-item">🔌 Phụ Kiện Các Loại</a>
              <a href="#" class="product-item">🏷 Hàng Thanh Lý Giá Rẻ</a>
            </div>
          </div>

          <div class="hotline-box">HOTLINE: 012.345.6789</div>
        </div>
      </div>
    </header>

    <div class="overlay" id="cartOverlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.5); align-items:center; justify-content:center; z-index:100000;">
      <div class="cart-modal" style="background:#fff; width:600px; max-width:90%; padding:15px; max-height:80vh; overflow:auto;">
        <h3 style="margin-top:0">GIỎ HÀNG</h3>

        <div id="cartList"></div>

        <hr>
        <div id="cartTotal" style="font-weight:bold"></div>

        <div style="text-align:right;margin-top:15px">
          <button
            style="background:#9ca3af; color:#fff; border:none; padding:8px 14px; cursor:pointer;"
            onclick="closeCart()"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  `;

  setupSharedHeader();
}

function setupSharedHeader() {
  setupHeaderSearch();
  setupHeaderCart();
  updateSharedCartCount();
  setupHeaderAccount(); // GỌI HÀM XỬ LÝ TÀI KHOẢN Ở ĐÂY
}

// SỬA Ở ĐÂY: Thêm hàm xử lý đổi tên tài khoản
function setupHeaderAccount() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const fullName = localStorage.getItem('userName'); 
  const accountBtn = document.getElementById('headerAccountBtn');
  const accountNameEl = document.getElementById('headerAccountName');

  if (isLoggedIn === 'true' && fullName && accountBtn && accountNameEl) {
    // Tách họ tên thành mảng và lấy chữ cuối cùng
    const nameArray = fullName.trim().split(' ');
    const firstName = nameArray[nameArray.length - 1]; 

    // Đổi chữ và viết hoa chữ cái đầu
    accountNameEl.innerText = firstName;
    accountNameEl.style.textTransform = "capitalize"; 
    
    // Đổi link sang trang quản lý tài khoản
    accountBtn.href = 'account.html';
  }
}

function setupHeaderSearch() {
  const input = document.getElementById("globalSearchInput");
  const button = document.getElementById("globalSearchBtn");
  const category = document.getElementById("globalSearchCategory");

  if (!input || !button) return;

  function performSearch() {
    const keyword = input.value.trim();
    const selectedCategory = category ? category.value : "";

    if (!keyword && !selectedCategory) {
      alert("Vui lòng nhập từ khóa tìm kiếm");
      return;
    }

    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (selectedCategory) params.set("category", selectedCategory);

    window.location.href = `index.html?${params.toString()}`;
  }

  button.addEventListener("click", performSearch);

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      performSearch();
    }
  });
}

function getSharedCartCount() {
  return Number(localStorage.getItem("cart_quantity") || 0);
}

function updateSharedCartCount() {
  const count = getSharedCartCount();

  const el = document.getElementById("sharedCartCount");
  if (el) el.innerText = count;

  const headerCartCount = document.getElementById("headerCartCount");
  if (headerCartCount) headerCartCount.innerText = count;

  const cartCount = document.getElementById("cartCount");
  if (cartCount) cartCount.innerText = count;
}

function setupHeaderCart() {
  const cartEl = document.getElementById("sharedHeaderCart");
  if (!cartEl) return;

  cartEl.addEventListener("click", function () {
    openCart();
  });
}

function getCartParts() {
  return [
    { key: "cpu", label: "Bộ vi xử lý" },
    { key: "main", label: "Bo mạch chủ" },
    { key: "ram", label: "RAM" },
    { key: "ssd", label: "SSD" },
    { key: "hdd", label: "HDD" },
    { key: "vga", label: "VGA" },
    { key: "psu", label: "Nguồn" },
    { key: "case", label: "Vỏ case" },
    { key: "monitor", label: "Màn hình" },
    { key: "keyboard", label: "Bàn phím" },
    { key: "mouse", label: "Chuột" },
    { key: "headset", label: "Tai nghe" },
    { key: "fan", label: "Fan case" },
    { key: "aircool", label: "Tản nhiệt khí" },
    { key: "aio", label: "Tản nhiệt nước AIO" },
    { key: "custom", label: "Tản nhiệt nước Custom" },
    { key: "windows", label: "Windows bản quyền" }
  ];
}

function getBuildFromStorage() {
  try {
    return JSON.parse(localStorage.getItem("pc_build")) || {};
  } catch {
    return {};
  }
}

function recalcCartQuantityFromStorage() {
  const build = getBuildFromStorage();
  let totalQty = 0;

  for (const key in build) {
    totalQty += Number(build[key].qty || 1);
  }

  localStorage.setItem("cart_quantity", totalQty);
  updateSharedCartCount();
  return totalQty;
}

function openCart(showEmptyMessage = true) {
  const build = getBuildFromStorage();
  const PARTS = getCartParts();

  let html = "";
  let total = 0;

  const selectedItems = Object.keys(build).map(key => {
    const partInfo = PARTS.find(p => p.key === key);
    return {
      key,
      label: partInfo ? partInfo.label : key,
      ...build[key]
    };
  });

  if (selectedItems.length === 0) {
    html = showEmptyMessage ? "<i>Giỏ hàng trống</i>" : "";
  } else {
    selectedItems.forEach(item => {
      const qty = Number(item.qty || 1);
      const lineTotal = Number(item.price || 0) * qty;
      total += lineTotal;

      html += `
        <div style="display:flex; align-items:flex-start; padding:12px 0; border-bottom:1px solid #ddd; gap:12px;">
          <div style="flex:1; min-width:0;">
            <div style="font-weight:700;">${item.label}</div>
            <div>${item.name || ""} x${qty}</div>
          </div>

          <div style="display:flex; align-items:center; justify-content:flex-end; gap:8px; margin-left:auto;">
            <div style="font-weight:700; color:#007bff; min-width:120px; text-align:right;">
              ${lineTotal.toLocaleString("vi-VN")} đ
            </div>

            <button
              onclick="removeSelectedPartFromCart('${item.key}')"
              style="background:#dc2626; color:#fff; border:none; width:34px; height:34px; padding:0; cursor:pointer; font-weight:700;"
              title="Xóa linh kiện"
            >
              ✕
            </button>
          </div>
        </div>
      `;
    });
  }

  const cartList = document.getElementById("cartList");
  const cartTotal = document.getElementById("cartTotal");
  const cartOverlay = document.getElementById("cartOverlay");

  if (cartList) cartList.innerHTML = html;
  if (cartTotal) {
    cartTotal.innerHTML =
      selectedItems.length > 0
        ? "TỔNG TIỀN: " + total.toLocaleString("vi-VN") + " đ"
        : "";
  }
  if (cartOverlay) cartOverlay.style.display = "flex";
}

function closeCart() {
  const cartOverlay = document.getElementById("cartOverlay");
  if (cartOverlay) cartOverlay.style.display = "none";
}

function removeSelectedPartFromCart(key) {
  const build = getBuildFromStorage();
  if (!build[key]) return;

  delete build[key];
  localStorage.setItem("pc_build", JSON.stringify(build));

  recalcCartQuantityFromStorage();
  openCart();
}

window.renderHeader = renderHeader;
window.updateSharedCartCount = updateSharedCartCount;
window.openCart = openCart;
window.closeCart = closeCart;
window.recalcCartQuantityFromStorage = recalcCartQuantityFromStorage;