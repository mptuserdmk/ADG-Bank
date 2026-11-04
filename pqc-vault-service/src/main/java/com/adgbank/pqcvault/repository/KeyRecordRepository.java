package com.adgbank.pqcvault.repository;

import com.adgbank.pqcvault.entity.KeyRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface KeyRecordRepository extends JpaRepository<KeyRecord, UUID> {

    Optional<KeyRecord> findTopByAccountIdOrderByCreatedAtDesc(String accountId);

    List<KeyRecord> findAllByAccountIdOrderByCreatedAtDesc(String accountId);
}

