const API_URL = '/api/user';

export const userService = {
  async getMe() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const res = await fetch(`${API_URL}/me`, {
      headers: { 'auth-token': token }
    });
    if (!res.ok) throw new Error('Failed to fetch user data');
    return res.json();
  },

  async toggleFavorite(animeId: number) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_URL}/favorite/${animeId}`, {
      method: 'POST',
      headers: { 'auth-token': token }
    });
    if (!res.ok) throw new Error('Failed to update favorite');
    return res.json();
  },

  async updateStatus(animeId: number, status: string, progress?: number) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_URL}/status/${animeId}`, {
      method: 'POST',
      headers: { 
        'auth-token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, progress })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  }
};
