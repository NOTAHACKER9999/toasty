// sw.js
const files = {};

// Receive the file map from the main page
self.addEventListener('message', e => {
    if (e.data.type === 'INIT') {
        Object.entries(e.data.files).forEach(([path, buffer]) => {
            files[path] = buffer;
        });
        console.log('Service Worker: file map initialized', Object.keys(files));
    }
});

// Intercept fetch requests
self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    let path = url.pathname;

    // If requesting a folder, default to /index.html
    if (path.endsWith('/')) path += 'index.html';

    // Serve from our in-memory zip files if available
    if (files[path]) {
        e.respondWith(new Response(files[path], {
            status: 200,
            headers: { 'Content-Type': guessContentType(path) }
        }));
    }
});

// Basic content type guessing
function guessContentType(path) {
    if (path.endsWith('.html')) return 'text/html';
    if (path.endsWith('.js')) return 'application/javascript';
    if (path.endsWith('.css')) return 'text/css';
    if (path.endsWith('.png')) return 'image/png';
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
    if (path.endsWith('.gif')) return 'image/gif';
    if (path.endsWith('.svg')) return 'image/svg+xml';
    if (path.endsWith('.woff')) return 'font/woff';
    if (path.endsWith('.woff2')) return 'font/woff2';
    if (path.endsWith('.mp3')) return 'audio/mpeg';
    if (path.endsWith('.ogg')) return 'audio/ogg';
    if (path.endsWith('.json')) return 'application/json';
    return 'application/octet-stream';
}
