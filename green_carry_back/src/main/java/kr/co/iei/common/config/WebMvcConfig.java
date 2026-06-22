package kr.co.iei.common.config; // 본인 패키지 경로에 맞게 수정하세요!

import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		// 회원 프로필용
		registry.addResourceHandler("/uploads/member/**") // DB에 저장될 값
				.addResourceLocations("file:////192.168.31.26/project/upload/web/member/"); // 실제 경로

		// 리뷰 이미지용
		registry.addResourceHandler("/uploads/review/**")
				.addResourceLocations("file:////192.168.31.26/project/upload/web/review/");

		// 메뉴 이미지용
		registry.addResourceHandler("/uploads/menu/**")
				.addResourceLocations("file:////192.168.31.26/project/upload/web/menu/");
		

		// 가게 이미지용
		registry.addResourceHandler("/uploads/store/**")
				.addResourceLocations("file:////192.168.31.26/project/upload/web/store/");
		
		// 용기 이미지용
				registry.addResourceHandler("/uploads/container/**")
						.addResourceLocations("file:////192.168.31.26/project/upload/web/container/");
		
		
	}
}