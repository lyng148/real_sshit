# HỆ THỐNG QUẢN LÝ NHÓM THỰC HIỆN DỰ ÁN HOẶC BÀI TẬP LỚN TRONG MÔN HỌC

## MỤC TIÊU DỰ ÁN

Phát triển một "Hệ thống Quản lý Nhóm Thực hiện Dự án hoặc Bài tập lớn trong Môn học" dựa trên web, toàn diện, được thiết kế riêng cho các môn học đại học, phản ánh chính xác các yêu cầu chức năng và phi chức năng trong tài liệu SRS (nằm trong folder document). Hệ thống quản lý toàn bộ vòng đời dự án từ khi tạo đến đánh giá cuối cùng, với trọng tâm:

- Theo dõi tiến độ tự động qua GitHub (cụ thể hóa công cụ).
- Đánh giá đóng góp công bằng giữa các thành viên.
- Phát hiện thành viên "tự do" (free-rider) dựa trên dữ liệu thực tế.

## ĐỐI TƯỢNG & VAI TRÒ NGƯỜI DÙNG

Hệ thống triển khai các vai trò người dùng với quyền hạn cụ thể:

### Sinh viên:
- Tham gia/xem thông tin nhóm.
- Xem/cập nhật công việc được giao.
- Thực hiện đánh giá chéo thành viên khác.

### Nhóm trưởng:
- Phân công, chỉnh sửa, và xóa công việc trong nhóm.
- Theo dõi tiến độ thành viên.
- Cập nhật trạng thái công việc chung.
- Xem biểu đồ hiệu suất nhóm, bao gồm:
  * Biểu đồ cột: Số lượng commit của từng thành viên.
  * Biểu đồ đường: Tiến độ hoàn thành task theo thời gian.
  * Biểu đồ tròn: Tỷ lệ đóng góp dựa trên điểm đóng góp.
  * Có thể lọc biểu đồ theo tuần, tháng, hoặc toàn bộ dự án.

### Người hướng dẫn:
- Tạo, chỉnh sửa, và xóa dự án.
- Định nghĩa và điều chỉnh tiêu chí đánh giá.
- Theo dõi tất cả các nhóm, xem dữ liệu chi tiết về tiến độ/đóng góp.
- Thực hiện đánh giá cuối cùng.
- Xử lý các trường hợp thành viên "tự do" với quy trình:
  * Xem xét bằng chứng (commit, task, điểm đóng góp).
  * Yêu cầu giải trình từ thành viên.
  * Áp dụng biện pháp: nhắc nhở, điều chỉnh vai trò, ghi nhận cho đánh giá cuối.

### Quản trị viên hệ thống:
- Quản lý tài khoản người dùng (CRUD).
- Gán vai trò.
- Giám sát tình trạng hệ thống và cấu hình.

## CÁC MODULE CHỨC NĂNG CHÍNH & ĐẶC TẢ USE CASE CHI TIẾT

### 1. UC000: Đăng nhập
- **Tác nhân:** Sinh viên, Nhóm trưởng, Người hướng dẫn, Quản trị viên, Hệ thống.
- **Tiền điều kiện:** Người dùng đã có tài khoản.
- **Luồng chính:**
  1. Người dùng truy cập trang đăng nhập.
  2. Người dùng nhập Username và Mật khẩu.
  3. Hệ thống kiểm tra thông tin xác thực.
  4. Nếu đúng, hệ thống chuyển hướng đến trang chính tương ứng với vai trò.
- **Luồng thay thế:**
  * A1: Nếu sai thông tin, hệ thống hiển thị lỗi.
  * A2: Người dùng nhập lại thông tin.
- **Hậu điều kiện:** Người dùng được xác thực và truy cập hệ thống. Thời điểm đăng nhập được ghi nhận.
- **Dữ liệu vào:** Username (bắt buộc), Mật khẩu (bắt buộc).

### 2. UC002: Tạo lập dự án
- **Tác nhân:** Người hướng dẫn, Hệ thống.
- **Tiền điều kiện:** Người hướng dẫn đã đăng nhập.
- **Luồng chính:**
  1. Người hướng dẫn chọn "Tạo dự án mới".
  2. Hệ thống hiển thị form: Tên, Mô tả, Số lượng thành viên tối đa, Tiêu chí đánh giá, Link repository GitHub, Trọng số W1-W4 (mặc định: W1=0.4, W2=0.3, W3=0.2, W4=0.1), Ngưỡng phát hiện thành viên "tự do" (mặc định: 30%), Cấu hình Pressure Score (tùy chọn):
     * Trọng số độ khó (Dễ=1, Trung bình=2, Khó=3)
     * Các hệ số khẩn cấp theo thời gian
     * Ngưỡng cảnh báo áp lực (mặc định: 15)
  3. Người hướng dẫn nhập thông tin, bao gồm link repo GitHub.
  4. Người hướng dẫn xác nhận.
  5. Hệ thống lưu dự án vào CSDL.
  6. Hệ thống thông báo thành công và gửi thông báo (nếu có).
- **Luồng thay thế:**
  * 3a: Nếu thông tin không hợp lệ (ví dụ: link GitHub sai định dạng), hệ thống báo lỗi.
  * 4a: Người hướng dẫn hủy, hệ thống không lưu.
- **Hậu điều kiện:** Dự án được tạo, bao gồm link repo GitHub, trọng số, và ngưỡng phát hiện.
- **Dữ liệu vào:** Tên dự án, Mô tả, Số lượng thành viên tối đa, Tiêu chí đánh giá, Link repo GitHub (bắt buộc), Trọng số W1-W4, Ngưỡng phát hiện (tùy chọn), Cấu hình Pressure Score (tùy chọn).
- **Chỉnh sửa dự án:** Người hướng dẫn có thể chỉnh sửa thông tin dự án, bao gồm thay đổi link repo GitHub, điều chỉnh trọng số và ngưỡng phát hiện.

### 3. UC003: Đăng ký nhóm / Gán nhóm tự động
- **Tác nhân:** Sinh viên, Hệ thống.
- **Tiền điều kiện:** Sinh viên đã đăng nhập, dự án đã tồn tại.
- **Luồng chính:**
  1. Sinh viên chọn dự án.
  2. Hệ thống hiển thị các nhóm hiện có.
  3. Sinh viên chọn: tham gia nhóm có sẵn, tạo nhóm mới, hoặc gán tự động.
  4. Nếu tạo nhóm mới: Nhập thông tin nhóm, sinh viên trở thành nhóm trưởng.
  5. Hệ thống lưu và thêm sinh viên vào nhóm.
- **Luồng thay thế:**
  * 2a: Không có nhóm, hệ thống yêu cầu tạo nhóm mới.
  * 3a: Nếu chọn gán tự động, hệ thống gán vào nhóm còn chỗ (ưu tiên cân bằng số lượng).
- **Hậu điều kiện:** Sinh viên được gán vào nhóm.
- **Dữ liệu vào:** Tên nhóm, Mô tả nhóm (nếu tạo mới).

### 4. UC004: Phân chia nhiệm vụ
- **Tác nhân:** Nhóm trưởng, Hệ thống.
- **Tiền điều kiện:** Nhóm trưởng đã đăng nhập, dự án và nhóm đã tồn tại.
- **Luồng chính:**
  1. Nhóm trưởng chọn dự án và nhóm.
  2. Hệ thống hiển thị danh sách task và thành viên.
  3. Nhóm trưởng tạo task mới, chỉnh sửa, hoặc xóa task.
  4. Nhóm trưởng gán task cho thành viên, nhập độ khó (Dễ=1, Trung bình=2, Khó=3), deadline.
  5. Hệ thống tính toán Pressure Score của thành viên sau khi gán task mới.
  6. Hệ thống lưu và thông báo cho thành viên.
- **Luồng thay thế:**
  * 4a: Nếu thành viên có Pressure Score vượt ngưỡng, hệ thống cảnh báo quá tải.
  * 4b: Nhóm trưởng có thể tiếp tục gán task hoặc chọn thành viên khác.
- **Hậu điều kiện:** Task được phân chia, thành viên nhận thông báo.
- **Dữ liệu vào:** Tên task, Mô tả, Độ khó (bắt buộc), Deadline, Thành viên được gán.

### 5. UC005: Cập nhật tiến độ công việc
- **Tác nhân:** Sinh viên, Hệ thống.
- **Tiền điều kiện:** Sinh viên đã đăng nhập, có task được giao.
- **Luồng chính:**
  1. Sinh viên chọn task cần cập nhật.
  2. Sinh viên nhập trạng thái (Chưa làm, Đang làm, Hoàn thành) và % hoàn thành.
  3. Hệ thống lưu và cập nhật giao diện.
  4. Hệ thống ghi lại lịch sử cập nhật (thời gian, trạng thái, người cập nhật).
- **Hậu điều kiện:** Tiến độ task được ghi nhận, lịch sử cập nhật được lưu.

### 6. UC006: Ghi nhận lịch sử làm việc (GitHub)
- **Tác nhân:** Hệ thống.
- **Tiền điều kiện:** Dự án có link repo GitHub hợp lệ.
- **Luồng chính:**
  1. Hệ thống kết nối với GitHub qua API.
  2. Hệ thống thu thập commit có [TASK-ID] ở đầu message.
  3. Hệ thống lưu thông tin commit (TASK-ID, tác giả, thời gian).
  4. Hệ thống cập nhật tiến độ task liên quan.
- **Luồng thay thế:**
  * Nếu commit không có TASK-ID hoặc TASK-ID sai, hệ thống bỏ qua và gửi cảnh báo đến nhóm trưởng.
  * Nếu kết nối thất bại, thông báo lỗi cho người hướng dẫn.
- **Hậu điều kiện:** Lịch sử commit hợp lệ được ghi nhận và liên kết với task.

### 7. UC007: Đánh giá mức độ đóng góp
- **Tác nhân:** Hệ thống, Người hướng dẫn.
- **Tiền điều kiện:** Có dữ liệu từ UC004, UC005, UC006, UC008.
- **Luồng chính:**
  1. Hệ thống tính WeightedTaskCompletionScore = Tổng điểm độ khó task hoàn thành (Dễ=1, Trung bình=2, Khó=3).
  2. Hệ thống tính điểm đóng góp:
     Điểm = (W1 * WeightedTaskCompletionScore) + (W2 * Điểm_ĐánhGiáChéo_TrungBình) + (W3 * Số_Commit_LiênQuan) - (W4 * Số_Task_TrễHạn).
     (W1-W4 do người hướng dẫn cấu hình khi tạo dự án).
  3. Người hướng dẫn xem và điều chỉnh điểm nếu cần.
  4. Hệ thống lưu điểm cuối cùng.
- **Hậu điều kiện:** Điểm đóng góp được xác định.
- **Chi tiết:**
  * Điểm_ĐánhGiáChéo_TrungBình: Trung bình cộng đơn thuần của điểm đánh giá chéo (1-5).
  * Số_Task_TrễHạn: Số task có trạng thái "Hoàn thành" sau deadline.

### 8. UC008: Phản hồi công việc / Đánh giá chéo
- **Tác nhân:** Sinh viên, Nhóm trưởng, Hệ thống.
- **Tiền điều kiện:** Sinh viên đã đăng nhập, dự án có thành viên và task.
- **Luồng chính:**
  1. Hệ thống kích hoạt giai đoạn đánh giá chéo:
     * Tự động vào thứ 7 hàng tuần
     * Hoặc khi nhóm trưởng chọn "Bắt đầu đánh giá chéo"
  2. Hệ thống hiển thị thông báo cho tất cả thành viên nhóm
  3. Khi sinh viên đăng nhập, hệ thống hiển thị yêu cầu đánh giá chéo
  4. Sinh viên bắt buộc đánh giá tất cả thành viên khác trong nhóm trước khi có thể truy cập các chức năng khác
  5. Sinh viên nhập điểm (1-5) cho "Mức độ hoàn thành" và "Tinh thần hợp tác", kèm phản hồi.
  6. Hệ thống lưu đánh giá.
  7. Sau khi đánh giá xong tất cả thành viên, sinh viên được tiếp tục sử dụng các chức năng khác
  8. Sau 1 ngày kể từ khi bắt đầu, hệ thống kiểm tra các thành viên chưa hoàn thành đánh giá:
     * Gửi thông báo đến trưởng nhóm về các thành viên chưa đánh giá
     * Ghi nhận số lần không hoàn thành đánh giá của mỗi thành viên
     * Nếu thành viên không hoàn thành đánh giá chéo quá 2 lần, hệ thống gửi thông báo đến người hướng dẫn
  9. Khi tất cả thành viên hoàn thành đánh giá chéo (hoặc sau 1 ngày), hệ thống:
     * Tính toán điểm đánh giá chéo trung bình cho từng thành viên
     * Cập nhật điểm đóng góp (UC007)
     * Thực hiện kiểm tra phát hiện thành viên "tự do" (UC010)
- **Luồng thay thế:**
  * Nếu phản hồi không hợp lệ (ví dụ: điểm ngoài khoảng 1-5), hệ thống báo lỗi.
  * Nếu sinh viên cố gắng truy cập chức năng khác trước khi hoàn thành đánh giá chéo, hệ thống chuyển hướng về trang đánh giá chéo và hiển thị thông báo yêu cầu hoàn thành.
- **Hậu điều kiện:** 
  * Đánh giá chéo được lưu
  * Điểm đánh giá chéo được cập nhật và sử dụng trong tính toán điểm đóng góp
  * Các thành viên không hoàn thành đánh giá được ghi nhận và cảnh báo

### 9. UC009: Theo dõi biểu đồ hiệu suất làm việc
- **Tác nhân:** Nhóm trưởng, Người hướng dẫn.
- **Tiền điều kiện:** Đã đăng nhập, dự án có dữ liệu.
- **Luồng chính:**
  1. Người dùng chọn dự án.
  2. Hệ thống hiển thị các biểu đồ:
     * Biểu đồ cột: Số commit của từng thành viên.
     * Biểu đồ đường: Tiến độ task theo thời gian.
     * Biểu đồ tròn: Tỷ lệ đóng góp của thành viên.
  3. Người dùng có thể lọc theo tuần, tháng, hoặc toàn bộ dự án.
- **Luồng thay thế:**
  * Nếu không có dữ liệu, thông báo "Chưa có dữ liệu".

### 10. UC010: Phát hiện thành viên "tự do"
- **Tác nhân:** Hệ thống, Người hướng dẫn, Nhóm trưởng.
- **Tiền điều kiện:** Dự án triển khai >1 tuần, có dữ liệu từ UC007.
- **Luồng chính:**
  1. Hệ thống tính điểm trung bình nhóm từ UC007.
  2. Nếu điểm thành viên < ngưỡng cấu hình (mặc định 30%) so với điểm trung bình, hệ thống cảnh báo "tự do".
  3. Hệ thống gửi cảnh báo cho nhóm trưởng và người hướng dẫn, kèm bằng chứng (commit, task, điểm).
  4. Nhóm trưởng xem xét, trao đổi với thành viên, và báo cáo cho người hướng dẫn.
  5. Người hướng dẫn quyết định biện pháp: nhắc nhở, điều chỉnh vai trò, ghi nhận cho đánh giá cuối.
- **Hậu điều kiện:** Thành viên "tự do" được phát hiện và xử lý.

### 11. UC011: Đánh giá kết quả cuối cùng
- **Tác nhân:** Người hướng dẫn, Hệ thống.
- **Tiền điều kiện:** Dự án hoàn thành, có dữ liệu đầy đủ.
- **Luồng chính:**
  1. Người hướng dẫn chọn dự án.
  2. Hệ thống hiển thị báo cáo chi tiết từng thành viên (điểm đóng góp, task, commit, đánh giá chéo).
  3. Người hướng dẫn nhập điểm/nhận xét cuối cùng.
  4. Hệ thống lưu và thông báo kết quả đến sinh viên (nếu cấu hình).
- **Hậu điều kiện:** Đánh giá cuối cùng được lưu.

### 12. UC012: Quản lý người dùng và hệ thống
- **Tác nhân:** Quản trị viên, Hệ thống.
- **Tiền điều kiện:** Quản trị viên đã đăng nhập.
- **Luồng chính:**
  1. Quản trị viên truy cập "Quản lý người dùng".
  2. Quản trị viên thực hiện CRUD tài khoản, phân quyền (gán vai trò).
  3. Hệ thống lưu và cập nhật.
- **Hậu điều kiện:** Danh sách người dùng và quyền được cập nhật.

### 13. UC013: Tính toán và quản lý Pressure Score
- **Tác nhân:** Hệ thống, Nhóm trưởng, Người hướng dẫn.
- **Tiền điều kiện:** Dự án đã tạo, có thành viên và task.
- **Luồng chính:**
  1. Hệ thống tính toán Pressure Score theo quy trình sau:
     * **Bước 1: Lượng hóa Độ Khó (Difficulty Weight - DW)**
       * DW(Dễ) = 1
       * DW(Trung bình) = 2 
       * DW(Khó) = 3
     * **Bước 2: Lượng hóa Mức Độ Khẩn Cấp theo Thời Gian (Time Urgency Factor - TUF)**
       * Tính DaysRemaining = TaskDeadline - CurrentDate (số ngày còn lại)
       * Nếu DaysRemaining <= 1 (Hôm nay hoặc ngày mai): TUF = 3.0 (Rất khẩn cấp)
       * Nếu 1 < DaysRemaining <= 3: TUF = 2.0 (Khẩn cấp)
       * Nếu 3 < DaysRemaining <= 7: TUF = 1.5 (Sắp đến hạn)
       * Nếu DaysRemaining > 7: TUF = 1.0 (Bình thường)
       * Nếu TaskDeadline < CurrentDate (Đã trễ hạn): TUF = 3.5 (hoặc cao hơn, để phạt)
     * **Bước 3: Tính Điểm Áp Lực cho Từng Task (Task Pressure Score - TPS)**
       * TPS = DW × TUF
     * **Bước 4: Tính Tổng Điểm Áp Lực cho Thành Viên (Total Member Pressure Score - TMPS)**
       * TMPS = Tổng TPS của tất cả task chưa hoàn thành của thành viên
     * **Bước 5: Đánh giá và Cảnh báo Quá Tải**
       * Nếu TMPS >= PressureThreshold: Đưa ra cảnh báo quá tải
  2. Hệ thống tính Pressure Score trong các trường hợp:
     * Khi gán task mới
     * Cập nhật hàng ngày (tự động)
     * Khi nhóm trưởng hoặc người hướng dẫn yêu cầu
  3. Người dùng xem Pressure Score trên dashboard
     * Nhóm trưởng xem score của các thành viên trong nhóm
     * Người hướng dẫn xem score của tất cả thành viên
  4. Hệ thống hiển thị trạng thái áp lực công việc:
     * An toàn (TMPS < 70% ngưỡng)
     * Có nguy cơ (70% ngưỡng <= TMPS < ngưỡng)
     * Quá tải (TMPS >= ngưỡng)
- **Luồng thay thế:**
  * Nếu không có task nào chưa hoàn thành, Pressure Score = 0
  * Người hướng dẫn có thể điều chỉnh cấu hình tính Pressure Score trong quá trình triển khai dự án
- **Hậu điều kiện:** Pressure Score được tính toán và hiển thị
- **Ví dụ minh họa:**
  * Thành viên A có 3 task chưa hoàn thành:
    * Task 1: Khó (DW=3), Deadline trong 2 ngày (TUF=2.0) => TPS1 = 3 × 2.0 = 6.0
    * Task 2: Trung bình (DW=2), Deadline trong 6 ngày (TUF=1.5) => TPS2 = 2 × 1.5 = 3.0
    * Task 3: Dễ (DW=1), Deadline ngày mai (TUF=3.0) => TPS3 = 1 × 3.0 = 3.0
    * Tổng Điểm Áp Lực: TMPS = 6.0 + 3.0 + 3.0 = 12.0
    * Nếu Ngưỡng Áp Lực = 15, thành viên A chưa bị cảnh báo quá tải
    * Nếu Ngưỡng Áp Lực = 10, thành viên A sẽ bị cảnh báo quá tải

## SƠ ĐỒ USE CASE

Hệ thống phải triển khai đầy đủ các luồng chức năng theo sơ đồ use case trong SRS, đảm bảo các actor, use case, và mối quan hệ (include, extend) được thực hiện chính xác.

## CÔNG NGHỆ SỬ DỤNG

- **Backend:** Spring Boot (Java), kiến trúc 3 layers.
- **Frontend:** Vue3
- **CSDL:** MySQL.
- **Tích hợp:** GitHub API.

## BỐI CẢNH

Hệ thống phục vụ môi trường học thuật, đặc biệt là các môn học như chương trình Phát triển phần mềm theo chuẩn ITSS của ĐHBK HN, tập trung vào quy trình, cộng tác và đánh giá công bằng. Tính năng theo dõi tự động qua GitHub và phát hiện free-rider là điểm nhấn cần ưu tiên.