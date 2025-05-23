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
- [x] Implement group creation form
- [x] Build group joining mechanism
- [x] Develop automatic group assignment feature
- [x] Create group detail view with member list
- [x] Implement group leader designation functionality

## 6. Task Management
- [x] Create task kanban view in group page
- [x] Implement task creation form with:
  - [x] Title and description
  - [x] Difficulty level selection (Easy/Medium/Hard)
  - [x] Deadline picker
  - [x] Assignee selection
- [x] Build task detail view with:
  - [x] Status updates (Not Started/In Progress/Completed)
  - [x] Comments section
  - [x] Task commit log
- [x] Implement task editing functionality
- [x] Add task deletion with confirmation

## 7. GitHub Integration
- [x] Add error handling for GitHub connection issues

## 8. Contribution Score System
- [x] Create contribution score calculation visualization
- [x] Implement detailed score breakdown view:
  - [x] Task completion weighted score
  - [x] Peer review average score
  - [x] Commit count contribution
  - [x] Late task penalties
- [x] Build instructor score adjustment interface
- [ ] Create final evaluation recording system

## 9. Peer Review System
- [x] Implement weekly peer review trigger mechanism
- [x] Create peer review form with:
  - [x] Task completion rating (1-5) (vote by click on start)
  - [x] Collaboration rating (1-5) (vote by click on start)
  - [x] Feedback text field
- [x] khi ấn vào group page của mình, màn hình hiển thị trắng xóa và hiển thị tất cả form đánh giá của group đó theo thứ tự lần lượt, user bắt buộc hoàn thành tất cả form đánh giá để tiếp tục sử dụng web
- [x] Implement peer review completion tracking
- [x] Create peer review results visualization

## 10. Pressure Score System
- [x] Create pressure score visualization in group analyze
- [x] Implement pressure warning display:
  - [x] Safe zone indicator
  - [x] Risk zone indicator
  - [x] Overload warning indicator
- [ ] Build task pressure calculation display
- [ ] Create pressure score filtering by time period

## 11. Free-Rider Detection
- [x] Implement free-rider detection visualization
- [x] Create evidence collection display
  - [x] Commit history evidence
  - [x] Task completion evidence
  - [x] Peer review evidence
- [x] Build instructor notification system
- [x] Implement free-rider case management interface

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