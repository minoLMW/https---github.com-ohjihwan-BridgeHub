package com.koreait.apiserver.service.Impl;
import com.koreait.apiserver.service.JwtService;
import com.koreait.apiserver.dto.MemberDTO;
import com.koreait.apiserver.service.MemberService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtServiceImpl implements JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    @Autowired
    private ApplicationContext applicationContext;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    @Override
    public String generateToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        // 사용자 정보 조회 (필요할 때만 MemberService 사용)
        MemberService memberService = applicationContext.getBean(MemberService.class);
        MemberDTO member = memberService.getMemberByUsername(username);
        
        // 클레임에 사용자 정보 추가
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", member.getUsername());
        claims.put("username", member.getUsername());
        claims.put("memberId", member.getId());  // memberId 추가
        claims.put("nickname", member.getNickname() != null ? member.getNickname() : member.getUsername());
        claims.put("email", member.getEmail());

        return Jwts.builder()
                .subject(username)
                .claims(claims)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    @Override
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    @Override
    public Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    @Override
    public Integer extractMemberId(String token) {
        try {
            String username = getUsernameFromToken(token);
            
            // MemberService를 통해 사용자 ID 조회
            MemberService memberService = applicationContext.getBean(MemberService.class);
            MemberDTO member = memberService.getMemberByUsername(username);
            
            return member.getId();
        } catch (Exception e) {
            throw new RuntimeException("토큰에서 사용자 ID 추출 실패", e);
        }
    }
}
