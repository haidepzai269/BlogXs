import { applyTheme, loadThemeFromLocalStorage } from './theme.js';

function showToast(message, options = {}) {
  const {
    icon = '🔔',
    duration = 4000,
    bgColor = '#323232',
    textColor = '#fff'
  } = options;

  const toastContainer = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.backgroundColor = bgColor;
  toast.style.color = textColor;

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    <span class="toast-close">&times;</span>
  `;

  toast.querySelector('.toast-close').onclick = () => removeToast(toast);

  toastContainer.appendChild(toast);

  setTimeout(() => removeToast(toast), duration);
}

function removeToast(toast) {
  toast.style.animation = 'slideOut 0.4s forwards';
  setTimeout(() => {
    toast.remove();
  }, 400);
}


document.addEventListener('DOMContentLoaded', async () => {
  const currentTheme = loadThemeFromLocalStorage();
  // áp dụng theme local trước
  applyTheme(currentTheme || 'dark');
  const postsContainer = document.getElementById('postsContainer');
  const menuToggle = document.getElementById('menuToggle');
  const menuPopup = document.getElementById('menuPopup');
  const overlay = document.getElementById('menuOverlay');
  const popup = document.getElementById('userPopup');
  // 👉 THÊM Ở ĐÂY:
  setInterval(fetchNotifications, 1000); // mỗi 1 giây

  async function fetchNotifications() {
    try {
      const res = await authFetch('/api/notify');
      const notifies = await res.json();
  
      // Dùng bộ nhớ tạm để không lặp lại popup cũ
      if (!window.shownNotifications) window.shownNotifications = new Set();
  
      if (notifies.length > 0) {
        const latestNotify = notifies.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      
        if (!window.shownNotifications.has(latestNotify.id)) {
          showPopup(latestNotify.content);
          window.shownNotifications.add(latestNotify.id);
        }
      }      
    } catch (err) {
      console.error('Không thể lấy thông báo:', err);
    }
  }
  
  function showPopup(msg) {
    showToast(msg, { icon: '📢', bgColor: '#444' });
  }
  
  


  postsContainer.innerHTML = generateSkeletons(3);

  try {
    const [postsRes, likedRes, , likeCountRes] = await Promise.all([
      authFetch('/api/posts'),
      authFetch('/api/posts/liked'),
      authFetch('/api/notify'), // giữ nguyên để fetch thông báo
      authFetch('/api/likes/count'),
    ]);
    
    const likeCountsRaw = await likeCountRes.json();
    // Convert array to map: { postId: count }
    const likeCounts = {};
    likeCountsRaw.forEach(item => {
      likeCounts[item.post_id] = parseInt(item.like_count);
    });

    if (!postsRes.ok || !likedRes.ok)
      throw new Error('Không lấy được dữ liệu bài viết hoặc like');

    const posts = await postsRes.json();
    const likedData = await likedRes.json();
    const likedPostIds = likedData.likedPosts.map(p => p.post_id);

    
    postsContainer.innerHTML = '';

    for (const post of posts) {
      const liked = likedPostIds.includes(post.id);
      const postEl = document.createElement('div');
      postEl.className = 'post';
      const count = likeCounts[post.id] || 0;
      postEl.innerHTML = `
      <span class="username">@${post.username}</span>
      <p class="content-text">${post.content}</p>
      <div class="post-footer">
        <button class="like-btn ${liked ? 'liked' : ''}" data-post-id="${post.id}">
          ${liked ? '❤️' : '🤍'}
        </button>
        <span class="like-count">${count} lượt thích</span>
        <span class="time">${new Date(post.created_at).toLocaleString()}</span>
      </div>
    `;
    
    
      // Bình luận
      const commentsContainer = document.createElement('div');
      commentsContainer.className = 'comments-container';
    
      const commentForm = document.createElement('form');
      commentForm.className = 'comment-form';
      commentForm.innerHTML = `
        <input type="text" placeholder="Viết bình luận..." class="comment-input" />
        <button class="commentBtn" type="submit" aria-label="Gửi bình luận">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#ccc" viewBox="0 0 24 24">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
            </svg>
        </button>

      `;
    
      commentsContainer.appendChild(commentForm);
      postEl.appendChild(commentsContainer);
    
      // 🛠 Fetch bình luận — await OK ở đây
      const fetchComments = async () => {
        try {
          const res = await authFetch(`/api/comments/${post.id}`);
          if (!res.ok) throw new Error('Lỗi lấy bình luận');
          const comments = await res.json();
      
          const commentList = document.createElement('div');
          commentList.classList.add('comment-list');
      
          const isLong = comments.length >= 5;
          let expanded = false;
      
          function renderComments(collapsed = true) {
            commentList.innerHTML = '';
            const commentsToShow = collapsed ? comments.slice(0, 3) : comments;
            commentsToShow.forEach(c => {
              const div = document.createElement('div');
              div.className = 'comment';
              div.innerHTML = `<span class="comment-user">@${c.username}</span>: 
                               <span class="comment-content">${c.content}</span>`;
              commentList.appendChild(div);
            });
      
            commentList.classList.remove('collapsed', 'expanded');
            commentList.classList.add(collapsed ? 'collapsed' : 'expanded');
          }
      
          renderComments(true);
          commentsContainer.appendChild(commentList);
      
          if (isLong) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'view-more-btn';
            toggleBtn.textContent = 'Xem thêm bình luận';
      
            toggleBtn.addEventListener('click', () => {
              expanded = !expanded;
              renderComments(!expanded);
              toggleBtn.textContent = expanded ? 'Thu gọn bình luận' : 'Xem thêm bình luận';
              if (!expanded) {
                commentList.scrollTop = 0;
              }
            });
      
            commentsContainer.appendChild(toggleBtn);
          }
        } catch (err) {
          console.error(err.message);
        }
      };      
      await fetchComments();
    
      // Gửi bình luận
      commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = commentForm.querySelector('.comment-input');
        const content = input.value.trim();
        if (!content) return;
    
        try {
          const res = await authFetch(`/api/comments/${post.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
          });
          if (!res.ok) throw new Error('Không thể gửi bình luận');
          input.value = '';
          commentsContainer.querySelector('.comment-list')?.remove();
          await fetchComments();
        } catch (err) {
          console.error(err.message);
          alert('Không gửi được bình luận');
        }
      });
    
      // Like
      const likeBtn = postEl.querySelector('.like-btn');
      likeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const btn = e.currentTarget;
        const postId = btn.dataset.postId;
        const liked = btn.classList.contains('liked');
    
        try {
          if (liked) {
            const res = await authFetch(`/api/posts/${postId}/like`, {
              method: 'DELETE',
            });
            if (!res.ok) throw new Error('Không unlike được');
            btn.classList.remove('liked');
            btn.textContent = '🤍';
          } else {
            const res = await authFetch(`/api/posts/${postId}/like`, {
              method: 'POST',
            });
            if (!res.ok) throw new Error('Không like được');
            btn.classList.add('liked');
            btn.textContent = '❤️';
          }
        } catch (err) {
          console.error('❌ Lỗi khi like/unlike:', err.message);
          alert('Không thể thực hiện hành động. Vui lòng thử lại!');
        }
      });
    
      // Hover popup
      const usernameSpan = postEl.querySelector('.username');
      usernameSpan.addEventListener('click', async (e) => {
        e.stopPropagation();
        const username = post.username;
    
        try {
          const res = await authFetch(`/api/users/hover/${username}`);
          if (!res.ok) throw new Error('Không lấy được thông tin người dùng');
          const data = await res.json();
    
          popup.innerHTML = `
            <div class="cover" style="background-image: url('${data.cover_url || ''}')"></div>
            <img class="avatar" src="${data.avatar_url || ''}" />
            <div class="username">@${data.username}</div>
            <div style="margin: 0 10px 10px; color: #ccc; font-size: 13px;">
              đã tham gia BlogXs vào ${new Date(data.created_at).toLocaleDateString('vi-VN')}
            </div>
          `;
    
          const rect = usernameSpan.getBoundingClientRect();
          popup.style.top = `${window.scrollY + rect.bottom + 8}px`;
          popup.style.left = `${window.scrollX + rect.left}px`;
          popup.style.display = 'block';
        } catch (err) {
          console.error('❌ Lỗi popup:', err.message);
        }
      });
    
      postsContainer.appendChild(postEl);
    }
    

    // Ẩn popup khi click ra ngoài (đặt ngoài vòng forEach)
    document.addEventListener('click', (e) => {
      if (
        !e.target.closest('.user-popup') &&
        !e.target.classList.contains('username')
      ) {
        popup.style.display = 'none';
      }
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
  document.getElementById('shortBtn').addEventListener('click', () => {
    window.location.href = 'shorts.html';
  });
  
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
// Nút chuyển theme
// Nút chuyển theme
const themeToggleBtn = document.createElement('button');
themeToggleBtn.id = 'themeToggleBtn';

let selectedTheme = document.body.dataset.theme || 'dark';
themeToggleBtn.textContent = selectedTheme === 'dark' ? '🌕' : '🌑';

themeToggleBtn.onclick = () => {
  const newTheme = selectedTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
  selectedTheme = newTheme; // cập nhật lại biến
  themeToggleBtn.textContent = newTheme === 'dark' ? '🌕' : '🌑';
};




menuPopup.appendChild(themeToggleBtn);

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



function updateTime() {
  const now = new Date();
  const formatted = now.toLocaleString("vi-VN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  document.getElementById("currentTime").textContent = formatted;
}

// Gọi mỗi giây
setInterval(updateTime, 1000);
updateTime(); // Gọi lần đầu để hiển thị ngay


// Css
function getCurrentHour() {
  return new Date().getHours();
}

function startGradientEffect() {
  const canvas = document.getElementById('backgroundEffect');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let hue = 0;

  function drawGradient() {
    hue += 0.2;
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, `hsl(${hue}, 70%, 15%)`);
    gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 70%, 10%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(drawGradient);
  }

  drawGradient();
}

function startFogEffect() {
  const canvas = document.getElementById('backgroundEffect');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const fogs = Array.from({ length: 20 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 100 + 80,
    speed: Math.random() * 0.5 + 0.1,
    alpha: Math.random() * 0.1 + 0.03
  }));

  function drawFog() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fogs.forEach(fog => {
      ctx.beginPath();
      ctx.arc(fog.x, fog.y, fog.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${fog.alpha})`;
      ctx.fill();
      fog.x += fog.speed;
      if (fog.x - fog.radius > canvas.width) {
        fog.x = -fog.radius;
        fog.y = Math.random() * canvas.height;
      }
    });
    requestAnimationFrame(drawFog);
  }

  drawFog();
}

document.addEventListener("DOMContentLoaded", () => {
  const hour = new Date().getHours();
  const audio = document.getElementById("backgroundMusic");

  // Gán src nhạc theo giờ
  if (hour >= 6 && hour < 18) {
    audio.src = "/audio/day.mp3";
  } else {
    audio.src = "/audio/night.mp3";
  }

  audio.load();

  // Phát nhạc khi click đầu tiên
  document.body.addEventListener("click", () => {
    if (audio.src) {
      audio.volume = 0.3;
      audio.play().catch(err => console.log("Phát nhạc bị chặn:", err));
    }
  }, { once: true });

  // Toggle button
  const toggleBtn = document.getElementById("toggleMusicBtn");
  toggleBtn.addEventListener("click", () => {
    if (!audio.src) {
      console.warn("Không có file âm thanh để phát.");
      return;
    }

    if (audio.paused) {
      audio.play();
      toggleBtn.innerText = "🔊";
    } else {
      audio.pause();
      toggleBtn.innerText = "🔇";
    }
  });
    // 🎨 Hiệu ứng nền theo giờ
    if (hour >= 6 && hour < 18) {
      startGradientEffect();
    } else {
      startFogEffect();
    }
});

