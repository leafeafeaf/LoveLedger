package com.ssafy.loveledger.domain.account.presentation.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AccountAuthenticationRequest {

    @JsonProperty("Header")
    private SSAFYRequestHeader header;

    private String accountNo;
    private String authText;
    private String authCode;
}