// Helpers để lưu trạng thái đơn hàng riêng (orderStatusMap)
// Load this file after login.js (so getListUser/setListUser exist) and before giohang.js/admin.js

function getOrderStatusMap() {
  try {
    return JSON.parse(window.localStorage.getItem('orderStatusMap') || '{}');
  } catch (e) {
    return {};
  }
}
function setOrderStatusMap(map) {
  try {
    window.localStorage.setItem('orderStatusMap', JSON.stringify(map || {}));
  } catch (e) {}
}
function getOrderStatus(orderId) {
  if (!orderId) return undefined;
  const map = getOrderStatusMap();
  return map[orderId];
}
function setOrderStatus(orderId, status) {
  if (!orderId) return;
  const map = getOrderStatusMap();
  map[orderId] = status;
  setOrderStatusMap(map);
}