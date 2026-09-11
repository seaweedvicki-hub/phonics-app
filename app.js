let words = [];
let currentWord;
let phonicsArray = [];
let index = 0;

// ⭐ 換成你的 Google Sheet API
const API_URL ="https://docs.google.com/spreadsheets/d/1SlXohdxvTSsmPdyjW2X1bZoepDVXG1FWppXGCn4NDzI/gviz/tq?tqx=out:json";

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

// 顯示單字
function  nextWord() {
  if (!words.length) {
    console.log("⚠️ 尚未載入資料");
    return;
  }

  currentWord = words[Math.floor(Math.random() * words.length)];

  document.getElementById("word").innerText = currentWord.word;
  document.getElementById("phonics").innerText = "";
  document.getElementById("meaning").innerText = "👉 " + currentWord.meaning;
  const img = document.getElementById("image");
img.src = currentWord.image || "";

img.onerror = () => {
  img.src = "https://via.placeholder.com/150";
};
 phonicsArray = currentWord.phonics 
  ? currentWord.phonics.split("-") 
  : [];
function speak(text) {
  speechSynthesis.cancel();
  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-US";
  speechSynthesis.speak(msg);
}

// 🎬 自然發音動畫
function playPhonics() {
  if (!currentWord) {
    alert("資料尚未載入");
    return;
  }
  // ⭐ 先清掉舊語音
  speechSynthesis.cancel();

  // 🔓 解鎖語音（要有一點點內容）
  let unlock = new SpeechSynthesisUtterance("ok");
  speechSynthesis.speak(unlock);

  index = 0;
  document.getElementById("phonics").innerText = "";

  // ⭐ 稍微延遲再開始（超關鍵🔥）
  setTimeout(() => {
    playNext();
  }, 200);
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

  document.getElementById("phonics").innerText += sound + " ";
  speak(sound);

  index++;
  setTimeout(playNext, 800);
}

// 🎯 測驗
function startQuiz() {
  document.querySelector(".quiz").classList.remove("hidden");

  let choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  let correct = currentWord;
  let options = [correct];

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

function checkAnswer(ans) {
  if (ans === currentWord.word) {
    document.getElementById("result").innerText = "✅ 答對了！";
  } else {
    document.getElementById("result").innerText = "❌ 再試一次";
  }
}
