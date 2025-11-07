function addheader() {
  var user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  var userHtml = "";

  if (user) {
    userHtml = `
            <a href="#" class="user-info" onclick="checkTaiKhoan(); return false;">
                <i class="ti-user"></i>
                <span>Xin chào, ${user.ten || "bạn"}</span>
            </a>
            <span class="user-separator">|</span>
            <a href="#" class="user-logout" onclick="if(window.confirm('Xác nhận đăng xuất ?')) logOut(); return false;">
                Đăng xuất
            </a>
        `;
  } else {
    userHtml = `
            <a href="#" onclick="checkTaiKhoan(); return false;">
                <i class="ti-user"></i>
                <span>Tài Khoản</span>
            </a>
        `;
  }
  document.write(`
    <div id="header" class="container">
        <a href="index.html" target="_parent" class="logo">
            <img src="assets/images/logowine.png" alt="">
        </a>

        <div id="menu">
            
            <div class="item" id="nav-trang-chu">
                <a href="./index.html">Trang chủ</a>
            </div>

            <div class="item" id="nav-san-pham">
                <a href="./SanPham.html">Sản phẩm </a>
            </div>

            <div class="item" id="nav-gioi-thieu">
                <a href="./index.html#about">Giới Thiệu</a>
            </div>

            <div class="item" id="nav-lien-he">
                <a href="./index.html#footer">Liên hệ</a>
            </div>
        </div>

        <div id="actions">
            
            <div class="user">
                ${userHtml}
            </div>
            
            <div class="cart" id="nav-gio-hang">
                <a href="giohang.html">
                    <i class="ti-shopping-cart"></i>
                </a>
            </div>
        </div>
    </div>
    `);
  if (typeof addContainTaiKhoan === "function") addContainTaiKhoan();
  if (typeof setupEventTaiKhoan === "function") setupEventTaiKhoan();
}
