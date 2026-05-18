const PERMISSION_KEY = 'pushPermissionRequested';

export const isPushSupported = (): boolean =>
  typeof window !== 'undefined' && 'Notification' in window;

export const requestPushPermission = async (): Promise<NotificationPermission> => {
  if (!isPushSupported()) {
    return 'denied';
  }

  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission;
  }

  const alreadyRequested = localStorage.getItem(PERMISSION_KEY) === 'true';
  if (alreadyRequested) {
    return Notification.permission;
  }

  localStorage.setItem(PERMISSION_KEY, 'true');
  return Notification.requestPermission();
};

export const showDeviceNotification = (
  title: string,
  options?: NotificationOptions
): void => {
  if (!isPushSupported() || Notification.permission !== 'granted') {
    return;
  }

  try {
    new Notification(title, {
      icon: '/logo.png',
      badge: '/logo.png',
      ...options,
    });
  } catch {
    // Alguns navegadores exigem service worker; ignoramos falha silenciosa.
  }
};

export const registerWebPushToken = async (): Promise<string | null> => {
  await requestPushPermission();
  if (Notification.permission !== 'granted') {
    return null;
  }

  const token = `web-${crypto.randomUUID?.() || Date.now()}`;
  return token;
};
