package com.ftn.sbnz.gcm.service.dto;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.ftn.sbnz.gcm.model.enums.ActivityIntensity;
import com.ftn.sbnz.gcm.model.enums.EventType;
import com.ftn.sbnz.gcm.model.models.ActivityEvent;
import com.ftn.sbnz.gcm.model.models.FoodEvent;
import com.ftn.sbnz.gcm.model.models.InsulinEvent;
import lombok.*;

public class TimelineEventDtos {
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FoodEventDto {
        private UUID id;
        private EventType type = EventType.FOOD;
        private long at;
        private List<FoodAmountDto> amount;

        public static FoodEventDto fromEntity(FoodEvent e) {
            List<FoodAmountDto> amounts = e.getAmount().stream()
                    .map(a -> new FoodAmountDto(a.getFood().getId(), a.getQuantity()))
                    .collect(Collectors.toList());
            return new FoodEventDto(e.getId(), EventType.FOOD, e.getAt(), amounts);
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InsulinEventDto {
        private UUID id;
        private EventType type = EventType.INSULIN;
        private long at;
        private int amount;

        public static InsulinEventDto fromEntity(InsulinEvent e) {
            return new InsulinEventDto(e.getId(), EventType.INSULIN, e.getAt(), e.getAmount());
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityEventDto {
        private UUID id;
        private EventType type = EventType.ACTIVITY;
        private long at;
        private int duration;
        private ActivityIntensity intensity;

        public static ActivityEventDto fromEntity(ActivityEvent e) {
            return new ActivityEventDto(e.getId(), EventType.ACTIVITY, e.getAt(), e.getDuration(), e.getIntensity());
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FoodAmountDto {
        private UUID id;
        private int quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelineEventListDto {
        private List<FoodEventDto> food;
        private List<InsulinEventDto> insulin;
        private List<ActivityEventDto> activity;
    }
}
