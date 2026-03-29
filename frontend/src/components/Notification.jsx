import { useCart } from '../context/CartContext';

export default function Notification() {
  const { notification } = useCart();
  if (!notification) return null;

  return (
    <div className={`notification notification-${notification.type}`}>
      {notification.type === 'success' ? '✅' : '❌'} {notification.message}
    </div>
  );
}
