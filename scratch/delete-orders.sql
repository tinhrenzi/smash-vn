-- ==============================================================================
-- SMASH-VN BADMINTON SHOP - SCRIPT XÓA TOÀN BỘ DỮ LIỆU ĐƠN HÀNG (ORDERS CLEANUP)
-- ==============================================================================

SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    PRINT N'==> [1/4] Xóa dữ liệu Tích Hợp Vận Chuyển (TichHopVanChuyen)...';
    IF OBJECT_ID('TichHopVanChuyen', 'U') IS NOT NULL
    BEGIN
        DELETE FROM TichHopVanChuyen;
    END;

    PRINT N'==> [2/4] Xóa Giao Dịch Thanh Toán (GiaoDichThanhToan / PaymentTransaction)...';
    IF OBJECT_ID('GiaoDichThanhToan', 'U') IS NOT NULL
    BEGIN
        DELETE FROM GiaoDichThanhToan;
    END;

    PRINT N'==> [3/4] Xóa toàn bộ Chi Tiết Hóa Đơn (HoaDonChiTiet)...';
    DELETE FROM HoaDonChiTiet;

    PRINT N'==> [4/4] Xóa toàn bộ Hóa Đơn (HoaDon)...';
    DELETE FROM HoaDon;

    COMMIT TRANSACTION;
    PRINT N'==> [SUCCESS] Đã xóa toàn bộ dữ liệu đơn hàng (HoaDon & HoaDonChiTiet) thành công!';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    PRINT N'==> [ERROR] Gặp lỗi khi xóa dữ liệu đơn hàng: ' + ERROR_MESSAGE();
    THROW;
END CATCH;
