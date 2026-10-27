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

Write-Host "Fetching tables from BadmintonShopDB1..."

$sanPhamTable = Get-TableData "SELECT * FROM SanPham ORDER BY id"
$spctTable = Get-TableData "SELECT * FROM SanPhamChiTiet ORDER BY id_san_pham, id"
$haTable = Get-TableData "SELECT * FROM HinhAnhSanPham ORDER BY id_san_pham_chi_tiet, la_anh_chinh DESC, id"
$spctttTable = Get-TableData "SELECT * FROM SanPhamChiTietThuocTinh ORDER BY id_san_pham_chi_tiet, id_thuoc_tinh"
$pnctTable = Get-TableData "SELECT * FROM PhieuNhapChiTiet ORDER BY id"
$hdctTable = Get-TableData "SELECT * FROM HoaDonChiTiet ORDER BY id"
$ghctTable = Get-TableData "SELECT * FROM GioHangChiTiet ORDER BY id"
$dgTable = Get-TableData "SELECT * FROM DanhGia ORDER BY id"
$spytTable = Get-TableData "SELECT * FROM SanPhamYeuThich ORDER BY id"
$spdggTable = Get-TableData "SELECT * FROM SanPham_DotGiamGia ORDER BY id_san_pham"
$cvlTable = Get-TableData "SELECT * FROM CommentViolationLog ORDER BY id"

$connection.Close()

Write-Host "SanPham count: " $sanPhamTable.Rows.Count
Write-Host "SanPhamChiTiet count: " $spctTable.Rows.Count
Write-Host "HinhAnhSanPham count: " $haTable.Rows.Count
Write-Host "SanPhamChiTietThuocTinh count: " $spctttTable.Rows.Count
