package kr.co.iei.notification.model.service; 

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import kr.co.iei.notification.model.dao.NotificationDao;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Transactional
public class NotificationService {

	@Autowired
    private NotificationDao notificationDao;
	
	private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

	//sse emitter연결
	public SseEmitter subscribe(String memberId) {
		
		if (emitters.containsKey(memberId)) {
			emitters.get(memberId).complete();
			emitters.remove(memberId);
		}

		SseEmitter emitter = new SseEmitter(60 * 60 * 1000L); //1시간동안 sse emitter 연결
		emitters.put(memberId, emitter);

		emitter.onCompletion(() -> emitters.remove(memberId));
		emitter.onTimeout(() -> emitters.remove(memberId));
		emitter.onError((e) -> emitters.remove(memberId));
			//연결이 끊기면 주소 삭제 -> 메모리 정리
		
		try {
			emitter.send(SseEmitter.event().name("connect").data("connected!"));
		} catch (IOException e) {
			emitters.remove(memberId);
		}

		return emitter;
	}

	//noti sender
	// 2. 알림 전송 (DB 저장 로직 추가)
    public void sendNotification(String memberId, String eventName, String message, String navUrl) {
        // [추가] DB 저장을 위한 VO 객체 생성
        kr.co.iei.notification.model.vo.Notification noti = new kr.co.iei.notification.model.vo.Notification();
        noti.setReceiverId(memberId);
        noti.setNotiType(eventName); // eventName을 타입으로 활용
        noti.setMessage(message);
        noti.setNavUrl(navUrl);

        // [추가] DB에 먼저 저장 (나중에 새로고침 시 불러올 용도)
        notificationDao.insertNotification(noti);

        // 실시간 전송 시도
        SseEmitter emitter = emitters.get(memberId);
        if (emitter != null) {
            try {
                // data에 맵을 담아 보내거나, 아예 noti 객체 자체를 보내도 됩니다.
                emitter.send(SseEmitter.event().name(eventName).data(noti)); 
            } catch (IOException e) {
                emitters.remove(memberId);
            }
        }
    }

    // 3. [추가] 읽지 않은 알림 목록 조회 (새로고침 시 리액트에서 호출)
    public List<kr.co.iei.notification.model.vo.Notification> getUnreadNotifications(String memberId) {
        return notificationDao.selectUnreadNotifications(memberId);
    }

    // 4. [추가] 알림 읽음 처리
    public int markAsRead(int notiId) {
        return notificationDao.updateReadStatus(notiId);
    }

    // Ping Sender (기존과 동일)
    @Scheduled(fixedRate = 30000)
    public void sendPing() {
        emitters.forEach((memberId, emitter) -> {
            try {
                emitter.send(SseEmitter.event().name("ping").data("heartbeat"));
            } catch (IOException e) {
                emitters.remove(memberId);
            }
        });
    }
 // 5. [추가] 모든 알림 읽음 처리
    public int markAllAsRead(String memberId) {
        return notificationDao.updateAllReadStatus(memberId);
    }
}