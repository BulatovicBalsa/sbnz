package com.ftn.sbnz.gcm.service.service;

import com.ftn.sbnz.gcm.model.models.Food;
import com.ftn.sbnz.gcm.service.dto.FoodDtos;
import com.ftn.sbnz.gcm.service.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service @RequiredArgsConstructor
public class FoodService {
    private final FoodRepository repo;

    public List<Food> list() { return repo.findAll(); }

    public Food create(FoodDtos.FoodCreateDto dto) {
        Food f = Food.builder()
                .name(dto.getName())
                .carbs(dto.getCarbs())
                .fats(dto.getFats())
                .glycemicIndex(dto.getGlycemicIndex())
                .build();

        return repo.save(f);
    }
}
