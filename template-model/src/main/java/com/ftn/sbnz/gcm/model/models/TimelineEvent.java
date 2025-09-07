package com.ftn.sbnz.gcm.model.models;

import lombok.*;
import javax.persistence.*;
import java.io.Serializable;
import java.util.UUID;
import org.hibernate.annotations.GenericGenerator;

/**
 * Base event with common fields. Subclasses add type-specific columns.
 */
@Entity
@Table(name = "events")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "event_type", length = 16)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public abstract class TimelineEvent implements Serializable {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    /** When it happened/planned (ms since epoch). */
    @Column(nullable = false)
    private long at;

    /**
     * Optional: expose the discriminator as a read-only column if you want to see it.
     * Not required for JPA, but handy for debugging / querying.
     */
    @Column(name = "event_type", insertable = false, updatable = false)
    private String eventType;
}
