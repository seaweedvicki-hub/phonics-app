// ==========================
// 📦 全域變數
// ==========================
let words = [];
let currentWord;
let phonicsArray = [];
let index = 0;

// ⭐ Google Sheet API
const API_URL = "https://docs.google.com/spreadsheets/d/1SlXohdxvTSsmPdyjW2X1bZoepDVXG1FWppXGCn4NDzI/gviz/tq?tqx=out:json";

// ==========================
// 📥 載入資料
// ==========================
fetch(API_URL)
  .then(res => res.text())
  .then(text => {
    try {
      const json = JSON.parse(
        text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)
      );

      const rows = json.table.rows;

      words = rows
        .map(row => ({
          word: row.c[0]?.v || "",
          phonics: row.c[1]?.v || "",
          meaning: row.c[2]?.v || "",
          image: row.c[3]?.v || ""
        }))
        .filter(item => item.word);

      if (words.length === 0) {
        throw new Error("資料是空的");
      }

      nextWord();

    } catch (e) {
      console.error("❌ 解析失敗", e);
      alert("資料讀取失敗");
    }
  })
  .catch(err => {
    console.error("❌ API錯誤", err);
    alert("無法連線");
  });


// ==========================
// 📖 顯示單字
// ==========================
function nextWord() {
  if (!words.length) {
    console.log("⚠️ 尚未載入資料");
    return;
  }

  // 🎲 隨機選字
  currentWord = words[Math.floor(Math.random() * words.length)];

  // 📌 顯示內容
  document.getElementById("word").innerText = currentWord.word;
  document.getElementById("phonics").innerText = "";
  document.getElementById("meaning").innerText = "👉 " + currentWord.meaning;

  // 🖼️ 圖片（含錯誤備援）
  const img = document.getElementById("image");
  img.src = currentWord.image || "https://via.placeholder.com/150";

  img.onerror = () => {
    img.onerror = null;
    img.src = "https://via.placeholder.com/150";
  };

  // 🔤 音節拆解
  phonicsArray = currentWord.phonics && currentWord.phonics.includes("-")
    ? currentWord.phonics.split("-")
    : [currentWord.word];
}


// ==========================
// 🔊 發音
// ==========================
function speak(text) {
  if (!text) return;

  speechSynthesis.cancel(); // ⭐ 防止重疊

  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-US";
  speechSynthesis.speak(msg);
}


// ==========================
// 🎬 自然發音動畫（音節播放）
// ==========================
function playPhonics() {
  if (!currentWord) {
    alert("資料尚未載入");
    return;
  }

  // 🔓 解鎖語音（手機必要）
  let unlock = new SpeechSynthesisUtterance("ok");
  speechSynthesis.speak(unlock);

  // ⭐ 延遲清掉
  setTimeout(() => {
    speechSynthesis.cancel();
  }, 100);

  index = 0;
  document.getElementById("phonics").innerText = "";

  setTimeout(() => {
    playNext();
  }, 200);
}


// ==========================
// ▶️ 播放下一個音節
// ==========================
function playNext() {
  if (index >= phonicsArray.length) {
    setTimeout(() => {
      document.getElementById("phonics").innerText = currentWord.word;
      speak(currentWord.word);
    }, 500);
    return;
  }

  let sound = phonicsArray[index];

  document.getElementById("phonics").innerText += sound + " ";
  speak(sound);

  index++;
  setTimeout(playNext, 800);
}


// ==========================
// 🎯 測驗模式
// ==========================
function startQuiz() {
  document.querySelector(".quiz").classList.remove("hidden");

  let choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  let correct = currentWord;
  let options = [correct];

  // 🎲 產生4個選項
  while (options.length < 4) {
    let rand = words[Math.floor(Math.random() * words.length)];
    if (!options.includes(rand)) options.push(rand);
  }

  // 🔀 洗牌
  options.sort(() => Math.random() - 0.5);

  // 🖼️ 顯示圖片選項
  options.forEach(option => {
    let img = document.createElement("img");
    img.src = option.image || "https://via.placeholder.com/100";

    img.onclick = () => checkAnswer(option.word);

    choicesDiv.appendChild(img);
  });
}


// ==========================
// ✅ 檢查答案
// ==========================
function checkAnswer(ans) {
  if (ans === currentWord.word) {
    document.getElementById("result").innerText = "✅ 答對了！";
  } else {
    document.getElementById("result").innerText = "❌ 再試一次";
  }
}
