// переключение табов
const tabs = document.querySelectorAll('nav button');
tabs.forEach(btn => btn.addEventListener('click',()=>{
  document.querySelector('.tab.active').classList.remove('active');
  document.getElementById(btn.dataset.target).classList.add('active');
}));

// IP Checker расширенный
async function loadIP(){
  try{
    const res = await fetch('https://ipapi.co/json/');
    const d = await res.json();
    ['ipv4','ipv6','country','region','city','org','asn','timezone'].forEach(key=>{
      const el = document.getElementById(key==='org'?'isp':key);
      if(el) el.textContent = d[key] || '—';
    });
  }catch(e){console.error(e);} }
document.addEventListener('DOMContentLoaded', loadIP);

// Конвертер валют
async function initCurrency(){
  const url = 'https://api.exchangerate.host/latest';
  const res = await fetch(url);
  const data = await res.json();
  const codes = Object.keys(data.rates);
  const from = document.getElementById('from-currency');
  const to = document.getElementById('to-currency');
  codes.forEach(c=>{from.add(new Option(c,c)); to.add(new Option(c,c));});
  document.getElementById('convert-currency').onclick=()=>{
    const amt=+document.getElementById('amount').value;
    const a=data.rates[from.value], b=data.rates[to.value];
    document.getElementById('currency-result').textContent = ((b/a)*amt).toFixed(4);
  };
}
initCurrency();

// Конвертер единиц
const units = {
  'm_km': v=>v/1000,
  'kg_g': v=>v*1000,
  'c_f': v=>v*9/5+32,
};
document.getElementById('convert-units').onclick=()=>{
  const val=+document.getElementById('unit-value').value;
  const key=document.getElementById('unit-from').value;
  document.getElementById('unit-result').textContent = units[key](val);
};

// Хеши через Web Crypto
async function genHash(algo, text){
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
document.querySelectorAll('.gen-hash').forEach(btn=>btn.onclick=async ()=>{
  const txt=document.getElementById('hash-input').value;
  document.getElementById('hash-result').textContent = await genHash(btn.dataset.algo, txt);
});

// Погода Shadrinsk
async function loadWeather(){
  const res = await fetch('https://wttr.in/Shadrinsk?format=j1');
  const w = (await res.json()).current_condition[0];
  document.getElementById('weather-temp').textContent = w.temp_C;
  document.getElementById('weather-desc').textContent = w.weatherDesc[0].value;
}
document.getElementById('load-weather').onclick=loadWeather;
loadWeather();

// Генератор пароля + проверка Pwned
function randPwd(len){
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  return Array.from({length:len},()=>chars[Math.random()*chars.length|0]).join('');
}
document.getElementById('gen-password').onclick=()=>{
  const l=+document.getElementById('pwd-length').value;
  const pwd=randPwd(l);
  document.getElementById('password-result').textContent=pwd;
};

async function checkPwned(){
  const pwd=document.getElementById('password-result').textContent;
  const sha1= (await genHash('SHA-1',pwd)).toUpperCase();
  const prefix=sha1.slice(0,5);
  const res=await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const txt=await res.text();
  const found = txt.split('\n').some(line=>line.split(':')[0]===sha1.slice(5));
  document.getElementById('pwned-result').textContent = found ? 'Скомпрометирован' : 'Безопасен';
}
document.getElementById('check-pwned').onclick=checkPwned;

// Разница между датами
document.getElementById('calc-diff').onclick=()=>{
  const d1=new Date(document.getElementById('date-from').value);
  const d2=new Date(document.getElementById('date-to').value);
  const diff = Math.abs(d2 - d1) / (1000*60*60*24);
  document.getElementById('date-diff-result').textContent = diff;
};
