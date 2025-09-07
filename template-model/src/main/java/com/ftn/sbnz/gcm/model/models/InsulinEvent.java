package com.ftn.sbnz.gcm.model.models;

import lombok.*;
import javax.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "event_insulin")
@DiscriminatorValue("INSULIN")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor @Builder
public class InsulinEvent extends TimelineEvent {

    /** Units taken (U). */
    @Column(nullable = false)
    private Integer amount;

    public InsulinEvent(UUID id, long at, Integer amount) {
        super(id, at, "INSULIN");
        this.amount = amount;
    }
}
