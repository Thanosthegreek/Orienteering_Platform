package com.orienteering.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "checkpoints")
public class Checkpoint {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "route_id")
    private Route route;          // <-- this needs the import above

    @Column(nullable = false)
    private int orderIndex;

    private double lat;
    private double lng;
    private String description;

    // getters/setters...
    public Route getRoute() { return route; }
    public void setRoute(Route route) { this.route = route; }

    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

    public double getLat() { return lat; }
    public void setLat(double lat) { this.lat = lat; }

    public double getLng() { return lng; }
    public void setLng(double lng) { this.lng = lng; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
