// 👤 使用者
let user = "";

// 📚 單字庫
let words = [];
let currentSet = []; // ⭐ 關鍵：當前10字

// 🎯 測驗資料
let correct = 0;
let total = 0;
let wrongWords = {};

// 📖 學習索引
let index = 0;


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
// 📚 載入 Google Sheet
// =======================
const API_URL ="https://docs.google.com/spreadsheets/d/1SlXohdxvTSsmPdyjW2X1bZoepDVXG1FWppXGCn4NDzI/gviz/tq?tqx=out:json";

fetch(API_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(
      text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)
    );

    const rows = json.table.rows;

    words = rows.map(row => ({
      word: row.c[0]?.v || "",
      phonics: row.c[1]?.v || "",
      meaning: row.c[2]?.v || "",
      image: row.c[3]?.v || ""
    })).filter(w => w.word);

  });


// =======================
// 📚 開始學習（10字）
// =======================
function startLearn(){

  document.getElementById("home").classList.add("hidden");
  document.getElementById("learn").classList.remove("hidden");

  // ⭐ AI優先
  if(window.aiWords && window.aiWords.length){
    currentSet = window.aiWords;
  }else{
    currentSet = shuffle(words).slice(0,10);
  }

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

  // 🔊 自動唸
  speak(w.word);
}


// =======================
// ➡️ 下一個
// =======================
function nextLearn(){

  index++;

  if(index >= currentSet.length){
    alert("🎉 學習完成！準備測驗");

    document.getElementById("learn").classList.add("hidden");
    document.getElementById("home").classList.remove("hidden");
    return;
  }

  showWord();
}


// =======================
// 🎯 開始測驗
// =======================
function startQuiz(){

  if(currentSet.length === 0){
    alert("請先學習或產生AI單字！");
    return;
  }

  correct = 0;
  total = 0;
  wrongWords = {};

  runQuiz();
}


// =======================
// 🎯 測驗流程
// =======================
function runQuiz(){

  let w = currentSet[Math.floor(Math.random()*currentSet.length)];

  let ans = prompt(`👉 ${w.phonics}\n請輸入單字`);

  if(ans === null) return;

  total++;

  if(ans.trim().toLowerCase() === w.word.toLowerCase()){
    correct++;
  }else{
    wrongWords[w.word] = (wrongWords[w.word] || 0) + 1;
  }

  if(total >= 10){
    finishQuiz();
  }else{
    runQuiz();
  }
}


// =======================
// 📊 結束測驗
// =======================
function finishQuiz(){

  let score = Math.round((correct/10)*100);

  saveRecord(user,{
    score,
    correct,
    total,
    wrongWords,
    time:new Date().toLocaleString()
  });

  alert(`🎉 分數：${score}`);

}


// =======================
// 📊 家長報告
// =======================
async function showReport(){

  document.getElementById("home").classList.add("hidden");
  document.getElementById("report").classList.remove("hidden");

  let data = await loadReport(user);

  let html = "";

  data.forEach(d=>{
    html += `
      <div class="report-card">
        <p>📅 ${d.time}</p>
        <p>分數：${d.score}</p>
        <p>答對：${d.correct} / ${d.total}</p>
        <p>錯誤單字：${Object.keys(d.wrongWords).join(", ") || "無"}</p>
        <hr>
      </div>
    `;
  });

  document.getElementById("reportData").innerHTML = html || "尚無資料";
}


// =======================
// 🔙 返回首頁
// =======================
function backHome(){
  document.getElementById("report").classList.add("hidden");
  document.getElementById("home").classList.remove("hidden");
}


// =======================
// 🔊 發音
// =======================
function speak(text){
  if(!text) return;

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
