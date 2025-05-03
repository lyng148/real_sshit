# TODO-FRONTEND.md

## Checklist cho Frontend (người làm thứ 2)

- [ ] Khởi tạo project React với TypeScript (CRA hoặc Vite)
- [ ] Cài đặt và cấu hình ESLint, Prettier, Husky (pre-commit hooks)
- [ ] Thiết lập Axios với baseURL và interceptor để xử lý JWT
- [ ] Xây dựng layout chính: Navbar, Sidebar, Footer và theme chung (Dark/Light)
- [ ] Page/Login: form đăng nhập, lưu/đọc JWT, xử lý lỗi
- [ ] Page/Dashboard: tổng quan dự án, bảng tóm tắt stats
- [ ] Page/Users: list, CRUD user, phân trang, tìm kiếm, phân quyền
- [ ] Page/Projects: list, CRUD project, validate GitHub URL, cấu hình Pressure Score
- [ ] Page/Groups: tạo nhóm, tham gia nhóm, hiển thị danh sách nhóm và thành viên
- [ ] Page/Tasks: list, CRUD task, gán thành viên, hiển thị trạng thái và progress bar
- [ ] Real-time notification: tích hợp WebSocket hoặc SSE để nhận update task
- [ ] Page/TaskProgress: giao diện cập nhật tiến độ, history và biểu đồ timeline (Recharts/Chart.js)
- [ ] Kết nối GitHub API: hiển thị commit theo TASK-ID, filter, view chi tiết commit
- [ ] Page/Contributions: hiển thị & chỉnh sửa điểm đóng góp (instructor)
- [ ] Page/PeerReview: giao diện đánh giá chéo, lịch đánh giá hàng tuần, form review
- [ ] Page/Reports: biểu đồ commit, progress timeline, contribution %
- [ ] Page/Pressure: hiển thị TUF, TPS, TMPS, cảnh báo free‑rider
- [ ] Viết unit tests cho components và logic (Jest, React Testing Library)
- [ ] Viết E2E tests (Cypress)
- [ ] Thiết lập CI/CD: GitHub Actions build, test và deploy lên Netlify/Vercel
- [ ] Tạo Storybook cho component library
- [ ] Viết README hướng dẫn setup và chạy frontend