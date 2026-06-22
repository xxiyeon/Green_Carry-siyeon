package kr.co.iei.container.model.vo;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ContainerVo {
    private Integer productId;           
    private String productName;      
    private double productEmissions; 
    private String productDesc;      
    private String productImg;       
    private MultipartFile uploadFile; 
}