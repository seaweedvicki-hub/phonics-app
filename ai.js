// =======================
// 🤖 AI生成課程
// =======================
async function generateLesson(){

  let res = await fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":"Bearer YOUR_OPENAI_KEY"
    },
    body:JSON.stringify({
      model:"gpt-4o-mini",
      messages:[
        {
          role:"system",
          content:"你是一個國小英文老師，請產生10個英文單字，格式為 JSON 陣列，包含 word, phonics(用-分開), meaning"
        }
      ]
    })
  });

  let data = await res.json();
  let text = data.choices[0].message.content;

  try{
    window.aiWords = JSON.parse(text);
  }catch{
    alert("AI格式錯誤，使用預設單字");
    window.aiWords = null;
  }
}
