package com.orienteering.dto;

import java.time.Instant;
import java.util.List;

public class RouteRes {
    private Long id;
    private String name;
    private Integer distanceMeters;
    private boolean isPublic;
    private Instant createdAt;

    /** WKT of the geometry (may be null if viewer not allowed or route has no geom) */
    private String geomWkt;

    /** Owner's username/email (useful for debugging/UI, optional to show) */
    private String ownerUsername;

    /** Whether the current viewer can edit/delete this route */
    private boolean canEdit;

    // (keep if you use them)
    private List<CheckpointDto> checkpoints;

    // --- getters / setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getDistanceMeters() { return distanceMeters; }
    public void setDistanceMeters(Integer distanceMeters) { this.distanceMeters = distanceMeters; }

    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean aPublic) { isPublic = aPublic; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public String getGeomWkt() { return geomWkt; }
    public void setGeomWkt(String geomWkt) { this.geomWkt = geomWkt; }

    public String getOwnerUsername() { return ownerUsername; }
    public void setOwnerUsername(String ownerUsername) { this.ownerUsername = ownerUsername; }

    public boolean isCanEdit() { return canEdit; }
    public void setCanEdit(boolean canEdit) { this.canEdit = canEdit; }

    public List<CheckpointDto> getCheckpoints() { return checkpoints; }
    public void setCheckpoints(List<CheckpointDto> checkpoints) { this.checkpoints = checkpoints; }
}
