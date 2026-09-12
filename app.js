let words = [];
let currentSet = [];
let currentWord;
let phonicsArray = [];
let index = 0;

let studentName = "";
let progress = {};

let score = 0;
let streak = 0;

const API_URL = "你的GoogleSheet網址";

// ===== 載入資料 =====
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

// ===== 登入 =====
function login(name){
  studentName = name;
  document.getElementById("student").innerText = name;

  progress = JSON.parse(localStorage.getItem(name) || "{}");

  loginBox.style.display = "none";
  app.style.display = "block";
}

// ===== 初始化 =====
function initLearn(){
  currentSet = words.slice(0,10);
  showWord();
}

// ===== 顯示 =====
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

// ===== 發音 =====
function speak(text){
  speechSynthesis.cancel();
  let msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-US";
  speechSynthesis.speak(msg);
}

// ===== Phonics動畫 =====
function playPhonics(){
  speechSynthesis.cancel();

  let unlock = new SpeechSynthesisUtterance("");
  unlock.volume = 0;
  speechSynthesis.speak(unlock);

  index=0;
  phonics.innerText="";

  setTimeout(playNext,200);
}

function playNext(){
  if(index>=phonicsArray.length){
    speak(currentWord.word);
    return;
  }

  let s = phonicsArray[index];
  phonics.innerText += s+" ";
  speak(s);

  index++;
  setTimeout(playNext,700);
}

// ===== 測驗 =====
function startQuizMode(){
  quiz.style.display="block";
  nextQuiz();
}

function nextQuiz(){
  let choicesArr = [currentWord];

  while(choicesArr.length<4){
    let r = words[Math.floor(Math.random()*words.length)];
    if(!choicesArr.includes(r)) choicesArr.push(r);
  }

  choices.innerHTML="";

  choicesArr.forEach(c=>{
    let btn = document.createElement("button");
    btn.innerText = c.phonics;
    btn.onclick = ()=>checkAnswer(c.word);
    choices.appendChild(btn);
  });
}

// ===== AI老師核心 =====
function checkAnswer(ans){

  if(!progress[currentWord.word]){
    progress[currentWord.word]={level:0,next:0};
  }

  if(ans===currentWord.word){
    result.innerText="✅ 正確";
    score++; streak++;

    progress[currentWord.word].level++;

    let delay=[0,1,3,7];
    let lv=progress[currentWord.word].level;
    progress[currentWord.word].next = Date.now()+delay[Math.min(lv,3)]*86400000;

  }else{
    result.innerText="❌ 再試一次";
    streak=0;

    progress[currentWord.word].level=0;
    progress[currentWord.word].next=0;

    // ⭐ 錯題插隊
    currentSet.unshift(currentWord);

    // ⭐ AI提示
    speak(phonicsArray.join(" "));
  }

  scoreEl.innerText=score;
  streakEl.innerText=streak;

  localStorage.setItem(studentName,JSON.stringify(progress));

  setTimeout(nextQuiz,1000);
}
