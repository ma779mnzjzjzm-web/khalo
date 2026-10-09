const $ = id => document.getElementById(id);

let audioCtx;
let masterGain;
let oscillatorTimer;

let quizIndex = 0;
let score = 0;
let meter = 10;


// =========================
// QUIZ DATA
// =========================

const quiz = [
  {
    q: "اكتر وااحد بيعبصني",
    a: ["Khalo", "أنا", "الاتنين"],
    c: 0
  },
  {
    q: "مستوى الرخامة الطبيعي عند Khalo؟",
    a: ["10%", "50%", "100%"],
    c: 2
  },
  {
    q: "Khalo بالنسبة لي إيه؟",
    a: ["صاحب عادي", "أخويا", "محمد راجي "],
    c: 1
  },
  {
    q: "إيه المتوقع بعد عيد الميلاد؟",
    a: ["ذكريات أكتر", "هدوء", "مفيش خناقات"],
    c: 0
  }
];


// =========================
// BUG REPORTS
// =========================

const bugs = [
`KHALO SYSTEM DIAGNOSTIC
------------------------
✓ Friendship module: 100%
✓ Laugh engine: OVERCLOCKED
✗ Punctuality: NOT FOUND
✗ Serious mode: NOT FOUND
✓ Brother status: VERIFIED
WARNING: User is still extremely annoying 😂`,

`SYSTEM ERROR: KHALO
------------------------
Error 404: الهدوء غير موجود
Error 418: الرخامة طبيعية
Warning: الضحك عالي
Status: BROTHER FOREVER ❤️`,

`SCAN COMPLETE
------------------------
Late arrivals: ∞
Funny moments: 999+
Arguments: MANY
Memories: TOO MANY
Friendship: UNLIMITED
Result: KEEP THIS FRIEND 😂`
];


// =========================
// PAGE LOAD
// =========================

window.addEventListener("load", () => {

  createParticles();

  let p = 0;

  const t = setInterval(() => {

    p += Math.floor(Math.random() * 9) + 4;

    if (p >= 100) {

      p = 100;

      clearInterval(t);

      setTimeout(() => {

        $("loadingScreen").classList.add("hidden");
        $("gateScreen").classList.remove("hidden");

      }, 450);
    }

    $("progressBar").style.width = p + "%";
    $("progressText").textContent = p + "%";

  }, 120);


  loadWishes();
  updatePreview();
  showQuiz();
  newBug();

});


// =========================
// GATE / PASSWORD
// =========================

$("gateBtn").onclick = enterSite;

$("gateInput").addEventListener("keydown", e => {

  if (e.key === "Enter") {
    enterSite();
  }

});


function enterSite() {

  const v = $("gateInput").value.trim().toLowerCase();

  if (
    v === "خالو" ||
    v === "khalo" ||
    v === "انا" ||
    v === "أنا" ||
    v === "هو"
  ) {

    $("gateScreen").classList.add("hidden");
    $("site").classList.remove("hidden");

    startAudio();

    toast("أهلاً بـ Khalo ❤️");

    scrollToId("site");

  } else {

    $("gateError").textContent = "الإجابة غلط  جرب تاني";

  }

}


function scrollToId(id) {

  document
    .getElementById(id)
    ?.scrollIntoView({
      behavior: "smooth"
    });

}


// =========================
// AUDIO
// =========================

function startAudio() {

  if (audioCtx) return;

  audioCtx = new (
    window.AudioContext ||
    window.webkitAudioContext
  )();

  masterGain = audioCtx.createGain();

  masterGain.gain.value = 0.045;

  masterGain.connect(audioCtx.destination);

  playTone(
    [261.63, 329.63, 392, 523.25],
    0.16
  );

  $("soundBtn").textContent = "🔊";

}


// =========================
// SOUND BUTTON
// =========================

$("soundBtn").onclick = () => {

  if (!audioCtx) {

    startAudio();

  } else if (masterGain.gain.value > 0) {

    masterGain.gain.value = 0;

    $("soundBtn").textContent = "🔇";

  } else {

    masterGain.gain.value = 0.045;

    $("soundBtn").textContent = "🔊";

    playTone(
      [392, 523, 659],
      0.12
    );

  }

};


// =========================
// PLAY TONE
// =========================

function playTone(notes, dur = 0.15) {

  if (
    !audioCtx ||
    masterGain.gain.value === 0
  ) {
    return;
  }

  notes.forEach((n, i) => {

    const o = audioCtx.createOscillator();

    const g = audioCtx.createGain();

    o.type = "sine";

    o.frequency.value = n;

    g.gain.setValueAtTime(
      0,
      audioCtx.currentTime + i * dur
    );

    g.gain.linearRampToValueAtTime(
      0.55,
      audioCtx.currentTime +
      i * dur +
      0.02
    );

    g.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime +
      i * dur +
      dur
    );

    o.connect(g);

    g.connect(masterGain);

    o.start(
      audioCtx.currentTime +
      i * dur
    );

    o.stop(
      audioCtx.currentTime +
      i * dur +
      dur
    );

  });

}


// =========================
// BLOW CANDLE SOUND
// =========================

function blowSound() {

  if (
    !audioCtx ||
    masterGain.gain.value === 0
  ) {
    return;
  }

  const buffer = audioCtx.createBuffer(
    1,
    audioCtx.sampleRate * 0.5,
    audioCtx.sampleRate
  );

  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {

    data[i] =
      (Math.random() * 2 - 1) *
      (
        0.25 *
        (1 - i / data.length)
      );

  }

  const src =
    audioCtx.createBufferSource();

  const g =
    audioCtx.createGain();

  src.buffer = buffer;

  g.gain.value = 0.5;

  src.connect(g);

  g.connect(masterGain);

  src.start();

}


// =========================
// MESSAGE PREVIEW
// =========================

function updatePreview() {

  $("previewName").textContent =
    $("toName").value || "Khalo";

  $("previewFrom").textContent =
    $("fromName").value || "Your Friend";

  $("previewMessage").textContent =
    $("messageInput").value;

}


[
  "toName",
  "fromName",
  "messageInput"
].forEach(id => {

  $(id).addEventListener(
    "input",
    updatePreview
  );

});


// =========================
// QUIZ
// =========================

function showQuiz() {

  const x = quiz[quizIndex];

  $("quizQuestion").textContent = x.q;

  $("quizAnswers").innerHTML = "";

  x.a.forEach((ans, i) => {

    const b =
      document.createElement("button");

    b.className = "answer";

    b.textContent = ans;

    b.onclick = () => answerQuiz(i);

    $("quizAnswers").appendChild(b);

  });

  $("quizResult").textContent = "";

  $("nextQuiz").classList.add("hidden");

}


// =========================
// ANSWER QUIZ
// =========================

function answerQuiz(i) {

  const x = quiz[quizIndex];

  document
    .querySelectorAll(".answer")
    .forEach(b => {

      b.disabled = true;

    });


  if (i === x.c) {

    score++;

    $("quizResult").textContent =
      "صح يا خالوووو ";

  } else {

    $("quizResult").textContent =
      "غلط  بس نعديهالك";

  }

  $("nextQuiz").classList.remove("hidden");

}


// =========================
// NEXT QUESTION
// =========================

$("nextQuiz").onclick = () => {

  quizIndex++;

  if (quizIndex >= quiz.length) {

    $("quizQuestion").textContent =
      `خلصنا! نتيجتك ${score}/${quiz.length} ❤️`;

    $("quizAnswers").innerHTML = "";

    $("quizResult").textContent =
      score >= 3
        ? "أنت عارف Khalo كويس جدًا 😂"
        : "محتاج تقعد مع Khalo أكتر 😂";

    $("nextQuiz").classList.add("hidden");

    return;
  }

  showQuiz();

};


// =========================
// FRIENDSHIP METER
// =========================

function boostMeter() {

  meter = Math.min(
    100,
    meter + 22
  );

  $("meterFill").style.width =
    meter + "%";


  const texts = [
    "لسه بنبدأ...",
    "صاحبية كويسة",
    "أصحاب جامدين",
    "أخوات رسمي",
    "KHALO LEVEL: UNLIMITED ❤️"
  ];

  $("meterText").textContent =
    texts[
      Math.min(
        4,
        Math.floor(meter / 22)
      )
    ];


  playTone(
    [330, 440, 554],
    0.1
  );

}


// =========================
// WISH WALL
// =========================

function addWish() {

  const input = $("wishInput");

  const text =
    input.value.trim();

  if (!text) return;


  const wishes =
    JSON.parse(
      localStorage.getItem("khaloWishes") || "[]"
    );


  wishes.unshift(text);


  localStorage.setItem(
    "khaloWishes",
    JSON.stringify(wishes)
  );


  input.value = "";

  renderWishes(wishes);

  toast("الأمنية اتضافت ❤️");

}


// =========================
// LOAD WISHES
// =========================

function loadWishes() {

  renderWishes(
    JSON.parse(
      localStorage.getItem("khaloWishes") || "[]"
    )
  );

}


// =========================
// RENDER WISHES
// =========================

function renderWishes(wishes) {

  $("wishWall").innerHTML = "";


  if (!wishes.length) {

    wishes = [
      "ربنا يحققلك كل اللي نفسك فيه ❤️",
      "سنة جديدة مليانة ضحك ونجاح 🎂",
      "تفضل دايمًا صاحبي وأخويا"
    ];

  }


  wishes.forEach((w, i) => {

    const d =
      document.createElement("div");

    d.className = "glass wish";

    d.innerHTML =
      `<b>WISH #${i + 1}</b><span></span>`;


    d.querySelector("span").textContent =
      w;


    $("wishWall").appendChild(d);

  });

}


// =========================
// BUG REPORT
// =========================

function newBug() {

  $("bugText").textContent =
    bugs[
      Math.floor(
        Math.random() * bugs.length
      )
    ];

}


// =========================
// BLOW CANDLES
// =========================

function blowCandles() {

  blowSound();

  $("cakeArea").classList.add("hidden");

  $("finalMessage").classList.remove("hidden");

  celebrate();

  toast("أهو كده الشموع اطفَت ");

}


// =========================
// CELEBRATION
// =========================

function celebrate() {

  playTone(
    [523.25, 659.25, 783.99, 1046.5],
    0.12
  );


  for (let i = 0; i < 90; i++) {

    const c =
      document.createElement("i");

    c.className = "confetti";

    c.style.left =
      Math.random() * 100 + "vw";

    c.style.animationDuration =
      (2 + Math.random() * 3) + "s";

    c.style.transform =
      `rotate(${Math.random() * 360}deg)`;

    c.style.background =
      `hsl(${Math.random() * 360},85%,65%)`;

    document.body.appendChild(c);


    setTimeout(() => {

      c.remove();

    }, 5200);

  }

}


// =========================
// TOAST
// =========================

function toast(t) {

  const x = $("toast");

  x.textContent = t;

  x.classList.add("toast-show");


  setTimeout(() => {

    x.classList.remove("toast-show");

  }, 2200);

}


// =========================
// BACKGROUND PARTICLES
// =========================

function createParticles() {

  const p = $("particles");


  for (let i = 0; i < 45; i++) {

    const s =
      document.createElement("i");

    s.className = "particle";

    s.style.left =
      Math.random() * 100 + "%";

    s.style.top =
      Math.random() * 100 + "%";

    s.style.animationDelay =
      Math.random() * 3 + "s";


    p.appendChild(s);

  }

}