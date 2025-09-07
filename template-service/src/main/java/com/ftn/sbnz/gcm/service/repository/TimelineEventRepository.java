package com.ftn.sbnz.gcm.service.repository;

import com.ftn.sbnz.gcm.model.models.ActivityEvent;
import com.ftn.sbnz.gcm.model.models.FoodEvent;
import com.ftn.sbnz.gcm.model.models.InsulinEvent;
import com.ftn.sbnz.gcm.model.models.TimelineEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TimelineEventRepository extends JpaRepository<TimelineEvent, UUID> {
    @Query("SELECT fe FROM FoodEvent fe WHERE fe.at BETWEEN :from AND :to")
    List<FoodEvent> findFoodEventsInRange(@Param("from") Long from, @Param("to") Long to);

    @Query("SELECT ie FROM InsulinEvent ie WHERE ie.at BETWEEN :from AND :to")
    List<InsulinEvent> findInsulinEventsInRange(@Param("from") Long from, @Param("to") Long to);

    @Query("SELECT ae FROM ActivityEvent ae WHERE ae.at BETWEEN :from AND :to")
    List<ActivityEvent> findActivityEventsInRange(@Param("from") Long from, @Param("to") Long to);
}
