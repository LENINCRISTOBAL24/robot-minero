let anguloActual = 90;
let ultimoMensaje = 0;

const MQTT_URL  = "wss://d825528a.ala.us-east-1.emqxsl.com:8084/mqtt";
const MQTT_USER = "ALEX";
const MQTT_PASS = "12345678";

const T_SENSORES = "robot/sensores";
const T_CMD      = "robot/cmd";
const T_SERVO    = "robot/servo";
const T_VIDEO    = "robot/camara";
const T_FOTO     = "robot/foto";
const T_CAM_CMD  = "robot/camara/cmd";

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

client.on("error", (err) => console.log("Error MQTT:", err.message));
client.on("close", () => cambiarEstado(false));

client.on("message", (topic, msg) => {
    if (topic === T_VIDEO) { mostrarImagen("camara", msg); return; }
    if (topic === T_FOTO)  { mostrarImagen("foto", msg); return; }

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

setInterval(() => {
    if (Date.now() - ultimoMensaje > 6000) cambiarEstado(false);
}, 2000);

function cambiarEstado(conectado) {
    const estado = document.getElementById("estado");
    if (conectado) {
        estado.textContent = "🟢 ESP32 CONECTADO";
        estado.classList.remove("desconectado");
        estado.classList.add("conectado");
    } else {
        estado.textContent = "🔴 ESP32 DESCONECTADO";
        estado.classList.remove("conectado");
        estado.classList.add("desconectado");
    }
}

function mostrarImagen(idImg, datos) {
    const img = document.getElementById(idImg);
    const anterior = img.src;
    img.src = URL.createObjectURL(new Blob([datos], { type: "image/jpeg" }));
    if (anterior.startsWith("blob:")) URL.revokeObjectURL(anterior);
}

function camara(orden) { client.publish(T_CAM_CMD, orden); }

function moverServo(angulo) {
    anguloActual = angulo;
    document.getElementById("anguloServo").textContent = angulo + "°";
    client.publish(T_SERVO, String(angulo));
}

function moverRobot(comando) { client.publish(T_CMD, comando); }

function actualizarSensores(temp, hum, distancia) {
    document.getElementById("temperatura").textContent = temp + " °C";
    document.getElementById("humedad").textContent = hum + " %";
    document.getElementById("distancia").textContent = distancia + " cm";
}

cambiarEstado(false);
actualizarSensores("--", "--", "--");
