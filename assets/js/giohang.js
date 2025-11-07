(function () {
  const format = n => (Number(n) || 0).toLocaleString('vi-VN') + 'đ';
  const cur = () => (typeof getCurrentUser === 'function' ? getCurrentUser() : null);

  // Safe save: lưu CurrentUser và cập nhật ListUser một cách an toàn (không ghi đè donhang rỗng)
  function save(u) {
    if (!u || !u.username) return;
    try { if (typeof setCurrentUser === 'function') setCurrentUser(u); } catch (e) { console.warn('setCurrentUser failed', e); }

    try {
      if (typeof updateListUser === 'function') {
        updateListUser(u, u);
        return;
      }
    } catch (e) {
      console.warn('updateListUser threw, fallback', e);
    }

    // fallback an toàn nếu không có updateListUser
    if (typeof getListUser !== 'function' || typeof setListUser !== 'function') return;
    try {
      const list = getListUser() || [];
      for (let i = 0; i < list.length; i++) {
        if (list[i].username === u.username && (list[i].pass === u.pass || !u.pass)) {
          list[i].products = Array.isArray(u.products) ? u.products : list[i].products || [];
          if (Array.isArray(u.donhang) && u.donhang.length) {
            list[i].donhang = u.donhang;
          }
          break;
        }
      }
      setListUser(list);
    } catch (e) {
      console.warn('fallback setListUser failed', e);
    }
  }

  // NOTE: removed local getListUser() to use global getListUser from login.js

  function renderCart() {
    const user = cur();
    const tbody = document.getElementById('cart-body');
    const totalEl = document.getElementById('cart-total');
    if (!tbody || !totalEl) return;
    if (!user || !user.products || !user.products.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:12px;">Giỏ hàng trống.</td></tr>';
      totalEl.textContent = '0đ';
      return;
    }
    let total = 0;
    tbody.innerHTML = user.products.map((p, i) => {
      const price = Number(p.price) || 0, qty = Number(p.qty) || 1;
      const sum = price * qty; total += sum;
      return `
      <tr data-idx="${i}">
        <td><img src="${p.img}" style="width:70px;height:70px;object-fit:cover"></td>
        <td>${p.name} ${p.masp} </td>
        <td style="text-align:right">${format(price)}</td>
        <td style="text-align:center">
          <button class="dec">-</button>
          <input class="qty" value="${qty}" style="width:40px;text-align:center">
          <button class="inc">+</button>
        </td>
        <td style="text-align:right">${format(sum)}</td>
        <td style="text-align:center"><button class="remove" style="background:#e74c3c;color:#fff;border:none;padding:6px 10px;border-radius:4px;cursor:pointer">Xóa</button></td>
      </tr>`;
    }).join('');
    totalEl.textContent = format(total);
    attachEvents();

    if (user) {
      const nameField = document.getElementById('order-name');
      const emailField = document.getElementById('order-email');
      if (nameField) nameField.value = (user.ho || '') + ' ' + (user.ten || '');
      if (emailField) emailField.value = user.email || '';
    }
  }

  function attachEvents() {
    document.querySelectorAll('.inc').forEach(b => b.onclick = () => changeQty(b, 1));
    document.querySelectorAll('.dec').forEach(b => b.onclick = () => changeQty(b, -1));
    document.querySelectorAll('.remove').forEach(b => b.onclick = () => removeRow(b));
  }

  function changeQty(btn, d) {
    const tr = btn.closest('tr');
    if (!tr) return;
    const idx = tr.dataset.idx;
    const u = cur(); if (!u || !Array.isArray(u.products)) return;
    const p = u.products[idx];
    if (!p) return;
    p.qty = Math.max(1, (Number(p.qty) || 1) + d);
    // lưu an toàn và render lại
    save(u);
    renderCart();
  }

  function removeRow(btn) {
    const tr = btn.closest('tr');
    if (!tr) return;
    const idx = tr.dataset.idx;
    const u = cur(); if (!u || !Array.isArray(u.products)) return;
    u.products.splice(idx, 1);
    save(u);
    renderCart();
  }

  // renderOrders: lấy trạng thái từ orderStatusMap khi hiển thị
  function renderOrders() {
    const wrap = document.getElementById('orders-list');
    const u = cur();
    if (!wrap) return;
    wrap.innerHTML = '';

    const orders = (u && (Array.isArray(u.donhang) ? u.donhang : [])) || [];
    if (!orders || orders.length === 0) {
      wrap.innerHTML = '<p>Chưa có đơn hàng nào.</p>';
      return;
    }

    orders.slice().reverse().forEach(o => {
      const time = o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : '';
      const status = (typeof getOrderStatus === 'function' && getOrderStatus(o.id)) || o.status || 'Đang xử lý';
      const prods = (o.products || []).map(p =>
        `<div style="display:flex;align-items:center;gap:8px;">
           <img src="${p.img || ''}" style="width:48px;height:48px;object-fit:cover;border-radius:4px">
           <div>${p.name || ''} (${p.masp || ''}) x ${p.qty || 0}</div>
           <div style="margin-left:auto">${typeof format === 'function' ? format((p.price || 0) * (p.qty || 0)) : ((p.price || 0) * (p.qty || 0))}</div>
         </div>`).join('');
      wrap.innerHTML += `
        <div style="border:1px solid #ccc;padding:8px;margin-bottom:8px;border-radius:6px;">
          <div><b>Mã đơn:</b> ${o.id || ''} <span style="float:right">${time}</span></div>
          ${prods}
          <div style="margin-top:6px">
            <b>Tổng:</b> ${typeof format === 'function' ? format(o.total || 0) : (o.total || 0)} |
            <b>Thanh toán:</b> ${o.payment || ''} |
            <b>Trạng thái:</b> ${status}
          </div>
        </div>`;
    });
  }

  // placeOrder: khi tạo đơn, cũng setOrderStatus(order.id, 'Đang xử lý')
  function placeOrder() {
    const u = cur();
    if (!u || !Array.isArray(u.products) || u.products.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }
    const name = document.getElementById('order-name')?.value.trim() || '';
    const email = document.getElementById('order-email')?.value.trim() || '';
    const phone = document.getElementById('order-phone')?.value.trim() || '';
    const address = document.getElementById('order-address')?.value.trim() || '';
    const pay = document.querySelector('input[name="pay-method"]:checked')?.value || 'cod';
    if (!name || !address) {
      alert('Vui lòng nhập đầy đủ họ tên và địa chỉ.');
      return;
    }
    const total = u.products.reduce((s, p) => s + ((p.price || 0) * (p.qty || 0)), 0);

    const order = {
      id: 'DH' + Date.now(),
      createdAt: new Date().toISOString(),
      products: u.products.map(p => ({
        masp: p.masp,
        name: p.name,
        price: p.price,
        qty: p.qty,
        img: p.img
      })),
      total,
      payment: pay,
      status: 'Đang xử lý',
      receiver: { name, email, phone, address }
    };

     u.donhang = u.donhang || [];
    u.donhang.push(order);

    u.products = [];

    if (typeof setCurrentUser === 'function') setCurrentUser(u);

    if (typeof updateListUser === 'function') {
      try { updateListUser(u, u); } catch(e) { console.warn('updateListUser error', e); }
    } else if (typeof setListUser === 'function' && typeof getListUser === 'function') {
      try {
        const list = getListUser() || [];
        for (let i = 0; i < list.length; i++) {
          if (list[i].username === u.username && list[i].pass === u.pass) {
            list[i].products = u.products;
            if (Array.isArray(u.donhang) && u.donhang.length) list[i].donhang = u.donhang;
            break;
          }
        }
        setListUser(list);
      } catch(e) { console.warn('fallback setListUser error', e); }
    }

    if (typeof setOrderStatus === 'function') {
      try { setOrderStatus(order.id, 'Đang xử lý'); } catch(e) { console.warn('setOrderStatus error', e); }
    } else {
      const map = (typeof getOrderStatusMap === 'function') ? getOrderStatusMap() : {};
      map[order.id] = 'Đang xử lý';
      try { localStorage.setItem('orderStatusMap', JSON.stringify(map)); } catch(e) {}
    }

    alert('Đặt hàng thành công!');
    if (typeof renderCart === 'function') try { renderCart(); } catch(e) {}
    try { renderOrders(); } catch(e) {}
    addTableDonHang();
  }

  document.addEventListener('DOMContentLoaded', function () {
    try { renderCart(); } catch (e) { console.warn('renderCart error', e); }
    try { renderOrders(); } catch (e) { console.warn('renderOrders error', e); }

    const btn = document.getElementById('btn-place-order');
    if (btn) btn.addEventListener('click', function (e) {
      e.preventDefault();
      placeOrder();
      // small delay to ensure order saved and then refresh orders
      setTimeout(function(){ try { renderOrders(); } catch(e){} }, 100);
    });
  });
})();