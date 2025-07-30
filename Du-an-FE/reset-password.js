document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("resetForm");
    const message = document.getElementById("message");
  
    const email = localStorage.getItem("reset_email");
    const code = localStorage.getItem("reset_code");
  
    if (!email || !code) {
      message.textContent = "❗ Thiếu thông tin xác minh. Vui lòng quay lại bước trước.";
      form.style.display = "none";
      return;
    }
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById("newPassword").value.trim();
  
      if (!newPassword) {
        message.textContent = "❗ Vui lòng nhập mật khẩu mới.";
        return;
      }
  
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code, newPassword }),
        });
  
        const data = await res.json();
  
        if (res.ok) {
            message.textContent = "✅ Đặt lại mật khẩu thành công! Đang chuyển hướng...";
            form.reset();
            localStorage.removeItem("reset_email");
            localStorage.removeItem("reset_code");
          
            // ⏳ Tự động chuyển hướng sau 2 giây
            setTimeout(() => {
              window.location.href = "auth.html";
            }, 2000);
          }
          else {
          message.textContent = `❌ ${data.message || "Lỗi xảy ra."}`;
        }
      } catch (err) {
        console.error("❌ Lỗi kết nối:", err);
        message.textContent = "❌ Không thể kết nối đến máy chủ.";
      }
    });
  });
  