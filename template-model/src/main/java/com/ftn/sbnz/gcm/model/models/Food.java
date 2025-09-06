package com.ftn.sbnz.gcm.model.models;

import lombok.*;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import java.io.Serializable;
import java.util.UUID;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor @Builder
public class Food implements Serializable {
    @Id
    @GeneratedValue
    public UUID id;

    public String name;
    public Double carbs;
    public Double fats;
    public Integer glycemicIndex;

}
