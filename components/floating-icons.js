function renderFloatingIcons(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;

  el.innerHTML = `
    <div class="floating-icons">

      <a href="https://www.facebook.com/eiuvietnam/?locale=vi_VN" target="_blank" class="icon fb">
        <i class="fab fa-facebook-f"></i>
      </a>

      <a href="https://www.youtube.com/c/EIUChannel" target="_blank" class="icon yt">
        <i class="fab fa-youtube"></i>
      </a>

      <a href="https://www.tiktok.com/@eiu_vietnam" class="icon tiktok">
        <i class="fab fa-tiktok"></i>
      </a>

      <a href="tel:0123456789" class="icon phone">
        <i class="fas fa-phone"></i>
      </a>

      <a href="https://www.messenger.com/" class="icon chat">
        <i class="fas fa-comment-dots"></i>
      </a>

      <button onclick="scrollToTop()" class="icon top">
        <i class="fas fa-angle-up"></i>
      </button>

    </div>
  `;
}
