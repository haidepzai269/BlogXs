import { applyTheme, loadThemeFromLocalStorage } from './theme.js';
const socket = io(); // Kết nối với Socket.IO server

document.addEventListener('DOMContentLoaded', () => {
  const currentTheme = loadThemeFromLocalStorage();
  applyTheme(currentTheme || 'dark');

  fetchShorts();
  handleUpload();
  socket.on('new_short', (short) => {
    renderShort(short, true);
  
    const toast = document.createElement('div');
    toast.className = 'short-toast';
    toast.innerText = '🔥 Có video mới được đăng!';
    document.body.appendChild(toast);
  
    setTimeout(() => toast.remove(), 4000);
  });
  
});

// Lấy danh sách shorts từ server
async function fetchShorts() {
  try {
    const res = await authFetch('/api/shorts');
    const shorts = await res.json();

    const container = document.getElementById('shortsViewer');
    container.innerHTML = '';

    if (shorts.length === 0) {
      container.innerHTML = '<p style="color: gray;">Chưa có video nào.</p>';
      return;
    }

    shorts.forEach(short => renderShort(short, false));


    setupAutoPlay();
  } catch (err) {
    console.error('❌ Lỗi khi lấy video:', err);
  }
}

// Tự động phát video khi hiện trong khung nhìn
function setupAutoPlay() {
  const options = {
    threshold: 0.9
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, options);

  document.querySelectorAll('.short-video video').forEach(video => {
    observer.observe(video);
  });
}

// Xử lý upload video
function handleUpload() {
  const form = document.getElementById('uploadForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const videoFile = document.getElementById('videoInput').files[0];
    const caption = document.getElementById('captionInput').value;

    if (!videoFile) {
      alert('Vui lòng chọn video!');
      return;
    }

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('caption', caption);

    try {
      const res = await authFetch('/api/shorts', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Upload thất bại');
      }

      const newVideo = await res.json();
      alert('Đăng video thành công!');
      form.reset();
      fetchShorts(); // Load lại danh sách
    } catch (err) {
      console.error('❌ Upload thất bại:', err);
      alert(`Lỗi: ${err.message}`);
    }
    const fileInput = document.getElementById('videoInput');
const fileLabel = document.querySelector('.custom-file-upload');

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    fileLabel.innerHTML = `<i class="ph ph-camera"></i> ${fileInput.files[0].name}`;
  } else {
    fileLabel.innerHTML = `<i class="ph ph-camera"></i>`;
  }
});

  });
}


//
// Nút điều hướng
document.getElementById('searchBtn').addEventListener('click', () => {
    window.location.href = 'search.html';
  });
  document.getElementById('homeBtn').addEventListener('click', () => {
    window.location.href = 'home.html';
  });
  document.getElementById('createBtn').addEventListener('click', () => {
    window.location.href = 'create.html';
  });
  document.getElementById('heartBtn').addEventListener('click', () => {
    window.location.href = 'like.html';
  });
  document.getElementById('profileBtn').addEventListener('click', () => {
    window.location.href = 'profile.html';
  });
  
  // Hàm đăng xuất
  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "auth.html";
  }
  
  // Giao diện menu + theme
  document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const menuPopup = document.getElementById('menuPopup');
    const overlay = document.getElementById('menuOverlay');
  
    const currentPage = 'shorts';
  
    const pages = [
      { name: 'Trang chủ', href: 'home.html', id: 'home' },
      { name: 'Hồ sơ', href: 'profile.html', id: 'profile' },
      { name: 'Tìm kiếm', href: 'search.html', id: 'search' },
      { name: 'Đăng bài', href: 'create.html', id: 'create' },
      { name: 'Bài đã thích', href: 'like.html', id: 'like' },
    ];
  
    // Tạo lại menu popup
    menuPopup.innerHTML = '';
    pages.forEach(page => {
      if (page.id !== currentPage) {
        const btn = document.createElement('button');
        btn.textContent = page.name;
        btn.onclick = () => window.location.href = page.href;
        menuPopup.appendChild(btn);
      }
    });
  
    // Mở/đóng menu popup
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
    themeToggleBtn.textContent = currentTheme === 'dark' ? '🌕' : '🌑';
  
    themeToggleBtn.onclick = () => {
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      document.body.setAttribute('data-theme', newTheme);
      themeToggleBtn.textContent = newTheme === 'dark' ? '🌕' : '🌑';
      currentTheme = newTheme;
    };
  
    menuPopup.appendChild(themeToggleBtn);
  });
  


// socket
function renderShort(short, appendToTop = true) {
  const container = document.getElementById('shortsViewer');

  const videoWrapper = document.createElement('div');
  videoWrapper.className = 'short-video';

  const createdDate = new Date(short.created_at);
  const createdText = createdDate.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  videoWrapper.innerHTML = `
    <video src="${short.video_url}" controls muted preload="metadata"></video>
    <div class="short-info">
      <div class="username">@${short.username}</div>
      <div class="created-at">Đã đăng vào ${createdText}</div>
      <div class="caption">${short.caption || ''}</div>
    </div>
  `;

  const separator = document.createElement('hr');
  separator.className = 'video-separator';

  if (appendToTop) {
    container.prepend(separator);
    container.prepend(videoWrapper);
  } else {
    container.appendChild(videoWrapper);
    container.appendChild(separator);
  }

  // Đảm bảo autoplay được áp dụng
  setupAutoPlay();
}
