package kr.co.iei.utils;


import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class TestClass {
    
    @Scheduled(cron = "0 0 0 * * *")
    public void test(){
        System.out.println("test");
    }
}
