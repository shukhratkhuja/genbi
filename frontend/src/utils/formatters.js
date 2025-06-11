export const formatExecutionTime = (timeMs) => {
  if (timeMs < 1000) {
    return `${timeMs.toFixed(2)}ms`;
  }
  return `${(timeMs / 1000).toFixed(2)}s`;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num);
};

export const formatPercent = (num) => {
  return `${num.toFixed(1)}%`;
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

export const formatDateShort = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};
