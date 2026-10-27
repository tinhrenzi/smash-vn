$connectionString = "Server=localhost;Database=BadmintonShopDB1;Integrated Security=True;TrustServerCertificate=True;"
$connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
$connection.Open()

function Export-TableJson($query) {
    $command = $connection.CreateCommand()
    $command.CommandText = $query
    $adapter = New-Object System.Data.SqlClient.SqlDataAdapter($command)
    $table = New-Object System.Data.DataTable
    $adapter.Fill($table) | Out-Null
    
    $list = New-Object System.Collections.ArrayList
    foreach ($row in $table.Rows) {
        $dict = [ordered]@{}
        foreach ($col in $table.Columns) {
            $val = $row[$col.ColumnName]
            if ([System.DBNull]::Value.Equals($val)) {
                $dict[$col.ColumnName] = $null
            } elseif ($val -is [System.DateTime]) {
                $dict[$col.ColumnName] = $val.ToString("yyyy-MM-dd HH:mm:ss")
            } elseif ($val -is [decimal] -or $val -is [double] -or $val -is [float]) {
                $dict[$col.ColumnName] = [double]$val
            } elseif ($val -is [bool]) {
                $dict[$col.ColumnName] = [bool]$val
            } else {
                $dict[$col.ColumnName] = $val
            }
        }
        [void]$list.Add($dict)
    }
    return $list
}

$dump = [ordered]@{
    SanPham = Export-TableJson "SELECT * FROM SanPham ORDER BY id"
    SanPhamChiTiet = Export-TableJson "SELECT * FROM SanPhamChiTiet ORDER BY id_san_pham, id"
    HinhAnhSanPham = Export-TableJson "SELECT * FROM HinhAnhSanPham ORDER BY id_san_pham_chi_tiet, id"
    SanPhamChiTietThuocTinh = Export-TableJson "SELECT * FROM SanPhamChiTietThuocTinh ORDER BY id_san_pham_chi_tiet, id"
    PhieuNhapChiTiet = Export-TableJson "SELECT * FROM PhieuNhapChiTiet ORDER BY id"
    HoaDonChiTiet = Export-TableJson "SELECT * FROM HoaDonChiTiet ORDER BY id"
    GioHangChiTiet = Export-TableJson "SELECT * FROM GioHangChiTiet ORDER BY id"
    DanhGia = Export-TableJson "SELECT * FROM DanhGia ORDER BY id"
    SanPhamYeuThich = Export-TableJson "SELECT * FROM SanPhamYeuThich"
    SanPham_DotGiamGia = Export-TableJson "SELECT * FROM SanPham_DotGiamGia"
    CommentViolationLog = Export-TableJson "SELECT * FROM CommentViolationLog ORDER BY id"
    DanhMuc = Export-TableJson "SELECT * FROM DanhMuc ORDER BY id"
    ThuongHieu = Export-TableJson "SELECT * FROM ThuongHieu ORDER BY id"
    ThuocTinh = Export-TableJson "SELECT * FROM ThuocTinh ORDER BY id"
    DanhMucThuocTinh = Export-TableJson "SELECT * FROM DanhMucThuocTinh ORDER BY id"
}

$connection.Close()

$json = $dump | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText("scratch/db_dump.json", $json, [System.Text.Encoding]::UTF8)
Write-Host "EXPORT THÀNH CÔNG TOÀN BỘ DATA VÀO scratch/db_dump.json!"
foreach ($key in $dump.Keys) {
    Write-Host "  - $key : $($dump[$key].Count) dòng"
}
