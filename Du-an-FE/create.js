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
function logout() {
    localStorage.clear();
    window.location.href = 'auth.html';
  }


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
  });
  