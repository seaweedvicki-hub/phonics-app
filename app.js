function getLevel(word) {
  let p = progress[word] || 0;

  if (p === 0) return "❌ 不會";
  if (p <= 2) return "⚠️ 練習中";
  return "✅ 熟練";
}
let words = [];
let currentWord;
let phonicsArray = [];
let index = 0;

let userName = "";
let learnedWords = [];
let quizWords = [];
let currentIndex = 0;
let score = 0;
let progress = {};

// ⭐ API
const API_URL ="https://docs.google.com/spreadsheets/d/1SlXohdxvTSsmPdyjW2X1bZoepDVXG1FWppXGCn4NDzI/gviz/tq?tqx=out:json";

// 讀資料
fetch(API_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(
      text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)
    );

    const rows = json.table.rows;

    words = rows.map(row => ({
      word: row.c[0]?.v || "",
      phonics: row.c[1]?.v || "",
      meaning: row.c[2]?.v || "",
      image: row.c[3]?.v || ""
    })).filter(w => w.word);
  });

// 👤 登入
function login() {
  userName = document.getElementById("name").value;

  if (!userName) return alert("請輸入名字");

  let saved = localStorage.getItem(userName + "_progress");
  if (saved) progress = JSON.parse(saved);

  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("learnPage").classList.remove("hidden");

  document.getElementById("welcome").innerText = "👋 " + userName;

  startLearning();
}

// 📘 預習10字
function startLearning() {
  learnedWords = shuffle(words).slice(0, 10);
  currentIndex = 0;
  showLearnWord();
}

function nextLearn() {
  currentIndex++;
  if (currentIndex >= 10) return alert("預習完成！");
  showLearnWord();
}

function showLearnWord() {
  let w = learnedWords[currentIndex];

  currentWord = w;

  document.getElementById("word").innerText = w.word;
  document.getElementById("meaning").innerText = "👉 " + w.meaning;

  phonicsArray = w.phonics?.split("-") || [w.word];
}

// 🔊 發音
function speak(text) {
  if (!text) return;
  speechSynthesis.cancel();
  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-US";
  speechSynthesis.speak(msg);
}

// 🎬 發音動畫
function playPhonics() {
  speechSynthesis.cancel();

  let unlock = new SpeechSynthesisUtterance("ok");
  speechSynthesis.speak(unlock);

  index = 0;

  setTimeout(playNext, 200);
}

function playNext() {
  if (index >= phonicsArray.length) {
    speak(currentWord.word);
    return;
  }

  speak(phonicsArray[index]);
  index++;
  setTimeout(playNext, 800);
}

// 🎯 測驗（記憶曲線🔥）
function startQuizMode() {
  document.getElementById("learnPage").classList.add("hidden");
  document.getElementById("quizPage").classList.remove("hidden");

  quizWords = getSmartQuizWords();
  currentIndex = 0;
  score = 0;

  showQuiz(document.getElementById("quizPhonics").innerText =
  w.phonics?.split("-").join(" ") || "";);
}

function getSmartQuizWords() {
  let pool = [];

  words.forEach(w => {
    let level = progress[w.word] || 0;
let weight;

if (level === 0) {
  weight = 5; // ❌ 不會 → 很常出現
} else if (level <= 2) {
  weight = 3; // ⚠️ 練習中 → 中等
} else {
  weight = 1; // ✅ 熟練 → 偶爾
}

    for (let i = 0; i < weight; i++) {
      pool.push(w);
    }
  });

  return shuffle(pool).slice(0, 10);
}

// 題目
function showQuiz() {
  let w = quizWords[currentIndex];

  document.getElementById("qNum").innerText = currentIndex + 1;
  document.getElementById("quizWord").innerText = w.word;

  let choices = shuffle(words).slice(0, 3);
  choices.push(w);
  choices = shuffle(choices);

  let div = document.getElementById("choices");
  div.innerHTML = "";

  choices.forEach(o => {
    let btn = document.createElement("button");
    btn.innerText = o.word;
    btn.onclick = () => checkAnswer(o.word);
    div.appendChild(btn);
  });
}

// 答題
function checkAnswer(ans) {
  let correct = quizWords[currentIndex].word;

  if (ans === correct) {
    score++;
    progress[correct] = Math.min((progress[correct] || 0) + 1, 4);
  } else {
    progress[correct] = 0;
  }

  currentIndex++;

  if (currentIndex >= 10) {
    saveResult();
    showResult();
  } else {
    showQuiz();
  }
}

// 儲存
function saveResult() {
  let data = JSON.parse(localStorage.getItem(userName) || "[]");

  data.push({
    date: new Date().toLocaleString(),
    score: score
  });

  localStorage.setItem(userName, JSON.stringify(data));
  localStorage.setItem(userName + "_progress", JSON.stringify(progress));
}

// 成績畫面
function showResult() {
  document.getElementById("quizPage").classList.add("hidden");
  document.getElementById("resultPage").classList.remove("hidden");

  document.getElementById("score").innerText = score + " / 10";
}

// 工具
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
