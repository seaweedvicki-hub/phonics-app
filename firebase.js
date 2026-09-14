const firebaseConfig = {
  apiKey: "你的KEY",
  authDomain: "你的domain",
  projectId: "你的projectId"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 存資料
function saveCloud(data){
  db.collection("records").add(data);
}

// 讀資料
async function loadCloud(){
  let snapshot = await db.collection("records").get();
  return snapshot.docs.map(d=>d.data());
}