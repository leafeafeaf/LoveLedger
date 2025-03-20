package com.ssafy.loveledger.domain.library.presentation.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Getter;

@Getter
public class UpdateHistoryRequest {

    @NotNull
    private String accountId;

    @NotEmpty
    private List<String> transactionId;

    @NotEmpty
    @Size(max = 16)
    private List<String> updatedTargetNames;
}
