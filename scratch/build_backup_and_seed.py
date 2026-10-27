import subprocess
import json
import os

def run_query(sql):
    cmd = [
        "sqlcmd", "-S", "localhost", "-d", "BadmintonShopDB1", "-E", "-y", "0",
        "-Q", f"SET NOCOUNT ON; {sql}"
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    if res.returncode != 0:
        raise Exception(f"SQL Error: {res.stderr}\nOutput: {res.stdout}")
    output = res.stdout.strip()
    return output

def get_json(sql):
    raw = run_query(f"{sql} FOR JSON AUTO;")
    if not raw:
        return []
    return json.loads(raw)

print("Fetching tables...")
sp_list = get_json("SELECT * FROM SanPham ORDER BY id")
print(f"SanPham: {len(sp_list)} rows")

spct_list = get_json("SELECT * FROM SanPhamChiTiet ORDER BY id_san_pham, id")
print(f"SanPhamChiTiet: {len(spct_list)} rows")

ha_list = get_json("SELECT * FROM HinhAnhSanPham ORDER BY id_san_pham_chi_tiet, id")
print(f"HinhAnhSanPham: {len(ha_list)} rows")

spcttt_list = get_json("SELECT * FROM SanPhamChiTietThuocTinh ORDER BY id_san_pham_chi_tiet, id")
print(f"SanPhamChiTietThuocTinh: {len(spcttt_list)} rows")

print("Success!")
