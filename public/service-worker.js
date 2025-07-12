// Function to read data from IndexedDB
async function readFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const dbName = 'testDB';
    const storeName = 'testStore';
    const version = 1;

    const request = indexedDB.open(dbName, version);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getRequest = store.get('1'); // Get data with id '1'

      getRequest.onsuccess = () => {
        const data = getRequest.result;
        console.log('Data retrieved from IndexedDB in Service Worker:', data);
        db.close();
        resolve(data);
      };

      getRequest.onerror = (error) => {
        console.error('Error retrieving data from IndexedDB:', error);
        db.close();
        reject(error);
      };
    };

    request.onerror = (error) => {
      console.error('IndexedDB open error in Service Worker:', error);
      reject(error);
    };

    // Handle case where database doesn't exist yet
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
  });
}

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Notification';
  const options = {
    body: data.body || 'You have a new notification!',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/')); // Open the app when notification is clicked
});

// Read from IndexedDB on activation
self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
  event.waitUntil(
    (async () => {
      try {
        // Read data from IndexedDB
        const data = await readFromIndexedDB();
        console.log('Service Worker successfully accessed IndexedDB:', data);

        // Start interval to trigger notifications
        setInterval(async () => {
          try {
            console.log('Sending request to /send-notification');
            const response = await fetch('http://localhost:3000/send-notification', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            const data = await response.json();
            console.log('Response from /send-notification:', data);
          } catch (error) {
            console.error('Error sending request to /send-notification:', error);
          }
        }, 5000); // Every 5 seconds
      } catch (error) {
        console.error('Error in activate event:', error);
      }
    })()
  );
});
//tab closes working
//closed at 28th notification 
//browser closed
//till 39th notifiction