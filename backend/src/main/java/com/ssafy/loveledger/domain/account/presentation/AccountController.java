package com.ssafy.loveledger.domain.account.presentation;

import com.ssafy.loveledger.domain.account.presentation.dto.request.AccountAuthenticationRequest;
import com.ssafy.loveledger.domain.account.presentation.dto.request.UpdateHistoryTargetRequest;
import com.ssafy.loveledger.domain.account.service.AccountService;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.domain.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    private final UserRepository userRepository;

    @GetMapping("/saveus")
    public ResponseEntity<?> saveAccount() {
        User user = userRepository.findById(1L).orElse(null);
        // accountService.updateListOfHistory(user);
        return ResponseEntity.ok(accountService.getAccountHistoryByWeek(user, 2025, 3));
    }

    @GetMapping("/history/sum/list")
    public ResponseEntity<?> getDailyStatisticsByMonth(
        @RequestParam Integer year,
        @RequestParam Integer month,
        @RequestParam(defaultValue = "1") Integer pageno,
        @RequestParam(defaultValue = "15") Integer size,
        @RequestParam(defaultValue = "asc") String sort
    ) {
        User user = userRepository.findById(1L).orElse(null);
        return ResponseEntity.ok(
            accountService.getAccountHistoryByMonth(user, year, month, size, pageno, sort)
        );
    }

    @GetMapping("/history/detail/list")
    public ResponseEntity<?> getDailyHistory(
        @RequestParam Integer year,
        @RequestParam Integer month,
        @RequestParam Integer day,
        @RequestParam(defaultValue = "1") Integer pageno,
        @RequestParam(defaultValue = "15") Integer size,
        @RequestParam(defaultValue = "asc") String sort
    ) {
        User user = userRepository.findById(1L).orElse(null);
        return ResponseEntity.ok(
            accountService.getAccountHistory(user, year, month, day, size, pageno,
                sort));
    }

    @PutMapping("/history/{transactionId}")
    public ResponseEntity<?> updateHistoryAccountTarget(
        @PathVariable String transactionId,
        @RequestBody UpdateHistoryTargetRequest request
    ) {
        User user = userRepository.findById(1L).orElse(null);
        accountService.updateHistoryTarget(user, transactionId,
            request.getAccountNo(),
            request.getUpdatedTargetName()
        );
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/history/detail/{transactionId}")
    public ResponseEntity<?> deleteHistory(
        @PathVariable String transactionId
    ) {
        User user = userRepository.findById(1L).orElse(null);
        accountService.deleteHistory(user, transactionId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify/request")
    public ResponseEntity<?> getVerification(@RequestBody AccountAuthenticationRequest request) {
        User user = userRepository.findById(1L).orElse(null);

        accountService.getVerificationCode(user, request.getAccountNo());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify/confirm")
    public ResponseEntity<?> doVerification(@RequestBody AccountAuthenticationRequest request) {
        User user = userRepository.findById(1L).orElse(null);

        accountService.doVerification(user, request.getAccountNo(), request.getAuthCode());
        return ResponseEntity.ok().build();
    }
}
