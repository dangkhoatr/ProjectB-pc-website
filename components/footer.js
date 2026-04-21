function renderFooter(targetId = "footer") {
  const el = document.getElementById(targetId);
  if (!el) return;

  el.innerHTML = `
    <footer class="footer">

    <div class="footer-container">

      <div class="footer-col">
        <h4>Thông tin chung</h4>
        <ul>
          <li>Giới thiệu công ty</li>
          <li>Góp ý, Khiếu nại</li>
          <li>Thông tin tuyển dụng</li>
          <li>Hướng dẫn mua Hàng</li>
          <li>Mua Hàng Trả Góp</li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Quy định & chính sách</h4>
        <ul>
          <li>Chính Sách Bảo Hành</li>
          <li>Chính sách đổi, trả lại hàng</li>
          <li>Chính sách cho doanh nghiệp</li>
          <li>Chính sách vận chuyển</li>
          <li>Bảo mật thông tin khách hàng</li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Cộng đồng EIU Computer</h4>
        <ul>
          <li>Facebook</li>
          <li>Youtube</li>
          <li>Group Gaming</li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Showroom</h4>

        <p>📍 Địa chỉ: EIU University - Bình Dương.</p>
        <a href="https://maps.app.goo.gl/vtXfY7FLzfGSHH6N9" style="color:yellow">[Xem đường đi]</a>
        <p>📞 Hotline: 0123456789</p>
      </div>

    </div>


    <div class="footer-bottom">
      © Chi Nhánh EIU Computer - Công Ty Cổ Phần Tư Vấn Đầu Tư Và Xây Dựng
      <br>
      Địa chỉ: EIU University - Bình Dương
      <br>
      GPKD số 0101383221-001 do Sở KHĐT HCM cấp ngày 1/1/2026
      <br>
      Email: cskh@eiu.vn. Điện thoại: 0123456789
    </div>

  </footer>
  `;
}