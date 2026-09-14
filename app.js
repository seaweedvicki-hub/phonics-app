// =====================
// 🔥 基本資料
// =====================
let words = [];
let currentSet = [];
let currentIndex = 0;
let currentWord = null;
let score = 0;
let user = "";

// 🧠 記憶曲線
let memoryData = JSON.parse(localStorage.getItem("memoryData") || "{}");

// =====================
// 📥 載入單字
// =====================
const API_URL = "你的GoogleSheetAPI";

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

});

// =====================
// 👤 登入
// =====================
function login() {
  user = document.getElementById("name").value;
  document.querySelector(".login").classList.add("hidden");
  document.querySelector(".app").classList.remove("hidden");

  document.getElementById("player").innerText = "👶 " + user;

  generateMap();
  startLearning();
}

// =====================
// 🗺 闖關地圖
// =====================
function generateMap() {
  let map = document.getElementById("map");
  map.innerHTML = "";

  for (let i = 0; i < 10; i++) {
    let node = document.createElement("span");
    node.innerText = "🔒";
    map.appendChild(node);
  }
}

// =====================
// 📘 學習
// =====================
function startLearning() {
  currentSet = shuffle(words).slice(0, 10);
  currentIndex = 0;
  showWord();
}

function showWord() {
  currentWord = currentSet[currentIndex];

  document.getElementById("word").innerText = currentWord.word;
  document.getElementById("meaning").innerText = currentWord.meaning;

  document.getElementById("image").src = currentWord.image;

  let chunks = currentWord.phonics.includes("-")
    ? currentWord.phonics.split("-")
    : [currentWord.word];

  let html = "";
  chunks.forEach(c => {
    html += `<span onclick="speak('${c}')">${c}</span>`;
  });

  document.getElementById("phonics").innerHTML = html;
}

// 下一個
function nextLearn() {
  currentIndex++;
  if (currentIndex >= currentSet.length) {
    alert("學習完成，開始測驗！");
    startQuizMode();
    return;
  }
  showWord();
}

// =====================
// 🔊 發音
// =====================
function speak(text) {
  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-US";
  speechSynthesis.speak(msg);
}

// =====================
// 🎯 測驗
// =====================
function startQuizMode() {
  document.querySelector(".quiz").classList.remove("hidden");

  currentIndex = 0;
  score = 0;

  nextQuiz();
}

function nextQuiz() {
  if (currentIndex >= currentSet.length) {
    endQuiz();
    return;
  }

  let correct = currentSet[currentIndex];

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

// =====================
// 🧠 記憶曲線
// =====================
function updateMemory(word, correct) {
  let now = Date.now();

  if (!memoryData[word]) memoryData[word] = { level: 0 };

  if (correct) memoryData[word].level++;
  else memoryData[word].level = 0;

  let delay = [60000, 300000, 86400000];
  let lvl = memoryData[word].level;

  memoryData[word].nextTime = now + delay[Math.min(lvl, 2)];

  localStorage.setItem("memoryData", JSON.stringify(memoryData));
}

// =====================
// 判斷
// =====================
function checkAnswer(ans, correct) {
  let isCorrect = ans === correct;

  if (isCorrect) score++;

  updateMemory(correct, isCorrect);

  currentIndex++;
  nextQuiz();
}

// =====================
// 🎉 結束
// =====================
function endQuiz() {
  document.getElementById("result").innerText =
    `🎉 分數：${score}/10`;

  unlockMap();
}

// =====================
// 🔓 闖關開鎖
// =====================
function unlockMap() {
  let map = document.getElementById("map").children;

  for (let i = 0; i < score; i++) {
    map[i].innerText = "⭐";
  }
}

// =====================
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
