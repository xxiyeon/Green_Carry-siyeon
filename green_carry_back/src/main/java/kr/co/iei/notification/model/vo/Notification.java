package kr.co.iei.notification.model.vo;

import lombok.Data;

@Data
public class Notification {
    private int notiId;         // 알림 PK
    private String receiverId;  // 수신자 ID
    private String notiType;    // 알림 타입 (예: "reviewReply")
    private String message;     // 알림 메시지 내용
    private String navUrl;      // 이동할 URL
    private String isRead;      // 읽음 여부 ('N', 'Y')
    private String createdAt;   // 생성일
}

