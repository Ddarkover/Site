// script.js
document.addEventListener('DOMContentLoaded', () => {
  fetchAndDisplay('ipv4', 'https://api.ipify.org?format=json');
  fetchAndDisplay('ipv6', 'https://api64.ipify.org?format=json');
});

async function fetchAndDisplay(type, apiUrl) {
  const el = document.getElementById(type);
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { ip } = await res.json();
    el.textContent = ip;
    // Для IPv4 запросим всю гео-информацию
    if (type === 'ipv4') {
      fetchGeoInfo(ip);
    }
  } catch (err) {
    el.textContent = `Ошибка: ${err.message}`;
  }
}

async function fetchGeoInfo(ip) {
  const url = `https://ipapi.co/${ip}/json/`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const d = await res.json();

    // Базовые локационные поля
    document.getElementById('country').textContent = d.country_name || '—';
    document.getElementById('country_code').textContent = d.country_code || '—';
    document.getElementById('continent_code').textContent = d.continent_code || '—';
    document.getElementById('region').textContent = d.region || '—';
    document.getElementById('city').textContent = d.city || '—';
    document.getElementById('timezone').textContent = d.timezone || '—';

    // Провайдер и сеть
    document.getElementById('org').textContent = d.org || '—';
    document.getElementById('network').textContent = d.network || '—';
    document.getElementById('reverse').textContent = d.reverse || '—';
    document.getElementById('currency').textContent = d.currency || '—';

    // Threat Intelligence (если есть)
    if (d.threat && Object.keys(d.threat).length) {
      // собрать все флаги угроз в одну строку
      const flags = Object.entries(d.threat)
        .filter(([_, v]) => v === true)
        .map(([k]) => k)
        .join(', ');
      document.getElementById('threat').textContent = flags || 'нет известных угроз';
    } else {
      document.getElementById('threat').textContent = '—';
    }

    // ASN
    if (d.asn) {
      document.getElementById('asn').textContent = `${d.asn} (${d.org || ''})`;
    } else if (d.network) {
      document.getElementById('asn').textContent = d.network;
    } else {
      document.getElementById('asn').textContent = '—';
    }

  } catch (err) {
    console.error(err);
    document.getElementById('threat').textContent = 'ошибка';
    document.getElementById('asn').textContent = 'ошибка';
  }
}
