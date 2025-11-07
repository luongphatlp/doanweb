// Cập nhật số lượng hàng trong giỏ hàng + Tên current user
function capNhat_ThongTin_CurrentUser() {
    var u = getCurrentUser();
    if (u) {
        // Cập nhật tên người dùng
        document.getElementsByClassName('user')[0].getElementsByTagName('a')[0].childNodes[2].nodeValue = ' ' + u.username;
    }
}

function setListUser(l) {
  window.localStorage.setItem('ListUser', JSON.stringify(l));
}
// Sau khi chỉnh sửa 1 user 'u' thì cần hàm này để cập nhật lại vào ListUser


