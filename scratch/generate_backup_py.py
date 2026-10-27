import json
import os

def escape_sql_val(val):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "1" if val else "0"
    if isinstance(val, (int, float)):
        return str(val)
    # String
    escaped = str(val).replace("'", "''")
    return f"N'{escaped}'"

def main():
    dump_path = "scratch/db_dump.json"
    if not os.path.exists(dump_path):
        print(f"Error: {dump_path} not found.")
        return

    with open(dump_path, "r", encoding="utf-8-sig") as f:
        data = json.load(f)

    # =========================================================================
    # PHẦN 1: TẠO FILE BACKUP DATA CŨ VỚI ID ĐƯỢC XẾP LẠI ĐẸP TUẦN TỰ TỪ 1
    # =========================================================================
    print("1. Đang xử lý tạo file backup_data_cu_xep_id_dep.sql...")
    
    sp_old_to_new = {}
    new_sp_id = 1
    for sp in data["SanPham"]:
        sp_old_to_new[sp["id"]] = new_sp_id
        new_sp_id += 1

    spct_old_to_new = {}
    new_spct_id = 1
    for spct in data["SanPhamChiTiet"]:
        spct_old_to_new[spct["id"]] = new_spct_id
        new_spct_id += 1

    backup_sql = []
    backup_sql.append("/*")
    backup_sql.append("===============================================================================")
    backup_sql.append(" SMASH-VN: FILE BACKUP DỮ LIỆU SẢN PHẨM CŨ (ĐÃ SẮP XẾP LẠI ID TUẦN TỰ ĐẸP)")
    backup_sql.append(" Mô tả:")
    backup_sql.append(f"   - Toàn bộ {len(sp_old_to_new)} sản phẩm cũ được xếp lại ID tuần tự từ 1 đến {len(sp_old_to_new)}.")
    backup_sql.append(f"   - Toàn bộ {len(spct_old_to_new)} biến thể cũ được xếp lại ID tuần tự từ 1 đến {len(spct_old_to_new)}.")
    backup_sql.append("   - Toàn bộ liên kết ngoại (Ảnh, Thuộc tính, Phiếu nhập, Hóa đơn, Giỏ hàng, Đánh giá, Giảm giá) đều được map chuẩn xác.")
    backup_sql.append("   - Chạy script này bất cứ lúc nào để phục hồi dữ liệu cũ sạch đẹp.")
    backup_sql.append("===============================================================================")
    backup_sql.append("*/")
    backup_sql.append("USE [BadmintonShopDB1];")
    backup_sql.append("GO")
    backup_sql.append("SET ANSI_NULLS ON;")
    backup_sql.append("SET QUOTED_IDENTIFIER ON;")
    backup_sql.append("SET NOCOUNT ON;")
    backup_sql.append("BEGIN TRANSACTION;")
    backup_sql.append("BEGIN TRY")
    backup_sql.append("    PRINT N'1. Đang dọn dẹp dữ liệu sản phẩm cũ...';")
    backup_sql.append("    DELETE FROM [dbo].[CommentViolationLog];")
    backup_sql.append("    DELETE FROM [dbo].[HinhAnhDanhGia];")
    backup_sql.append("    DELETE FROM [dbo].[DanhGia];")
    backup_sql.append("    DELETE FROM [dbo].[GioHangChiTiet];")
    backup_sql.append("    DELETE FROM [dbo].[HoaDonChiTiet];")
    backup_sql.append("    DELETE FROM [dbo].[PhieuNhapChiTiet];")
    backup_sql.append("    DELETE FROM [dbo].[SanPhamYeuThich];")
    backup_sql.append("    DELETE FROM [dbo].[SanPham_DotGiamGia];")
    backup_sql.append("    DELETE FROM [dbo].[HinhAnhSanPham];")
    backup_sql.append("    DELETE FROM [dbo].[SanPhamChiTietThuocTinh];")
    backup_sql.append("    DELETE FROM [dbo].[SanPhamChiTiet];")
    backup_sql.append("    DELETE FROM [dbo].[SanPham];")
    backup_sql.append("")

    # SanPham
    backup_sql.append(f"    PRINT N'2. Đang nạp SanPham (ID 1 -> {len(sp_old_to_new)})...';")
    backup_sql.append("    SET IDENTITY_INSERT [dbo].[SanPham] ON;")
    for sp in data["SanPham"]:
        cur_id = sp_old_to_new[sp["id"]]
        ma_sp = f"SP{cur_id:06d}"
        ten = escape_sql_val(sp.get("ten_san_pham"))
        id_dm = escape_sql_val(sp.get("id_danh_muc"))
        id_th = escape_sql_val(sp.get("id_thuong_hieu"))
        id_nv = escape_sql_val(sp.get("id_nhan_vien") or 1)
        mo_ta = escape_sql_val(sp.get("mo_ta"))
        tt = escape_sql_val(sp.get("trang_thai") if sp.get("trang_thai") is not None else 1)
        sl_dg = escape_sql_val(sp.get("so_luot_danh_gia") or 0)
        dtb = escape_sql_val(sp.get("diem_trung_binh") or 0.0)
        ngay_tao = escape_sql_val(sp.get("ngay_tao"))
        ngay_cn = escape_sql_val(sp.get("ngay_cap_nhat"))
        backup_sql.append(f"    INSERT INTO [dbo].[SanPham] ([id],[ma_san_pham],[ten_san_pham],[id_danh_muc],[id_thuong_hieu],[id_nhan_vien],[mo_ta],[trang_thai],[so_luot_danh_gia],[diem_trung_binh],[ngay_tao],[ngay_cap_nhat]) VALUES ({cur_id}, '{ma_sp}', {ten}, {id_dm}, {id_th}, {id_nv}, {mo_ta}, {tt}, {sl_dg}, {dtb}, {ngay_tao}, {ngay_cn});")
    backup_sql.append("    SET IDENTITY_INSERT [dbo].[SanPham] OFF;")
    backup_sql.append(f"    DBCC CHECKIDENT ('[dbo].[SanPham]', RESEED, {len(sp_old_to_new)});")
    backup_sql.append("")

    # SanPhamChiTiet
    backup_sql.append(f"    PRINT N'3. Đang nạp SanPhamChiTiet (ID 1 -> {len(spct_old_to_new)})...';")
    backup_sql.append("    SET IDENTITY_INSERT [dbo].[SanPhamChiTiet] ON;")
    for spct in data["SanPhamChiTiet"]:
        cur_id = spct_old_to_new[spct["id"]]
        new_sp_id_val = sp_old_to_new[spct["id_san_pham"]]
        ma_sp = f"SP{new_sp_id_val:06d}"
        sku = f"{ma_sp}-V{cur_id:06d}"
        g_nhap = escape_sql_val(spct.get("gia_nhap") or 0)
        g_ban = escape_sql_val(spct.get("gia_ban") or 0)
        sl_ton = escape_sql_val(spct.get("so_luong_ton") or 0)
        sl_loi = escape_sql_val(spct.get("so_luong_sp_loi") or 0)
        tt = escape_sql_val(spct.get("trang_thai") if spct.get("trang_thai") is not None else 1)
        ngay_tao = escape_sql_val(spct.get("ngay_tao"))
        ngay_cn = escape_sql_val(spct.get("ngay_cap_nhat"))
        backup_sql.append(f"    INSERT INTO [dbo].[SanPhamChiTiet] ([id],[id_san_pham],[sku],[gia_nhap],[gia_ban],[so_luong_ton],[so_luong_sp_loi],[trang_thai],[ngay_tao],[ngay_cap_nhat]) VALUES ({cur_id}, {new_sp_id_val}, '{sku}', {g_nhap}, {g_ban}, {sl_ton}, {sl_loi}, {tt}, {ngay_tao}, {ngay_cn});")
    backup_sql.append("    SET IDENTITY_INSERT [dbo].[SanPhamChiTiet] OFF;")
    backup_sql.append(f"    DBCC CHECKIDENT ('[dbo].[SanPhamChiTiet]', RESEED, {len(spct_old_to_new)});")
    backup_sql.append("")

    # HinhAnhSanPham
    backup_sql.append(f"    PRINT N'4. Đang nạp HinhAnhSanPham ({len(data['HinhAnhSanPham'])} ảnh)...';")
    backup_sql.append("    SET IDENTITY_INSERT [dbo].[HinhAnhSanPham] ON;")
    ha_id = 1
    for ha in data["HinhAnhSanPham"]:
        if ha["id_san_pham_chi_tiet"] in spct_old_to_new:
            new_spct_id_val = spct_old_to_new[ha["id_san_pham_chi_tiet"]]
            url = escape_sql_val(ha.get("url_hinh_anh"))
            mau = escape_sql_val(ha.get("mau_sac"))
            la_chinh = escape_sql_val(ha.get("la_anh_chinh"))
            thu_tu = escape_sql_val(ha.get("thu_tu") or 0)
            backup_sql.append(f"    INSERT INTO [dbo].[HinhAnhSanPham] ([id],[id_san_pham_chi_tiet],[url_hinh_anh],[mau_sac],[la_anh_chinh],[thu_tu]) VALUES ({ha_id}, {new_spct_id_val}, {url}, {mau}, {la_chinh}, {thu_tu});")
            ha_id += 1
    backup_sql.append("    SET IDENTITY_INSERT [dbo].[HinhAnhSanPham] OFF;")
    backup_sql.append(f"    DBCC CHECKIDENT ('[dbo].[HinhAnhSanPham]', RESEED, {ha_id - 1});")
    backup_sql.append("")

    # SanPhamChiTietThuocTinh
    backup_sql.append(f"    PRINT N'5. Đang nạp SanPhamChiTietThuocTinh ({len(data['SanPhamChiTietThuocTinh'])} dòng)...';")
    backup_sql.append("    SET IDENTITY_INSERT [dbo].[SanPhamChiTietThuocTinh] ON;")
    spcttt_id = 1
    for tt in data["SanPhamChiTietThuocTinh"]:
        if tt["id_san_pham_chi_tiet"] in spct_old_to_new:
            new_spct_id_val = spct_old_to_new[tt["id_san_pham_chi_tiet"]]
            id_tt = escape_sql_val(tt.get("id_thuoc_tinh"))
            val = escape_sql_val(tt.get("gia_tri"))
            backup_sql.append(f"    INSERT INTO [dbo].[SanPhamChiTietThuocTinh] ([id],[id_san_pham_chi_tiet],[id_thuoc_tinh],[gia_tri]) VALUES ({spcttt_id}, {new_spct_id_val}, {id_tt}, {val});")
            spcttt_id += 1
    backup_sql.append("    SET IDENTITY_INSERT [dbo].[SanPhamChiTietThuocTinh] OFF;")
    backup_sql.append(f"    DBCC CHECKIDENT ('[dbo].[SanPhamChiTietThuocTinh]', RESEED, {spcttt_id - 1});")
    backup_sql.append("")

    # PhieuNhapChiTiet
    backup_sql.append("    PRINT N'6. Đang nạp PhieuNhapChiTiet...';")
    backup_sql.append("    SET IDENTITY_INSERT [dbo].[PhieuNhapChiTiet] ON;")
    pnct_new_id = 1
    for pnct in data["PhieuNhapChiTiet"]:
        if pnct["id_san_pham_chi_tiet"] in spct_old_to_new:
            new_spct_id_val = spct_old_to_new[pnct["id_san_pham_chi_tiet"]]
            id_pn = escape_sql_val(pnct.get("id_phieu_nhap"))
            sl = escape_sql_val(pnct.get("so_luong"))
            g_nhap = escape_sql_val(pnct.get("gia_nhap"))
            tt = escape_sql_val(pnct.get("thanh_tien"))
            backup_sql.append(f"    INSERT INTO [dbo].[PhieuNhapChiTiet] ([id],[id_phieu_nhap],[id_san_pham_chi_tiet],[so_luong],[gia_nhap],[thanh_tien]) VALUES ({pnct_new_id}, {id_pn}, {new_spct_id_val}, {sl}, {g_nhap}, {tt});")
            pnct_new_id += 1
    backup_sql.append("    SET IDENTITY_INSERT [dbo].[PhieuNhapChiTiet] OFF;")
    backup_sql.append(f"    DBCC CHECKIDENT ('[dbo].[PhieuNhapChiTiet]', RESEED, {pnct_new_id - 1 if pnct_new_id > 1 else 0});")
    backup_sql.append("")

    # HoaDonChiTiet
    backup_sql.append("    PRINT N'7. Đang nạp HoaDonChiTiet...';")
    backup_sql.append("    SET IDENTITY_INSERT [dbo].[HoaDonChiTiet] ON;")
    hdct_new_id = 1
    for hdct in data["HoaDonChiTiet"]:
        if hdct["id_san_pham_chi_tiet"] in spct_old_to_new:
            new_spct_id_val = spct_old_to_new[hdct["id_san_pham_chi_tiet"]]
            id_hd = escape_sql_val(hdct.get("id_hoa_don"))
            sl = escape_sql_val(hdct.get("so_luong"))
            dg = escape_sql_val(hdct.get("don_gia"))
            gg = escape_sql_val(hdct.get("gia_goc"))
            gsg = escape_sql_val(hdct.get("gia_sau_giam"))
            ten_sp_sn = escape_sql_val(hdct.get("ten_san_pham_snapshot"))
            sku_sn = escape_sql_val(hdct.get("sku_snapshot"))
            ngay_tao = escape_sql_val(hdct.get("ngay_tao"))
            ten_dgg_sn = escape_sql_val(hdct.get("ten_dot_giam_gia_snapshot"))
            tt_sn = escape_sql_val(hdct.get("thuoc_tinh_snapshot"))
            backup_sql.append(f"    INSERT INTO [dbo].[HoaDonChiTiet] ([id],[id_hoa_don],[id_san_pham_chi_tiet],[so_luong],[don_gia],[gia_goc],[gia_sau_giam],[ten_san_pham_snapshot],[sku_snapshot],[ngay_tao],[ten_dot_giam_gia_snapshot],[thuoc_tinh_snapshot]) VALUES ({hdct_new_id}, {id_hd}, {new_spct_id_val}, {sl}, {dg}, {gg}, {gsg}, {ten_sp_sn}, {sku_sn}, {ngay_tao}, {ten_dgg_sn}, {tt_sn});")
            hdct_new_id += 1
    backup_sql.append("    SET IDENTITY_INSERT [dbo].[HoaDonChiTiet] OFF;")
    backup_sql.append(f"    DBCC CHECKIDENT ('[dbo].[HoaDonChiTiet]', RESEED, {hdct_new_id - 1 if hdct_new_id > 1 else 0});")
    backup_sql.append("")

    # GioHangChiTiet
    backup_sql.append("    PRINT N'8. Đang nạp GioHangChiTiet...';")
    backup_sql.append("    SET IDENTITY_INSERT [dbo].[GioHangChiTiet] ON;")
    ghct_new_id = 1
    for ghct in data["GioHangChiTiet"]:
        if ghct["id_san_pham_chi_tiet"] in spct_old_to_new:
            new_spct_id_val = spct_old_to_new[ghct["id_san_pham_chi_tiet"]]
            id_gh = escape_sql_val(ghct.get("id_gio_hang"))
            sl = escape_sql_val(ghct.get("so_luong"))
            ngay_tao = escape_sql_val(ghct.get("ngay_tao"))
            backup_sql.append(f"    INSERT INTO [dbo].[GioHangChiTiet] ([id],[id_gio_hang],[id_san_pham_chi_tiet],[so_luong],[ngay_tao]) VALUES ({ghct_new_id}, {id_gh}, {new_spct_id_val}, {sl}, {ngay_tao});")
            ghct_new_id += 1
    backup_sql.append("    SET IDENTITY_INSERT [dbo].[GioHangChiTiet] OFF;")
    backup_sql.append(f"    DBCC CHECKIDENT ('[dbo].[GioHangChiTiet]', RESEED, {ghct_new_id - 1 if ghct_new_id > 1 else 0});")
    backup_sql.append("")

    # DanhGia
    backup_sql.append("    PRINT N'9. Đang nạp DanhGia...';")
    backup_sql.append("    SET IDENTITY_INSERT [dbo].[DanhGia] ON;")
    dg_old_to_new = {}
    dg_new_id = 1
    for dg in data["DanhGia"]:
        if dg["id_san_pham"] in sp_old_to_new:
            new_sp_id_val = sp_old_to_new[dg["id_san_pham"]]
            dg_old_to_new[dg["id"]] = dg_new_id
            id_kh = escape_sql_val(dg.get("id_khach_hang"))
            so_sao = escape_sql_val(dg.get("so_sao"))
            noi_dung = escape_sql_val(dg.get("noi_dung"))
            ngay_tao = escape_sql_val(dg.get("ngay_tao"))
            bl_an = escape_sql_val(dg.get("binh_luan_an"))
            ha_an = escape_sql_val(dg.get("hinh_anh_an"))
            ngay_cn = escape_sql_val(dg.get("ngay_cap_nhat"))
            id_nv = escape_sql_val(dg.get("id_nhan_vien"))
            da_xoa = escape_sql_val(dg.get("da_xoa"))
            backup_sql.append(f"    INSERT INTO [dbo].[DanhGia] ([id],[id_khach_hang],[id_san_pham],[so_sao],[noi_dung],[ngay_tao],[binh_luan_an],[hinh_anh_an],[ngay_cap_nhat],[id_nhan_vien],[da_xoa]) VALUES ({dg_new_id}, {id_kh}, {new_sp_id_val}, {so_sao}, {noi_dung}, {ngay_tao}, {bl_an}, {ha_an}, {ngay_cn}, {id_nv}, {da_xoa});")
            dg_new_id += 1
    backup_sql.append("    SET IDENTITY_INSERT [dbo].[DanhGia] OFF;")
    backup_sql.append(f"    DBCC CHECKIDENT ('[dbo].[DanhGia]', RESEED, {dg_new_id - 1 if dg_new_id > 1 else 0});")
    backup_sql.append("")

    # SanPham_DotGiamGia
    backup_sql.append("    PRINT N'10. Đang nạp SanPham_DotGiamGia...';")
    for spdgg in data["SanPham_DotGiamGia"]:
        if spdgg["id_san_pham"] in sp_old_to_new:
            new_sp_id_val = sp_old_to_new[spdgg["id_san_pham"]]
            id_dgg = escape_sql_val(spdgg.get("id_dot_giam_gia"))
            backup_sql.append(f"    INSERT INTO [dbo].[SanPham_DotGiamGia] ([id_san_pham],[id_dot_giam_gia]) VALUES ({new_sp_id_val}, {id_dgg});")
    backup_sql.append("")

    # CommentViolationLog
    backup_sql.append("    PRINT N'11. Đang nạp CommentViolationLog...';")
    backup_sql.append("    SET IDENTITY_INSERT [dbo].[CommentViolationLog] ON;")
    cvl_new_id = 1
    for cvl in data["CommentViolationLog"]:
        old_sp_id = cvl.get("id_san_pham")
        new_sp_id_val = str(sp_old_to_new[old_sp_id]) if old_sp_id in sp_old_to_new else "NULL"
        old_dg_id = cvl.get("id_danh_gia")
        new_dg_id_val = str(dg_old_to_new[old_dg_id]) if old_dg_id in dg_old_to_new else "NULL"
        id_tk = escape_sql_val(cvl.get("id_tai_khoan"))
        nd_goc = escape_sql_val(cvl.get("noi_dung_goc"))
        nd_loc = escape_sql_val(cvl.get("noi_dung_da_loc"))
        muc_do = escape_sql_val(cvl.get("muc_do_vi_pham"))
        so_lan = escape_sql_val(cvl.get("so_lan_vi_pham"))
        ngay_vp = escape_sql_val(cvl.get("ngay_vi_pham"))
        ngay_tao = escape_sql_val(cvl.get("ngay_tao"))
        backup_sql.append(f"    INSERT INTO [dbo].[CommentViolationLog] ([id],[id_tai_khoan],[id_danh_gia],[id_san_pham],[noi_dung_goc],[noi_dung_da_loc],[muc_do_vi_pham],[so_lan_vi_pham],[ngay_vi_pham],[ngay_tao]) VALUES ({cvl_new_id}, {id_tk}, {new_dg_id_val}, {new_sp_id_val}, {nd_goc}, {nd_loc}, {muc_do}, {so_lan}, {ngay_vp}, {ngay_tao});")
        cvl_new_id += 1
    backup_sql.append("    SET IDENTITY_INSERT [dbo].[CommentViolationLog] OFF;")
    backup_sql.append(f"    DBCC CHECKIDENT ('[dbo].[CommentViolationLog]', RESEED, {cvl_new_id - 1 if cvl_new_id > 1 else 0});")
    backup_sql.append("")

    backup_sql.append("    COMMIT TRANSACTION;")
    backup_sql.append("    PRINT N'===========================================================';")
    backup_sql.append("    PRINT N'===> ĐÃ KHÔI PHỤC THÀNH CÔNG DỮ LIỆU CŨ VỚI ID ĐẸP TUẦN TỰ!';")
    backup_sql.append("    PRINT N'===========================================================';")
    backup_sql.append("END TRY")
    backup_sql.append("BEGIN CATCH")
    backup_sql.append("    ROLLBACK TRANSACTION;")
    backup_sql.append("    PRINT N'LỖI KHI KHÔI PHỤC: ' + ERROR_MESSAGE();")
    backup_sql.append("    THROW;")
    backup_sql.append("END CATCH;")
    backup_sql.append("GO")

    backup_file_path = "scratch/backup_data_cu_xep_id_dep.sql"
    with open(backup_file_path, "w", encoding="utf-8") as f:
        f.write("\n".join(backup_sql))
    print(f"-> Tạo xong {backup_file_path} ({len(backup_sql)} dòng).")

if __name__ == "__main__":
    main()
