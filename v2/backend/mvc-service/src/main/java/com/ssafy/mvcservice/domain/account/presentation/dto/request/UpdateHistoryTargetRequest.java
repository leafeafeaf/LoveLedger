package com.ssafy.mvcservice.domain.account.presentation.dto.request;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class UpdateHistoryTargetRequest {

    private String updatedTargetName;
}
