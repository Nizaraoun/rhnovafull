package com.example.RhNova.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyOtpRequestDto {
    private String email;
    private String otp;
    private String newPassword;
}
