-- ==============================================================================
-- SMASH-VN BADMINTON SHOP - DEMO STATISTICS ROLLBACK SCRIPT
-- Purpose: Safely delete all demo data and restore DB to clean state
-- Scope: Demo orders, Demo customers, Demo reviews, Demo keywords, Demo blogs, Demo import receipts
-- ==============================================================================

SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    PRINT N'==> [1/9] Xóa các dòng HoaDonChiTiet thuộc hóa đơn Demo...';

    DELETE hdct
    FROM HoaDonChiTiet hdct
    WHERE hdct.id_hoa_don IN (
        SELECT hd.id
        FROM HoaDon hd
        JOIN KhachHang kh ON kh.id = hd.id_khach_hang
        JOIN TaiKhoan tk ON tk.id = kh.id_tai_khoan
        WHERE tk.username LIKE 'demo_stat_cust_%'
           OR hd.ghi_chu LIKE 'DEMO_STAT_D%'
           OR hd.ma_giao_dich LIKE 'DHSVN-%'
           OR hd.ma_giao_dich LIKE 'POS-%'
    )
    OR hdct.sku_snapshot LIKE 'POS-%'
    OR hdct.sku_snapshot LIKE 'SPCT-%';

    PRINT N'==> [2/9] Xóa các Hóa đơn Demo (HoaDon)...';

    DELETE hd
    FROM HoaDon hd
    WHERE hd.ghi_chu LIKE 'DEMO_STAT_D%'
       OR hd.ma_giao_dich LIKE 'DHSVN-%'
       OR hd.ma_giao_dich LIKE 'POS-%'
       OR hd.id_khach_hang IN (
           SELECT kh.id
           FROM KhachHang kh
           JOIN TaiKhoan tk ON tk.id = kh.id_tai_khoan
           WHERE tk.username LIKE 'demo_stat_cust_%'
       );

    PRINT N'==> [3/9] Xóa Giỏ hàng Demo (GioHangChiTiet, GioHang)...';

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

    PRINT N'==> [4/9] Xóa Nhật Ký Vi Phạm & Đánh Giá Demo...';

    DELETE FROM CommentViolationLog;

    DELETE FROM HinhAnhDanhGia 
    WHERE id_danh_gia IN (
        SELECT dg.id FROM DanhGia dg
        JOIN KhachHang kh ON kh.id = dg.id_khach_hang
        JOIN TaiKhoan tk ON tk.id = kh.id_tai_khoan
        WHERE tk.username LIKE 'demo_stat_cust_%'
           OR tk.username LIKE 'khachhang_review_%'
    );

    DELETE dg FROM DanhGia dg
    JOIN KhachHang kh ON kh.id = dg.id_khach_hang
    JOIN TaiKhoan tk ON tk.id = kh.id_tai_khoan
    WHERE tk.username LIKE 'demo_stat_cust_%'
       OR tk.username LIKE 'khachhang_review_%';

    PRINT N'==> [5/9] Xóa Bình Luận & Bài Viết Blog Demo...';

    DELETE bc
    FROM BlogComment bc
    WHERE bc.id_blog IN (
        SELECT id FROM Blog 
        WHERE duong_dan IN ('top-5-vot-cau-long-cong-thu-toan-dien-dang-mua-nhat-2026', 'bi-quyet-thuc-hien-cu-smash-dap-cau-uy-luc-chuan-van-dong-vien')
    );

    DELETE FROM Blog 
    WHERE duong_dan IN ('top-5-vot-cau-long-cong-thu-toan-dien-dang-mua-nhat-2026', 'bi-quyet-thuc-hien-cu-smash-dap-cau-uy-luc-chuan-van-dong-vien');

    PRINT N'==> [6/9] Xóa Chi Tiết & Phiếu Nhập Hàng Demo...';

    DELETE pnct
    FROM PhieuNhapChiTiet pnct
    WHERE pnct.id_phieu_nhap IN (
        SELECT id FROM PhieuNhap 
        WHERE ma_phieu_nhap IN ('PN20260601-001', 'PN20260701-002', 'PN20260801-003')
    );

    DELETE FROM PhieuNhap 
    WHERE ma_phieu_nhap IN ('PN20260601-001', 'PN20260701-002', 'PN20260801-003');

    PRINT N'==> [7/9] Xóa Sổ địa chỉ Demo (SoDiaChi)...';

    DELETE dc
    FROM SoDiaChi dc
    JOIN KhachHang kh ON kh.id = dc.id_khach_hang
    JOIN TaiKhoan tk ON tk.id = kh.id_tai_khoan
    WHERE tk.username LIKE 'demo_stat_cust_%';

    PRINT N'==> [8/9] Xóa Khách hàng Demo (KhachHang)...';

    DELETE kh
    FROM KhachHang kh
    JOIN TaiKhoan tk ON tk.id = kh.id_tai_khoan
    WHERE tk.username LIKE 'demo_stat_cust_%'
       OR tk.username LIKE 'khachhang_review_%';

    PRINT N'==> [9/9] Xóa Tài khoản Demo (TaiKhoan)...';

    DELETE FROM TaiKhoan
    WHERE username LIKE 'demo_stat_cust_%'
       OR username LIKE 'khachhang_review_%';

    COMMIT TRANSACTION;
    PRINT N'==> [SUCCESS] Hoàn tất ROLLBACK sạch sẽ toàn bộ dữ liệu Demo!';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    PRINT N'==> [ERROR] Gặp lỗi trong quá trình ROLLBACK! Đã hủy bỏ thao tác.';
    THROW;
END CATCH;

