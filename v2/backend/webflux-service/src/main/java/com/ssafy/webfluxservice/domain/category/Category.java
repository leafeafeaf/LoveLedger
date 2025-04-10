package com.ssafy.webfluxservice.domain.category;


import java.util.Arrays;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum Category {
    EDUCATION(0, "EDUCATION", "교육"),
    TRANSPORTATION(1, "TRANSPORTATION", "교통/자동차"),
    OTHER_EXPENSES(2, "OTHER_EXPENSES", "기타소비"),
    LARGE_MART(3, "LARGE_MART", "대형마트"),
    BEAUTY(4, "BEAUTY", "미용"),
    DELIVERY(5, "DELIVERY", "배달"),
    INSURANCE(6, "INSURANCE", "보험"),
    DAILY_NECESSITIES(7, "DAILY_NECESSITIES", "생필품"),
    LIVING_SERVICES(8, "LIVING_SERVICES", "생활서비스"),
    TAXES_UTILITIES(9, "TAXES_UTILITIES", "세금/공과금"),
    SHOPPING_MALL(10, "SHOPPING_MALL", "쇼핑몰"),
    TRAVEL_ACCOMMODATION(11, "TRAVEL_ACCOMMODATION", "여행/숙박"),
    DINING_OUT(12, "DINING_OUT", "외식"),
    MEDICAL_HEALTH(13, "MEDICAL_HEALTH", "의료/건강"),
    ALCOHOL_PUB(14, "ALCOHOL_PUB", "주류/펍"),
    HOBBY_LEISURE(15, "HOBBY_LEISURE", "취미/여가"),
    CAFE(16, "CAFE", "카페"),
    COMMUNICATION(17, "COMMUNICATION", "통신"),
    CONVENIENCE_STORE(18, "CONVENIENCE_STORE", "편의점"),
    NOT_DEFINED(99, "NOT_DEFINED", "정의되지 않음");

    private final int id;
    private final String code;
    private final String name;

    public static Category fromId(int id) {
        return Arrays.stream(values())
            .filter(category -> category.id == id)
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Unknown category ID: " + id));
    }

    public static Category fromCode(String code) {
        return Arrays.stream(values())
            .filter(category -> category.code.equalsIgnoreCase(code))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Unknown category code: " + code));
    }
}
