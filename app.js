// ==========================
// 📦 全域
// ==========================
let words = [];
let currentWord;
let phonicsArray = [];

let student = "";
let learnList = [];
let reviewQueue = []; // ⭐ 記憶曲線核心
let currentIndex = 0;
let score = 0;

// ==========================
// 📥 載入資料
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
  document.getElementById("learnBox").classList.remove("hidden");

  startLearning();
}


// ==========================
// 📚 開始學習（10字）
// ==========================
function startLearning() {
  learnList = shuffle([...words]).slice(0, 10);

  // ⭐ 初始化記憶曲線
  reviewQueue = [...learnList];

  currentIndex = 0;
  score = 0;

  showLearn();
}


// ==========================
// 📖 學習畫面
// ==========================
function showLearn() {
  currentWord = learnList[currentIndex];

  document.getElementById("progress").innerText =
    `📚 學習 ${currentIndex + 1} / 10`;

  document.getElementById("word").innerText = currentWord.word;
  document.getElementById("meaning").innerText = "👉 " + currentWord.meaning;
  document.getElementById("phonics").innerText = currentWord.phonics;

  let img = document.getElementById("image");
  img.src = currentWord.image || "https://via.placeholder.com/150";

  phonicsArray = currentWord.phonics?.split("-") || [];
}


// 下一個學習
function nextLearn() {
  currentIndex++;
  if (currentIndex >= 10) {
    startQuizMode();
  } else {
    showLearn();
  }
}


// ==========================
// 🎯 測驗開始
// ==========================
function startQuizMode() {
  currentIndex = 0;

  document.getElementById("learnBox").classList.add("hidden");
  document.getElementById("quizBox").classList.remove("hidden");

  showQuiz();
}


// ==========================
// ❓ 顯示題目（記憶曲線）
// ==========================
function showQuiz() {
  // ⭐ 從記憶隊列取題
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
// ✅ 檢查答案（核心🔥）
// ==========================
function checkAnswer(ans) {
  let correct = currentWord.word;

  if (ans === correct) {
    score++;
    document.getElementById("result").innerText = "✅ 正確";

    // ⭐ 答對 → 移除
    reviewQueue.shift();

  } else {
    document.getElementById("result").innerText = "❌ 錯誤";

    // ⭐ 答錯 → 丟到後面（稍後再考）
    reviewQueue.push(reviewQueue.shift());
  }

  setTimeout(() => {
    if (reviewQueue.length === 0) {
      showResult();
    } else {
      showQuiz();
    }
  }, 800);
}


// ==========================
// 📊 成績
// ==========================
function showResult() {
  document.getElementById("quizBox").classList.add("hidden");
  document.getElementById("resultBox").classList.remove("hidden");

  document.getElementById("score").innerText =
    `${student} 完成！得分：${score}`;
}


// ==========================
// 🔁 下一組
// ==========================
function nextGroup() {
  document.getElementById("resultBox").classList.add("hidden");
  document.getElementById("learnBox").classList.remove("hidden");

  startLearning();
}


// ==========================
// 🔊 發音
// ==========================
function playPhonics() {
  phonicsArray.forEach((p, i) => {
    setTimeout(() => speak(p), i * 600);
  });
}

function speak(text) {
  if (!text) return;

  speechSynthesis.cancel();

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
