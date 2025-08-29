package com.orienteering.dto;

public class CheckpointDto {
    public int orderIndex;
    public double lat;
    public double lng;
    public String description;

    public CheckpointDto() {}

    public CheckpointDto(int orderIndex, double lat, double lng, String description) {
        this.orderIndex = orderIndex;
        this.lat = lat;
        this.lng = lng;
        this.description = description;
    }
}
