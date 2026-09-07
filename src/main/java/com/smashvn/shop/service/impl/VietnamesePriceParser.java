package com.smashvn.shop.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class VietnamesePriceParser {

    private static final Pattern PRICE_PATTERN = Pattern.compile(
            "(?i)\\b(\\d+(?:[.,]\\d+)?)\\s*(chục\\s*)?(triệu|tr|nghìn|ngàn|k|đ|vnd)?(?:\\s*(\\d+)(?:\\s*(k|nghìn|ngàn|tr|triệu))?)?\\b"
    );

    // Specific patterns for composite numbers like 1tr5, 2tr5, 1 triệu 500
    private static final Pattern TR_COMPOSITE_PATTERN = Pattern.compile(
            "(?i)\\b(\\d+)\\s*(?:tr|triệu)\\s*(\\d+)\\s*(k|nghìn|ngàn)?\\b"
    );

    public static BigDecimal parsePrice(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        String clean = text.toLowerCase().trim()
                .replaceAll("đ|vnd|vnđ", "")
                .trim();

        // 0. Normalize slang: "củ", "chai" -> "triệu", "cành" -> "k"
        clean = clean.replaceAll("(?i)(?U)\\b(\\d+)\\s*(củ|chai)\\s*rưỡi\\b", "$1.5 triệu")
                .replaceAll("(?i)(?U)\\b(củ|chai)\\s*rưỡi\\b", "1.5 triệu")
                .replaceAll("(?i)(?U)\\brưỡi\\b", ".5 triệu")
                .replaceAll("(?i)(?U)\\b(củ|chai|cu)\\b", "triệu")
                .replaceAll("(?i)(?U)\\b(cành|canh)\\b", "k");

        // 1. Try composite pattern like "1tr5", "2 triệu 500", "1tr500"
        Matcher compMatcher = TR_COMPOSITE_PATTERN.matcher(clean);
        if (compMatcher.find()) {
            try {
                long mainPart = Long.parseLong(compMatcher.group(1));
                String subStr = compMatcher.group(2);
                long subPart = Long.parseLong(subStr);
                String unit = compMatcher.group(3);

                BigDecimal base = BigDecimal.valueOf(mainPart).multiply(new BigDecimal("1000000"));
                if (subStr.length() == 1) { // e.g. "5" in 1tr5 -> 500,000
                    base = base.add(BigDecimal.valueOf(subPart).multiply(new BigDecimal("100000")));
                } else if (unit != null && (unit.equals("k") || unit.contains("nghìn") || unit.contains("ngàn"))) {
                    base = base.add(BigDecimal.valueOf(subPart).multiply(new BigDecimal("1000")));
                } else if (subPart < 1000) {
                    base = base.add(BigDecimal.valueOf(subPart).multiply(new BigDecimal("1000")));
                } else {
                    base = base.add(BigDecimal.valueOf(subPart));
                }
                return base;
            } catch (Exception ignored) {
            }
        }

        // 2. Try decimal million pattern like "1.5tr", "1,5 triệu", "1.5 triệu"
        Matcher millionDecimalMatcher = Pattern.compile("(?i)\\b(\\d+[.,]\\d+)\\s*(?:tr|triệu)\\b").matcher(clean);
        if (millionDecimalMatcher.find()) {
            try {
                String valStr = millionDecimalMatcher.group(1).replace(',', '.');
                BigDecimal val = new BigDecimal(valStr);
                return val.multiply(new BigDecimal("1000000")).setScale(0, RoundingMode.HALF_UP);
            } catch (Exception ignored) {
            }
        }

        // 3. Try thousand pattern like "500k", "500 nghìn", "500 ngàn"
        Matcher thousandMatcher = Pattern.compile("(?i)\\b(\\d+(?:[.,]\\d+)?)\\s*(?:k|nghìn|ngàn)\\b").matcher(clean);
        if (thousandMatcher.find()) {
            try {
                String valStr = thousandMatcher.group(1).replace(',', '.');
                BigDecimal val = new BigDecimal(valStr);
                return val.multiply(new BigDecimal("1000")).setScale(0, RoundingMode.HALF_UP);
            } catch (Exception ignored) {
            }
        }

        // 4. Try integer million pattern like "1tr", "1 triệu", "2 triệu"
        Matcher millionIntMatcher = Pattern.compile("(?i)\\b(\\d+)\\s*(?:tr|triệu)\\b").matcher(clean);
        if (millionIntMatcher.find()) {
            try {
                BigDecimal val = new BigDecimal(millionIntMatcher.group(1));
                return val.multiply(new BigDecimal("1000000")).setScale(0, RoundingMode.HALF_UP);
            } catch (Exception ignored) {
            }
        }

        // 5. Raw number formatted like "500.000", "1.500.000", "2.200.000", "500000"
        Matcher formattedNumMatcher = Pattern.compile("\\b(\\d{1,3}(?:[.,]\\d{3})+|\\d{5,9})\\b").matcher(clean);
        if (formattedNumMatcher.find()) {
            try {
                String numStr = formattedNumMatcher.group(1).replaceAll("[.,]", "");
                return new BigDecimal(numStr);
            } catch (Exception ignored) {
            }
        }

        return null;
    }
}
