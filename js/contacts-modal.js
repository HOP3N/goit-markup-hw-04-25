document.addEventListener('DOMContentLoaded', function () {
  var selector = 'a.js-open-contacts, a[href$="contacts.html"]';
  var links = Array.prototype.slice.call(document.querySelectorAll(selector));
  if (!links.length) return;

  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      openContactsMenu(link.getAttribute('href') || './contacts.html', link);
    });
  });

  function openContactsMenu(url, trigger) {
    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.text();
      })
      .then(function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var contentNode = doc.querySelector('.hero-contacts') || doc.querySelector('main.main-contacts') || doc.body;

        // remove existing menu
        var existing = document.querySelector('.contacts-menu');
        if (existing) existing.parentNode.removeChild(existing);

        var menu = document.createElement('div');
        menu.className = 'contacts-menu';
        menu.setAttribute('role', 'menu');

        var inner = contentNode.cloneNode(true);
        // ensure links inside menu are focusable and have role
        Array.prototype.slice.call(inner.querySelectorAll('a')).forEach(function (a) {
          a.setAttribute('role', 'menuitem');
        });

        menu.appendChild(inner);
        document.body.appendChild(menu);

        // Position menu near trigger
        var rect = trigger.getBoundingClientRect();
        var left = rect.left + window.scrollX;
        var top = rect.bottom + window.scrollY + 6;
        // keep inside viewport
        var menuRect = menu.getBoundingClientRect();
        if (left + menuRect.width > window.scrollX + window.innerWidth) {
          left = Math.max(window.scrollX + 8, window.scrollX + window.innerWidth - menuRect.width - 8);
        }
        if (top + menuRect.height > window.scrollY + window.innerHeight) {
          top = rect.top + window.scrollY - menuRect.height - 6;
        }
        menu.style.position = 'absolute';
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';

        // focus first link
        var firstLink = menu.querySelector('a');
        if (firstLink) firstLink.focus();

        function closeMenu() {
          if (menu && menu.parentNode) menu.parentNode.removeChild(menu);
          document.removeEventListener('click', onDocClick, true);
          document.removeEventListener('keydown', onKey);
          window.removeEventListener('resize', closeMenu);
        }

        function onDocClick(e) {
          if (!menu.contains(e.target) && e.target !== trigger) closeMenu();
        }

        function onKey(e) {
          if (e.key === 'Escape') closeMenu();
        }

        // close on outside click and escape
        setTimeout(function () {
          document.addEventListener('click', onDocClick, true);
        }, 0);
        document.addEventListener('keydown', onKey);
        window.addEventListener('resize', closeMenu);
      })
      .catch(function (err) {
        alert('Не вдалося завантажити контакти: ' + err.message);
      });
  }
});
