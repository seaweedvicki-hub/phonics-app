async function askAI() {
  let input = document.getElementById("aiInput").value;

  let res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_OPENAI_KEY"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {role:"system", content:"你是一個教小孩英文的老師，用簡單方式教學"},
        {role:"user", content: input}
      ]
    })
  });

  let data = await res.json();
  let reply = data.choices[0].message.content;

  chat.innerHTML += `<p>👦 ${input}</p>`;
  chat.innerHTML += `<p>🤖 ${reply}</p>`;
}