// script.js
document.addEventListener('DOMContentLoaded', () => {
  fetchAndDisplay('ipv4', 'https://api.ipify.org?format=json');
  fetchAndDisplay('ipv6', 'https://api64.ipify.org?format=json');
});

async function fetchAndDisplay(type, apiUrl) {
  const el = document.getElementById(type);
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`Ошибка HTTP: ${res.status}`);
    const data = await res.json();
    const ip = data.ip;
    el.textContent = ip;
    if (type === 'ipv4') {
      // определяем локацию после получения IPv4
      fetchLocation(ip);
    }
  } catch (err) {
    el.textContent = `Не удалось получить ${type}: ${err.message}`;
  }
}

async function fetchLocation(ip) {
  const url = `https://ipapi.co/${ip}/json/`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Ошибка HTTP: ${res.status}`);
    const loc = await res.json();
    document.getElementById('country').textContent = loc.country_name || '—';
    document.getElementById('region').textContent = loc.region || '—';
    document.getElementById('city').textContent = loc.city || '—';
  } catch (err) {
    document.getElementById('country').textContent = 'Ошибка';
    console.error(err);
  }
}
