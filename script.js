document.addEventListener('DOMContentLoaded', async () => {
  const ipv4 = await fetchIP('https://api.ipify.org?format=json', 'ipv4');
  const ipv6 = await fetchIP('https://api64.ipify.org?format=json', 'ipv6');

  if (ipv4) {
    await fetchLocation(ipv4);
    await fetchWhois(ipv4);
    await fetchReverseDNS(ipv4);
    await fetchPorts(ipv4);
    await fetchAnonDetection(ipv4);
    await fetchDNSBL(ipv4);
  }
});

// Получение IP
async function fetchIP(url, id) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    document.getElementById(id).textContent = data.ip;
    return data.ip;
  } catch (err) {
    document.getElementById(id).textContent = 'Ошибка';
    return null;
  }
}

// Геолокация
async function fetchLocation(ip) {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();
    document.getElementById('country').textContent = data.country_name || '—';
    document.getElementById('region').textContent = data.region || '—';
    document.getElementById('city').textContent = data.city || '—';
  } catch {
    document.getElementById('country').textContent = 'Ошибка';
  }
}

// WHOIS
async function fetchWhois(ip) {
  try {
    const res = await fetch(`https://jsonwhois.io/api/v1/whois?identifier=${ip}`, {
      headers: { 'Authorization': 'Token 5hrsJWJj0bAIG6mk68mF7bOv5naMcnSM' }
    });
    const data = await res.json();
    document.getElementById('whois').textContent = data?.created || 'Нет данных';
  } catch {
    document.getElementById('whois').textContent = 'Ошибка';
  }
}

// Reverse DNS
async function fetchReverseDNS(ip) {
  try {
    const res = await fetch(`https://api.viewdns.info/reversedns/?ip=${ip}&apikey=b7f2199693fd9dad48145647921ecdef25fdc3b7&output=json`);
    const data = await res.json();
    const host = data?.response?.reversedns?.domain || 'Нет';
    document.getElementById('reverse').textContent = host;
  } catch {
    document.getElementById('reverse').textContent = 'Ошибка';
  }
}

// Открытые порты (Shodan)
async function fetchPorts(ip) {
  try {
    const res = await fetch(`https://api.shodan.io/shodan/host/${ip}?key=Rc9KnMvPYXVvDsTWHgz0ClBNtHePN2Cb`);
    const data = await res.json();
    const ports = data.ports?.join(', ') || 'Нет данных';
    document.getElementById('ports').textContent = ports;
  } catch {
    document.getElementById('ports').textContent = 'Ошибка';
  }
}

// VPN / Proxy / Tor (IPQualityScore)
async function fetchAnonDetection(ip) {
  try {
    const res = await fetch(`https://ipqualityscore.com/api/json/ip/JnFVSpirRUnyS3Vr07kLoRWkCvAUZv3p/${ip}`);
    const data = await res.json();
    const flags = [];
    if (data.vpn) flags.push('VPN');
    if (data.proxy) flags.push('Proxy');
    if (data.tor) flags.push('Tor');
    document.getElementById('anon').textContent = flags.length ? flags.join(', ') : 'Нет';
  } catch {
    document.getElementById('anon').textContent = 'Ошибка';
  }
}

// DNSBL (чёрные списки) — ViewDNS
async function fetchDNSBL(ip) {
  try {
    const res = await fetch(`https://api.viewdns.info/ipblocklist/?ip=${ip}&apikey=b7f2199693fd9dad48145647921ecdef25fdc3b7&output=json`);
    const data = await res.json();
    const status = data?.response?.appears ? 'Да' : 'Нет';
    document.getElementById('dnsbl').textContent = status;
  } catch {
    document.getElementById('dnsbl').textContent = 'Ошибка';
  }
}
