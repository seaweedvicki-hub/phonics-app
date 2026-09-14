// =======================
// 🔥 全域變數
// =======================
let words = [];
let currentSet = [];
let currentWord = null;
let quizIndex = 0;
let score = 0;
let user = localStorage.getItem("user") || "";

// 🧠 記憶資料
let memoryData = JSON.parse(localStorage.getItem("memoryData") || "{}");

// Google Sheet API
const API_URL = "https://docs.google.com/spreadsheets/d/1SlXohdxvTSsmPdyjW2X1bZoepDVXG1FWppXGCn4NDzI/gviz/tq?tqx=out:json";

// =======================
// 📥 載入資料
// =======================
fetch(API_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));
    const rows = json.table.rows;

    words = rows.map(r => ({
      word: r.c[0]?.v || "",
      phonics: r.c[1]?.v || "",
      meaning: r.c[2]?.v || "",
      image: r.c[3]?.v || ""
    })).filter(w => w.word);

    startLearningCycle();
  });

// =======================
// 🧑‍🎓 登入
// =======================
function login() {
  user = document.getElementById("name").value;
  localStorage.setItem("user", user);

  document.querySelector(".login").classList.add("hidden");
  document.querySelector(".app").classList.remove("hidden");
}

// =======================
// 🔁 學習流程（10字一組）
// =======================
function startLearningCycle() {
  words = shuffle(words);
  loadNextSet();
}

function loadNextSet() {
  currentSet = words.slice(0, 10);
  showWord(currentSet[0]);
}

// =======================
// 📘 顯示單字（含音節積木）
// =======================
function showWord(w) {
  currentWord = w;

  document.getElementById("word").innerText = w.word;
  document.getElementById("meaning").innerText = "👉 " + w.meaning;

  document.getElementById("image").src = w.image;

  let chunks = w.phonics.includes("-") ? w.phonics.split("-") : [w.word];

  // ⭐ 積木UI
  let html = "";
  chunks.forEach(c => {
    html += `<span class="chunk" onclick="speak('${c}')">${c}</span>`;
  });

  document.getElementById("phonics").innerHTML = html;
}

// =======================
// 🔊 發音
// =======================
function speak(text) {
  speechSynthesis.cancel();
  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-US";
  speechSynthesis.speak(msg);
}

// =======================
// 🎬 拼音播放
// =======================
function playPhonics() {
  let chunks = currentWord.phonics.includes("-")
    ? currentWord.phonics.split("-")
    : [currentWord.word];

  speakChunks(chunks, 0);
}

function speakChunks(arr, i) {
  if (i >= arr.length) {
    setTimeout(() => speak(currentWord.word), 400);
    return;
  }

  speak(arr[i]);
  setTimeout(() => speakChunks(arr, i + 1), 700);
}

// =======================
// 🎯 測驗模式（記憶曲線）
// =======================
function startQuizMode() {
  document.querySelector(".quiz").classList.remove("hidden");

  currentSet = getReviewWords();
  quizIndex = 0;
  score = 0;

  nextQuiz();
}

// 🧠 取得要測驗的10字（記憶曲線核心）
function getReviewWords() {
  let now = Date.now();

  let dueWords = words.filter(w => {
    let m = memoryData[w.word];
    return !m || m.nextTime <= now;
  });

  return shuffle(dueWords).slice(0, 10);
}

// =======================
// 題目
// =======================
function nextQuiz() {
  if (quizIndex >= currentSet.length) {
    endQuiz();
    return;
  }

  let correct = currentSet[quizIndex];

  let options = shuffle(words).slice(0, 4);

  let div = document.getElementById("choices");
  div.innerHTML = "";

  options.forEach(o => {
    let btn = document.createElement("button");
    btn.innerText = o.word;
    btn.onclick = () => checkAnswer(o.word, correct.word);
    div.appendChild(btn);
  });

  document.getElementById("word").innerText = correct.word;
}

// =======================
// 🧠 記憶曲線更新
// =======================
function updateMemory(word, isCorrect) {
  let now = Date.now();

  if (!memoryData[word]) {
    memoryData[word] = { level: 0 };
  }

  if (isCorrect) {
    memoryData[word].level++;
  } else {
    memoryData[word].level = 0;
  }

  // ⭐ 記憶曲線時間
  let delay = [60000, 300000, 86400000]; // 1分,5分,1天

  let level = memoryData[word].level;
  let nextDelay = delay[Math.min(level, delay.length - 1)];

  memoryData[word].nextTime = now + nextDelay;

  localStorage.setItem("memoryData", JSON.stringify(memoryData));
}

// =======================
// 判斷答案
// =======================
function checkAnswer(ans, correct) {
  let isCorrect = ans === correct;

  if (isCorrect) {
    score++;
    document.getElementById("result").innerText = "✅ 正確";
  } else {
    document.getElementById("result").innerText = "❌ 再試一次";
  }

  updateMemory(correct, isCorrect);

  quizIndex++;
  setTimeout(nextQuiz, 800);
}

// =======================
// 🎉 測驗結束
// =======================
function endQuiz() {
  document.getElementById("result").innerText = `🎉 得分：${score}/10`;

  // 存Firebase
  if (typeof db !== "undefined") {
    db.collection("results").add({
      name: user,
      score: score,
      time: new Date()
    });
  }
}

// =======================
// 🔀 工具
// =======================
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
