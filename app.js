// =====================
// 🌍 全域變數
// =====================
let words = [];
let wordGroups = [];
let currentGroup = [];
let groupIndex = 0;
let wordIndex = 0;
let currentWord;
let phonicsArray = [];
let index = 0;

let mode = "learn"; // learn / quiz
let wrongWords = [];

// 👤 學生
let student = localStorage.getItem("student") || "";

// =====================
// 🔗 Google Sheet API
// =====================
const API_URL ="https://docs.google.com/spreadsheets/d/1SlXohdxvTSsmPdyjW2X1bZoepDVXG1FWppXGCn4NDzI/gviz/tq?tqx=out:json";

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
    })).filter(item => item.word);

    // ⭐ 分組（10字一組）
    for (let i = 0; i < words.length; i += 10) {
      wordGroups.push(words.slice(i, i + 10));
    }

    currentGroup = wordGroups[groupIndex];

    nextWord();
  });

// =====================
// 👤 登入
// =====================
function login(name) {
  student = name;
  localStorage.setItem("student", name);
  alert("登入成功：" + name);
}

// =====================
// 🔤 顯示單字
// =====================
function nextWord() {
  if (!currentGroup.length) return;

  currentWord = currentGroup[wordIndex];

  document.getElementById("word").innerText = currentWord.word;

  if (mode === "learn") {
    document.getElementById("meaning").innerText = "👉 " + currentWord.meaning;
  } else {
    document.getElementById("meaning").innerText = "❓ 請選圖";
  }

  document.getElementById("phonics").innerText = "";

  const img = document.getElementById("image");
  img.src = currentWord.image || "";
  img.onerror = () => img.src = "https://via.placeholder.com/150";

  // ⭐ phonics切割
  phonicsArray = currentWord.phonics && currentWord.phonics.includes("-")
    ? currentWord.phonics.split("-")
    : [currentWord.word];
}

// =====================
// 🔊 發音
// =====================
function speak(text) {
  if (!text) return;
  speechSynthesis.cancel();
  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-US";
  speechSynthesis.speak(msg);
}

// =====================
// 🎬 phonics動畫
// =====================
function playPhonics() {
  speechSynthesis.cancel();

  let unlock = new SpeechSynthesisUtterance("ok");
  speechSynthesis.speak(unlock);

  index = 0;
  document.getElementById("phonics").innerText = "";

  setTimeout(playNext, 200);
}

function playNext() {
  if (index >= phonicsArray.length) {
    speak(currentWord.word);
    return;
  }

  let sound = phonicsArray[index];

  document.getElementById("phonics").innerText += sound + " ";
  speak(sound);

  index++;
  setTimeout(playNext, 700);
}

// =====================
// 📘 下一個（預習用）
// =====================
function nextLearn() {
  wordIndex++;

  if (wordIndex >= currentGroup.length) {
    alert("🎉 預習完成！準備測驗");
    return;
  }

  nextWord();
}

// =====================
// 🎯 進入測驗
// =====================
function startQuizMode() {
  mode = "quiz";
  wordIndex = 0;
  nextWord();
  showChoices();
}

// =====================
// 🎯 顯示選項
// =====================
function showChoices() {
  let choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  let options = [currentWord];

  while (options.length < 4) {
    let rand = words[Math.floor(Math.random() * words.length)];
    if (!options.includes(rand)) options.push(rand);
  }

  options.sort(() => Math.random() - 0.5);

  options.forEach(option => {
    let img = document.createElement("img");
    img.src = option.image;
    img.onclick = () => checkAnswer(option.word);
    choicesDiv.appendChild(img);
  });
}

// =====================
// ✅ 檢查答案
// =====================
function checkAnswer(ans) {
  let correct = ans === currentWord.word;

  document.getElementById("result").innerText =
    correct ? "✅ 答對了！" : "❌ 再試一次";

  saveResult(correct);

  if (!correct) {
    wrongWords.push(currentWord);
  }

  setTimeout(() => {
    wordIndex++;

    if (wordIndex >= currentGroup.length) {
      finishQuiz();
    } else {
      nextWord();
      showChoices();
    }
  }, 800);
}

// =====================
// 📊 測驗完成
// =====================
function finishQuiz() {
  alert("📊 本組測驗完成！");

  if (wrongWords.length > 0) {
    if (confirm("要複習錯誤單字嗎？")) {
      currentGroup = [...wrongWords];
      wrongWords = [];
      wordIndex = 0;
      nextWord();
      showChoices();
      return;
    }
  }

  // 下一組
  groupIndex++;
  if (groupIndex < wordGroups.length) {
    currentGroup = wordGroups[groupIndex];
    wordIndex = 0;
    mode = "learn";
    nextWord();
  } else {
    alert("🎉 全部完成！");
  }
}

// =====================
// 💾 保存紀錄
// =====================
function saveResult(correct) {
  let history = JSON.parse(localStorage.getItem("records") || "[]");

  history.push({
    name: student,
    word: currentWord.word,
    correct: correct,
    time: new Date().toLocaleString()
  });

  localStorage.setItem("records", JSON.stringify(history));
}
