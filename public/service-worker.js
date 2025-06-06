self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
    console.log('Push data:', data);
  } catch (error) {
    console.error('Error parsing push data:', error);
  }
  
  const title = data.title || 'Notification';
  const options = {
    body: data.body || 'You have a new notification!',
  };

  event.waitUntil(self.registration.showNotification(title, options))
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/')); // Open the app when notification is clicked
});

self.addEventListener('periodicsync',(event)=>{
  console.log('Periodic sync event:', event.tag);
  if (event.tag === 'send-notification-sync') {
    event.waitUntil(
      (async ()=>{
        try {
          console.log('Sending request to /send-notification via periodic sync');

          const response = await fetch('http://localhost:3000/send-notification',{
             method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          const data = await response.json()
          console.log('Response from /send-notification:', data);

        } catch (error) {
           console.error('Error sending request to /send-notification via periodic sync:', error);
        }
      })()
    )
  }
})