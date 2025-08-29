package com.orienteering.repo;

import com.orienteering.domain.Checkpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CheckpointRepo extends JpaRepository<Checkpoint, Long> {

    @Query(value = """
        SELECT * FROM checkpoints c
        WHERE ST_DWithin(
            c.geom,
            ST_SetSRID(ST_Point(:lng,:lat), 4326),
            :meters/111320.0
        )
        ORDER BY ST_Distance(
            c.geom,
            ST_SetSRID(ST_Point(:lng,:lat), 4326)
        )
        """, nativeQuery = true)
    List<Checkpoint> findNear(@Param("lat") double lat,
                              @Param("lng") double lng,
                              @Param("meters") double meters);
}
