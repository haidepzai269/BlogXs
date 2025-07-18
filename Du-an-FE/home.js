document.addEventListener('DOMContentLoaded', async () => {
  const postsContainer = document.getElementById('postsContainer');
  const menuToggle = document.getElementById('menuToggle');
  const menuPopup = document.getElementById('menuPopup');
  const overlay = document.getElementById('menuOverlay');

  if (!postsContainer) {
    console.error('❌ Không tìm thấy phần tử #postsContainer');
    return;
  }

  postsContainer.innerHTML = generateSkeletons(3);

  try {
    const [postsRes, likedRes] = await Promise.all([
      authFetch('/api/posts'),
      authFetch('/api/posts/liked'),
    ]);

    if (!postsRes.ok || !likedRes.ok)
      throw new Error('Không lấy được dữ liệu bài viết hoặc like');

    const posts = await postsRes.json();
    const likedData = await likedRes.json();
    const likedPostIds = likedData.likedPosts.map(p => p.post_id);

    postsContainer.innerHTML = '';

    posts.forEach(post => {
      const liked = likedPostIds.includes(post.id);
      const postEl = document.createElement('div');
      postEl.className = 'post';

      postEl.innerHTML = `
        <span class="username">@${post.username}</span>
        <p class="content-text">${post.content}</p>
        <div class="post-footer">
          <button class="like-btn ${liked ? 'liked' : ''}" data-post-id="${post.id}">
            ${liked ? '❤️' : '🤍'}
          </button>
          <span class="time">${new Date(post.created_at).toLocaleString()}</span>
        </div>
      `;

      const likeBtn = postEl.querySelector('.like-btn');

      likeBtn.addEventListener('click', async () => {
        const isLiked = likeBtn.classList.contains('liked');
        const url = `/api/posts/${post.id}/${isLiked ? 'unlike' : 'like'}`;
        const method = isLiked ? 'DELETE' : 'POST';

        try {
          const res = await authFetch(url, { method });
          if (!res.ok) throw new Error('Like/bỏ like thất bại');

          // Cập nhật giao diện
          likeBtn.classList.toggle('liked');
          likeBtn.textContent = isLiked ? '🤍' : '❤️';
        } catch (err) {
          console.error('❌ Lỗi khi like:', err.message);
        }
      });

      postsContainer.appendChild(postEl);
    });
  } catch (err) {
    postsContainer.innerHTML = `<p style="color:red;">${err.message}</p>`;
    console.error('❌ Lỗi hiển thị bài đăng:', err.message);
  }

  // ======= Sidebar navigation =======
  document.getElementById('searchBtn').addEventListener('click', () => {
    window.location.href = 'search.html';
  });

  document.getElementById('createBtn').addEventListener('click', () => {
    window.location.href = 'create.html';
  });

  document.getElementById('heartBtn').addEventListener('click', () => {
    window.location.href = 'like.html';
  });

  window.goToProfile = function () {
    window.location.href = 'profile.html';
  };

  // ======= Menu popup =======
  const currentPage = window.location.pathname.includes('home')
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

  menuPopup.innerHTML = '';
  pages.forEach(page => {
    if (page.id !== currentPage) {
      const btn = document.createElement('button');
      btn.textContent = page.name;
      btn.onclick = () => window.location.href = page.href;
      menuPopup.appendChild(btn);
    }
  });

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

// Skeleton loading
function generateSkeletons(count) {
  let skeletons = '';
  for (let i = 0; i < count; i++) {
    skeletons += `
      <div class="post skeleton">
        <div class="skeleton-line username"></div>
        <div class="skeleton-line content-text"></div>
        <div class="skeleton-line content-text short"></div>
        <div class="skeleton-line time"></div>
      </div>
    `;
  }
  return skeletons;
}
