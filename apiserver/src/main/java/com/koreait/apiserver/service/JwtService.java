package com.koreait.apiserver.service;

import io.jsonwebtoken.Claims;

public interface JwtService {
    String generateToken(String username);
    boolean validateToken(String token);
    String getUsernameFromToken(String token);
    Claims getAllClaimsFromToken(String token);
    Integer extractMemberId(String token);
}