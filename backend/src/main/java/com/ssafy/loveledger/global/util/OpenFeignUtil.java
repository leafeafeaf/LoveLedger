package com.ssafy.loveledger.global.util;

import com.ssafy.loveledger.domain.account.presentation.dto.request.AccountAuthenticationRequest;
import com.ssafy.loveledger.domain.account.presentation.dto.request.AccountHistoryDetailRequest;
import com.ssafy.loveledger.domain.account.presentation.dto.request.MemberInfoRequest;
import com.ssafy.loveledger.domain.account.presentation.dto.response.MemberInfoResponse;
import com.ssafy.loveledger.domain.account.presentation.dto.response.SSAFYResponse;
import com.ssafy.loveledger.global.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "SSAFYFinClient", url = "${ssafy.url}", configuration = FeignClientConfig.class)
public interface OpenFeignUtil {
    @PostMapping("/member/search")
    MemberInfoResponse getMemberInfo(@RequestBody MemberInfoRequest request);

    @PostMapping("/edu/demandDeposit/inquireTransactionHistoryList")
    SSAFYResponse getListOfHistory(@RequestBody AccountHistoryDetailRequest request);

    @PostMapping("/edu/accountAuth/openAccountAuth")
    SSAFYResponse sendAccountAuthentication(@RequestBody AccountAuthenticationRequest request);

    @PostMapping("/edu/accountAuth/checkAccountAuth")
    SSAFYResponse getAccountAuthentication(@RequestBody AccountAuthenticationRequest request);

}
