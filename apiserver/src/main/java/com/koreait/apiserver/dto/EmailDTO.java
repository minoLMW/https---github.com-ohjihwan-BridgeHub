package com.koreait.apiserver.dto;
import lombok.Data;

@Data
public class EmailDTO {
    private String email;
    private String verificationCode;
    private boolean verified;
    private long expirationTime;
}