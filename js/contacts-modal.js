document.addEventListener("DOMContentLoaded", function () {
  var selector = 'a.js-open-contacts, a[href$="contacts.html"]';
  var links = Array.prototype.slice.call(document.querySelectorAll(selector));
  if (!links.length) return;
  var currentMenu = null;
  var closeTimeout = null;

  links.forEach(function (link) {
    // Show menu on hover
    link.addEventListener("mouseenter", function (e) {
      e.preventDefault();
      clearTimeout(closeTimeout);
      openContactsMenu(link.getAttribute("href") || "./contacts.html", link);
    });

    // Hide menu on mouse leave
    link.addEventListener("mouseleave", function () {
      closeTimeout = setTimeout(function () {
        if (currentMenu && currentMenu.parentNode) {
          currentMenu.parentNode.removeChild(currentMenu);
          currentMenu = null;
        }
      }, 400);
    });
  });

  function openContactsMenu(url, trigger) {
    clearTimeout(closeTimeout);
    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.text();
      })
      .then(function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");
        var contentNode =
          doc.querySelector(".hero-contacts") ||
          doc.querySelector("main.main-contacts") ||
          doc.body;

        // remove existing menu
        if (currentMenu && currentMenu.parentNode) {
          currentMenu.parentNode.removeChild(currentMenu);
        }

        var menu = document.createElement("div");
        menu.className = "contacts-menu";
        menu.setAttribute("role", "menu");

        var inner = contentNode.cloneNode(true);
        // ensure links inside menu are focusable and have role
        Array.prototype.slice
          .call(inner.querySelectorAll("a"))
          .forEach(function (a) {
            a.setAttribute("role", "menuitem");
          });

        menu.appendChild(inner);
        document.body.appendChild(menu);
        currentMenu = menu;

        // Position menu directly below trigger link, shifted left
        var rect = trigger.getBoundingClientRect();
        menu.style.position = "absolute";
        menu.style.left = (rect.left + window.scrollX - 30) + "px";
        menu.style.top = (rect.bottom + window.scrollY + 8) + "px";

        // focus first link
        var firstLink = menu.querySelector("a");
        if (firstLink) firstLink.focus();

        // Keep menu open while hovering over it
        menu.addEventListener("mouseenter", function () {
          clearTimeout(closeTimeout);
        });

        menu.addEventListener("mouseleave", function () {
          closeTimeout = setTimeout(function () {
            if (currentMenu && currentMenu.parentNode) {
              currentMenu.parentNode.removeChild(currentMenu);
              currentMenu = null;
            }
          }, 400);
        });

        function closeMenu() {
          if (currentMenu && currentMenu.parentNode) {
            currentMenu.parentNode.removeChild(currentMenu);
            currentMenu = null;
          }
          document.removeEventListener("click", onDocClick, true);
          document.removeEventListener("keydown", onKey);
          window.removeEventListener("resize", closeMenu);
        }

        function onDocClick(e) {
          if (menu && !menu.contains(e.target) && e.target !== trigger) closeMenu();
        }

        function onKey(e) {
          if (e.key === "Escape") closeMenu();
        }

        // close on outside click and escape
        setTimeout(function () {
          document.addEventListener("click", onDocClick, true);
        }, 0);
        document.addEventListener("keydown", onKey);
        window.addEventListener("resize", closeMenu);
      })
      .catch(function (err) {
        alert("Не вдалося завантажити контакти: " + err.message);
      });
  }
});
