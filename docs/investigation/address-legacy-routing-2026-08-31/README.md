# Investigation: địa chỉ mới + GPS → GHN Sandbox legacy routing

Ngày kiểm tra: 31/08/2026 (Asia/Saigon)  
Phạm vi: chỉ điều tra và lưu bằng chứng; không sửa entity, database, DTO, frontend hoặc code ứng dụng.

## Kết luận điều hành

**Mức C — pipeline hiện tại không thể bảo đảm tự động resolve địa chỉ mới + GPS thành ProvinceID/DistrictID/WardCode legacy của GHN Sandbox. Cần một nguồn chuyển đổi địa giới cũ có dữ liệu không gian đã được kiểm định, đồng thời vẫn phải có fallback chọn thủ công.**

- `MapTiler → AddressResolutionService → GHN Sandbox` hiện tại: **0/5** case resolve đủ Ward; cả 5 chỉ dừng ở Province mới.
- MapTiler full JSON và Nominatim full address details không có trường legacy chuẩn hóa đủ ba cấp; chỉ có manh mối tên cũ ngẫu nhiên ở một số điểm.
- Bảng mapping tên cũ–mới của VietMap xác nhận quan hệ nhiều–một, nhưng không có polygon để chọn ward cũ theo GPS.
- VietMap Migration API có contract đúng bài toán (`migrate_type=2`, bắt buộc `focus`), nhưng dự án không có API key; request thật trả HTTP 401, body rỗng. Chưa có bằng chứng runtime cho 5 case này.
- Thử nghiệm point-in-polygon trên GADM 4.1 lấy được tỉnh/huyện cũ ở 5/5, ward cũ đầy đủ ở 4/5; case Vị Thanh trả ward lỗi chỉ là `V`. Bộ dữ liệu này cũng không có license phù hợp để mặc định đưa thẳng vào dự án thương mại.
- Khi đã có old province/district/ward đúng, GHN Sandbox match được duy nhất 8/8 bộ test (5 case chính + 3 điểm cùng phường mới), không dùng fuzzy; một case cần compact-normalization và một case phải bổ sung ward từ provider khác do dữ liệu polygon lỗi.

## 1. Pipeline hiện tại

Luồng code hiện tại:

1. `LocationService` reverse MapTiler và gom `region → province`, một số feature type → district/ward.
2. `AddressResolutionService` chuyển các candidate đó cho `GhnService`.
3. `GhnService` match duy nhất theo exact sau chuẩn hóa/`NameExtension`; không có bước new-address → old-address.

Kết quả chạy lại logic tương đương code hiện tại với GHN Sandbox live:

| Case | Old GHN cần tìm | Pipeline hiện tại match | Mức resolve |
|---|---|---|---|
| Thủ Dầu Một | Bình Dương / Thủ Dầu Một / Phú Cường | `ProvinceID=202`, Hồ Chí Minh | PROVINCE |
| Vũng Tàu | Bà Rịa - Vũng Tàu / Vũng Tàu / Thắng Tam | `ProvinceID=202`, Hồ Chí Minh | PROVINCE |
| Bắc Giang | Bắc Giang / Bắc Giang / Ngô Quyền | `ProvinceID=249`, Bắc Ninh | PROVINCE |
| Phan Thiết | Bình Thuận / Phan Thiết / Bình Hưng | `ProvinceID=209`, Lâm Đồng | PROVINCE |
| Vị Thanh | Hậu Giang / Vị Thanh / Vị Tân | `ProvinceID=220`, Cần Thơ | PROVINCE |

Tất cả `DistrictID`/`WardCode` đều null. Đây là hành vi đúng với code hiện tại: province mới match được một bản ghi GHN, rồi việc tìm district/ward legacy bị giới hạn trong province mới đó.

Bằng chứng: [`results-current-maptiler-candidates.json`](results-current-maptiler-candidates.json), [`results-current-pipeline-ghn.json`](results-current-pipeline-ghn.json).

## 2. Full JSON MapTiler — 5 case

### Kiểm tra cấu trúc

Trong cả 5 response:

- Có `context`, `id`, `properties`, `properties.ref` (thường là OSM ref), đôi khi có `wikidata`.
- Không có `parent`.
- Không có trường `alternate`, `alt_name`, `old_name`, `former_name`, `previous_name`.
- Không có `matching_text`/`matching_place_name` trong các response thực tế này.
- Không có `province_code`, `district_code`, `ward_code` hoặc mã hành chính Việt Nam dùng được.
- `feature.id`, OSM `ref` và Wikidata ID chỉ là định danh provider/nguồn; không phải ID GHN và không ổn định để dùng làm mapping GHN.

### Nội dung thực tế

| Case | Region/municipality mới | Manh mối cũ trong context | Đủ old province/district/ward? |
|---|---|---|---|
| Thủ Dầu Một | Hồ Chí Minh / Phường Thủ Dầu Một | `Phú Cường 7`, `Khu phố Phú Cường 6` | Không |
| Vũng Tàu | Hồ Chí Minh / Phường Vũng Tàu | `Khu phố 13` | Không |
| Bắc Giang | Bắc Ninh / Phường Bắc Giang | `Ngô Quyền` | Không |
| Phan Thiết | Lâm Đồng / Phan Thiết | Không có `Bình Hưng`, `Bình Thuận` | Không |
| Vị Thanh | Cần Thơ / Phường Vị Tân | `Vị Thanh` | Không |

Kết luận: MapTiler có vài nhãn tầng thấp giúp con người đoán, nhưng không có legacy hierarchy chuẩn hóa và không bảo đảm coverage. Logic hiện tại cũng không thể biến `Khu phố Phú Cường 6` thành đúng `Phường Phú Cường` vì matcher chỉ exact sau chuẩn hóa.

Bằng chứng tổng hợp: [`results-maptiler-full-json-analysis.json`](results-maptiler-full-json-analysis.json).  
Full response: [`raw/maptiler/thu-dau-mot.json`](raw/maptiler/thu-dau-mot.json), [`raw/maptiler/vung-tau.json`](raw/maptiler/vung-tau.json), [`raw/maptiler/bac-giang.json`](raw/maptiler/bac-giang.json), [`raw/maptiler/phan-thiet.json`](raw/maptiler/phan-thiet.json), [`raw/maptiler/vi-thanh.json`](raw/maptiler/vi-thanh.json).

## 3. Nominatim reverse — cùng 5 tọa độ

Request dùng `format=jsonv2`, `zoom=18`, `addressdetails=1`, `namedetails=1`, `extratags=1`, ngôn ngữ Việt.

| Case | Tỉnh/thành mới | Ward/suburb/city | District/county | ISO | Manh mối cũ |
|---|---|---|---|---|---|
| Thủ Dầu Một | Hồ Chí Minh | Phường Thủ Dầu Một | null | VN-SG | Khu phố Phú Cường 6 |
| Vũng Tàu | Hồ Chí Minh | Phường Vũng Tàu | null | VN-SG | Khu phố 13 |
| Bắc Giang | Bắc Ninh | Ngô Quyền / Phường Bắc Giang | null | VN-56 | Ngô Quyền |
| Phan Thiết | Lâm Đồng | Phường Phan Thiết / Phan Thiết | null | VN-35 | Không có Bình Hưng/Bình Thuận |
| Vị Thanh | Cần Thơ | Phường Vị Tân | null | VN-CT | Vị Tân/Vị Thanh nhưng không có Hậu Giang |

`namedetails` và `extratags` không bổ sung hierarchy cũ. ISO/code là code địa giới mới/đang tồn tại của OSM, không phải mã GHN. Nominatim vì vậy không thể làm nguồn legacy đáng tin cậy; nó chỉ có thể đóng vai trò clue/fallback có confidence thấp.

Bằng chứng tổng hợp: [`results-nominatim-five.json`](results-nominatim-five.json).  
Full response: [`raw/nominatim/thu-dau-mot.json`](raw/nominatim/thu-dau-mot.json), [`raw/nominatim/vung-tau.json`](raw/nominatim/vung-tau.json), [`raw/nominatim/bac-giang.json`](raw/nominatim/bac-giang.json), [`raw/nominatim/phan-thiet.json`](raw/nominatim/phan-thiet.json), [`raw/nominatim/vi-thanh.json`](raw/nominatim/vi-thanh.json).

## 4. API/dataset chuyển new + GPS → old

### VietMap Migration/Geocode v4

Tài liệu VietMap mô tả đúng capability cần có:

- Migration v3 nhận `text`, `focus=lat,lng`, `migrate_type=2` để chuyển mới → cũ.
- Khi `migrate_type=2`, `focus` là bắt buộc để phân biệt địa chỉ trùng tên.
- Response tài liệu có `boundaries` cho ward/district/province cũ.
- Geocode v4 `display_type=5/6` có thể trả cả `data_old` và `data_new`.

Nhưng ở trạng thái dự án hiện tại:

- Không có VietMap API key trong cấu hình.
- Playground yêu cầu đăng ký key; trang chuyển đổi chặn phiên kiểm thử tự động bằng màn hình anti-devtools.
- Request thật đến Migration v3 không kèm key trả **HTTP 401, body 0 byte**.
- Do đó chưa thể tuyên bố VietMap runtime trả đúng old ward khác nhau cho các tọa độ thử nghiệm.

Bằng chứng: [`raw/vietmap/thu-dau-mot-no-api-key-metadata.json`](raw/vietmap/thu-dau-mot-no-api-key-metadata.json), body thực tế rỗng tại [`raw/vietmap/thu-dau-mot-no-api-key-response.json`](raw/vietmap/thu-dau-mot-no-api-key-response.json).

### Dataset mapping VietMap công khai

Đã tải và đọc workbook `admin_mapping_old_to_new_10_25.xlsx` ở chế độ read-only. Sheet `admin_mapping` có 10.359 dòng, 10 cột:

`city_id_old, city_name_old, district_id_old, district_name_old, ward_id_old, ward_name_old, city_id_new, city_name_new, ward_id_new, ward_new_name`.

Ví dụ `Phường Thủ Dầu Một` có 5 old ward candidate:

- Phường Hiệp Thành
- Phường Chánh Nghĩa
- Phường Phú Cường
- Phường Phú Thọ
- Phường Chánh Mỹ

Workbook cũng cho thấy:

- `Phường Vũng Tàu` có 7 old ward candidate.
- `Phường Bắc Giang` có 7 old ward candidate.
- `Phường Phan Thiết` có 3 old ward candidate.
- `Phường Vị Tân` có 3 old ward candidate.

Đây là bằng chứng trực tiếp rằng `newWardName → oldWard` không phải ánh xạ duy nhất. Workbook không có geometry/polygon nên không thể tự chọn candidate đúng từ lat/lng. Các `*_id_old`/`*_id_new` trong workbook là ID VietMap, tuyệt đối không dùng như GHN ID.

Bằng chứng: [`results-vietmap-mapping-inspection.json`](results-vietmap-mapping-inspection.json), workbook gốc [`datasets/vietmap/admin_mapping_old_to_new_10_25.xlsx`](datasets/vietmap/admin_mapping_old_to_new_10_25.xlsx), SHA-256 `4375084FF10743E33F848353DDE9D6EB802B31733B06B3A20C3D000662515B9A`.

### GADM 4.1 ADM3 như phép thử polygon legacy

Point-in-polygon trên GADM 4.1 trả:

| Case | Old province | Old district | Old ward | Chất lượng |
|---|---|---|---|---|
| Thủ Dầu Một | Bình Dương | Thủ Dầu Một | Phú Cường | Đủ |
| Vũng Tàu | Bà Rịa-Vũng Tàu | Vũng Tàu | Thắng Tam | Đủ |
| Bắc Giang | Bắc Giang | Bắc Giang | Ngô Quyền | Đủ |
| Phan Thiết | Bình Thuận | Phan Thiết | Bình Hưng | Đủ |
| Vị Thanh | Hậu Giang | Vị Thanh | `V` | Ward lỗi/không dùng được |

Kết quả chứng minh cách tiếp cận polygon có thể giải bài toán theo tọa độ, nhưng dataset cụ thể này chưa đủ chất lượng và license chỉ cho academic/non-commercial nếu chưa có permission. Không nên đưa GADM vào production chỉ dựa trên test này.

Bằng chứng: [`results-gadm-five.json`](results-gadm-five.json), dataset gốc [`datasets/gadm41/gadm41_VNM_3.json`](datasets/gadm41/gadm41_VNM_3.json), SHA-256 `FE29B396ACEFBA3B49172FF46C2734658EE97C6A96635D506D1FD4070993B23D`.

## 5. Test quan trọng: cùng một phường mới, ba old ward theo GPS

Theo Nghị quyết 1685/NQ-UBTVQH15, phường Thủ Dầu Một mới gồm toàn bộ Phú Cường, Phú Thọ, Chánh Nghĩa và một phần Hiệp Thành, Chánh Mỹ.

Ba điểm nằm sâu bên trong ba polygon cũ:

| GPS | MapTiler/Nominatim đều cho new ward | Old polygon | GHN Sandbox |
|---|---|---|---|
| 10.981675625786304, 106.6537083252443 | Phường Thủ Dầu Một | Phú Cường | `205 / 1538 / 440107` |
| 10.956520981364745, 106.66794785792388 | Phường Thủ Dầu Một | Phú Thọ | `205 / 1538 / 440112` |
| 10.966334053145522, 106.6592203873957 | Phường Thủ Dầu Một | Chánh Nghĩa | `205 / 1538 / 440102` |

MapTiler/Nominatim có lower-level clue tương ứng `Khu phố Phú Cường 6`, `Khu phố Phú Thọ 8`, `Khu phố Chánh Nghĩa 5`. Tuy nhiên đây không phải field `oldWard`; chỉ polygon legacy trả quan hệ một cách tường minh theo điểm.

Bằng chứng tọa độ/polygon: [`test-points-thu-dau-mot-three-old-wards.json`](test-points-thu-dau-mot-three-old-wards.json).  
Full provider response: [`raw/maptiler/multi-thu-dau-mot-old-phu-cuong.json`](raw/maptiler/multi-thu-dau-mot-old-phu-cuong.json), [`raw/maptiler/multi-thu-dau-mot-old-phu-tho.json`](raw/maptiler/multi-thu-dau-mot-old-phu-tho.json), [`raw/maptiler/multi-thu-dau-mot-old-chanh-nghia.json`](raw/maptiler/multi-thu-dau-mot-old-chanh-nghia.json) và các file cùng tên trong [`raw/nominatim`](raw/nominatim).

## 6. Old name → GHN Sandbox Master Data

Host test: `dev-online-gateway.ghn.vn`; catalog có 65 province tại thời điểm test.

| Case | ProvinceID | DistrictID | WardCode | GHN name | Duy nhất | Match |
|---|---:|---:|---:|---|---|---|
| Thủ Dầu Một | 205 | 1538 | 440107 | Phường Phú Cường | 1/1/1 | exact |
| Vũng Tàu | 206 | 1544 | 520116 | Phường Thắng Tam | 1/1/1 | compact-normalized exact ở province; exact phần còn lại |
| Bắc Giang | 248 | 1643 | 180106 | Phường Ngô Quyền | 1/1/1 | exact |
| Phan Thiết | 258 | 1666 | 470101 | Phường Bình Hưng | 1/1/1 | exact |
| Vị Thanh | 250 | 1653 | 640109 | Xã Vị Tân | 1/1/1 | exact core, nhưng nguồn ward là MapTiler/Nominatim vì GADM lỗi |

Không dùng fuzzy. Lưu ý case Vị Tân cho thấy rủi ro bỏ prefix: provider ghi `Phường Vị Tân`, GHN Sandbox ghi `Xã Vị Tân`; matcher hiện tại coi cùng core name là match. Cần coi khác loại hành chính là tín hiệu cảnh báo, không phải bằng chứng tuyệt đối.

Bằng chứng tổng hợp: [`results-ghn-match.json`](results-ghn-match.json).  
Raw GHN Sandbox: [`raw/ghn-sandbox/provinces.json`](raw/ghn-sandbox/provinces.json), các danh mục district/ward tương ứng trong [`raw/ghn-sandbox`](raw/ghn-sandbox).

## 7. Điều kiện để nâng kết luận từ C lên B/A

Một thiết kế mức B khả thi nếu có đủ:

1. Provider/dataset trả old province/district/ward theo đúng polygon của GPS, không chỉ mapping tên.
2. Bộ test runtime VietMap có key trên tối thiểu 5 case này, test nhiều điểm trong cùng new ward và test sát biên.
3. Match tên old hierarchy vào đúng catalog GHN Sandbox theo từng cấp, bắt buộc uniqueness; không dùng ID VietMap/MapTiler như GHN ID.
4. Versioning dữ liệu và kiểm tra lệch giữa Sandbox/Production; không sao chép ID qua môi trường.
5. Fallback bắt khách chọn GHN province/district/ward khi provider thiếu dữ liệu, điểm sát biên, prefix mâu thuẫn hoặc có nhiều match.

Chỉ có thể gọi là mức A sau khi có polygon/API được cấp phép, coverage đủ rộng, benchmark sát biên và tỷ lệ sai được đo trên dữ liệu thực tế. Với bằng chứng hiện tại, mức A/B chưa đạt.

## Nguồn ngoài

- MapTiler Geocoding API: https://docs.maptiler.com/cloud/api/geocoding/
- Nominatim Reverse API: https://nominatim.org/release-docs/latest/api/Reverse/
- VietMap Address Migration: https://maps.vietmap.vn/docs/vi/migrate-address/migrate-address-docs/
- VietMap Geocode v4: https://maps.vietmap.vn/docs/map-api/geocode-version/geocode-v4/
- VietMap administrative dataset: https://github.com/vietmap-company/vietnam_administrative_address
- Nghị quyết 1685/NQ-UBTVQH15 (Công báo): https://congbao.cdnchinhphu.vn/CongBaoCP/CongBao/2025/6/45132/56863-1-805-806.pdf
- GHN Ward master data docs: https://api.ghn.vn/home/docs/detail?id=92
- GADM license: https://gadm.org/license.html
