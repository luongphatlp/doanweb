(function () {
  const format = (n) => (Number(n) || 0).toLocaleString("vi-VN") + "đ";
  const cur = () => (typeof getCurrentUser === "function" ? getCurrentUser() : null);

  // save: lưu CurrentUser và đồng bộ vào ListUser một cách an toàn
  const save = (u) => {
    if (typeof setCurrentUser === "function") setCurrentUser(u);
    safeUpdateListUser(u);
  };

  function getalcoholList() {
    try {
      return JSON.parse(window.localStorage.getItem("alcoholList")) || [];
    } catch (e) {
      return [];
    }
  }

  // Helper: cập nhật ListUser một cách an toàn, merge donhang và giữ status cũ nếu có
  function safeUpdateListUser(curUser) {
    if (!curUser || !curUser.username) return;

    // Nếu đã có updateListUser đúng cách thì ưu tiên dùng nó
    if (typeof updateListUser === "function") {
      try {
        updateListUser(curUser, curUser);
        return;
      } catch (e) {
        // nếu lỗi thì tiếp tục fallback
        console.warn("updateListUser failed, fallback to safeUpdateListUser", e);
      }
    }

    if (typeof getListUser !== "function" || typeof setListUser !== "function") return;
    const list = getListUser() || [];

    for (let i = 0; i < list.length; i++) {
      if (list[i].username === curUser.username) {
        // products: thay thế nếu cur cung cấp, giữ lại nếu không
        list[i].products =
          curUser.products && curUser.products.length ? curUser.products : list[i].products || [];

        // donhang: merge theo id (nếu có) hoặc theo JSON key
        const oldOrders = Array.isArray(list[i].donhang) ? list[i].donhang : [];
        const newOrders = Array.isArray(curUser.donhang) ? curUser.donhang : [];

        const map = new Map();
        const keyOf = (o) => (o && (o.id || o._key)) || JSON.stringify(o || {});

        // seed existing orders (giữ nguyên object cũ để preserve status)
        oldOrders.forEach((o) => {
          const k = keyOf(o);
          map.set(k, Object.assign({}, o));
        });

        // merge/insert new orders (preserve existing.status nếu new.status missing)
        newOrders.forEach((o) => {
          const k = keyOf(o);
          if (map.has(k)) {
            const ex = map.get(k);
            ex.products = o.products || ex.products || [];
            ex.total = o.total !== undefined ? o.total : ex.total;
            ex.payment = o.payment || ex.payment;
            ex.receiver = o.receiver || ex.receiver;
            ex.createdAt = o.createdAt || ex.createdAt;
            // Preserve status if new one is missing/undefined/null
            ex.status = o.status !== undefined && o.status !== null ? o.status : ex.status;
            map.set(k, ex);
          } else {
            const copy = Object.assign({}, o);
            if (!copy.status) copy.status = "Đang xử lý";
            map.set(k, copy);
          }
        });

        list[i].donhang = Array.from(map.values());
        break;
      }
    }

    try {
      setListUser(list);
    } catch (e) {
      console.warn("safeUpdateListUser: setListUser failed", e);
    }
  }

  var alcoholList = [];

  window.onload = function () {
    alcoholList = getalcoholList() || window.alcoholList || [];
    if(alcoholList.length==0){
      alcoholList=window.alcoholList || [];
    }
    addtable("All");
  };

  function addtable(newvalue) {
    var HTML =
      `<div class="search">
        <input class="khungtimkiem" type="text" placeholder="Tìm kiếm..." onkeyup="timKiemSanPham(this, '` +
      newvalue +
      `')">
      </div>`;
    HTML += '<div id="product-list-wrapper"></div>';
    HTML += '<div id="pagination-wrapper"></div>';
    var nodeProducts = document.getElementById("list-products");
    if (nodeProducts) nodeProducts.innerHTML = HTML;

    updateProductListAndPaginate();

    var btns = document.getElementsByClassName("button-value");
    for (var i = 0; i < btns.length; i++) {
      btns[i].style.background = "#fff";
      btns[i].style.color = "#6759ff";
    }
    if (value == "All") {
      if (btns[0]) {
        btns[0].style.background = "#6759ff";
        btns[0].style.color = "#fff";
      }
    } else if (value == "Rum") {
      if (btns[1]) {
        btns[1].style.background = "#6759ff";
        btns[1].style.color = "#fff";
      }
    } else if (value == "Whisky") {
      if (btns[2]) {
        btns[2].style.background = "#6759ff";
        btns[2].style.color = "#fff";
      }
    } else if (value == "Vodka") {
      if (btns[3]) {
        btns[3].style.background = "#6759ff";
        btns[3].style.color = "#fff";
      }
    }
  }

  function CreateProduct(
    masp,
    tensp,
    thuonghieu,
    hinh,
    gia,
    sosao,
    nongdo,
    dungtich
  ) {
    var product = new Object();
    product.masp = masp;
    product.tensp = tensp;
    product.thuonghieu = thuonghieu;
    product.hinh = hinh;
    product.gia = gia;
    product.sosao = sosao;
    product.nongdo = nongdo;
    product.dungtich = dungtich;

    product.toJson = function () {
      var json = JSON.stringify(this);
      return json;
    };

    product.fromJSON = function (json) {
      var doiTuong = JSON.parse(json);
      var doiTuongDayDu = CreateProduct(
        doiTuong.masp,
        doiTuong.tensp,
        doiTuong.thuonghieu,
        doiTuong.hinh,
        doiTuong.gia,
        doiTuong.sosao,
        doiTuong.nongdo,
        doiTuong.dungtich
      );
      return doiTuongDayDu;
    };
    return product;
  }

  function updateProductList(value, searchQuery,ds) {
    var dem = 0;
    var giatritren = document.getElementsByClassName("khoanggiatien")[1]
      ? document.getElementsByClassName("khoanggiatien")[1].value
      : "";
    var giatriduoi = document.getElementsByClassName("khoanggiatien")[0]
      ? document.getElementsByClassName("khoanggiatien")[0].value
      : "";

    var HTMLlistProducts = "";
    var filteredProducts = [];

    for (var p of ds) {
      var nameMatch = (p.tensp || "").toLowerCase().includes(searchQuery.toLowerCase());

      var categoryMatch = value == "All" || p.thuonghieu === value;

      var priceMatch = false;
      if (giatriduoi != "" && giatritren != "") {
        if (stringtoNum(p.gia) > giatriduoi && stringtoNum(p.gia) < giatritren) {
          priceMatch = true;
        }
      } else {
        priceMatch = true;
      }

      if (nameMatch && categoryMatch && priceMatch) {
        filteredProducts.push(p);
      }
    }

    dem = filteredProducts.length;
    HTMLlistProducts =
      ' <div id="soluongsanpham">Tìm thấy ' + dem + ' sản phẩm </div> <div class="items">';

    for (var p of filteredProducts) {
      HTMLlistProducts += chuyenDTSPthanhHTML(p);
    }

    HTMLlistProducts = HTMLlistProducts + "</div>";
    var wrapper = document.getElementById("product-list-wrapper");
    if (wrapper) wrapper.innerHTML = HTMLlistProducts;
  }

  function chuyenDTSPthanhHTML(product) {
    var html = "";
    html += '<div class="item" onclick="addKhungItem(\'' + product.masp + '\')" data-masp="' + product.masp + '" value="'+product.masp+'">';
    html += '  <div class="item-img">';
    html += '    <img src="' + product.hinh + '" alt="">';
    html += '  </div>';
    html += '  <div class="stars">';
    for (var i = 1; i <= product.sosao; i++) {
      html += '<span><img src="assets/images/star.png" alt=""></span>';
    }
    html += "  </div>";
    html += '  <div class="item-information">';
    html += "    <h3 class=\"item-title\">" + product.tensp + "(" + product.masp + ")</h3>"; // Hiển thị mã sản phẩm
    html += '    <div class="item-Category">' + product.thuonghieu + "</div>";
    html += '    <div class="item-price">' + product.gia + "$</div>";
    html += "  </div>";
    html += "</div>";

    return html;
  }

  function addKhungItem(masp){
    console.log("hello");
    var sp;
    for(var a of alcoholList) {
        if(a.masp==masp) {
            sp = a;
        }
    }
    var khung=document.getElementById('khungchitietsanpham');
    var xuat=`
    <span class="closes"  onclick="this.parentElement.style.transform = 'scale(0)';"><i class="ti-close"></i></span>
    <div class="grid">

    <div class="title">
      <header class="heading">`+sp.tensp+`</header>
      <div class="sub-heading">`+sp.dungtich+`ml / `+sp.nongdo+`%</div>
    </div>
    <div class="row">
        <div class="col l-4">
            <a href="" class="product-image">
              <img src="`+sp.hinh+`" alt="MATUSALEM" class="product-image__img">
            </a>
      </div>
      <div class="col l-4">
          <div class="product-rate">
              <div class="part">
                  <h4 class="part1__customer-rate">KHÁCH HÀNG ĐÁNH GIÁ</h4>`
    for(var i=1;i<=sp.sosao;i++){
        xuat+=
        `<i class="part1__rate-star-icon ti-star"></i>`
    }
        xuat+=`
              </div>
              <div class="part">
                  <h4 class="part1__customer-rate part1__customer-rate--hover">TASTING NOTES <span>(0)</span>
                  </h4>
                  <div class="part-wrap">
                      <div class="part1">
                          <i class="part__icon ti-angle-right"></i>
                          <h4 class="part1__customer-rate">THỜI GIAN GIAO HÀNG</h4>
                      </div>
                      <div class="part2">
                          <i class="part__icon ti-control-record"></i>
                          <h4 class="part1__customer-rate">ĐẶT HÀNG TRƯỚC 2-4 GIỜ</h4>
                      </div>
                  </div>
              </div>
              <div class="part">
                  <h4 class="part1__customer-rate">THẺ TỪ KHÓA</h4>
                  <a class="part__keyword-tag">`+sp.thuonghieu+`</a>
              </div>
              <div class="product-buy">
                  <a class="product-buy__btn" onclick="themVaoGioHang(`+sp.masp+`,'`+sp.tensp+`')">Thêm Vào Giỏ Hàng</a>
              </div>
          </div>
      </div>
      <div class="col l-4">
          <div class="contain-price">
              <div class="price">
                  <h3 class="price__heading">GIÁ THAM KHẢO</h3>
                  <div class="price__coin">`+sp.gia+`<u>$</u></div>
                  <div class="price__terms">ĐIỀU KHOẢN <a href="" class="price__terms-link">GIAO HÀNG</a>
                  </div>
              </div>
              <div class="compare">
                  <div class="like">
                      <i class="ti-heart like-icon"></i>
                      <span class="like-desc">ADD TO LIST</span>
                  </div>
                  <div class="compare-wrap">
                      <i class="compare-icon ti-arrows-horizontal"></i>
                      <span class="compare-desc">SO SÁNH</span>
                  </div>
              </div>
              <div class="support">
                  <div class="support-wrap">
                      <div class="customer-support">HỖ TRỢ KHÁCH HÀNG</div>
                      <span class="phone">HOTLINE: <a href="tel:012345678"
                              class="phone__number">012345678</a></span>
                  </div>
              </div>
          </div>
      </div>
  </div>
  <div class="row parent-border">
  </div>      
  </div>`
    khung.innerHTML = xuat;
    khung.style.transform = 'scale(1)';
}

  function themVaoGioHang(masp) {
    const curUser = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    if (!curUser) {
      if (typeof showTaiKhoan === "function") showTaiKhoan(true);
      else alert("Vui lòng đăng nhập");
      return;
    }

    if (typeof alcoholList === "undefined" || !Array.isArray(alcoholList)) {
      alert("Danh sách sản phẩm chưa sẵn sàng. Vui lòng thử lại.");
      return;
    }

    const sp = alcoholList.find((p) => String(p.masp) === String(masp));
    if (!sp) {
      alert("Không tìm thấy sản phẩm (mã: " + masp + ")");
      return;
    }

    curUser.products = curUser.products || [];

    const existing = curUser.products.find(
      (item) =>
        (item.masp && String(item.masp) === String(sp.masp)) ||
        (item.name && String(item.name) === String(sp.tensp))
    );

    if (existing) {
      existing.qty = (Number(existing.qty) || 0) + 1;
    } else {
      curUser.products.push({
        masp: sp.masp || "",
        name: sp.tensp || "",
        price: parseInt(String(sp.gia || "0").replace(/[^\d]/g, "")) || 0,
        qty: 1,
        img: sp.hinh || "",
      });
    }

    // Lưu CurrentUser và cập nhật ListUser một cách an toàn (merge donhang)
    if (typeof setCurrentUser === "function") setCurrentUser(curUser);
    safeUpdateListUser(curUser);

    if (typeof showToast === "function") {
      showToast('✅ Đã thêm "' + (sp.tensp || "sản phẩm") + '" vào giỏ hàng');
    } else {
      alert('Đã thêm "' + (sp.tensp || "sản phẩm") + '" vào giỏ hàng');
    }

    const khung = document.getElementById("khungchitietsanpham");
    if (khung) khung.style.transform = "scale(0)";

    if (typeof renderCart === "function") {
      try {
        renderCart();
      } catch (e) {
        console.warn("renderCart error", e);
      }
    }
  }

  function stringtoNum(s) {
    if (!s) return 0;
    return Number(String(s).replace(/[^\d]/g, "")) || 0;
  }

 function timKiemSanPham(input, brandValue) {
    searchQuery = input.value; // Cập nhật biến tìm kiếm toàn cục
    value = brandValue; // Giữ nguyên thương hiệu đang lọc
    
    // === KÍCH HOẠT PHÂN TRANG MỚI VÀ RESET VỀ TRANG 0 ===
    refreshProductList(0); 
}

  // phan trang
 // Phân trang và Lọc (Biến toàn cục)
let currentPage = 0; // Trang hiện tại (index: 0 là trang 1)
const rowsPerPage = 8; // Số sản phẩm trên mỗi trang
let filteredProducts = []; // Danh sách sản phẩm sau khi lọc

// Biến lọc toàn cục
let searchQuery = ""; 
let value = "All";
function updateProductListAndPaginate() {
    // 1. Lọc toàn bộ danh sách (alcoholList)
    filteredProducts = [];
    
    // Giả định các biến lọc (searchQuery, value,...) là toàn cục
    for (var p of alcoholList) {
        var nameMatch = (p.tensp || "").toLowerCase().includes(searchQuery.toLowerCase());
        var categoryMatch = value == "All" || p.thuonghieu === value;

        var priceMatch = false;
        var giatritren = document.getElementsByClassName("khoanggiatien")[1]
      ? document.getElementsByClassName("khoanggiatien")[1].value
      : "";
    var giatriduoi = document.getElementsByClassName("khoanggiatien")[0]
      ? document.getElementsByClassName("khoanggiatien")[0].value
      : "";
        // Bỏ qua lỗi cú pháp if(giatriduoi != "" && giatritren != "") { ... } để giữ nguyên logic
        if (giatriduoi != "" && giatritren != "") {
            if (stringtoNum(p.gia) > giatriduoi && stringtoNum(p.gia) < giatritren) {
                priceMatch = true;
            }
        } else {
            priceMatch = true;
        }

        if (nameMatch && categoryMatch && priceMatch) {
            filteredProducts.push(p);
        }
    }

    // Cập nhật số lượng tìm thấy
    document.getElementById("soluongsanpham").innerText = 'Tìm thấy ' + filteredProducts.length + ' sản phẩm';

    // 2. Thiết lập nút phân trang dựa trên danh sách đã lọc
    setupPagination(filteredProducts, rowsPerPage);
    
    // 3. Hiển thị trang hiện tại (Trang 1/index 0)
    displayItems(filteredProducts, rowsPerPage, currentPage);
}
// Hàm này thay thế hàm 'phantrang' cũ
function refreshProductList(page = 0) { // Đặt lại về trang 0 khi lọc mới
    currentPage = page;
    updateProductListAndPaginate();
}
// Thay thế hàm 'hienthitrang' cũ
function renderItemsHTML(dssp1trang) {
    var HTMLlistProducts = '<div class="items">';

    for (var p of dssp1trang) {
        // chuyenDTSPthanhHTML là hàm bạn tự định nghĩa để chuyển đối tượng SP thành HTML
        HTMLlistProducts += chuyenDTSPthanhHTML(p);
    }

    HTMLlistProducts += "</div>";
    var wrapper = document.getElementById("product-list-wrapper");
    if (wrapper) wrapper.innerHTML = HTMLlistProducts;
}

// Sửa hàm displayItems để sử dụng hàm mới
function displayItems(items, rows_per_page, page) {
    // Không cần innerHTML = "" ở đây vì renderItemsHTML sẽ làm điều đó
    
    const start = rows_per_page * page;
    const end = start + rows_per_page;
    
    const paginatedItems = items.slice(start, end);
    
    // Gọi hàm chỉ để vẽ HTML
    renderItemsHTML(paginatedItems);
    
    // Cập nhật trạng thái nút (Active)
    updatePaginationButtonStatus();
}
function setupPagination(items, rows_per_page) {
    const paginationWrapper = document.getElementById("pagination-wrapper");
    if (!paginationWrapper) return; // Đảm bảo bạn có div này trong HTML
    
    paginationWrapper.innerHTML = "";
    
    // Tính tổng số trang
    const pageCount = Math.ceil(items.length / rows_per_page);

    for (let i = 0; i < pageCount; i++) {
        let btn = document.createElement('button');
        btn.innerText = i + 1; // Số trang bắt đầu từ 1
        btn.setAttribute('data-page-index', i); // Lưu index trang

        // Thêm sự kiện bấm nút
        btn.addEventListener('click', function () {
            currentPage = i;
            // Dùng danh sách đã lọc để hiển thị
            displayItems(filteredProducts, rowsPerPage, currentPage); 
            updatePaginationButtonStatus();
        });
        
        paginationWrapper.appendChild(btn);
    }
    updatePaginationButtonStatus();
}

function updatePaginationButtonStatus() {
    const btns = document.querySelectorAll('#pagination-wrapper button');
    btns.forEach((btn, index) => {
        btn.classList.remove('active'); // Giả sử bạn có CSS cho class .active
        if (index === currentPage) {
            btn.classList.add('active');
        }
    });
}
  window.addtable = addtable;
  window.timKiemSanPham = timKiemSanPham;
  window.addKhungItem = addKhungItem;
  window.themVaoGioHang = themVaoGioHang;
})();