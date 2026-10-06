USE [BadmintonShopDB1];
GO

BEGIN TRANSACTION;

BEGIN TRY
    -- 1. Tắt tạm thời ràng buộc khóa ngoại trên bảng HoaDon
    ALTER TABLE dbo.HoaDon NOCHECK CONSTRAINT ALL;

    -- 2. Tái tạo bảng PhuongThucThanhToan với 4 ID cố định không dấu ngoặc
    DELETE FROM dbo.PhuongThucThanhToan;
    DBCC CHECKIDENT ('dbo.PhuongThucThanhToan', RESEED, 0);

    SET IDENTITY_INSERT dbo.PhuongThucThanhToan ON;
    INSERT INTO dbo.PhuongThucThanhToan (id, ma_phuong_thuc, ten_phuong_thuc) VALUES
    (1, N'SEPAY', N'Chuyển khoản Online'),
    (2, N'COD', N'Thanh toán khi nhận hàng'),
    (3, N'TIEN_MAT', N'Tiền mặt tại quầy'),
    (4, N'CHUYEN_KHOAN', N'Chuyển khoản tại quầy');
    SET IDENTITY_INSERT dbo.PhuongThucThanhToan OFF;

    -- 3. Cập nhật chính xác cho ĐƠN HÀNG ONLINE (id_nhan_vien IS NULL)
    -- Đơn online chuyển khoản (bao gồm đơn số 21) -> ID = 1 (Chuyển khoản Online)
    UPDATE dbo.HoaDon
    SET id_phuong_thuc_thanh_toan = 1
    WHERE id_nhan_vien IS NULL AND (id_phuong_thuc_thanh_toan IN (1, 4, 6, 7) OR id = 21);

    -- Đơn online COD -> ID = 2 (Thanh toán khi nhận hàng)
    UPDATE dbo.HoaDon
    SET id_phuong_thuc_thanh_toan = 2
    WHERE id_nhan_vien IS NULL AND id_phuong_thuc_thanh_toan = 2 AND id <> 21;

    -- 4. Cập nhật cho ĐƠN HÀNG TẠI QUẦY (id_nhan_vien IS NOT NULL)
    -- Đơn tại quầy Tiền mặt -> ID = 3 (Tiền mặt tại quầy)
    UPDATE dbo.HoaDon
    SET id_phuong_thuc_thanh_toan = 3
    WHERE id_nhan_vien IS NOT NULL AND id_phuong_thuc_thanh_toan IN (3, 5);

    -- Đơn tại quầy Chuyển khoản -> ID = 4 (Chuyển khoản tại quầy)
    UPDATE dbo.HoaDon
    SET id_phuong_thuc_thanh_toan = 4
    WHERE id_nhan_vien IS NOT NULL AND id_phuong_thuc_thanh_toan IN (4, 6);

    -- 5. Chuẩn hóa bảng DonViVanChuyen (1: GHN, 2: Mua tại quầy)
    UPDATE dbo.HoaDon SET id_don_vi_van_chuyen = 2 WHERE id_nhan_vien IS NOT NULL;
    UPDATE dbo.HoaDon SET id_don_vi_van_chuyen = 1 WHERE id_nhan_vien IS NULL;

    DELETE FROM dbo.DonViVanChuyen;
    DBCC CHECKIDENT ('dbo.DonViVanChuyen', RESEED, 0);

    SET IDENTITY_INSERT dbo.DonViVanChuyen ON;
    INSERT INTO dbo.DonViVanChuyen (id, ma_don_vi, ten_don_vi, so_hotline, web_url, ma_token, ma_client, dia_chi_kho, phi_noi_dia, phi_toan_quoc) VALUES
    (1, N'GHN', N'Giao Hàng Nhanh', N'1900636677', N'https://ghn.vn', N'7cb9910e-6313-11f1-a973-aee5264794df', N'200610', N'10 Kim Mã, Ba Đình, Hà Nội', 25000, 35000),
    (2, N'TAIQUAY', N'Mua tại quầy', N'000000', N'https://smashvn.local', NULL, NULL, N'Tại cửa hàng SMASH-VN', 0, 0);
    SET IDENTITY_INSERT dbo.DonViVanChuyen OFF;

    -- 6. Bật lại toàn bộ ràng buộc khóa ngoại
    ALTER TABLE dbo.HoaDon WITH CHECK CHECK CONSTRAINT ALL;

    COMMIT TRANSACTION;
    PRINT N'==============================================================================';
    PRINT N'>> THÀNH CÔNG: Đã chuẩn hóa dữ liệu:';
    PRINT N'   1 - Chuyển khoản Online';
    PRINT N'   2 - Thanh toán khi nhận hàng';
    PRINT N'   3 - Tiền mặt tại quầy';
    PRINT N'   4 - Chuyển khoản tại quầy';
    PRINT N'==============================================================================';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT N'>> LỖI: ' + ERROR_MESSAGE();
    THROW;
END CATCH;
GO