let user = "";

// =======================
// 📚 資料
// =======================
let words = [];
let currentSet = [];
let reviewSet = [];
let memoryData = JSON.parse(localStorage.getItem("memory")||"{}");

// =======================
// 📅 每日任務
// =======================
function generateDailyMission(){

  let today = new Date().toDateString();

  if(localStorage.getItem("today") === today){
    currentSet = JSON.parse(localStorage.getItem("todayWords"));
    return;
  }

  // 🤖 AI生成
  if(window.aiWords && window.aiWords.length){
    currentSet = window.aiWords;
  }else{
    currentSet = shuffle(words).slice(0,10);
  }

  localStorage.setItem("today", today);
  localStorage.setItem("todayWords", JSON.stringify(currentSet));
}

// =======================
// 👤 登入
// =======================
function login(){

  user = document.getElementById("name").value;
  if(!user) return alert("請輸入名字");

  generateLesson(); // 🤖 AI產生
  generateDailyMission(); // 📅 今日任務

  show("home");
}

// =======================
// 📚 學習
// =======================
let index=0;

function startLearn(){
  index = 0;
  show("learn");
  showWord();
}

function showWord(){

  let w = currentSet[index];

  document.getElementById("word").innerText = w.word;
  document.getElementById("phonics").innerText = w.phonics;
  document.getElementById("meaning").innerText = w.meaning;
}

function nextLearn(){

  index++;

  if(index >= currentSet.length){
    startQuiz();
    return;
  }

  showWord();
}

// =======================
// 🎯 測驗
// =======================
let currentWord;

function startQuiz(){
  show("quiz");
  nextQuiz();
}

function nextQuiz(){

  currentWord = pickWord();

  document.getElementById("target").innerText = currentWord.phonics;
  document.getElementById("dropZone").innerText="";

  let letters = shuffle(currentWord.word.split(""));

  document.getElementById("choices").innerHTML =
    letters.map(l=>`<button draggable="true" ondragstart="drag(event)">${l}</button>`).join("");
}

// 拖曳
function drag(ev){
  ev.dataTransfer.setData("text", ev.target.innerText);
}

document.addEventListener("dragover", e=>e.preventDefault());

document.addEventListener("drop", e=>{
  if(e.target.id==="dropZone"){
    let data = e.dataTransfer.getData("text");
    e.target.innerText += data;

    if(e.target.innerText.length >= currentWord.word.length){
      checkAnswer(e.target.innerText);
    }
  }
});

// =======================
// 🧠 記憶曲線（升級🔥）
// =======================
function updateMemory(word, correct){

  let now = Date.now();

  if(!memoryData[word]){
    memoryData[word] = {level:0,next:now};
  }

  if(correct){
    memoryData[word].level++;
  }else{
    memoryData[word].level = 0;
  }

  let gap = [1,3,7][memoryData[word].level] || 7;

  memoryData[word].next = now + gap*86400000;

  localStorage.setItem("memory", JSON.stringify(memoryData));
}

// =======================
// 🎯 判斷
// =======================
function checkAnswer(ans){

  let correct = ans === currentWord.word;

  updateMemory(currentWord.word, correct);

  if(!correct){
    reviewSet.push(currentWord);
  }

  nextQuiz();
}

// =======================
// 🧠 抽題（記憶曲線）
// =======================
function pickWord(){

  let now = Date.now();

  let dueWords = currentSet.filter(w=>{
    return !memoryData[w.word] || memoryData[w.word].next <= now;
  });

  if(dueWords.length){
    return dueWords[Math.floor(Math.random()*dueWords.length)];
  }

  return currentSet[Math.floor(Math.random()*currentSet.length)];
}

// =======================
// 🎤 口說
// =======================
let recognition;

function startSpeaking(){

  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang="en-US";

  show("speaking");

  currentWord = currentSet[Math.floor(Math.random()*currentSet.length)];
  document.getElementById("speakWord").innerText = currentWord.word;
}

function startRecording(){

  recognition.start();

  recognition.onresult = function(e){

    let said = e.results[0][0].transcript.toLowerCase();
    let score = (said === currentWord.word) ? 100 : 60;

    document.getElementById("speakResult").innerText =
      `你說:${said} 分數:${score}`;
  };
}

// =======================
// 🔀 洗牌
// =======================
function shuffle(arr){
  return arr.sort(()=>Math.random()-0.5);
}

// =======================
// 🎨 UI
// =======================
function show(id){
  document.querySelectorAll(".app > div").forEach(d=>d.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}
