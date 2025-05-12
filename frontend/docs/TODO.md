# Frontend Development TODO List

## 2. Authentication Module
- [x] Create login page with username/password fields
- [x] Implement authentication API integration
- [x] Set up JWT token storage
- [x] Create authentication guards for protected routes
- [x] Implement user session management
- [x] Add logout functionality

## 3. User Management (Admin)
- [x] Create user listing page with filtering options
- [x] Implement user creation form
- [x] Develop user edit/update functionality
- [x] Add user deletion with confirmation
- [x] Implement role assignment interface
- [x] Create user detail view

## 4. Project Management
- [x] Change mockup data with calling api to get project info
- [x] Implement project creation form with all fields (only instructor can see the button + to create project):
  - [x] Basic info (name, description, max members)
  - [x] Assessment criteria configuration
  - [x] Weight factors configuration (W1-W4) (write default value in form)
  - [x] Free-rider detection threshold setting (write default value in form)
  - [x] Pressure Score configuration (write default value in form)
- [x] Build project detail view
- [x] Create project editing interface
- [x] Implement project deletion with confirmation
- [x] Add project statistics dashboard

## 5. Group Management
- [x] Create group listing interface
- [ ] Implement group creation form
- [x] Build group joining mechanism
- [ ] Develop automatic group assignment feature
- [x] Create group detail view with member list
- [x] Implement group leader designation functionality

## 6. Task Management
- [ ] Create task board/listing view by group
- [ ] Implement task creation form with:
  - [ ] Title and description
  - [ ] Difficulty level selection (Easy/Medium/Hard)
  - [ ] Deadline picker
  - [ ] Assignee selection
- [ ] Build task detail view with:
  - [ ] Status updates (Not Started/In Progress/Completed)
  - [ ] Progress percentage input
  - [ ] Comments section
  - [ ] Task history log
- [ ] Implement task editing functionality
- [ ] Add task deletion with confirmation
- [ ] Create task filtering and sorting options

## 7. GitHub Integration
- [ ] Implement GitHub API connection configuration
- [ ] Create commit history display by project/group
- [ ] Build commit visualization by task (with TASK-ID detection)
- [ ] Implement commit statistics by user
- [ ] Add error handling for GitHub connection issues

## 8. Contribution Score System
- [ ] Create contribution score calculation visualization
- [ ] Implement detailed score breakdown view:
  - [ ] Task completion weighted score
  - [ ] Peer review average score
  - [ ] Commit count contribution
  - [ ] Late task penalties
- [ ] Build instructor score adjustment interface
- [ ] Create final evaluation recording system

## 9. Peer Review System
- [ ] Implement weekly peer review trigger mechanism
- [ ] Create peer review form with:
  - [ ] Task completion rating (1-5)
  - [ ] Collaboration rating (1-5)
  - [ ] Feedback text field
- [ ] Build peer review reminder system
- [ ] Implement peer review completion tracking
- [ ] Create peer review results visualization

## 10. Pressure Score System
- [ ] Create pressure score visualization by user
- [ ] Implement pressure warning display:
  - [ ] Safe zone indicator
  - [ ] Risk zone indicator
  - [ ] Overload warning indicator
- [ ] Build task pressure calculation display
- [ ] Create pressure score filtering by time period

## 11. Free-Rider Detection
- [ ] Implement free-rider detection visualization
- [ ] Create evidence collection display
  - [ ] Commit history evidence
  - [ ] Task completion evidence
  - [ ] Peer review evidence
- [ ] Build instructor notification system
- [ ] Implement free-rider case management interface

## 12. Performance Dashboard
- [ ] Create group leader dashboard with:
  - [ ] Bar chart: Commit counts by member
  - [ ] Line chart: Task completion progress over time
  - [ ] Pie chart: Contribution percentage
  - [ ] Filterable by week/month/entire project
- [ ] Build instructor dashboard with all groups overview
- [ ] Implement data export functionality

## 13. Comment System
- [x] Create comment listing component
- [x] Implement comment creation form
- [ ] Build comment editing functionality
- [ ] Add comment deletion with confirmation

## 14. Final Assessment
- [ ] Create final assessment form for instructors
- [ ] Implement grading interface with evidence display
- [ ] Build assessment submission and notification system

## 15. General UI/UX
- [ ] Design consistent component styling
- [ ] Implement responsive design for all views
- [ ] Create loading states and indicators
- [ ] Add error handling and notifications
- [ ] Implement confirmation dialogs for critical actions

## Testing and Quality Assurance
- [ ] Write unit tests for critical components
- [ ] Implement integration tests for main workflows
- [ ] Create end-to-end tests for key user journeys
- [ ] Perform cross-browser testing
- [ ] Conduct accessibility testing

## Deployment
- [ ] Configure build process for production
- [ ] Set up continuous integration/deployment
- [ ] Create deployment documentation