export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username) => {
  return username && username.length >= 3 && username.length <= 30;
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateHost = (host) => {
  const hostRegex = /^[a-zA-Z0-9.-]+$/;
  return host && hostRegex.test(host);
};

export const validatePort = (port) => {
  const portNum = parseInt(port, 10);
  return portNum >= 1 && portNum <= 65535;
};

export const validateDatabaseName = (name) => {
  const nameRegex = /^[a-zA-Z0-9_-]+$/;
  return name && nameRegex.test(name);
};

