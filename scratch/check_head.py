import re

sql_file = r'h:\SMASH_VN\SMASH-VN_Shop-ban-vot-cau-long\scratch\BadmintonShopDB1_ban_moi_nhat_.sql'
with open(sql_file, 'r', encoding='utf-8') as f:
    content = f.read()

sp_matches = re.findall(r"INSERT INTO \[dbo\]\.\[SanPham\].*?VALUES\s*\(([^;]+)\);", content)
san_pham_list = []
for i, sp in enumerate(sp_matches, 1):
    parts = [p.strip() for p in sp.split(',')]
    name = sp.split("N'")[1].split("'")[0] if "N'" in sp else ""
    san_pham_list.append({'id': i, 'name': name})

spct_matches = re.findall(r"INSERT INTO \[dbo\]\.\[SanPhamChiTiet\].*?VALUES\s*\(([^;]+)\);(?:\s*--\s*(spct_\d+))?", content)
spct_list = []
for i, (spct, comment) in enumerate(spct_matches, 1):
    parts = [p.strip() for p in spct.split(',')]
    spct_list.append({'id': i, 'id_san_pham': int(parts[0])})

hasp_matches = re.findall(r"INSERT INTO \[dbo\]\.\[HinhAnhSanPham\].*?VALUES\s*\(([^;]+)\);", content)
hasp_map = {}
for h in hasp_matches:
    parts = [p.strip() for p in h.split(',')]
    id_spct = int(parts[0])
    url = h.split("N'")[1].split("'")[0] if "N'" in h else parts[1]
    hasp_map.setdefault(id_spct, []).append(url)

sp_map = {sp['id']: sp['name'] for sp in san_pham_list}

for spct in spct_list[:60]:
    sp_id = spct['id_san_pham']
    sp_name = sp_map.get(sp_id, 'UNKNOWN')
    imgs = hasp_map.get(spct['id'], [])
    img_first = imgs[0] if imgs else 'NO_IMG'
    print(f"SPCT {spct['id']:2d} | SP {sp_id:2d} ({sp_name[:25]:25s}) | IMG: {img_first}")
