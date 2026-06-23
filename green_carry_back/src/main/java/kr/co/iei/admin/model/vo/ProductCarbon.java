package kr.co.iei.admin.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Alias("productCarbon")
@Data
public class ProductCarbon {
	private Integer productId;
	private String productMaterial;
	private double productEmissions;
	private String productImg;
	private String productDesc;
	private String productCategory;
}
