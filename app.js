let words = [];
let currentWord;
let phonicsArray = [];
let index = 0;

// 👤 使用者
let userName = "";
let score = 0;
let total = 0;
let level = 1;

// 🧠 記憶曲線
let reviewQueue = [];

// ⭐ API
const API_URL ="https://docs.google.com/spreadsheets/d/1SlXohdxvTSsmPdyjW2X1bZoepDVXG1FWppXGCn4NDzI/gviz/tq?tqx=out:json";

// ==========================
// 👤 登入
// ==========================
function login(){
  userName = document.getElementById("name").value;
  document.getElementById("user").innerText = "👋 " + userName;
}

// ==========================
// 📥 讀資料
// ==========================
fetch(API_URL)
.then(res => res.text())
.then(text => {
  const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}")+1));

  words = json.table.rows.map(r=>({
    word:r.c[0]?.v||"",
    phonics:r.c[1]?.v||"",
    meaning:r.c[2]?.v||"",
    image:r.c[3]?.v||""
  })).filter(w=>w.word);

  startLearnSet();
});

// ==========================
// 🧩 10字一組
// ==========================
let learnSet = [];

function startLearnSet(){
  learnSet = words.sort(()=>0.5-Math.random()).slice(0,10);
  index = 0;
  nextLearn();
}

// ==========================
// 📘 預習
// ==========================
function nextLearn(){
  if(index >= learnSet.length){
    alert("🎯 預習完成，開始測驗！");
    startQuiz();
    return;
  }

  currentWord = learnSet[index];

  document.getElementById("word").innerText = currentWord.word;
  document.getElementById("meaning").innerText = currentWord.meaning;
  document.getElementById("phonics").innerText = "";

  phonicsArray = currentWord.phonics.includes("-")
    ? currentWord.phonics.split("-")
    : [currentWord.word];

  index++;
}

// ==========================
// 🔊 發音
// ==========================
function speak(text){
  speechSynthesis.cancel();
  let msg = new SpeechSynthesisUtterance(text);
  msg.lang="en-US";
  speechSynthesis.speak(msg);
}

// ==========================
// 🎬 Phonics
// ==========================
function playPhonics(){
  let i=0;
  function loop(){
    if(i>=phonicsArray.length){
      speak(currentWord.word);
      return;
    }
    speak(phonicsArray[i]);
    i++;
    setTimeout(loop,800);
  }
  loop();
}

// ==========================
// 🎤 語音
// ==========================
let recognition;

function startSpeaking(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang="en-US";

  recognition.onresult = e=>{
    let speech = e.results[0][0].transcript.toLowerCase();
    checkSpeech(speech);
  };

  recognition.start();
}

// ==========================
// 🎯 測驗
// ==========================
function startQuiz(){
  nextQuizWord();
}

function nextQuizWord(){
  currentWord = reviewQueue.length
    ? reviewQueue.shift()
    : learnSet[Math.floor(Math.random()*learnSet.length)];

  document.getElementById("word").innerText = "";
  document.getElementById("meaning").innerText = "";

  let choices = [currentWord];

  while(choices.length<4){
    let rand = words[Math.floor(Math.random()*words.length)];
    if(!choices.includes(rand)) choices.push(rand);
  }

  choices.sort(()=>Math.random()-0.5);

  let div = document.getElementById("choices");
  div.innerHTML="";

  choices.forEach(c=>{
    let img=document.createElement("img");
    img.src=c.image;
    img.onclick=()=>checkAnswer(c.word);
    div.appendChild(img);
  });
}

// ==========================
// 🧠 記憶曲線
// ==========================
function checkAnswer(ans){
  total++;

  if(ans===currentWord.word){
    score++;
    document.getElementById("result").innerText="✅ 正確";
  }else{
    document.getElementById("result").innerText="❌ 錯誤";
    reviewQueue.push(currentWord); // 🔥 錯的再排回來
  }

  updateProgress();
  nextQuizWord();
}

// ==========================
// 📊 報告 + 闖關
// ==========================
function updateProgress(){
  document.getElementById("progress").innerText =
    `進度：${total} / 10`;

  document.getElementById("report").innerText =
    `${userName} 正確 ${score} / ${total}`;

  if(total>=10){
    level++;
    total=0;
    score=0;
    alert("🎉 升級 Level "+level);

    document.getElementById("level").innerText="Level "+level;
    startLearnSet();
  }
}

// ==========================
// 🎤 語音判斷
// ==========================
function checkSpeech(speech){
  if(speech.includes(currentWord.word.toLowerCase())){
    alert("🎉 說對了！");
  }else{
    alert("❌ 再試一次");
  }
}
