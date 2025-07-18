import { inicializarDB, guardarComentario, guardarComentarioPendiente} from './db.js';
import { crearRating } from './componentes/rating.js';
import { mostrarComentarios } from './componentes/listaComentarios.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-messaging.js";
import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAS7a5mV9As2GfbuzI4MIRp6Zv1itYDUBg",
  authDomain: "pwa-notificaciones-fabri.firebaseapp.com",
  projectId: "pwa-notificaciones-fabri",
  storageBucket: "pwa-notificaciones-fabri.firebaseapp.com",
  messagingSenderId: "140521245389",
  appId: "1:140521245389:web:a263c7b9c9d0ed07443784"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messaging = getMessaging(app);

// Solicitar permiso de notificaciones y obtener token
Notification.requestPermission().then((permission) => {
  if (permission === "granted") {
    console.log("Permiso de notificaciones otorgado");

    getToken(messaging, {
      vapidKey: "BGV-swrixG6EQMQZM4olFbjBVjcasXHrO4owXHkfivFAnBTVv-58anD4lb_NcTVRqTg0Napmld88-P-j9LuoLrc"
    }).then((currentToken) => {
      if (currentToken) {
        console.log("Token FCM:", currentToken);

        // Guardar token en Firestore
        addDoc(collection(db, "tokens"), {
          token: currentToken,
          fecha: new Date()
        }).then(() => {
          console.log("Token guardado en Firestore");
        }).catch((error) => {
          console.error("Error al guardar token:", error);
        });

      } else {
        console.warn("No se obtuvo token FCM");
      }
    }).catch((err) => {
      console.error("Error al obtener token:", err);
    });

  } else {
    console.warn("Permiso de notificaciones denegado");
  }
});

// Notificaciones en primer plano
onMessage(messaging, (payload) => {
  console.log("Mensaje recibido en primer plano:", payload);

  const notification = payload.notification;

  if (Notification.permission === 'granted') {
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration) {
        registration.showNotification(notification.title, {
          body: notification.body,
          icon: "/assets/icon.png"
        });
      }
    });
  }
});

// Modo oscuro
const toggle = document.getElementById('input');
const h1 = document.getElementById('tituloh1');

window.addEventListener('DOMContentLoaded', () => {
  const darkMode = localStorage.getItem('darkMode');
  if (darkMode === 'enabled') {
    document.body.classList.add('dark');
    toggle.checked = true;
    h1.style.color = 'white';
  } else {
    h1.style.color = 'black';
  }
});

toggle.addEventListener('change', () => {
  if (toggle.checked) {
    document.body.classList.add('dark');
    localStorage.setItem('darkMode', 'enabled');
    h1.style.color = 'white';
  } else {
    document.body.classList.remove('dark');
    localStorage.setItem('darkMode', 'disabled');
    h1.style.color = 'black';
  }
});

const content = document.getElementById('content');
const buttons = document.querySelectorAll('.tabs button');
const imagenesPorCategoria = {
  limpieza: 'assets/foto-limpieza.jpg',
  transporte: 'assets/foto-transporte.jpg',
  verdes: 'assets/foto-espacio-verde.jpg',
  eventos: 'assets/foto-evento-gratis.jpeg',
  subte: 'assets/foto-subte.jpg',
  seguridad: 'assets/foto-seguridad.jpg',
  accesibilidad: 'assets/foto-accesibilidad.jpg'
};

buttons.forEach(btn => {
  btn.addEventListener('click', async () => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      alert("Debes iniciar sesión para enviar un comentario.");
      window.location.href = "login.html";
      return;
    }

    const categoria = btn.dataset.tab;
    content.innerHTML = `
      <h2>${btn.textContent}</h2>
      <img src="${imagenesPorCategoria[categoria]}" alt="${btn.textContent}" style="width: 500px; height: auto; margin-bottom: 10px; margin: auto;">
      <label>Tu comentario:</label><br/>
      <textarea id="comentario"></textarea><br/>
      <label>Tu puntuación:</label>
      <div id="calificacion"></div>
      <button id="submit">Enviar</button>
      <h3>Comentarios anteriores:</h3>
      <div id="comentarios"></div>
    `;
    crearRating(document.getElementById('calificacion'));

    document.getElementById('submit').addEventListener('click', async () => {
      const texto = document.getElementById('comentario').value;
      const calificacion = document.querySelectorAll('.calificacion.selected').length;
      const comentario = {
        texto,
        calificacion,
        fecha: new Date().toISOString()
      };
      if (navigator.onLine) {
        await guardarComentario(categoria, comentario);
      } else {
        await guardarComentarioPendiente(categoria, comentario);
        alert('Sin conexión. Comentario guardado localmente.');
      }

      document.getElementById('comentario').value = "";
      mostrarComentarios(categoria, document.getElementById('comentarios'));
    });

    mostrarComentarios(categoria, document.getElementById('comentarios'));
  });
});

window.addEventListener('online', () => {
  console.log('Conexión restaurada. Reintentando...');
  reenviarPendientes();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('firebase-messaging-sw.js')
      .then(reg => console.log("SW registrado", reg.scope))
      .catch(err => console.error("SW error:", err));
  });
}

inicializarDB();