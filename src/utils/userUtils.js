// Hàm refresh thông tin user từ backend
export const refreshUserData = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No token found');
      return false;
    }

    const response = await fetch('http://localhost:5000/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const userData = await response.json();
      
      // Cập nhật localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('username', userData.username);
      localStorage.setItem('fullName', userData.fullName || '');
      // Coins is already in user object, no need to save separately
      
      console.log('✅ User data refreshed:', userData.username, '| Coins:', userData.coins);
      return true;
    } else {
      console.error('❌ Failed to refresh user data');
      return false;
    }
  } catch (error) {
    console.error('❌ Error refreshing user data:', error);
    return false;
  }
};