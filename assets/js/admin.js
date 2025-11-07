//
window.onload=function(){
    //lấy dữ liệu từ localStorage hoặc từ alcoholList
    alcoholList;
    setalcoholList(alcoholList);
    //them tab cho admin
    eventab();
    //tạo bảng
    addTableTrangChu();
    addTableProducts(); 
    addTableDonHang();
    addTableKhachHang();
    addTablePhieuNhap();
    addTaiKhoan();
    showTaiKhoan(true);
}
function setalcoholList(newList) {
    window.localStorage.setItem('alcoholList', JSON.stringify(newList));
}

function getalcoholList() {
    return JSON.parse(window.localStorage.getItem('alcoholList'));
}

function addTableTrangChu() {
    var khung = document.getElementsByClassName('trangchu')[0].getElementsByClassName('table-content')[0];
    const dsPhieuNhap = getPhieuNhapList?.() || []; // danh sách phiếu nhập hàng
    const dsSanPham = getalcoholList?.() || []; // danh sách sản phẩm
    const dsUser = getListUser?.() || []; // danh sách user có đơn hàng

    // Gom đơn hàng từ tất cả user
    let dsDonHang = [];
    dsUser.forEach(u => {
        if (u.donhang) {
            u.donhang.forEach(dh => {
                if (Array.isArray(dh.products)) {
                    dh.products.forEach(p => {
                        dsDonHang.push({
                            masp: p.masp,
                            qty: Number(p.qty) || 0,
                            tongtien: Number(dh.total) || 0,
                            status: (typeof getOrderStatus === "function" && getOrderStatus(dh.id)) || dh.status || "Đang xử lý"
                        });
                    });
                }
            });
        }
    });

    // Mảng kết quả thống kê
    let thongke = [];

    dsSanPham.forEach(sp => {
        const ma = sp.masp;
        const ten = sp.tensp;
        const thuonghieu=sp.thuonghieu;
        const giaBan = Number(stringToNum(sp.gia));
        const soLuongTon = Number(sp.soluongton) || 0;

        // Tổng số lượng nhập
        const nhap = dsPhieuNhap.filter(p => p.maSP=== ma);
        const soLuongNhap = nhap.reduce((t, p) => t + Number(p.soLuong), 0);
        const tongGiaNhap = nhap.reduce((t, p) => t + Number(p.soLuong) * Number(p.donGia), 0);
        const giaNhapTB = soLuongNhap > 0 ? tongGiaNhap / soLuongNhap : 0;

        // Tổng số lượng bán (đơn hàng đã giao)
        const ban = dsDonHang.filter(d => d.masp === ma && d.status === "Đã giao hàng");
        const soLuongBan = ban.reduce((t, p) => t + p.qty, 0);

        // Doanh thu & lợi nhuận
        const doanhThu = giaBan * soLuongBan;
        const loiNhuan = (giaBan - giaNhapTB) * soLuongBan;
        const tileLN = (doanhThu - loiNhuan)/ loiNhuan || 0;

        thongke.push({
            ma, ten,
            thuonghieu,
            giaNhap: giaNhapTB,
            giaBan,
            soLuongNhap,
            soLuongBan,
            soLuongTon,
            doanhThu,
            loiNhuan,
            tileLN
        });
    });

    // Tổng kết
    let tongDoanhThu = thongke.reduce((t, k) => t + k.doanhThu, 0);
    let tongLoiNhuan = thongke.reduce((t, k) => t + k.loiNhuan, 0);

    // Hiển thị bảng
    let s = `<table>`

    thongke.forEach((tk, i) => {
        s += `
        <tr>
            <td style="width: 10%">${i + 1}</td>
            <td style="width: 10%">${tk.ma}</td>
            <td style="width: 40%">${tk.ten}</td>
            <td style="width: 10%">${tk.thuonghieu}</td>
            <td style="width: 10%">${formatVND(tk.doanhThu)}</td>
            <td style="width: 10%">${formatVND(tk.loiNhuan)}</td>
            <td style="width: 10%">${tk.tileLN}%</td>
        </tr>`;
    });

    s += `
        <tr>
            <td colspan="4" style="text-align:right">TỔNG:</td>
            <td>${formatVND(tongDoanhThu)}</td>
            <td>${formatVND(tongLoiNhuan)}</td>
            <td></td>
        </tr>
    </table>`;

    khung.innerHTML = s;
}

function addTableTrangChu1(thuonghieu) {
    var khung = document.getElementsByClassName('trangchu')[0].getElementsByClassName('table-content')[0];
    const dsPhieuNhap = getPhieuNhapList?.() || []; // danh sách phiếu nhập hàng
    const dsSanPham = getalcoholList?.() || []; // danh sách sản phẩm
    const dsUser = getListUser?.() || []; // danh sách user có đơn hàng

    // Gom đơn hàng từ tất cả user
    let dsDonHang = [];
    dsUser.forEach(u => {
        if (u.donhang) {
            u.donhang.forEach(dh => {
                if (Array.isArray(dh.products)) {
                    dh.products.forEach(p => {
                        dsDonHang.push({
                            masp: p.masp,
                            qty: Number(p.qty) || 0,
                            tongtien: Number(dh.total) || 0,
                            status: (typeof getOrderStatus === "function" && getOrderStatus(dh.id)) || dh.status || "Đang xử lý"
                        });
                    });
                }
            });
        }
    });
    var tam=dsSanPham.filter(p =>p.thuonghieu==thuonghieu);
    // Mảng kết quả thống kê
    let thongke = [];

    tam.forEach(sp => {
        const ma = sp.masp;
        const ten = sp.tensp;
        const thuonghieu=sp.thuonghieu;
        const giaBan = Number(stringToNum(sp.gia));
        const soLuongTon = Number(sp.soluongton) || 0;

        // Tổng số lượng nhập
        const nhap = dsPhieuNhap.filter(p => p.maSP=== ma);
        const soLuongNhap = nhap.reduce((t, p) => t + Number(p.soLuong), 0);
        const tongGiaNhap = nhap.reduce((t, p) => t + Number(p.soLuong) * Number(p.donGia), 0);
        const giaNhapTB = soLuongNhap > 0 ? tongGiaNhap / soLuongNhap : 0;

        // Tổng số lượng bán (đơn hàng đã giao)
        const ban = dsDonHang.filter(d => d.masp === ma && d.status === "Đã giao hàng");
        const soLuongBan = ban.reduce((t, p) => t + p.qty, 0);

        // Doanh thu & lợi nhuận
        const doanhThu = giaBan * soLuongBan;
        const loiNhuan = (giaBan - giaNhapTB) * soLuongBan;
        const tileLN = (doanhThu - loiNhuan)/ loiNhuan || 0;

        thongke.push({
            ma, ten,
            thuonghieu,
            giaNhap: giaNhapTB,
            giaBan,
            soLuongNhap,
            soLuongBan,
            soLuongTon,
            doanhThu,
            loiNhuan,
            tileLN
        });
    });

    // Tổng kết
    let tongDoanhThu = thongke.reduce((t, k) => t + k.doanhThu, 0);
    let tongLoiNhuan = thongke.reduce((t, k) => t + k.loiNhuan, 0);

    // Hiển thị bảng
    let s = `<table>`

    thongke.forEach((tk, i) => {
        s += `
        <tr>
            <td style="width: 10%">${i + 1}</td>
            <td style="width: 10%">${tk.ma}</td>
            <td style="width: 40%">${tk.ten}</td>
            <td style="width: 10%">${tk.thuonghieu}</td>
            <td style="width: 10%">${formatVND(tk.doanhThu)}</td>
            <td style="width: 10%">${formatVND(tk.loiNhuan)}</td>
            <td style="width: 10%">${tk.tileLN}%</td>
        </tr>`;
    });

    s += `
        <tr>
            <td colspan="4" style="text-align:right">TỔNG:</td>
            <td>${formatVND(tongDoanhThu)}</td>
            <td>${formatVND(tongLoiNhuan)}</td>
            <td></td>
        </tr>
    </table>`;

    khung.innerHTML = s;
}


function formatVND(n) {
    return (Number(n) || 0).toLocaleString('vi-VN') + 'đ';
}

function suaThongTinSanPham(ma) {
    const dsSanPham = getListProduct();
    const sp = dsSanPham.find(p => p.ma === ma);
    if (!sp) return alert("Không tìm thấy sản phẩm!");
    const tenmoi = prompt("Nhập tên mới:", sp.ten);
    if (tenmoi !== null && tenmoi.trim() !== "") {
        sp.ten = tenmoi.trim();
        localStorage.setItem("productList", JSON.stringify(dsSanPham));
        alert("Cập nhật thành công!");
        renderThongKe();
    }
}

//SANPHAM++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Tạo bảng sản Phẩm
function addTableProducts() {
var tc = document.getElementsByClassName('sanpham')[0].getElementsByClassName('table-content')[0];
var xuat = `<table>`;
for(var i=0;i < alcoholList.length;i++){
    var a=alcoholList[i];
            xuat+= `<tr>
                <td style="width: 5%">`+(i+1)+`</td>
                <td style="width: 5%">`+a.masp+`</td>
                <td style="width: 40%">`+a.tensp
            if(a.hinh!=null)
                    xuat+=`<img src="`+a.hinh+`"></img>`
            xuat+=`        
                </td>
                <td style="width: 10%">`+a.thuonghieu+`</td>
                <td style="width: 5%">`+a.gia+`</td>
                <td style="width: 5%">`+a.tileLoiNhuan+`</td>
                <td style="width: 5%">`+a.sosao+`</td>
                <td style="width: 5%">`+a.nongdo+"%"+`</td>
                <td style="width: 5%">`+a.dungtich+"ML"+`</td>
                <td style="width: 5%; color:${a.soluongton < 5 ? 'red' : 'inherit'}">${a.soluongton}</td>
                <td style="width: 15%">
                    <div class="tooltip">
                        <i class="ti-pencil-alt" onclick="addKhungSuaSanPham('`+a.masp+`')"></i>
                    </div>
                    <div class="tooltip" >
                        <i class="ti-trash" onclick="xoaSanPham('`+a.masp+`','`+a.tensp+`')"></i>
                    </div>
                </td>
            </tr>`;
            
    }
     xuat += `</table>`;
     tc.innerHTML = xuat;
}
function addTableProducts1(thuonghieu) {
var tc = document.getElementsByClassName('sanpham')[0].getElementsByClassName('table-content')[0];
var xuat = `<table>`;
for(var i=0;i < alcoholList.length;i++){
    if(alcoholList[i].thuonghieu==thuonghieu){
        var a=alcoholList[i];
            xuat+= `<tr>
                <td style="width: 5%">`+(i+1)+`</td>
                <td style="width: 5%">`+a.masp+`</td>
                <td style="width: 40%">`+a.tensp
            if(a.hinh!=null)
                    xuat+=`<img src="`+a.hinh+`"></img>`
            xuat+=`        
                </td>
                <td style="width: 10%">`+a.thuonghieu+`</td>
                <td style="width: 5%">`+a.gia+`</td>
                <td style="width: 5%">`+a.tileLoiNhuan+`</td>
                <td style="width: 5%">`+a.sosao+`</td>
                <td style="width: 5%">`+a.nongdo+"%"+`</td>
                <td style="width: 5%">`+a.dungtich+"ML"+`</td>
                <td style="width: 5%; color:${a.soluongton < 5 ? 'red' : 'inherit'}">${a.soluongton}</td>
                <td style="width: 15%">
                    <div class="tooltip">
                        <i class="ti-pencil-alt" onclick="addKhungSuaSanPham('`+a.masp+`')"></i>
                    </div>
                    <div class="tooltip" >
                        <i class="ti-trash" onclick="xoaSanPham('`+a.masp+`','`+a.tensp+`')"></i>
                    </div>
                </td>
            </tr>`;
        }
    }
     xuat += `</table>`;
     tc.innerHTML = xuat;
}
function suatileloinhuan() {
    var list = getalcoholList();
    var t = document.getElementById('thuonghieu'); // sửa
    var tile = document.getElementById('nhaptileloinhuan').value || 0; // lấy giá trị nhập
    
    var thuonghieu;
    if (t.value === "1") {          // value của option là string
        thuonghieu="Vodka";
    } else if (t.value === "2") {
       thuonghieu="Whisky";
    } else {
        thuonghieu="Rum";
    }
    for(var i=0;i<list.length;i++){
        if(list[i].thuonghieu==thuonghieu){
            list[i].tileLoiNhuan=tile;
        }
    }
    // Nếu muốn hiển thị lại danh sách, gọi hàm render ở đây
    setalcoholList(list);
    alcoholList=list;
    addTableProducts();
    document.getElementById('khungNhapTiLeLoiNhuan').style.transform = 'scale(0)';
}

//Mở khung sửa sản phẩm
function addKhungSuaSanPham(masp) {
    var sp;
    for(var a of alcoholList) {
        if(a.masp == masp) {
            sp = a;
            break;
        }
    }
    if(!sp){
        alert('Khong tim thay san pham');
        return;
    }
    var xuat=`<span class="close" onclick="this.parentElement.classList.remove('open');"><i class="ti-close"></i></span>
    <table class="overlayTable table-content table-header">
        <tr>
            <th colspan="2">Sửa Sản Phẩm: `+sp.tensp+`</th>
        </tr>
        <tr>
            <td>Mã sản phẩm:</td>
            <td><input type="text" value="`+sp.masp+`"></td>
        </tr>
        <tr>
            <td>Tên sản phẩm:</td>
            <td><input type="text" value="`+sp.tensp+`"></td>
        </tr>
        <tr>
            <td>Thương Hiệu:</td>
            <td>
                <select >`
        var danhsachthuonghieu=["Whisky","Rum","Vodka"];
        for( var c of danhsachthuonghieu){
            if(sp.thuonghieu==c)
                xuat+=(`<option value="`+c+`"selected>`+c+`</option>`);
                else xuat+=(`<option value="`+c+`">`+c+`</option>`);
        }
    xuat+=`
    </select>
            </td>
        </tr>
        
        <tr>
            <td>Hình:</td>
            <td>`
    if(sp.hinh!=null){
        xuat+= `<img class="hinhDaiDien" id="anhDaiDienSanPhamThem" src="${sp.hinh}" data-base64="">
        <a onclick="xoaAnhSanPham('`+sp.masp+`')">Xóa hình</a>`
    }
    else{
        xuat+='<img class="hinhDaiDien" id="anhDaiDienSanPhamThem" src="">'
    }
    xuat+=`
                
                <input type="file" accept="image/*" onchange="capNhatAnhSanPham(this.files, 'anhDaiDienSanPhamThem')">
            </td>
        </tr>
        <tr>
            <td>Giá tiền ($):</td>
            <td><input type="number" value="${stringToNum(sp.gia)}"></td>
        </tr>
        <tr>
            <td>Tỉ lệ lợi nhuận:</td>
            <td><input type="number" value="${sp.tileLoiNhuan}"></td>
        </tr>
        <tr>
            <td>Số sao (số nguyên 0->5):</td>
            <td><input type="number" value="${sp.sosao}" min="0" max="5"></td>
        </tr>
        <tr>
            <td>Nồng độ:</td>
            <td><input type="number" value="${sp.nongdo}"></td>
        </tr>
        <tr>
            <td>Dung tích:</td>
            <td><input type="number" value="${sp.dungtich}"></td>
        </tr>
        <tr>

            <td colspan="2" class="table-footer"><button onclick="suaSanPham('${sp.masp}')">LƯU THAY ĐỔI</button> </td>
        </tr>
        
    </table>`
    
    var khung = document.getElementById('khungSuaSanPham');
    khung.innerHTML = xuat;
    khung.classList.add('open');
}
var previewSrc;
//cập nhật ảnh sản phẩm
function capNhatAnhSanPham(files, id) {
    const reader = new FileReader();
    
    reader.addEventListener("load", function () {
        // convert image file to base64 string
        //chuyển đổi hình ảnh thành chuỗi
        previewSrc = reader.result;
        const img=document.getElementById(id)
        img.src = previewSrc;
        img.dataset.base64 = reader.result; // lưu tạm để sau này đưa vào m

    }, false);
    

    if (files[0]) {
        reader.readAsDataURL(files[0]);
    }
}

function layThongTinSanPhamTuTable(id) {
    //lấy dữ liệu trong thẻ html
    var khung = document.getElementById(id);
    var tr = khung.getElementsByTagName('tr');
    var masp1 = tr[1].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var tensp1 = tr[2].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var thuonghieu1 = tr[3].getElementsByTagName('td')[1].getElementsByTagName('select')[0].value;
    //var img1 = tr[4].getElementsByTagName('td')[1].getElementsByTagName('img')[0].src;
    var imgE=document.getElementById('anhDaiDienSanPhamThem');
    var img1= imgE.dataset.base64 || imgE.src || "";
    var gia1 = tr[5].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var tile1 = tr[6].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var sosao1 = tr[7].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var nongdo1 = tr[8].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var dungtich1 = tr[9].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    //xét điều kiện
    if(isNaN(gia1)) {
        alert('Giá phải là số nguyên');
        return false;
    }
    if(isNaN(sosao1)) {
        alert('Số sao phải là số nguyên');
        return false;
    }
    if(isNaN(nongdo1)) {
        alert('Nồng độ phải là số nguyên');
        return false;
    }
    if(isNaN(dungtich1)) {
        alert('Dung tích phải là số nguyên');
        return false;
    }
    //gán giá trị vào mảng
    try {
        return {
            "tensp": tensp1,
            "masp":masp1,
            "thuonghieu": thuonghieu1,
            "hinh": img1,
            "gia": numToString(Number.parseInt(gia1, 10)),
            "tileLoiNhuan": tile1,
            "sosao": Number.parseInt(sosao1, 10),
            "nongdo": Number.parseInt(nongdo1, 10),
            "dungtich": Number.parseInt(dungtich1, 10),
            "soluongton":0,
        }
    } catch(e) {
        alert('Lỗi: ' + e.toString());
        return false;
    }

}
//them san pham
function themSanPham(){
    var sanphammoi=layThongTinSanPhamTuTable('khungThemSanPham');
    if(!sanphammoi) return;
    for(var p of alcoholList) {
        if(p.masp == sanphammoi.masp) {
            alert('Mã sản phẩm bị trùng !!');
            return false;
        }

        if(p.tensp == sanphammoi.tensp) {
            alert('Tên sản phẩm bị trùng !!');
            return false;
        }
    }
     // Them san pham vao alcoholList
     alcoholList.push(sanphammoi);

     // Lưu vào localstorage
     setalcoholList(alcoholList);
 
     
     // Vẽ lại table
     addTableProducts();

    alert('Thêm sản phẩm "' + sanphammoi.tensp + '" thành công.');
    document.getElementById('khungThemSanPham').classList.remove('open');
}

//hàm sửa sản phẩm
function suaSanPham(masp) {
    

    var sp = layThongTinSanPhamTuTable('khungSuaSanPham');
    //kiểm tra điều kiện
    if(!sp) return;
    for(var p of alcoholList) {
        if(p.masp == sp.masp && p.masp !=masp) {
            alert('Mã sản phẩm bị trùng !!');
            return false;
        }
        if(p.tensp == sp.tensp && p.masp != sp.masp) {
            alert('Tên sản phẩm bị trùng !!');
            return false;
        }
    }

    // Sửa
    var kt=false;
    for(var i = 0; i < alcoholList.length; i++) {
        //tìm vị trí 
        if(alcoholList[i].masp == masp) {
            //gán thong tin mới sửa
            alcoholList[i] = sp;
            kt=true;
        }
    }
    if(!kt) alcoholList.push(sp);

    // Lưu vào localstorage
    setalcoholList(alcoholList);

    // Vẽ lại table
    addTableProducts();

    alert('Sửa ' + sp.tensp + ' thành công');
    document.getElementById('khungSuaSanPham').classList.remove('open');
    //document.getElementById('khungSuaSanPham').style.transform = 'scale(0)';
}

//hàm xóa sản phẩm
function xoaSanPham(masp, tensp) {
    if (window.confirm('Bạn có chắc muốn xóa ' + tensp)) {
        // Xóa
        for(var i = 0; i < alcoholList.length; i++) {
            if(alcoholList[i].masp == masp) {
                //xóa 1 phẩn tử tại vị trí i
                alcoholList.splice(i, 1);
            }
        }
            // Lưu vào localstorage
        setalcoholList(alcoholList);

        // Vẽ lại table
        addTableProducts();
    }
}

//hàm xoa hinh san pham
function xoaAnhSanPham(masp){        
    for(var a of alcoholList)
    {
        if(a.masp==masp){
            a.hinh=null;
        }
    }
    // alert('ĐÃ XÓA ẢNH')
    //lưu lại dữ liệu
    setalcoholList(alcoholList);
    // Vẽ lại table
    addTableProducts();
    addKhungSuaSanPham(masp);
    previewSrc=null;
    // document.getElementById('khungSuaSanPham').style.transform = 'scale(0)';
}   
// ===================================================Đơn hàng
var TONGTIEN
function addTableDonHang() {
    var tc = document.getElementsByClassName('donhang')[0].getElementsByClassName('table-content')[0];
    var s = `<table>`;
    var listDH = getListDonHang();
    TONGTIEN = 0;
    for (var i = 0; i < listDH.length; i++) {
        var d = listDH[i];
        s += `<tr>
            <td style="width: 5%">` + (i+1) + `</td>
            <td style="width: 13%">` + d.ma + `</td>
            <td style="width: 7%">` + d.khach + `</td>
            <td style="width: 20%">` + d.sp + `</td>
            <td style="width: 10%">` + d.tongtien + `</td>
            <td style="width: 10%">` + d.ngaygio + `</td>
            <td style="width: 10%">` + d.tinhTrang + `</td>
            <td style="width: 5%">
                <div class="tooltip" onclick="chitietdonhang('`+d.ma+`')">
                    <i class="fa fa-check"></i>
                    <span class="tooltiptext">Chi Tiết</span>
                </div>
            </td>
            <td style="width: 10%">
                <div class="tooltip" onclick="duyet('`+d.ma+`', true)">
                    <i class="fa fa-check"></i>
                    <span class="tooltiptext">Duyệt</span>
                </div>
                <div class="tooltip"  onclick="duyet('`+d.ma+`', false)">
                    <i class="fa fa-remove"></i>
                    <span class="tooltiptext">Hủy</span>
                </div>
                
            </td>
        </tr>`;
        TONGTIEN += stringToNum(d.tongtien);
    }
    s += `</table>`;
    tc.innerHTML = s;
}
function chitietdonhang(id){
    
    var users=getListUser();
    var dh;
    users.forEach((u,i) =>{
        if(!u.donhang) return;
        u.donhang.forEach((d, j)=>{
            if(d.id==id){dh=d;}
           })
    })
            var xuat=`<span class="close" onclick="this.parentElement.classList.remove('open');"><i class="ti-close"></i></span>
            <table class="overlayTable table-content table-header">
        <tr>
            <th colspan="2">Chi tiết đơn hàng</th>
        </tr>
        <tr>
            <td>Mã đơn hàng</td>
            <td>${dh.id}</td>
        </tr>
        <tr>
            <td>Phương thức thanh toán:</td>
            <td>${dh.payment}</td>
        </tr>
        <tr>
            <td colspan="2">Thông tin người nhận</td>
        </tr>
        <tr>
            <td>Tên người đặt</td>
            <td>${dh.receiver.name}</td>
        </tr>
        <tr>
            <td>Email</td>
            <td>${dh.receiver.email}</td>
        </tr>
        <tr>
            <td>Số điện thoại</td>
            <td>${dh.receiver.phone}</td>
        </tr>
        <tr>
            <td>Địa chỉ</td>
            <td>${dh.receiver.address}</td>
        </table>`
        const khung=document.getElementById('khungChiTietDonHang');
        khung.innerHTML=xuat;
        khung.classList.add('open');
}
function timKiemTheoMa(list, ma) {
    for (var l of list) {
        if (l.masp == ma) return l;
    }
}
function getListDonHang() {
    var users = getListUser();
    var result = [];
    users.forEach((u, i) => {
        if (!u.donhang) return;
        u.donhang.forEach((dh, j) => {
            // status ưu tiên lấy từ orderStatusMap
            var status = (typeof getOrderStatus === 'function' && getOrderStatus(dh.id)) || dh.status || 'Đang xử lý';

            var sps = '';
            if (dh.products) {
                dh.products.forEach(p => {
                    sps += `<p style="text-align:right">${p.name} [${p.qty}]</p>`;
                });
            }
            result.push({
                ma: dh.id || ('DH' + j + i),
                khach: u.username || u.email || 'Ẩn danh',
                sp: sps,
                tongtien: dh.total ? dh.total.toLocaleString('vi-VN') + 'đ' : '0đ',
                ngaygio: new Date(dh.createdAt || Date.now()).toLocaleString('vi-VN'),
                tinhTrang: status,
            });
        });
    });
    return result;
}

// Duyệt: cập nhật orderStatusMap thay vì chỉ chỉnh trong user.donhang (để tránh mất khi sync)
function duyet(maDonHang, duyetDon) {
    var u = getListUser();
    for(var i = 0; i < u.length; i++) {
        if (!Array.isArray(u[i].donhang)) continue;
        for(var j = 0; j < u[i].donhang.length; j++) {
            if(u[i].donhang[j].id == maDonHang) {
                if(duyetDon) {
                    // duyệt
                    var curStatus = (typeof getOrderStatus === 'function' && getOrderStatus(maDonHang)) || u[i].donhang[j].status || 'Đang xử lý';
                    if(curStatus == 'Đang xử lý') {
                        // set central status
                        if (typeof setOrderStatus === 'function') setOrderStatus(maDonHang, 'Đã giao hàng');
                        // giảm tồn kho
                        const list = JSON.parse(localStorage.getItem("alcoholList")) || [];
                        for(var sp of u[i].donhang[j].products){
                            for(var k=0;k<list.length;k++){
                                if(list[k].masp==sp.masp){
                                    list[k].soluongton = (Number(list[k].soluongton) || 0) - (Number(sp.qty) || 0);
                                    break;
                                }
                            }
                        }
                        try { window.localStorage.setItem('alcoholList', JSON.stringify(list)); } catch(e){}
                        alcoholList = list;
                        addTableProducts();
                    } else if(curStatus == 'Đã hủy') {
                        alert('Không thể duyệt đơn đã hủy !');
                        return;
                    }
                } else {
                    // hủy
                    var curStatus = (typeof getOrderStatus === 'function' && getOrderStatus(maDonHang)) || u[i].donhang[j].status || 'Đang xử lý';
                    if(curStatus == 'Đang xử lý') {
                        if(window.confirm('Bạn có chắc muốn hủy đơn hàng này. Hành động này sẽ không thể khôi phục lại !')) {
                            if (typeof setOrderStatus === 'function') setOrderStatus(maDonHang, 'Đã hủy');
                        }
                    } else if(curStatus == 'Đã giao hàng') {
                        alert('Không thể hủy đơn hàng đã giao !');
                        return;
                    }
                }
                // Lưu ListUser (không cần gán status vào u[i].donhang[j] vì trạng thái được lưu riêng)
                window.localStorage.setItem('ListUser', JSON.stringify(u));
                addTableTrangChu();
                addTableDonHang();
                return;
            }
        }
    }
}
function getListUser() {
    // Giả sử danh sách người dùng được lưu với key 'userList'
    return JSON.parse(window.localStorage.getItem('ListUser')) || [];
}
function setListUser(newList) {
    window.localStorage.setItem('ListUser', JSON.stringify(newList));
}
//Khách Hàng=======================================================
function addTableKhachHang() {
    var tc = document.getElementsByClassName('khachhang')[0].getElementsByClassName('table-content')[0];
    var s = `<table class="table-outline hideImg">`;

    var listUser = getListUser();

    for (var i = 0; i < listUser.length; i++) {
        var u = listUser[i];
        s += `<tr>
            <td style="width: 5%">` + (i+1) + `</td>
            <td style="width: 15%">` + u.ho + ' ' + u.ten + `</td>
            <td style="width: 20%">` + u.email + `</td>
            <td style="width: 20%">` + u.username + `</td>
            <td style="width: 10%">` + u.pass + `</td>
            <td style="width: 10%">
                <div class="tooltip">
                    <label class="switch">
                        <input type="checkbox" `+(u.off?'':'checked')+` onclick="voHieuHoaNguoiDung('`+u.username+`')">
                        <span class="slider round"></span>
                    </label>
                    <span class="tooltiptext">`+(u.off?'Mở':'Khóa')+`</span>
                </div>
                <div class="tooltip" onclick="xoaNguoiDung('`+u.username+`')">
                    <i class="fa fa-remove" "></i>
                    <span class="tooltiptext">Xóa</span>
                </div>
            </td>
        </tr>`;
    }

    s += `</table>`;
    tc.innerHTML = s;
}
/* 
                    <div class="tooltip">
                        <i class="ti-pencil-alt" onclick="addKhungSuaSanPham('`+a.masp+`')"></i>
                    </div>
                    <div class="tooltip" >
                        <i class="ti-trash" onclick="xoaSanPham('`+a.masp+`','`+a.tensp+`')"></i>
                    </div>  
*/
function voHieuHoaNguoiDung(taikhoan){
    var users=getListUser();
    var kt=false;
    
    for(var i=0;i<users.length;i++){
        if(users[i].username == taikhoan){
            if(users[i].off){
                if(window.confirm('Xác nhận mở khóa tài khoản '+taikhoan+'?\n')){
                    kt=true;
                }
            }
            else{
                if(window.confirm('Xác nhận vô hiệu hóa tài khoản '+taikhoan+'?\n')){
                    kt=true;
                }
            }
            if(kt){ 
                users[i].off=!users[i].off;
                setListUser(users);
                addTableKhachHang();
                break;
            }
        }
    }
}
function xoaNguoiDung(taikhoan) {
    if(window.confirm('Xác nhận xóa '+taikhoan+'? \nMọi dữ liệu về '+taikhoan+' sẽ mất! Bao gồm cả những đơn hàng của '+taikhoan)) {
        var listuser = getListUser();
        for(var i = 0; i < listuser.length; i++) {
            if(listuser[i].username == taikhoan) {
                listuser.splice(i, 1); // xóa
                setListUser(listuser); // lưu thay đổi
                localStorage.removeItem('CurrentUser'); // đăng xuất khỏi tài khoản hiện tại (current user)
                addTableKhachHang(); // vẽ lại bảng khách hàng
                addTableDonHang(); // vẽ lại bảng đơn hàng
                return;
            }
        }
    }
}
function luuNhapHang(masp,soLuong) {
    var currentAlcoholList =getalcoholList() || [];
    for(var sp of currentAlcoholList){
        if(sp.masp == masp){
            if(!sp.soluongton) sp.soluongton = 0;
            sp.soluongton += soLuong;
            break;
        }
    }
    alcoholList=currentAlcoholList;
    setalcoholList(currentAlcoholList);
    addTableProducts();
}
function getPhieuNhapList() {
    return JSON.parse(localStorage.getItem('phieuNhapList')) || [];
}

function setPhieuNhapList(list) {
    localStorage.setItem('phieuNhapList', JSON.stringify(list));
}
function themPhieuNhap() {
    const maphieu = document.getElementById('maphieuNhap').value.trim();
    const ngay = document.getElementById('ngayNhap').value;
    const maSP = document.getElementById('maSanPhamNhap').value.trim();
    const tenSP = document.getElementById('tenSanPhamNhap').value.trim();
    const donGia = Number(document.getElementById('donGiaNhap').value);
    const soLuong = Number(document.getElementById('soLuongNhap').value);
    const off=true;
    if (!maphieu || !maSP || !tenSP || !ngay) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    const list = getPhieuNhapList();
    if(list.some(u => u.maphieu===maphieu)){
        alert('Trùng mã phiếu!');
        return;
    }
    list.push({ maphieu, ngay, maSP, tenSP, donGia, soLuong, off});
    setPhieuNhapList(list);
    alert("Đã thêm phiếu nhập!");
    document.getElementById('khungThemPhieuNhap').classList.remove('open');
    addTablePhieuNhap();
}

function addTablePhieuNhap() {
    var sp = document.getElementsByClassName('nhaphang')[0].getElementsByClassName('table-content')[0];
    var s = `<table>`;
   
    var listHang = getPhieuNhapList();
    for (var i = 0; i < listHang.length; i++) {
        var u = listHang[i];
        s += `<tr>
            <td style="width: 5%">` + (i+1) + `</td>
            <td style="width: 10%"> ${u.maphieu}</td>
            <td style="width: 10%"> ${u.ngay}</td>
            <td style="width: 10%"> ${u.maSP}</td>
            <td style="width: 20%"> ${u.tenSP}</td>
            <td style="width: 10%"> ${u.donGia}</td>
            <td style="width: 5%"> ${u.soLuong}</td>
            <td style="width: 10%"> ${u.soLuong * u.donGia}</td>
            <td style="width: 10%"> ${u.off ? "chưa hoàn thành" : "đã hoàn thành" } </td>
            <td style="width: 10%">
                <div class="tooltip" onclick="addKhungSuaPhieuNhap('`+u.maphieu+`')">
                    <i class="fa fa-remove"></i>
                    <span class="tooltiptext">Sửa</span>
                </div>
                <div class="tooltip" onclick="xoaPhieuNhap('`+u.maphieu+`')">
                    <i class="fa fa-remove" "></i>
                    <span class="tooltiptext">Xóa</span>
                </div>
            </td>
        </tr>`;
    }

    s += `</table>`;
    sp.innerHTML = s;
}
function xoaPhieuNhap(ma) {
    const q=getPhieuNhapList();
    if(q.some(u => u.maphieu===ma && !u.off)){
        alert('Đã hoàn thành không thể xóa');
        return;
    }   
    if(window.confirm('Xác nhận xóa '+ma+'? \nMọi dữ liệu về '+ma+' sẽ mất!')) {
        var list = getPhieuNhapList();
        for(var i = 0; i < list.length; i++) {
            if(list[i].maphieu == ma) {
                list.splice(i, 1); // xóa
                setPhieuNhapList(list); // lưu thay đổi
                addTablePhieuNhap(); // vẽ lại bảng khách hàng
                return;
            }
        }
    }
}
function doiTongTien(){
    const dongiainput=document.getElementById('dongiaphieu');
    const soluonginput=document.getElementById('soluongphieu');
    const tongtieninput=document.getElementById('tongtienphieu');

    const   dongia=dongiainput.value || 0;
    const soluong=soluonginput.value || 0;
    tongtieninput.value=dongia * soluong;
}
function layThongTinPhieuNhap(){
    const maphieuInput = document.getElementById('maphieu');
    const ngayInput = document.getElementById('ngayphieu');
    const maspInput = document.getElementById('maSPphieu');
    const tenspInput = document.getElementById('tenSPphieu');
    const dongiaInput = document.getElementById('dongiaphieu');
    const soluongInput = document.getElementById('soluongphieu');
    const hoanhthanhInput=document.getElementById('hoanthanh');
    var off=true;
    if(!maphieuInput || !ngayInput || !maspInput || !tenspInput || !dongiaInput || !soluongInput){
        alert('Lỗi: Các trường chưa tồn tại trong DOM!');
        return false;
    }

    if(hoanhthanhInput.checked){
        off=false;
    }
    const dongia = parseFloat(dongiaInput.value);
    const soluong = parseInt(soluongInput.value);

    return {
        "maphieu": maphieuInput.value,
        "ngay": ngayInput.value,
        "maSP": maspInput.value,
        "tenSP": tenspInput.value,
        "donGia": isNaN(dongia) ? 1000 : dongia,
        "soLuong": isNaN(soluong) ? 1 : soluong,
        "off": off,
    }
}

function suaPhieuNhap(ma){
    var sp = layThongTinPhieuNhap();
    //kiểm tra điều kiện
    var list=getPhieuNhapList();
    if(!sp) return;
    if(sp.off==false) luuNhapHang(sp.maSP,sp.soLuong);
    for(var p of list) {
        if(ma==p.maphieu && p.maphieu != ma) {
            alert('Mã phiếu bị trùng !!');
            return false;
            
        }
    }
    // Sửa
    var kt=false;
    for(var i = 0; i < list.length; i++) {
        //tìm vị trí 
        if(list[i].maphieu == ma) {
            //gán thong tin mới sửa
            list[i] = sp;
            kt=true;
            break;
        }
    }
    if(!kt) list.push(sp);

    // Lưu vào localstorage
    setPhieuNhapList(list);

    // Vẽ lại table
    addTablePhieuNhap();

    alert('Sửa phiếu nhập: ' + sp.maphieu + ' thành công');
    document.getElementById('khungSuaPhieuNhap').classList.remove('open');
    //document.getElementById('khungSuaSanPham').style.transform = 'scale(0)';
}
function addKhungSuaPhieuNhap(ma){
    var p;
    
    var list=getPhieuNhapList();
    for(var a of list){
        if(a.maphieu == ma){
            p=a;
            break;
        }
    }
    if(!p){
        alert('Không tìm thấy sản phẩm');
        return;
    }
    if(!p.off){
        alert('Đã hoàn thành không thể sửa');
        return;
    }
    var xuat=`<span class="close" onclick="this.parentElement.classList.remove('open');"><i class="ti-close"></i></span>
    <table class="overlayTable table-content table-header">
        <tr>
            <th colspan="2">Sửa Phiếu Nhập</th>
        </tr>
        <tr>
            <td>Mã phiếu nhập:</td>
            <td><input id="maphieu" type="text" value="${p.maphieu}"></td>
        </tr>
        <tr>
            <td>Ngày lập phiếu:</td>
            <td><input id="ngayphieu" type="date" value="${p.ngay}"></td>
        </tr>
        <tr>
            <td>Mã sản phẩm:</td>
            <td><input id="maSPphieu" type="text" value="${p.maSP}"></td>
        </tr>
        <tr>
            <td>Tên sản phẩm:</td>
            <td><input id="tenSPphieu" type="text" value="${p.tenSP}"></td>
        </tr>
        <tr>
            <td>Đơn giá:</td>
            <td><input id="dongiaphieu" type="number" value="${p.donGia}" min="1000"></td>
        </tr>
        <tr>
            <td>Số lượng:</td>
            <td><input id="soluongphieu" type="number" value="${p.soLuong}" min="1"></td>
        </tr>
        <tr>
            <td>Tổng tiền</td>
            <td><input id="tongtienphieu" type="number" value="0" readonly></input></td>
        </tr>
            <td colspan="2" class="table-footer"><button onclick="suaPhieuNhap('${p.maphieu}')">LƯU THAY ĐỔI</button> </td>
        </tr>
        <tr>
            <td colspan="2" class="table-footer">Hoàn thành<input id="hoanthanh" type="checkbox"></td>
        </tr>
        </table>`
    
    const khung=document.getElementById('khungSuaPhieuNhap');
    khung.innerHTML=xuat;
    khung.classList.add('open');
    
    const dongiainput=document.getElementById('dongiaphieu');
    const soluonginput=document.getElementById('soluongphieu');

    dongiainput.addEventListener('input',doiTongTien);
    soluonginput.addEventListener('input',doiTongTien);
    doiTongTien();
}
//log in admin
// TRONG FILE CHỨA HÀM showTaiKhoan()
function showTaiKhoan(show) {
    var value = (show ? "scale(1)" : "scale(0)");
    var div = document.getElementsByClassName('containTaikhoan')[0];

    // FIX: Thêm kiểm tra 'if (div)'
    if (div) { 
        div.style.transform = value;
    } else {
        // console.error("Không tìm thấy form tài khoản để hiển thị!");
    }
}  
function addTaiKhoan(){
    var s="";
    s+=`<div class="containTaikhoan">
    <div class="taikhoan">

            <ul class="tab-group">
            <li class="tab active"><a href="#login">Đăng nhập</a></li>
        </ul> <!-- /tab group -->

            <div class="tab-content">
                <div id="login">
                    <h1>Chào mừng bạn trở lại!</h1>
                        <div class="field-wrap">
                            <input id="tendangnhap" name='username' type="text" required  placeholder="Tên Đăng Nhập..."/>
                        </div> <!-- /user name -->
                        <div class="field-wrap">
                            <input id="matkhau" name="pass" type="password" required placeholder="Mật khẩu..." />
                        </div> <!-- pass -->                       
                        <p class="forgot"><a href="#">Quên mật khẩu?</a></p>

                        <button type="button" class="button button-block" onclick="signin()">Tiếp tục</button>
                    <div id="xuat"></div>
                </div> <!-- /log in -->

                <div id="signup">
                </div> <!-- /sign up -->
            </div><!-- tab-content -->

        </div> <!-- /taikhoan -->
    </div>`
    document.body.insertAdjacentHTML('beforeend', s);
}
function signin(){
    var ten = document.getElementById('tendangnhap').value;
     var mk = document.getElementById('matkhau').value;

     // Kiểm tra xem các trường có trống không
    if (!ten || !mk) {
        alert("Vui lòng nhập Tên đăng nhập và Mật khẩu.");
        return;
    }

     if(ten === "admin" && mk === "adadad"){
         showTaiKhoan(false);

     } else {
        // Đăng nhập thất bại: Báo lỗi cho người dùng
        document.getElementById('xuat').innerHTML = '<p style="color:red;">Tên đăng nhập hoặc Mật khẩu không đúng!</p>';
        
        // Hoặc dùng alert
        // alert("Tên đăng nhập hoặc Mật khẩu không đúng!"); 
    }
}























//hàm chuyển kiểu dữ liệu
function stringToNum(str,char){
    return Number(str.split(char || '.').join(''));
}
function numToString(num, char) {
    return num.toLocaleString().split(',').join(char || '.');
}

//mở các mục chính
function eventab(){

    const opensanpham=document.querySelector('.js-opensanpham');
    const khungsanpham=document.querySelector('.js-sanpham');

    const opendonhang=document.querySelector('.js-opendonhang');
    const khungdonhang=document.querySelector('.js-donhang');

    const openkhachhang=document.querySelector('.js-openkhachhang');
    const khungkhachhang=document.querySelector('.js-khachhang');

    const opentrangchu=document.querySelector('.js-opentrangchu');
    const khungtrangchu=document.querySelector('.js-trangchu');
    
    const opennhaphang=document.querySelector('.js-opennhaphang');
    const khungnhaphang=document.querySelector('.js-nhaphang');

    function showsanpham(){
        khungsanpham.classList.add('open');
        khungdonhang.classList.remove('open');
        khungkhachhang.classList.remove('open');
        khungtrangchu.classList.remove('open');
        khungnhaphang.classList.remove('open');
        opensanpham.classList.add('action');
        opentrangchu.classList.remove('action');
        openkhachhang.classList.remove('action');
        opendonhang.classList.remove('action');
        opennhaphang.classList.remove('action');
    }
    opensanpham.addEventListener('click',showsanpham);

    function showdonhang(){
        khungdonhang.classList.add('open');
        khungkhachhang.classList.remove('open');
        khungsanpham.classList.remove('open');
        khungtrangchu.classList.remove('open');
        khungnhaphang.classList.remove('open');
        opendonhang.classList.add('action');
        opentrangchu.classList.remove('action');
        openkhachhang.classList.remove('action');
        opensanpham.classList.remove('action');
        opennhaphang.classList.remove('action');
    }
    opendonhang.addEventListener('click',showdonhang);

    function showkhachhang(){
        khungkhachhang.classList.add('open');
        khungdonhang.classList.remove('open');
        khungsanpham.classList.remove('open');
        khungtrangchu.classList.remove('open');
        khungnhaphang.classList.remove('open');
        openkhachhang.classList.add('action');
        opentrangchu.classList.remove('action');
        opendonhang.classList.remove('action');
        opensanpham.classList.remove('action');
        opennhaphang.classList.remove('action');
    }
    openkhachhang.addEventListener('click',showkhachhang);
        
    
    function showtrangchu(){
        khungtrangchu.classList.add('open');
        khungdonhang.classList.remove('open');
        khungsanpham.classList.remove('open');
        khungkhachhang.classList.remove('open');
        khungnhaphang.classList.remove('open');
        opentrangchu.classList.add('action');
        openkhachhang.classList.remove('action');
        opendonhang.classList.remove('action');
        opensanpham.classList.remove('action');
        opennhaphang.classList.remove('action');
    }
    opentrangchu.addEventListener('click',showtrangchu);
    
    function shownhaphang(){
        khungnhaphang.classList.add('open');
        khungdonhang.classList.remove('open');
        khungsanpham.classList.remove('open');
        khungkhachhang.classList.remove('open');
        khungtrangchu.classList.remove('open');
        opennhaphang.classList.add('action');
        openkhachhang.classList.remove('action');
        opendonhang.classList.remove('action');
        opensanpham.classList.remove('action');
        opentrangchu.classList.remove('action');
    }
    opennhaphang.addEventListener('click',shownhaphang);

}  
    