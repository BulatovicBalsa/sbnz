package com.ftn.sbnz.gcm.service.service;

import com.ftn.sbnz.gcm.model.models.Food;
import com.ftn.sbnz.gcm.service.dto.FoodDtos;
import com.ftn.sbnz.gcm.service.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class FoodService {
    private final FoodRepository repo;

    public List<Food> list() { return repo.findAll(); }

    public Food create(FoodDtos.FoodCreateDto dto) {
        Food f = dto.toFood();
        return repo.save(f);
    }

    public List<FoodDtos.FoodDto> getAllFoods() {
        return repo.findAll().stream().map(FoodDtos.FoodDto::new).collect(Collectors.toList());
    }
}
