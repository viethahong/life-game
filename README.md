# Life Game — Build Your Legend

Hệ thống MMORPG hiện thực hóa nỗ lực cá nhân, giúp bạn biến công việc và kỉ luật hằng ngày thành một hành trình thăng cấp đầy cảm hứng dựa trên triết lý xây dựng thương hiệu cá nhân bền vững.

## 🚀 Concept Cốt Lõi: Hệ Thống 4T
Dự án được xây dựng trên mô hình phát triển toàn diện **4T**:
1.  **Tài năng (T1)**: Kỹ năng chuyên môn, kiến thức và khả năng giải quyết vấn đề.
2.  **Tín nhiệm (T2)**: Sự tin tưởng từ đồng nghiệp, đối tác và cộng đồng.
3.  **Tiếng tăm (T3)**: Độ nhận diện và thương hiệu cá nhân trên thị trường.
4.  **Tài chính (T4)**: Nguồn lực kinh tế thu được để tái đầu tư vào 3 yếu tố trên.

### ⚖️ Nguyên lý Thùng gỗ (Theory of Constraints)
Đẳng cấp (Rank) của bạn không được quyết định bởi chỉ số cao nhất, mà bởi **chỉ số thấp nhất** trong hệ thống 4T. Điều này thúc đẩy sự phát triển cân bằng, không lệch lạc.

## 🛠️ Các Tính Năng Chính
- **Hệ Thống Onboarding**: Trắc nghiệm tâm lý xác định Class nhân vật phù hợp (Creator, Warrior, Merchant, Sage).
- **Quest System**: Quản lý nhiệm vụ hằng ngày với cơ chế gợi ý theo Class.
- **Tái đầu tư (Reinvestment)**: Sử dụng T4 (Vàng) để nâng cấp T1, T2, T3 trực tiếp. Chi phí tăng dần theo Level.
- **Power Score (Lực chiến)**: Chỉ số tổng hợp sức mạnh dựa trên 4T và khả năng quản lý tài chính.
- **Analytics**: Radar Chart trực quan hóa sự cân bằng của 4T và Biểu đồ XP History theo dõi kỉ luật.
- **PWA Ready**: Có thể cài đặt trực tiếp lên điện thoại như một ứng dụng bản địa (Native App).

## 💻 Công Nghệ Sử Dụng
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+).
- **Thư viện**: [Chart.js](https://www.chartjs.org/) cho các biểu đồ phân tích.
- **Persistence**: Lưu trữ cục bộ (Local Storage). Hỗ trợ Export/Import dữ liệu qua file JSON.

## 📁 Cấu Trúc Thư Mục
- `/js/state.js`: Chứa Database (Skills, Quests) và quản lý Persistence.
- `/js/engine.js`: Logic tính toán cốt lõi, thăng cấp và đánh giá Rank.
- `/js/ui_manager.js`: Quản lý hiển thị, Chart và điều hướng màn hình.
- `/js/components.js`: Thư viện thành phần UI động.
- `/js/app.js`: Điều phối sự kiện và quy trình Onboarding.

## 🛠️ Hướng Dẫn Sử Dụng
1. **Làm nhiệm vụ**: Mỗi Quest hoàn thành mang lại XP và tăng nhẹ T1/T2/T3.
2. **Thu thập Loot**: Ghi nhận thu nhập thực tế để tăng T4 và nhận XP thưởng.
3. **Tái đầu tư**: Khi có đủ tiền, hãy dùng T4 để bù đắp những chỉ số còn yếu nhằm thăng cấp Rank (theo nguyên lý Thùng gỗ).
4. **Học kỹ năng**: Sử dụng Skill Points (SP) nhận được khi lên cấp để mở khóa các Buff vĩnh viễn trong Cây kỹ năng.

---
*Phát triển bởi Antigravity AI Assistant cho HaHongViet.com*
