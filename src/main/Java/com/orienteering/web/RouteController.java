package com.orienteering.web;

import com.orienteering.dto.RouteRes;
import com.orienteering.dto.RouteUpdateReq;
import com.orienteering.dto.RouteCreateReq;
import com.orienteering.service.RouteService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    // ---------- PUBLIC LIST ----------
    // GET /api/routes?page=0&size=20
    @GetMapping(value = "/routes", produces = "application/json")
    public Page<RouteRes> list(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return routeService.listPublic(pageable);
    }

    // ---------- MY ROUTES (AUTH) ----------
    // GET /api/routes/mine
    @GetMapping("/routes/mine")
    public List<RouteRes> mine(Authentication auth) {
        final String username = auth.getName(); // email/username from JWT
        return routeService.mine(username);
    }

    // ---------- DETAILS (PUBLIC) ----------
    // GET /api/routes/{id}
    // NOTE: id is numeric; "/routes/mine" is handled by the method above
    @GetMapping("/routes/{id}")
    public ResponseEntity<RouteRes> details(
            @PathVariable("id") Long id,
            Authentication auth) {

        final String viewer = (auth != null) ? auth.getName() : null;
        return ResponseEntity.ok(routeService.getForViewer(id, viewer));
    }

    // ---------- CREATE (AUTH) ----------
    @PostMapping("/routes")
    public ResponseEntity<RouteRes> create(@RequestBody RouteCreateReq req, Authentication auth) {
        final String username = auth.getName();
        return ResponseEntity.ok(routeService.create(username, req));
    }

    // ---------- UPDATE (AUTH) ----------
    @PutMapping("/routes/{id}")
    public ResponseEntity<RouteRes> update(@PathVariable Long id, @RequestBody RouteUpdateReq req) {
        return ResponseEntity.ok(routeService.update(id, req));
    }

    // ---------- DELETE (AUTH) ----------
    @DeleteMapping("/routes/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        routeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
