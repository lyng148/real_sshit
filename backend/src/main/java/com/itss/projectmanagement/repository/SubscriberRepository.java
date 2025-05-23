package com.itss.projectmanagement.repository;

import com.itss.projectmanagement.entity.Subscriber;
import com.itss.projectmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubscriberRepository extends JpaRepository<Subscriber, Long> {
    Optional<Subscriber> findByUser(User user);
}
