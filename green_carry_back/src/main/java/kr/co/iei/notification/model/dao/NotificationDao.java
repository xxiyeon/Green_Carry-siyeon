package kr.co.iei.notification.model.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import kr.co.iei.notification.model.vo.Notification;

@Mapper
public interface NotificationDao {
    // 1. 알림 저장
    int insertNotification (Notification noti);
    
    // 2. 특정 사용자의 읽지 않은 알림 목록 조회
    List<Notification> selectUnreadNotifications(String receiverId);
    
    // 3. 특정 알림 읽음 처리
    int updateReadStatus(int notiId);
    
    // 4. 모든 알림 읽음 처리
    int updateAllReadStatus(String receiverId);
}