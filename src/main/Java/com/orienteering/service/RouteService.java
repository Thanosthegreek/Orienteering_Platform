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
    RouteRes create(RouteCreateReq req); // optional overload

    RouteRes update(Long id, RouteUpdateReq req);
    void delete(Long id);

    List<RouteRes> mine(String username);
    Route findById(Long id);
    Page<RouteRes> listPublic(Pageable pageable);

    /** Details for viewer; include geometry only if allowed */
    RouteRes getForViewer(Long id, String viewerEmail);
}
