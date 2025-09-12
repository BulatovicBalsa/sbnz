package com.ftn.sbnz.gcm.service.service;

import com.ftn.sbnz.gcm.model.models.*;
import com.ftn.sbnz.gcm.service.dto.TimelineEventDtos;
import com.ftn.sbnz.gcm.service.repository.FoodRepository;
import com.ftn.sbnz.gcm.service.repository.TimelineEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.transaction.Transactional;
import javax.validation.Valid;
import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@RequiredArgsConstructor
public class TimelineEventService {

    private final TimelineEventRepository timelineEventRepository;
    private final FoodRepository foodRepository;
    private final RuleEngineSession ruleEngineSession;

    public TimelineEventDtos.TimelineEventListDto list(Long from, Long to) {
        List<TimelineEventDtos.FoodEventDto> foodEvents = timelineEventRepository.findFoodEventsInRange(from, to).stream()
                .map(TimelineEventDtos.FoodEventDto::fromEntity)
                .collect(Collectors.toList());
        List<TimelineEventDtos.InsulinEventDto> insulinEvents = timelineEventRepository.findInsulinEventsInRange(from, to).stream()
                .map(TimelineEventDtos.InsulinEventDto::fromEntity)
                .collect(Collectors.toList());
        List<TimelineEventDtos.ActivityEventDto> activityEvents = timelineEventRepository.findActivityEventsInRange(from, to).stream()
                .map(TimelineEventDtos.ActivityEventDto::fromEntity)
                .collect(Collectors.toList());
        return new TimelineEventDtos.TimelineEventListDto(foodEvents, insulinEvents, activityEvents);
    }

    @Transactional
    public TimelineEventDtos.FoodEventDto create(@Valid TimelineEventDtos.FoodEventDto in) {
        List<Food> foods = foodRepository.findAllByIdIn(in.getAmount().stream().map(TimelineEventDtos.FoodAmountDto::getId).collect(Collectors.toList()));
        List<FoodAmount> amounts = new ArrayList<>();
        for (TimelineEventDtos.FoodAmountDto fad : in.getAmount()) {
            Optional<Food> of = foods.stream().filter(f -> f.getId().equals(fad.getId())).findFirst();
            if (of.isEmpty()) {
                throw new ResponseStatusException(BAD_REQUEST, "Food with id " + fad.getId() + " not found.");
            }

            FoodAmount amount = new FoodAmount();
            amount.setFood(of.get());
            amount.setQuantity(fad.getQuantity());
            amounts.add(amount);
        }
        FoodEvent fe = new FoodEvent(null, in.getAt(), amounts);

        fe = timelineEventRepository.save(fe);

        ruleEngineSession.insertEvent(fe);
        return TimelineEventDtos.FoodEventDto.fromEntity(fe);
    }

    @Transactional
    public TimelineEventDtos.InsulinEventDto create(@Valid TimelineEventDtos.InsulinEventDto in) {
        if (in.getAmount() <= 0) {
            throw new ResponseStatusException(BAD_REQUEST, "Insulin amount must be positive.");
        }
        InsulinEvent ie = new InsulinEvent(null, in.getAt(), in.getAmount());
        ie = timelineEventRepository.save(ie);

        ruleEngineSession.insertEvent(ie);
        System.out.println(ie);
        return TimelineEventDtos.InsulinEventDto.fromEntity(ie);
    }

    @Transactional
    public TimelineEventDtos.ActivityEventDto create(@Valid TimelineEventDtos.ActivityEventDto in) {
        ActivityEvent ae = new ActivityEvent(null, in.getAt(), in.getDuration(), in.getIntensity());
        ae = timelineEventRepository.save(ae);

        ruleEngineSession.insertEvent(ae);
        return TimelineEventDtos.ActivityEventDto.fromEntity(ae);
    }
}
