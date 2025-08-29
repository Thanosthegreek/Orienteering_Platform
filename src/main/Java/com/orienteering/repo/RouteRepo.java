package com.orienteering.repo;

import com.orienteering.domain.Route;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RouteRepo extends JpaRepository<Route, Long> {

    Page<Route> findByIsPublicTrue(Pageable pageable);

    List<Route> findByOwnerUsername(String ownerUsername);

    // (optional, if you prefer sorted results)
    // List<Route> findByOwnerUsernameOrderByCreatedAtDesc(String ownerUsername);
}
