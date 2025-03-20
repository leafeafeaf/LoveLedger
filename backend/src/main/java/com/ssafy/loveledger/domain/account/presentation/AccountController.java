package com.ssafy.loveledger.domain.account.presentation;

import com.ssafy.loveledger.domain.account.presentation.dto.request.UpdateHistoryTargetRequest;
import com.ssafy.loveledger.domain.account.service.AccountService;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.domain.user.domain.repository.UserRepository;
import java.time.LocalDate;
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
@RequestMapping("/api/v1/account")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final UserRepository userRepository;

    @GetMapping("/saveus")
    public void saveAccount() {
        User user = userRepository.findById(1L).orElse(null);
        accountService.updateListOfHistory(user);
    }

    @GetMapping("/history/sum/list")
    public void getDailyStatistics(
        @RequestParam Integer year,
        @RequestParam Integer month
    ) {

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
            accountService.getAccountHistory(user, LocalDate.of(year, month, day), size, pageno,
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
    public ResponseEntity<?> getVerification(@RequestBody String accountNo) {
        User user = userRepository.findById(1L).orElse(null);

        accountService.getVerificationCode(user, accountNo);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify/confirm")
    public void doVerification(@RequestBody String accountNo) {

    }
}
