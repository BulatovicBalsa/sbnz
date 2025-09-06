package com.ftn.sbnz.gcm.model.models;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClassificationTemplateModel {
    private int minAge;
    private int maxAge;
    private Customer.Category previousCategory;
    private Customer.Category newCategory;

    public ClassificationTemplateModel(int minAge, int maxAge, Customer.Category previousCategory, Customer.Category newCategory) {
        this.minAge = minAge;
        this.maxAge = maxAge;
        this.previousCategory = previousCategory;
        this.newCategory = newCategory;
    }
}
