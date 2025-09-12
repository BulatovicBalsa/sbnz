package com.ftn.sbnz.gcm.model.models;

import com.ftn.sbnz.gcm.model.enums.ActivityIntensity;
import lombok.*;
import org.kie.api.definition.type.Role;
import org.kie.api.definition.type.Timestamp;

import javax.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "event_activity")
@DiscriminatorValue("ACTIVITY")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor @Builder
@ToString
@Role(Role.Type.EVENT)
@Timestamp("at")
public class ActivityEvent extends TimelineEvent {
    @Column(nullable = false)
    private Integer duration;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 8)
    private ActivityIntensity intensity;

    public ActivityEvent(UUID id, long at, Integer duration, ActivityIntensity intensity) {
        super(id, at, "ACTIVITY");
        this.duration = duration;
        this.intensity = intensity;
    }
}
