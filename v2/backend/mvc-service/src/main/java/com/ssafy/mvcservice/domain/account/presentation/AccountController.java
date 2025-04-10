package com.ssafy.mvcservice.domain.account.presentation;

import com.ssafy.mvcservice.domain.account.presentation.dto.request.AccountAuthenticationRequest;
import com.ssafy.mvcservice.domain.account.presentation.dto.request.UpdateHistoryTargetRequest;
import com.ssafy.mvcservice.domain.account.presentation.dto.response.DailyStatisticsResponse;
import com.ssafy.mvcservice.domain.account.presentation.dto.response.HistoryDetailResponse;
import com.ssafy.mvcservice.domain.account.presentation.dto.response.MonthlyStatisticsResponse;
import com.ssafy.mvcservice.domain.account.presentation.dto.response.WeekStatisticsResponse;
import com.ssafy.mvcservice.domain.account.service.AccountService;
import com.ssafy.mvcservice.domain.user.domain.User;
import com.ssafy.mvcservice.global.util.UserUtil;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class AccountController {

    private final AccountService accountService;
    private final UserUtil userUtil;

    @GetMapping("/history/sum/list")
    public List<DailyStatisticsResponse> getDailyStatisticsByMonth(
        @RequestParam Integer year,
        @RequestParam Integer month,
        @RequestParam(defaultValue = "1") Integer pageno,
        @RequestParam(defaultValue = "15") Integer size,
        @RequestParam(defaultValue = "asc") String sort,
        HttpServletRequest request
    ) {
        User user = userUtil.getCurrentUser(request);
        log.info(user.getName() + " " + year + "/" + month);

        List<DailyStatisticsResponse> monthStat = accountService.getAccountHistoryByMonth(user,
            year, month, pageno, size, sort);
        return monthStat;
    }

    @GetMapping("/saveus")
    public List<WeekStatisticsResponse> saveAccount(HttpServletRequest request) {
        User user = userUtil.getCurrentUser(request);
        return accountService.getAccountHistoryByWeek(user, 2025, 3);
    }


    @GetMapping("/history/stat")
    public Map<String, Object> getDailyStatisticsByMonth(
        @RequestParam Integer year,
        @RequestParam Integer month,
        HttpServletRequest request
    ) {
        User user = userUtil.getCurrentUser(request);
        Map<String, Object> content = new HashMap<>();

        List<WeekStatisticsResponse> weekStat = accountService.getAccountHistoryByWeek(user, year,
            month);
        List<MonthlyStatisticsResponse> monthStat = accountService.getAccountHistoryByMonth(user,
            year, month);

        content.put("weekStat", weekStat);
        content.put("monthStat", monthStat);

        return content;
    }

    @GetMapping("/history/detail/list")
    public Page<HistoryDetailResponse> getDailyHistory(
        @RequestParam Integer year,
        @RequestParam Integer month,
        @RequestParam Integer day,
        @RequestParam(defaultValue = "1") Integer pageno,
        @RequestParam(defaultValue = "15") Integer size,
        @RequestParam(defaultValue = "ASC") String sort,
        HttpServletRequest request
    ) {
        User user = userUtil.getCurrentUser(request);
        return accountService.getAccountHistory(user, year, month, day, size, pageno, sort);
    }

    @PutMapping("/history/{transactionId}")
    public void updateHistoryAccountTarget(
        @PathVariable String transactionId,
        @RequestBody UpdateHistoryTargetRequest updateHistoryTargetRequest,
        HttpServletRequest request
    ) {
        User user = userUtil.getCurrentUser(request);
        accountService.updateHistoryTarget(user, transactionId,
            updateHistoryTargetRequest.getUpdatedTargetName());
    }

    @DeleteMapping("/history/detail/{transactionId}")
    public void deleteHistory(@PathVariable String transactionId, HttpServletRequest request) {
        User user = userUtil.getCurrentUser(request);
        accountService.deleteHistory(user, transactionId);
    }

    @PostMapping("/verify/request")
    public void getVerification(
        @RequestBody AccountAuthenticationRequest accountAuthenticationRequest,
        HttpServletRequest request) {
        User user = userUtil.getCurrentUser(request);
        accountService.getVerificationCode(user, accountAuthenticationRequest.getAccountNo());
    }

    @PostMapping("/verify/confirm")
    public void doVerification(
        @RequestBody AccountAuthenticationRequest accountAuthenticationRequest,
        HttpServletRequest request) {
        User user = userUtil.getCurrentUser(request);
        accountService.doVerification(user, accountAuthenticationRequest.getAccountNo(),
            accountAuthenticationRequest.getAuthCode());
    }
}
