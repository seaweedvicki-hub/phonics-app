let user="";
let words=[];
let currentSet=[];
let memoryPool=[];
let wrongWords={};
let index=0;
let currentWord=null;

let totalQuestions=0;
let correctCount=0;

// 📚 讀 Google Sheet
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

async function aiExplain(){
  let text=await explainWord(currentWord.word);
  alert(text);
}

function nextLearn(){
  index++;
  if(index>=currentSet.length){
    alert("進入測驗！");
    startQuiz();
    return;
  }
  showWord();
}

// 🎯 測驗
function startQuiz(){
  totalQuestions=0;
  correctCount=0;
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

  totalQuestions++;

  if(ans===currentWord.word){
    correctCount++;
    alert("✅");
  }else{
    alert("❌");
    wrongWords[currentWord.word]=(wrongWords[currentWord.word]||0)+1;
    memoryPool.push(currentWord);
  }

  if(totalQuestions>=10){
    finishQuiz();
  }else{
    nextQuiz();
  }
}

// 📊 結束測驗
function finishQuiz(){

  let score=Math.round((correctCount/totalQuestions)*100);

  saveHistory(score);

  alert("完成！分數："+score);

  show("home");
}

// 🧠 記憶曲線
function pickWord(){
  if(memoryPool.length && Math.random()<0.6){
    return memoryPool[Math.floor(Math.random()*memoryPool.length)];
  }
  return currentSet[Math.floor(Math.random()*currentSet.length)];
}

// 📊 儲存紀錄
function saveHistory(score){

  let history = JSON.parse(localStorage.getItem("history") || "[]");

  history.push({
    date:new Date().toLocaleDateString(),
    score:score,
    wrongWords:{...wrongWords}
  });

  localStorage.setItem("history", JSON.stringify(history));
}

// 📊 顯示報告
function showReport(){

  show("report");

  let history = JSON.parse(localStorage.getItem("history") || "[]");

  if(!history.length){
    document.getElementById("summary").innerText="尚無資料";
    return;
  }

  let avg=Math.round(history.reduce((s,h)=>s+h.score,0)/history.length);

  document.getElementById("summary").innerText=
    `總次數:${history.length}｜平均:${avg}%`;

  let labels=history.map(h=>h.date);
  let scores=history.map(h=>h.score);

  drawChart(labels,scores);

  let weak={};

  history.forEach(h=>{
    Object.keys(h.wrongWords||{}).forEach(w=>{
      weak[w]=(weak[w]||0)+h.wrongWords[w];
    });
  });

  let html="<h3>🔥 常錯單字</h3>";

  Object.entries(weak)
  .sort((a,b)=>b[1]-a[1])
  .slice(0,5)
  .forEach(([w,c])=>{
    html+=`<p>${w} (${c})</p>`;
  });

  document.getElementById("weakWords").innerHTML=html;
}

// 📈 畫圖
function drawChart(labels,data){

  const canvas=document.getElementById("chart");
  const ctx=canvas.getContext("2d");

  ctx.clearRect(0,0,canvas.width,canvas.height);

  let step=canvas.width/(data.length-1||1);

  ctx.beginPath();

  data.forEach((v,i)=>{
    let x=i*step;
    let y=canvas.height-(v/100*canvas.height);

    if(i===0) ctx.moveTo(x,y);
    else ctx.lineTo(x,y);
  });

  ctx.strokeStyle="#fff";
  ctx.lineWidth=3;
  ctx.stroke();
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
