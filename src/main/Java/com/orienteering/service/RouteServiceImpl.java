package com.orienteering.service;

import com.orienteering.domain.Route;
import com.orienteering.dto.RouteCreateReq;
import com.orienteering.dto.RouteRes;
import com.orienteering.dto.RouteUpdateReq;
import com.orienteering.repo.RouteRepo;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.LineString;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.io.WKTReader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@Transactional
public class RouteServiceImpl implements RouteService {

    private final RouteRepo routeRepo;
    private final GeometryFactory geometryFactory = new GeometryFactory();

    public RouteServiceImpl(RouteRepo routeRepo) {
        this.routeRepo = routeRepo;
    }

    /* ------------ helpers ------------ */

    private LineString parseLineString(String wkt) {
        try {
            if (wkt == null || wkt.isBlank()) return null;
            String cleaned = wkt.replaceFirst("^SRID=\\d+\\s*;\\s*", "").trim();
            Geometry g = new WKTReader(geometryFactory).read(cleaned);
            if (!(g instanceof LineString)) {
                throw new IllegalArgumentException("Only LINESTRING WKT is supported");
            }
            g.setSRID(4326);
            return (LineString) g;
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid WKT: " + ex.getMessage(), ex);
        }
    }

    private String toWkt(LineString ls) {
        if (ls == null) return null;
        return ls.toText();
    }

    private RouteRes toDto(Route r, boolean includeGeom, boolean canEdit) {
        RouteRes dto = new RouteRes();
        dto.setId(r.getId());
        dto.setName(r.getName());
        dto.setDistanceMeters(r.getDistanceMeters());
        dto.setPublic(r.isPublic());
        dto.setOwnerUsername(r.getOwnerUsername());
        dto.setCanEdit(canEdit);
        dto.setCreatedAt(r.getCreatedAt() == null ? null : r.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant());
        dto.setGeomWkt(includeGeom ? toWkt(r.getGeom()) : null);
        return dto;
    }

    private RouteRes toDto(Route r) {
        return toDto(r, false, false);
    }

    /* ------------ create / list / details ------------ */

    @Override
    public RouteRes create(String username, RouteCreateReq req) {
        Route r = new Route();
        r.setOwnerUsername(username);
        r.setName(req.getName());
        r.setDistanceMeters(req.getDistanceMeters());
        r.setPublic(req.isPublic());
        r.setCreatedAt(LocalDateTime.now());
        r.setGeom(parseLineString(req.getGeomWkt()));
        r = routeRepo.save(r);
        return toDto(r, true, true); // owner sees geom
    }

    @Override
    public RouteRes create(RouteCreateReq req) {
        throw new UnsupportedOperationException("Use authenticated create(username, req)");
    }

    @Override
    public List<RouteRes> mine(String username) {
        return routeRepo.findByOwnerUsername(username)
                .stream()
                .map(r -> toDto(r, false, true))
                .collect(Collectors.toList());
    }

    @Override
    public Route findById(Long id) {
        return routeRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Route not found: " + id));
    }

    @Override
    public org.springframework.data.domain.Page<RouteRes> listPublic(org.springframework.data.domain.Pageable pageable) {
        return routeRepo.findByIsPublicTrue(pageable).map(this::toDto);
    }

    @Override
    public RouteRes getForViewer(Long id, String viewerEmail) {
        Route r = findById(id);
        boolean canEdit = viewerEmail != null && viewerEmail.equalsIgnoreCase(r.getOwnerUsername());
        boolean canSeeGeom = r.isPublic() || canEdit;
        return toDto(r, canSeeGeom, canEdit);
    }

    /* ------------ update / delete ------------ */

    @Override
    public RouteRes update(Long id, RouteUpdateReq req, String username) {
        Route r = routeRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Route not found: " + id));

        if (!r.getOwnerUsername().equalsIgnoreCase(username)) {
            throw new SecurityException("Forbidden: not the owner");
        }

        if (req.getName() != null) r.setName(req.getName());
        if (req.getDistanceMeters() != null) r.setDistanceMeters(req.getDistanceMeters());
        if (req.getPublic() != null) r.setPublic(req.getPublic());

        if (req.getGeomWkt() != null) {
            if (req.getGeomWkt().isBlank()) {
                r.setGeom(null);
            } else {
                r.setGeom(parseLineString(req.getGeomWkt()));
            }
        }

        r = routeRepo.save(r);
        return toDto(r, true, true);
    }

    @Override
    public void delete(Long id, String username) {
        Route r = routeRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Route not found: " + id));

        if (!r.getOwnerUsername().equalsIgnoreCase(username)) {
            throw new SecurityException("Forbidden: not the owner");
        }
        routeRepo.delete(r);
    }
}
