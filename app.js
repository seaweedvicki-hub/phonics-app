let words = [];
let currentWord;
let phonicsArray = [];
let index = 0;

// ⭐ 換成你的 Google Sheet API
const API_URL = "https://opensheet.elk.sh/1SlXohdxvTSsmPdyjW2X1bZoepDVXG1FWppXGCn4NDzI/Sheet1";

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    words = data.map(item => ({
      word: item.word,
      phonics: item.phonics,
      meaning: item.meaning,
      image: item.image
    }));
    nextWord();
  });

// 顯示單字
function nextWord() {
  currentWord = words[Math.floor(Math.random() * words.length)];

  document.getElementById("word").innerText = currentWord.word;
  document.getElementById("phonics").innerText = "";
  document.getElementById("meaning").innerText = "👉 " + currentWord.meaning;
  document.getElementById("image").src = currentWord.image;

  phonicsArray = currentWord.phonics.split("-");
}

// 🔊 發音
function speak(text) {
  speechSynthesis.cancel();
  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-US";
  speechSynthesis.speak(msg);
}

// 🎬 自然發音動畫
function playPhonics(){
  // 🔓 解鎖語音（關鍵）
  let unlock = new SpeechSynthesisUtterance(" ");
  speechSynthesis.speak(unlock);

  // ⭐ 清掉舊聲音（避免卡住）
  speechSynthesis.cancel();

  index = 0;
  document.getElementById("phonics").innerText = "";
  playNext();
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
