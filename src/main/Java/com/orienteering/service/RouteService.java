package com.orienteering.service;

import com.orienteering.domain.Route;
import com.orienteering.dto.RouteCreateReq;
import com.orienteering.dto.RouteRes;
import com.orienteering.dto.RouteUpdateReq;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RouteService {
    RouteRes create(String username, RouteCreateReq req);
    RouteRes create(RouteCreateReq req);

    RouteRes update(Long id, RouteUpdateReq req, String username);
    void delete(Long id, String username);

    List<RouteRes> mine(String username);
    Route findById(Long id);
    Page<RouteRes> listPublic(Pageable pageable);

    /** Details for viewer (includes geometry if allowed) */
    RouteRes getForViewer(Long id, String viewerEmail);
}
