// src/main/java/com/orienteering/dto/RouteCreateReq.java
package com.orienteering.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

@JsonIgnoreProperties(ignoreUnknown = true)
public class RouteCreateReq {

    @NotBlank(message = "name is required")
    private String name;

    @Positive(message = "distanceMeters must be > 0")
    private int distanceMeters;

    // JSON uses "public", Java uses isPublic for a boolean; this ties them together.
    @JsonProperty("public")
    private boolean isPublic;

    @NotBlank(message = "geomWkt is required")
    private String geomWkt;

    // ----- constructors -----
    public RouteCreateReq() {}

    public RouteCreateReq(String name, int distanceMeters, boolean isPublic, String geomWkt) {
        this.name = name;
        this.distanceMeters = distanceMeters;
        this.isPublic = isPublic;
        this.geomWkt = geomWkt;
    }

    // ----- getters / setters -----
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getDistanceMeters() {
        return distanceMeters;
    }

    public void setDistanceMeters(int distanceMeters) {
        this.distanceMeters = distanceMeters;
    }

    // boolean getter should be `isPublic()` for proper bean semantics
    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean aPublic) {
        isPublic = aPublic;
    }

    public String getGeomWkt() {
        return geomWkt;
    }

    public void setGeomWkt(String geomWkt) {
        this.geomWkt = geomWkt;
    }
}
