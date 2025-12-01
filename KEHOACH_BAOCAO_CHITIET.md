# Kế hoạch chi tiết báo cáo dự án hệ thống API & Frontend

## 1. Giới thiệu & Danh sách tính năng
- Hệ thống quản lý lịch khám bệnh trực tuyến, hỗ trợ bệnh nhân, bác sĩ và quản trị viên.
- Mục tiêu: Đơn giản hóa quy trình đặt lịch, quản lý thông tin, tăng hiệu quả vận hành và trải nghiệm người dùng.
- Các chức năng chính:đa
	- Đăng ký/đăng nhập tài khoản (bệnh nhân, bác sĩ, admin)
	- Quản lý thông tin cá nhân, hồ sơ bệnh nhân/bác sĩ
	- Đặt lịch khám, quản lý lịch hẹn, cập nhật trạng thái
	- Quản lý phòng ban, chuyên khoa, báo cáo thống kê
	- Phân quyền truy cập, bảo mật thông tin
	- Tích hợp thông báo, xác thực qua email
	- Quản lý báo cáo, xuất dữ liệu
	- (Tham khảo chi tiết trong README.md và các file routes)

## 2. Phân chia công việc
- Thành viên dự án:
	- [nickname1] (Backend, API, DB)
	- [nickname2] (Frontend, UI/UX)
	- [nickname3] (Kiểm thử, tài liệu)
- Dẫn chứng đóng góp:
	- Sử dụng lệnh: `git log --author="nickname" --oneline` để liệt kê commit
	- Ví dụ:
		| Thành viên   | Vai trò      | Commit tiêu biểu           |
		|--------------|--------------|----------------------------|
		| nickname1    | Backend/API  | a1b2c3: Tạo API đăng nhập  |
		| nickname2    | Frontend     | d4e5f6: Thiết kế giao diện |
		| nickname3    | Kiểm thử     | g7h8i9: Viết test Postman  |
	- Đính kèm bảng commit thực tế vào báo cáo

## 3. Use Case & Công nghệ
- Biểu đồ Use Case:
	- Vẽ sơ đồ thể hiện các tác nhân: Bệnh nhân, Bác sĩ, Admin
	- Các chức năng: Đăng nhập, Đặt lịch, Quản lý hồ sơ, Xem báo cáo, Quản lý phòng ban
	- Đính kèm hình ảnh sơ đồ (draw.io/Figma)
- Công nghệ sử dụng:
	- Backend: Node.js, Express, Supabase
	- Frontend: React, TailwindCSS
	- Database: Supabase/PostgreSQL
	- Kiểm thử: Postman, Jest
- Lý do lựa chọn:
	- Node.js: Xử lý API nhanh, phổ biến
	- React: UI linh hoạt, dễ mở rộng
	- Supabase: Quản lý dữ liệu realtime, bảo mật tốt
	- TailwindCSS: Thiết kế giao diện nhanh, hiện đại

## 4. Giao diện & Luồng màn hình
- Ảnh giao diện:
	- Đính kèm ảnh các màn hình: Đăng nhập, Đăng ký, Dashboard, Đặt lịch, Quản lý bác sĩ/bệnh nhân
	- Chú thích rõ chức năng từng màn hình
- Luồng điều hướng:
	- Người dùng đăng nhập → Dashboard → Chọn chức năng (Đặt lịch, Xem hồ sơ, Quản lý...)
	- Admin đăng nhập → Quản lý phòng ban, bác sĩ, báo cáo
	- Sử dụng sơ đồ hoặc mô tả text, ví dụ:
		1. Đăng nhập → Dashboard
		2. Dashboard → Đặt lịch
		3. Dashboard → Quản lý hồ sơ
		4. Dashboard → Xem báo cáo

## 5. Triển khai hệ thống
- Kiến trúc tổng thể:
	- Sơ đồ: Frontend (React) ↔ Backend (Node.js/Express) ↔ Database (Supabase)
	- Các thành phần: Client, Server, DB, Auth, API Gateway
- Thiết kế API:
	- Ví dụ endpoint:
		- POST /api/auth/login: Đăng nhập
		- GET /api/doctors: Lấy danh sách bác sĩ
		- POST /api/appointments: Đặt lịch khám
	- Request/Response mẫu:
		```json
		// POST /api/appointments
		{
			"patientId": "...",
			"doctorId": "...",
			"date": "2025-12-01",
			"slot": "08:00"
		}
		```
- Cơ sở dữ liệu:
	- Sơ đồ ERD: Bảng Users, Doctors, Patients, Appointments, Departments
	- Quan hệ: 1 bác sĩ - nhiều lịch hẹn, 1 bệnh nhân - nhiều lịch hẹn
- Kết nối backend–frontend:
	- Frontend gọi API qua client.js
	- Sử dụng fetch/axios, xác thực token
	- Supabase dùng cho lưu trữ và xác thực

## 6. Kiểm thử
- Kế hoạch kiểm thử:
	- Unit test: Kiểm tra hàm xử lý logic (backend, frontend)
	- Integration test: Kiểm tra API, luồng dữ liệu giữa các thành phần
	- End-to-end test: Kiểm tra toàn bộ quy trình đặt lịch, đăng nhập, quản lý
- Kết quả kiểm thử:
	- Đính kèm log test, ảnh chụp kết quả, file test script
	- Ví dụ: 100% API auth pass, 95% API đặt lịch pass
- Minh chứng:
	- Trích xuất từ Postman, Jest, log thực tế
	- Đính kèm file kiểm thử, ảnh minh họa

## 7. Kết luận
- Tình trạng hiện tại:
	- Hệ thống đã triển khai đầy đủ chức năng cơ bản: đăng nhập, đặt lịch, quản lý hồ sơ, báo cáo
	- Giao diện thân thiện, API hoạt động ổn định
- Ưu điểm:
	- Kiến trúc rõ ràng, dễ mở rộng
	- Giao diện hiện đại, trải nghiệm tốt
	- Bảo mật thông tin, phân quyền hợp lý
- Hạn chế:
	- Chưa tối ưu hiệu năng cho lượng truy cập lớn
	- Một số tính năng nâng cao chưa hoàn thiện (thông báo realtime, xuất báo cáo PDF...)
- Hướng cải tiến:
	- Bổ sung tính năng nâng cao: thông báo realtime, xuất báo cáo, tích hợp AI
	- Tối ưu hiệu năng, bảo mật
	- Mở rộng cho mobile app

---

### Phân công thực hiện
1. Tổng hợp thông tin hệ thống, chức năng: [Tên thành viên]
2. Phân tích commit, phân chia công việc: [Tên thành viên]
3. Thiết kế Use Case, công nghệ: [Tên thành viên]
4. Chụp giao diện, mô tả luồng: [Tên thành viên]
5. Mô tả kiến trúc, API, DB: [Tên thành viên]
6. Kiểm thử, tổng hợp kết quả: [Tên thành viên]
7. Viết kết luận, tổng hợp báo cáo: [Tên thành viên]

(Cập nhật tên thành viên và phân công cụ thể)

---

### Ghi chú
- Sử dụng sơ đồ, ảnh minh họa, bảng biểu để tăng tính trực quan.
- Dẫn chứng commit rõ ràng, có thể trích xuất từ git log hoặc GitHub.
- Đảm bảo báo cáo đầy đủ, logic, dễ hiểu cho người đọc.



