import { useEffect } from "react"
import './App.css';

const App = () => {

  const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY
  useEffect(() => {

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error(`Service worker registration failed: ${error}`);
        })
    } else {
      console.error("Service workers are not supported.");
    }

  }, [])

  const subscribeToNotifications = async () => {
    try {
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
        if (permission !== 'granted') {
          throw new Error('Notification permission denied');
        }
      }
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Unsubscribed existing subscription');
      }
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY,
      })

      const response = await fetch(`http://localhost:3000/subscribe`, {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = response.json();
      console.log('Subscription response:', data);
      console.log('Subscribed to push notifications');

      if('periodicSync' in registration) {
        try {
          
          await registration.periodicSync.register('send-notification-sync',{
            minInterval: 5000, 
          })
          console.log('Periodic background sync registered for send-notification');
        } catch (error) {
          console.error('Periodic background sync registration failed:', error);
          console.log('Falling back to service worker timer for browser closed scenario');
        }
      }else{
        console.log('Periodic Background Sync API not supported in this browser');
      }
    } catch (error) {
      console.error('Subscription failed:', error);
    }
  }

  return (
    <div className="App">
      <h1>Hello World</h1>
      <button onClick={subscribeToNotifications}>Enable Notifications</button>
    </div>
  )
}

export default App