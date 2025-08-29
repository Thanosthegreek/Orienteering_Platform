// src/main/java/com/orienteering/domain/Route.java
package com.orienteering.domain;

import jakarta.persistence.*;
import org.locationtech.jts.geom.LineString;

import java.time.LocalDateTime;

@Entity
@Table(name = "routes")
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // DB: owner_username (NOT NULL)
    @Column(name = "owner_username", nullable = false)
    private String ownerUsername;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "distance_meters")
    private Integer distanceMeters;

    @Column(name = "is_public")
    private boolean isPublic;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // PostGIS geometry(LineString, 4326)
    @Column(name = "geom")
    private LineString geom;

    // ---- getters / setters ----
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOwnerUsername() { return ownerUsername; }
    public void setOwnerUsername(String ownerUsername) { this.ownerUsername = ownerUsername; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getDistanceMeters() { return distanceMeters; }
    public void setDistanceMeters(Integer distanceMeters) { this.distanceMeters = distanceMeters; }

    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean aPublic) { isPublic = aPublic; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LineString getGeom() { return geom; }
    public void setGeom(LineString geom) { this.geom = geom; }
}
