document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('likedPostsContainer');

  if (!container) {
    console.error('Không tìm thấy phần tử chứa bài đăng đã thích!');
    return;
  }

  try {
    // Gửi request để lấy các bài đã thích
    const res = await authFetch('/api/posts/liked');
    if (!res.ok) throw new Error('Không thể lấy danh sách bài đăng đã thích');

    const data = await res.json();

    // 👉 Nếu API trả về object: { likedPosts: [...] }, lấy mảng ra
    const likedPosts = data.likedPosts || [];

    // Nếu không có bài nào
    if (likedPosts.length === 0) {
      container.innerHTML = '<p>Chưa có bài đăng nào được thích.</p>';
      return;
    }

    // Hiển thị từng bài
    container.innerHTML = '';
    console.log('📦 likedPosts:', likedPosts);
// Lưu toàn bộ bài viết để lọc lại sau
window.allLikedPosts = likedPosts;

// Gắn sự kiện tìm kiếm
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', () => {
  const keyword = searchInput.value.trim().toLowerCase();

  // Lọc bài viết theo username, content hoặc created_at
  const filteredPosts = window.allLikedPosts.filter(post => {
    return (
      post.username.toLowerCase().includes(keyword) ||
      post.content.toLowerCase().includes(keyword) ||
      new Date(post.created_at).toLocaleString().toLowerCase().includes(keyword)
    );
  });

  // Xóa cũ và hiển thị lại
  container.innerHTML = '';
  if (filteredPosts.length === 0) {
    container.innerHTML = '<p>Không tìm thấy bài đăng nào phù hợp.</p>';
    return;
  }

  filteredPosts.forEach(post => {
    const postEl = document.createElement('div');
    postEl.classList.add('post');
    postEl.innerHTML = `
      <span class="username">@${post.username}</span>
      <p class="content-text">${post.content}</p>
      <div class="post-footer">
        <span class="time">${new Date(post.created_at).toLocaleString()}</span>
      </div>
    `;
    container.appendChild(postEl);
  });
});

    likedPosts.forEach(post => {
      const postEl = document.createElement('div');
      postEl.classList.add('post');
      postEl.innerHTML = `
        <span class="username">@${post.username}</span>
        <p class="content-text">${post.content}</p>
        <div class="post-footer">
          <span class="time">${new Date(post.created_at).toLocaleString()}</span>
        </div>
      `;
      container.appendChild(postEl);
    });    
  } catch (err) {
    console.error('Lỗi khi lấy bài đăng đã thích:', err);
    container.innerHTML = '<p>Đã xảy ra lỗi khi tải bài viết.</p>';
  }
});

// Điều hướng sang trang cá nhân
function goToProfile() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.id) {
    window.location.href = `profile.html?userId=${user.id}`;
  } else {
    alert('Không tìm thấy người dùng');
  }
}

// Đăng xuất
function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = 'auth.html';
}


document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const menuPopup = document.getElementById('menuPopup');
  const overlay = document.getElementById('menuOverlay');

  const currentPage = window.location.pathname.includes('like')
    ? 'like'
    : window.location.pathname.includes('profile')
    ? 'profile'
    : window.location.pathname.includes('home')
    ? 'home'
    : window.location.pathname.includes('search')
    ? 'search'
    : 'create';

  const pages = [
    { name: 'Trang chủ', href: 'home.html', id: 'home' },
    { name: 'Hồ sơ', href: 'profile.html', id: 'profile' },
    { name: 'Tìm kiếm', href: 'search.html', id: 'search' },
    { name: 'Đăng bài', href: 'create.html', id: 'create' },
    { name: 'Bài đã thích', href: 'like.html', id: 'like' },
  ];

  // Xoá cũ, tạo lại menu
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
});





// --- Xử lý placeholder động ---
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('searchInput');
  const placeholder = document.querySelector('.fake-placeholder');

  const togglePlaceholder = () => {
    if (input.value.trim() !== '') {
      placeholder.classList.add('hidden');
    } else {
      placeholder.classList.remove('hidden');
    }
  };

  input.addEventListener('input', togglePlaceholder);
  togglePlaceholder(); // chạy ngay từ đầu để đồng bộ trạng thái
});
