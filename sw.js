self.addEventListener("install", e=>{
  e.waitUntil(
    caches.open("app").then(c=>c.addAll([
      "./","./index.html","./app.js","./style.css"
    ]))
  );
});
