let user="";
let words=[];
let currentSet=[];
let index=0;
let currentWord=null;

let level=1;
let stars=Number(localStorage.getItem("stars")||0);

// 📚 載入單字
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
  show("map");
  updateStars();
  renderMap();
}

// UI
function show(id){
  document.querySelectorAll(".app > div").forEach(d=>d.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// =======================
// 🗺️ 地圖
// =======================
function renderMap(){

  let html="";

  for(let i=1;i<=10;i++){
    html += `
      <button onclick="startLevel(${i})"
        ${i>level?"disabled":""}>
        關卡 ${i}
      </button>
    `;
  }

  document.getElementById("mapArea").innerHTML=html;
}

function startLevel(lv){
  currentSet=shuffle(words).slice(0,10);
  index=0;
  show("learn");
  showWord();
}

// =======================
// 📚 學習
// =======================
function showWord(){
  currentWord=currentSet[index];
  document.getElementById("word").innerText=currentWord.word;
  document.getElementById("phonics").innerText=currentWord.phonics;
  document.getElementById("meaning").innerText=currentWord.meaning;
}

function nextLearn(){
  index++;
  if(index>=currentSet.length){
    startQuiz();
    return;
  }
  showWord();
}

// =======================
// 🎯 測驗
// =======================
let correct=0;
let total=0;

function startQuiz(){
  correct=0;
  total=0;
  show("quiz");
  nextQuiz();
}

function nextQuiz(){

  currentWord=currentSet[Math.floor(Math.random()*currentSet.length)];

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

  total++;

  if(ans===currentWord.word){
    correct++;
  }

  if(total>=10){
    finishLevel();
  }else{
    nextQuiz();
  }
}

// =======================
// ⭐ 星星系統
// =======================
function finishLevel(){

  let score=Math.round((correct/total)*100);

  let earn=1;

  if(score>=80) earn=2;
  if(score===100) earn=3;

  stars+=earn;
  localStorage.setItem("stars",stars);

  alert(`⭐ 獲得 ${earn} 星！`);

  if(level<10) level++;

  updateStars();
  checkUnlock();

  show("map");
  renderMap();
}

function updateStars(){
  document.getElementById("stars").innerText=stars;
}

// =======================
// 🎁 解鎖角色
// =======================
function checkUnlock(){

  let unlocked = JSON.parse(localStorage.getItem("chars")||"[]");

  if(stars>=5 && !unlocked.includes("🐱")){
    unlocked.push("🐱");
    alert("🎉 解鎖角色：小貓！");
  }

  if(stars>=10 && !unlocked.includes("🐶")){
    unlocked.push("🐶");
    alert("🎉 解鎖角色：小狗！");
  }

  localStorage.setItem("chars",JSON.stringify(unlocked));
}

function showCharacters(){

  show("characters");

  let unlocked = JSON.parse(localStorage.getItem("chars")||"[]");

  document.getElementById("charList").innerHTML =
    unlocked.map(c=>`<span style="font-size:40px">${c}</span>`).join("");
}

// =======================
// 🔊 發音
// =======================
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
