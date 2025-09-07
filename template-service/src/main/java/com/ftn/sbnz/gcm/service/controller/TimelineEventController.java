package com.ftn.sbnz.gcm.service.controller;

import com.ftn.sbnz.gcm.service.dto.TimelineEventDtos;
import com.ftn.sbnz.gcm.service.service.TimelineEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController @RequestMapping("/api/events")
@RequiredArgsConstructor @CrossOrigin
public class TimelineEventController {
    private final TimelineEventService service;

    @GetMapping
    public TimelineEventDtos.TimelineEventListDto list(
            @RequestParam(name = "from", required = false) Long from,
            @RequestParam(name = "to", required = false) Long to
    ) {
        return service.list(from, to);
    }

    @PostMapping("/food")
    public TimelineEventDtos.FoodEventDto createFood(@RequestBody @Valid TimelineEventDtos.FoodEventDto in) {
         return service.create(in);
    }

    @PostMapping("/insulin")
    public TimelineEventDtos.InsulinEventDto createInsulin(@RequestBody @Valid TimelineEventDtos.InsulinEventDto in) {
        return service.create(in);
    }

    @PostMapping("/activity")
    public TimelineEventDtos.ActivityEventDto createActivity(@RequestBody @Valid TimelineEventDtos.ActivityEventDto in) {
        return service.create(in);
    }
}
