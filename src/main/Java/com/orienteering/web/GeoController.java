// src/main/java/com/orienteering/web/GeoController.java
package com.orienteering.web;

import com.orienteering.domain.Route;
import com.orienteering.service.RouteService;
import org.locationtech.jts.io.WKTWriter;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/geo")
public class GeoController {

    private final RouteService routeService;

    public GeoController(RouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping("/routes/{id}/geom")
    public ResponseEntity<?> routeGeom(@PathVariable("id") Long id) {
        Route r = routeService.findById(id); // your existing method
        if (r == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Route not found: " + id));
        }
        if (r.getGeom() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Route has no geometry: " + id));
        }

        // return WKT (or GeoJSON if you prefer)
        String wkt = new WKTWriter().write(r.getGeom());
        return ResponseEntity.ok(Map.of("id", r.getId(), "wkt", wkt));
    }
}
