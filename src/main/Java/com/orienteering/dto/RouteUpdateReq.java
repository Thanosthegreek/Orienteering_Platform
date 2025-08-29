// src/main/java/com/orienteering/dto/RouteUpdateReq.java
package com.orienteering.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class RouteUpdateReq {

    private String name;
    private Integer distanceMeters;

    // Nullable: when absent in JSON we won't change the value
    @JsonProperty("public")
    private Boolean isPublic;

    // Nullable: blank string means "remove geometry"
    private String geomWkt;

    // ----- getters/setters -----
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public Integer getDistanceMeters() {
        return distanceMeters;
    }
    public void setDistanceMeters(Integer distanceMeters) {
        this.distanceMeters = distanceMeters;
    }

    /** Nullable getter used by the service; name matches JSON property "public". */
    public Boolean getPublic() {
        return isPublic;
    }
    public void setPublic(Boolean aPublic) {
        isPublic = aPublic;
    }

    public String getGeomWkt() {
        return geomWkt;
    }
    public void setGeomWkt(String geomWkt) {
        this.geomWkt = geomWkt;
    }
}
