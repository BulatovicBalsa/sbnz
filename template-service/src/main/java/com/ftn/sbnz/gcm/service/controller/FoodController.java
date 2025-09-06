package com.ftn.sbnz.gcm.service.controller;

import com.ftn.sbnz.gcm.service.dto.FoodDtos;
import com.ftn.sbnz.gcm.service.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food")
@RequiredArgsConstructor
public class FoodController {
    private final FoodService foodService;

    @GetMapping
    public List<FoodDtos.FoodDto> getAllFoods() {
        return foodService.getAllFoods();
    }

    @PostMapping
    public FoodDtos.FoodDto createFood(@RequestBody FoodDtos.FoodCreateDto dto) {
        return new FoodDtos.FoodDto(foodService.create(dto));
    }
}
