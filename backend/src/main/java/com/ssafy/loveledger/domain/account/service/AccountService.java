package com.ssafy.loveledger.domain.account.service;

import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Service;

@Service
public class AccountService {

    public String generateCode() {
        int sixDigitNumber = ThreadLocalRandom.current().nextInt(0, 1000000); // 000000 ~ 999999
        String sixDigitString = String.format("%06d", sixDigitNumber);

        return LocalDateTime.now() + sixDigitString;
    }
}
