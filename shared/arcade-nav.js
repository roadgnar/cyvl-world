(function() {
  var nav = document.createElement('div');
  nav.style.cssText = 'position:fixed;top:12px;left:12px;z-index:9999;';
  nav.innerHTML = '<a href="/" id="arcade-back" style="color:#007a8a;font:12px Courier New,monospace;text-decoration:none;padding:5px 12px;border:1px solid #007a8a;background:rgba(10,10,26,0.9);display:inline-block;transition:all 0.2s;letter-spacing:1px;">[ESC] ARCADE</a>';
  document.body.appendChild(nav);

  var link = nav.querySelector('a');
  link.addEventListener('mouseenter', function() {
    link.style.color = '#00e5ff';
    link.style.borderColor = '#00e5ff';
    link.style.boxShadow = '0 0 12px rgba(0,229,255,0.5)';
  });
  link.addEventListener('mouseleave', function() {
    link.style.color = '#007a8a';
    link.style.borderColor = '#007a8a';
    link.style.boxShadow = 'none';
  });

  document.addEventListener('keydown', function(e) {
    if (e.code === 'Escape') window.location.href = '/';
  });
})();
