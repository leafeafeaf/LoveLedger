package com.ssafy.loveledger.domain.account.presentation;

import com.ssafy.loveledger.domain.account.presentation.dto.request.AccountAuthenticationRequest;
import com.ssafy.loveledger.domain.account.presentation.dto.request.UpdateHistoryTargetRequest;
import com.ssafy.loveledger.domain.account.presentation.dto.response.DailyStatisticsResponse;
import com.ssafy.loveledger.domain.account.presentation.dto.response.HistoryDetailResponse;
import com.ssafy.loveledger.domain.account.presentation.dto.response.WeekStatisticsResponse;
import com.ssafy.loveledger.domain.account.service.AccountService;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.global.util.UserUtil;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/account")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final UserUtil userUtil;

    @GetMapping("/saveus")
    public List<WeekStatisticsResponse> saveAccount() {
        User user = userUtil.getCurrentUser();
        return accountService.getAccountHistoryByWeek(user, 2025, 3);
    }

    @GetMapping("/history/sum/list")
    public List<DailyStatisticsResponse> getDailyStatisticsByMonth(
        @RequestParam Integer year,
        @RequestParam Integer month,
        @RequestParam(defaultValue = "1") Integer pageno,
        @RequestParam(defaultValue = "15") Integer size,
        @RequestParam(defaultValue = "asc") String sort
    ) {
        User user = userUtil.getCurrentUser();
        return accountService.getAccountHistoryByMonth(user, year, month, size, pageno, sort);
    }

    @GetMapping("/history/detail/list")
    public Page<HistoryDetailResponse> getDailyHistory(
        @RequestParam Integer year,
        @RequestParam Integer month,
        @RequestParam Integer day,
        @RequestParam(defaultValue = "1") Integer pageno,
        @RequestParam(defaultValue = "15") Integer size,
        @RequestParam(defaultValue = "ASC") String sort
    ) {
        User user = userUtil.getCurrentUser();
        return accountService.getAccountHistory(user, year, month, day, size, pageno, sort);
    }

    @PutMapping("/history/{transactionId}")
    public void updateHistoryAccountTarget(
        @PathVariable String transactionId,
        @RequestBody UpdateHistoryTargetRequest request
    ) {
        User user = userUtil.getCurrentUser();
        accountService.updateHistoryTarget(user, transactionId, request.getAccountNo(),
            request.getUpdatedTargetName());
    }

    @DeleteMapping("/history/detail/{transactionId}")
    public void deleteHistory(@PathVariable String transactionId) {
        User user = userUtil.getCurrentUser();
        accountService.deleteHistory(user, transactionId);
    }

    @PostMapping("/verify/request")
    public void getVerification(@RequestBody AccountAuthenticationRequest request) {
        User user = userUtil.getCurrentUser();
        accountService.getVerificationCode(user, request.getAccountNo());
    }

    @PostMapping("/verify/confirm")
    public void doVerification(@RequestBody AccountAuthenticationRequest request) {
        User user = userUtil.getCurrentUser();
        accountService.doVerification(user, request.getAccountNo(), request.getAuthCode());
    }
}
