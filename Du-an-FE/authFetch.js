async function authFetch(url, options = {}) {
  const accessToken = localStorage.getItem('accessToken');

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });

  if (res.status === 401) {
    const refreshRes = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!refreshRes.ok) {
      localStorage.clear();
      window.location.href = '/auth.html';
      return;
    }

    const data = await refreshRes.json();
    localStorage.setItem('accessToken', data.accessToken);

    return await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${data.accessToken}`,
      },
      credentials: 'include',
    });
  }

  return res;
}
