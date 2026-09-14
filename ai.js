async function askAI(){

  let input = document.getElementById("aiInput").value;

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
          content:"你是一個溫柔的英文老師，用簡單英文+中文教小學生"
        },
        {role:"user",content:input}
      ]
    })
  });

  let data = await res.json();
  let reply = data.choices[0].message.content;

  document.getElementById("chatBox").innerHTML += `
    <p>👦 ${input}</p>
    <p>👩‍🏫 ${reply}</p>
  `;
}
