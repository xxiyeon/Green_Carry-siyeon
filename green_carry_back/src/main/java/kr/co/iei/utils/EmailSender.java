package kr.co.iei.utils;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailSender {

	private final RestClient brevoRestClient;

	@Value("${brevo.sender-email}")
	private String senderEmail;

	@Value("${brevo.sender-name}")
	private String senderName;

	public void sendMail(String emailTitle, String receiver, String emailContent) {
		try {
			Map<String, Object> requestBody = Map.of(
					"sender", Map.of(
							"name", senderName,
							"email", senderEmail
					),
					"to", List.of(
							Map.of("email", receiver)
					),
					"subject", emailTitle,
					"htmlContent", emailContent
			);

			brevoRestClient.post()
					.uri("/smtp/email")
					.body(requestBody)
					.retrieve()
					.toBodilessEntity();

			log.info("Brevo 이메일 발송 성공. receiver={}, title={}", receiver, emailTitle);
		} catch (RestClientException e) {
			log.error("Brevo 이메일 발송 실패. receiver={}, title={}", receiver, emailTitle, e);
			throw new IllegalStateException("이메일 발송에 실패했습니다.", e);
		}
	}
}

