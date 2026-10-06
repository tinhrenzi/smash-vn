package com.smashvn.shop.controller.api;

import com.smashvn.shop.entity.SanPham;
import com.smashvn.shop.repository.DanhMucRepository;
import com.smashvn.shop.repository.SanPhamChiTietRepository;
import com.smashvn.shop.repository.SanPhamRepository;
import com.smashvn.shop.repository.ThuongHieuRepository;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SearchApiController {
    private final SanPhamRepository sanPhamRepository;
    private final SanPhamChiTietRepository sanPhamChiTietRepository;
    private final DanhMucRepository danhMucRepository;
    private final ThuongHieuRepository thuongHieuRepository;

    /**
     * Autocomplete API - trả về top 8 sản phẩm khớp từ khóa (gõ >= 2 ký tự).
     */
    @GetMapping("/search/products")
    public ResponseEntity<List<Map<String, Object>>> searchProducts(
            @RequestParam("q") String q) {
        if (q == null || q.trim().length() < 2) {
            return ResponseEntity.ok(List.of());
        }
        String keyword = Jsoup.clean(q.trim(), Safelist.none());
        List<SanPham> results = sanPhamRepository.searchAutocomplete(
            keyword, PageRequest.of(0, 8));

        List<Map<String, Object>> response = results.stream().map(sp -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", sp.getId());
            map.put("tenSanPham", sp.getTenSanPham());
            map.put("thuongHieu", sp.getThuongHieu() != null ? sp.getThuongHieu().getTenThuongHieu() : "");
            map.put("danhMuc", sp.getDanhMuc() != null ? sp.getDanhMuc().getTenDanhMuc() : "");
            var activeVariants = sanPhamChiTietRepository.findActiveBySanPham_Id(sp.getId());
            if (!activeVariants.isEmpty()) {
                var first = activeVariants.get(0);
                map.put("hinhAnh", first.getHinhAnhSanPham());
                map.put("giaBan", first.getGiaBan());
                map.put("giaSauGiam", sp.getGiaSauGiam(first.getGiaBan()));
            }
            map.put("giamGia", sp.getActiveGiamGiaPhanTram());
            return map;
        }).toList();

        return ResponseEntity.ok(response);
    }

    /**
     * Từ khóa phổ biến API - trả về danh mục, thương hiệu, SP bán chạy khi focus ô tìm kiếm.
     */
    @GetMapping("/search/popular")
    public ResponseEntity<Map<String, Object>> getPopularKeywords() {
        Map<String, Object> result = new HashMap<>();

        // 1. Danh mục (Vợt, Giày, Phụ kiện)
        List<Map<String, Object>> categories = danhMucRepository.findByTrangThaiTrue().stream()
            .map(dm -> Map.<String, Object>of(
                "id", dm.getId(),
                "ten", dm.getTenDanhMuc()
            )).toList();
        result.put("danhMuc", categories);

        // 2. Thương hiệu (Yonex, Victor, Lining, ...)
        List<Map<String, Object>> brands = thuongHieuRepository.findByTrangThaiTrue().stream()
            .map(th -> Map.<String, Object>of(
                "id", th.getId(),
                "ten", th.getTenThuongHieu()
            )).toList();
        result.put("thuongHieu", brands);

        // 3. Sản phẩm bán chạy nhất (top 4)
        List<Map<String, Object>> trending = sanPhamRepository
            .findBestSellers(PageRequest.of(0, 4)).stream()
            .map(sp -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", sp.getId());
                map.put("tenSanPham", sp.getTenSanPham());
                map.put("thuongHieu", sp.getThuongHieu() != null ? sp.getThuongHieu().getTenThuongHieu() : "");
                map.put("danhMuc", sp.getDanhMuc() != null ? sp.getDanhMuc().getTenDanhMuc() : "");
                var activeVariants = sanPhamChiTietRepository.findActiveBySanPham_Id(sp.getId());
                if (!activeVariants.isEmpty()) {
                    var first = activeVariants.get(0);
                    map.put("hinhAnh", first.getHinhAnhSanPham());
                    map.put("giaBan", first.getGiaBan());
                    map.put("giaSauGiam", sp.getGiaSauGiam(first.getGiaBan()));
                }
                map.put("giamGia", sp.getActiveGiamGiaPhanTram());
                return map;
            }).toList();
        result.put("sanPhamNoiBat", trending);

        return ResponseEntity.ok(result);
    }
}
