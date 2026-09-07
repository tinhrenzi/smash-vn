import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templateresolver.StringTemplateResolver;

public class OrderStatusAlignmentReview {
    record Scenario(String state, String returned, int steps, int finished) {
        String key() { return returned == null ? state : "return-" + returned; }
    }

    static void check(boolean value, String explanation) {
        if (!value) throw new AssertionError(explanation);
    }

    public static void main(String[] args) throws Exception {
        Path root = Path.of("").toAbsolutePath();
        Path out = root.resolve("tmp/order-status-alignment-review");
        Files.createDirectories(out);
        Document source = Jsoup.parse(Files.readString(root.resolve("src/main/resources/templates/dash-manage-order.html")));
        source.outputSettings().prettyPrint(false);
        Element notice = source.select("span").stream()
                .filter(el -> el.ownText().equals("Đơn hàng đang được vận chuyển, không thể hủy đơn."))
                .findFirst().orElseThrow().parent().clone().attr("id", "review-shipping-notice");
        String fragment = source.getElementById("btn-huy-don").outerHtml()
                + source.getElementById("btn-yeu-cau-tra-hang").outerHtml()
                + notice.outerHtml()
                + source.select(".timeline-stepper").outerHtml();
        check(source.select(".timeline-stepper").size() == 3, "Expected three actual template timeline variants");
        StringTemplateResolver resolver = new StringTemplateResolver();
        resolver.setTemplateMode("HTML");
        resolver.setCacheable(false);
        SpringTemplateEngine engine = new SpringTemplateEngine();
        engine.setTemplateResolver(resolver);
        List<Scenario> scenarios = List.of(
                new Scenario("cho_thanh_toan", null, 6, 1),
                new Scenario("cho_xac_nhan", null, 6, 1),
                new Scenario("da_xac_nhan", null, 6, 2),
                new Scenario("dang_chuan_bi_hang", null, 6, 3),
                new Scenario("dang_giao", null, 6, 4),
                new Scenario("giao_that_bai", null, 6, 4),
                new Scenario("da_giao", null, 6, 6),
                new Scenario("hoan_thanh", null, 6, 6),
                new Scenario("da_huy", null, 3, 2),
                new Scenario("da_giao", "REQUESTED", 5, 1),
                new Scenario("da_giao", "PENDING_APPROVAL", 5, 1),
                new Scenario("da_giao", "REJECTED", 5, 2),
                new Scenario("da_giao", "WAITING_FOR_PICKUP", 5, 2),
                new Scenario("da_giao", "PICKED_UP", 5, 3),
                new Scenario("da_giao", "RETURNED", 5, 4),
                new Scenario("da_giao", "REFUNDED", 5, 5),
                new Scenario("da_giao", "EXCHANGED", 5, 5));
        List<String> report = new ArrayList<>();
        String styleLinks = "";
        for (String css : List.of("vendor.css", "utility.css", "app.css")) {
            styleLinks += "<link rel=\"stylesheet\" href=\"" + root.resolve("src/main/resources/static/css/" + css).toUri() + "\">";
        }
        for (Scenario scenario : scenarios) {
            Map<String, Object> order = new LinkedHashMap<>();
            for (String key : List.of("trangThaiHoanHang", "ngayThanhToan", "ngayXacNhan", "ngayLayHang", "ngayGiaoDVVC", "ngayGiaoThanhCong", "ngayHuy", "thoiGianHoanTien")) order.put(key, null);
            order.put("id", 84);
            order.put("trangThaiDonHang", scenario.state());
            order.put("trangThaiHoanHang", scenario.returned());
            order.put("trangThaiThanhToan", "CHUA_THANH_TOAN");
            order.put("status", "unpaid");
            order.put("tongTien", new BigDecimal("3500"));
            order.put("ngayDat", LocalDateTime.of(2026, 9, 7, 15, 45));
            order.put("loaiYeuCauDoiTra", "EXCHANGED".equals(scenario.returned()) ? "DOI" : "TRA");
            if (Set.of("da_giao", "hoan_thanh").contains(scenario.state())) {
                order.put("trangThaiThanhToan", "DA_THANH_TOAN");
                order.put("status", "paid");
                order.put("ngayThanhToan", order.get("ngayDat"));
                order.put("ngayGiaoThanhCong", order.get("ngayDat"));
            }
            Context context = new Context(Locale.forLanguageTag("vi-VN"));
            context.setVariable("order", order);
            String rendered = engine.process(fragment, context);
            Document document = Jsoup.parse(rendered);
            boolean hasNotice = document.getElementById("review-shipping-notice") != null;
            boolean expectedNotice = scenario.returned() == null && Set.of("dang_giao", "giao_that_bai").contains(scenario.state());
            check(hasNotice == expectedNotice, scenario.key() + ": incorrect shipping notice visibility");
            if (scenario.state().equals("dang_giao")) check(document.text().contains("Đơn hàng đang được vận chuyển, không thể hủy đơn."), "Shipping wording");
            if (scenario.state().equals("giao_that_bai")) check(document.text().contains("Đơn vị vận chuyển sẽ thử giao lại."), "Failed delivery wording");
            check(!document.text().contains("hoặc đã giao, không thể hủy đơn"), "Stale delivery warning");
            boolean hasCancel = document.getElementById("btn-huy-don") != null;
            check(hasCancel == Set.of("cho_thanh_toan", "cho_xac_nhan", "da_xac_nhan").contains(scenario.state()), scenario.key() + ": cancellation eligibility changed");
            boolean hasReturn = document.getElementById("btn-yeu-cau-tra-hang") != null;
            boolean expectedReturn = Set.of("da_giao", "hoan_thanh").contains(scenario.state()) && (scenario.returned() == null || scenario.returned().equals("REJECTED"));
            check(hasReturn == expectedReturn, scenario.key() + ": return eligibility changed");
            check(document.select(".timeline-stepper").size() == 1, scenario.key() + ": wrong timeline variant visibility");
            check(document.select(".timeline-stepper-step").size() == scenario.steps(), scenario.key() + ": step count");
            check(document.select(".timeline-stepper-step.finish").size() == scenario.finished(), scenario.key() + ": finished count");
            String html = "<!DOCTYPE html><html lang=\"vi\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>Order preview " + scenario.key() + "</title>" + styleLinks
                    + source.select("head > style").outerHtml()
                    + "<style>body{background:#fafafa;margin:0;padding:20px;box-sizing:border-box}.review-wrap{width:934px;max-width:100%;margin:auto;padding:28px;background:white;box-sizing:border-box;border-radius:16px}.review-label{margin-bottom:20px;font-size:14px;font-weight:600}</style></head><body><main class=\"review-wrap\"><div class=\"review-label\">" + scenario.key() + "</div>" + rendered + "</main></body></html>";
            Files.writeString(out.resolve(scenario.key() + ".html"), html, StandardCharsets.UTF_8);
            String result = scenario.key() + ": PASS (notice=" + hasNotice + ", cancel=" + hasCancel + ", return=" + hasReturn + ", steps=" + scenario.steps() + ", finished=" + scenario.finished() + ")";
            report.add(result);
            System.out.println(result);
        }
        Files.writeString(out.resolve("render-verification.txt"), String.join(System.lineSeparator(), report), StandardCharsets.UTF_8);
        System.out.println("All " + scenarios.size() + " scenarios passed. Preview directory: " + out);
    }
}
