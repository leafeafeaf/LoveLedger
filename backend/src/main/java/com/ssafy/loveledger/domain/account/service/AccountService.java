package com.ssafy.loveledger.domain.account.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.loveledger.domain.account.domain.Account;
import com.ssafy.loveledger.domain.account.domain.repository.AccountRepository;
import com.ssafy.loveledger.domain.account.presentation.dto.request.AccountAuthenticationRequest;
import com.ssafy.loveledger.domain.account.presentation.dto.request.AccountHistoryDetailRequest;
import com.ssafy.loveledger.domain.account.presentation.dto.request.MemberInfoRequest;
import com.ssafy.loveledger.domain.account.presentation.dto.request.SSAFYRequestHeader;
import com.ssafy.loveledger.domain.account.presentation.dto.response.DailyStatisticsResponse;
import com.ssafy.loveledger.domain.account.presentation.dto.response.HistoryDetailResponse;
import com.ssafy.loveledger.domain.account.presentation.dto.response.HistoryResponse;
import com.ssafy.loveledger.domain.account.presentation.dto.response.MemberInfoResponse;
import com.ssafy.loveledger.domain.account.presentation.dto.response.SSAFYResponse;
import com.ssafy.loveledger.domain.account.presentation.dto.response.WeekStatisticsResponse;
import com.ssafy.loveledger.domain.history.domain.History;
import com.ssafy.loveledger.domain.history.domain.repository.HistoryRepository;
import com.ssafy.loveledger.domain.statistics.domain.Category;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.global.response.exception.ErrorCode;
import com.ssafy.loveledger.global.response.exception.LoveLedgerException;
import com.ssafy.loveledger.global.util.OpenFeignUtil;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final HistoryRepository historyRepository;
    private final OpenFeignUtil openFeignUtil;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${ssafy.apikey}")
    private String apiKey;

    @Transactional//(readOnly = true)
    public Page<HistoryDetailResponse> getAccountHistory(User user, int year, int month, int day,
        int size, int pageno, String sort) {

        updateListOfHistory(user);

        Direction direction = sort.equalsIgnoreCase("ASC") ? Direction.ASC : Direction.DESC;
        Pageable pageable = PageRequest.of(pageno - 1, size, Sort.by(direction, "createdTime"));

        Page<History> historyPage = historyRepository.findByAccountAndCreatedDate(
            user.getAccount().get(0), LocalDate.of(year, month, day), pageable);

        List<HistoryDetailResponse> response = historyPage.getContent().stream()
            .map(history -> HistoryDetailResponse.builder()
                .transactionId(history.getTransactionId())
                .date(history.getCreatedDate())
                .time(history.getCreatedTime())
                .remittance(history.getTransactionType() < 3)
                .targetName(history.getTransactionTarget())
                .CategoryName(history.getCategory().getName())
                .afterAmount(history.getAmountAfterTransaction())
                .amount(history.getTransactionAmount())
                .build()
            )
            .toList();

        return new PageImpl<>(response, pageable, historyPage.getTotalElements());
    }

    @Transactional//(readOnly = true)
    public List<DailyStatisticsResponse> getAccountHistoryByMonth(User user, int year, int month,
        int size, int pageno, String sort) {

        updateListOfHistory(user);

        Direction direction = sort.equals("asc") ? Direction.ASC : Direction.DESC;
        Pageable pageable = PageRequest.of(pageno - 1, size, Sort.by(direction, "dayId.targetDay"));

        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        return historyRepository.findByUserAndMonth(user, startDate, endDate, pageable);
    }

    @Transactional(readOnly = true)
    public List<WeekStatisticsResponse> getAccountHistoryByWeek(User user, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        return historyRepository.findWeeklyStatistics(user, year, month, startDate);
    }

    @Transactional
    public void deleteHistory(User user, String transactionId) {
        History history = historyRepository.findById(transactionId).orElse(null);
        if (history != null && history.getAccount().getUser() == user) {
            history.delete();
        }
    }

    @Transactional
    public void updateHistoryTarget(User user, String transactionId, String accountNo,
        String updatedTargetName) {
        Account account = accountRepository.findById(accountNo).orElse(null);
        History history = historyRepository.findById(transactionId).orElse(null);

        if (account != null && history != null && user == account.getUser()
            && history.getAccount() == account) {
            history.updateTargetName(updatedTargetName);
        }
    }

    @Transactional
    public void updateListOfHistory(User user) {
        if (user == null) {
            throw new RuntimeException("User Not Found");
        }

        String code = generateCode();
        String apiName = "inquireTransactionHistoryList";
        SSAFYRequestHeader header = createRequestHeader(user, apiName, code);

        Account account = user.getAccount().get(0);
        AccountHistoryDetailRequest request = AccountHistoryDetailRequest.builder()
            .header(header)
            .accountNo(account.getAccountId())
            .startDate(account.getLastUpdated().format(formatter).substring(0, 8))
            .endDate(code.substring(0, 8))
            .transactionType("A")
            .orderByType("ASC")
            .build();

        SSAFYResponse response = openFeignUtil.getListOfHistory(request);

        List<Map<String, Object>> rawList = (List<Map<String, Object>>) response.getResultData()
            .get("list");

        List<HistoryResponse> res = rawList.stream()
            .map(map -> objectMapper.convertValue(map, HistoryResponse.class))
            .toList();

        for (HistoryResponse historyResponse : res) {
            String dateTimeString =
                historyResponse.getTransactionDate() + historyResponse.getTransactionTime();
            LocalDateTime dateTime = LocalDateTime.parse(dateTimeString, formatter);

            String transactionType = historyResponse.getTransactionTypeName();
            int type = switch (transactionType) {
                case "입금" -> 1;
                case "입금(수시입출금)" -> 2;
                case "출금" -> 3;
                case "출금(수시입출금)" -> 4;
                default -> 0;
            };

            History history = History.builder()
                .transactionId(historyResponse.getTransactionUniqueNo())
                .createdDate(dateTime.toLocalDate())
                .createdTime(dateTime.toLocalTime())
                .transactionAccount(historyResponse.getTransactionAccountNo())
                .transactionTarget(historyResponse.getTransactionSummary())
                .transactionAmount(Long.valueOf(historyResponse.getTransactionBalance()))
                .transactionType(type)
                .transactionTypeName(historyResponse.getTransactionTypeName())
                .category(Category.NOT_DEFINED) // TODO : 카테고리 분류 모델 적용 할 것
                .account(account)
                .AmountAfterTransaction(
                    Long.valueOf(historyResponse.getTransactionAfterBalance())
                )
                .memo(historyResponse.getTransactionMemo())
                .build();
            historyRepository.save(history);

            account.setLastUpdated(LocalDateTime.now());
        }

    }

    public void getVerificationCode(User user, String accountNo) {
        String code = generateCode();
        String apiName = "openAccountAuth";
        SSAFYRequestHeader header = createRequestHeader(user, apiName, code);

        AccountAuthenticationRequest request = AccountAuthenticationRequest.builder()
            .header(header)
            .authText("SSAFY") // TODO : 차후 수정 필요
            .accountNo(accountNo)
            .build();

        try {
            SSAFYResponse response = openFeignUtil.sendAccountAuthentication(request);
        } catch (Exception e) {
            throw new LoveLedgerException(
                ErrorCode.OPENFEIGN_FAILED
            );
        }
    }

    @Transactional
    public void doVerification(User user, String accountNo, String authCode) {
        String code = generateCode();
        String apiName = "checkAuthCode";

        SSAFYRequestHeader header = createRequestHeader(user, apiName, code);

        AccountAuthenticationRequest request = AccountAuthenticationRequest.builder()
            .header(header)
            .authText("SSAFY") // 차후 수정 필요
            .accountNo(accountNo)
            .authCode(authCode)
            .build();

        SSAFYResponse response = openFeignUtil.getAccountAuthentication(request);
        String status = (String) response.getResultData().get("status");
        if (status.equals("SUCCESS")) {
            Account account = Account.builder()
                .accountId(accountNo)
                .bankCode("00100")
                .user(user)
                .certedAt(LocalDateTime.now())
                .build();
            accountRepository.save(account);
        }
    }

    private SSAFYRequestHeader createRequestHeader(User user, String apiName, String code) {
        return SSAFYRequestHeader.builder()
            .apiName(apiName)
            .apiServiceCode(apiName)
            .transmissionDate(code.substring(0, 8))
            .transmissionTime(code.substring(8, 14))
            .institutionCode("00100")
            .fintechAppNo("001")
            .institutionTransactionUniqueNo(code)
            .apiKey(apiKey)
            .userKey(user.getUserKey())
            .build();
    }

    public void getMemberInfo(User user) {
        if (user == null) {
            throw new RuntimeException("User Not Found");
        } else {
            MemberInfoRequest request = MemberInfoRequest.builder()
                .apiKey(apiKey)
                .userId(user.getEmail())
                .build();

            MemberInfoResponse response = openFeignUtil.getMemberInfo(request);
            printJson(response);
        }
    }

    public String generateCode() {
        int sixDigitNumber = ThreadLocalRandom.current().nextInt(0, 1000000); // 000000 ~ 999999
        String sixDigitString = String.format("%06d", sixDigitNumber);

        return LocalDateTime.now().format(formatter) + sixDigitString;
    }

    private void printJson(Object object) {
        try {
            String json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(object);
            System.out.println(json);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }
}
