let words = [];
let currentGroup = [];
let currentIndex = 0;
let currentWord;
let phonicsArray = [];
let index = 0;

const GROUP_SIZE = 10;

// ⭐ Google Sheet API
const API_URL = "https://docs.google.com/spreadsheets/d/1SlXohdxvTSsmPdyjW2X1bZoepDVXG1FWppXGCn4NDzI/gviz/tq?tqx=out:json";

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

    startLearning();
  });

// ==========================
// 🎯 初始化10字
// ==========================
function startLearning() {
  currentGroup = shuffle([...words]).slice(0, GROUP_SIZE);
  currentIndex = 0;
  showWord();
}

// ==========================
// 📘 顯示單字（預習模式）
// ==========================
function showWord() {
  currentWord = currentGroup[currentIndex];

  document.getElementById("word").innerText = currentWord.word;
  document.getElementById("meaning").innerText = "👉 " + currentWord.meaning;

  const img = document.getElementById("image");
  img.src = currentWord.image || "";
  img.onerror = () => {
    img.onerror = null;
    img.src = "https://via.placeholder.com/150";
  };

  phonicsArray = currentWord.phonics && currentWord.phonics.includes("-")
    ? currentWord.phonics.split("-")
    : [currentWord.word];

  document.getElementById("phonics").innerText =
    phonicsArray.map(p => "[" + p + "]").join(" ");
}

// ==========================
// ▶ 下一個（預習）
// ==========================
function nextLearn() {
  currentIndex++;

  if (currentIndex >= currentGroup.length) {
    alert("✅ 預習完成！準備測驗");
    startQuizMode();
    return;
  }

  showWord();
}

// ==========================
// 🔊 發音
// ==========================
function speak(text) {
  if (!text) return;

  speechSynthesis.cancel();

  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-US";
  speechSynthesis.speak(msg);
}

// ==========================
// 🎬 自然發音（逐個拼）
// ==========================
function playPhonics() {
  if (!currentWord) return;

  speechSynthesis.cancel();

  // ⭐ 解鎖語音
  let unlock = new SpeechSynthesisUtterance(".");
  unlock.volume = 0;
  speechSynthesis.speak(unlock);

  index = 0;
  document.getElementById("phonics").innerText = "";

  setTimeout(playNext, 200);
}

function playNext() {
  if (index >= phonicsArray.length) {
    setTimeout(() => {
      document.getElementById("phonics").innerText = currentWord.word;
      speak(currentWord.word);
    }, 500);
    return;
  }

  let sound = phonicsArray[index];

  document.getElementById("phonics").innerText += "[" + sound + "] ";
  speak(sound);

  index++;
  setTimeout(playNext, 700);
}

// ==========================
// 🎯 測驗模式
// ==========================
function startQuizMode() {
  document.getElementById("result").innerText = "";
  showQuiz();
}

function showQuiz() {
  currentWord = currentGroup[Math.floor(Math.random() * currentGroup.length)];

  document.getElementById("word").innerText = "🔊 聽音選字";
  document.getElementById("meaning").innerText = "";

  speak(currentWord.word);

  let choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  let options = shuffle([...currentGroup]).slice(0, 4);

  options.forEach(option => {
    let btn = document.createElement("button");
    btn.innerText = option.word;
    btn.onclick = () => checkAnswer(option.word);
    choicesDiv.appendChild(btn);
  });
}

// ==========================
// ✔ 檢查答案
// ==========================
function checkAnswer(ans) {
  if (ans === currentWord.word) {
    document.getElementById("result").innerText = "✅ 答對！";
  } else {
    document.getElementById("result").innerText = "❌ 再試一次";
  }

  setTimeout(showQuiz, 1000);
}

// ==========================
// 🔀 洗牌
// ==========================
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
