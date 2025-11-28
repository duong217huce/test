let toastCallback = null;

export const registerToast = (callback) => {
  toastCallback = callback;
};

export const showToast = (message, type = 'info') => {
  if (toastCallback) {
    toastCallback(message, type);
  } else {
    console.warn('Toast not registered yet');
  }
};
