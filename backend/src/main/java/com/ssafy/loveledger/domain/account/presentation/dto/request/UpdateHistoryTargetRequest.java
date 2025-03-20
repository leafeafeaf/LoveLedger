package com.ssafy.loveledger.domain.account.presentation.dto.request;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class UpdateHistoryTargetRequest {

    private String accountNo;
    private String updatedTargetName;
}
