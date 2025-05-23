# Free-Rider Detection System with Novu Notification Integration

This document explains how to use and configure the Free-Rider Detection feature with Novu notifications in the TasuMana project management application.

## Features

- Detect potential free-riders in project groups based on contribution scores, task completion, commits, and peer reviews
- Display detailed evidence for each potential free-rider, including metrics and comparisons with group averages
- Send notifications to instructors and group leaders when free-riders are detected
- Provide a dashboard for instructors to manage free-rider cases

## Setup Requirements

### 1. Novu Account Setup

1. Create an account at [Novu](https://novu.co/) 
2. Create a new application in the Novu dashboard
3. Get your API key from the Novu dashboard
4. Add the API key to `application.properties`:
   ```properties
   novu.api.key=YOUR_NOVU_API_KEY_HERE
   novu.notification.base-url=http://localhost:3000
   ```

### 2. Create Notification Templates

In the Novu dashboard, create the following templates:

#### Free-Rider Alert Template

1. Create a new notification template named `free-rider-alert`
2. Configure channels:
   - **In-App**: Template with variables `{{title}}`, `{{message}}`, and action button with URL `{{detailed_evidence_url}}`
   - **Email**: Template with variables:
     ```html
     <h1>Free-Rider Alert: {{projectName}}</h1>
     <p>Dear {{instructor_name}},</p>
     <p>A potential free-rider has been detected in your project:</p>
     <p><strong>Project:</strong> {{projectName}}</p>
     <p><strong>Student:</strong> {{freeRiderName}}</p>
     <p><strong>Evidence Summary:</strong></p>
     {{evidence_details}}
     <p>Please review the detailed evidence and take appropriate action.</p>
     <a href="{{detailed_evidence_url}}" style="padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 4px;">View Detailed Evidence</a>
     ```

3. Create a digest for the template (optional) to group multiple notifications

## Using the Free-Rider Detection System

### As an Instructor

1. Navigate to the Free-Rider Detection page from the sidebar or from a specific project
2. View the dashboard showing potential free-riders and their risk scores
3. Click on a student to see their evidence summary
4. Click "View detailed evidence" to see comprehensive evidence data
5. Mark students as free-riders if appropriate, which will be recorded in the system
6. Receive email and in-app notifications when the system automatically detects new free-riders

### Configuration Parameters

The free-rider detection system uses the following parameters from the Project entity:

- `freeriderThreshold`: Threshold percentage below group average to consider someone a free-rider
- `weightW1`: Weight for task completion component
- `weightW2`: Weight for peer review component
- `weightW3`: Weight for commit count component
- `weightW4`: Weight for task lateness component

## Troubleshooting

### Notification Issues

- Ensure your Novu API key is correct
- Check if the notification templates are properly configured
- Verify that users have valid email addresses

### No Free-Riders Detected

- Check if the project's `freeriderThreshold` is set appropriately
- Ensure there is enough contribution data (tasks, commits, reviews) to detect patterns
- Review the calculation weights in the project settings

## Implementation Details

The free-rider detection system consists of:

1. **Backend**:
   - `FreeRiderDetectionService`: Logic to detect free-riders and calculate risk scores
   - `NotificationService`: Integration with Novu for sending notifications
   - `FreeRiderDetectionController`: API endpoints for frontend consumption

2. **Frontend**:
   - `FreeRiderDetectionPage`: Main page with tabs for dashboard, evidence, and case management
   - `FreeRiderDetectionDashboard`: Overview of detected free-riders and risk scores
   - `FreeRiderEvidenceDisplay`: Detailed evidence visualization
   - `FreeRiderCaseManagement`: UI for instructors to manage free-rider cases

## API Endpoints

- `GET /api/free-rider-detection/detect?projectId={id}`: Get list of free-riders in a project
- `GET /api/free-rider-detection/risk-scores?projectId={id}`: Get risk scores for all users in a project
- `GET /api/free-rider-detection/evidence?projectId={id}&userId={id}`: Get detailed evidence for a specific user
- `GET /api/free-rider-detection/user-risk-score?projectId={id}&userId={id}`: Get risk score for a specific user
