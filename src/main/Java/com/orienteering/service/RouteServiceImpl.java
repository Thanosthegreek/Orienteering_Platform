package com.orienteering.service;

import com.orienteering.domain.Route;
import com.orienteering.dto.RouteCreateReq;
import com.orienteering.dto.RouteRes;
import com.orienteering.dto.RouteUpdateReq;
import com.orienteering.repo.RouteRepo;
import org.locationtech.jts.geom.LineString;
import org.locationtech.jts.io.WKTReader;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    public RouteServiceImpl(RouteRepo routeRepo) {
        this.routeRepo = routeRepo;
    }

    // -------------------- CREATE --------------------
    @Override
    public RouteRes create(String username, RouteCreateReq req) {
        Route r = new Route();
        r.setOwnerUsername(username);
        r.setName(req.getName());
        r.setDistanceMeters(req.getDistanceMeters());
        r.setPublic(req.isPublic());
        r.setCreatedAt(LocalDateTime.now());

        if (req.getGeomWkt() != null && !req.getGeomWkt().isBlank()) {
            r.setGeom(parseLineString(req.getGeomWkt()));
        }

        r = routeRepo.save(r);
        return toDto(r, true); // creator can see geometry
    }

    @Override
    public RouteRes create(RouteCreateReq req) {
        // convenience (not used by controller)
        Route r = new Route();
        r.setName(req.getName());
        r.setDistanceMeters(req.getDistanceMeters());
        r.setPublic(req.isPublic());
        r.setCreatedAt(LocalDateTime.now());
        if (req.getGeomWkt() != null && !req.getGeomWkt().isBlank()) {
            r.setGeom(parseLineString(req.getGeomWkt()));
        }
        r = routeRepo.save(r);
        return toDto(r, true);
    }

    // -------------------- UPDATE / DELETE --------------------
    @Override
    public RouteRes update(Long id, RouteUpdateReq req) {
        Route r = routeRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Route not found: " + id));

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
        // assume updater is owner/authorized; include geom back
        return toDto(r, true);
    }

    @Override
    public void delete(Long id) {
        routeRepo.deleteById(id);
    }

    // -------------------- QUERIES --------------------
    @Override
    @Transactional(readOnly = true)
    public List<RouteRes> mine(String username) {
        return routeRepo.findByOwnerUsername(username).stream()
                .map(r -> toDto(r, true)) // owner sees geometry
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Route findById(Long id) {
        return routeRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Route not found: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RouteRes> listPublic(Pageable pageable) {
        return routeRepo.findByIsPublicTrue(pageable)
                .map(r -> toDto(r, false)); // list view: omit geometry for brevity
    }

    @Override
    @Transactional(readOnly = true)
    public RouteRes getForViewer(Long id, String viewerEmail) {
        Route r = findById(id);
        boolean includeGeom = r.isPublic() ||
                (viewerEmail != null && viewerEmail.equalsIgnoreCase(r.getOwnerUsername()));
        return toDto(r, includeGeom);
    }

    // -------------------- Helpers --------------------
    private LineString parseLineString(String wkt) {
        try {
            String cleaned = stripSrid(wkt);
            return (LineString) new WKTReader().read(cleaned);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid WKT: " + e.getMessage(), e);
        }
    }

    private String stripSrid(String wkt) {
        return wkt.replaceFirst("^\\s*SRID=\\d+\\s*;\\s*", "").trim();
    }

    private RouteRes toDto(Route r, boolean includeGeom) {
        RouteRes dto = new RouteRes();
        dto.setId(r.getId());
        dto.setName(r.getName());
        dto.setDistanceMeters(r.getDistanceMeters());
        dto.setPublic(r.isPublic());
        if (r.getCreatedAt() != null) {
            dto.setCreatedAt(r.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant());
        }
        if (includeGeom && r.getGeom() != null) {
            dto.setGeomWkt(r.getGeom().toText());
        } else {
            dto.setGeomWkt(null);
        }
        return dto;
    }
}
