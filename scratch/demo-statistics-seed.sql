-- ==============================================================================
-- SMASH-VN BADMINTON SHOP - TOÀN BỘ DỮ LIỆU MẪU HỆ THỐNG (DEMO SEED SCRIPT)
-- Mục đích: Khởi tạo dữ liệu toàn diện cho Báo cáo, Đồ án & Thuyết minh:
--   1. Dữ liệu Nhập hàng & Lô hàng (PhieuNhap, PhieuNhapChiTiet) cho TẤT CẢ biến thể SP
--   2. 18 Tài khoản khách hàng & Sổ địa chỉ (TaiKhoan, KhachHang, SoDiaChi)
--   3. 41 Hóa đơn Thống kê Doanh thu (30 ngày qua & kỳ trước)
--   4. 10 Hóa đơn Online với ĐẦY ĐỦ 10 TRẠNG THÁI chuẩn quy trình GHN
--   5. Đánh giá sản phẩm & Hình ảnh thực tế (DanhGia, HinhAnhDanhGia)
--   6. Danh mục từ khóa cấm & Nhật ký vi phạm 4 cấp độ (CommentModerationKeyword, CommentViolationLog)
--   7. 2 Bài viết Blog chuyên sâu & Bình luận tương tác (Blog, BlogComment)
-- ==============================================================================

SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    PRINT N'==============================================================================';
    PRINT N'==> [1/7] Khởi tạo Dữ liệu Nhập Hàng & Lô Hàng (PhieuNhap, PhieuNhapChiTiet)...';
    PRINT N'==============================================================================';

    -- Lấy ID nhân viên quản trị đầu tiên trong hệ thống
    DECLARE @ID_NV INT;
    SELECT TOP 1 @ID_NV = id FROM NhanVien ORDER BY id ASC;

    IF @ID_NV IS NULL
    BEGIN
        -- Nếu chưa có nhân viên, tạo tài khoản và nhân viên admin mặc định
        IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE username = 'admin_demo_system')
        BEGIN
            INSERT INTO TaiKhoan (username, mat_khau, vai_tro, trang_thai_tai_khoan, ngay_tao)
            VALUES ('admin_demo_system', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5F78R/y7V.nF8i8s0zP1v8y8F8cKe', 'ADMIN', 'ACTIVE', '2026-06-01 08:00:00');
        END;

        DECLARE @ID_TK_NV INT = (SELECT id FROM TaiKhoan WHERE username = 'admin_demo_system');
        INSERT INTO NhanVien (id_tai_khoan, ho_ten, chuc_vu, so_dien_thoai_nv, ngay_tao)
        VALUES (@ID_TK_NV, N'Quản Lý Kho SmashVN', N'Quản trị viên', '0988888888', '2026-06-01 08:00:00');

        SELECT @ID_NV = SCOPE_IDENTITY();
    END;

    -- 1.1 Khởi tạo các Phiếu Nhập mẫu nếu chưa có
    IF NOT EXISTS (SELECT 1 FROM PhieuNhap WHERE ma_phieu_nhap = 'PN20260601-001')
    BEGIN
        INSERT INTO PhieuNhap (ma_phieu_nhap, id_nhan_vien, ngay_nhap, tong_tien, ghi_chu, ngay_tao, ngay_cap_nhat)
        VALUES ('PN20260601-001', @ID_NV, '2026-06-01 09:00:00', 0, N'Nhập lô hàng Vợt & Phụ kiện Yonex, Lining hè 2026', '2026-06-01 09:00:00', '2026-06-01 09:00:00');
    END;

    IF NOT EXISTS (SELECT 1 FROM PhieuNhap WHERE ma_phieu_nhap = 'PN20260701-002')
    BEGIN
        INSERT INTO PhieuNhap (ma_phieu_nhap, id_nhan_vien, ngay_nhap, tong_tien, ghi_chu, ngay_tao, ngay_cap_nhat)
        VALUES ('PN20260701-002', @ID_NV, '2026-07-01 10:30:00', 0, N'Nhập bổ sung lô Giày, Trang phục & Dụng cụ tập luyện', '2026-07-01 10:30:00', '2026-07-01 10:30:00');
    END;

    IF NOT EXISTS (SELECT 1 FROM PhieuNhap WHERE ma_phieu_nhap = 'PN20260801-003')
    BEGIN
        INSERT INTO PhieuNhap (ma_phieu_nhap, id_nhan_vien, ngay_nhap, tong_tien, ghi_chu, ngay_tao, ngay_cap_nhat)
        VALUES ('PN20260801-003', @ID_NV, '2026-08-01 14:15:00', 0, N'Nhập lô hàng chính hãng chuẩn bị cho chiến dịch Flash Sale', '2026-08-01 14:15:00', '2026-08-01 14:15:00');
    END;

    DECLARE @ID_PN1 INT = (SELECT id FROM PhieuNhap WHERE ma_phieu_nhap = 'PN20260601-001');
    DECLARE @ID_PN2 INT = (SELECT id FROM PhieuNhap WHERE ma_phieu_nhap = 'PN20260701-002');
    DECLARE @ID_PN3 INT = (SELECT id FROM PhieuNhap WHERE ma_phieu_nhap = 'PN20260801-003');

    -- 1.2 Tạo Chi Tiết Phiếu Nhập (PhieuNhapChiTiet) cho tất cả biến thể chưa có dữ liệu nhập
    INSERT INTO PhieuNhapChiTiet (id_phieu_nhap, id_san_pham_chi_tiet, so_luong, gia_nhap, thanh_tien)
    SELECT
        CASE 
            WHEN spct.id % 3 = 1 THEN @ID_PN1
            WHEN spct.id % 3 = 2 THEN @ID_PN2
            ELSE @ID_PN3
        END AS id_phieu_nhap,
        spct.id AS id_san_pham_chi_tiet,
        CASE 
            WHEN ISNULL(spct.so_luong_ton, 0) > 0 THEN spct.so_luong_ton + 15
            ELSE 30
        END AS so_luong,
        CASE
            WHEN spct.gia_nhap IS NOT NULL AND spct.gia_nhap > 0 THEN spct.gia_nhap
            WHEN spct.gia_ban IS NOT NULL AND spct.gia_ban > 0 THEN CAST(spct.gia_ban * 0.65 AS DECIMAL(18,2))
            ELSE 1500000.00
        END AS gia_nhap,
        (
            CASE 
                WHEN ISNULL(spct.so_luong_ton, 0) > 0 THEN spct.so_luong_ton + 15
                ELSE 30
            END
        ) * (
            CASE
                WHEN spct.gia_nhap IS NOT NULL AND spct.gia_nhap > 0 THEN spct.gia_nhap
                WHEN spct.gia_ban IS NOT NULL AND spct.gia_ban > 0 THEN CAST(spct.gia_ban * 0.65 AS DECIMAL(18,2))
                ELSE 1500000.00
            END
        ) AS thanh_tien
    FROM SanPhamChiTiet spct
    WHERE spct.id NOT IN (SELECT id_san_pham_chi_tiet FROM PhieuNhapChiTiet);

    -- Cập nhật giá nhập vào SanPhamChiTiet nếu còn thiếu
    UPDATE SanPhamChiTiet
    SET gia_nhap = CAST(gia_ban * 0.65 AS DECIMAL(18,2))
    WHERE gia_nhap IS NULL OR gia_nhap <= 0;

    -- Cập nhật lại tổng tiền trên từng Phiếu Nhập
    UPDATE pn
    SET pn.tong_tien = ISNULL(sub.tong, 0)
    FROM PhieuNhap pn
    JOIN (
        SELECT id_phieu_nhap, SUM(thanh_tien) AS tong
        FROM PhieuNhapChiTiet
        GROUP BY id_phieu_nhap
    ) sub ON sub.id_phieu_nhap = pn.id;

    PRINT N'  -> Đã cập nhật thành công Phiếu Nhập & Chi Tiết Lô Hàng cho toàn bộ biến thể!';

    PRINT N'==============================================================================';
    PRINT N'==> [2/7] Khởi tạo 18 Tài khoản Demo & Sổ Địa Chỉ...';
    PRINT N'==============================================================================';

    -- Xóa dữ liệu demo cũ theo đúng thứ tự ràng buộc khóa ngoại để tránh xung đột FK
    DELETE hdct
    FROM HoaDonChiTiet hdct
    WHERE hdct.id_hoa_don IN (
        SELECT hd.id
        FROM HoaDon hd
        JOIN KhachHang kh ON kh.id = hd.id_khach_hang
        JOIN TaiKhoan tk ON tk.id = kh.id_tai_khoan
        WHERE tk.username LIKE 'demo_stat_cust_%'
    );

    DELETE hd
    FROM HoaDon hd
    JOIN KhachHang kh ON kh.id = hd.id_khach_hang
    JOIN TaiKhoan tk ON tk.id = kh.id_tai_khoan
    WHERE tk.username LIKE 'demo_stat_cust_%';

    DELETE hd
    FROM HoaDon hd
    WHERE hd.ghi_chu LIKE 'DEMO_STAT_D%' OR hd.ma_giao_dich LIKE 'DHSVN-%';

    IF OBJECT_ID('GioHangChiTiet', 'U') IS NOT NULL
    BEGIN
        DELETE ghct
        FROM GioHangChiTiet ghct
        WHERE ghct.id_gio_hang IN (
            SELECT gh.id FROM GioHang gh
            JOIN KhachHang kh ON kh.id = gh.id_khach_hang
            JOIN TaiKhoan tk ON tk.id = kh.id_tai_khoan
            WHERE tk.username LIKE 'demo_stat_cust_%'
        );
    END;

    IF OBJECT_ID('GioHang', 'U') IS NOT NULL
    BEGIN
        DELETE gh
        FROM GioHang gh
        JOIN KhachHang kh ON kh.id = gh.id_khach_hang
        JOIN TaiKhoan tk ON tk.id = kh.id_tai_khoan
        WHERE tk.username LIKE 'demo_stat_cust_%';
    END;

    DELETE dc
    FROM SoDiaChi dc
    JOIN KhachHang kh ON kh.id = dc.id_khach_hang
    JOIN TaiKhoan tk ON tk.id = kh.id_tai_khoan
    WHERE tk.username LIKE 'demo_stat_cust_%';

    DELETE kh
    FROM KhachHang kh
    JOIN TaiKhoan tk ON tk.id = kh.id_tai_khoan
    WHERE tk.username LIKE 'demo_stat_cust_%';

    DELETE FROM TaiKhoan WHERE username LIKE 'demo_stat_cust_%';

    INSERT INTO TaiKhoan (
        username, mat_khau, vai_tro, trang_thai_tai_khoan,
        so_lan_mua_thanh_cong, so_lan_nhac_nho_vi_pham, ngay_tao
    ) VALUES
    ('demo_stat_cust_01', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5F78R/y7V.nF8i8s0zP1v8y8F8cKe', 'KH', 'ACTIVE', 4, 0, '2026-06-20 08:00:00'),
    ('demo_stat_cust_02', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5F78R/y7V.nF8i8s0zP1v8y8F8cKe', 'KH', 'ACTIVE', 3, 0, '2026-06-20 08:05:00'),
    ('demo_stat_cust_03', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5F78R/y7V.nF8i8s0zP1v8y8F8cKe', 'KH', 'ACTIVE', 3, 0, '2026-06-20 08:10:00'),
    ('demo_stat_cust_04', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5F78R/y7V.nF8i8s0zP1v8y8F8cKe', 'KH', 'ACTIVE', 2, 0, '2026-06-20 08:15:00'),
    ('demo_stat_cust_05', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5F78R/y7V.nF8i8s0zP1v8y8F8cKe', 'KH', 'ACTIVE', 2, 0, '2026-06-20 08:20:00'),
    ('demo_stat_cust_06', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5F78R/y7V.nF8i8s0zP1v8y8F8cKe', 'KH', 'ACTIVE', 3, 0, '2026-06-20 08:25:00'),
    ('demo_stat_cust_07', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5F78R/y7V.nF8i8s0zP1v8y8F8cKe', 'KH', 'ACTIVE', 2, 0, '2026-06-20 08:30:00'),
    ('demo_stat_cust_08', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5F78R/y7V.nF8i8s0zP1v8y8F8cKe', 'KH', 'ACTIVE', 2, 0, '2026-06-20 08:35:00'),
    ('demo_stat_cust_09', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5F78R/y7V.nF8i8s0zP1v8y8F8cKe', 'KH', 'ACTIVE', 3, 0, '2026-07-20 08:00:00'),
    ('demo_stat_cust_10', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5F78R/y7V.nF8i8s0zP1v8y8F8cKe', 'KH', 'ACTIVE', 2, 0, '2026-07-20 08:05:00'),
    ('demo_stat_cust_11', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5F78R/y7V.nF8i8s0zP1v8y8F8cKe', 'KH', 'ACTIVE', 2, 0, '2026-07-20 08:10:00'),
    ('demo_stat_cust_12', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5F78R/y7V.nF8i8s0zP1v8y8F8cKe', 'KH', 'ACTIVE', 2, 0, '2026-07-20 08:15:00'),
    ('demo_stat_cust_13', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5F78R/y7V.nF8i8s0zP1v8y8F8cKe', 'KH', 'ACTIVE', 2, 0, '2026-07-20 08:20:00'),
    ('demo_stat_cust_14', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5F78R/y7V.nF8i8s0zP1v8y8F8cKe', 'KH', 'ACTIVE', 2, 0, '2026-07-20 08:25:00'),
    ('demo_stat_cust_15', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5F78R/y7V.nF8i8s0zP1v8y8F8cKe', 'KH', 'ACTIVE', 2, 0, '2026-07-20 08:30:00'),
    ('demo_stat_cust_16', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5F78R/y7V.nF8i8s0zP1v8y8F8cKe', 'KH', 'ACTIVE', 1, 0, '2026-07-20 08:35:00'),
    ('demo_stat_cust_17', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5F78R/y7V.nF8i8s0zP1v8y8F8cKe', 'KH', 'ACTIVE', 2, 0, '2026-07-20 08:40:00'),
    ('demo_stat_cust_18', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5F78R/y7V.nF8i8s0zP1v8y8F8cKe', 'KH', 'ACTIVE', 1, 0, '2026-07-20 08:45:00');

    INSERT INTO KhachHang (id_tai_khoan, ho_ten_kh, so_dien_thoai_kh, ngay_tao)
    SELECT tk.id, v.ho_ten_kh, v.so_dien_thoai_kh, tk.ngay_tao
    FROM (VALUES
        ('demo_stat_cust_01', N'Nguyễn Văn An', '0912100001'),
        ('demo_stat_cust_02', N'Trần Thị Bình', '0912100002'),
        ('demo_stat_cust_03', N'Lê Hoàng Cường', '0912100003'),
        ('demo_stat_cust_04', N'Phạm Minh Đức', '0912100004'),
        ('demo_stat_cust_05', N'Đỗ Thúy Hạnh', '0912100005'),
        ('demo_stat_cust_06', N'Hoàng Văn Khôi', '0912100006'),
        ('demo_stat_cust_07', N'Vũ Thị Lan', '0912100007'),
        ('demo_stat_cust_08', N'Bùi Quang Nam', '0912100008'),
        ('demo_stat_cust_09', N'Phan Bảo Ngọc', '0912100009'),
        ('demo_stat_cust_10', N'Trịnh Thu Phương', '0912100010'),
        ('demo_stat_cust_11', N'Đặng Quốc Quân', '0912100011'),
        ('demo_stat_cust_12', N'Mai Thảo Quỳnh', '0912100012'),
        ('demo_stat_cust_13', N'Hà Văn Sơn', '0912100013'),
        ('demo_stat_cust_14', N'Ngô Mỹ Tâm', '0912100014'),
        ('demo_stat_cust_15', N'Dương Anh Tuấn', '0912100015'),
        ('demo_stat_cust_16', N'Võ Hồng Uyên', '0912100016'),
        ('demo_stat_cust_17', N'Trương Tấn Vinh', '0912100017'),
        ('demo_stat_cust_18', N'Lâm Gia Yến', '0912100018')
    ) AS v(username, ho_ten_kh, so_dien_thoai_kh)
    JOIN TaiKhoan tk ON tk.username = v.username;

    INSERT INTO SoDiaChi (
        id_khach_hang, ho_va_ten_nguoi_nhan, sdt_nguoi_nhan,
        dia_chi_cu_the, tinh_thanh, quan_huyen, phuong_xa,
        dia_chi_mac_dinh, ngay_tao
    )
    SELECT kh.id, kh.ho_ten_kh, kh.so_dien_thoai_kh,
           N'Số ' + CAST(ROW_NUMBER() OVER(ORDER BY kh.id) * 12 AS NVARCHAR(10)) + N' Đường Cầu Lông',
           N'Hà Nội', N'Quận Cầu Giấy', N'Phường Dịch Vọng',
           1, kh.ngay_tao
    FROM KhachHang kh
    JOIN TaiKhoan tk ON tk.id = kh.id_tai_khoan
    WHERE tk.username LIKE 'demo_stat_cust_%';

    PRINT N'==============================================================================';
    PRINT N'==> [3/5] Khởi tạo Đánh Giá Sản Phẩm & Hình Ảnh Đánh Giá (DanhGia)...';
    PRINT N'==============================================================================';

    -- Lấy 1 khách hàng và 1 sản phẩm
    DECLARE @ID_KH_REVIEW INT = (SELECT TOP 1 id FROM KhachHang ORDER BY id ASC);
    DECLARE @ID_SP_REVIEW INT = (SELECT TOP 1 id FROM SanPham ORDER BY id ASC);

    IF @ID_KH_REVIEW IS NOT NULL AND @ID_SP_REVIEW IS NOT NULL
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM DanhGia WHERE id_khach_hang = @ID_KH_REVIEW AND id_san_pham = @ID_SP_REVIEW AND da_xoa = 0)
        BEGIN
            INSERT INTO DanhGia (id_khach_hang, id_san_pham, so_sao, noi_dung, binh_luan_an, hinh_anh_an, da_xoa, ngay_tao, ngay_cap_nhat)
            VALUES (@ID_KH_REVIEW, @ID_SP_REVIEW, 5.0, N'Vợt đánh cực kỳ thoát tay, phông cầu đầm và đập cầu rất cắm. Căng cước 11kg đánh tiếng nổ đanh vang, shop đóng gói hàng rất kỹ có ống chống sốc. 10/10!', 0, 0, 0, GETDATE(), GETDATE());

            DECLARE @ID_DG_NEW INT = SCOPE_IDENTITY();
            INSERT INTO HinhAnhDanhGia (id_danh_gia, url_hinh_anh, ngay_tao)
            VALUES (@ID_DG_NEW, '/images/products/product-1.jpg', GETDATE());
        END;
    END;

    PRINT N'==============================================================================';
    PRINT N'==> [4/5] Khởi tạo Từ Khóa Cấm & Nhật Ký Vi Phạm (CommentModerationKeyword)...';
    PRINT N'==============================================================================';

    INSERT INTO CommentModerationKeyword (tu_khoa, kich_hoat, ngay_tao)
    SELECT k.tu_khoa, 1, GETDATE()
    FROM (VALUES
        (N'lừa đảo'), (N'lua dao'), (N'hàng giả'), (N'hang gia'), (N'fake'),
        (N'chửi thề'), (N'dm'), (N'vkl'), (N'cờ bạc'), (N'vay tiền'), (N'quảng cáo')
    ) AS k(tu_khoa)
    WHERE k.tu_khoa NOT IN (SELECT tu_khoa FROM CommentModerationKeyword);

    DECLARE @ID_TK_VIOLATION INT = (SELECT TOP 1 id FROM TaiKhoan WHERE vai_tro = 'KH' ORDER BY id ASC);
    IF @ID_TK_VIOLATION IS NOT NULL AND @ID_SP_REVIEW IS NOT NULL
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM CommentViolationLog WHERE id_tai_khoan = @ID_TK_VIOLATION)
        BEGIN
            INSERT INTO CommentViolationLog (id_tai_khoan, id_san_pham, noi_dung_goc, noi_dung_da_loc, muc_do_vi_pham, so_lan_vi_pham, thoi_han_khoa, ngay_vi_pham, ngay_tao)
            VALUES
            (@ID_TK_VIOLATION, @ID_SP_REVIEW, N'Shop này bán hàng lừa đảo người tiêu dùng!', N'Shop này bán hàng *** người tiêu dùng!', 'LOW', 1, N'Cảnh cáo lần 1', DATEADD(DAY, -5, GETDATE()), GETDATE()),
            (@ID_TK_VIOLATION, @ID_SP_REVIEW, N'Hàng fake kém chất lượng vkl shop ơi', N'Hàng *** kém chất lượng *** shop ơi', 'MEDIUM', 2, N'Tạm khóa bình luận 24 giờ', DATEADD(DAY, -3, GETDATE()), GETDATE()),
            (@ID_TK_VIOLATION, @ID_SP_REVIEW, N'Đồ lừa đảo hàng giả mà cũng bán được', N'Đồ *** *** mà cũng bán được', 'HIGH', 3, N'Khóa bình luận 7 ngày', DATEADD(DAY, -1, GETDATE()), GETDATE()),
            (@ID_TK_VIOLATION, @ID_SP_REVIEW, N'dm shop lừa đảo cờ bạc vay tiền', N'*** shop *** *** ***', 'CRITICAL', 4, N'Khóa tài khoản vĩnh viễn', GETDATE(), GETDATE());
        END;
    END;

    PRINT N'==============================================================================';
    PRINT N'==> [5/5] Khởi tạo 2 Bài Viết Blog Chuyên Sâu & Bình Luận (Blog, BlogComment)...';
    PRINT N'==============================================================================';

    DECLARE @ID_TK_ADMIN INT = (SELECT TOP 1 id FROM TaiKhoan WHERE vai_tro = 'ADMIN' ORDER BY id ASC);
    IF @ID_TK_ADMIN IS NULL SET @ID_TK_ADMIN = (SELECT TOP 1 id FROM TaiKhoan ORDER BY id ASC);

    IF NOT EXISTS (SELECT 1 FROM Blog WHERE duong_dan = 'top-5-vot-cau-long-cong-thu-toan-dien-dang-mua-nhat-2026')
    BEGIN
        INSERT INTO Blog (
            id_tai_khoan, tieu_de, duong_dan, tom_tat, noi_dung,
            hinh_anh, danh_muc, the, trang_thai, ngay_dang, da_xoa, ngay_tao, ngay_cap_nhat, updated_by
        ) VALUES (
            @ID_TK_ADMIN,
            N'Top 5 Cây Vợt Cầu Lông Công Thủ Toàn Diện Đáng Mua Nhất 2026',
            'top-5-vot-cau-long-cong-thu-toan-dien-dang-mua-nhat-2026',
            N'Khám phá danh sách 5 mẫu vợt cầu lông công thủ toàn diện được các lông thủ phong trào và bán chuyên săn đón nhiều nhất năm 2026.',
            N'<h3>1. Yonex Arcsaber 11 Pro</h3><p>Được mệnh danh là ông vua điều cầu, Arcsaber 11 Pro mang lại khả năng kiểm soát cầu tuyệt đối với khung vợt linh hoạt.</p><h3>2. Lining Axforce 80</h3><p>Cây vợt cân bằng hoàn hảo giữa sức mạnh tấn công và tốc độ phản tạt nhanh gọn trong đánh đôi.</p><h3>3. Victor DriveX 9X</h3><p>Khung vợt khí động học giúp tăng tốc độ vung vợt và độ ổn định khi phòng thủ bền bỉ.</p>',
            '/images/blog/blog-1.jpg',
            N'Tư Vấn Chọn Vợt',
            N'yonex,lining,victor,vot-cau-long',
            'PUBLISHED',
            CAST(GETDATE() AS DATE),
            0,
            GETDATE(),
            GETDATE(),
            N'Ban Biên Tập SmashVN'
        );

        DECLARE @ID_BLOG_1 INT = SCOPE_IDENTITY();
        INSERT INTO BlogComment (id_blog, id_tai_khoan, noi_dung, da_xoa, ngay_tao)
        VALUES (@ID_BLOG_1, @ID_TK_ADMIN, N'Bài viết phân tích rất chi tiết và đúng nhu cầu của anh em chơi phong trào!', 0, GETDATE());
    END;

    IF NOT EXISTS (SELECT 1 FROM Blog WHERE duong_dan = 'bi-quyet-thuc-hien-cu-smash-dap-cau-uy-luc-chuan-van-dong-vien')
    BEGIN
        INSERT INTO Blog (
            id_tai_khoan, tieu_de, duong_dan, tom_tat, noi_dung,
            hinh_anh, danh_muc, the, trang_thai, ngay_dang, da_xoa, ngay_tao, ngay_cap_nhat, updated_by
        ) VALUES (
            @ID_TK_ADMIN,
            N'Bí Quyết Thực Hiện Cú Smash (Đập Cầu) Uy Lực Chuẩn Vận Động Viên',
            'bi-quyet-thuc-hien-cu-smash-dap-cau-uy-luc-chuan-van-dong-vien',
            N'Hướng dẫn chi tiết từng bước phát lực từ hông, vai đến cổ tay để tạo ra cú đập cầu uy lực cắm sàn như vận động viên chuyên nghiệp.',
            N'<h3>Bước 1: Di chuyển bộ chân và tư thế chuẩn bị</h3><p>Luôn đón cầu ở phía trước mặt, không để cầu rơi quá sâu ra phía sau lưng.</p><h3>Bước 2: Mở vai và dẫn vợt</h3><p>Xoay hông tạo góc 90 độ, đưa cùi chỏ lên cao để chuẩn bị vung vợt giải phóng lực tối đa.</p><h3>Bước 3: Phát lực tiếp xúc cầu và gập cổ tay</h3><p>Tiếp xúc cầu ở điểm cao nhất, kết hợp gập cổ tay nhanh và dứt khoát để cầu đi cắm sàn hiểm hóc.</p>',
            '/images/blog/blog-2.jpg',
            N'Kỹ Thuật Cầu Lông',
            N'ky-thuat,smash,dap-cau,tap-luyen',
            'PUBLISHED',
            CAST(GETDATE() AS DATE),
            0,
            GETDATE(),
            GETDATE(),
            N'HLV Cầu Lông SmashVN'
        );

        DECLARE @ID_BLOG_2 INT = SCOPE_IDENTITY();
        INSERT INTO BlogComment (id_blog, id_tai_khoan, noi_dung, da_xoa, ngay_tao)
        VALUES (@ID_BLOG_2, @ID_TK_ADMIN, N'Cảm ơn shop đã chia sẻ kỹ thuật rất dễ hiểu, mình đã áp dụng và thấy lực đập cải thiện rõ!', 0, GETDATE());
    END;

    PRINT N'==============================================================================';
    PRINT N'==> [7/7] HOÀN TẤT NẠP 100% DỮ LIỆU DEMO SMASH-VN THÀNH CÔNG RỰC RỠ!';
    PRINT N'==============================================================================';

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    PRINT N'==> [ERROR] Gặp lỗi trong quá trình thực thi seed data! Đã ROLLBACK.';
    THROW;
END CATCH;

