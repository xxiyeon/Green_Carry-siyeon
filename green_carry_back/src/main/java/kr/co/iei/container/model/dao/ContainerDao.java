package kr.co.iei.container.model.dao;

import kr.co.iei.container.model.vo.ContainerVo;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ContainerDao {
    int insertContainer(ContainerVo container);
}