import { applyTheme, loadThemeFromLocalStorage } from './theme.js';
import { initI18n } from './i18n.js';
document.addEventListener('DOMContentLoaded', () => {
  const showEffect = sessionStorage.getItem('justLoggedIn');
  const svgContainer = document.getElementById('loginEffectSVG');
  const canvas = document.getElementById('particlesCanvas');
  const overlay = document.getElementById('loginOverlay');

  if (showEffect && svgContainer && canvas && overlay) {
    svgContainer.classList.remove('hidden');
    overlay.classList.remove('hidden');
    canvas.classList.add('hidden');

    // Sau khi SVG chữ vẽ xong thì vỡ sáng
    setTimeout(() => {
      svgContainer.style.opacity = '0';
      triggerParticleBurst(canvas);

      // Ẩn overlay mờ sau hiệu ứng
      setTimeout(() => {
        overlay.classList.add('hidden');
        svgContainer.classList.add('hidden'); // ẩn hẳn SVG
      }, 1500); // sau khi nổ hạt
    }, 3500);

    // Xoá cờ
    sessionStorage.removeItem('justLoggedIn');
  }
});


// =====================
// 🎆 Hàm tạo hiệu ứng tia sáng
// =====================
function triggerParticleBurst(canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.remove('hidden');
  const ctx = canvas.getContext('2d');

  const particles = [];

  for (let i = 0; i < 80; i++) {
    particles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 - 60,
      radius: Math.random() * 3 + 2,
      color: `hsl(${Math.random() * 360}, 100%, 70%)`,
      angle: Math.random() * 2 * Math.PI,
      speed: Math.random() * 5 + 2,
      alpha: 1
    });
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed;
      p.alpha -= 0.02;
      ctx.beginPath();
      ctx.globalAlpha = Math.max(p.alpha, 0);
      ctx.fillStyle = p.color;
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    if (particles.some(p => p.alpha > 0)) {
      requestAnimationFrame(animate);
    } else {
      canvas.classList.add('hidden');
    }
  };

  animate();
}





const socket = io(); // auto lấy host hiện tại (nếu backend chạy cùng domain)
const currentUserId = localStorage.getItem('userId'); // hoặc cách bạn lấy ID người dùng
console.log("🧠 currentUserId từ localStorage:", currentUserId);
socket.on('connect', () => {
  console.log("🔌 Socket connected:", socket.id);
  console.log("📨 Gửi sự kiện join với userId:", currentUserId);
  if (currentUserId) {
    socket.emit('join', currentUserId);
  }
});
document.addEventListener("DOMContentLoaded", () => {
  window.notificationCount = document.querySelector('#notificationCount');
  window.notificationPopup = document.querySelector('#notificationPopup');
  fetchNotifications();
});




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
  setInterval(pollNotifyPopup, 1000); // mỗi 1 giây

  async function pollNotifyPopup() {
    try {
      const res = await authFetch('/api/notify');
      const notifies = await res.json();
      console.log("📬 Thông báo nhận được:", notifies); // 👈 THÊM DÒNG NÀY
  
      if (!window.shownNotifications) window.shownNotifications = new Set();
  
      if (notifies.length > 0) {
        const latestNotify = notifies.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      
        if (!window.shownNotifications.has(latestNotify.id)) {
          console.log("🔔 Gọi showPopup với nội dung:", latestNotify.content); // 👈 THÊM DÒNG NÀY
          showPopup(latestNotify.content);
          window.shownNotifications.add(latestNotify.id);
        }
      }
    } catch (err) {
      console.error('Không thể lấy thông báo:', err);
    }
  }
  
  
  function showPopup(msg) {
    console.log("📢 showPopup đang chạy với message:", msg); // thêm dòng này
    showToast(msg, { icon: '📢', bgColor: '#444' });
  }
  
  
  


  postsContainer.innerHTML = generateSkeletons(3);

  try {
    const [postsRes, likedRes, , likeCountRes] = await Promise.all([
      authFetch('/api/posts'),
      authFetch('/api/posts/liked'),
      authFetch('/api/notify'), // giữ nguyên để fetch thông báo
      authFetch('/api/likes/count'),
      authFetch('/api/notify'), // giữ nguyên để fetch thông báo

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

function attachLikeHandler(likeBtn) {
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
}

socket.on('new_post', (post) => {
  prependPost(post);
});

// Hàm thêm bài viết vào đầu trang
function prependPost(post) {
  const postsContainer = document.getElementById('postsContainer');
  const postEl = document.createElement('div');
  postEl.className = 'post';

  postEl.innerHTML = `
    <span class="username">@${post.username}</span>
    <p class="content-text">${post.content}</p>
    <div class="post-footer">
      <button class="like-btn" data-post-id="${post.id}">🤍</button>
      <span class="like-count">0 lượt thích</span>
      <span class="time">${new Date(post.created_at).toLocaleString()}</span>
    </div>
  `;

  const likeBtn = postEl.querySelector('.like-btn'); // ✅ move here
  attachLikeHandler(likeBtn);

  postsContainer.prepend(postEl);
}



// comment io
socket.on('new_comment', (comment) => {
  const { post_id, username, content } = comment;
  
  // Tìm post tương ứng trong DOM
  const postEls = document.querySelectorAll('.post');
  postEls.forEach(postEl => {
    const likeBtn = postEl.querySelector('.like-btn');
    if (!likeBtn) return;
    const postId = parseInt(likeBtn.dataset.postId);

    if (postId === post_id) {
      const commentList = postEl.querySelector('.comment-list');
      if (commentList) {
        const div = document.createElement('div');
        div.className = 'comment';
        div.innerHTML = `<span class="comment-user">@${username}</span>: 
                         <span class="comment-content">${content}</span>`;
        commentList.appendChild(div);

        // Scroll to bottom nếu đang mở
        if (commentList.classList.contains('expanded')) {
          commentList.scrollTop = commentList.scrollHeight;
        }
      }
    }
  });
});
socket.on('like_updated', ({ postId, likeCount }) => {
  const postEls = document.querySelectorAll('.post');
  postEls.forEach(postEl => {
    const likeBtn = postEl.querySelector('.like-btn');
    if (!likeBtn) return;

    const btnPostId = parseInt(likeBtn.dataset.postId);
    if (btnPostId === postId) {
      const countEl = postEl.querySelector('.like-count');
      if (countEl) {
        countEl.textContent = `${likeCount} lượt thích`;
      }
    }
  });
});



socket.on('connect', () => {
  if (currentUserId) {
    console.log("📡 Emit join room với userId:", currentUserId);
    socket.emit('join', currentUserId);
  }
});









const notificationBtn = document.getElementById("notificationBtn");
const notificationPopup = document.getElementById("notificationPopup");
const notificationCount = document.getElementById("notificationCount");

let notifications = [];

notificationBtn.addEventListener("click", () => {
  notificationPopup.style.display = notificationPopup.style.display === "none" ? "block" : "none";

  if (notifications.some(n => !n.is_read)) {
    markAllNotificationsAsRead();
  }
})  

async function fetchNotifications() {
  try {
    const res = await authFetch("/api/notification");
    const data = await res.json();
    notifications = data.notifications; // ✅ Lấy mảng thông báo đúng
    renderNotifications();
  } catch (err) {
    console.error("Lỗi khi lấy thông báo", err);
  }
}


function renderNotifications() {
  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (unreadCount > 0) {
    notificationCount.style.display = "inline-block";
    notificationCount.innerText = unreadCount;
  } else {
    notificationCount.style.display = "none";
  }

  // Nếu không có thông báo
  if (notifications.length === 0) {
    notificationPopup.innerHTML = `
      <div class="empty-message">Không có thông báo mới</div>
    `;
    return;
  }

  // Có thông báo → render danh sách
  notificationPopup.innerHTML = notifications.map(n => `
    <div class="notification-item ${n.is_read ? "" : "unread"}">
      <div class="notification-content">
        🔥 <span class="sender-name">${n.sender_username || "Ai đó"}</span> đã thích bài viết "${n.post ?? '[Không có nội dung]'}" của bạn
      </div>
      <button class="delete-btn" data-id="${n.id}">X</button> 
    </div>
  `).join("");

  // Gán sự kiện xoá
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = e.currentTarget.dataset.id;

      try {
        const res = await authFetch(`/api/notification/${id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          notifications = notifications.filter(n => n.id !== parseInt(id));
          renderNotifications();
        } else {
          console.error('❌ Không thể xóa thông báo:', res.status);
        }
      } catch (err) {
        console.error('❌ Lỗi khi gọi authFetch để xóa:', err);
      }
    });
  });
}



async function markAllNotificationsAsRead() {
  try {
    await authFetch("/api/notification/read", { method: "PUT" });
    notifications = notifications.map(n => ({ ...n, is_read: true }));
    renderNotifications();
  } catch (err) {
    console.error("Lỗi khi đánh dấu đã đọc", err);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  fetchNotifications();
});

socket.on("new-like-notification", async (noti) => {
  try {
    console.log("📥 Nhận thông báo mới:", noti);
    
    // Gọi lại API để đảm bảo luôn đúng định dạng
    await fetchNotifications(); // Gọi lại renderNotifications() bên trong
  } catch (e) {
    console.error("❌ Lỗi xử lý notify:", e);
  }
  await fetchNotifications();
});


function showToast(message, options = {}) {
  const {
    icon = '🔔',
    duration = 6000,
    bgColor = 'rgba(50, 50, 50, 0.6)', // nền bán trong suốt
    textColor = '#fff'
  } = options;

  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    Object.assign(container.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: '9999',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    });
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'modern-toast';
  toast.innerHTML = `
    <div class="toast-body">
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
    </div>
  `;

  Object.assign(toast.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: bgColor,
    color: textColor,
    padding: '10px 16px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    fontSize: '14px',
    maxWidth: '300px',
    opacity: '0',
    transform: 'translateY(-10px)',
    transition: 'opacity 0.4s ease, transform 0.4s ease',
  });

  container.appendChild(toast);

  // Icon style
  toast.querySelector('.toast-icon').style.fontSize = '18px';
  toast.querySelector('.toast-message').style.flex = '1';

  // Animate IN (trượt từ trên xuống)
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 50); // delay nhỏ để mượt hơn

  // Auto remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}


// ==== Load ngôn ngữ từ file lang/{lang}.json và cập nhật DOM ====
window.addEventListener('DOMContentLoaded', () => {
  initI18n();
});