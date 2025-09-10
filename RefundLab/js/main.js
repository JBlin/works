// === Step-up vertical infinite loop (no reverse flash, stable every lap) ===
(() => {
  const track = document.getElementById('slider');
  if (!track) return;

  // 현재 트랙에 있는 카드 수집
  const cards = Array.from(track.querySelectorAll('.slider-card'));
  const ORIG_LEN = cards.length;                 // 원본 개수(예: 6)
  if (ORIG_LEN < 2) return;

  // 이미 무한루프용 복제본이 없다면 한 번만 복제해서 뒤에 붙임 (총 2배)
  if (!track.dataset.cloned) {
    const frag = document.createDocumentFragment();
    cards.forEach(el => frag.appendChild(el.cloneNode(true)));
    track.appendChild(frag);
    track.dataset.cloned = '1';
  }

  // 실측으로 "한 칸" 이동 간격(px) 계산 (grid gap 포함)
  const measureStep = () => {
    const all = track.querySelectorAll('.slider-card');
    if (all.length < 2) return 0;
    const a = all[0].getBoundingClientRect().top;
    const b = all[1].getBoundingClientRect().top;
    return Math.round(b - a);
  };
  let STEP = measureStep();

  const DURATION = 400;               // CSS와 맞추기
  let index = 0;                      // 현재 '맨 위' 전역 인덱스
  const CENTER_OFFSET = 1;            // 3개 보일 때 센터 = 맨위+1

  // inline transition을 우리가 제어 (역방향 튐 방지)
  track.style.transitionProperty = 'transform';
  track.style.transitionTimingFunction = 'ease';
  track.style.willChange = 'transform';

  const setDuration = ms =>
    track.style.transitionDuration = `${ms}ms`;

  const setTransform = i =>
    track.style.transform = `translateY(-${i * STEP}px)`;

  const applyActive = () => {
    const all = track.querySelectorAll('.slider-card');
    all.forEach(el => el.classList.remove('active'));
    const pos = index + CENTER_OFFSET;
    // 경계 구간 깜빡임 방지: 원본/복제 쌍 둘 다 표시
    const total = all.length;             // 2*ORIG_LEN
    const mirror = (pos + ORIG_LEN) % total;
    if (all[pos])   all[pos].classList.add('active');
    if (all[mirror]) all[mirror].classList.add('active');
  };

  const next = () => {
    index += 1;
    setDuration(DURATION);
    setTransform(index);
  };

  // 이동 끝난 뒤에만 active 적용 + 한 바퀴 넘으면 "순간 스냅"
  track.addEventListener('transitionend', e => {
    if (e.propertyName !== 'transform') return;

    applyActive();

    // index가 원본 길이를 넘어가면 (복제셋 같은 위치에 있음)
    if (index >= ORIG_LEN) {
      index -= ORIG_LEN;            // 원본 같은 위치로 보정
      setDuration(0);               // transition 완전 끔(역방향 튐 방지)
      setTransform(index);          // 순간 점프
      // 다음 프레임에 transition 재개 (double-raf 권장)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setDuration(DURATION));
      });
    }
  });

  // 초기 상태
  setDuration(0);
  setTransform(0);
  requestAnimationFrame(() => {
    setDuration(DURATION);
    applyActive();
  });

  // 주기 이동 (무한루프)
  const INTERVAL = 2000; // 2초마다 한 칸
  setInterval(next, INTERVAL);

  // 레이아웃 변동(폰트/리사이즈) 대응: 간격 재계산 + 위치 보정
  const reflow = () => {
    const newStep = measureStep();
    if (!newStep || newStep === STEP) return;
    STEP = newStep;
    setDuration(0);
    setTransform(index);
    requestAnimationFrame(() => {
      setDuration(DURATION);
      applyActive();
    });
  };
  window.addEventListener('resize', reflow);
  window.addEventListener('load', reflow);
})();


window.addEventListener("scroll", () => {
  const body = document.body;
  const html = document.documentElement;
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const docHeight = Math.max(
    body.scrollHeight, body.offsetHeight,
    html.clientHeight, html.scrollHeight, html.offsetHeight
  );

  if (scrollTop + windowHeight >= docHeight - 10) {
    document.body.classList.add("scrolled-to-bottom");
  } else {
    document.body.classList.remove("scrolled-to-bottom");
  }
});
