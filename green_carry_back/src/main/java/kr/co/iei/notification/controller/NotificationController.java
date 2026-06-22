package kr.co.iei.notification.controller; 

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import kr.co.iei.notification.model.service.NotificationService;
import kr.co.iei.notification.model.vo.Notification;

@RestController
@RequestMapping("/api/notification")
@CrossOrigin(origins = "https://greencarry.vercel.app")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // 1. SSE 구독 (실시간 통신 연결)
    @GetMapping(value = "/subscribe", produces = "text/event-stream;charset=UTF-8")
    public SseEmitter subscribe(@RequestParam String memberId) {
        return notificationService.subscribe(memberId);
    }

    // 2. 읽지 않은 알림 목록 조회 (DB에서 가져오기)
    // 리액트의 useEffect에서 처음 한 번 호출할 용도입니다.
    @GetMapping("/list")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@RequestParam String memberId) {
        List<Notification> list = notificationService.getUnreadNotifications(memberId);
        return ResponseEntity.ok(list);
    }

    // 3. 개별 알림 읽음 처리 (N -> Y 업데이트)
    // 사용자가 알림을 클릭했을 때 호출합니다.
    @PatchMapping("/read/{notiId}")
    public ResponseEntity<String> markAsRead(@PathVariable int notiId) {
        int result = notificationService.markAsRead(notiId);
        if (result > 0) {
            return ResponseEntity.ok("success");
        }
        return ResponseEntity.internalServerError().body("fail");
    }

    // 4. 모든 알림 읽음 처리 (선택 사항)
    // 알림 종 아이콘을 눌러 드롭다운을 열 때 일괄 처리하고 싶다면 사용하세요.
    @PatchMapping("/read/all")
    public ResponseEntity<String> markAllAsRead(@RequestParam String memberId) {
        // Service에 updateAllReadStatus를 추가했다면 호출
        notificationService.markAllAsRead(memberId);
        return ResponseEntity.ok("all read success");
    }
    
}