// i18n.js

// Gán text tương ứng từ file JSON
export function applyTranslations(translations) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[key]) el.textContent = translations[key];
    });
  
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (translations[key]) el.title = translations[key];
    });
  }
  
  // Tải ngôn ngữ từ file lang/{lang}.json
  export async function loadLanguage(lang) {
    try {
      const res = await fetch(`lang/${lang}.json`);
      const translations = await res.json();
      applyTranslations(translations);
      localStorage.setItem('language', lang);
    } catch (err) {
      console.error('Lỗi tải ngôn ngữ:', err);
    }
  }
  
  // Lấy ngôn ngữ đã lưu hoặc mặc định là 'vi'
  export function getSavedLang() {
    return localStorage.getItem('language') || 'vi';
  }
  
  // Cập nhật ngôn ngữ vào localStorage
  export function setLang(lang) {
    localStorage.setItem('language', lang);
  }
  
  // Khởi tạo xử lý i18n và dropdown ngôn ngữ
  export function initI18n() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsDropdown = document.getElementById('settingsDropdown');
  
    // Toggle hiển thị dropdown
    settingsBtn?.addEventListener('click', () => {
      settingsDropdown?.classList.toggle('hidden');
    });
  
    // Ẩn dropdown khi click ra ngoài
    document.addEventListener('click', (e) => {
      if (
        settingsDropdown &&
        !settingsDropdown.contains(e.target) &&
        e.target !== settingsBtn
      ) {
        settingsDropdown.classList.add('hidden');
      }
    });
  
    // Click chọn ngôn ngữ
    document.querySelectorAll('.language-options button').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        loadLanguage(lang);
        settingsDropdown?.classList.add('hidden');
      });
    });
  
    // Tự động load ngôn ngữ khi trang được load
    const savedLang = getSavedLang();
    loadLanguage(savedLang);
  }
  