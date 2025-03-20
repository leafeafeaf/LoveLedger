package com.ssafy.loveledger.domain.statistics;

import com.ssafy.loveledger.domain.statistics.domain.Category;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class CategoryUtil implements AttributeConverter<Category, Integer> {

    @Override
    public Integer convertToDatabaseColumn(Category category) {
        if (category == null) {
            return null;
        }
        return category.getId();
    }

    @Override
    public Category convertToEntityAttribute(Integer id) {
        if (id == null) {
            return null;
        }
        return Category.fromId(id);
    }
}
