import { useEffect } from "react"
import './App.css';

const App = () => {

  const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

  const storeDataInIndexedDB = async()=>{
    try {

      const dbName = 'testDB'
      const storeName = 'testStore'
      const version = 1

      const request = indexedDB.open(dbName, version);

      request.onupgradeneeded=(event)=>{
        const db = event.target.result;
        if(!db.objectStoreNames.contains(storeName)){
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      }

      request.onsuccess = async (event)=>{

        const db = event.target.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        // Sample data
        const data = { id: '1', message: 'Hello from  index db.I am accessible!', timestamp: Date.now() };
        store.put(data);

        transaction.oncomplete = () => {
          console.log('Data stored in IndexedDB');
          db.close();
        };

        transaction.onerror = (error) => {
          console.error('IndexedDB transaction error:', error);
        };
      }

      request.onerror = (error) => {
        console.error('IndexedDB open error:', error);
      };
      
    } catch (error) {
      console.error('Error storing data in IndexedDB:', error);
    }
  }
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

    storeDataInIndexedDB();

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
       <button onClick={storeDataInIndexedDB}>Store Data in IndexedDB</button>
    </div>
  )
}

export default App