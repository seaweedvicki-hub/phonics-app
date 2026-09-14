async function generateAIWords(){

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
          content:"請產生10個國小英文單字，格式：word|phonics|中文，每行一個"
        }
      ]
    })
  });

  let data = await res.json();
  let text = data.choices[0].message.content;

  let lines = text.split("\n");

  window.aiWords = lines.map(l=>{
    let [w,p,m] = l.split("|");
    return {word:w, phonics:p, meaning:m};
  });

  alert("✅ AI已產生10字！");
}
