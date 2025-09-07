package com.ftn.sbnz.gcm.model.models;

import lombok.Data;

import javax.persistence.*;
import java.util.UUID;

@Entity
@Data
public class FoodAmount {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "food_id")
    private Food food;

    private Integer quantity;
}
