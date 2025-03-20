package com.ssafy.loveledger.domain.statistics.domain;

import java.util.Arrays;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum Category {
    NOT_DEFINED(0, "NOT_DEFINED", "카테고리 없음"),
    FOOD(1, "FOOD", "식비"),
    CAFE_SNACK(2, "CAFE_SNACK", "카페, 간식"),
    CONVENIENCE_STORE(3, "CONVENIENCE_STORE", "편의점, 마트"),
    GOODS_ALCOHOL(4, "GOODS_ALCOHOL", "잡화, 술"),
    ENTERTAINMENT(5, "ENTERTAINMENT", "유흥"),
    SHOPPING(6, "SHOPPING", "쇼핑"),
    HOBBY(7, "HOBBY", "취미, 여가"),
    HEALTH(8, "HEALTH", "의료, 건강, 피트니스"),
    HOUSING_COMMUNICATION(9, "HOUSING_COMMUNICATION", "주거, 통신"),
    INSURANCE_TAX_FINANCE(10, "INSURANCE_TAX_FINANCE", "보험, 세금, 기타금융"),
    BEAUTY(11, "BEAUTY", "미용"),
    TRANSPORTATION(12, "TRANSPORTATION", "교통, 자동차"),
    TRAVEL(13, "TRAVEL", "여행, 숙박"),
    EDUCATION(14, "EDUCATION", "교육"),
    LIVING(15, "LIVING", "생활"),
    DONATION(16, "DONATION", "기부, 후원"),
    NONE(17, "NONE", "없음"),
    ATM_WITHDRAWAL(18, "ATM_WITHDRAWAL", "ATM출금"),
    TRANSFER(19, "TRANSFER", "이체"),
    SALARY(20, "SALARY", "급여"),
    CARD_PAYMENT(21, "CARD_PAYMENT", "카드대금"),
    SAVINGS_INVESTMENT(22, "SAVINGS_INVESTMENT", "저축, 투자"),
    DEFERRED_PAYMENT(23, "DEFERRED_PAYMENT", "후불결제대금");

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
