package com.ssafy.gatewayservice.global.security.dto.response;

public interface OAuth2Response {

    String getProvider();

    String getProviderId();

    String getEmail();

    String getName();

    String getPicture();

}