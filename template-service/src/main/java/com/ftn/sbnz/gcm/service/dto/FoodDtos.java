package com.ftn.sbnz.gcm.service.dto;

import javax.validation.constraints.*;
import java.util.UUID;
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
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FoodCreateDto {
        @NotBlank private String name;
        @PositiveOrZero private double carbs;
        @PositiveOrZero private double fats;
        @Min(0) @Max(100) private int glycemicIndex;
    }
}