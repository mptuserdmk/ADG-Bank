package com.adgbank.transactionservice.repository;

import com.adgbank.transactionservice.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {
    Optional<TransactionEntity> findByIdempotencyKey(String idempotencyKey);
    List<TransactionEntity> findBySourceAccountIdOrTargetAccountIdOrderByCreatedAtDesc(Long sourceAccountId, Long targetAccountId);
}

