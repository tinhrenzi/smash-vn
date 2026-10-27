# Script xuất dữ liệu cũ từ BadmintonShopDB1 và sắp xếp lại ID tuần tự từ 1
$connectionString = "Server=localhost;Database=BadmintonShopDB1;Integrated Security=True;TrustServerCertificate=True;"
$connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
$connection.Open()

function Get-TableData($query) {
    $command = $connection.CreateCommand()
    $command.CommandText = $query
    $adapter = New-Object System.Data.SqlClient.SqlDataAdapter($command)
    $dataset = New-Object System.Data.DataSet
    $adapter.Fill($dataset) | Out-Null
    return $dataset.Tables[0]
}

function SqlEscape($val) {
    if ($null -eq $val -or [System.DBNull]::Value.Equals($val)) {
        return "NULL"
    }
    if ($val -is [bool]) {
        return if ($val) { "1" } else { "0" }
    }
    if ($val -is [int] -or $val -is [long] -or $val -is [decimal] -or $val -is [double] -or $val -is [float]) {
        return $val.ToString().Replace(',', '.')
    }
    if ($val -is [System.DateTime]) {
        return "'" + $val.ToString("yyyy-MM-dd HH:mm:ss") + "'"
    }
    $escaped = $val.ToString().Replace("'", "''")
    return "N'" + $escaped + "'"
}

Write-Host "1. Đọc dữ liệu từ database..."

$spTable = Get-TableData "SELECT * FROM SanPham ORDER BY id"
$spctTable = Get-TableData "SELECT * FROM SanPhamChiTiet ORDER BY id_san_pham, id"
$haTable = Get-TableData "SELECT * FROM HinhAnhSanPham ORDER BY id_san_pham_chi_tiet, id"
$spctttTable = Get-TableData "SELECT * FROM SanPhamChiTietThuocTinh ORDER BY id_san_pham_chi_tiet, id"
$pnctTable = Get-TableData "SELECT * FROM PhieuNhapChiTiet ORDER BY id"
$hdctTable = Get-TableData "SELECT * FROM HoaDonChiTiet ORDER BY id"
$ghctTable = Get-TableData "SELECT * FROM GioHangChiTiet ORDER BY id"
$dgTable = Get-TableData "SELECT * FROM DanhGia ORDER BY id"
$spytTable = Get-TableData "SELECT * FROM SanPhamYeuThich"
$spdggTable = Get-TableData "SELECT * FROM SanPham_DotGiamGia"
$cvlTable = Get-TableData "SELECT * FROM CommentViolationLog ORDER BY id"

$connection.Close()

Write-Host "2. Xây dựng bản đồ ánh xạ ID cũ -> ID mới..."

$spOldToNew = @{}
$newSpId = 1
foreach ($row in $spTable.Rows) {
    $oldId = [int]$row["id"]
    $spOldToNew[$oldId] = $newSpId
    $newSpId++
}

$spctOldToNew = @{}
$newSpctId = 1
foreach ($row in $spctTable.Rows) {
    $oldId = [int]$row["id"]
    $spctOldToNew[$oldId] = $newSpctId
    $newSpctId++
}

Write-Host ("Tổng số SanPham: " + $spOldToNew.Count + " (ID: 1 -> " + ($newSpId - 1) + ")")
Write-Host ("Tổng số SanPhamChiTiet: " + $spctOldToNew.Count + " (ID: 1 -> " + ($newSpctId - 1) + ")")

# Bắt đầu ghi file SQL
$outputSql = [System.Text.StringBuilder]::new()
$outputSql.AppendLine("/*") | Out-Null
$outputSql.AppendLine("===============================================================================") | Out-Null
$outputSql.AppendLine(" SMASH-VN: FILE BACKUP DỮ LIỆU SẢN PHẨM CŨ (ĐÃ SẮP XẾP LẠI ID TUẦN TỰ ĐẸP)") | Out-Null
$outputSql.AppendLine(" Ngày xuất: " + (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")) | Out-Null
$outputSql.AppendLine(" Mô tả:") | Out-Null
$outputSql.AppendLine("   - Toàn bộ 59 sản phẩm cũ được xếp lại ID từ 1 đến 59 (mã SP000001 -> SP000059).") | Out-Null
$outputSql.AppendLine("   - Toàn bộ 119 biến thể cũ được xếp lại ID từ 1 đến 119 (SKU SPxxxxxx-Vyyyyyy).") | Out-Null
$outputSql.AppendLine("   - Các liên kết ngoại (Ảnh, Thuộc tính, Phiếu nhập, Hóa đơn, Giỏ hàng, Đánh giá, Giảm giá) đều được map chuẩn theo ID mới.") | Out-Null
$outputSql.AppendLine("   - Khi cần phục hồi lại nguyên trạng data cũ, chỉ cần chạy toàn bộ script này.") | Out-Null
$outputSql.AppendLine("===============================================================================") | Out-Null
$outputSql.AppendLine("*/") | Out-Null
$outputSql.AppendLine("USE [BadmintonShopDB1];") | Out-Null
$outputSql.AppendLine("GO") | Out-Null
$outputSql.AppendLine("SET NOCOUNT ON;") | Out-Null
$outputSql.AppendLine("BEGIN TRANSACTION;") | Out-Null
$outputSql.AppendLine("BEGIN TRY") | Out-Null
$outputSql.AppendLine("    PRINT N'1. Đang dọn dẹp dữ liệu sản phẩm cũ...';") | Out-Null
$outputSql.AppendLine("    DELETE FROM [dbo].[CommentViolationLog];") | Out-Null
$outputSql.AppendLine("    DELETE FROM [dbo].[DanhGiaAnh];") | Out-Null
$outputSql.AppendLine("    DELETE FROM [dbo].[DanhGia];") | Out-Null
$outputSql.AppendLine("    DELETE FROM [dbo].[GioHangChiTiet];") | Out-Null
$outputSql.AppendLine("    DELETE FROM [dbo].[HoaDonChiTiet];") | Out-Null
$outputSql.AppendLine("    DELETE FROM [dbo].[PhieuNhapChiTiet];") | Out-Null
$outputSql.AppendLine("    DELETE FROM [dbo].[SanPhamYeuThich];") | Out-Null
$outputSql.AppendLine("    DELETE FROM [dbo].[SanPham_DotGiamGia];") | Out-Null
$outputSql.AppendLine("    DELETE FROM [dbo].[HinhAnhSanPham];") | Out-Null
$outputSql.AppendLine("    DELETE FROM [dbo].[SanPhamChiTietThuocTinh];") | Out-Null
$outputSql.AppendLine("    DELETE FROM [dbo].[SanPhamChiTiet];") | Out-Null
$outputSql.AppendLine("    DELETE FROM [dbo].[SanPham];") | Out-Null
$outputSql.AppendLine("") | Out-Null

# 3. SanPham
$outputSql.AppendLine("    PRINT N'2. Đang khôi phục SanPham (ID 1 -> 59)...';") | Out-Null
$outputSql.AppendLine("    SET IDENTITY_INSERT [dbo].[SanPham] ON;") | Out-Null
foreach ($row in $spTable.Rows) {
    $oldId = [int]$row["id"]
    $curId = $spOldToNew[$oldId]
    $maSp = "SP" + $curId.ToString("D6")
    $ten = SqlEscape $row["ten_san_pham"]
    $idDm = SqlEscape $row["id_danh_muc"]
    $idTh = SqlEscape $row["id_thuong_hieu"]
    $idNv = SqlEscape $row["id_nhan_vien"]
    $moTa = SqlEscape $row["mo_ta"]
    $tt = SqlEscape $row["trang_thai"]
    $slDg = SqlEscape $row["so_luot_danh_gia"]
    $dtb = SqlEscape $row["diem_trung_binh"]
    $ngayTao = SqlEscape $row["ngay_tao"]
    $ngayCapNhat = SqlEscape $row["ngay_cap_nhat"]

    $outputSql.AppendLine("    INSERT INTO [dbo].[SanPham] ([id],[ma_san_pham],[ten_san_pham],[id_danh_muc],[id_thuong_hieu],[id_nhan_vien],[mo_ta],[trang_thai],[so_luot_danh_gia],[diem_trung_binh],[ngay_tao],[ngay_cap_nhat]) VALUES ($curId, '$maSp', $ten, $idDm, $idTh, $idNv, $moTa, $tt, $slDg, $dtb, $ngayTao, $ngayCapNhat);") | Out-Null
}
$outputSql.AppendLine("    SET IDENTITY_INSERT [dbo].[SanPham] OFF;") | Out-Null
$outputSql.AppendLine("    DBCC CHECKIDENT ('[dbo].[SanPham]', RESEED, $newSpId);") | Out-Null
$outputSql.AppendLine("") | Out-Null

# 4. SanPhamChiTiet
$outputSql.AppendLine("    PRINT N'3. Đang khôi phục SanPhamChiTiet (ID 1 -> 119)...';") | Out-Null
$outputSql.AppendLine("    SET IDENTITY_INSERT [dbo].[SanPhamChiTiet] ON;") | Out-Null
foreach ($row in $spctTable.Rows) {
    $oldId = [int]$row["id"]
    $curId = $spctOldToNew[$oldId]
    $oldSpId = [int]$row["id_san_pham"]
    $newSpIdVal = $spOldToNew[$oldSpId]
    $maSp = "SP" + $newSpIdVal.ToString("D6")
    $sku = $maSp + "-V" + $curId.ToString("D6")

    $gNhap = SqlEscape $row["gia_nhap"]
    $gBan = SqlEscape $row["gia_ban"]
    $slTon = SqlEscape $row["so_luong_ton"]
    $slLoi = SqlEscape $row["so_luong_sp_loi"]
    $tt = SqlEscape $row["trang_thai"]
    $ngayTao = SqlEscape $row["ngay_tao"]
    $ngayCapNhat = SqlEscape $row["ngay_cap_nhat"]

    $outputSql.AppendLine("    INSERT INTO [dbo].[SanPhamChiTiet] ([id],[id_san_pham],[sku],[gia_nhap],[gia_ban],[so_luong_ton],[so_luong_sp_loi],[trang_thai],[ngay_tao],[ngay_cap_nhat]) VALUES ($curId, $newSpIdVal, '$sku', $gNhap, $gBan, $slTon, $slLoi, $tt, $ngayTao, $ngayCapNhat);") | Out-Null
}
$outputSql.AppendLine("    SET IDENTITY_INSERT [dbo].[SanPhamChiTiet] OFF;") | Out-Null
$outputSql.AppendLine("    DBCC CHECKIDENT ('[dbo].[SanPhamChiTiet]', RESEED, $newSpctId);") | Out-Null
$outputSql.AppendLine("") | Out-Null

# 5. HinhAnhSanPham
$outputSql.AppendLine("    PRINT N'4. Đang khôi phục HinhAnhSanPham...';") | Out-Null
$outputSql.AppendLine("    SET IDENTITY_INSERT [dbo].[HinhAnhSanPham] ON;") | Out-Null
$haNewId = 1
foreach ($row in $haTable.Rows) {
    $oldSpctId = [int]$row["id_san_pham_chi_tiet"]
    if ($spctOldToNew.ContainsKey($oldSpctId)) {
        $newSpctIdVal = $spctOldToNew[$oldSpctId]
        $url = SqlEscape $row["url_hinh_anh"]
        $mau = SqlEscape $row["mau_sac"]
        $laChinh = SqlEscape $row["la_anh_chinh"]
        $thuTu = SqlEscape $row["thu_tu"]
        $outputSql.AppendLine("    INSERT INTO [dbo].[HinhAnhSanPham] ([id],[id_san_pham_chi_tiet],[url_hinh_anh],[mau_sac],[la_anh_chinh],[thu_tu]) VALUES ($haNewId, $newSpctIdVal, $url, $mau, $laChinh, $thuTu);") | Out-Null
        $haNewId++
    }
}
$outputSql.AppendLine("    SET IDENTITY_INSERT [dbo].[HinhAnhSanPham] OFF;") | Out-Null
$outputSql.AppendLine("    DBCC CHECKIDENT ('[dbo].[HinhAnhSanPham]', RESEED, $haNewId);") | Out-Null
$outputSql.AppendLine("") | Out-Null

# 6. SanPhamChiTietThuocTinh
$outputSql.AppendLine("    PRINT N'5. Đang khôi phục SanPhamChiTietThuocTinh...';") | Out-Null
$outputSql.AppendLine("    SET IDENTITY_INSERT [dbo].[SanPhamChiTietThuocTinh] ON;") | Out-Null
$spctttNewId = 1
foreach ($row in $spctttTable.Rows) {
    $oldSpctId = [int]$row["id_san_pham_chi_tiet"]
    if ($spctOldToNew.ContainsKey($oldSpctId)) {
        $newSpctIdVal = $spctOldToNew[$oldSpctId]
        $idTt = SqlEscape $row["id_thuoc_tinh"]
        $giaTri = SqlEscape $row["gia_tri"]
        $outputSql.AppendLine("    INSERT INTO [dbo].[SanPhamChiTietThuocTinh] ([id],[id_san_pham_chi_tiet],[id_thuoc_tinh],[gia_tri]) VALUES ($spctttNewId, $newSpctIdVal, $idTt, $giaTri);") | Out-Null
        $spctttNewId++
    }
}
$outputSql.AppendLine("    SET IDENTITY_INSERT [dbo].[SanPhamChiTietThuocTinh] OFF;") | Out-Null
$outputSql.AppendLine("    DBCC CHECKIDENT ('[dbo].[SanPhamChiTietThuocTinh]', RESEED, $spctttNewId);") | Out-Null
$outputSql.AppendLine("") | Out-Null

# 7. PhieuNhapChiTiet
$outputSql.AppendLine("    PRINT N'6. Đang khôi phục PhieuNhapChiTiet...';") | Out-Null
$outputSql.AppendLine("    SET IDENTITY_INSERT [dbo].[PhieuNhapChiTiet] ON;") | Out-Null
foreach ($row in $pnctTable.Rows) {
    $pnctId = [int]$row["id"]
    $idPn = SqlEscape $row["id_phieu_nhap"]
    $oldSpctId = [int]$row["id_san_pham_chi_tiet"]
    if ($spctOldToNew.ContainsKey($oldSpctId)) {
        $newSpctIdVal = $spctOldToNew[$oldSpctId]
        $sl = SqlEscape $row["so_luong"]
        $gNhap = SqlEscape $row["gia_nhap"]
        $tt = SqlEscape $row["thanh_tien"]
        $outputSql.AppendLine("    INSERT INTO [dbo].[PhieuNhapChiTiet] ([id],[id_phieu_nhap],[id_san_pham_chi_tiet],[so_luong],[gia_nhap],[thanh_tien]) VALUES ($pnctId, $idPn, $newSpctIdVal, $sl, $gNhap, $tt);") | Out-Null
    }
}
$outputSql.AppendLine("    SET IDENTITY_INSERT [dbo].[PhieuNhapChiTiet] OFF;") | Out-Null
$outputSql.AppendLine("") | Out-Null

# 8. HoaDonChiTiet
$outputSql.AppendLine("    PRINT N'7. Đang khôi phục HoaDonChiTiet...';") | Out-Null
$outputSql.AppendLine("    SET IDENTITY_INSERT [dbo].[HoaDonChiTiet] ON;") | Out-Null
foreach ($row in $hdctTable.Rows) {
    $hdctId = [int]$row["id"]
    $idHd = SqlEscape $row["id_hoa_don"]
    $oldSpctId = [int]$row["id_san_pham_chi_tiet"]
    if ($spctOldToNew.ContainsKey($oldSpctId)) {
        $newSpctIdVal = $spctOldToNew[$oldSpctId]
        $sl = SqlEscape $row["so_luong"]
        $donGia = SqlEscape $row["don_gia"]
        $giaGoc = SqlEscape $row["gia_goc"]
        $giaSauGiam = SqlEscape $row["gia_sau_giam"]
        $thanhTien = SqlEscape $row["thanh_tien"]
        $outputSql.AppendLine("    INSERT INTO [dbo].[HoaDonChiTiet] ([id],[id_hoa_don],[id_san_pham_chi_tiet],[so_luong],[don_gia],[gia_goc],[gia_sau_giam],[thanh_tien]) VALUES ($hdctId, $idHd, $newSpctIdVal, $sl, $donGia, $giaGoc, $giaSauGiam, $thanhTien);") | Out-Null
    }
}
$outputSql.AppendLine("    SET IDENTITY_INSERT [dbo].[HoaDonChiTiet] OFF;") | Out-Null
$outputSql.AppendLine("") | Out-Null

# 9. GioHangChiTiet
$outputSql.AppendLine("    PRINT N'8. Đang khôi phục GioHangChiTiet...';") | Out-Null
$outputSql.AppendLine("    SET IDENTITY_INSERT [dbo].[GioHangChiTiet] ON;") | Out-Null
foreach ($row in $ghctTable.Rows) {
    $ghctId = [int]$row["id"]
    $idGh = SqlEscape $row["id_gio_hang"]
    $oldSpctId = [int]$row["id_san_pham_chi_tiet"]
    if ($spctOldToNew.ContainsKey($oldSpctId)) {
        $newSpctIdVal = $spctOldToNew[$oldSpctId]
        $sl = SqlEscape $row["so_luong"]
        $ngayTao = SqlEscape $row["ngay_tao"]
        $outputSql.AppendLine("    INSERT INTO [dbo].[GioHangChiTiet] ([id],[id_gio_hang],[id_san_pham_chi_tiet],[so_luong],[ngay_tao]) VALUES ($ghctId, $idGh, $newSpctIdVal, $sl, $ngayTao);") | Out-Null
    }
}
$outputSql.AppendLine("    SET IDENTITY_INSERT [dbo].[GioHangChiTiet] OFF;") | Out-Null
$outputSql.AppendLine("") | Out-Null

# 10. DanhGia
$outputSql.AppendLine("    PRINT N'9. Đang khôi phục DanhGia...';") | Out-Null
$outputSql.AppendLine("    SET IDENTITY_INSERT [dbo].[DanhGia] ON;") | Out-Null
foreach ($row in $dgTable.Rows) {
    $dgId = [int]$row["id"]
    $idKh = SqlEscape $row["id_khach_hang"]
    $oldSpId = [int]$row["id_san_pham"]
    if ($spOldToNew.ContainsKey($oldSpId)) {
        $newSpIdVal = $spOldToNew[$oldSpId]
        $soSao = SqlEscape $row["so_sao"]
        $noiDung = SqlEscape $row["noi_dung"]
        $ngayTao = SqlEscape $row["ngay_tao"]
        $blAn = SqlEscape $row["binh_luan_an"]
        $haAn = SqlEscape $row["hinh_anh_an"]
        $ngayCapNhat = SqlEscape $row["ngay_cap_nhat"]
        $idNv = SqlEscape $row["id_nhan_vien"]
        $daXoa = SqlEscape $row["da_xoa"]

        $outputSql.AppendLine("    INSERT INTO [dbo].[DanhGia] ([id],[id_khach_hang],[id_san_pham],[so_sao],[noi_dung],[ngay_tao],[binh_luan_an],[hinh_anh_an],[ngay_cap_nhat],[id_nhan_vien],[da_xoa]) VALUES ($dgId, $idKh, $newSpIdVal, $soSao, $noiDung, $ngayTao, $blAn, $haAn, $ngayCapNhat, $idNv, $daXoa);") | Out-Null
    }
}
$outputSql.AppendLine("    SET IDENTITY_INSERT [dbo].[DanhGia] OFF;") | Out-Null
$outputSql.AppendLine("") | Out-Null

# 11. SanPham_DotGiamGia
$outputSql.AppendLine("    PRINT N'10. Đang khôi phục SanPham_DotGiamGia...';") | Out-Null
foreach ($row in $spdggTable.Rows) {
    $oldSpId = [int]$row["id_san_pham"]
    if ($spOldToNew.ContainsKey($oldSpId)) {
        $newSpIdVal = $spOldToNew[$oldSpId]
        $idDgg = SqlEscape $row["id_dot_giam_gia"]
        $outputSql.AppendLine("    INSERT INTO [dbo].[SanPham_DotGiamGia] ([id_san_pham],[id_dot_giam_gia]) VALUES ($newSpIdVal, $idDgg);") | Out-Null
    }
}
$outputSql.AppendLine("") | Out-Null

# 12. CommentViolationLog
$outputSql.AppendLine("    PRINT N'11. Đang khôi phục CommentViolationLog...';") | Out-Null
$outputSql.AppendLine("    SET IDENTITY_INSERT [dbo].[CommentViolationLog] ON;") | Out-Null
foreach ($row in $cvlTable.Rows) {
    $cvlId = [int]$row["id"]
    $idTk = SqlEscape $row["id_tai_khoan"]
    $idDg = SqlEscape $row["id_danh_gia"]
    $oldSpId = if ([System.DBNull]::Value.Equals($row["id_san_pham"])) { $null } else { [int]$row["id_san_pham"] }
    $newSpIdVal = if ($oldSpId -and $spOldToNew.ContainsKey($oldSpId)) { $spOldToNew[$oldSpId].ToString() } else { "NULL" }
    $ndGoc = SqlEscape $row["noi_dung_goc"]
    $ndLoc = SqlEscape $row["noi_dung_da_loc"]
    $mucDo = SqlEscape $row["muc_do_vi_pham"]
    $soLan = SqlEscape $row["so_lan_vi_pham"]
    $ngayVp = SqlEscape $row["ngay_vi_pham"]
    $ngayTao = SqlEscape $row["ngay_tao"]

    $outputSql.AppendLine("    INSERT INTO [dbo].[CommentViolationLog] ([id],[id_tai_khoan],[id_danh_gia],[id_san_pham],[noi_dung_goc],[noi_dung_da_loc],[muc_do_vi_pham],[so_lan_vi_pham],[ngay_vi_pham],[ngay_tao]) VALUES ($cvlId, $idTk, $idDg, $newSpIdVal, $ndGoc, $ndLoc, $mucDo, $soLan, $ngayVp, $ngayTao);") | Out-Null
}
$outputSql.AppendLine("    SET IDENTITY_INSERT [dbo].[CommentViolationLog] OFF;") | Out-Null
$outputSql.AppendLine("") | Out-Null

$outputSql.AppendLine("    COMMIT TRANSACTION;") | Out-Null
$outputSql.AppendLine("    PRINT N'===> KHÔI PHỤC DỮ LIỆU CŨ THÀNH CÔNG VỚI ID ĐẸP TUẦN TỰ!';") | Out-Null
$outputSql.AppendLine("END TRY") | Out-Null
$outputSql.AppendLine("BEGIN CATCH") | Out-Null
$outputSql.AppendLine("    ROLLBACK TRANSACTION;") | Out-Null
$outputSql.AppendLine("    PRINT N'LỖI KHI KHÔI PHỤC: ' + ERROR_MESSAGE();") | Out-Null
$outputSql.AppendLine("    THROW;") | Out-Null
$outputSql.AppendLine("END CATCH;") | Out-Null
$outputSql.AppendLine("GO") | Out-Null

$backupFilePath = "scratch/backup_data_cu_xep_id_dep.sql"
[System.IO.File]::WriteAllText($backupFilePath, $outputSql.ToString(), [System.Text.Encoding]::UTF8)
Write-Host "ĐÃ TẠO THÀNH CÔNG FILE: $backupFilePath"
