// script.js
document.addEventListener('DOMContentLoaded', () => {
  // сначала IPv4 и IPv6
  fetchIP('ipv4', 'https://api.ipify.org?format=json')
    .then(ip => {
      setText('ipv4', ip);
      return loadDetails(ip);
    })
    .then(() => fetchIP('ipv6', 'https://api64.ipify.org?format=json').then(ip => setText('ipv6', ip)))
    .catch(console.error);

  // устройство / браузер / ОС / экран / соединение
  const ua = navigator.userAgent;
  setText('ua', ua);
  setText('resolution', `${screen.width}×${screen.height}`);
  const conn = navigator.connection?.effectiveType || 'не поддерживается';
  setText('connection', conn);

  // WebRTC Leak Test
  rtcLeak().then(ips => {
    setText('webrtc', ips.length ? ips.join(', ') : 'не выявлено');
  });
});

function setText(id, txt) {
  document.getElementById(id).textContent = txt;
}

async function fetchIP(id, url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.statusText);
  const { ip } = await res.json();
  return ip;
}

async function loadDetails(ip) {
  // ipwho.is возвращает и данные о локации, и threat, и ASN, и currency, и timezone, и coords, и hostname
  const url = `https://ipwho.is/${ip}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.statusText);
  const data = await res.json();
  // базовые поля
  setText('country', data.country);
  setText('country_code', data.country_code);
  setText('continent', data.continent);
  setText('continent_code', data.continent_code);
  setText('region', data.region);
  setText('city', data.city);
  setText('timezone', data.timezone?.id || '–');
  setText('local_time', data.timezone?.current_time || '–');
  setText('asn', data.asn || '–');
  setText('org', data.org || '–');
  setText('isp', data.connection?.isp || data.isp || '–');
  setText('asname', data.connection?.asn_org || data.connection?.asname || '–');
  setText('currency_code', data.currency?.code || '–');
  setText('currency', data.currency?.name || '–');
  setText('coords', `${data.latitude}, ${data.longitude}`);
  setText('hostname', data.hostname || '–');

  // Threat Intelligence
  if (data.threat) {
    const t = [];
    if (data.threat.is_tor) t.push('TOR');
    if (data.threat.is_proxy) t.push('Proxy');
    if (data.threat.is_known_attacker) t.push('Attacker');
    if (data.threat.is_known_abuser) t.push('Abuser');
    if (data.threat.is_threat) t.push('Threat');
    setText('threat', t.length ? t.join(', ') : 'нет');
  }
}

function rtcLeak() {
  return new Promise((resolve) => {
    const ips = new Set();
    const pc = new RTCPeerConnection({ iceServers: [] });
    pc.createDataChannel('');
    pc.onicecandidate = ev => {
      if (!ev.candidate) {
        pc.close();
        resolve(Array.from(ips));
        return;
      }
      const parts = ev.candidate.candidate.split(' ');
      const ip = parts[4];
      if (ip.match(/(\d{1,3}\.){3}\d{1,3}/)) ips.add(ip);
    };
    pc.createOffer()
      .then(o => pc.setLocalDescription(o))
      .catch(() => resolve([]));
  });
}
