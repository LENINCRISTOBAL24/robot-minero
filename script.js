// ========================================
// CONFIGURACIÓN DEL ROBOT
// ========================================

let anguloActual = 90;


// ========================================
// ESTADO DE CONEXIÓN
// ========================================

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


// ========================================
// CONTROL DEL SERVO
// ========================================

function moverServo(angulo) {

    anguloActual = angulo;

    document.getElementById("anguloServo").textContent =
        angulo + "°";

    console.log("Servo:", angulo, "grados");

    // Más adelante:
    // MQTT enviará el ángulo al ESP32
}


// ========================================
// CONTROL DE MOTORES
// ========================================

function moverRobot(comando) {

    console.log("Comando:", comando);

    switch (comando) {

        case "adelante":
            console.log("Robot avanzando");
            break;

        case "atras":
            console.log("Robot retrocediendo");
            break;

        case "izquierda":
            console.log("Robot girando izquierda");
            break;

        case "derecha":
            console.log("Robot girando derecha");
            break;

        case "stop":
            console.log("Robot detenido");
            break;
    }

    // Más adelante:
    // MQTT enviará el comando al ESP32
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
// PRUEBA LOCAL
// ========================================

cambiarEstado(false);

actualizarSensores("--", "--", "--");	