let words = [];
let currentSet = [];
let currentIndex = 0;
let currentWord = null;
let phonicsArray = [];
let index = 0;

let studentName = "";
let progress = {};

const API_URL = "https://docs.google.com/spreadsheets/d/1SlXohdxvTSsmPdyjW2X1bZoepDVXG1FWppXGCn4NDzI/gviz/tq?tqx=out:json";


// ================== 載入資料 ==================
fetch(API_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(
      text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)
    );

    const rows = json.table.rows;

    words = rows.map(r => ({
      word: r.c[0]?.v || "",
      phonics: r.c[1]?.v || "",
      meaning: r.c[2]?.v || "",
      image: r.c[3]?.v || "",
      level: 0
    })).filter(w => w.word);

    initLearn();
  });


// ================== 登入 ==================
function login(name){
  studentName = name;
  localStorage.setItem("student", name);

  progress = JSON.parse(localStorage.getItem(name) || "{}");

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("app").style.display = "block";
}


// ================== 初始化學習 ==================
function initLearn(){
  currentSet = words.slice(0, 10); // 每次10字
  currentIndex = 0;
  showWord();
}


// ================== 顯示單字 ==================
function showWord(){
  currentWord = currentSet[currentIndex];

  document.getElementById("word").innerText = currentWord.word;
  document.getElementById("meaning").innerText = currentWord.meaning;

  const img = document.getElementById("image");
  img.src = currentWord.image || "";
  img.onerror = () => {
    img.onerror = null;
    img.src = "https://via.placeholder.com/150";
  };

  phonicsArray = currentWord.phonics.includes("-")
    ? currentWord.phonics.split("-")
    : [currentWord.word];

  document.getElementById("phonics").innerText = phonicsArray.join(" | ");
}


// ================== 下一個 ==================
function nextLearn(){
  currentIndex++;

  if(currentIndex >= currentSet.length){
    startQuizMode();
    return;
  }

  showWord();
}


// ================== 發音 ==================
function speak(text){
  if(!text) return;

  speechSynthesis.cancel();
  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-US";
  speechSynthesis.speak(msg);
}


// ================== 自然發音 ==================
function playPhonics(){
  speechSynthesis.cancel();

  let unlock = new SpeechSynthesisUtterance("");
  unlock.volume = 0;
  speechSynthesis.speak(unlock);

  index = 0;
  document.getElementById("phonics").innerText = "";

  setTimeout(playNext, 200);
}

function playNext(){
  if(index >= phonicsArray.length){
    speak(currentWord.word);
    return;
  }

  let s = phonicsArray[index];

  document.getElementById("phonics").innerText += s + " ";
  speak(s);

  index++;
  setTimeout(playNext, 700);
}


// ================== 測驗模式 ==================
function startQuizMode(){
  document.getElementById("quiz").style.display = "block";
  nextQuiz();
}

function nextQuiz(){
  currentWord = currentSet[Math.floor(Math.random()*currentSet.length)];

  let choices = [currentWord];

  while(choices.length < 4){
    let r = words[Math.floor(Math.random()*words.length)];
    if(!choices.includes(r)) choices.push(r);
  }

  choices.sort(()=>Math.random()-0.5);

  let box = document.getElementById("choices");
  box.innerHTML = "";

  choices.forEach(c=>{
    let btn = document.createElement("button");
    btn.innerText = c.phonics;
    btn.onclick = ()=>checkAnswer(c.word);
    box.appendChild(btn);
  });
}


// ================== 檢查答案 ==================
function checkAnswer(ans){
  let result = document.getElementById("result");

  if(ans === currentWord.word){
    result.innerText = "✅ 正確";

    progress[currentWord.word] = (progress[currentWord.word] || 0) + 1;
  }else{
    result.innerText = "❌ 錯誤";
  }

  localStorage.setItem(studentName, JSON.stringify(progress));

  setTimeout(nextQuiz, 1000);
}
