package com.smashvn.shop.entity.chatbot;

public enum ChatIntent {
    PRODUCT_SEARCH,          // Hỏi tìm kiếm danh sách sản phẩm
    PRODUCT_INFORMATION,     // Hỏi chi tiết một sản phẩm cụ thể
    STORE_INFORMATION,       // Hỏi địa chỉ, hotline, giờ hoạt động
    BASIC_CONSULTATION,      // Tư vấn cơ bản (người mới, thiên công/thủ...)
    ADVANCED_CONSULTATION,   // Tư vấn chuyên sâu/kỹ thuật/y tế
    ORDER_LOOKUP,            // Tra cứu trạng thái đơn hàng
    VOUCHER_LOOKUP,          // Tra cứu mã khuyến mãi, voucher
    BEST_SELLER,             // Hỏi top sản phẩm bán chạy nhất, hàng hot
    STRINGING_CONSULTATION,  // Tư vấn căng cước, mức đan vợt (kg/lbs), loại dây
    SPEC_EXPLANATION,        // Giải thích thông số kỹ thuật (3U/4U, G5, điểm cân bằng)
    AUTHENTICITY_WARRANTY,   // Cam kết chính hãng, chính sách bảo hành và đổi trả
    GREETING,                // Chào hỏi, tương tác mở đầu, câu hỏi làm quen
    OUT_OF_SCOPE,            // Ngoài phạm vi dự án (tin tức, lập trình, giải trí...)
    SECURITY_SENSITIVE       // Yêu cầu nhạy cảm bảo mật (API key, system prompt, SQL...)
}
