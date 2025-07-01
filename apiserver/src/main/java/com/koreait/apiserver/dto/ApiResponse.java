package com.koreait.apiserver.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private String status;
    private String errorCode;
    
    // 기존 호환성을 위한 생성자
    public ApiResponse(String status, T data, String errorCode) {
        this.status = status;
        this.data = data;
        this.errorCode = errorCode;
        this.success = "success".equals(status);
        this.message = success ? "성공" : errorCode;
    }
    
    // 새로운 생성자 - boolean 기반
    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
        this.data = null;
        this.status = success ? "success" : "error";
        this.errorCode = success ? null : message;
    }
    
    // 새로운 생성자 - boolean 기반 + 데이터
    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.status = success ? "success" : "error";
        this.errorCode = success ? null : message;
    }

    // 성공 응답 - 데이터만
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>("success", data, null);
    }

    // 성공 응답 - 데이터 없음
    public static <T> ApiResponse<T> success() {
        return new ApiResponse<>("success", null, null);
    }

    // 에러 응답 - 에러 코드만
    public static <T> ApiResponse<T> error(String errorCode) {
        return new ApiResponse<>("error", null, errorCode);
    }

    // 에러 응답 - 에러 코드와 데이터
    public static <T> ApiResponse<T> error(String errorCode, T data) {
        return new ApiResponse<>("error", data, errorCode);
    }
} 