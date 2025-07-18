let db;

import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export function inicializarDB() {
  const request = indexedDB.open("EncuestasCABA", 1);
  request.onupgradeneeded = e => {
    db = e.target.result;
    if (!db.objectStoreNames.contains("comentarios")) {
      db.createObjectStore("comentarios", { keyPath: "id", autoIncrement: true });
    }
  };
  request.onsuccess = e => { db = e.target.result; };
}

export function guardarComentario(categoria, comentario) {
  addDoc(collection(db, "comentarios"), {
    categoria: categoria,
    comentario : comentario,
    fecha: new Date()
  }).then(() => {
    console.log("Token guardado en Firestore");
  }).catch((error) => {
    console.error("Error al guardar token:", error);
  });
  return new Promise(resolve => {
    const tx = db.transaction("comentarios", "readwrite");
    const store = tx.objectStore("comentarios");
    store.add({ ...comentario, categoria });
    tx.oncomplete = resolve;

  });
} 

 

export function guardarComentarioPendiente(categoria, comentario) {
  return new Promise(resolve => {
    const tx = db.transaction("pendientes", "readwrite");
    const store = tx.objectStore("pendientes");
    store.add({ ...comentario, categoria });
    tx.oncomplete = resolve;
  });
}
/*
export async function traerComentarios(categoria) {
  try {
    const q = query(
      collection(dbFirestore, "comentarios"),
      where("categoria", "==", categoria)
    );

    const querySnapshot = await getDocs(q);
    const resultados = [];
    querySnapshot.forEach((doc) => {
      resultados.push(doc.data());
    });
    return resultados;
  } catch (error) {
    console.error("Error al traer comentarios:", error);
    return [];
  }
}*/

export function traerComentarios(categoria) {
  return new Promise(resolve => {
    const tx = db.transaction("comentarios", "readonly");
    const store = tx.objectStore("comentarios");
    const request = store.getAll();
    request.onsuccess = () => {
      resolve(request.result.filter(c => c.categoria === categoria));
    };
  });
}
