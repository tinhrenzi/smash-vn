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
            } else {
                $dict[$col.ColumnName] = $val
            }
        }
        [void]$list.Add($dict)
    }
    return $list
}

$sp = Export-TableJson "SELECT * FROM SanPham ORDER BY id"
$connection.Close()

$json = $sp | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText("scratch/test_sp.json", $json, [System.Text.Encoding]::UTF8)
Write-Host "Exported $($sp.Count) products to scratch/test_sp.json"
