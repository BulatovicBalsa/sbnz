package com.ftn.sbnz.gcm.model.models;


import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;
import java.util.Objects;

@Setter
@Getter
@ToString
public class Customer implements Serializable {
	public enum Category {
		NA, GOLD, SILVER, BRONZE
	};

	private static final long serialVersionUID = 1L;

	private Long customerId;
	private Integer age;
	private String name;
	private String email;
	private Category category = Category.NA;

	public Customer() {
	}

	public Customer(Long customerId, Integer age) {
		super();
		this.customerId = customerId;
		this.age = age;
    }

    @Override
	public int hashCode() {
		int hash = 7;
		hash = 67 * hash + Objects.hashCode(this.customerId);
		hash = 67 * hash + Objects.hashCode(this.age);
		hash = 67 * hash + Objects.hashCode(this.email);
		hash = 67 * hash + Objects.hashCode(this.name);
		return hash;
	}

	@Override
	public boolean equals(Object obj) {
		if (obj == null) {
			return false;
		}
		if (getClass() != obj.getClass()) {
			return false;
		}
		final Customer other = (Customer) obj;
		if (!Objects.equals(this.customerId, other.customerId)) {
			return false;
		}
		if (!Objects.equals(this.age, other.age)) {
			return false;
		}
		if (!Objects.equals(this.email, other.email)) {
			return false;
		}
		if (!Objects.equals(this.name, other.name)) {
			return false;
		}
		return true;
	}
}
