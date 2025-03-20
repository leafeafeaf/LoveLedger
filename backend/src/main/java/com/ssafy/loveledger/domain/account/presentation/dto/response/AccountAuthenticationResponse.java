package com.ssafy.loveledger.domain.account.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class AccountAuthenticationResponse {

    @JsonProperty("Header")
    private SSAFYResponseHeader header;

    @JsonProperty("REC")
    private Map<String, Object> resultData;
}
