// 👤 使用者
let user = "";

// 📚 單字庫
let words = [];
let currentSet = [];

// 🧠 記憶曲線
let memoryPool = [];

// 🎯 測驗
let correct = 0;
let total = 0;
let wrongWords = {};

// 📖 學習
let index = 0;

// 🗺️ 闖關
let level = 1;


// =======================
// 👤 登入
// =======================
function login(){
  user = document.getElementById("name").value;

  if(!user){
    alert("請輸入名字");
    return;
  }

  document.getElementById("login").classList.add("hidden");
  document.getElementById("home").classList.remove("hidden");
  document.getElementById("username").innerText = "👋 " + user;
}


// =======================
// 📚 載入單字
// =======================
const API_URL ="你的GoogleSheetAPI";

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
// 📚 開始學習
// =======================
function startLearn(){

  document.getElementById("home").classList.add("hidden");
  document.getElementById("learn").classList.remove("hidden");

  currentSet = (window.aiWords && window.aiWords.length)
    ? window.aiWords
    : shuffle(words).slice(0,10);

  index = 0;
  showWord();
}


// =======================
// 📖 顯示單字
// =======================
function showWord(){

  let w = currentSet[index];

  document.getElementById("word").innerText = w.word;
  document.getElementById("phonics").innerText = w.phonics;
  document.getElementById("meaning").innerText = "👉 " + w.meaning;

  speak(w.word);
}


// =======================
// ➡️ 下一個
// =======================
function nextLearn(){

  index++;

  if(index >= currentSet.length){
    alert("🎉 學習完成！開始闖關！");
    startMap();
    return;
  }

  showWord();
}


// =======================
// 🗺️ 闖關地圖
// =======================
function startMap(){

  document.getElementById("learn").classList.add("hidden");
  document.getElementById("map").classList.remove("hidden");

  renderMap();
}


function renderMap(){

  let html = "";

  for(let i=1;i<=5;i++){
    html += `
      <button onclick="startQuizLevel(${i})"
      ${i>level?"disabled":""}>
      關卡 ${i}
      </button>
    `;
  }

  document.getElementById("mapArea").innerHTML = html;
}


// =======================
// 🎯 開始關卡
// =======================
function startQuizLevel(lv){

  document.getElementById("map").classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");

  correct = 0;
  total = 0;
  wrongWords = {};

  runQuiz();
}


// =======================
// 🎯 測驗（拼音積木）
// =======================
function runQuiz(){

  let w = pickWord();

  let blocks = shuffle(w.word.split(""));
  let html = "";

  blocks.forEach(b=>{
    html += `<button onclick="selectLetter('${b}')">${b}</button>`;
  });

  document.getElementById("choices").innerHTML = html;
  document.getElementById("answer").innerText = "";
  document.getElementById("target").innerText = w.phonics;

  window.currentQuizWord = w;
}


// =======================
// 🧩 點擊字母
// =======================
function selectLetter(l){

  let ans = document.getElementById("answer");
  ans.innerText += l;

  if(ans.innerText.length >= window.currentQuizWord.word.length){
    checkAnswer(ans.innerText);
  }
}


// =======================
// ✅ 判斷答案
// =======================
function checkAnswer(ans){

  total++;

  if(ans === window.currentQuizWord.word){
    correct++;
  }else{
    wrongWords[window.currentQuizWord.word] = (wrongWords[window.currentQuizWord.word]||0)+1;

    // 🧠 加入記憶曲線
    memoryPool.push(window.currentQuizWord);
  }

  if(total>=10){
    finishQuiz();
  }else{
    runQuiz();
  }
}


// =======================
// 🧠 記憶曲線選字
// =======================
function pickWord(){

  if(memoryPool.length>0 && Math.random()<0.6){
    return memoryPool[Math.floor(Math.random()*memoryPool.length)];
  }

  return currentSet[Math.floor(Math.random()*currentSet.length)];
}


// =======================
// 📊 結束
// =======================
function finishQuiz(){

  let score = Math.round((correct/10)*100);

  if(score>=80){
    level++;
    alert("🎉 升級！解鎖下一關！");
  }

  saveRecord(user,{
    score,
    correct,
    total,
    wrongWords,
    level,
    time:new Date().toLocaleString()
  });

  document.getElementById("quiz").classList.add("hidden");
  document.getElementById("map").classList.remove("hidden");

  renderMap();
}


// =======================
// 📊 報告
// =======================
async function showReport(){

  let data = await loadReport(user);

  let html="";

  data.forEach(d=>{
    html+=`
    <div>
      <p>${d.time}</p>
      <p>分數:${d.score}</p>
      <p>關卡:${d.level}</p>
      <p>錯字:${Object.keys(d.wrongWords).join(",")}</p>
    </div>
    `;
  });

  document.getElementById("reportData").innerHTML=html;
}


// =======================
// 🔊 發音
// =======================
function speak(text){
  speechSynthesis.cancel();
  let msg = new SpeechSynthesisUtterance(text);
  msg.lang="en-US";
  speechSynthesis.speak(msg);
}


// =======================
// 🔀 洗牌
// =======================
function shuffle(arr){
  return arr.sort(()=>Math.random()-0.5);
}
