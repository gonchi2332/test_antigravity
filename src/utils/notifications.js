/**
 * Simple notification system to replace alert()
 * Uses browser's built-in notification or falls back to console
 */

let notificationContainer = null;

const createNotificationContainer = () => {
    if (typeof document === 'undefined') return null;
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(notificationContainer);
    }
    return notificationContainer;
};

const createNotificationElement = (message, type = 'success') => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    
    notification.style.cssText = `
        background-color: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        pointer-events: auto;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        font-size: 14px;
        line-height: 1.5;
    `;
    
    // Add animation keyframes if not already added
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    notification.textContent = message;
    
    return notification;
};

export const showNotification = (message, type = 'success', duration = 3000) => {
    // In development or if DOM is not available, fall back to console
    if (typeof document === 'undefined' || typeof window === 'undefined') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        return;
    }

    const container = createNotificationContainer();
    if (!container) {
        console.log(`[${type.toUpperCase()}] ${message}`);
        return;
    }

    const notification = createNotificationElement(message, type);
    container.appendChild(notification);

    // Auto remove after duration
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);

    // Allow manual dismiss on click
    notification.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
};

export const showSuccess = (message) => showNotification(message, 'success');
export const showError = (message) => showNotification(message, 'error', 5000);
export const showInfo = (message) => showNotification(message, 'info');

