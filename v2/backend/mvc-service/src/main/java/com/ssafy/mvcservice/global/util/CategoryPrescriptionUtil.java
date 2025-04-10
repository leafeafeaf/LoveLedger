package com.ssafy.mvcservice.global.util;


import com.ssafy.mvcservice.domain.account.presentation.dto.request.CategoryPrescriptionRequest;
import com.ssafy.mvcservice.domain.account.presentation.dto.response.CategoryPrescriptionResponseWrapper;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "CategoryReceiver", url = "${ssafy.fastapi_url}")
public interface CategoryPrescriptionUtil {

    @PostMapping("/history/code")
    CategoryPrescriptionResponseWrapper getCategoryPrescription(
        @RequestBody CategoryPrescriptionRequest request);
}
