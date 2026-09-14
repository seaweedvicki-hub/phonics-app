let user="";
let words=[];
let currentSet=[];
let memoryPool=[];
let wrongWords={};
let index=0;
let currentWord=null;

// 📚 Google Sheet
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

// 👤 登入
function login(){
  user=document.getElementById("name").value;
  if(!user) return alert("請輸入名字");
  show("home");
  document.getElementById("username").innerText="👋 "+user;
}

// UI切換
function show(id){
  document.querySelectorAll(".app > div").forEach(d=>d.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// 📚 學習
function startLearn(){
  currentSet=shuffle(words).slice(0,10);
  index=0;
  show("learn");
  showWord();
}

function showWord(){
  currentWord=currentSet[index];
  document.getElementById("word").innerText=currentWord.word;
  document.getElementById("phonics").innerText=currentWord.phonics;
  document.getElementById("meaning").innerText=currentWord.meaning;
}

// AI解釋
async function aiExplain(){
  let text=await explainWord(currentWord.word);
  alert(text);
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

// 🎯 測驗
function startQuiz(){
  show("quiz");
  nextQuiz();
}

function nextQuiz(){

  currentWord=pickWord();

  document.getElementById("target").innerText=currentWord.phonics;
  document.getElementById("dropZone").innerText="";

  let letters=shuffle(currentWord.word.split(""));
  document.getElementById("choices").innerHTML=
    letters.map(l=>`<button draggable="true" ondragstart="drag(event)">${l}</button>`).join("");
}

// 拖曳
function drag(ev){
  ev.dataTransfer.setData("text", ev.target.innerText);
}

document.addEventListener("dragover", e=>e.preventDefault());

document.addEventListener("drop", e=>{
  if(e.target.id==="dropZone"){
    let data=e.dataTransfer.getData("text");
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
  return currentSet[Math.floor(Math.random()*currentSet.length)];
}

// 🔥 錯字練習
function startWeakPractice(){
  currentSet=Object.keys(wrongWords).map(w=>words.find(x=>x.word===w));
  startQuiz();
}

// 🎤 口說
let recognition;

function startSpeaking(){
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang="en-US";

  show("speaking");

  currentWord=currentSet[Math.floor(Math.random()*currentSet.length)];
  document.getElementById("speakWord").innerText=currentWord.word;
}

function startRecording(){
  recognition.start();

  recognition.onresult=function(e){
    let said=e.results[0][0].transcript.toLowerCase();
    let score=(said===currentWord.word)?100:60;

    document.getElementById("speakResult").innerText=
      `你說:${said} 分數:${score}`;
  };
}

// 📊 報告
function showReport(){
  show("report");
  document.getElementById("reportData").innerText=
    "錯字："+Object.keys(wrongWords).join(",");
}

// 🔊 發音
function speak(text){
  speechSynthesis.cancel();
  let msg=new SpeechSynthesisUtterance(text);
  msg.lang="en-US";
  speechSynthesis.speak(msg);
}

// 🔀 洗牌
function shuffle(arr){
  return arr.sort(()=>Math.random()-0.5);
}
