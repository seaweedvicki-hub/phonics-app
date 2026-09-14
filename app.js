// =======================
// 👤 使用者
// =======================
let user = "";

// =======================
// 📚 單字資料
// =======================
let words = [];
let currentSet = [];
let memoryPool = [];
let wrongWords = {};

// =======================
// 🎮 狀態
// =======================
let index = 0;
let level = 1;
let currentWord = null;

// =======================
// 🎤 語音
// =======================
let recognition;

function initSpeech(){
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
}

// =======================
// 👤 登入
// =======================
function login(){
  user = document.getElementById("name").value;

  if(!user){
    alert("請輸入名字");
    return;
  }

  initSpeech();

  show("home");
  document.getElementById("username").innerText = "👋 " + user;
}

// =======================
// 🎨 UI切換
// =======================
function show(id){
  document.querySelectorAll(".app > div").forEach(d=>d.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// =======================
// 📚 載入資料（Google Sheet）
// =======================
const API_URL ="https://docs.google.com/spreadsheets/d/1SlXohdxvTSsmPdyjW2X1bZoepDVXG1FWppXGCn4NDzI/gviz/tq?tqx=out:json";

fetch(API_URL)
.then(res=>res.text())
.then(text=>{
  const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}")+1));

  words = json.table.rows.map(r=>({
    word:r.c[0]?.v||"",
    phonics:r.c[1]?.v||"",
    meaning:r.c[2]?.v||"",
    image:r.c[3]?.v||""
  })).filter(w=>w.word);
});

// =======================
// 📚 學習（10字）
// =======================
function startLearn(){

  currentSet = (window.aiWords && window.aiWords.length)
    ? window.aiWords
    : shuffle(words).slice(0,10);

  index = 0;

  show("learn");
  showWord();
}

function showWord(){

  let w = currentSet[index];

  document.getElementById("word").innerText = w.word;
  document.getElementById("phonics").innerText = w.phonics;
  document.getElementById("meaning").innerText = "👉 " + w.meaning;

  speak(w.word);
}

function nextLearn(){

  index++;

  if(index >= currentSet.length){
    alert("🎉 學習完成，開始闖關！");
    startMap();
    return;
  }

  showWord();
}

// =======================
// 🗺️ 闖關地圖
// =======================
function startMap(){
  show("map");

  let html = "";

  for(let i=1;i<=5;i++){
    html += `
      <button onclick="startQuiz()" ${i>level?"disabled":""}>
        關卡 ${i}
      </button>
    `;
  }

  document.getElementById("mapArea").innerHTML = html;
}

// =======================
// 🎯 測驗（拖曳拼音）
// =======================
function startQuiz(){
  show("quiz");
  nextQuiz();
}

function nextQuiz(){

  currentWord = pickWord();

  document.getElementById("target").innerText = currentWord.phonics;
  document.getElementById("dropZone").innerText = "";

  let letters = shuffle(currentWord.word.split(""));
  let html = "";

  letters.forEach(l=>{
    html += `<button draggable="true" ondragstart="drag(event)">${l}</button>`;
  });

  document.getElementById("choices").innerHTML = html;
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
// ✅ 判斷答案
// =======================
function checkAnswer(ans){

  if(ans === currentWord.word){
    alert("✅ 正確");
  }else{
    alert("❌ 再試一次");

    wrongWords[currentWord.word] =
      (wrongWords[currentWord.word] || 0) + 1;

    memoryPool.push(currentWord);
  }

  nextQuiz();
}

// =======================
// 🧠 記憶曲線
// =======================
function pickWord(){

  if(memoryPool.length > 0 && Math.random() < 0.6){
    return memoryPool[Math.floor(Math.random()*memoryPool.length)];
  }

  return currentSet[Math.floor(Math.random()*currentSet.length)];
}

// =======================
// 🔥 錯字專屬練習
// =======================
function startWeakPractice(){

  let weakList = Object.keys(wrongWords)
    .map(w => words.find(x=>x.word===w))
    .filter(Boolean);

  if(!weakList.length){
    alert("目前沒有錯字！");
    return;
  }

  currentSet = weakList;
  startQuiz();
}

// =======================
// 🎤 口說
// =======================
function startSpeaking(){
  show("speaking");
  nextSpeak();
}

function nextSpeak(){

  currentWord = currentSet[Math.floor(Math.random()*currentSet.length)];

  document.getElementById("speakWord").innerText = currentWord.word;
}

function startRecording(){

  recognition.start();

  recognition.onresult = function(e){

    let spoken = e.results[0][0].transcript.toLowerCase();
    let target = currentWord.word.toLowerCase();

    let score = (spoken === target) ? 100 : 60;

    document.getElementById("speakResult").innerText =
      `你說：${spoken}｜分數：${score}`;

    saveRecord(user,{
      type:"speaking",
      word:target,
      spoken,
      score,
      time:new Date().toLocaleString()
    });
  };
}

// =======================
// 📊 家長報告（雲端）
// =======================
async function showReport(){

  show("report");

  let data = await loadReport(user);

  let html = "";

  data.forEach(d=>{
    html += `
      <div>
        <p>📅 ${d.time}</p>
        <p>分數：${d.score || "-"}</p>
        <p>關卡：${d.level || "-"}</p>
        <p>錯字：${Object.keys(d.wrongWords||{}).join(", ")}</p>
      </div>
      <hr>
    `;
  });

  document.getElementById("reportData").innerHTML =
    html || "尚無資料";
}

// =======================
// 🤖 AI老師入口
// =======================
function openAI(){
  show("ai");
}

// =======================
// 🔊 發音
// =======================
function speak(text){
  speechSynthesis.cancel();
  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-US";
  speechSynthesis.speak(msg);
}

// =======================
// 🔀 洗牌
// =======================
function shuffle(arr){
  return arr.sort(()=>Math.random()-0.5);
}
