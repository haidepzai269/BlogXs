// theme.js
export function applyTheme(theme) {
    document.body.dataset.theme = theme;
  
    if (theme === 'light') {
      document.body.style.backgroundColor = '#fff';
      document.body.style.color = '#000';
      const btn = document.getElementById('themeToggleBtn');
      if (btn) btn.textContent = '🌛 Chế độ tối';
    } else {
      document.body.style.backgroundColor = '#000';
      document.body.style.color = '#fff';
      const btn = document.getElementById('themeToggleBtn');
      if (btn) btn.textContent = '🌞 Chế độ sáng';
    }
  }
  
  export function loadThemeFromLocalStorage() {
    const theme = localStorage.getItem('theme') || 'dark';
    applyTheme(theme);
    return theme;
  }
  