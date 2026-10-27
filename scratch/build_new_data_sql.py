# -*- coding: utf-8 -*-
import json
import os
import sys

# Đọc dump để lấy mapping ảnh chuẩn xác
with open('scratch/db_dump.json', 'r', encoding='utf-8-sig') as f:
    db_dump = json.load(f)

old_imgs = db_dump.get('HinhAnhSanPham', [])
old_spct = {s['id']: s['id_san_pham'] for s in db_dump.get('SanPhamChiTiet', [])}

def get_product_images(pid):
    imgs = [h['url_hinh_anh'] for h in old_imgs if old_spct.get(h['id_san_pham_chi_tiet']) == pid]
    seen = set()
    res = []
    for img in imgs:
        if img not in seen:
            seen.add(img)
            full_path = os.path.join('uploads', 'product', img.replace('/', os.sep))
            if os.path.exists(full_path):
                res.append(img)
    return res

# Danh sách 27 Vợt Cầu Lông (id_danh_muc = 1)
# BẮT BUỘC: CHỈ CÓ 3 THUỘC TÍNH: 1 (Màu sắc), 7 (Sức căng), 2 (Độ cứng)
rackets = [
    {
        "id": 1, "name": "Lining Bladex 800 Speed 2026", "brand": 2,
        "desc": "Dòng vợt tốc độ cao cấp nhất của Li-Ning, khung vát khí động học sắc bén, hỗ trợ phản tạt và bắt lưới cực nhanh.",
        "variants": [
            {"color": "Đen Nhám Ánh Bạc", "tension": "26 - 30 lbs", "stiff": "Cứng", "cost": 2700000, "price": 4490000, "stock": 35},
            {"color": "Trắng Đỏ Tốc Độ", "tension": "24 - 28 lbs", "stiff": "Hơi cứng", "cost": 2700000, "price": 4490000, "stock": 30}
        ]
    },
    {
        "id": 2, "name": "Vợt cầu lông Lining Axforce 100 Gen 2", "brand": 2,
        "desc": "Siêu phẩm tấn công uy lực thế hệ 2, thân vợt siêu mỏng 6.0mm đầm đầu, tích hợp công nghệ carbon M50 đỉnh cao.",
        "variants": [
            {"color": "Đen Vàng Đồng - Qilin", "tension": "26 - 31 lbs", "stiff": "Rất cứng", "cost": 3400000, "price": 5650000, "stock": 25},
            {"color": "Xanh Titan Ánh Kim", "tension": "24 - 29 lbs", "stiff": "Cứng", "cost": 3400000, "price": 5650000, "stock": 30}
        ]
    },
    {
        "id": 3, "name": "Vợt cầu lông Lining Axforce 90 New - Loh Kean Yew 2025", "brand": 2,
        "desc": "Phiên bản đặc biệt đồng hành cùng nhà vô địch thế giới Loh Kean Yew, smash cắm sân, xoay sở linh hoạt tuyệt đối.",
        "variants": [
            {"color": "Đỏ Trắng Tiger Max", "tension": "26 - 30 lbs", "stiff": "Cứng", "cost": 3100000, "price": 5100000, "stock": 28},
            {"color": "Đen Xám Bão Lốc", "tension": "24 - 28 lbs", "stiff": "Trung bình", "cost": 3100000, "price": 5100000, "stock": 32}
        ]
    },
    {
        "id": 4, "name": "Vợt cầu lông Lining Axforce BigBang new", "brand": 2,
        "desc": "Dòng vợt trợ lực siêu nhẹ, thiết kế bắt mắt trẻ trung, thân dẻo linh hoạt cực kỳ phù hợp cho người chơi phong trào và nữ giới.",
        "variants": [
            {"color": "Trắng Hồng Pastel", "tension": "22 - 27 lbs", "stiff": "Dẻo", "cost": 1050000, "price": 1690000, "stock": 40},
            {"color": "Đen Cam Năng Động", "tension": "24 - 28 lbs", "stiff": "Trung bình", "cost": 1050000, "price": 1690000, "stock": 45}
        ]
    },
    {
        "id": 5, "name": "Vợt cầu lông Lining Bladex Assassin", "brand": 2,
        "desc": "Dòng vợt toàn diện công thủ, smash cầu uy lực kết hợp thủ cầu thoát tay, kiểm soát trận đấu hoàn hảo.",
        "variants": [
            {"color": "Đen Đỏ Sát Thủ", "tension": "24 - 28 lbs", "stiff": "Trung bình", "cost": 800000, "price": 1300000, "stock": 40},
            {"color": "Xanh Navy Nhám", "tension": "22 - 26 lbs", "stiff": "Dẻo", "cost": 800000, "price": 1300000, "stock": 35}
        ]
    },
    {
        "id": 6, "name": "Vợt cầu lông Lining Halbertec 1000 chính hãng", "brand": 2,
        "desc": "Thành viên gia đình Halbertec với khả năng kiểm soát cầu tinh tế, điều hướng cầu chính xác đến từng centimet trên sân đấu.",
        "variants": [
            {"color": "Xanh Ngọc Lục Bảo", "tension": "24 - 28 lbs", "stiff": "Trung bình", "cost": 950000, "price": 1550000, "stock": 35},
            {"color": "Trắng Bạc Tinh Khôi", "tension": "22 - 26 lbs", "stiff": "Dẻo", "cost": 950000, "price": 1550000, "stock": 30}
        ]
    },
    {
        "id": 7, "name": "Vợt Cầu Lông Lining Halbertec Motor", "brand": 2,
        "desc": "Thiết kế thể thao khỏe khoắn lấy cảm hứng từ động cơ phân khối lớn, trợ lực tốt cho các cú phông cầu cuối sân nhẹ nhàng.",
        "variants": [
            {"color": "Cam Đen Nổi Bật", "tension": "24 - 28 lbs", "stiff": "Trung bình", "cost": 900000, "price": 1450000, "stock": 35},
            {"color": "Xám Xi Măng Sport", "tension": "22 - 26 lbs", "stiff": "Dẻo", "cost": 900000, "price": 1450000, "stock": 30}
        ]
    },
    {
        "id": 8, "name": "Vợt Cầu Lông Mizuno Altair T327", "brand": 4,
        "desc": "Dòng vợt Mizuno thiết kế cân bằng dễ chơi, khung khí động học vát gió giúp vung vợt mượt mà, độ bền bỉ cao.",
        "variants": [
            {"color": "Xanh Dương Phối Bạc", "tension": "24 - 28 lbs", "stiff": "Trung bình", "cost": 850000, "price": 1350000, "stock": 30},
            {"color": "Đen Đỏ Thể Thao", "tension": "22 - 26 lbs", "stiff": "Dẻo", "cost": 850000, "price": 1350000, "stock": 35}
        ]
    },
    {
        "id": 9, "name": "Vợt cầu lông Mizuno BDSS Altius Sonic", "brand": 4,
        "desc": "Dòng vợt cao cấp sản xuất tại Nhật Bản, âm thanh chạm cầu giòn đanh, khả năng kiểm soát cầu đỉnh cao cho VĐV chuyên nghiệp.",
        "variants": [
            {"color": "Trắng Xanh Kim Loại", "tension": "24 - 28 lbs", "stiff": "Trung bình", "cost": 2100000, "price": 3200000, "stock": 25},
            {"color": "Xanh Navy Đậm", "tension": "26 - 30 lbs", "stiff": "Cứng", "cost": 2100000, "price": 3200000, "stock": 25}
        ]
    },
    {
        "id": 10, "name": "Vợt cầu lông Mizuno Fortius 55 Strive", "brand": 4,
        "desc": "Vũ khí tấn công toàn diện từ thương hiệu Mizuno Nhật Bản, đầm đầu smash uy lực, hạn chế tối đa độ rung lắc thân vợt.",
        "variants": [
            {"color": "Đen Đỏ Chiến Binh", "tension": "26 - 30 lbs", "stiff": "Cứng", "cost": 1800000, "price": 2800000, "stock": 30},
            {"color": "Xám Titan Mờ", "tension": "24 - 28 lbs", "stiff": "Trung bình", "cost": 1800000, "price": 2800000, "stock": 25}
        ]
    },
    {
        "id": 11, "name": "Vợt cầu lông Mizuno JPX 8.1 Pro - Đen xanh cam chính hãng", "brand": 4,
        "desc": "Dòng vợt huyền thoại JPX 8.1 Pro, khung vát cạnh kim cương Aero Hexagram xé gió tốc độ, smash đầm tay không tưởng.",
        "variants": [
            {"color": "Đen Xanh Cam Pro", "tension": "26 - 30 lbs", "stiff": "Cứng", "cost": 2300000, "price": 3500000, "stock": 25},
            {"color": "Đen Bạc Nhám", "tension": "24 - 28 lbs", "stiff": "Hơi cứng", "cost": 2300000, "price": 3500000, "stock": 30}
        ]
    },
    {
        "id": 12, "name": "Vợt cầu lông Victor Auraspeed 99 J 2026", "brand": 3,
        "desc": "Chiến binh tốc độ mới nhất từ Victor, điểm ngọt mở rộng, công nghệ cán vợt Free Core hấp thụ rung chấn tuyệt hảo.",
        "variants": [
            {"color": "Xanh Đen Tốc Độ", "tension": "26 - 30 lbs", "stiff": "Cứng", "cost": 2700000, "price": 4200000, "stock": 30},
            {"color": "Đỏ Trắng Thi Đấu", "tension": "24 - 28 lbs", "stiff": "Hơi cứng", "cost": 2700000, "price": 4200000, "stock": 30}
        ]
    },
    {
        "id": 13, "name": "Vợt cầu lông Victor AuraSpeed A", "brand": 3,
        "desc": "Vợt Victor dòng Auraspeed phổ thông, trợ lực tốt, linh hoạt chuyển đổi giữa tấn công nhanh và phòng thủ góc hiểm.",
        "variants": [
            {"color": "Trắng Xanh Pastel", "tension": "22 - 26 lbs", "stiff": "Dẻo", "cost": 1150000, "price": 1850000, "stock": 40},
            {"color": "Tím Than Cá Tính", "tension": "24 - 28 lbs", "stiff": "Trung bình", "cost": 1150000, "price": 1850000, "stock": 35}
        ]
    },
    {
        "id": 14, "name": "Vợt cầu lông Victor Auraspeed FANTOME F HYQ", "brand": 3,
        "desc": "Phiên bản đặc biệt giới hạn thiết kế theo phong cách bóng ma hắc ám, tốc độ ra vợt thần sầu không cho đối thủ kịp trở tay.",
        "variants": [
            {"color": "Đen Huyền Bí Phantom", "tension": "26 - 31 lbs", "stiff": "Rất cứng", "cost": 3000000, "price": 4600000, "stock": 25},
            {"color": "Trắng Ánh Hồng HYQ", "tension": "24 - 29 lbs", "stiff": "Cứng", "cost": 3000000, "price": 4600000, "stock": 25}
        ]
    },
    {
        "id": 15, "name": "Vợt Cầu Lông Victor AuraSpeed LYC", "brand": 3,
        "desc": "Bản hợp tác đặc biệt cùng tay vợt Lee Yong Dae, đỉnh cao điều cầu phản tạt và bắt lưới số 1 thế giới.",
        "variants": [
            {"color": "Vàng Đen Hoàng Gia", "tension": "26 - 30 lbs", "stiff": "Cứng", "cost": 3100000, "price": 4800000, "stock": 25},
            {"color": "Trắng Đỏ Kỷ Niệm", "tension": "24 - 28 lbs", "stiff": "Hơi cứng", "cost": 3100000, "price": 4800000, "stock": 25}
        ]
    },
    {
        "id": 16, "name": "Vợt cầu lông Victor DriveX 12 WT25", "brand": 3,
        "desc": "Dòng vợt công thủ toàn diện kiểm soát thế trận hàng đầu của Victor, cảm giác đánh chắc tay và ổn định tối đa.",
        "variants": [
            {"color": "Xanh Đậm Metallic", "tension": "26 - 30 lbs", "stiff": "Cứng", "cost": 2500000, "price": 3900000, "stock": 30},
            {"color": "Xám Khói Titan", "tension": "24 - 28 lbs", "stiff": "Trung bình", "cost": 2500000, "price": 3900000, "stock": 30}
        ]
    },
    {
        "id": 17, "name": "Vợt cầu lông Victor Jetspeed S12 II R", "brand": 3,
        "desc": "Tái sinh huyền thoại Jetspeed 12 thế hệ 2, tốc độ đập cầu và tạt lưới siêu nhanh, được các VĐV đôi nam nữ cực kỳ tin dùng.",
        "variants": [
            {"color": "Đỏ Cherry Ánh Kim", "tension": "26 - 30 lbs", "stiff": "Cứng", "cost": 2400000, "price": 3750000, "stock": 30},
            {"color": "Xanh Biển Tốc Độ", "tension": "24 - 28 lbs", "stiff": "Trung bình", "cost": 2400000, "price": 3750000, "stock": 30}
        ]
    },
    {
        "id": 18, "name": "Vợt cầu lông Victor Thruster Hammer Light", "brand": 3,
        "desc": "Trọng lượng nhẹ nhưng giữ đầu vợt nặng búa tạ, tạo ra những pha smash cắm sân đầy uy lực mà không gây mỏi cổ tay.",
        "variants": [
            {"color": "Đen Cam Búa Tạ", "tension": "24 - 28 lbs", "stiff": "Trung bình", "cost": 1050000, "price": 1650000, "stock": 35},
            {"color": "Xanh Neon Trắng", "tension": "22 - 26 lbs", "stiff": "Dẻo", "cost": 1050000, "price": 1650000, "stock": 40}
        ]
    },
    {
        "id": 19, "name": "Vợt cầu lông Yonex Astrox 10", "brand": 1,
        "desc": "Cây vợt sơ cấp dòng Astrox chính hãng Yonex, hệ thống đối trọng Rotational Generator System giúp vào lực dễ dàng.",
        "variants": [
            {"color": "Xanh Dương Trắng", "tension": "20 - 24 lbs", "stiff": "Dẻo", "cost": 800000, "price": 1250000, "stock": 40},
            {"color": "Đỏ Đen Thể Thao", "tension": "22 - 26 lbs", "stiff": "Trung bình", "cost": 800000, "price": 1250000, "stock": 40}
        ]
    },
    {
        "id": 20, "name": "Vợt cầu lông Yonex Astrox 100 Tour VA", "brand": 1,
        "desc": "Bản Tour cao cấp chuẩn thi đấu quốc tế của siêu phẩm 100ZZ, thân mỏng Extra Slim Shaft, đập cầu cắm sân nghẹt thở.",
        "variants": [
            {"color": "Kurenai Đỏ Rực", "tension": "26 - 30 lbs", "stiff": "Cứng", "cost": 2200000, "price": 3350000, "stock": 30},
            {"color": "Đỏ Đen Đậm VA", "tension": "24 - 28 lbs", "stiff": "Hơi cứng", "cost": 2200000, "price": 3350000, "stock": 35}
        ]
    },
    {
        "id": 21, "name": "Vợt cầu lông Yonex Astrox 22 Lite (BKRD) chính hãng", "brand": 1,
        "desc": "Siêu phẩm siêu nhẹ 68g từ Yonex Nhật Bản, vung vợt thần tốc, xử lý cầu chớp nhoáng trên lưới dành cho phái nữ và tay vợt linh hoạt.",
        "variants": [
            {"color": "Đen Đỏ Huyền Thoại", "tension": "22 - 26 lbs", "stiff": "Trung bình", "cost": 900000, "price": 1400000, "stock": 35},
            {"color": "Đen Xám Siêu Nhẹ", "tension": "20 - 24 lbs", "stiff": "Dẻo", "cost": 900000, "price": 1400000, "stock": 35}
        ]
    },
    {
        "id": 22, "name": "Vợt cầu lông Yonex Astrox 77 Play Limited - Light Beige chính hãng", "brand": 1,
        "desc": "Phiên bản giới hạn màu be sáng sang trọng thanh lịch của dòng Astrox 77 danh tiếng, trợ lực tốt cho cú phông cầu cuối sân.",
        "variants": [
            {"color": "Light Beige Be Sữa", "tension": "22 - 26 lbs", "stiff": "Trung bình", "cost": 900000, "price": 1390000, "stock": 40},
            {"color": "Xanh Ngọc Be Play", "tension": "20 - 24 lbs", "stiff": "Dẻo", "cost": 900000, "price": 1390000, "stock": 40}
        ]
    },
    {
        "id": 23, "name": "Vợt cầu lông Yonex Astrox 99 Pro 2025", "brand": 1,
        "desc": "Vũ khí hủy diệt tối thượng đồng hành cùng huyền thoại Kento Momota, sức mạnh đập cầu không thể ngăn cản với gen Power-Assist Bumper.",
        "variants": [
            {"color": "White Tiger Bạch Hổ", "tension": "26 - 31 lbs", "stiff": "Rất cứng", "cost": 3200000, "price": 4950000, "stock": 25},
            {"color": "Cherry Sunburst Đỏ Cam", "tension": "24 - 29 lbs", "stiff": "Cứng", "cost": 3200000, "price": 4950000, "stock": 30}
        ]
    },
    {
        "id": 24, "name": "Vợt cầu lông Yonex Astrox 99 Tour 2025", "brand": 1,
        "desc": "Phiên bản Tour dễ tiếp cận của Astrox 99 Pro, thừa hưởng 90% công nghệ cao cấp từ bản Pro với độ cứng vừa phải hơn.",
        "variants": [
            {"color": "Trắng Hổ Vằn Tour", "tension": "24 - 28 lbs", "stiff": "Cứng", "cost": 2100000, "price": 3250000, "stock": 30},
            {"color": "Đỏ Cam Cherry Tour", "tension": "22 - 26 lbs", "stiff": "Trung bình", "cost": 2100000, "price": 3250000, "stock": 30}
        ]
    },
    {
        "id": 25, "name": "Vợt cầu lông Yonex Astrox Lite 43i", "brand": 1,
        "desc": "Cây vợt quốc dân cho người mới bắt đầu, thân dẻo trợ lực tối đa, khung Iso vuông mở rộng điểm ngọt đỡ cầu êm ái.",
        "variants": [
            {"color": "Aqua blue", "tension": "20 - 24 lbs", "stiff": "Dẻo", "cost": 620000, "price": 950000, "stock": 50},
            {"color": "Green", "tension": "20 - 24 lbs", "stiff": "Dẻo", "cost": 620000, "price": 950000, "stock": 50}
        ]
    },
    {
        "id": 26, "name": "Vợt cầu lông Yonex Nanoflare 1000Z", "brand": 1,
        "desc": "Kỷ lục thế giới về tốc độ đập cầu 565 km/h, khung Sonic Flare System và AERO Frame vút gió cực đại, phản xạ chớp nhoáng.",
        "variants": [
            {"color": "Lightning Yellow Vàng Chớp", "tension": "26 - 31 lbs", "stiff": "Rất cứng", "cost": 3100000, "price": 4850000, "stock": 25},
            {"color": "Đen Nhám Sấm Sét", "tension": "24 - 29 lbs", "stiff": "Cứng", "cost": 3100000, "price": 4850000, "stock": 30}
        ]
    },
    {
        "id": 27, "name": "Vợt cầu lông Yonex Nanoflare 700 Pro 2024", "brand": 1,
        "desc": "Thế hệ mới của Nanoflare 700 đình đám, đũa vợt Super Slim Shaft linh hoạt, cảm giác chạm cầu đầm và thoát tay vượt trội.",
        "variants": [
            {"color": "Midnight Purple Tím Huyền Thoại", "tension": "24 - 28 lbs", "stiff": "Trung bình", "cost": 2800000, "price": 4350000, "stock": 30},
            {"color": "Silver Bạc Ánh Xanh", "tension": "22 - 26 lbs", "stiff": "Hơi cứng", "cost": 2800000, "price": 4350000, "stock": 30}
        ]
    }
]

# Giày cầu lông (id_danh_muc = 2)
# Thuộc tính: 1 (Màu sắc), 6 (Kích thước)
shoes = [
    {
        "id": 28, "name": "Giày cầu lông Lining AYZW007-3 chính hãng", "brand": 2,
        "desc": "Giày cầu lông Lining form ôm chân chắc chắn, đế cao su chống mài mòn và chống trượt tuyệt đối trên mặt sân thảm.",
        "variants": [
            {"color": "Trắng Xanh", "size": "40", "cost": 800000, "price": 1250000, "stock": 20},
            {"color": "Trắng Xanh", "size": "41", "cost": 800000, "price": 1250000, "stock": 25},
            {"color": "Trắng Xanh", "size": "42", "cost": 800000, "price": 1250000, "stock": 20}
        ]
    },
    {
        "id": 29, "name": "Giày cầu lông Victor A531 WAG chính hãng", "brand": 3,
        "desc": "Dòng giày thi đấu chuyên nghiệp của Victor, đệm gót ENERGYMAX đàn hồi cao hấp thụ xung lực khi tiếp đất sau cú nhảy đập.",
        "variants": [
            {"color": "Trắng Đỏ Vàng", "size": "40", "cost": 950000, "price": 1450000, "stock": 20},
            {"color": "Trắng Đỏ Vàng", "size": "41", "cost": 950000, "price": 1450000, "stock": 25},
            {"color": "Trắng Đỏ Vàng", "size": "42", "cost": 950000, "price": 1450000, "stock": 20},
            {"color": "Trắng Đỏ Vàng", "size": "43", "cost": 950000, "price": 1450000, "stock": 15}
        ]
    },
    {
        "id": 30, "name": "Giày cầu lông Victor A970 cADVAM - Trắng chính hãng", "brand": 3,
        "desc": "Mẫu giày cao cấp của các tuyển thủ hàng đầu thế giới, da tổng hợp Microfiber PU siêu mềm bọc ôm chân và bền bỉ tối đa.",
        "variants": [
            {"color": "Trắng Tinh Khôi", "size": "39", "cost": 1700000, "price": 2650000, "stock": 15},
            {"color": "Trắng Tinh Khôi", "size": "40", "cost": 1700000, "price": 2650000, "stock": 20},
            {"color": "Trắng Tinh Khôi", "size": "41", "cost": 1700000, "price": 2650000, "stock": 25},
            {"color": "Trắng Tinh Khôi", "size": "42", "cost": 1700000, "price": 2650000, "stock": 20}
        ]
    },
    {
        "id": 31, "name": "Giày cầu lông Yonex Eclipsion X3", "brand": 1,
        "desc": "Giày cầu lông siêu ổn định từ Yonex, đế Power Cushion+ bật nảy tối ưu và công nghệ chống lật cổ chân Heel Contact Round Sole.",
        "variants": [
            {"color": "Trắng", "size": "40", "cost": 1850000, "price": 2850000, "stock": 15},
            {"color": "Trắng", "size": "41", "cost": 1850000, "price": 2850000, "stock": 20},
            {"color": "Trắng đen", "size": "41", "cost": 1850000, "price": 2850000, "stock": 15},
            {"color": "Trắng đen", "size": "42", "cost": 1850000, "price": 2850000, "stock": 20},
            {"color": "Xanh NaVy", "size": "41", "cost": 1850000, "price": 2850000, "stock": 15},
            {"color": "Xanh NaVy", "size": "42", "cost": 1850000, "price": 2850000, "stock": 20}
        ]
    },
    {
        "id": 32, "name": "Giày cầu lông Yonex SHB 65Z VA Men - Grayish Beige chính hãng", "brand": 1,
        "desc": "Đôi giày toàn diện và được yêu thích nhất mọi thời đại của Yonex, phiên bản màu xám be Grayish Beige sang trọng tuyệt đẹp.",
        "variants": [
            {"color": "Grayish Beige", "size": "40", "cost": 2100000, "price": 3250000, "stock": 15},
            {"color": "Grayish Beige", "size": "41", "cost": 2100000, "price": 3250000, "stock": 25},
            {"color": "Grayish Beige", "size": "42", "cost": 2100000, "price": 3250000, "stock": 20},
            {"color": "Grayish Beige", "size": "43", "cost": 2100000, "price": 3250000, "stock": 15}
        ]
    },
    {
        "id": 33, "name": "Giày cầu lông Yonex Tokyo 4 - Crystal teal chính hãng", "brand": 1,
        "desc": "Mẫu giày Yonex thiết kế trẻ trung giá phổ thông cho học sinh, sinh viên, đệm êm TruCushion nâng đỡ bàn chân tối ưu.",
        "variants": [
            {"color": "Crystal teal", "size": "39", "cost": 650000, "price": 990000, "stock": 20},
            {"color": "Crystal teal", "size": "40", "cost": 650000, "price": 990000, "stock": 25},
            {"color": "Crystal teal", "size": "41", "cost": 650000, "price": 990000, "stock": 30},
            {"color": "Crystal teal", "size": "42", "cost": 650000, "price": 990000, "stock": 20}
        ]
    }
]

# Áo cầu lông (id_danh_muc = 3)
# Thuộc tính: 1 (Màu sắc), 6 (Kích thước)
shirts = [
    {
        "id": 34, "name": "Áo cầu lông Lining P-APLUA47-1 nam chính hãng", "brand": 2,
        "desc": "Áo thi đấu Lining chất liệu thun mè thể thao AT DRY thấm hút mồ hôi cực nhanh, co giãn 4 chiều vận động linh hoạt.",
        "variants": [
            {"color": "Đỏ Trắng", "size": "M", "cost": 170000, "price": 280000, "stock": 25},
            {"color": "Đỏ Trắng", "size": "L", "cost": 170000, "price": 280000, "stock": 30},
            {"color": "Đỏ Trắng", "size": "XL", "cost": 170000, "price": 280000, "stock": 20}
        ]
    },
    {
        "id": 35, "name": "Áo cầu lông Yonex RM3216 - Poinciana chính hãng", "brand": 1,
        "desc": "Áo cầu lông Yonex công nghệ Very Cool làm mát nhiệt độ cơ thể khi vận động cường độ cao, phối màu Poinciana nổi bật.",
        "variants": [
            {"color": "Đỏ Cam Poinciana", "size": "M", "cost": 190000, "price": 320000, "stock": 25},
            {"color": "Đỏ Cam Poinciana", "size": "L", "cost": 190000, "price": 320000, "stock": 30},
            {"color": "Đỏ Cam Poinciana", "size": "XL", "cost": 190000, "price": 320000, "stock": 20}
        ]
    },
    {
        "id": 36, "name": "Áo cầu lông Yonex RM3232 - White chính hãng", "brand": 1,
        "desc": "Áo Yonex sắc trắng tinh tế phối họa tiết xám hiện đại, vải khử mùi kháng khuẩn UV Reduction bảo vệ làn da tối ưu.",
        "variants": [
            {"color": "Trắng Phối Xanh", "size": "M", "cost": 190000, "price": 320000, "stock": 25},
            {"color": "Trắng Phối Xanh", "size": "L", "cost": 190000, "price": 320000, "stock": 30},
            {"color": "Trắng Phối Xanh", "size": "XL", "cost": 190000, "price": 320000, "stock": 20}
        ]
    },
    {
        "id": 37, "name": "Áo hoodie lót bông Victor Vic07 - Đỏ", "brand": 3,
        "desc": "Áo nỉ có mũ Victor lót bông ấm áp, thích hợp khởi động trước trận đấu hoặc giữ ấm trong mùa đông thể thao.",
        "variants": [
            {"color": "Đỏ Đô Ấm Áp", "size": "M", "cost": 280000, "price": 450000, "stock": 20},
            {"color": "Đỏ Đô Ấm Áp", "size": "L", "cost": 280000, "price": 450000, "stock": 25},
            {"color": "Đỏ Đô Ấm Áp", "size": "XL", "cost": 280000, "price": 450000, "stock": 20}
        ]
    }
]

# Quần cầu lông (id_danh_muc = 4)
# Thuộc tính: 1 (Màu sắc), 6 (Kích thước)
pants = [
    {
        "id": 38, "name": "Quần cầu lông Lining 92001 - Đen trắng", "brand": 2,
        "desc": "Quần short cầu lông Lining phối sọc trắng thể thao, túi sâu có khóa kéo tiện lợi, vải nhẹ thoáng khí tối ưu.",
        "variants": [
            {"color": "Đen Trắng", "size": "M", "cost": 110000, "price": 180000, "stock": 30},
            {"color": "Đen Trắng", "size": "L", "cost": 110000, "price": 180000, "stock": 35},
            {"color": "Đen Trắng", "size": "XL", "cost": 110000, "price": 180000, "stock": 25}
        ]
    },
    {
        "id": 39, "name": "Quần cầu lông Lining 9682 - Đen xanh ngọc", "brand": 2,
        "desc": "Quần cầu lông Lining nam màu đen phối đường viền xanh ngọc năng động, cạp chun co giãn ôm vừa vặn thắt lưng.",
        "variants": [
            {"color": "Đen Xanh Ngọc", "size": "M", "cost": 120000, "price": 190000, "stock": 30},
            {"color": "Đen Xanh Ngọc", "size": "L", "cost": 120000, "price": 190000, "stock": 35},
            {"color": "Đen Xanh Ngọc", "size": "XL", "cost": 120000, "price": 190000, "stock": 25}
        ]
    },
    {
        "id": 40, "name": "Quần cầu lông lining nữ đen - mã 081", "brand": 2,
        "desc": "Quần thể thao nữ Lining tôn dáng, có lớp quần bảo hộ co giãn bên trong an toàn tuyệt đối khi di chuyển đánh cầu.",
        "variants": [
            {"color": "Đen Basic Nữ", "size": "S", "cost": 100000, "price": 170000, "stock": 20},
            {"color": "Đen Basic Nữ", "size": "M", "cost": 100000, "price": 170000, "stock": 30},
            {"color": "Đen Basic Nữ", "size": "L", "cost": 100000, "price": 170000, "stock": 25}
        ]
    },
    {
        "id": 41, "name": "Quần Cầu Lông Lining training trắng", "brand": 2,
        "desc": "Quần short Lining màu trắng training tinh tế, chất vải thun dệt kim mềm mịn không xù lông sau nhiều lần giặt.",
        "variants": [
            {"color": "Trắng Thể Thao", "size": "M", "cost": 130000, "price": 210000, "stock": 25},
            {"color": "Trắng Thể Thao", "size": "L", "cost": 130000, "price": 210000, "stock": 30},
            {"color": "Trắng Thể Thao", "size": "XL", "cost": 130000, "price": 210000, "stock": 20}
        ]
    },
    {
        "id": 42, "name": "Quần cầu lông Yonex Q3 nữ - Đen trắng", "brand": 1,
        "desc": "Quần short Yonex chính hãng dành cho nữ, thiết kế xẻ tà hông giúp sải bước linh hoạt, chất vải siêu thoáng mát.",
        "variants": [
            {"color": "Đen Trắng Nữ", "size": "S", "cost": 135000, "price": 220000, "stock": 20},
            {"color": "Đen Trắng Nữ", "size": "M", "cost": 135000, "price": 220000, "stock": 25},
            {"color": "Đen Trắng Nữ", "size": "L", "cost": 135000, "price": 220000, "stock": 20}
        ]
    },
    {
        "id": 43, "name": "Quần cầu lông Yonex TSM3117 - Lion chính hãng", "brand": 1,
        "desc": "Mẫu quần thi đấu Yonex Lion cao cấp, công nghệ dệt sợi hút ẩm một chiều và nhanh khô vượt trội.",
        "variants": [
            {"color": "Đen Vàng Sư Tử", "size": "M", "cost": 150000, "price": 250000, "stock": 25},
            {"color": "Đen Vàng Sư Tử", "size": "L", "cost": 150000, "price": 250000, "stock": 30},
            {"color": "Đen Vàng Sư Tử", "size": "XL", "cost": 150000, "price": 250000, "stock": 20}
        ]
    }
]

# Balo cầu lông (id_danh_muc = 5)
# Thuộc tính: 1 (Màu sắc)
backpacks = [
    {
        "id": 44, "name": "Balo cầu lông Lining P-ABSV133-3 chính hãng", "brand": 2,
        "desc": "Balo đựng vợt Lining thể tích lớn, có ngăn để giày riêng biệt ở đáy và đệm lưng êm ái chống gù lưng.",
        "variants": [
            {"color": "Xanh Navy Cam", "cost": 550000, "price": 850000, "stock": 25}
        ]
    },
    {
        "id": 45, "name": "Balo cầu lông Victor BR5042 EXA - Trắng đỏ chính hãng", "brand": 3,
        "desc": "Balo thể thao Victor phối màu trắng đỏ thời trang, vải phủ TPU kháng nước bảo vệ vợt khỏi mưa gió.",
        "variants": [
            {"color": "Trắng Đỏ EXA", "cost": 600000, "price": 920000, "stock": 20}
        ]
    },
    {
        "id": 46, "name": "Balo cầu lông Victor BR5051 CNY - Trắng đỏ chính hãng", "brand": 3,
        "desc": "Phiên bản Tết CNY đặc biệt của Victor, kiểu dáng thể thao hiện đại, quai đeo đệm xốp chịu lực tốt.",
        "variants": [
            {"color": "Trắng Đỏ Tết CNY", "cost": 650000, "price": 980000, "stock": 20}
        ]
    },
    {
        "id": 47, "name": "Balo cầu lông Yonex BAG525B1212Z", "brand": 1,
        "desc": "Balo cầu lông Yonex đa năng 3 phiên bản màu sắc, vừa có thể đi đánh cầu vừa có thể đi học, đi làm tiện lợi.",
        "variants": [
            {"color": "Bright White", "cost": 750000, "price": 1150000, "stock": 15},
            {"color": "Jet Black", "cost": 750000, "price": 1150000, "stock": 20},
            {"color": "Riviera", "cost": 750000, "price": 1150000, "stock": 15}
        ]
    }
]

# Túi cầu lông (id_danh_muc = 6)
# Thuộc tính: 1 (Màu sắc)
bags = [
    {
        "id": 48, "name": "Túi cầu lông Lining ABJU013-2 chính hãng", "brand": 2,
        "desc": "Túi vợt Lining 6 cây chuyên nghiệp, có ngăn cách nhiệt Thermo Guard bảo vệ dây cước và khung vợt khỏi nhiệt độ cao.",
        "variants": [
            {"color": "Đen Xám 6 Ngăn", "cost": 800000, "price": 1250000, "stock": 20}
        ]
    },
    {
        "id": 49, "name": "Túi cầu lông Lining P-ABLV029-3 chính hãng", "brand": 2,
        "desc": "Túi đựng vợt thời trang Lining thiết kế thanh lịch, sức chứa 6-9 cây vợt kèm quần áo và phụ kiện tập luyện.",
        "variants": [
            {"color": "Trắng Đỏ Nổi Bật", "cost": 700000, "price": 1100000, "stock": 20}
        ]
    },
    {
        "id": 50, "name": "Túi cầu lông Victor BR5651CNY - Trắng đỏ chính hãng", "brand": 3,
        "desc": "Túi hình chữ nhật Victor bản CNY giới hạn, chất liệu da PU bóng sang trọng chống bám bẩn và dễ lau chùi.",
        "variants": [
            {"color": "Trắng Đỏ Thượng Hạng", "cost": 850000, "price": 1350000, "stock": 20}
        ]
    },
    {
        "id": 51, "name": "Túi cầu lông Yonex BA92026EX xám chính hãng", "brand": 1,
        "desc": "Mẫu túi Pro Series cao cấp của Yonex, màu xám Platinum đẳng cấp, tích hợp đầy đủ ngăn giày, ngăn vợt cách nhiệt.",
        "variants": [
            {"color": "Xám Bạc Pro", "cost": 1050000, "price": 1650000, "stock": 18}
        ]
    },
    {
        "id": 52, "name": "Túi Xách Cầu Lông Yonex 3D 2241R (BKDBL)", "brand": 1,
        "desc": "Túi xách tay Yonex thiết kế nổi khối 3D độc quyền, màu đen phối xanh đậm nam tính mạnh mẽ.",
        "variants": [
            {"color": "Đen Xanh Đậm 3D", "cost": 920000, "price": 1450000, "stock": 20}
        ]
    }
]

# Dây cước căng vợt (id_danh_muc = 7)
# Thuộc tính: 1 (Màu sắc)
strings = [
    {
        "id": 53, "name": "Dây cước căng vợt Kizuna Z65X", "brand": 6,
        "desc": "Dây cước Nhật Bản Kizuna Z65X đường kính 0.65mm, âm nổ vang như sấm sét, độ nảy cực cao cho cú phông cầu nhàn hạ.",
        "variants": [
            {"color": "Trắng", "cost": 110000, "price": 175000, "stock": 60},
            {"color": "Vàng", "cost": 110000, "price": 175000, "stock": 50},
            {"color": "Xanh", "cost": 110000, "price": 175000, "stock": 40},
            {"color": "Đen", "cost": 110000, "price": 175000, "stock": 40}
        ]
    },
    {
        "id": 54, "name": "Dây cước căng vợt Yonex BG 66 Ultimax", "brand": 1,
        "desc": "Cước căng vợt bán chạy số 1 thế giới của Yonex, đường kính 0.65mm, cảm giác tiếp xúc cầu tinh tế tuyệt hảo.",
        "variants": [
            {"color": "Trắng Ngọc Trai", "cost": 125000, "price": 190000, "stock": 80},
            {"color": "Vàng Chuối", "cost": 125000, "price": 190000, "stock": 60}
        ]
    },
    {
        "id": 55, "name": "Dây cước căng vợt Yonex BG SKY", "brand": 1,
        "desc": "Dây cước Yonex công nghệ cấu trúc lõi mới tăng cường khả năng giữ cân và kiểm soát đường cầu theo ý muốn.",
        "variants": [
            {"color": "Xanh Da Trời", "cost": 120000, "price": 185000, "stock": 50},
            {"color": "Trắng Tinh", "cost": 120000, "price": 185000, "stock": 50}
        ]
    },
    {
        "id": 56, "name": "Dây cước căng vợt Yonex Nanogy BG 95", "brand": 1,
        "desc": "Dây cước Yonex siêu bền bỉ đường kính 0.69mm phủ lớp Carbon Nano, độ bền vượt trội thích hợp người chơi phong trào.",
        "variants": [
            {"color": "Trắng Siêu Bền", "cost": 115000, "price": 180000, "stock": 60},
            {"color": "Vàng Kim", "cost": 115000, "price": 180000, "stock": 50}
        ]
    }
]

# Quấn cán vợt (id_danh_muc = 8)
# Thuộc tính: 1 (Màu sắc)
grips = [
    {
        "id": 57, "name": "Quấn cán Yonex xịn AC102-30 EX (Túi 2 cuộn)", "brand": 1,
        "desc": "Quấn cán Yonex chính hãng dẻo dai bám tay số 1, thấm hút mồ hôi cực tốt chống trơn tuột khi thi đấu.",
        "variants": [
            {"color": "Trắng", "cost": 45000, "price": 70000, "stock": 100},
            {"color": "Đen", "cost": 45000, "price": 70000, "stock": 100},
            {"color": "Vàng", "cost": 45000, "price": 70000, "stock": 80},
            {"color": "Xanh", "cost": 45000, "price": 70000, "stock": 80},
            {"color": "Đỏ", "cost": 45000, "price": 70000, "stock": 70},
            {"color": "Hồng", "cost": 45000, "price": 70000, "stock": 70}
        ]
    }
]

categories_groups = [
    (1, rackets),
    (2, shoes),
    (3, shirts),
    (4, pants),
    (5, backpacks),
    (6, bags),
    (7, strings),
    (8, grips)
]

sql = []
sql.append("/*")
sql.append("===============================================================================")
sql.append(" SMASH-VN: TẠO MỚI VÀ RESET TOÀN BỘ DỮ LIỆU SẢN PHẨM (ID ĐẸP TỪ 1, VỢT 3 THUỘC TÍNH)")
sql.append(" Mô tả:")
sql.append("   1. Xóa sạch dữ liệu sản phẩm cũ, reset identity về 0.")
sql.append("   2. Cấu hình DanhMucThuocTinh: Vợt cầu lông CHỈ CÓ 3 THUỘC TÍNH: Màu sắc, Sức căng, Độ cứng.")
sql.append("   3. Nạp 57 sản phẩm chính hãng với ID từ 1 đến 57, mã SP000001 -> SP000057.")
sql.append("   4. Nạp các biến thể với SKU đẹp, tồn kho, giá bán và liên kết đúng ảnh có sẵn trên đĩa.")
sql.append("   5. Nạp phiếu nhập kho khởi tạo PN000001 để đồng bộ số lượng tồn kho.")
sql.append("===============================================================================")
sql.append("*/")
sql.append("USE [BadmintonShopDB1];")
sql.append("GO")
sql.append("SET ANSI_NULLS ON;")
sql.append("SET QUOTED_IDENTIFIER ON;")
sql.append("SET NOCOUNT ON;")
sql.append("BEGIN TRANSACTION;")
sql.append("BEGIN TRY")
sql.append("    PRINT N'1. Đang dọn dẹp dữ liệu sản phẩm cũ...';")
sql.append("    DELETE FROM [dbo].[CommentViolationLog];")
sql.append("    DELETE FROM [dbo].[HinhAnhDanhGia];")
sql.append("    DELETE FROM [dbo].[DanhGia];")
sql.append("    DELETE FROM [dbo].[GioHangChiTiet];")
sql.append("    DELETE FROM [dbo].[HoaDonChiTiet];")
sql.append("    DELETE FROM [dbo].[PhieuNhapChiTiet];")
sql.append("    DELETE FROM [dbo].[PhieuNhap];")
sql.append("    DELETE FROM [dbo].[SanPhamYeuThich];")
sql.append("    DELETE FROM [dbo].[SanPham_DotGiamGia];")
sql.append("    DELETE FROM [dbo].[HinhAnhSanPham];")
sql.append("    DELETE FROM [dbo].[SanPhamChiTietThuocTinh];")
sql.append("    DELETE FROM [dbo].[SanPhamChiTiet];")
sql.append("    DELETE FROM [dbo].[SanPham];")
sql.append("")
sql.append("    PRINT N'2. Đang reset bộ đếm IDENTITY về 0...';")
sql.append("    DBCC CHECKIDENT ('[dbo].[SanPham]', RESEED, 0);")
sql.append("    DBCC CHECKIDENT ('[dbo].[SanPhamChiTiet]', RESEED, 0);")
sql.append("    DBCC CHECKIDENT ('[dbo].[HinhAnhSanPham]', RESEED, 0);")
sql.append("    DBCC CHECKIDENT ('[dbo].[SanPhamChiTietThuocTinh]', RESEED, 0);")
sql.append("    DBCC CHECKIDENT ('[dbo].[PhieuNhap]', RESEED, 0);")
sql.append("    DBCC CHECKIDENT ('[dbo].[PhieuNhapChiTiet]', RESEED, 0);")
sql.append("    DBCC CHECKIDENT ('[dbo].[HoaDonChiTiet]', RESEED, 0);")
sql.append("    DBCC CHECKIDENT ('[dbo].[GioHangChiTiet]', RESEED, 0);")
sql.append("    DBCC CHECKIDENT ('[dbo].[DanhGia]', RESEED, 0);")
sql.append("    DBCC CHECKIDENT ('[dbo].[HinhAnhDanhGia]', RESEED, 0);")
sql.append("    DBCC CHECKIDENT ('[dbo].[CommentViolationLog]', RESEED, 0);")
sql.append("")
sql.append("    PRINT N'3. Cấu hình thuộc tính danh mục: Vợt cầu lông CHỈ CÓ 3 THUỘC TÍNH (Màu sắc, Sức căng, Độ cứng)...';")
sql.append("    DELETE FROM [dbo].[DanhMucThuocTinh] WHERE [id_danh_muc] = 1;")
sql.append("    INSERT INTO [dbo].[DanhMucThuocTinh] ([id_danh_muc], [id_thuoc_tinh]) VALUES (1, 1); -- Màu sắc")
sql.append("    INSERT INTO [dbo].[DanhMucThuocTinh] ([id_danh_muc], [id_thuoc_tinh]) VALUES (1, 7); -- Sức căng")
sql.append("    INSERT INTO [dbo].[DanhMucThuocTinh] ([id_danh_muc], [id_thuoc_tinh]) VALUES (1, 2); -- Độ cứng")
sql.append("    -- Dọn dẹp các danh mục/thương hiệu rác nếu có")
sql.append("    DELETE FROM [dbo].[DanhMucThuocTinh] WHERE [id_danh_muc] NOT IN (1, 2, 3, 4, 5, 6, 7, 8);")
sql.append("    DELETE FROM [dbo].[DanhMuc] WHERE [id] NOT IN (1, 2, 3, 4, 5, 6, 7, 8);")
sql.append("    DELETE FROM [dbo].[ThuongHieu] WHERE [id] NOT IN (1, 2, 3, 4, 5, 6);")
sql.append("    DELETE FROM [dbo].[ThuocTinh] WHERE [id] NOT IN (1, 2, 3, 4, 5, 6, 7);")
sql.append("")

# Biến đếm ID
current_sp_id = 0
current_spct_id = 0
current_img_id = 0
current_attr_id = 0
current_pnct_id = 0

all_sp_inserts = []
all_spct_inserts = []
all_img_inserts = []
all_attr_inserts = []
all_pnct_inserts = []
total_pn_cost = 0

for cat_id, prod_list in categories_groups:
    for p in prod_list:
        current_sp_id += 1
        pid = current_sp_id
        ma_sp = f"SP{pid:06d}"
        ten_sp = p['name'].replace("'", "''")
        mo_ta = p['desc'].replace("'", "''")
        brand_id = p['brand']
        
        all_sp_inserts.append(
            f"INSERT INTO [dbo].[SanPham] ([id],[ma_san_pham],[ten_san_pham],[id_danh_muc],[id_thuong_hieu],[id_nhan_vien],[mo_ta],[trang_thai],[so_luot_danh_gia],[diem_trung_binh],[ngay_tao],[ngay_cap_nhat]) "
            f"VALUES ({pid}, '{ma_sp}', N'{ten_sp}', {cat_id}, {brand_id}, 1, N'{mo_ta}', 1, 0, 0.0, GETDATE(), NULL);"
        )
        
        # Ảnh sản phẩm lấy từ thư mục uploads thực tế
        p_images = get_product_images(p['id'])
        if not p_images:
            print(f"CẢNH BÁO: Không tìm thấy ảnh cho SP {p['name']}")
            
        variants = p['variants']
        for v_idx, v in enumerate(variants, 1):
            current_spct_id += 1
            spct_id = current_spct_id
            sku = f"{ma_sp}-V{spct_id:06d}"
            cost = v['cost']
            price = v['price']
            stock = v['stock']
            total_pn_cost += cost * stock
            
            all_spct_inserts.append(
                f"INSERT INTO [dbo].[SanPhamChiTiet] ([id],[id_san_pham],[sku],[gia_nhap],[gia_ban],[so_luong_ton],[so_luong_sp_loi],[trang_thai],[ngay_tao],[ngay_cap_nhat]) "
                f"VALUES ({spct_id}, {pid}, '{sku}', {cost}, {price}, {stock}, 0, 1, GETDATE(), NULL);"
            )
            
            # Phiếu nhập chi tiết
            current_pnct_id += 1
            all_pnct_inserts.append(
                f"INSERT INTO [dbo].[PhieuNhapChiTiet] ([id],[id_phieu_nhap],[id_san_pham_chi_tiet],[so_luong],[gia_nhap],[thanh_tien]) "
                f"VALUES ({current_pnct_id}, 1, {spct_id}, {stock}, {cost}, {cost * stock});"
            )
            
            # Thuộc tính theo danh mục
            color_val = v['color'].replace("'", "''")
            if cat_id == 1:
                # VỢT CẦU LÔNG: ĐÚNG 3 THUỘC TÍNH
                # 1. Màu sắc (id 1)
                current_attr_id += 1
                all_attr_inserts.append(
                    f"INSERT INTO [dbo].[SanPhamChiTietThuocTinh] ([id],[id_san_pham_chi_tiet],[id_thuoc_tinh],[gia_tri]) VALUES ({current_attr_id}, {spct_id}, 1, N'{color_val}');"
                )
                # 2. Sức căng (id 7)
                tension_val = v['tension'].replace("'", "''")
                current_attr_id += 1
                all_attr_inserts.append(
                    f"INSERT INTO [dbo].[SanPhamChiTietThuocTinh] ([id],[id_san_pham_chi_tiet],[id_thuoc_tinh],[gia_tri]) VALUES ({current_attr_id}, {spct_id}, 7, N'{tension_val}');"
                )
                # 3. Độ cứng (id 2)
                stiff_val = v['stiff'].replace("'", "''")
                current_attr_id += 1
                all_attr_inserts.append(
                    f"INSERT INTO [dbo].[SanPhamChiTietThuocTinh] ([id],[id_san_pham_chi_tiet],[id_thuoc_tinh],[gia_tri]) VALUES ({current_attr_id}, {spct_id}, 2, N'{stiff_val}');"
                )
            elif cat_id in (2, 3, 4):
                # Giày, Áo, Quần: Màu sắc (1), Kích thước (6)
                current_attr_id += 1
                all_attr_inserts.append(
                    f"INSERT INTO [dbo].[SanPhamChiTietThuocTinh] ([id],[id_san_pham_chi_tiet],[id_thuoc_tinh],[gia_tri]) VALUES ({current_attr_id}, {spct_id}, 1, N'{color_val}');"
                )
                size_val = v['size'].replace("'", "''")
                current_attr_id += 1
                all_attr_inserts.append(
                    f"INSERT INTO [dbo].[SanPhamChiTietThuocTinh] ([id],[id_san_pham_chi_tiet],[id_thuoc_tinh],[gia_tri]) VALUES ({current_attr_id}, {spct_id}, 6, N'{size_val}');"
                )
            else:
                # Balo, Túi, Cước, Quấn cán: Màu sắc (1)
                current_attr_id += 1
                all_attr_inserts.append(
                    f"INSERT INTO [dbo].[SanPhamChiTietThuocTinh] ([id],[id_san_pham_chi_tiet],[id_thuoc_tinh],[gia_tri]) VALUES ({current_attr_id}, {spct_id}, 1, N'{color_val}');"
                )
            
            # Gán ảnh cho biến thể
            # Nếu có ảnh riêng theo màu sắc trong thư mục
            matched_imgs = [img for img in p_images if color_val.lower() in img.lower()]
            use_imgs = matched_imgs if matched_imgs else p_images
            if not use_imgs and p_images:
                use_imgs = p_images
                
            for img_order, img_url in enumerate(use_imgs, 1):
                current_img_id += 1
                is_main = 1 if img_order == 1 else 0
                img_url_esc = img_url.replace("'", "''")
                all_img_inserts.append(
                    f"INSERT INTO [dbo].[HinhAnhSanPham] ([id],[id_san_pham_chi_tiet],[url_hinh_anh],[mau_sac],[la_anh_chinh],[thu_tu]) "
                    f"VALUES ({current_img_id}, {spct_id}, '{img_url_esc}', N'{color_val}', {is_main}, {img_order});"
                )

sql.append(f"    PRINT N'4. Đang nạp {current_sp_id} SanPham (ID 1 -> {current_sp_id})...';")
sql.append("    SET IDENTITY_INSERT [dbo].[SanPham] ON;")
sql.extend(all_sp_inserts)
sql.append("    SET IDENTITY_INSERT [dbo].[SanPham] OFF;")
sql.append(f"    DBCC CHECKIDENT ('[dbo].[SanPham]', RESEED, {current_sp_id});")
sql.append("")

sql.append(f"    PRINT N'5. Đang nạp {current_spct_id} SanPhamChiTiet (ID 1 -> {current_spct_id})...';")
sql.append("    SET IDENTITY_INSERT [dbo].[SanPhamChiTiet] ON;")
sql.extend(all_spct_inserts)
sql.append("    SET IDENTITY_INSERT [dbo].[SanPhamChiTiet] OFF;")
sql.append(f"    DBCC CHECKIDENT ('[dbo].[SanPhamChiTiet]', RESEED, {current_spct_id});")
sql.append("")

sql.append(f"    PRINT N'6. Đang nạp {current_attr_id} thuộc tính biến thể (SanPhamChiTietThuocTinh)...';")
sql.append("    SET IDENTITY_INSERT [dbo].[SanPhamChiTietThuocTinh] ON;")
sql.extend(all_attr_inserts)
sql.append("    SET IDENTITY_INSERT [dbo].[SanPhamChiTietThuocTinh] OFF;")
sql.append(f"    DBCC CHECKIDENT ('[dbo].[SanPhamChiTietThuocTinh]', RESEED, {current_attr_id});")
sql.append("")

sql.append(f"    PRINT N'7. Đang nạp {current_img_id} HinhAnhSanPham...';")
sql.append("    SET IDENTITY_INSERT [dbo].[HinhAnhSanPham] ON;")
sql.extend(all_img_inserts)
sql.append("    SET IDENTITY_INSERT [dbo].[HinhAnhSanPham] OFF;")
sql.append(f"    DBCC CHECKIDENT ('[dbo].[HinhAnhSanPham]', RESEED, {current_img_id});")
sql.append("")

sql.append("    PRINT N'8. Đang nạp Phiếu nhập khởi tạo ban đầu (PN000001)...';")
sql.append("    SET IDENTITY_INSERT [dbo].[PhieuNhap] ON;")
sql.append(
    f"    INSERT INTO [dbo].[PhieuNhap] ([id],[ma_phieu_nhap],[id_nhan_vien],[ngay_nhap],[tong_tien],[ghi_chu],[ngay_tao],[ngay_cap_nhat]) "
    f"VALUES (1, 'PN000001', 1, GETDATE(), {total_pn_cost}, N'Khởi tạo tồn kho ban đầu cho hệ thống SMASH-VN', GETDATE(), NULL);"
)
sql.append("    SET IDENTITY_INSERT [dbo].[PhieuNhap] OFF;")
sql.append("    DBCC CHECKIDENT ('[dbo].[PhieuNhap]', RESEED, 1);")
sql.append("")

sql.append(f"    PRINT N'9. Đang nạp {current_pnct_id} chi tiết phiếu nhập (PhieuNhapChiTiet)...';")
sql.append("    SET IDENTITY_INSERT [dbo].[PhieuNhapChiTiet] ON;")
sql.extend(all_pnct_inserts)
sql.append("    SET IDENTITY_INSERT [dbo].[PhieuNhapChiTiet] OFF;")
sql.append(f"    DBCC CHECKIDENT ('[dbo].[PhieuNhapChiTiet]', RESEED, {current_pnct_id});")
sql.append("")

sql.append("    COMMIT TRANSACTION;")
sql.append("    PRINT N'===========================================================';")
sql.append(f"    PRINT N'===> ĐÃ RESET VÀ TẠO MỚI THÀNH CÔNG DỮ LIỆU CHUẨN ĐẸP!';")
sql.append(f"    PRINT N'===> Tổng sản phẩm: {current_sp_id} (ID 1 -> {current_sp_id})';")
sql.append(f"    PRINT N'===> Tổng biến thể: {current_spct_id} (ID 1 -> {current_spct_id})';")
sql.append(f"    PRINT N'===> Toàn bộ vợt cầu lông đã được chuẩn hóa ĐÚNG 3 THUỘC TÍNH: Màu sắc, Sức căng, Độ cứng!';")
sql.append("    PRINT N'===========================================================';")
sql.append("END TRY")
sql.append("BEGIN CATCH")
sql.append("    ROLLBACK TRANSACTION;")
sql.append("    PRINT N'LỖI KHI TẠO DỮ LIỆU: ' + ERROR_MESSAGE();")
sql.append("    THROW;")
sql.append("END CATCH;")
sql.append("GO")

output_file = 'scratch/tao_data_san_pham_moi.sql'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql) + '\n')

print(f"Đã tạo thành công {output_file} ({len(sql)} dòng)!")
print(f"Tổng SP: {current_sp_id}, Tổng Biến thể: {current_spct_id}, Tổng Thuộc tính: {current_attr_id}, Tổng Ảnh: {current_img_id}")
