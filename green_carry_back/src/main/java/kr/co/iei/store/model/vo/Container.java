package kr.co.iei.store.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("container")
public class Container {
    private Long productId;
    private String productMaterial;
    private double productEmissions;
    private int containerCount;
}
