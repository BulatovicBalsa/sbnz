package com.ftn.sbnz.gcm.model.models;

import lombok.*;
import javax.persistence.*;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "event_food")
@DiscriminatorValue("FOOD")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor @Builder
public class FoodEvent extends TimelineEvent {

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<FoodAmount> amount;

    public FoodEvent(UUID id, long at, List<FoodAmount> amount) {
        super(id, at, "FOOD");
        this.amount = amount;
    }
}
