package kr.co.iei.container.model.service;

import kr.co.iei.container.model.dao.ContainerDao;
import kr.co.iei.container.model.vo.ContainerVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.UUID;

@Service
public class ContainerService {

    @Autowired
    private ContainerDao containerDao;

    public int insertContainer(ContainerVo container) throws Exception {
        MultipartFile uploadFile = container.getUploadFile();

        if (uploadFile != null && !uploadFile.isEmpty()) {
            
            String savePath = "\\\\192.168.31.26\\project\\upload\\web\\container\\";
            File folder = new File(savePath);
            
            if (!folder.exists()) {
                folder.mkdirs();
            }

            String originalFileName = uploadFile.getOriginalFilename();
            String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            String saveFileName = UUID.randomUUID().toString() + extension;

            File dest = new File(savePath + saveFileName);
            uploadFile.transferTo(dest);

            container.setProductImg("/uploads/container/" + saveFileName);
        }

        return containerDao.insertContainer(container);
    }
}