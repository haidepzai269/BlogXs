import { applyTheme, loadThemeFromLocalStorage } from './theme.js';



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
      
      const usernameSpan = postEl.querySelector('.username');

      // Sự kiện click để hiện popup
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
    });

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

