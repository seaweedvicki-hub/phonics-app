let words = [];
let currentIndex = 0;
let currentSet = [];
let quizIndex = 0;
let score = 0;
let user = "";

// Google Sheet API
const API_URL = "https://docs.google.com/spreadsheets/d/1SlXohdxvTSsmPdyjW2X1bZoepDVXG1FWppXGCn4NDzI/gviz/tq?tqx=out:json";

// 🔥 載入資料
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

// 🧑‍🎓 登入
function login() {
  user = document.getElementById("name").value;
  localStorage.setItem("user", user);

  document.querySelector(".login").classList.add("hidden");
  document.querySelector(".app").classList.remove("hidden");
}

// 🔁 全單字跑一輪
function startLearningCycle() {
  words = shuffle(words);
  currentIndex = 0;
  nextLearn();
}

// 📘 學習（10字一組）
function nextLearn() {
  if (currentIndex % 10 === 0) {
    currentSet = words.slice(currentIndex, currentIndex + 10);
  }

  let w = currentSet[currentIndex % 10];

  showWord(w);
  currentIndex++;
}

// 🖼 顯示
function showWord(w) {
  document.getElementById("word").innerText = w.word;
  document.getElementById("meaning").innerText = "👉 " + w.meaning;

  let img = document.getElementById("image");
  img.src = w.image;

  let chunks = w.phonics.includes("-") ? w.phonics.split("-") : [w.word];

  document.getElementById("phonics").innerText = chunks.join(" + ");
}

// 🔊 發音
function playPhonics() {
  let w = currentSet[(currentIndex - 1) % 10];
  let chunks = w.phonics.includes("-") ? w.phonics.split("-") : [w.word];

  speakChunks(chunks, 0, w.word);
}

function speakChunks(chunks, i, full) {
  if (i >= chunks.length) {
    setTimeout(() => speak(full), 400);
    return;
  }

  speak(chunks[i]);
  setTimeout(() => speakChunks(chunks, i + 1, full), 700);
}

function speak(text) {
  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-US";
  speechSynthesis.speak(msg);
}

// 🎯 測驗模式
function startQuizMode() {
  document.querySelector(".quiz").classList.remove("hidden");
  quizIndex = 0;
  score = 0;
  nextQuiz();
}

// 題目
function nextQuiz() {
  if (quizIndex >= currentSet.length) {
    endQuiz();
    return;
  }

  let correct = currentSet[quizIndex];

  let choices = shuffle([...currentSet]).slice(0, 4);

  let div = document.getElementById("choices");
  div.innerHTML = "";

  choices.forEach(c => {
    let btn = document.createElement("button");
    btn.innerText = c.word;
    btn.onclick = () => checkAnswer(c.word, correct.word);
    div.appendChild(btn);
  });

  document.getElementById("word").innerText = correct.word;
}

// 判斷
function checkAnswer(ans, correct) {
  if (ans === correct) {
    score++;
    document.getElementById("result").innerText = "✅ 正確";
  } else {
    document.getElementById("result").innerText = "❌ 錯誤";
  }

  quizIndex++;
  setTimeout(nextQuiz, 800);
}

// 🧠 測驗結束
function endQuiz() {
  document.getElementById("result").innerText = `🎉 得分：${score}/10`;

  db.collection("results").add({
    name: user,
    score: score,
    time: new Date()
  });
}

// 🔀 工具
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
