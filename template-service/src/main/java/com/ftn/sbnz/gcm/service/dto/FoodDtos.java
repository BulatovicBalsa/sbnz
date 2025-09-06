package com.ftn.sbnz.gcm.service.dto;

import javax.validation.constraints.*;
import java.util.UUID;

import com.ftn.sbnz.gcm.model.models.Food;
import lombok.*;

public class FoodDtos {
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FoodDto {
        private UUID id;
        private String name;
        private double carbs;
        private double fats;
        private int glycemicIndex;

        public FoodDto(Food food) {
            this.id = food.getId();
            this.name = food.getName();
            this.carbs = food.getCarbs();
            this.fats = food.getFats();
            this.glycemicIndex = food.getGlycemicIndex();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FoodCreateDto {
        @NotBlank private String name;
        @PositiveOrZero private double carbs;
        @PositiveOrZero private double fats;
        @Min(0) @Max(100) private int glycemicIndex;

        public Food toFood() {
            return Food.builder()
                    .name(this.name)
                    .carbs(this.carbs)
                    .fats(this.fats)
                    .glycemicIndex(this.glycemicIndex)
                    .build();
        }
    }
}