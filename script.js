// script.js
document.addEventListener('DOMContentLoaded', () => {
  // Получаем IP через ipify
  fetchAndDisplay('ipv4', 'https://api.ipify.org?format=json');
  fetchAndDisplay('ipv6', 'https://api64.ipify.org?format=json');
  // Данные устройства
  displayClientInfo();
  // WebRTC leak test
  runWebRTCTest();
});

async function fetchAndDisplay(type, apiUrl) {
  const el = document.getElementById(type);
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(res.status);
    const { ip } = await res.json();
    el.textContent = ip;
    if (type === 'ipv4') {
      await fetchExtendedInfo(ip);
    }
  } catch (e) {
    el.textContent = `Ошибка: ${e.message}`;
  }
}

async function fetchExtendedInfo(ip) {
  const url = `https://ipwhois.app/json/${ip}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const d = await res.json();
    // Сетевые
    fill('hostname', d.hostname);
    fill('isp', d.isp);
    fill('asn', d.asn);
    fill('org', d.org);
    // Гео
    fill('country', d.country);
    fill('country_code', d.country_code2);
    fill('continent', d.continent);
    fill('continent_code', d.continent_code);
    fill('region', d.region);
    fill('city', d.city);
    fill('currency', `${d.currency_code} (${d.currency_name})`);
    // Время
    fill('timezone', d.timezone.id);
    fill('local_time', d.timezone.current_time);
    // Threat
    fill('threat_tor', d.security.is_tor);
    fill('threat_proxy', d.security.is_proxy || d.security.is_crawler);
    fill('threat_level', d.security.threat_level);
    fill('threat_types', d.security.threat_types.join(', ') || '—');
  } catch (e) {
    console.error('Extended info error:', e);
  }
}

function fill(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? '—';
}

function displayClientInfo() {
  // UserAgent
  const ua = navigator.userAgent;
  document.getElementById('browser').textContent = navigator.appVersion.match(/\b(Chrome|Firefox|Safari|Opera|Edg)\/[^\s]+/)?.[0] || ua;
  document.getElementById('os').textContent = ua.match(/\(([^)]+)\)/)?.[1] || '—';
  document.getElementById('device').textContent =
    /Mobi/.test(ua) ? 'Мобильное' : 'Десктоп';
  // Разрешение экрана
  document.getElementById('resolution').textContent =
    `${window.screen.width}×${window.screen.height}`;
  // Тип соединения
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  document.getElementById('connection_type').textContent =
    conn?.effectiveType || 'не доступен';
}

function runWebRTCTest() {
  const ul = document.getElementById('webrtc_list');
  ul.innerHTML = '';
  const pc = new RTCPeerConnection({iceServers:[]});
  pc.createDataChannel('');
  pc.createOffer()
    .then(offer => pc.setLocalDescription(offer))
    .catch(console.error);
  pc.onicecandidate = (evt) => {
    if (!evt.candidate) return;
    const parts = evt.candidate.candidate.split(' ');
    const addr = parts[4];
    if (addr && !ul.textContent.includes(addr)) {
      const li = document.createElement('li');
      li.textContent = addr;
      ul.appendChild(li);
    }
  };
}
