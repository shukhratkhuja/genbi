export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDuration = (milliseconds) => {
  if (milliseconds < 1000) {
    return `${Math.round(milliseconds)}ms`;
  }
  return `${(milliseconds / 1000).toFixed(1)}s`;
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getConnectionStatusColor = (status) => {
  switch (status) {
    case 'connected':
      return 'text-green-600 bg-green-50';
    case 'failed':
      return 'text-red-600 bg-red-50';
    case 'pending':
      return 'text-yellow-600 bg-yellow-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateConnectionForm = (data) => {
  const errors = {};
  
  if (!data.name?.trim()) {
    errors.name = 'Connection name is required';
  }
  
  if (!data.db_type) {
    errors.db_type = 'Database type is required';
  }
  
  if (!data.host?.trim()) {
    errors.host = 'Host is required';
  }
  
  if (!data.port || isNaN(data.port) || data.port < 1 || data.port > 65535) {
    errors.port = 'Valid port number is required (1-65535)';
  }
  
  if (!data.username?.trim()) {
    errors.username = 'Username is required';
  }
  
  if (!data.password?.trim()) {
    errors.password = 'Password is required';
  }
  
  if (!data.database_name?.trim()) {
    errors.database_name = 'Database name is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (fallbackErr) {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
};