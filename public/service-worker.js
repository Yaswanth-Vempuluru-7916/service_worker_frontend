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

// Send POST request to /send-notification every 5 seconds
self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
  event.waitUntil(
    (async () => {
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
    })()
  );
});