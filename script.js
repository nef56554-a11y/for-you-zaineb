document.addEventListener('DOMContentLoaded', () => {

  const giftBtn = document.getElementById('giftBtn');
  const intro = document.getElementById('intro');
  const roseOverlay = document.getElementById('roseOverlay');
  const envelopeScreen = document.getElementById('envelopeScreen');
  const envelope = document.getElementById('envelope');
  const finalScreen = document.getElementById('finalScreen');
  const letterCard = document.getElementById('letterCard');
  const polaroid = document.getElementById('polaroid');

  /* ---- loader ---- */
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.style.opacity = '0';
    loader.style.pointerEvents = 'none';
    setTimeout(() => { loader.style.display = 'none'; }, 650);
  }, 1300);

  /* ---- petals background ---- */
  const canvas = document.getElementById('petalCanvas');
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize(){ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const colors = ['#f2a9bb','#e08a9e','#f6c8d4','#cf9b56','#fbe3ea'];
  class Petal {
    constructor(){ this.reset(); }
    reset(){
      this.x = Math.random()*W;
      this.y = -20 - Math.random()*H;
      this.size = 6 + Math.random()*8;
      this.speedY = 0.6 + Math.random()*1.2;
      this.speedX = (Math.random()-0.5)*1;
      this.angle = Math.random()*360;
      this.spin = (Math.random()-0.5)*2;
      this.color = colors[Math.floor(Math.random()*colors.length)];
    }
    update(){
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.y*0.01);
      this.angle += this.spin;
      if(this.y > H+20) this.reset();
    }
    draw(){
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle*Math.PI/180);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(0,0,this.size,this.size/2,0,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }
  const petals = [];
  for(let i=0;i<32;i++) petals.push(new Petal());
  (function loop(){
    ctx.clearRect(0,0,W,H);
    petals.forEach(p=>{ p.update(); p.draw(); });
    requestAnimationFrame(loop);
  })();

  /* ---- rose bloom colors + petal builder ---- */
  const roseColors = [
    ['#f2a9bb','#c2506f'], ['#e08a9e','#a8395a'], ['#f6c8d4','#d97b96'],
    ['#f0b6c4','#b5476b'], ['#fbdde6','#e08a9e']
  ];

  function buildRosePetals(main, shade, baseRot){
    let petals = '';
    const outer = 7;
    for(let i=0;i<outer;i++){
      const a = baseRot + i*(360/outer) + (Math.random()*10-5);
      petals += `<ellipse cx="50" cy="27" rx="13" ry="23" fill="${main}" transform="rotate(${a} 50 50)"/>`;
    }
    const inner = 5;
    for(let i=0;i<inner;i++){
      const a = baseRot + 25 + i*(360/inner) + (Math.random()*8-4);
      petals += `<ellipse cx="50" cy="34" rx="9" ry="16" fill="${shade}" opacity="0.85" transform="rotate(${a} 50 50)"/>`;
    }
    petals += `<circle cx="50" cy="50" r="5" fill="${shade}"/>`;
    return petals;
  }

  /* ---- 1 -> 2 : gift click (طوفان ورود مدورة + crossfade) ---- */
  giftBtn.addEventListener('click', () => {
    intro.classList.add('hidden');

    const cell = 92;
    const cols = Math.ceil(window.innerWidth / cell) + 1;
    const rows = Math.ceil(window.innerHeight / cell) + 1;
    let html = '';
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        const jitterX = (Math.random()-0.5)*cell*0.5;
        const jitterY = (Math.random()-0.5)*cell*0.5;
        const cx = c*cell + cell/2 + jitterX;
        const cy = r*cell + cell/2 + jitterY;
        const size = cell*0.8 + Math.random()*cell*0.5;
        const [main, shade] = roseColors[Math.floor(Math.random()*roseColors.length)];
        const baseRot = Math.random()*360;
        const delay = ((r/rows) * 0.9 + Math.random()*0.25).toFixed(2);
        const petals = buildRosePetals(main, shade, baseRot);
        html += `<div class="rose-item" style="left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;margin:${-size/2}px 0 0 ${-size/2}px;animation-delay:${delay}s;">
          <svg viewBox="0 0 100 100" width="100%" height="100%">${petals}</svg>
        </div>`;
      }
    }
    roseOverlay.innerHTML = html;

    setTimeout(() => {
      roseOverlay.classList.add('active');
    }, 150);

    setTimeout(() => {
      envelopeScreen.classList.remove('hidden');
      setTimeout(() => {
        roseOverlay.classList.remove('active');
      }, 120);
    }, 2600);
  });

  /* ---- 3 -> 4 : envelope click (crossfade أنعم) ---- */
  envelope.addEventListener('click', () => {
    envelope.classList.add('open');
    setTimeout(() => {
      finalScreen.classList.remove('hidden');
      setTimeout(() => {
        envelopeScreen.classList.add('hidden');
      }, 130);
      setTimeout(() => {
        letterCard.classList.add('show');
        setupScratch();
      }, 200);
    }, 950);
  });

  /* ---- scratch card ---- */
  function setupScratch(){
    const sc = document.getElementById('scratchCanvas');
    if(!sc || sc.dataset.ready) return;
    sc.dataset.ready = '1';
    const sctx = sc.getContext('2d');
    sctx.fillStyle = '#d9b6c2';
    sctx.fillRect(0,0,sc.width,sc.height);
    sctx.fillStyle = 'rgba(255,255,255,.55)';
    sctx.font = '13px Poppins, sans-serif';
    sctx.textAlign = 'center';
    sctx.fillText('scratch me ✨', sc.width/2, sc.height/2+4);

    let drawing = false;
    function scratch(e){
      const rect = sc.getBoundingClientRect();
      const cx = ((e.touches ? e.touches[0].clientX : e.clientX) - rect.left);
      const cy = ((e.touches ? e.touches[0].clientY : e.clientY) - rect.top);
      sctx.globalCompositeOperation = 'destination-out';
      sctx.beginPath();
      sctx.arc(cx, cy, 16, 0, Math.PI*2);
      sctx.fill();
    }
    sc.addEventListener('mousedown', ()=>drawing=true);
    sc.addEventListener('mouseup', ()=>drawing=false);
    sc.addEventListener('mouseleave', ()=>drawing=false);
    sc.addEventListener('mousemove', e=>{ if(drawing) scratch(e); });
    sc.addEventListener('touchstart', ()=>drawing=true);
    sc.addEventListener('touchend', ()=>drawing=false);
    sc.addEventListener('touchmove', e=>{ scratch(e); e.preventDefault(); }, {passive:false});
  }

  /* ---- music: autoplay attempt + manual toggle synced to real audio state ---- */
  const bgMusic = document.getElementById('bgMusic');
  const musicBtn = document.getElementById('musicBtn');

  bgMusic.addEventListener('play', () => { musicBtn.textContent = '🔊'; });
  bgMusic.addEventListener('pause', () => { musicBtn.textContent = '🔈'; });

  bgMusic.play().catch(() => { /* المتصفح منع autoplay، الزرار كيبقى شغال يدويا */ });

  musicBtn.addEventListener('click', () => {
    if(bgMusic.paused){ bgMusic.play().catch(()=>{}); }
    else { bgMusic.pause(); }
  });

  /* ---- share button ---- */
  const shareBtn = document.getElementById('shareBtn');
  const toast = document.getElementById('toast');
  let toastTimer = null;

  function showToast(msg){
    toast.textContent = msg;
    toast.classList.remove('hidden');
    requestAnimationFrame(() => toast.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, 1800);
  }

  shareBtn.addEventListener('click', async () => {
    const url = window.location.href;
    try{
      if(navigator.share){
        await navigator.share({ title: 'For You, Zaineb', url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast('Link copied! 💌');
      }
    }catch(err){
      try{
        await navigator.clipboard.writeText(url);
        showToast('Link copied! 💌');
      }catch(e){
        showToast('Could not copy link');
      }
    }
  });

  /* ---- tilt / parallax (envelope + polaroid) ---- */
  function attachTilt(el, maxDeg){
    function handleMove(clientX, clientY){
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top + rect.height/2;
      let dx = (clientX - cx) / (rect.width/2);
      let dy = (clientY - cy) / (rect.height/2);
      dx = Math.max(-1, Math.min(1, dx));
      dy = Math.max(-1, Math.min(1, dy));
      const rotY = dx * maxDeg;
      const rotX = -dy * maxDeg;
      el.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }
    window.addEventListener('mousemove', e => handleMove(e.clientX, e.clientY));
    window.addEventListener('touchmove', e => {
      if(e.touches && e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }, {passive:true});
  }
  attachTilt(envelope, 12);
  attachTilt(polaroid, 8);

  /* ---- continue -> love question screen ---- */
  const continueBtn = document.getElementById('continueBtn');
  const loveScreen = document.getElementById('loveScreen');
  continueBtn.addEventListener('click', () => {
    loveScreen.classList.remove('hidden');
    setTimeout(() => finalScreen.classList.add('hidden'), 150);
  });

  /* ---- yes / no dodge game ---- */
  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const loveButtons = document.getElementById('loveButtons');
  const questionBox = document.getElementById('questionBox');
  const loveResult = document.getElementById('loveResult');
  const dodgeText = document.getElementById('dodgeText');
  const heartBurst = document.getElementById('heartBurst');

  const dodgePhrases = ['really?','think again 👀','come on...','.......'];
  let dodgeCount = 0;
  let yesScale = 1;

  function dodgeNo(){
    const w = loveButtons.clientWidth, h = loveButtons.clientHeight;
    const btnW = noBtn.offsetWidth, btnH = noBtn.offsetHeight;
    const newLeft = Math.random() * (w - btnW);
    const newTop = Math.random() * (h - btnH);
    noBtn.style.left = newLeft + 'px';
    noBtn.style.top = newTop + 'px';
    noBtn.style.transform = 'none';

    dodgeCount++;
    yesScale = Math.min(1 + dodgeCount * 0.12, 2.2);
    yesBtn.style.transform = `translate(-50%,-50%) scale(${yesScale})`;
    dodgeText.textContent = dodgePhrases[Math.min(dodgeCount-1, dodgePhrases.length-1)];
  }
  noBtn.addEventListener('mouseenter', dodgeNo);
  noBtn.addEventListener('touchstart', (e)=>{ e.preventDefault(); dodgeNo(); }, {passive:false});
  noBtn.addEventListener('click', (e)=>{ e.preventDefault(); dodgeNo(); });

  yesBtn.addEventListener('click', () => {
    questionBox.classList.add('hidden');
    loveResult.classList.remove('hidden');

    let hearts = '';
    for(let i=0;i<24;i++){
      const left = Math.random()*100;
      const delay = Math.random()*0.8;
      const size = 14 + Math.random()*16;
      hearts += `<div class="heart-fly" style="left:${left}%;animation-delay:${delay}s;font-size:${size}px;">💖</div>`;
    }
    heartBurst.innerHTML = hearts;
  });

});
