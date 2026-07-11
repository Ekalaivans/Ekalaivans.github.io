// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Boot log lines: [text, class]
const lines = [
  ['booting profile.elf ...', 'fg-dim'],
  ['mounting /dev/experience ... OK', 'fg-dim'],
  ['', ''],
  ['user       : Ekalaivan Subramanian', 'fg-text'],
  ['role       : Embedded Software Developer', 'fg-text'],
  ['focus      : EtherCAT · real-time Linux · industrial control', 'fg-cyan'],
  ['location   : Chennai, India', 'fg-cyan'],
  ['uptime     : 1.5 yrs in the field, longer at the bench', 'fg-cyan'],
  ['', ''],
  ['status     : passionate about embedded systems and IoT,', 'fg-text'],
  ['             building firmware that runs real hardware —', 'fg-text'],
  ['             from ESP8266 sensor nodes to EtherCAT-driven', 'fg-text'],
  ['             hydraulic servo control on the factory floor.', 'fg-text'],
  ['', ''],
  ['boot complete. scroll to continue_', 'fg-dim'],
];

const el = document.getElementById('bootlog');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function renderStatic(){
  el.innerHTML = lines.map(([text, cls]) => {
    const safe = text.replace(/&/g,'&amp;').replace(/</g,'&lt;');
    return cls ? `<span class="${cls}">${safe}</span>` : safe;
  }).join('\n');
}

if (reduceMotion) {
  renderStatic();
} else {
  let lineIndex = 0;
  let charIndex = 0;
  const rendered = [];

  function typeStep(){
    if (lineIndex >= lines.length){
      return;
    }
    const [text, cls] = lines[lineIndex];

    if (charIndex === 0) rendered.push({text: '', cls});

    if (charIndex <= text.length){
      rendered[lineIndex].text = text.slice(0, charIndex);
      paint();
      charIndex++;
      const delay = text.length === 0 ? 40 : (Math.random() * 8 + 6);
      setTimeout(typeStep, delay);
    } else {
      lineIndex++;
      charIndex = 0;
      const pause = text === '' ? 60 : 90;
      setTimeout(typeStep, pause);
    }
  }

  function paint(){
    el.innerHTML = rendered.map(r => {
      const safe = r.text.replace(/&/g,'&amp;').replace(/</g,'&lt;');
      return r.cls ? `<span class="${r.cls}">${safe}</span>` : safe;
    }).join('\n');
  }

  typeStep();
}

