// ----------------------------------------------------
// Ekalaivan Subramanian — Next-Level Embedded Portfolio
// Interactive Oscilloscope Canvas & CLI Shell Engine
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {

  // Footer Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --------------------------------------------------
  // 1. INTERACTIVE OSCILLOSCOPE SIGNAL SIMULATOR
  // --------------------------------------------------
  const canvas = document.getElementById('scopeCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let isRunning = true;
    let timeOffset = 0;
    let signalMode = 'ethercat';
    let targetFreq = 1000;
    let targetDuty = 50;
    let injectJitter = false;
    let jitterTimer = 0;

    const freqSelect = document.getElementById('signalSelect');
    const freqRange = document.getElementById('freqRange');
    const dutyRange = document.getElementById('dutyRange');
    const freqValDisp = document.getElementById('freqVal');
    const dutyValDisp = document.getElementById('dutyVal');
    const scopeFreqDisp = document.getElementById('scopeFreqDisp');
    const scopeCycleDisp = document.getElementById('scopeCycleDisp');
    const scopeJitterDisp = document.getElementById('scopeJitterDisp');
    const pauseBtn = document.getElementById('scopePauseBtn');
    const jitterBtn = document.getElementById('injectJitterBtn');

    // Controls listeners
    if (freqSelect) {
      freqSelect.addEventListener('change', (e) => {
        signalMode = e.target.value;
      });
    }

    if (freqRange) {
      freqRange.addEventListener('input', (e) => {
        targetFreq = parseInt(e.target.value, 10);
        if (freqValDisp) freqValDisp.textContent = `${targetFreq} Hz`;
        if (scopeFreqDisp) scopeFreqDisp.textContent = `${targetFreq} Hz`;
        const cycleTime = (1000 / targetFreq).toFixed(2);
        if (scopeCycleDisp) scopeCycleDisp.textContent = `${cycleTime} ms`;
      });
    }

    if (dutyRange) {
      dutyRange.addEventListener('input', (e) => {
        targetDuty = parseInt(e.target.value, 10);
        if (dutyValDisp) dutyValDisp.textContent = `${targetDuty}%`;
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        isRunning = !isRunning;
        pauseBtn.textContent = isRunning ? 'Pause Waveform' : 'Resume Waveform';
        pauseBtn.classList.toggle('btn--scope-amber', !isRunning);
      });
    }

    if (jitterBtn) {
      jitterBtn.addEventListener('click', () => {
        injectJitter = true;
        jitterTimer = 40;
        if (scopeJitterDisp) scopeJitterDisp.textContent = '±84.5 µs (SPIKE)';
        if (scopeJitterDisp) scopeJitterDisp.style.color = '#ff5f56';
      });
    }

    function renderScope() {
      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Draw baseline center line
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Waveform Line
      ctx.beginPath();
      ctx.lineWidth = 2.5;

      if (signalMode === 'ethercat') {
        // EtherCAT Sub-1ms Sync Square Pulse
        ctx.strokeStyle = '#00ff9d';
        ctx.shadowColor = '#00ff9d';
        ctx.shadowBlur = 8;

        const cyclePx = (width / 5) * (1000 / targetFreq);
        const highWidth = cyclePx * (targetDuty / 100);

        for (let x = 0; x < width; x++) {
          let jitter = (Math.random() - 0.5) * 2;
          if (injectJitter) jitter *= 15;

          const phase = (x + timeOffset) % cyclePx;
          const y = (phase < highWidth) ? midY - 70 + jitter : midY + 70 + jitter;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else if (signalMode === 'pwm') {
        // PWM Fan Speed Pulse
        ctx.strokeStyle = '#ffaa00';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 8;

        const cyclePx = (width / 6) * (1000 / targetFreq);
        const highWidth = cyclePx * (targetDuty / 100);

        for (let x = 0; x < width; x++) {
          const phase = (x + timeOffset) % cyclePx;
          const y = (phase < highWidth) ? midY - 60 : midY + 60;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else if (signalMode === 'pid') {
        // Closed Loop PID Step Response Curve
        ctx.strokeStyle = '#00e5ff';
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 8;

        const Kp = targetDuty / 40;
        for (let x = 0; x < width; x++) {
          const t = (x + (timeOffset * 2)) % width / 80;
          // Damped oscillation equation: y = 1 - e^(-0.8t) * cos(3t)
          const damping = Math.exp(-0.6 * t) * Math.cos(Kp * t);
          let jitter = (Math.random() - 0.5) * 1.5;
          if (injectJitter) jitter *= 20;

          const y = midY - ((1 - damping) * 70) + jitter;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else if (signalMode === 'lvdt') {
        // LVDT ADC Sine Sensor Signal
        ctx.strokeStyle = '#e2e8f0';
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 6;

        for (let x = 0; x < width; x++) {
          let jitter = (Math.random() - 0.5) * 2;
          if (injectJitter) jitter *= 12;

          const rad = ((x + timeOffset) / 40) * (targetFreq / 500);
          const y = midY + Math.sin(rad) * (targetDuty * 0.9) + jitter;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0;

      // Handle Jitter decay
      if (injectJitter) {
        jitterTimer--;
        if (jitterTimer <= 0) {
          injectJitter = false;
          if (scopeJitterDisp) {
            scopeJitterDisp.textContent = '±4.2 µs';
            scopeJitterDisp.style.color = 'var(--text-muted)';
          }
        }
      }

      if (isRunning) timeOffset += (targetFreq / 250);
      requestAnimationFrame(renderScope);
    }

    renderScope();
  }

  // --------------------------------------------------
  // 2. PROJECT CATEGORY FILTERING
  // --------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });

  // --------------------------------------------------
  // 3. INTERACTIVE UNIX CLI SHELL ENGINE
  // --------------------------------------------------
  const cliDrawer = document.getElementById('cliDrawer');
  const cliToggleBtn = document.getElementById('cliToggleBtn');
  const cliCloseBtn = document.getElementById('cliCloseBtn');
  const cliMinimizeBtn = document.getElementById('cliMinimizeBtn');
  const cliInput = document.getElementById('cliInput');
  const cliOutput = document.getElementById('cliOutput');

  function openCLI() {
    if (cliDrawer) {
      cliDrawer.classList.add('active');
      cliDrawer.setAttribute('aria-hidden', 'false');
      if (cliInput) cliInput.focus();
    }
  }

  function closeCLI() {
    if (cliDrawer) {
      cliDrawer.classList.remove('active');
      cliDrawer.setAttribute('aria-hidden', 'true');
    }
  }

  if (cliToggleBtn) cliToggleBtn.addEventListener('click', openCLI);
  if (cliCloseBtn) cliCloseBtn.addEventListener('click', closeCLI);
  if (cliMinimizeBtn) cliMinimizeBtn.addEventListener('click', closeCLI);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cliDrawer && cliDrawer.classList.contains('active')) {
      closeCLI();
    }
  });

  // Command handlers
  const commands = {
    help: () => `
<div class="fg-amber">AVAILABLE EMBEDDED SYSTEM COMMANDS:</div>
  <span class="fg-cyan">help</span>          - Display this command list
  <span class="fg-cyan">cat resume</span>    - Print complete resume details
  <span class="fg-cyan">cat skills</span>    - Output tech stack, MCU boards, & protocols
  <span class="fg-cyan">cat experience</span>- View industrial test bench experience (ERL Spectra)
  <span class="fg-cyan">ls projects</span>   - List firmware & open-source projects
  <span class="fg-cyan">ping ethercat</span> - Test simulated 1ms EtherCAT master bus latency
  <span class="fg-cyan">simulate pid</span>  - Run simulated closed-loop PID step response calculation
  <span class="fg-cyan">download</span>      - Trigger Ekalaivan_Resume_.pdf download
  <span class="fg-cyan">contact</span>       - Show email, phone & social profiles
  <span class="fg-cyan">clear</span>         - Clear terminal window output
`,
    'cat resume': () => `
<div class="fg-green">EKALAIVAN SUBRAMANIAN — EMBEDDED SOFTWARE DEVELOPER</div>
Location: Chennai, India (Open to Bangalore relocation)
Email: ekalaivan28@gmail.com | Phone: +91-6379033517
Education: B.E. ECE — Kongunadu College of Engineering (CGPA: 7.74/10)

<div class="fg-amber">PROFESSIONAL SUMMARY:</div>
1.5+ years building real-time EtherCAT-based industrial control systems for automotive
hydraulic and servo test benches (PREEMPT_RT Linux, Beckhoff IPCs, Mitsubishi Drivers).
Deployed international systems in Japan and Thailand with ZERO critical post-deployment defects.
`,
    'cat skills': () => `
<div class="fg-amber">TECH MATRIX & FIRMWARE STACK:</div>
• OS & Kernels  : PREEMPT_RT Linux, Xenomai, Embedded Linux, RTOS, systemd
• Languages     : C (Bare-Metal), C++ (IPC API), Python (QA Automation), Bash, SystemVerilog
• Protocols     : EtherCAT (IgH Master, Sub-1ms), CAN (Kvaser), MQTT, UART, I2C, SPI, TCP/IP
• Microchip/MCUs: STM32F407, STM32F446RE, Beckhoff IPC, Raspberry Pi 3/4/5, ESP32, PIC16F
• Standards     : ISO 26262 Automotive Safety, MISRA C, Closed-Loop PID
`,
    'cat experience': () => `
<div class="fg-green">EXPERIENCE — ERL SPECTRA PVT LTD (Mar 2025 – Present)</div>
Role: Embedded Software Developer (Chennai)
Key Highlights:
 ⚡ Engineered closed-loop PID algorithms for HYDRIVE hydraulic testbench (1ms RT loop).
 ⚡ Integrated Beckhoff EtherCAT I/O & Mitsubishi servo drivers on PREEMPT_RT Linux.
 ⚡ Deployed test benches to Japan & Thailand with zero post-deployment defects.
 ⚡ Built Python QA test automation cutting testing time by 40% and boosting coverage to 85%.
`,
    'ls projects': () => `
<div class="fg-amber">REPOSITORIES & PROJECTS:</div>
 [1] IPC Platform API for EtherCAT Master (C++, IgH EtherCAT, PREEMPT_RT)
 [2] HYDRIVE Hydraulic Servo Testbench Application (Closed-Loop PID, Beckhoff)
 [3] Temperature-based Fan Speed Control (STM32F407, PWM, C)
 [4] Smart Irrigation System with ESP8266 (Wi-Fi, Sensors, C)
 [5] Human Presence Detection Pipeline (OpenCV, ESP8266, Python)
 [6] STM32 Bare-Metal Register Control (STM32F446RE, GPIO Registers)
 [7] FPGA SystemVerilog Logic Design (Xilinx Vivado)
`,
    'ping ethercat': () => `
PING ethercat0.master.local (192.168.1.100) 56(84) bytes of data.
64 bytes from 192.168.1.100: icmp_seq=1 ttl=64 time=0.884 ms [SYNC: OK]
64 bytes from 192.168.1.100: icmp_seq=2 ttl=64 time=0.912 ms [SYNC: OK]
64 bytes from 192.168.1.100: icmp_seq=3 ttl=64 time=0.895 ms [SYNC: OK]
64 bytes from 192.168.1.100: icmp_seq=4 ttl=64 time=0.903 ms [SYNC: OK]

--- ethercat0.master.local ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3004ms
rtt min/avg/max/mdev = 0.884/0.898/0.912/0.011 ms (Determinism Guarantee < 1ms)
`,
    'simulate pid': () => `
<div class="fg-cyan">INITIALIZING PID CLOSED-LOOP SIMULATION...</div>
Target Force: 12.50 kN | Kp = 1.80, Ki = 0.12, Kd = 0.04
t = 0.0ms | Setpoint: 12.50 | Measured: 0.00 kN | Error: +12.50 | Output PWM: 95.0%
t = 0.2ms | Setpoint: 12.50 | Measured: 7.20 kN | Error: +5.30  | Output PWM: 72.4%
t = 0.4ms | Setpoint: 12.50 | Measured: 11.80 kN| Error: +0.70  | Output PWM: 48.1%
t = 0.6ms | Setpoint: 12.50 | Measured: 12.52 kN| Error: -0.02  | Output PWM: 50.1%
t = 0.8ms | Setpoint: 12.50 | Measured: 12.50 kN| Error:  0.00  | Output PWM: 50.0%
<div class="fg-green">STATUS: SETTLED IN 0.8ms WITH ZERO OVERSHOOT (LOCKED).</div>
`,
    download: () => {
      window.open('Ekalaivan_Resume_.pdf', '_blank');
      return '<div class="fg-green">Opening Ekalaivan_Resume_.pdf in new tab...</div>';
    },
    contact: () => `
<div class="fg-amber">CONTACT INFO:</div>
• Email    : <a href="mailto:ekalaivan28@gmail.com" class="fg-cyan">ekalaivan28@gmail.com</a>
• Phone    : +91-6379033517
• LinkedIn : <a href="https://linkedin.com/in/ekalaivan21" target="_blank" class="fg-cyan">linkedin.com/in/ekalaivan21</a>
• GitHub   : <a href="https://github.com/Ekalaivans" target="_blank" class="fg-cyan">github.com/Ekalaivans</a>
`
  };

  if (cliInput) {
    cliInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const rawCmd = cliInput.value.trim().toLowerCase();
        cliInput.value = '';

        if (!rawCmd) return;

        // Print input line
        const cmdLine = document.createElement('div');
        cmdLine.className = 'cli-line';
        cmdLine.innerHTML = `<span class="fg-green">ekalaivan@rt-linux:~$</span> ${escapeHTML(rawCmd)}`;
        cliOutput.appendChild(cmdLine);

        if (rawCmd === 'clear') {
          cliOutput.innerHTML = '';
          return;
        }

        let response = '';
        if (commands[rawCmd]) {
          response = typeof commands[rawCmd] === 'function' ? commands[rawCmd]() : commands[rawCmd];
        } else {
          response = `<div class="fg-dim">bash: command not found: ${escapeHTML(rawCmd)}. Type <span class="fg-amber">'help'</span> for valid commands.</div>`;
        }

        const resLine = document.createElement('div');
        resLine.className = 'cli-line';
        resLine.innerHTML = response;
        cliOutput.appendChild(resLine);

        // Scroll to bottom
        const cliBody = document.getElementById('cliBody');
        if (cliBody) cliBody.scrollTop = cliBody.scrollHeight;
      }
    });
  }

  function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

});

// Global Email Copy helper
function copyEmail() {
  const email = 'ekalaivan28@gmail.com';
  navigator.clipboard.writeText(email).then(() => {
    const copyBtnText = document.getElementById('copyEmailText');
    if (copyBtnText) {
      const orig = copyBtnText.textContent;
      copyBtnText.textContent = 'Copied to Clipboard! ✓';
      setTimeout(() => {
        copyBtnText.textContent = orig;
      }, 2000);
    }
  }).catch(err => {
    alert('Email: ekalaivan28@gmail.com');
  });
}
