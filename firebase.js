const firebaseConfig = {
  apiKey: "你的KEY",
  authDomain: "你的domain",
  projectId: "你的projectId"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 存資料
function saveRecord(name,data){
  db.collection("students")
    .doc(name)
    .collection("records")
    .add(data);
}

// 讀資料
async function loadReport(name){
  let snap = await db.collection("students")
    .doc(name)
    .collection("records")
    .get();

  return snap.docs.map(d=>d.data());
}
