let user = "";
let words = [];
let memory = JSON.parse(localStorage.getItem("memory")) || {};

// 👤 登入
function login(){
  user = name.value;
  loginDiv = document.getElementById("login");
  loginDiv.classList.add("hidden");

  home.classList.remove("hidden");
  username.innerText = "👋 " + user;
}

// 📚 載入單字
fetch("你的GoogleSheetAPI")
.then(r=>r.text())
.then(t=>{
  let json = JSON.parse(t.substring(t.indexOf("{"),t.lastIndexOf("}")+1));
  words = json.table.rows.map(r=>({
    word:r.c[0]?.v,
    phonics:r.c[1]?.v,
    meaning:r.c[2]?.v,
    image:r.c[3]?.v
  }));
});

// 📚 學習
function startLearn(){
  home.classList.add("hidden");
  learn.classList.remove("hidden");
  nextLearn();
}

function nextLearn(){
  let w = words[Math.floor(Math.random()*words.length)];

  word.innerText = w.word;
  phonics.innerText = w.phonics;
  meaning.innerText = w.meaning;
}

// 🔊
function playPhonics(){
  speechSynthesis.speak(new SpeechSynthesisUtterance(word.innerText));
}

// 🎤 語音
function startSpeech(){
  let rec = new webkitSpeechRecognition();
  rec.onresult = e=>{
    alert(e.results[0][0].transcript);
  };
  rec.start();
}

// 🤖 AI
function startAI(){
  home.classList.add("hidden");
  ai.classList.remove("hidden");
}

// 📊 報告
async function showReport(){
  home.classList.add("hidden");
  report.classList.remove("hidden");

  let data = await loadCloud();

  reportData.innerHTML = data.map(d=>
    `<p>${d.name}：${d.score}</p>`
  ).join("");
}

// 儲存
function saveRecord(score){
  saveCloud({
    name:user,
    score:score,
    time:new Date()
  });
}
