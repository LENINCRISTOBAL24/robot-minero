// ========================================
// CONFIGURACIÓN DEL ROBOT
// ========================================
 
let anguloActual = 90;
let ultimoMensaje = 0;
 
const MQTT_URL  = "wss://d825528a.ala.us-east-1.emqxsl.com:8084/mqtt";
const MQTT_USER = "ALEX";   // usuario de la página (con permisos limitados)
const MQTT_PASS = "12345678";
 
const T_SENSORES = "robot/sensores";
const T_CMD      = "robot/cmd";
const T_SERVO    = "robot/servo";
const T_VIDEO    = "robot/camara";
const T_FOTO     = "robot/foto";
const T_CAM_CMD  = "robot/camara/cmd";
 
 
// ========================================
// CONEXIÓN MQTT
// ========================================
 
const client = mqtt.connect(MQTT_URL, {
    username: MQTT_USER,
    password: MQTT_PASS,
    clientId: "web-" + Math.random().toString(16).slice(2, 8),
    reconnectPeriod: 3000
});
 
client.on("connect", () => {
    console.log("MQTT conectado al broker");
    client.subscribe([T_SENSORES, T_VIDEO, T_FOTO]);
});
 
client.on("error", (err) => {
    console.log("Error MQTT:", err.message);
});
 
client.on("close", () => {
    cambiarEstado(false);
});
 
client.on("message", (topic, msg) => {
 
    // Imágenes de la cámara (datos binarios JPEG)
    if (topic === T_VIDEO) {
        mostrarImagen("camara", msg);
        return;
    }
    if (topic === T_FOTO) {
        mostrarImagen("foto", msg);
        return;
    }
 
    if (topic === T_SENSORES) {
 
        try {
            const d = JSON.parse(msg.toString());
            actualizarSensores(d.temp, d.hum, d.dist);
            ultimoMensaje = Date.now();
            cambiarEstado(true);
        } catch (e) {
            console.log("JSON inválido:", msg.toString());
        }
    }
});
 
// Si el ESP32 no envía datos en 6 s, se marca como desconectado
setInterval(() => {
    if (Date.now() - ultimoMensaje > 6000) {
        cambiarEstado(false);
    }
}, 2000);
 
 
// ========================================
// ESTADO DE CONEXIÓN
// ========================================
 
function cambiarEstado(conectado) {
 
    const estado = document.getElementById("estado");
 
    if (conectado) {
 
        estado.textContent = "🟢 ESP32 CONECTADO";
 
        estado.classList.remove("conectado");
        estado.classList.remove("desconectado");
        estado.classList.add("conectado");
 
    } else {
 
        estado.textContent = "🔴 ESP32 DESCONECTADO";
 
        estado.classList.remove("conectado");
        estado.classList.add("desconectado");
 
    }
}
 
 
// ========================================
// CÁMARA
// ========================================
 
function mostrarImagen(idImg, datos) {
 
    const img = document.getElementById(idImg);
    const anterior = img.src;
 
    const blob = new Blob([datos], { type: "image/jpeg" });
    img.src = URL.createObjectURL(blob);
 
    if (anterior.startsWith("blob:")) {
        URL.revokeObjectURL(anterior);
    }
}
 
function camara(orden) {
 
    console.log("Cámara:", orden);
 
    client.publish(T_CAM_CMD, orden);
}
 
 
// ========================================
// CONTROL DEL SERVO
// ========================================
 
function moverServo(angulo) {
 
    anguloActual = angulo;
 
    document.getElementById("anguloServo").textContent =
        angulo + "°";
 
    console.log("Servo:", angulo, "grados");
 
    client.publish(T_SERVO, String(angulo));
}
 
 
// ========================================
// CONTROL DE MOTORES
// ========================================
 
function moverRobot(comando) {
 
    console.log("Comando:", comando);
 
    // comandos: adelante, atras, izquierda, derecha, stop, auto, manual
    client.publish(T_CMD, comando);
}
 
 
// ========================================
// DATOS DE SENSORES
// ========================================
 
function actualizarSensores(temp, hum, distancia) {
 
    document.getElementById("temperatura").textContent =
        temp + " °C";
 
    document.getElementById("humedad").textContent =
        hum + " %";
 
    document.getElementById("distancia").textContent =
        distancia + " cm";
}
 
 
// ========================================
// ESTADO INICIAL
// ========================================
 
cambiarEstado(false);
 
actualizarSensores("--", "--", "--");
 
