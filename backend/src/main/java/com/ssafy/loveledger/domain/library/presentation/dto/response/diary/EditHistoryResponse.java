package com.ssafy.loveledger.domain.library.presentation.dto.response.diary;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class EditHistoryResponse {

    private int transactionId;
    private LocalDateTime time;
    private boolean remittance;
    private String targetName;
    private String updatedTargetName;
    private String category;
    private int afterAmount;
    private int amount;
}
