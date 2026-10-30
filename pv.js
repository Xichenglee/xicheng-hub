/* Xicheng hub pageview counter — insert-only, anonymous. No cookies, no personal data. */
(function () {
  try {
    // Only count real served pages. Local file:// QA renders (my own headless
    // checks on a sandbox copy) used to land in the table and inflate the door.
    if (location.protocol !== 'http:' && location.protocol !== 'https:') return;
    // Loopback / private hosts are still QA: serving my sandbox copy over
    // http://localhost passes the protocol check and lands in the table.
    var h = (location.hostname || '').toLowerCase();
    if (!h || h === 'localhost' || h === '0.0.0.0' || h === '[::1]' || h === '::1' ||
        h.indexOf('127.') === 0 || h.indexOf('192.168.') === 0 || h.indexOf('10.') === 0 ||
        /\.local$/.test(h)) return;
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
