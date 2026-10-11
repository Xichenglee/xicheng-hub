/* Xicheng hub pageview counter — insert-only, anonymous. No cookies, no personal data. */
(function () {
  try {
    var ENDPOINT = 'https://twfvivtxdnqraohouadh.supabase.co/rest/v1/pageviews';
    var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZnZpdnR4ZG5xcmFvaG91YWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNDA2NjUsImV4cCI6MjEwMzgxNjY2NX0.7u09jM2m-I1LYYrcjJxZIkBnciyY7mlCrXR_eZQEXwo';
    var payload = {
      path: location.pathname + location.hash,
      referrer: (document.referrer || '').slice(0, 300),
      ua: (navigator.userAgent || '').slice(0, 180)
    };
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(function () {});
  } catch (e) {}
})();
