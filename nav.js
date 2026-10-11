(function () {
  var nav = document.querySelector('nav.main');
  if (!nav) return;
  var header = nav.closest('header.main');
  var wrap = header.querySelector('.wrap');
  if (!wrap) return;

  nav.id = 'primary-nav';

  var btn = document.createElement('button');
  btn.className = 'navtoggle';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Open menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'primary-nav');
  btn.innerHTML = '<span></span><span></span><span></span>';
  wrap.appendChild(btn);

  function setOpen(open) {
    header.classList.toggle('navopen', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }

  btn.addEventListener('click', function () {
    setOpen(!header.classList.contains('navopen'));
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
})();
