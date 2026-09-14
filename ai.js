async function explainWord(word){

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
          content:"用國小程度中文+簡單英文解釋單字"
        },
        {
          role:"user",
          content:`解釋 ${word}`
        }
      ]
    })
  });

  let data = await res.json();
  return data.choices[0].message.content;
}
