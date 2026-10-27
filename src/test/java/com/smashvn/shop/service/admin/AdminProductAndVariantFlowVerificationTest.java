package com.smashvn.shop.service.admin;

import com.smashvn.shop.entity.*;
import com.smashvn.shop.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.DefaultCsrfToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@Transactional
public class AdminProductAndVariantFlowVerificationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private SanPhamRepository sanPhamRepository;

    @Autowired
    private SanPhamChiTietRepository sanPhamChiTietRepository;

    @Autowired
    private DanhMucRepository danhMucRepository;

    @Autowired
    private ThuongHieuRepository thuongHieuRepository;

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    @Autowired
    private NhanVienRepository nhanVienRepository;

    private MockMvc mockMvc;
    private CsrfToken csrfToken;
    private TaiKhoan adminAccount;
    private NhanVien adminEmployee;
    private DanhMuc testCategory;
    private ThuongHieu testBrand;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        csrfToken = new DefaultCsrfToken("X-CSRF-TOKEN", "_csrf", "mock-token-value");

        testCategory = danhMucRepository.findByTrangThaiTrue().stream().findFirst().orElseGet(() -> {
            DanhMuc dm = new DanhMuc();
            dm.setTenDanhMuc("Vợt Cầu Lông Test");
            dm.setTrangThai(true);
            return danhMucRepository.save(dm);
        });

        testBrand = thuongHieuRepository.findByTrangThaiTrue().stream().findFirst().orElseGet(() -> {
            ThuongHieu th = new ThuongHieu();
            th.setTenThuongHieu("Yonex Test");
            th.setTrangThai(true);
            return thuongHieuRepository.save(th);
        });

        adminAccount = new TaiKhoan();
        adminAccount.setUsername("admin_flow_test_" + System.currentTimeMillis());
        adminAccount.setMatKhau("123456");
        adminAccount.setVaiTro("QL");
        adminAccount.setTrangThaiTaiKhoan(AccountStatus.ACTIVE);
        adminAccount = taiKhoanRepository.save(adminAccount);

        adminEmployee = new NhanVien();
        adminEmployee.setTaiKhoan(adminAccount);
        adminEmployee.setHoTenNv("Admin Flow Tester");
        adminEmployee.setChucVu("Quản lý");
        adminEmployee.setSoDienThoaiNv("0988888888");
        adminEmployee = nhanVienRepository.save(adminEmployee);
    }

    private byte[] createValidImageBytes() throws Exception {
        BufferedImage img = new BufferedImage(100, 100, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        javax.imageio.ImageIO.write(img, "png", baos);
        return baos.toByteArray();
    }

    @Test
    void testComprehensiveProductAndVariantFlow() throws Exception {
        // =========================================================================
        // BƯỚC 1: KIỂM TRA THÊM SẢN PHẨM MỚI (CÓ BIẾN THỂ BAN ĐẦU)
        // =========================================================================
        byte[] imgBytes = createValidImageBytes();
        MockMultipartFile fileAnh = new MockMultipartFile("fileAnh", "main.png", "image/png", imgBytes);

        mockMvc.perform(multipart("/admin/san-pham/them")
                        .file(fileAnh)
                        .param("tenSanPham", "Vợt Smash Test Flow 100")
                        .param("idDanhMuc", testCategory.getId().toString())
                        .param("idThuongHieu", testBrand.getId().toString())
                        .param("moTa", "Mô tả sản phẩm kiểm thử luồng")
                        .param("variants[0].mauSac", "Đỏ")
                        .param("variants[0].trongLuong", "4U")
                        .param("variants[0].giaBan", "2500000")
                        .param("variants[0].giaNhap", "2000000")
                        .param("variants[0].soLuongTon", "15")
                        .sessionAttr("idNguoiDung", adminAccount.getId())
                        .sessionAttr("vaiTro", "QL")
                        .requestAttr("_csrf", csrfToken))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin/san-pham"))
                .andExpect(flash().attributeExists("success"));

        // Xác nhận đã lưu trong database
        List<SanPham> spList = sanPhamRepository.findAll();
        SanPham createdSp = spList.stream()
                .filter(sp -> "Vợt Smash Test Flow 100".equals(sp.getTenSanPham()))
                .findFirst()
                .orElse(null);
        assertNotNull(createdSp, "Sản phẩm mới phải được tạo trong database");
        assertEquals("dang_ban", createdSp.getTrangThai());
        assertNotNull(createdSp.getMaSanPham(), "Sản phẩm phải có mã sản phẩm tự sinh");

        // Kiểm tra biến thể sinh ra
        List<SanPhamChiTiet> initialVariants = sanPhamChiTietRepository.findBySanPham_Id(createdSp.getId());
        assertEquals(1, initialVariants.size());
        SanPhamChiTiet var1 = initialVariants.get(0);
        assertEquals(new BigDecimal("2500000"), var1.getGiaBan());
        assertEquals(15, var1.getSoLuongTon());
        assertEquals("dang_ban", var1.getTrangThai());

        // Kiểm tra HIỂN THỊ trên trang danh sách sản phẩm (/admin/san-pham)
        mockMvc.perform(get("/admin/san-pham")
                        .sessionAttr("idNguoiDung", adminAccount.getId())
                        .sessionAttr("vaiTro", "QL")
                        .requestAttr("_csrf", csrfToken))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Vợt Smash Test Flow 100")))
                .andExpect(content().string(containsString("Đang hiển thị")))
                .andExpect(content().string(containsString(createdSp.getMaSanPham())));

        // =========================================================================
        // BƯỚC 2: KIỂM TRA SỬA THÔNG TIN SẢN PHẨM GỐC
        // =========================================================================
        mockMvc.perform(post("/admin/san-pham/sua/{id}", createdSp.getId())
                        .param("tenSanPham", "Vợt Smash Test Flow 100 Đã Đổi Tên")
                        .param("idDanhMuc", testCategory.getId().toString())
                        .param("idThuongHieu", testBrand.getId().toString())
                        .param("moTa", "Mô tả mới sau khi chỉnh sửa")
                        .sessionAttr("idNguoiDung", adminAccount.getId())
                        .sessionAttr("vaiTro", "QL")
                        .requestAttr("_csrf", csrfToken))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin/san-pham/sua/" + createdSp.getId()))
                .andExpect(flash().attribute("success", "Cập nhật thông tin sản phẩm thành công!"));

        SanPham updatedSp = sanPhamRepository.findById(createdSp.getId()).orElseThrow();
        assertEquals("Vợt Smash Test Flow 100 Đã Đổi Tên", updatedSp.getTenSanPham());
        assertEquals("Mô tả mới sau khi chỉnh sửa", updatedSp.getMoTa());

        // Kiểm tra render trang sửa sản phẩm
        mockMvc.perform(get("/admin/san-pham/sua/{id}", createdSp.getId())
                        .sessionAttr("idNguoiDung", adminAccount.getId())
                        .sessionAttr("vaiTro", "QL")
                        .requestAttr("_csrf", csrfToken))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Vợt Smash Test Flow 100 Đã Đổi Tên")))
                .andExpect(content().string(containsString("Mô tả mới sau khi chỉnh sửa")));

        // =========================================================================
        // BƯỚC 3: KIỂM TRA THÊM BIẾN THỂ MỚI CHO SẢN PHẨM
        // =========================================================================
        MockMultipartFile fileAnhBienThe = new MockMultipartFile("fileAnh", "variant.png", "image/png", imgBytes);
        mockMvc.perform(multipart("/admin/san-pham/{idSP}/bien-the/them", createdSp.getId())
                        .file(fileAnhBienThe)
                        .param("giaBan", "2800000")
                        .param("giaNhap", "2200000")
                        .param("soLuongTon", "20")
                        .param("mauSac", "Xanh")
                        .param("trongLuong", "3U")
                        .param("mucCang", "22 - 28 lbs")
                        .sessionAttr("idNguoiDung", adminAccount.getId())
                        .sessionAttr("vaiTro", "QL")
                        .requestAttr("_csrf", csrfToken))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin/san-pham/sua/" + createdSp.getId()))
                .andExpect(flash().attribute("success", "Thêm biến thể mới thành công!"));

        List<SanPhamChiTiet> variantsAfterAdd = sanPhamChiTietRepository.findBySanPham_Id(createdSp.getId());
        assertEquals(2, variantsAfterAdd.size());

        // Kiểm tra biến thể mới thêm
        SanPhamChiTiet var2 = variantsAfterAdd.stream()
                .filter(v -> "Xanh".equalsIgnoreCase(v.getMauSac()))
                .findFirst()
                .orElse(null);
        assertNotNull(var2);
        assertEquals("3U", var2.getTrongLuong());
        assertEquals(new BigDecimal("2800000"), var2.getGiaBan());
        assertEquals(20, var2.getSoLuongTon());
        assertEquals("dang_ban", var2.getTrangThai());

        // Kiểm tra HIỂN THỊ bảng biến thể trên giao diện trang sửa
        // Thuộc tính phải hiển thị theo đúng thứ tự ưu tiên chuẩn (Màu sắc trước, Trọng lượng/Kích thước sau)
        String phanLoai = var2.getPhanLoaiHienThi();
        assertTrue(phanLoai.contains("Màu sắc: Xanh"));
        assertTrue(phanLoai.contains("Trọng lượng: 3U"));
        // Xác nhận Màu sắc đứng trước Trọng lượng trong chuỗi
        assertTrue(phanLoai.indexOf("Màu sắc") < phanLoai.indexOf("Trọng lượng"));

        MvcResult editPageResult = mockMvc.perform(get("/admin/san-pham/sua/{id}", createdSp.getId())
                        .sessionAttr("idNguoiDung", adminAccount.getId())
                        .sessionAttr("vaiTro", "QL")
                        .requestAttr("_csrf", csrfToken))
                .andExpect(status().isOk())
                .andReturn();

        String htmlContent = editPageResult.getResponse().getContentAsString();
        assertTrue(htmlContent.contains("2 BT"), "Số lượng biến thể hiển thị phải là 2 BT");
        assertTrue(htmlContent.contains(var2.getSku()), "SKU của biến thể mới phải hiển thị");
        assertTrue(htmlContent.contains("2,800,000 đ"), "Giá bán biến thể mới phải hiển thị");

        // =========================================================================
        // BƯỚC 4: KIỂM TRA SỬA BIẾN THỂ
        // =========================================================================
        MockMultipartFile emptyFile = new MockMultipartFile("fileAnh", "", "image/png", new byte[0]);
        mockMvc.perform(multipart("/admin/san-pham/{idSP}/bien-the/sua/{idBT}", createdSp.getId(), var2.getId())
                        .file(emptyFile)
                        .param("giaBan", "2990000")
                        .param("soLuongTon", "25")
                        .param("mauSac", "Xanh Biển")
                        .param("trongLuong", "3U")
                        .param("mucCang", "22 - 30 lbs")
                        .sessionAttr("idNguoiDung", adminAccount.getId())
                        .sessionAttr("vaiTro", "QL")
                        .requestAttr("_csrf", csrfToken))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin/san-pham/sua/" + createdSp.getId()))
                .andExpect(flash().attribute("success", "Cập nhật biến thể thành công!"));

        SanPhamChiTiet var2Updated = sanPhamChiTietRepository.findById(var2.getId()).orElseThrow();
        assertEquals(new BigDecimal("2990000"), var2Updated.getGiaBan());
        assertEquals(25, var2Updated.getSoLuongTon());
        assertEquals("Xanh Biển", var2Updated.getMauSac());

        // =========================================================================
        // BƯỚC 5: KIỂM TRA ẨN BIẾN THỂ & HIỂN THỊ
        // =========================================================================
        mockMvc.perform(get("/admin/san-pham/{idSP}/bien-the/xoa/{idBT}", createdSp.getId(), var2.getId())
                        .sessionAttr("idNguoiDung", adminAccount.getId())
                        .sessionAttr("vaiTro", "QL")
                        .requestAttr("_csrf", csrfToken))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin/san-pham/sua/" + createdSp.getId()))
                .andExpect(flash().attribute("success", "Đã ẩn biến thể khỏi khách hàng thành công!"));

        SanPhamChiTiet var2Hidden = sanPhamChiTietRepository.findById(var2.getId()).orElseThrow();
        assertEquals("ngung_kinh_doanh", var2Hidden.getTrangThai());

        // Kiểm tra hiển thị sau khi ẩn biến thể: Bảng phải hiện badge "Đã ẩn" và nút "Mở"
        mockMvc.perform(get("/admin/san-pham/sua/{id}", createdSp.getId())
                        .sessionAttr("idNguoiDung", adminAccount.getId())
                        .sessionAttr("vaiTro", "QL")
                        .requestAttr("_csrf", csrfToken))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Đã ẩn")))
                .andExpect(content().string(containsString("mo-ban-lai/" + var2.getId())));

        // =========================================================================
        // BƯỚC 6: KIỂM TRA MỞ LẠI BIẾN THỂ & HIỂN THỊ
        // =========================================================================
        mockMvc.perform(get("/admin/san-pham/{idSP}/bien-the/mo-ban-lai/{idBT}", createdSp.getId(), var2.getId())
                        .sessionAttr("idNguoiDung", adminAccount.getId())
                        .sessionAttr("vaiTro", "QL")
                        .requestAttr("_csrf", csrfToken))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin/san-pham/sua/" + createdSp.getId()))
                .andExpect(flash().attribute("success", "Đã mở bán lại biến thể thành công!"));

        SanPhamChiTiet var2Reopened = sanPhamChiTietRepository.findById(var2.getId()).orElseThrow();
        assertEquals("dang_ban", var2Reopened.getTrangThai());

        // =========================================================================
        // BƯỚC 7: KIỂM TRA ẨN SẢN PHẨM (NGƯNG HIỂN THỊ) & HIỂN THỊ
        // =========================================================================
        mockMvc.perform(post("/admin/san-pham/ngung-hien-thi/{id}", createdSp.getId())
                        .sessionAttr("idNguoiDung", adminAccount.getId())
                        .sessionAttr("vaiTro", "QL")
                        .requestAttr("_csrf", csrfToken))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin/san-pham"))
                .andExpect(flash().attribute("success", "Đã ngưng hiển thị sản phẩm thành công!"));

        SanPham productHidden = sanPhamRepository.findById(createdSp.getId()).orElseThrow();
        assertEquals("ngung_kinh_doanh", productHidden.getTrangThai());

        // Kiểm tra hiển thị trên danh sách sản phẩm: Badge "Ngưng hiển thị", nút "Đăng bán"
        mockMvc.perform(get("/admin/san-pham")
                        .sessionAttr("idNguoiDung", adminAccount.getId())
                        .sessionAttr("vaiTro", "QL")
                        .requestAttr("_csrf", csrfToken))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Ngưng hiển thị")))
                .andExpect(content().string(containsString("dang-ban/" + createdSp.getId())))
                .andExpect(content().string(containsString("xem-truoc/" + createdSp.getId())));

        // =========================================================================
        // BƯỚC 8: KIỂM TRA MỞ BÁN LẠI SẢN PHẨM (ĐĂNG BÁN) & HIỂN THỊ
        // =========================================================================
        mockMvc.perform(post("/admin/san-pham/dang-ban/{id}", createdSp.getId())
                        .sessionAttr("idNguoiDung", adminAccount.getId())
                        .sessionAttr("vaiTro", "QL")
                        .requestAttr("_csrf", csrfToken))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin/san-pham"))
                .andExpect(flash().attribute("success", "Đã đăng bán sản phẩm thành công!"));

        SanPham productPublished = sanPhamRepository.findById(createdSp.getId()).orElseThrow();
        assertEquals("dang_ban", productPublished.getTrangThai());

        // Kiểm tra hiển thị lại trên danh sách: Badge "Đang hiển thị", nút "Ngưng hiển thị"
        mockMvc.perform(get("/admin/san-pham")
                        .sessionAttr("idNguoiDung", adminAccount.getId())
                        .sessionAttr("vaiTro", "QL")
                        .requestAttr("_csrf", csrfToken))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Đang hiển thị")))
                .andExpect(content().string(containsString("ngung-hien-thi/" + createdSp.getId())));
    }
}
