// Helper functions để quản lý DP Points

export const getPoints = () => {
  return parseInt(localStorage.getItem('userPoints') || '0');
};

export const addPoints = (amount) => {
  const currentPoints = getPoints();
  const newPoints = currentPoints + amount;
  localStorage.setItem('userPoints', newPoints.toString());
  return newPoints;
};

export const deductPoints = (amount) => {
  const currentPoints = getPoints();
  if (currentPoints < amount) {
    return { success: false, message: 'Không đủ DP!' };
  }
  const newPoints = currentPoints - amount;
  localStorage.setItem('userPoints', newPoints.toString());
  return { success: true, newPoints };
};

export const hasEnoughPoints = (amount) => {
  return getPoints() >= amount;
};

// Document prices for future payment system
export const DOCUMENT_PRICES = {
  VIEW: 5,      // 5 DP để xem đầy đủ
  SAVE: 3,      // 3 DP để lưu
  DOWNLOAD: 10  // 10 DP để download
};
