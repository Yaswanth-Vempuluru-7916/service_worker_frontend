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

  const subscribeToNotifications = async ()=>{
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly : true,
        applicationServerKey : VAPID_PUBLIC_KEY,
      })

      await fetch(`http://localhost:3000/subscribe`,{
        method : 'POST',
        body : JSON.stringify(subscription),
         headers: {
          'Content-Type': 'application/json',
        },
      })
    console.log('Subscribed to push notifications');
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