const loginToggle = document.getElementById('loginToggle');
const registerToggle = document.getElementById('registerToggle');
const formSlider = document.querySelector('.form-slider');

// ==== Chuyển form đăng nhập / đăng ký ====
loginToggle.addEventListener('click', () => {
  formSlider.style.transform = 'translateX(0%)';
  loginToggle.classList.add('active');
  registerToggle.classList.remove('active');
});

registerToggle.addEventListener('click', () => {
  formSlider.style.transform = 'translateX(-50%)';
  registerToggle.classList.add('active');
  loginToggle.classList.remove('active');
});

// ==== Xử lý đăng ký ====
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = e.target.username.value.trim();
  const email = e.target.email.value.trim();
  const password = e.target.password.value.trim();

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();
    if (res.ok) {
      alert('Đăng ký thành công!');
      loginToggle.click(); // Chuyển về form đăng nhập
    } else {
      alert(data.error || data.message || 'Đăng ký thất bại');
    }
  } catch (err) {
    alert('Lỗi máy chủ khi đăng ký');
  }
});

// ==== Xử lý đăng nhập ====
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.email.value.trim();
  const password = e.target.password.value.trim();

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken); // nếu backend trả về
      }
      localStorage.setItem('user', JSON.stringify(data.user || { email })); // lưu thông tin người dùng nếu có
      if (data.user && data.user.id) {
        localStorage.setItem('userId', data.user.id); // 👈 dòng thêm mới
      }
      window.location.href = 'home.html';
    } else {
      alert(data.message || 'Đăng nhập thất bại');
    }
  } catch (err) {
    alert('Lỗi kết nối server');
  }
});
