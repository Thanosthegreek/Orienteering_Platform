// src/main/java/com/orienteering/web/RouteController.java
package com.orienteering.web;

import com.orienteering.dto.RouteCreateReq;
import com.orienteering.dto.RouteRes;
import com.orienteering.dto.RouteUpdateReq;
import com.orienteering.service.RouteService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    /** Create route (requires auth) */
    @PostMapping
    public RouteRes create(@Valid @RequestBody RouteCreateReq req, Authentication auth) {
        // Prefer email/username from the authenticated principal
        String user = auth != null ? auth.getName() : null;
        return routeService.create(user, req);
    }

    /** List public routes (no auth required) */
    @GetMapping
    public Page<RouteRes> listPublic(Pageable pageable) {
        return routeService.listPublic(pageable);
    }

    /** List my routes (requires auth) */
    @GetMapping("/mine")
    public List<RouteRes> mine(Authentication auth) {
        String user = auth != null ? auth.getName() : null;
        return routeService.mine(user);
    }

    /** Route details for viewer (id is explicit) */
    @GetMapping("/{id}")
    public RouteRes details(@PathVariable("id") Long id, Authentication auth) {
        String viewer = auth != null ? auth.getName() : null;
        return routeService.getForViewer(id, viewer);
    }

    /** Update route (requires auth) */
    @PutMapping("/{id}")
    public RouteRes update(
            @PathVariable("id") Long id,
            @Valid @RequestBody RouteUpdateReq req,
            Authentication auth
    ) {
        String user = auth != null ? auth.getName() : null;
        return routeService.update(id, req, user);
    }

    /** Delete route (requires auth) */
    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") Long id, Authentication auth) {
        String user = auth != null ? auth.getName() : null;
        routeService.delete(id, user);
    }
}
