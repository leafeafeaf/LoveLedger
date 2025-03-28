package com.ssafy.loveledger.domain.account.presentation.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
public class CategoryPrescriptionResponseWrapper {

    private List<CategoryPrescriptionResponse> results;
}
