# Vue 3 + Vite

Kính gửi mentor. Đây là file Readme tổng quát về cách cài và chạy dự án.

---

## Các yêu cầu đã làm:

1. **Hiển thị danh sách:**
   - Hiển thị danh sách sản phẩm trên desktop (dạng bảng) và mobile (dạng thẻ).
   - Hai kích thước 375px và 768px đang hiển thị dạng thẻ.
   - Đối với kích thước 1280px sẽ hiển thị dạng bảng.
   - Các sản phẩm hết hàng sẽ hiển thị là hết hàng và highlight màu đỏ.

2. **Tìm kiếm và lọc:**
   - Có 3 dropdown để lọc theo danh mục, hãng và trạng thái sản phẩm.
   - Có một field input để thực hiện lọc và tìm kiếm theo tên.
   - Có thể thực hiện lọc và tìm kiếm kết hợp với nhau.
   - Đã có nút xóa bộ lọc.
   - Hiển thị thông báo "Không tìm thấy sản phẩm phù hợp" đối với trường hợp khi không có kết quả tìm kiếm.

3. **Sắp xếp và phân trang:**
   - Đã có phân trang & chuyển trang.
   - Khi reset tự động quay về trang 1.

4. **Thêm, Sửa, Xóa:**
   - Đã có thêm/sửa/xóa qua một trang riêng thông qua router.
   - Có validate cho các phần như bắt buộc điền thông tin và không được để trống, giá và số lượng không được âm.
   - Xóa có hộp thoại xác nhận.

5. **Tổ chức code và responsive:**
   - Đã thực hiện chia ra thành nhiều component (Pagination, ProductCard, ProductFilter, ProductForm, ProductList, ProductTable).
   - Thực hiện sử dụng props và emits để giao tiếp.
   - Đã thực hiện responsive ở 3 kích thước đã nêu.

---

## Hướng dẫn cài đặt và khởi chạy

```bash
# 1. Clone repository về máy
git clone [https://github.com/tinhrenzi/bai_test_vue.js.git](https://github.com/tinhrenzi/bai_test_vue.js.git)

# 2. Di chuyển vào thư mục dự án
cd bai_test_vue.js

# 3. Cài đặt các thư viện phụ thuộc (Bắt buộc)
npm install

# 4. Chạy dự án
npm run dev
