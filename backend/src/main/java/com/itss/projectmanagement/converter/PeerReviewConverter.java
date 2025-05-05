package com.itss.projectmanagement.converter;

import com.itss.projectmanagement.dto.request.peer.PeerReviewRequest;
import com.itss.projectmanagement.dto.response.peer.PeerReviewResponse;
import com.itss.projectmanagement.entity.PeerReview;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Component
public class PeerReviewConverter {

    @Autowired
    private UserConverter userConverter;

    public PeerReview toEntity(PeerReviewRequest request, User reviewer, User reviewee, Project project) {
        // Calculate the average score from completion and cooperation scores
        Double averageScore = (request.getCompletionScore() + request.getCooperationScore()) / 2.0;
        
        // Calculate current week number for tracking review periods
        int weekNumber = LocalDate.now().get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());
        
        return PeerReview.builder()
                .reviewer(reviewer)
                .reviewee(reviewee)
                .project(project)
                .score(averageScore)
                .completionScore(request.getCompletionScore())
                .cooperationScore(request.getCooperationScore())
                .reviewWeek(weekNumber)
                .comment(request.getComment())
                .isCompleted(true)
                .build();
    }

    public PeerReviewResponse toResponse(PeerReview peerReview) {
        return PeerReviewResponse.builder()
                .id(peerReview.getId())
                .reviewer(userConverter.toSummaryDTO(peerReview.getReviewer()))
                .reviewee(userConverter.toSummaryDTO(peerReview.getReviewee()))
                .projectId(peerReview.getProject().getId())
                .projectName(peerReview.getProject().getName())
                .score(peerReview.getScore())
                .completionScore(peerReview.getCompletionScore())
                .cooperationScore(peerReview.getCooperationScore())
                .reviewWeek(peerReview.getReviewWeek())
                .comment(peerReview.getComment())
                .isCompleted(peerReview.getIsCompleted())
                .createdAt(peerReview.getCreatedAt())
                .updatedAt(peerReview.getUpdatedAt())
                .build();
    }

    public List<PeerReviewResponse> toResponseList(List<PeerReview> peerReviews) {
        return peerReviews.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}