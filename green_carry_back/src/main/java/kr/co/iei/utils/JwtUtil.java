package kr.co.iei.utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {
    // ⚠️ 실제 서비스 시에는 아주 길고 복잡한 문자열을 사용해야 합니다.
    private String secret = "your-very-secure-and-long-secret-key-for-greencarry-project";
    private SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());
    private long expire = 1000L * 60L * 60L; // 유효시간 1시간
    
    private long refreshExpire = 1000L * 60 * 60 * 24 * 14;// 자동 로그인 유효시간 14일

    public String createToken(String memberId, int memberGrade) {
        return Jwts.builder()
                .subject(memberId) // 토큰 주인
                .claim("memberGrade", memberGrade) // 커스텀 데이터(등급)
                .issuedAt(new Date()) // 생성 시간
                .expiration(new Date(System.currentTimeMillis() + expire)) // 만료 시간
                .signWith(key) // 서명
                .compact();
    }
    public String createRefreshToken(String memberId) {
        return Jwts.builder()
                .subject(memberId) // Refresh Token은 가볍게 식별자(아이디)만 담습니다.
                .issuedAt(new Date()) // 생성 시간
                .expiration(new Date(System.currentTimeMillis() + refreshExpire)) // 14일 뒤 만료!
                .signWith(key) // 서명
                .compact();
    }
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(key) 
                .build()
                .parseSignedClaims(token); 
            return true;
        } catch (Exception e) {
            System.out.println("토큰 검증 실패: " + e.getMessage());
            return false;
        }
    }

    public String getMemberIdFromToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload() 
                .getSubject();
    }
}