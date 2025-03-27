package com.ssafy.loveledger.global.auth.dto.response;

public interface OAuth2Response {

    String getProvider();

    String getProviderId();

    String getEmail();

    String getName();

    String getPicture();

}