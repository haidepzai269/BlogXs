import { initI18n } from './i18n.js';



// Hàm applyTheme như search.js
function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.textContent = theme === 'light' ? '🌙 Chế độ tối' : '🌞 Chế độ sáng';
  }
}
document.addEventListener('DOMContentLoaded', () => {
    const postForm = document.getElementById('createPostForm');
    if (postForm) {
      postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = e.target.content.value.trim();
  
        if (!content) {
          alert('Nội dung không được để trống');
          return;
        }
  
        try {
          const res = await authFetch('/api/posts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
          });
  
          if (res.ok) {
            const newPost = await res.json();
            alert('Đăng bài thành công!');
            window.location.href = 'home.html'; // hoặc làm gì đó khác
          } else {
            const data = await res.json();
            alert(data.error || 'Lỗi khi đăng bài');
          }
        } catch (err) {
          console.error('Lỗi gửi bài:', err);
          alert('Lỗi kết nối server');
        }
      });
    }
  });
  
  
function goToHome() {
    window.location.href = 'home.html';
  } 
function goToSearch() {
    window.location.href = 'search.html';
  }
function goToProfile() {
    window.location.href = 'profile.html';
  }
  function goToLike() {
    window.location.href = 'like.html';
  }
function logout() {
    localStorage.clear();
    window.location.href = 'auth.html';
  }
  document.getElementById('shortBtn').addEventListener('click', () => {
    window.location.href = 'shorts.html';
  });
  document.getElementById('homeBtn').addEventListener('click', () => {
    window.location.href = 'home.html';
  });
  document.getElementById('profileBtn').addEventListener('click', () => {
    window.location.href = 'profile.html';
  });
  document.getElementById('likeBtn').addEventListener('click', () => {
    window.location.href = 'like.html';
  });
  document.getElementById('searchBtn').addEventListener('click', () => {
    window.location.href = 'search.html';
  });

  document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const menuPopup = document.getElementById('menuPopup');
    const overlay = document.getElementById('menuOverlay');
  
    const currentPage = window.location.pathname.includes('create')
      ? 'create'
      : window.location.pathname.includes('home')
      ? 'home'
      : window.location.pathname.includes('search')
      ? 'search'
      : 'profile';
  
    const pages = [
      { name: 'Trang chủ', href: 'home.html', id: 'home' },
      { name: 'Hồ sơ', href: 'profile.html', id: 'profile' },
      { name: 'Tìm kiếm', href: 'search.html', id: 'search' },
      { name: 'Đăng bài', href: 'create.html', id: 'create' },
      { name: 'Bài đã thích', href: 'like.html', id: 'like' },
    ];
  
    // Tạo menu động
    menuPopup.innerHTML = '';
    pages.forEach(page => {
      if (page.id !== currentPage) {
        const btn = document.createElement('button');
        btn.textContent = page.name;
        btn.onclick = () => window.location.href = page.href;
        menuPopup.appendChild(btn);
      }
    });
  
    // Toggle mở/đóng popup
    let isOpen = false;
  
    menuToggle.addEventListener('click', () => {
      isOpen = !isOpen;
      menuPopup.style.display = isOpen ? 'flex' : 'none';
      overlay.style.display = isOpen ? 'block' : 'none';
    });
  
    overlay.addEventListener('click', () => {
      isOpen = false;
      menuPopup.style.display = 'none';
      overlay.style.display = 'none';
    });
    // Nút chuyển theme
const themeToggleBtn = document.createElement('button');
themeToggleBtn.id = 'themeToggleBtn';

let currentTheme = localStorage.getItem('theme') || 'dark';
themeToggleBtn.textContent = currentTheme === 'dark' ?  '🌕' : '🌑';

themeToggleBtn.onclick = () => {
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
  themeToggleBtn.textContent = newTheme === 'dark' ?  '🌕' : '🌑';
  currentTheme = newTheme;
};

// Thêm vào cuối menuPopup
menuPopup.appendChild(themeToggleBtn);

  });
  



// Qr code
document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateQRBtn');
  const input = document.getElementById('qrLinkInput');
  const popup = document.getElementById('qrPopup');
  const qrCodeContainer = document.getElementById('qrCodeContainer');
  const closeBtn = document.getElementById('closeQRPopup');

  generateBtn.addEventListener('click', () => {
    const link = input.value.trim();
    if (!link) return alert('Vui lòng nhập link hợp lệ!');

    qrCodeContainer.innerHTML = ''; // clear old QR
    new QRCode(qrCodeContainer, {
      text: link,
      width: 180,
      height: 180,
      colorDark: "#ffffff",
      colorLight: "#000000",
      correctLevel: QRCode.CorrectLevel.H
    });

    popup.classList.add('show');
  });

  closeBtn.addEventListener('click', () => {
    popup.classList.remove('show');
    // Delay để đồng bộ hiệu ứng trước khi ẩn hẳn
    setTimeout(() => {
      popup.style.display = 'none';
    }, 300);
  });

  // Kích hoạt lại display khi class show được thêm
  const observer = new MutationObserver(() => {
    if (popup.classList.contains('show')) {
      popup.style.display = 'flex';
    }
  });
  observer.observe(popup, { attributes: true, attributeFilter: ['class'] });
});

window.addEventListener('DOMContentLoaded', () => {
  initI18n();
});