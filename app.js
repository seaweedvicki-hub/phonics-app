let user="";
let words=[];
let currentSet=[];
let wrongWords={};
let memoryPool=[];
let level=1;

// 🎤 語音
let recognition;

function initSpeech(){
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang="en-US";
}

// 👤 登入
function login(){
  user=document.getElementById("name").value;
  if(!user) return alert("請輸入名字");

  initSpeech();

  show("home");
  document.getElementById("username").innerText="👋 "+user;
}

// UI切換
function show(id){
  document.querySelectorAll(".app > div").forEach(d=>d.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// 📚 假資料（可接Google Sheet）
words=[
  {word:"cat",phonics:"c-a-t",meaning:"貓"},
  {word:"dog",phonics:"d-o-g",meaning:"狗"},
  {word:"sun",phonics:"s-u-n",meaning:"太陽"},
  {word:"pen",phonics:"p-e-n",meaning:"筆"}
];

// 📚 學習
function startLearn(){
  currentSet = shuffle(words).slice(0,10);
  index=0;
  show("learn");
  showWord();
}

let index=0;

function showWord(){
  let w=currentSet[index];
  document.getElementById("word").innerText=w.word;
  document.getElementById("phonics").innerText=w.phonics;
  document.getElementById("meaning").innerText=w.meaning;
}

function nextLearn(){
  index++;
  if(index>=currentSet.length){
    alert("完成！");
    show("home");
    return;
  }
  showWord();
}

// 🗺️ 地圖
function startMap(){
  show("map");
  let html="";
  for(let i=1;i<=5;i++){
    html+=`<button onclick="startQuiz()" ${i>level?"disabled":""}>關卡${i}</button>`;
  }
  document.getElementById("mapArea").innerHTML=html;
}

// 🎯 測驗（拖曳）
function startQuiz(){
  show("quiz");
  nextQuiz();
}

let currentWord;

function nextQuiz(){
  currentWord = pickWord();

  document.getElementById("target").innerText=currentWord.phonics;
  document.getElementById("dropZone").innerText="";
  
  let letters = shuffle(currentWord.word.split(""));
  let html="";

  letters.forEach(l=>{
    html+=`<button draggable="true" ondragstart="drag(event)" id="l${l}${Math.random()}">${l}</button>`;
  });

  document.getElementById("choices").innerHTML=html;
}

// 拖曳
function drag(ev){
  ev.dataTransfer.setData("text", ev.target.innerText);
}

document.addEventListener("dragover",e=>e.preventDefault());

document.addEventListener("drop",e=>{
  if(e.target.id==="dropZone"){
    let data = e.dataTransfer.getData("text");
    e.target.innerText+=data;

    if(e.target.innerText.length>=currentWord.word.length){
      checkAnswer(e.target.innerText);
    }
  }
});

// 判斷
function checkAnswer(ans){
  if(ans===currentWord.word){
    alert("✅");
  }else{
    alert("❌");
    wrongWords[currentWord.word]=(wrongWords[currentWord.word]||0)+1;
    memoryPool.push(currentWord);
  }
  nextQuiz();
}

// 🧠 記憶曲線
function pickWord(){
  if(memoryPool.length && Math.random()<0.6){
    return memoryPool[Math.floor(Math.random()*memoryPool.length)];
  }
  return words[Math.floor(Math.random()*words.length)];
}

// 🔥 錯字練習
function startWeakPractice(){
  currentSet = Object.keys(wrongWords).map(w=>words.find(x=>x.word===w));
  startQuiz();
}

// 🎤 口說
function startSpeaking(){
  show("speaking");
  nextSpeak();
}

function nextSpeak(){
  currentWord = words[Math.floor(Math.random()*words.length)];
  document.getElementById("speakWord").innerText=currentWord.word;
}

function startRecording(){
  recognition.start();

  recognition.onresult=function(e){
    let said=e.results[0][0].transcript.toLowerCase();
    let score = (said===currentWord.word)?100:50;

    document.getElementById("speakResult").innerText=
      `你說:${said} 分數:${score}`;
  };
}

// 📊 報告（本地版）
function showReport(){
  show("report");

  let html="<h3>錯字統計</h3>";
  html+=Object.keys(wrongWords).join(", ")||"無";

  document.getElementById("reportData").innerHTML=html;
}

// 🔀 洗牌
function shuffle(arr){
  return arr.sort(()=>Math.random()-0.5);
}
