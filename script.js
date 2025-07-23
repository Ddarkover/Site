// Навигация по табам
const tabs = document.querySelectorAll('.tab');
document.querySelectorAll('.tab-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.sidebar a').forEach(a=>a.classList.remove('active'));
    link.classList.add('active');
    tabs.forEach(t=>t.style.display = t.id === link.dataset.target ? 'block' : 'none');
  });
});
// По умолчанию активен первый
document.querySelector('.tab-link').click();

// -- Хеш + Pwned --
document.getElementById('hash-btn').onclick = async ()=>{
  const txt = document.getElementById('hash-input').value;
  const md5 = CryptoJS.MD5(txt).toString();
  const sha1 = CryptoJS.SHA1(txt).toString().toUpperCase();
  const sha256 = CryptoJS.SHA256(txt).toString();
  let leak = '🟢 Нет утечек';
  // Pwned
  const pre = sha1.slice(0,5);
  const res = await fetch(`https://api.pwnedpasswords.com/range/${pre}`);
  const txtResp = await res.text();
  const found = txtResp.split('\r\n').find(l=>l.startsWith(sha1.slice(5)));
  if(found) leak = `🔴 Утечка: ${found.split(':')[1]} раз`;  
  document.getElementById('hash-output').textContent =
    `MD5: ${md5}\nSHA-1: ${sha1} ${leak}\nSHA-256: ${sha256}`;
};

// -- Разница дат --
document.getElementById('date-btn').onclick = ()=>{
  const d1 = new Date(document.getElementById('date1').value);
  const d2 = new Date(document.getElementById('date2').value);
  const diff = Math.abs(d2 - d1);
  const unit = document.getElementById('unit').value;
  let out;
  if(unit==='days') out = Math.floor(diff/86400000) + ' дн.';
  if(unit==='hours') out = Math.floor(diff/3600000) + ' час.';
  if(unit==='minutes') out = Math.floor(diff/60000) + ' мин.';
  document.getElementById('date-output').textContent = out;
};

// -- Конвертер $100 --
document.getElementById('conv-btn').onclick = async ()=>{
  const to = document.getElementById('cur-select').value;
  const cached = localStorage.getItem('rates');
  let rates;
  if(cached) rates = JSON.parse(cached);
  else {
    const r = await fetch('https://open.er-api.com/v6/latest/USD');
    const json = await r.json(); rates = json.rates;
    localStorage.setItem('rates', JSON.stringify(rates));
  }
  const val = (100 * rates[to]).toFixed(2);
  document.getElementById('conv-output').textContent = `$100 = ${val} ${to}`;
};

// -- Детектор анонимности --
document.getElementById('anon-btn').onclick = async ()=>{
  const out = document.getElementById('anon-output'); out.innerHTML = '';
  // IP
  const ip = (await (await fetch('https://api.ipify.org?format=json')).json()).ip;
  out.innerHTML += `<p>Ваш внешний IP: ${ip}</p>`;
  // WebRTC
  const pc = new RTCPeerConnection({iceServers: []});
  pc.createDataChannel('');
  pc.createOffer().then(o=>pc.setLocalDescription(o));
  pc.onicecandidate = e=>{
    if(!e.candidate) return;
    const ips = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(e.candidate.candidate);
    out.innerHTML += `<p>WebRTC IP: ${ips?ips[1]:'нет'}</p>`;
    pc.close();
  };
  // Блокировка сервисов
  const services = {Google:'https://www.google.com/favicon.ico', Twitter:'https://abs.twimg.com/favicons/twitter.ico', Telegram:'https://web.telegram.org/favicon.ico'};
  for(let [name,url] of Object.entries(services)){
    try { await fetch(url,{mode:'no-cors'}); out.innerHTML += `<p>${name}: доступен</p>`; }
    catch{ out.innerHTML += `<p>${name}: заблокирован</p>`; }
  }
  // Скорость
  const start = performance.now();
  await fetch('https://via.placeholder.com/1000x1000.png');
  const ms = performance.now()-start;
  const mb = 1; // ~1MB
  out.innerHTML += `<p>Скорость: ${(mb/(ms/1000)).toFixed(2)} MB/s</p>`;
  // Заголовки
  out.innerHTML += `<p>User-Agent: ${navigator.userAgent}</p>`;
  // RTT
  out.innerHTML += `<p>RTT: ${navigator.connection?rtt: 'н/д'} ms</p>`;
};

// -- IP/Geo --
document.addEventListener('DOMContentLoaded', ()=>{
  fetchAndDisplay('ipv4','https://api.ipify.org?format=json');
  fetchAndDisplay('ipv6','https://api64.ipify.org?format=json');
});
async function fetchAndDisplay(id,url){
  const el = document.getElementById(id);
  try{
    const json = await (await fetch(url)).json(); el.textContent = json.ip;
    if(id==='ipv4') fetchLocation(json.ip);
  } catch{ el.textContent='Ошибка'; }
}
async function fetchLocation(ip){
  try{
    const j = await (await fetch(`https://ipapi.co/${ip}/json/`)).json();
    ['country_name','region','city'].forEach(k=>{
      document.getElementById({country:'country',region:'region',city:'city'}[k]||'').textContent = j[k] || '—';
    });
  }catch{}
}
