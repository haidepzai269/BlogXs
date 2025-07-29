import { initI18n } from './i18n.js';



function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.textContent = theme === 'light' ? '🌑' : '🌕';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Áp dụng theme khi trang load
  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);

  // Setup các DOM khác
  const searchInput = document.getElementById('searchInput');
  const postsContainer = document.getElementById('postsContainer');
  const suggestionList = document.getElementById('suggestionList'); // <-- thêm dòng này

  // 👇 Gợi ý tìm kiếm
  searchInput.addEventListener('focus', async () => {
    try {
      const res = await fetch('/api/posts/popular-queries');
      const keywords = await res.json();
      console.log('👉 Gợi ý nhận được:', keywords); // 👈 Thêm dòng này
      console.log('📦 DOM suggestionList:', suggestionList);

      suggestionList.innerHTML = keywords.map(keyword =>
        `<li class="suggestion-item">${keyword}</li>`
      ).join('');
      suggestionList.style.display = 'block'; // 👈 Cái này rất quan trọng
    } catch (err) {
      console.error('❌ Lỗi tải gợi ý:', err.message);
    }
  });

  suggestionList.addEventListener('click', e => {
    if (e.target.classList.contains('suggestion-item')) {
      searchInput.value = e.target.textContent;
      searchInput.dispatchEvent(new Event('input'));
  
      // Thêm hiệu ứng biến mất mượt
      suggestionList.classList.add('hide');
      setTimeout(() => {
        suggestionList.style.display = 'none';
        suggestionList.classList.remove('hide'); // Reset để lần sau hiện lại mượt
      }, 300); // Phù hợp với transition 0.3s
    }
  });
  

  // Xử lý khi nhập từ khóa tìm kiếm
  searchInput.addEventListener('input', async () => {
    const query = searchInput.value.trim();
    if (query === '') return;

    try {
      const res = await authFetch(`/api/posts/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Lỗi tìm kiếm bài đăng');

      const posts = await res.json();
      postsContainer.innerHTML = '';

      posts.forEach(post => {
        const postEl = document.createElement('div');
        postEl.className = 'post';
        postEl.innerHTML = `
          <h3>@${post.username}</h3>
          <p class="contents">${post.content}</p>
          <small>${new Date(post.created_at).toLocaleString()}</small>
        `;
        postsContainer.appendChild(postEl);
      });

      window.fadeInPosts?.();
    } catch (err) {
      console.error('❌ Lỗi:', err.message);
    }
  });

  // Chuyển trang
  document.getElementById('createBtn').addEventListener('click', () => {
    window.location.href = 'create.html';
  });
  document.getElementById('heartBtn').addEventListener('click', () => {
    window.location.href = 'like.html';
  });
  document.getElementById('profileBtn').addEventListener('click', () => {
    window.location.href = 'profile.html';
  });
  document.getElementById('shortBtn').addEventListener('click', () => {
    window.location.href = 'shorts.html';
  });
  // Menu & Theme toggle
  const menuToggle = document.getElementById('menuToggle');
  const menuPopup = document.getElementById('menuPopup');
  const overlay = document.getElementById('menuOverlay');

  const pages = [
    { name: 'Trang chủ', href: 'home.html' },
    { name: 'Hồ sơ', href: 'profile.html' },
    { name: 'Tìm kiếm', href: 'search.html' },
    { name: 'Đăng bài', href: 'create.html' },
    { name: 'Bài đã thích', href: 'like.html' },
  ];

  menuPopup.innerHTML = '';
  pages.forEach(page => {
    const currentPage = window.location.pathname.includes(page.href);
    if (!currentPage) {
      const btn = document.createElement('button');
      btn.textContent = page.name;
      btn.onclick = () => window.location.href = page.href;
      menuPopup.appendChild(btn);
    }
  });

  // Nút chuyển theme
  const themeToggleBtn = document.createElement('button');
  themeToggleBtn.id = 'themeToggleBtn';
  themeToggleBtn.textContent = savedTheme === 'light' ?  '🌑' : '🌕';
  themeToggleBtn.onclick = () => {
    const currentTheme = document.body.dataset.theme || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  };
  menuPopup.appendChild(themeToggleBtn);

  // Toggle menu
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

  // Ripple effect
  const container = searchInput.closest('.ripple-container');
  container.addEventListener('click', function (e) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    const rect = container.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    container.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

document.addEventListener('click', (e) => {
  if (!suggestionList.contains(e.target) && e.target !== searchInput) {
    suggestionList.classList.add('hide');
    setTimeout(() => {
      suggestionList.style.display = 'none';
      suggestionList.classList.remove('hide');
    }, 300);
  }
});

window.addEventListener('DOMContentLoaded', () => {
  initI18n();
});