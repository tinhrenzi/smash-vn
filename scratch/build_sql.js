const fs = require('fs');
const path = require('path');

const projectDir = 'C:\\Users\\NITRO 5\\Documents\\workspace-spring-tool-suite-4-4.27.0.RELEASE\\SMASH-VN_Shop-ban-vot-cau-long';
const uploadsDir = path.join(projectDir, 'uploads', 'product');
const ddlPath = path.join(projectDir, 'scratch', 'BadmintonShopDB-ban-ko-du-lieu.sql');
const outputPath = path.join(projectDir, 'scratch', 'BadmintonShopDB-du-lieu-day-du.sql');

let baseDdl = fs.readFileSync(ddlPath, 'utf8');

let sql = baseDdl.trim() + '\n\n';

sql += `-- =============================================================================
-- SEED DATA FOR BADMINTON SHOP
-- Generated on: 2026-08-05
-- =============================================================================

USE [BadmintonShopDB1]
GO

SET NOCOUNT ON;
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- 1. TaiKhoan (Mật khẩu mặc định: 123456 -> BCrypt)
INSERT INTO [dbo].[TaiKhoan] ([username],[mat_khau],[vai_tro],[trang_thai_tai_khoan],[so_lan_mua_thanh_cong],[so_lan_nhac_nho_vi_pham],[ngay_tao]) VALUES
(N'admin', N'$2a$10$Z9VSbcL8RWNqcDTKi1cRO.QVey7xEfRfGDHu0rW82wcZ3dnTzOX96', N'QL', N'ACTIVE', 0, 0, GETDATE()),
(N'nhanvien1@smashvn.com', N'$2a$10$Z9VSbcL8RWNqcDTKi1cRO.QVey7xEfRfGDHu0rW82wcZ3dnTzOX96', N'NV', N'ACTIVE', 0, 0, GETDATE()),
(N'khachhang1@gmail.com', N'$2a$10$Z9VSbcL8RWNqcDTKi1cRO.QVey7xEfRfGDHu0rW82wcZ3dnTzOX96', N'KH', N'ACTIVE', 5, 0, GETDATE()),
(N'khachhang2@gmail.com', N'$2a$10$Z9VSbcL8RWNqcDTKi1cRO.QVey7xEfRfGDHu0rW82wcZ3dnTzOX96', N'KH', N'ACTIVE', 2, 0, GETDATE()),
(N'khachhang3@gmail.com', N'$2a$10$Z9VSbcL8RWNqcDTKi1cRO.QVey7xEfRfGDHu0rW82wcZ3dnTzOX96', N'KH', N'ACTIVE', 0, 0, GETDATE());
GO

-- 2. NhanVien
INSERT INTO [dbo].[NhanVien] ([id_tai_khoan],[ho_ten],[chuc_vu],[so_dien_thoai_nv],[ngay_tao]) VALUES
(1, N'Nguyễn Văn Quản Lý', N'Quản lý cửa hàng', N'0901234567', GETDATE()),
(2, N'Trần Thị Nhân Viên', N'Nhân viên bán hàng', N'0912345678', GETDATE());
GO

-- 3. KhachHang
INSERT INTO [dbo].[KhachHang] ([id_tai_khoan],[ho_ten_kh],[so_dien_thoai_kh],[ngay_tao]) VALUES
(3, N'Lê Văn Khách', N'0923456789', GETDATE()),
(4, N'Phạm Thị Hương', N'0934567890', GETDATE()),
(5, N'Nguyễn Minh Tuấn', N'0945678901', GETDATE());
GO

-- 4. DanhMuc
-- 1: Vợt cầu lông, 2: Giày cầu lông, 3: Áo cầu lông, 4: Quần cầu lông, 5: Balo cầu lông, 6: Túi cầu lông, 7: Dây cước, 8: Quấn cán
INSERT INTO [dbo].[DanhMuc] ([ten_danh_muc],[trang_thai]) VALUES
(N'Vợt cầu lông', 1),
(N'Giày cầu lông', 1),
(N'Áo cầu lông', 1),
(N'Quần cầu lông', 1),
(N'Balo cầu lông', 1),
(N'Túi cầu lông', 1),
(N'Dây cước', 1),
(N'Quấn cán', 1);
GO

-- 5. ThuongHieu
-- 1: Yonex, 2: Li-Ning, 3: Victor, 4: Mizuno, 5: GOSEN, 6: Kizuna
INSERT INTO [dbo].[ThuongHieu] ([ten_thuong_hieu],[logo],[trang_thai]) VALUES
(N'Yonex', NULL, 1),
(N'Li-Ning', NULL, 1),
(N'Victor', NULL, 1),
(N'Mizuno', NULL, 1),
(N'GOSEN', NULL, 1),
(N'Kizuna', NULL, 1);
GO

-- 6. ThuocTinh
-- 1: Màu sắc, 2: Độ cứng, 3: Trọng lượng, 4: Điểm cân bằng, 5: Loại người chơi, 6: Kích thước, 7: Sức căng
INSERT INTO [dbo].[ThuocTinh] ([ten_thuoc_tinh],[trang_thai]) VALUES
(N'Màu sắc', 1),
(N'Độ cứng', 1),
(N'Trọng lượng', 1),
(N'Điểm cân bằng', 1),
(N'Loại người chơi', 1),
(N'Kích thước', 1),
(N'Sức căng', 1);
GO

-- 7. DanhMucThuocTinh
-- Vợt (1): Màu sắc, Độ cứng, Trọng lượng, Điểm cân bằng, Loại người chơi, Sức căng
-- Giày (2): Màu sắc, Kích thước
-- Áo (3): Màu sắc, Kích thước
-- Quần (4): Màu sắc, Kích thước
-- Balo (5), Túi (6), Cước (7), Quấn cán (8): Màu sắc
INSERT INTO [dbo].[DanhMucThuocTinh] ([id_danh_muc],[id_thuoc_tinh],[trang_thai]) VALUES
(1,1,1), (1,2,1), (1,3,1), (1,4,1), (1,5,1), (1,7,1),
(2,1,1), (2,6,1),
(3,1,1), (3,6,1),
(4,1,1), (4,6,1),
(5,1,1),
(6,1,1),
(7,1,1),
(8,1,1);
GO

-- 8. PhuongThucThanhToan
INSERT INTO [dbo].[PhuongThucThanhToan] ([ma_phuong_thuc],[ten_phuong_thuc]) VALUES
(N'COD', N'Thanh toán khi nhận hàng'),
(N'VNPAY', N'VNPay'),
(N'MOMO', N'Ví MoMo');
GO

-- 9. DonViVanChuyen
INSERT INTO [dbo].[DonViVanChuyen] ([ma_don_vi],[ten_don_vi],[so_hotline],[web_url],[phi_noi_dia],[phi_toan_quoc]) VALUES
(N'GHN', N'Giao Hàng Nhanh', N'1900636677', N'https://ghn.vn', 25000, 35000);
GO

-- 10. TrangThaiGioHang
INSERT INTO [dbo].[TrangThaiGioHang] ([ten_trang_thai]) VALUES (N'Đang chờ'), (N'Đã chọn');
GO

`;

const brandMap = {
  'Yonex': 1,
  'Li-Ning': 2,
  'Victor': 3,
  'Mizuno': 4,
  'GOSEN': 5,
  'Kizuna': 6
};

function detectBrand(prodName, defaultBrandId = 1) {
  const lower = prodName.toLowerCase();
  if (lower.includes('lining') || lower.includes('li-ning')) return 2;
  if (lower.includes('yonex')) return 1;
  if (lower.includes('victor')) return 3;
  if (lower.includes('mizuno')) return 4;
  if (lower.includes('gosen')) return 5;
  if (lower.includes('kizuna')) return 6;
  return defaultBrandId;
}

let sanPhamIdCounter = 1;
let sanPhamChiTietIdCounter = 1;

let sqlSanPham = '-- 11. SanPham\n';
let sqlSPCT = '-- 12. SanPhamChiTiet\n';
let sqlSPCTTT = '-- 13. SanPhamChiTietThuocTinh\n';
let sqlHinhAnh = '-- 14. HinhAnhSanPham\n';

function escapeSql(str) {
  return str ? str.replace(/'/g, "''") : '';
}

function processProductDir(catName, categoryId, brandId, prodDirName, fullProdPath, relativePrefix) {
  const spId = sanPhamIdCounter++;
  const prodName = prodDirName;
  const moTa = 'Sản phẩm ' + prodName + ' chính hãng chất lượng cao, nhập khẩu phân phối trực tiếp bởi SMASH-VN.';

  sqlSanPham += `INSERT INTO [dbo].[SanPham] ([id_danh_muc],[id_thuong_hieu],[id_nhan_vien],[ten_san_pham],[mo_ta],[trang_thai],[so_luot_danh_gia],[diem_trung_binh],[ngay_tao]) VALUES (${categoryId}, ${brandId}, 1, N'${escapeSql(prodName)}', N'${escapeSql(moTa)}', 1, 0, 0.0, GETDATE());\n`;

  const files = fs.readdirSync(fullProdPath);
  const subDirs = files.filter(f => fs.statSync(path.join(fullProdPath, f)).isDirectory());
  const imgFiles = files.filter(f => !fs.statSync(path.join(fullProdPath, f)).isDirectory() && /\.(png|jpe?g|webp)$/i.test(f));

  // Clean relative prefix for images (relative to /uploads/product/)
  let cleanRelPrefix = relativePrefix.replace(/^\/uploads\/product\/?/, '').replace(/\\/g, '/');

  if (subDirs.length > 0) {
    subDirs.forEach((sub) => {
      const colorName = sub;

      if (categoryId === 2) { // Giày with color subdirs -> generate sizes 39, 40, 41, 42
        const shoeSizes = ['39', '40', '41', '42'];
        shoeSizes.forEach((sz, szIdx) => {
          const spctId = sanPhamChiTietIdCounter++;
          sqlSPCT += `INSERT INTO [dbo].[SanPhamChiTiet] ([id_san_pham],[gia_nhap],[gia_ban],[so_luong_ton],[trang_thai],[ngay_tao]) VALUES (${spId}, 1500000, 2100000, 15, 1, GETDATE()); -- spct_${spctId}\n`;
          sqlSPCTTT += `INSERT INTO [dbo].[SanPhamChiTietThuocTinh] ([id_san_pham_chi_tiet],[id_thuoc_tinh],[gia_tri]) VALUES (${spctId}, 1, N'${escapeSql(colorName)}'), (${spctId}, 6, N'${sz}');\n`;

          const subDirPath = path.join(fullProdPath, sub);
          const subImgs = fs.readdirSync(subDirPath).filter(f => /\.(png|jpe?g|webp)$/i.test(f));
          if (szIdx === 0 && subImgs.length > 0) {
            subImgs.forEach((img, imgIdx) => {
              const relUrl = (cleanRelPrefix + '/' + prodDirName + '/' + sub + '/' + img).replace(/\\/g, '/');
              sqlHinhAnh += `INSERT INTO [dbo].[HinhAnhSanPham] ([id_san_pham_chi_tiet],[url_hinh_anh],[mau_sac],[la_anh_chinh],[thu_tu]) VALUES (${spctId}, N'${escapeSql(relUrl)}', N'${escapeSql(colorName)}', ${imgIdx === 0 ? 1 : 0}, ${imgIdx + 1});\n`;
            });
          }
        });
      } else {
        const spctId = sanPhamChiTietIdCounter++;
        const giaNhap = categoryId === 1 ? 2500000 : 200000;
        const giaBan = categoryId === 1 ? 3200000 : 350000;

        sqlSPCT += `INSERT INTO [dbo].[SanPhamChiTiet] ([id_san_pham],[gia_nhap],[gia_ban],[so_luong_ton],[trang_thai],[ngay_tao]) VALUES (${spId}, ${giaNhap}, ${giaBan}, 20, 1, GETDATE()); -- spct_${spctId}\n`;

        if (categoryId === 1) { // Vợt
          sqlSPCTTT += `INSERT INTO [dbo].[SanPhamChiTietThuocTinh] ([id_san_pham_chi_tiet],[id_thuoc_tinh],[gia_tri]) VALUES (${spctId}, 1, N'${escapeSql(colorName)}'), (${spctId}, 2, N'Cứng vừa (Stiff)'), (${spctId}, 3, N'4U'), (${spctId}, 4, N'Trung bình'), (${spctId}, 5, N'Toàn diện'), (${spctId}, 7, N'20 - 28 lbs');\n`;
        } else if (categoryId === 3 || categoryId === 4) { // Áo / Quần
          sqlSPCTTT += `INSERT INTO [dbo].[SanPhamChiTietThuocTinh] ([id_san_pham_chi_tiet],[id_thuoc_tinh],[gia_tri]) VALUES (${spctId}, 1, N'${escapeSql(colorName)}'), (${spctId}, 6, N'M');\n`;
        } else {
          sqlSPCTTT += `INSERT INTO [dbo].[SanPhamChiTietThuocTinh] ([id_san_pham_chi_tiet],[id_thuoc_tinh],[gia_tri]) VALUES (${spctId}, 1, N'${escapeSql(colorName)}');\n`;
        }

        const subDirPath = path.join(fullProdPath, sub);
        const subImgs = fs.readdirSync(subDirPath).filter(f => /\.(png|jpe?g|webp)$/i.test(f));
        subImgs.forEach((img, imgIdx) => {
          const relUrl = (cleanRelPrefix + '/' + prodDirName + '/' + sub + '/' + img).replace(/\\/g, '/');
          sqlHinhAnh += `INSERT INTO [dbo].[HinhAnhSanPham] ([id_san_pham_chi_tiet],[url_hinh_anh],[mau_sac],[la_anh_chinh],[thu_tu]) VALUES (${spctId}, N'${escapeSql(relUrl)}', N'${escapeSql(colorName)}', ${imgIdx === 0 ? 1 : 0}, ${imgIdx + 1});\n`;
        });
      }
    });
  } else {
    if (categoryId === 2) { // Giày -> generate Size 39, 40, 41, 42
      const shoeSizes = ['39', '40', '41', '42'];
      const defaultColor = prodDirName.includes('-') ? prodDirName.split('-').pop().trim() : 'Màu mặc định';

      shoeSizes.forEach((sz, szIdx) => {
        const spctId = sanPhamChiTietIdCounter++;
        sqlSPCT += `INSERT INTO [dbo].[SanPhamChiTiet] ([id_san_pham],[gia_nhap],[gia_ban],[so_luong_ton],[trang_thai],[ngay_tao]) VALUES (${spId}, 1500000, 2100000, 20, 1, GETDATE()); -- spct_${spctId}\n`;
        sqlSPCTTT += `INSERT INTO [dbo].[SanPhamChiTietThuocTinh] ([id_san_pham_chi_tiet],[id_thuoc_tinh],[gia_tri]) VALUES (${spctId}, 1, N'${escapeSql(defaultColor)}'), (${spctId}, 6, N'${sz}');\n`;

        if (szIdx === 0 && imgFiles.length > 0) {
          imgFiles.forEach((img, imgIdx) => {
            const relUrl = (cleanRelPrefix + '/' + prodDirName + '/' + img).replace(/\\/g, '/');
            sqlHinhAnh += `INSERT INTO [dbo].[HinhAnhSanPham] ([id_san_pham_chi_tiet],[url_hinh_anh],[mau_sac],[la_anh_chinh],[thu_tu]) VALUES (${spctId}, N'${escapeSql(relUrl)}', N'${escapeSql(defaultColor)}', ${imgIdx === 0 ? 1 : 0}, ${imgIdx + 1});\n`;
          });
        }
      });
    } else if (categoryId === 3 || categoryId === 4) { // Clothing S, M, L, XL
      const sizes = ['S', 'M', 'L', 'XL'];
      const defaultColor = prodDirName.includes('-') ? prodDirName.split('-').pop().trim() : 'Màu mặc định';
      
      sizes.forEach((sz, szIdx) => {
        const spctId = sanPhamChiTietIdCounter++;
        sqlSPCT += `INSERT INTO [dbo].[SanPhamChiTiet] ([id_san_pham],[gia_nhap],[gia_ban],[so_luong_ton],[trang_thai],[ngay_tao]) VALUES (${spId}, 200000, 320000, 25, 1, GETDATE()); -- spct_${spctId}\n`;
        sqlSPCTTT += `INSERT INTO [dbo].[SanPhamChiTietThuocTinh] ([id_san_pham_chi_tiet],[id_thuoc_tinh],[gia_tri]) VALUES (${spctId}, 1, N'${escapeSql(defaultColor)}'), (${spctId}, 6, N'${sz}');\n`;

        if (szIdx === 0 && imgFiles.length > 0) {
          imgFiles.forEach((img, imgIdx) => {
            const relUrl = (cleanRelPrefix + '/' + prodDirName + '/' + img).replace(/\\/g, '/');
            sqlHinhAnh += `INSERT INTO [dbo].[HinhAnhSanPham] ([id_san_pham_chi_tiet],[url_hinh_anh],[mau_sac],[la_anh_chinh],[thu_tu]) VALUES (${spctId}, N'${escapeSql(relUrl)}', N'${escapeSql(defaultColor)}', ${imgIdx === 0 ? 1 : 0}, ${imgIdx + 1});\n`;
          });
        }
      });
    } else {
      const spctId = sanPhamChiTietIdCounter++;
      const giaNhap = categoryId === 1 ? 2500000 : (categoryId === 7 || categoryId === 8 ? 80000 : 500000);
      const giaBan = categoryId === 1 ? 3200000 : (categoryId === 7 || categoryId === 8 ? 150000 : 790000);
      const defaultColor = prodDirName.includes('-') ? prodDirName.split('-').pop().trim() : 'Màu mặc định';

      sqlSPCT += `INSERT INTO [dbo].[SanPhamChiTiet] ([id_san_pham],[gia_nhap],[gia_ban],[so_luong_ton],[trang_thai],[ngay_tao]) VALUES (${spId}, ${giaNhap}, ${giaBan}, 30, 1, GETDATE()); -- spct_${spctId}\n`;

      if (categoryId === 1) { // Vợt (attributes)
        sqlSPCTTT += `INSERT INTO [dbo].[SanPhamChiTietThuocTinh] ([id_san_pham_chi_tiet],[id_thuoc_tinh],[gia_tri]) VALUES (${spctId}, 1, N'${escapeSql(defaultColor)}'), (${spctId}, 2, N'Cứng (Stiff)'), (${spctId}, 3, N'4U'), (${spctId}, 4, N'Đầu nặng'), (${spctId}, 5, N'Tấn công'), (${spctId}, 7, N'20 - 28 lbs');\n`;
      } else { // Other
        sqlSPCTTT += `INSERT INTO [dbo].[SanPhamChiTietThuocTinh] ([id_san_pham_chi_tiet],[id_thuoc_tinh],[gia_tri]) VALUES (${spctId}, 1, N'${escapeSql(defaultColor)}');\n`;
      }

      if (imgFiles.length > 0) {
        imgFiles.forEach((img, imgIdx) => {
          const relUrl = (cleanRelPrefix + '/' + prodDirName + '/' + img).replace(/\\/g, '/');
          sqlHinhAnh += `INSERT INTO [dbo].[HinhAnhSanPham] ([id_san_pham_chi_tiet],[url_hinh_anh],[mau_sac],[la_anh_chinh],[thu_tu]) VALUES (${spctId}, N'${escapeSql(relUrl)}', N'${escapeSql(defaultColor)}', ${imgIdx === 0 ? 1 : 0}, ${imgIdx + 1});\n`;
        });
      }
    }
  }
}

// 1. Process Vợt cầu lông
const votDir = path.join(uploadsDir, 'Vợt cầu lông');
if (fs.existsSync(votDir)) {
  const brands = fs.readdirSync(votDir);
  brands.forEach(b => {
    const bDir = path.join(votDir, b);
    if (fs.statSync(bDir).isDirectory()) {
      const bId = brandMap[b] || detectBrand(b, 1);
      const prods = fs.readdirSync(bDir);
      prods.forEach(p => {
        const pDir = path.join(bDir, p);
        if (fs.statSync(pDir).isDirectory()) {
          processProductDir('Vợt cầu lông', 1, bId, p, pDir, '/uploads/product/Vợt cầu lông/' + b);
        }
      });
    }
  });
}

// 2. Process other categories
const catFolderMap = [
  { name: 'Giày', catId: 2, subPath: 'Giày' },
  { name: 'Áo', catId: 3, subPath: 'Áo' },
  { name: 'Quần', catId: 4, subPath: 'Quần' },
  { name: 'Balo', catId: 5, subPath: 'Balo' },
  { name: 'Túi Xách', catId: 6, subPath: 'Túi Xách' },
  { name: 'Cước', catId: 7, subPath: 'Cước' },
  { name: 'Quấn cán', catId: 8, subPath: 'Quấn cán' }
];

catFolderMap.forEach(item => {
  const cDir = path.join(uploadsDir, item.subPath);
  if (fs.existsSync(cDir)) {
    const prods = fs.readdirSync(cDir);
    prods.forEach(p => {
      const pDir = path.join(cDir, p);
      if (fs.statSync(pDir).isDirectory()) {
        const bId = detectBrand(p, 1);
        processProductDir(item.name, item.catId, bId, p, pDir, '/uploads/product/' + item.subPath);
      }
    });
  }
});

sql += sqlSanPham + '\nGO\n\n' + sqlSPCT + '\nGO\n\n' + sqlSPCTTT + '\nGO\n\n' + sqlHinhAnh + '\nGO\n\n';

sql += `
-- 15. GioHang
INSERT INTO [dbo].[GioHang] ([id_khach_hang],[ngay_tao]) VALUES (1, GETDATE()), (2, GETDATE()), (3, GETDATE());
GO

PRINT N'=== THÀNH CÔNG: DỮ LIỆU CƠ SỞ DỮ LIỆU ĐÃ ĐƯỢC CHÈN HOÀN CHỈNH ===';
GO
`;

fs.writeFileSync(outputPath, sql, 'utf8');
console.log('Complete database script successfully created at:', outputPath);
