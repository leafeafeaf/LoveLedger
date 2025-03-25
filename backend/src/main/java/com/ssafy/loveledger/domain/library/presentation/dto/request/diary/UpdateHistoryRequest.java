package com.ssafy.loveledger.domain.library.presentation.dto.request.diary;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Getter;

@Getter
public class UpdateHistoryRequest {

    @NotEmpty
    private List<String> transactionId;

    @NotEmpty
    private List<@Valid @Size(max = 32) String> updatedTargetNames;
}
