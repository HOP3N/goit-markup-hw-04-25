document.addEventListener("DOMContentLoaded", function () {
  // Use event delegation so dynamically inserted address links (e.g. in the menu)
  // also trigger the same behavior.
  document.addEventListener('click', function (e) {
    var link = e.target.closest('.link-address');
    if (!link) return;

    // Only handle address clicks (not mailto/tel)
    e.preventDefault();

    fetch('./js/toggle-address.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(function (data) {
        var url = null;
        if (data) {
          if (data.url) url = data.url;
          else if (
            data.configurations &&
            data.configurations[0] &&
            data.configurations[0].url
          )
            url = data.configurations[0].url;
        }
        if (!url) {
          alert('Не знайдено URL в toggle-address.json');
          return;
        }
        var ok = confirm('Відкрити мапу за адресою?');
        if (ok) window.open(url, '_blank', 'noopener');
      })
      .catch(function (err) {
        alert('Не вдалося отримати дані: ' + err.message);
      });
  });
});
