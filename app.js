let words = [];
let currentSet = [];
let currentWord;
let phonicsArray = [];
let index = 0;

let studentName = "";
let progress = {};

let score = 0;
let streak = 0;

// ⭐ 換你的 Google Sheet
const API_URL = "https://docs.google.com/spreadsheets/d/你的ID/gviz/tq?tqx=out:json";


// ================= 載入資料 =================
fetch(API_URL)
.then(res=>res.text())
.then(text=>{
  const json = JSON.parse(
    text.substring(text.indexOf("{"), text.lastIndexOf("}")+1)
  );

  words = json.table.rows.map(r=>({
    word: r.c[0]?.v || "",
    phonics: r.c[1]?.v || "",
    meaning: r.c[2]?.v || "",
    image: r.c[3]?.v || ""
  })).filter(w=>w.word);

  initLearn();
});


// ================= 登入 =================
function login(name){
  if(!name) return alert("請輸入名字");

  studentName = name;
  document.getElementById("student").innerText = name;

  progress = JSON.parse(localStorage.getItem(name) || "{}");

  loginBox.style.display = "none";
  app.style.display = "block";
}


// ================= 初始化 =================
function initLearn(){
  currentSet = words.slice(0,10);
  showWord();
}


// ================= 顯示單字 =================
function showWord(){
  currentWord = currentSet[Math.floor(Math.random()*currentSet.length)];

  word.innerText = currentWord.word;
  meaning.innerText = currentWord.meaning;

  phonicsArray = currentWord.phonics.includes("-")
    ? currentWord.phonics.split("-")
    : [currentWord.word];

  phonics.innerText = phonicsArray.join(" 🧩 ");

  let img = document.getElementById("image");
  img.src = currentWord.image || "";
  img.onerror = ()=> img.src="https://via.placeholder.com/150";

  speak(currentWord.word);
}


// ================= 發音 =================
function speak(text){
  if(!text) return;
  speechSynthesis.cancel();
  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-US";
  speechSynthesis.speak(msg);
}


// ================= Phonics動畫 =================
function playPhonics(){
  speechSynthesis.cancel();

  let unlock = new SpeechSynthesisUtterance("");
  unlock.volume = 0;
  speechSynthesis.speak(unlock);

  index = 0;
  phonics.innerText = "";

  setTimeout(playNext,200);
}

function playNext(){
  if(index >= phonicsArray.length){
    speak(currentWord.word);
    return;
  }

  let s = phonicsArray[index];
  phonics.innerText += s + " ";
  speak(s);

  index++;
  setTimeout(playNext,700);
}


// ================= 下一個 =================
function nextLearn(){
  showWord();
}


// ================= 測驗 =================
function startQuizMode(){
  quiz.style.display = "block";
  nextQuiz();
}

function nextQuiz(){

  let now = Date.now();

  let due = currentSet.filter(w=>{
    let p = progress[w.word];
    return !p || p.next <= now;
  });

  if(due.length === 0) due = currentSet;

  currentWord = due[Math.floor(Math.random()*due.length)];

  let arr = [currentWord];

  while(arr.length < 4){
    let r = words[Math.floor(Math.random()*words.length)];
    if(!arr.includes(r)) arr.push(r);
  }

  arr.sort(()=>Math.random()-0.5);

  choices.innerHTML = "";

  arr.forEach(c=>{
    let btn = document.createElement("button");
    btn.innerText = c.phonics;
    btn.onclick = ()=>checkAnswer(c.word);
    choices.appendChild(btn);
  });
}


// ================= AI老師 =================
function checkAnswer(ans){

  if(!progress[currentWord.word]){
    progress[currentWord.word] = {level:0, next:0};
  }

  if(ans === currentWord.word){

    result.innerText = "✅ 正確";
    score++;
    streak++;

    progress[currentWord.word].level++;

    let delay = [0,1,3,7];
    let lv = Math.min(progress[currentWord.word].level,3);

    progress[currentWord.word].next =
      Date.now() + delay[lv]*86400000;

  }else{

    result.innerText = "❌ 再試一次";
    streak = 0;

    progress[currentWord.word].level = 0;
    progress[currentWord.word].next = 0;

    currentSet.unshift(currentWord);

    speak(phonicsArray.join(" "));

    // ⭐ AI老師提示（可選）
    // askAI(currentWord.word);
  }

  document.getElementById("score").innerText = score;
  document.getElementById("streak").innerText = streak;

  localStorage.setItem(studentName, JSON.stringify(progress));

  setTimeout(nextQuiz,1000);
}


// ================= AI教學（選用） =================
function teachMe(){
  alert("之後可串 GPT 教學（目前為示意）");
}
