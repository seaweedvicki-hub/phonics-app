// ==========================
// 📦 全域
// ==========================
let words = [];
let student = "";
let level = 1;

let learnList = [];
let reviewQueue = [];
let currentWord;
let score = 0;

// ==========================
// 📥 載入單字
// ==========================
const API_URL = "https://docs.google.com/spreadsheets/d/1SlXohdxvTSsmPdyjW2X1bZoepDVXG1FWppXGCn4NDzI/gviz/tq?tqx=out:json";

fetch(API_URL)
.then(res => res.text())
.then(text => {
  const json = JSON.parse(
    text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)
  );

  words = json.table.rows.map(row => ({
    word: row.c[0]?.v || "",
    phonics: row.c[1]?.v || "",
    meaning: row.c[2]?.v || "",
    image: row.c[3]?.v || ""
  })).filter(w => w.word);
});


// ==========================
// 👤 登入
// ==========================
function login() {
  student = document.getElementById("name").value;
  if (!student) return alert("請輸入名字");

  document.querySelector(".login").classList.add("hidden");
  document.getElementById("map").classList.remove("hidden");

  loadMap();
  loadReport();
}


// ==========================
// 🗺️ 地圖
// ==========================
function loadMap() {
  let box = document.getElementById("levels");
  box.innerHTML = "";

  for (let i = 1; i <= 5; i++) {
    let btn = document.createElement("button");
    btn.innerText = "關卡 " + i;

    if (i <= level) {
      btn.onclick = () => startLevel(i);
    } else {
      btn.disabled = true;
    }

    box.appendChild(btn);
  }
}


// ==========================
// 🎮 開始關卡
// ==========================
function startLevel(lv) {
  level = lv;

  learnList = shuffle([...words]).slice(0, 10);
  reviewQueue = [...learnList];
  score = 0;

  document.getElementById("map").classList.add("hidden");
  document.getElementById("learnBox").classList.remove("hidden");

  showLearn(0);
}


// ==========================
// 📚 學習
// ==========================
function showLearn(i) {
  currentWord = learnList[i];

  document.getElementById("progress").innerText =
    `關卡 ${level} - ${i+1}/10`;

  document.getElementById("word").innerText = currentWord.word;
  document.getElementById("meaning").innerText = currentWord.meaning;
  document.getElementById("phonics").innerText = currentWord.phonics;

  document.getElementById("image").src =
    currentWord.image || "https://via.placeholder.com/150";

  window.learnIndex = i;
}

function nextLearn() {
  let i = window.learnIndex + 1;

  if (i >= 10) {
    startQuiz();
  } else {
    showLearn(i);
  }
}


// ==========================
// 🎯 測驗（記憶曲線）
// ==========================
function startQuiz() {
  document.getElementById("learnBox").classList.add("hidden");
  document.getElementById("quizBox").classList.remove("hidden");
  showQuiz();
}

function showQuiz() {
  currentWord = reviewQueue[0];

  document.getElementById("quizWord").innerText = currentWord.phonics;

  let choices = shuffle([...words]).slice(0, 3);
  choices.push(currentWord);
  choices = shuffle(choices);

  let box = document.getElementById("choices");
  box.innerHTML = "";

  choices.forEach(c => {
    let img = document.createElement("img");
    img.src = c.image || "https://via.placeholder.com/100";
    img.onclick = () => checkAnswer(c.word);
    box.appendChild(img);
  });
}


// ==========================
// ✅ 檢查答案（記憶曲線）
// ==========================
function checkAnswer(ans) {
  if (ans === currentWord.word) {
    score++;
    reviewQueue.shift();
  } else {
    reviewQueue.push(reviewQueue.shift());
  }

  if (reviewQueue.length === 0) {
    finishLevel();
  } else {
    showQuiz();
  }
}


// ==========================
// 🏁 結束關卡
// ==========================
function finishLevel() {
  document.getElementById("quizBox").classList.add("hidden");
  document.getElementById("resultBox").classList.remove("hidden");

  document.getElementById("score").innerText =
    `${student} 關卡 ${level}：${score} 分`;

  saveReport();

  level++;
}


// ==========================
// 📊 家長報告（LocalStorage）
// ==========================
function saveReport() {
  let data = JSON.parse(localStorage.getItem("report") || "{}");

  if (!data[student]) data[student] = [];

  data[student].push({
    level: level,
    score: score,
    time: new Date().toLocaleString()
  });

  localStorage.setItem("report", JSON.stringify(data));
}

function loadReport() {
  let data = JSON.parse(localStorage.getItem("report") || "{}");
  let box = document.getElementById("report");

  if (!data[student]) return;

  box.innerHTML = "<h3>📊 學習紀錄</h3>";

  data[student].forEach(r => {
    let p = document.createElement("p");
    p.innerText = `關卡${r.level}：${r.score}分 (${r.time})`;
    box.appendChild(p);
  });
}


// ==========================
// 🔙 回地圖
// ==========================
function backToMap() {
  document.getElementById("resultBox").classList.add("hidden");
  document.getElementById("map").classList.remove("hidden");

  loadMap();
  loadReport();
}


// ==========================
// 🔊 發音
// ==========================
function playPhonics() {
  let arr = currentWord.phonics.split("-");
  arr.forEach((p, i) => {
    setTimeout(() => speak(p), i * 600);
  });
}

function speak(text) {
  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-US";
  speechSynthesis.speak(msg);
}


// ==========================
// 🔀 工具
// ==========================
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
