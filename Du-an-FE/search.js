document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const postsContainer = document.getElementById('postsContainer');

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
          <p>${post.content}</p>
          <small>${new Date(post.created_at).toLocaleString()}</small>
        `;
        postsContainer.appendChild(postEl);
      });
    } catch (err) {
      console.error('❌ Lỗi:', err.message);
    }
  });
});
function goToProfile() {
  window.location.href = 'profile.html';
}
document.getElementById('createBtn').addEventListener('click', () => {
  window.location.href = 'create.html';
});
document.getElementById('heartBtn').addEventListener('click', () => {
  window.location.href = 'like.html';
});



document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const menuPopup = document.getElementById('menuPopup');
  const overlay = document.getElementById('menuOverlay');

  const currentPage = window.location.pathname.includes('home')
    ? 'home'
    : window.location.pathname.includes('search')
    ? 'search'
    : window.location.pathname.includes('profile')
    ? 'profile'
    : 'create';

  const pages = [
    { name: 'Trang chủ', href: 'home.html', id: 'home' },
    { name: 'Hồ sơ', href: 'profile.html', id: 'profile' },
    { name: 'Tìm kiếm', href: 'search.html', id: 'search' },
    { name: 'Đăng bài', href: 'create.html', id: 'create' },
    { name: 'Bài đã thích', href: 'like.html', id: 'like' },
  ];

  // Xóa cũ, tạo nút mới
  menuPopup.innerHTML = '';
  pages.forEach(page => {
    if (page.id !== currentPage) {
      const btn = document.createElement('button');
      btn.textContent = page.name;
      btn.onclick = () => window.location.href = page.href;
      menuPopup.appendChild(btn);
    }
  });

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
});




document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const container = searchInput.closest('.ripple-container');

  container.addEventListener('click', function (e) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';

    const rect = container.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;

    container.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
});
