let words = [];
let currentWord;
let phonicsArray = [];
let index = 0;
let userName = "";

// ⭐ Google Sheet API
const API_URL ="https://docs.google.com/spreadsheets/d/1SlXohdxvTSsmPdyjW2X1bZoepDVXG1FWppXGCn4NDzI/gviz/tq?tqx=out:json";

// ==========================
// 👤 登入
// ==========================
function login(){
  userName = document.getElementById("name").value;
  document.getElementById("user").innerText = "👋 Hello " + userName;
}

// ==========================
// 📥 讀取資料
// ==========================
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

    nextWord();
  });

// ==========================
// 📘 顯示單字
// ==========================
function nextWord() {
  currentWord = words[Math.floor(Math.random() * words.length)];

  document.getElementById("word").innerText = currentWord.word;
  document.getElementById("meaning").innerText = "👉 " + currentWord.meaning;
  document.getElementById("phonics").innerText = "";

  const img = document.getElementById("image");

  if (currentWord.image) {
    img.src = currentWord.image;
  } else {
    img.src = "https://via.placeholder.com/150";
  }

  img.onerror = () => {
    img.onerror = null;
    img.src = "https://via.placeholder.com/150";
  };

  phonicsArray = currentWord.phonics?.includes("-")
    ? currentWord.phonics.split("-")
    : [currentWord.word];
}

// ==========================
// 🔊 發音
// ==========================
function speak(text) {
  if (!text) return;
  speechSynthesis.cancel();

  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-US";
  msg.rate = 0.9;

  speechSynthesis.speak(msg);
}

// ==========================
// 🎬 自然發音
// ==========================
function playPhonics() {
  if (!currentWord) return;

  speechSynthesis.cancel();

  let unlock = new SpeechSynthesisUtterance("ok");
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

  document.getElementById("phonics").innerText += sound + " ";
  speak(sound);

  index++;
  setTimeout(playNext, 800);
}

// ==========================
// 🎤 語音練習
// ==========================
let recognition;

function initSpeech() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("請使用 Chrome");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";

  recognition.onresult = (e) => {
    const speech = e.results[0][0].transcript.toLowerCase();
    checkSpeech(speech);
  };
}

function startSpeaking() {
  if (!recognition) initSpeech();

  recognition.start();
  document.getElementById("result").innerText = "🎤 請說出單字...";
}

function checkSpeech(speech) {
  let correct = currentWord.word.toLowerCase();

  if (speech.includes(correct)) {
    document.getElementById("result").innerText = "🎉 正確！";
    speak("Great job");
  } else {
    document.getElementById("result").innerText =
      "❌ 你說：" + speech + " 正確：" + correct;
    speak("Try again");
  }
}

// ==========================
// 🎯 測驗
// ==========================
function startQuiz() {
  let choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  let correct = currentWord;
  let options = [correct];

  while (options.length < 4) {
    let rand = words[Math.floor(Math.random() * words.length)];
    if (!options.includes(rand)) options.push(rand);
  }

  options.sort(() => Math.random() - 0.5);

  options.forEach(opt => {
    let img = document.createElement("img");
    img.src = opt.image;
    img.onclick = () => checkAnswer(opt.word);
    choicesDiv.appendChild(img);
  });
}

function checkAnswer(ans) {
  if (ans === currentWord.word) {
    document.getElementById("result").innerText = "✅ 答對";
  } else {
    document.getElementById("result").innerText = "❌ 再試一次";
  }
}
