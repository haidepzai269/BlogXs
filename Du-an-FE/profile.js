// Hàm applyTheme như search.js
function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.textContent = theme === 'light' ? '🌙 Chế độ tối' : '🌞 Chế độ sáng';
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("profileForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const emailInput = document.getElementById("email");
  const editBtn = document.querySelector(".edit-btn");
  const cancelBtn = document.getElementById("cancelEdit");
  const userPostsContainer = document.getElementById("userPosts");
  const formSection = document.querySelector(".profile-form");
  const overlay = document.getElementById("overlay");

  const avatarImage = document.getElementById("avatarImage");
  const avatarFullscreen = document.getElementById("avatarFullscreen");
  const avatarInput = document.getElementById("avatarInput");
  const coverInput = document.getElementById("coverInput");
  const bannerImage = document.getElementById("bannerImage");

  formSection.style.display = "none";



  // Khi chọn ảnh avatar
  avatarInput.addEventListener("change", async () => {
    const file = avatarInput.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("avatar", file); // ⚠️ Phải trùng với multer.single("avatar")
  
    try {
      const res = await authFetch("/api/profile/avatar", {
        method: "PUT",
        body: formData,
      });
  
      const data = await res.json(); // Nếu backend trả lỗi HTML thì chỗ này sẽ lỗi
  
      if (res.ok) {
        avatarImg.src = data.avatarUrl;
      } else {
        console.error("❌ Cập nhật thất bại", data.message);
      }
    } catch (err) {
      console.error("❌ Lỗi upload ảnh đại diện:", err);
    }
  });
  
  
  coverInput.addEventListener("change", async () => {
    const file = coverInput.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("cover", file);
  
    try {
      const res = await authFetch("/api/profile/cover", {
        method: "PUT",
        body: formData,
      });
  
      const data = await res.json();
      if (res.ok) {
        document.getElementById("bannerImg").src = data.cover_url;
        localStorage.setItem("coverImage", data.cover_url);
      } else {
        console.error(data.error);
        alert("❌ Không thể cập nhật ảnh bìa");
      }
    } catch (err) {
      console.error("❌ Lỗi upload ảnh bìa:", err);
    }
  });
  

  // Hiệu ứng xem avatar



  const fetchProfile = async () => {
    try {
      const res = await authFetch("/api/user/profile");
      if (!res.ok) throw new Error("Lỗi lấy thông tin người dùng");
  
      const data = await res.json(); // 👉 Phải lấy JSON trước mới dùng
  
      usernameInput.value = data.username || "";
      emailInput.value = data.email || "";
  
      document.querySelector(".name").textContent = data.username;
      document.querySelector(".username").textContent = `@${data.username.toLowerCase()}`;
  
      if (data.avatar_url) {
        document.getElementById("avatarImg").src = data.avatar_url;
      }
  
      if (data.cover_url) {
        document.getElementById("bannerImg").src = data.cover_url;
      }
  
    } catch (err) {
      console.error("❌ Lỗi lấy thông tin người dùng:", err);
    }
  };
  

  const fetchUserPosts = async () => {
    try {
      const res = await authFetch("/api/posts/me");
      if (!res.ok) throw new Error("Lỗi lấy bài đăng");
      const posts = await res.json();
  
      userPostsContainer.innerHTML = "";
      posts.forEach(post => {
        const postEl = document.createElement("div");
        postEl.className = "post";
        postEl.innerHTML = `
          <button class="delete-post-btn" data-id="${post.id}">🗑 Xoá</button>
          <p class="users"><strong>${post.username}</strong></p>
          <p class="contents">${post.content}</p>
          <p><small>${new Date(post.created_at).toLocaleString()}</small></p>

        `;
        userPostsContainer.appendChild(postEl);
      });
  
      // Gán sự kiện click cho từng nút xoá
      document.querySelectorAll(".delete-post-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const postId = btn.dataset.id;
          const confirmed = confirm("Bạn có chắc muốn xoá bài này không?");
          if (!confirmed) return;
  
          try {
            const res = await authFetch(`/api/posts/${postId}`, {
              method: "DELETE"
            });
  
            if (!res.ok) throw new Error("Lỗi xoá bài");
  
            alert("✅ Đã xoá bài viết");
            await fetchUserPosts(); // Cập nhật lại danh sách
          } catch (err) {
            console.error("❌ Lỗi khi xoá:", err);
          }
        });
      });
    } catch (err) {
      console.error("❌ Lỗi hiển thị bài đăng:", err);
    }
  };
  

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        username: usernameInput.value,
        email: emailInput.value,
      };
      if (passwordInput.value) {
        updatedData.password = passwordInput.value;
      }

      const res = await authFetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error("Lỗi cập nhật");

      alert("✅ Cập nhật thành công!");
      formSection.style.display = "none";
      overlay.style.display = "none";
      await fetchProfile();
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err);
    }
  });

  cancelBtn.addEventListener("click", () => {
    formSection.style.display = "none";
    overlay.style.display = "none";
  });

  editBtn.addEventListener("click", () => {
    formSection.style.display = "block";
    overlay.style.display = "block";
  });

  await fetchProfile();
  await fetchUserPosts();
});

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
document.getElementById('shortBtn').addEventListener('click', () => {
  window.location.href = 'shorts.html';
});
// Hàm đăng xuất
function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.href = "auth.html";
}


document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const menuPopup = document.getElementById('menuPopup');
  const overlay = document.getElementById('menuOverlay');

  const currentPage = window.location.pathname.includes('profile')
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

  // Xóa cũ, tạo lại menu popup
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


//Hiệu ứng ảnh 
const avatarImg = document.getElementById("avatarImg");

// Hover avatar → hiện ảnh lớn
avatarImage.addEventListener("mouseenter", () => {
  avatarFullscreen.style.backgroundImage = `url(${avatarImg.src})`;
  avatarFullscreen.classList.add("active");
});

// Rời chuột khỏi avatar → ẩn ảnh lớn
avatarImage.addEventListener("mouseleave", () => {
  avatarFullscreen.classList.remove("active");
});
