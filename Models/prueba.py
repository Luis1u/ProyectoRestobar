# =========================================================
#  ROBOT RESOLVEDOR DE CUBO RUBIK  (LEGO Spike)
# =========================================================
#  QUÉ HACE ESTE PROGRAMA (explicación corta):
#
#  El programa tiene DOS modos, según la variable SOLUCION:
#
#   MODO 1 - ESCANEAR  (SOLUCION = "")
#       El robot mira las 6 caras del cubo con el sensor de color,
#       clasifica los colores y IMPRIME unas cadenas de texto.
#       Esa cadena se la das al programa de Kociemba (en el PC)
#       y él te devuelve la solución, algo como: "R U R' U2 F'"
#
#   MODO 2 - RESOLVER  (SOLUCION = "R U R' U2 F'")
#       El robot lee la solución movimiento por movimiento y
#       los ejecuta girando el cubo.
#
#  PUERTOS (dónde está conectado cada motor/sensor):
#       A = sensor de color
#       B = motor del brazo del sensor (sube/baja/mueve el sensor)
#       C = sensor de distancia (detecta que pusiste el cubo)
#       D = motor de la base (la mesa giratoria donde va el cubo)
#       F = motor del brazo que voltea el cubo y sujeta las capas
# =========================================================

import motor
import runloop
import color_sensor
import distance_sensor
import color
from hub import port, light, sound


# =========================================================
#  1) CONFIGURACIÓN GENERAL  (números que puedes ajustar)
# =========================================================

# --- Brazo del sensor de color (motor B) ---
# Son posiciones a las que se mueve el sensor para leer cada pegatina
POS_CENTRO = 485    # sensor sobre el centro del cubo
POS_ESQUINA = 300   # sensor sobre una esquina
POS_BORDE = 365     # sensor sobre un borde (pieza del medio de un lado)
VEL_BRAZO = 1000    # velocidad del brazo del sensor

# --- Mesa giratoria (motor D) ---
PASO_BASE = 135     # grados que gira la mesa entre pegatina y pegatina al escanear
VEL_BASE = 400      # velocidad de la mesa
ESPERA_MS = 120     # pausa (milisegundos) para que el sensor se estabilice

# --- Detección del cubo con el sensor de distancia (puerto C) ---
DISTANCIA_CUBO_MM = 80      # distancia a la que está el cubo cuando está bien puesto
TOLERANCIA_MM = 10          # cuánto se puede equivocar la medida (+/-)
LECTURAS_CONFIRMAR = 5      # lecturas seguidas correctas para confirmar que hay cubo
ESPERA_TRAS_PITIDO_MS = 2000  # tiempo para que quites la mano después del pitido

# --- Lectura de color ---
MUESTRAS = 5    # cuántas veces lee cada pegatina (y saca el promedio)

BLANCO_MAX_SAT = 0.28         # menos saturación que esto = blanco
H_LIMITE_ROJO_NARANJA = -2    # límites de matiz (color) para el botón del hub
H_NARANJA_MAX = 33
H_AMARILLO_MAX = 75
H_VERDE_MAX = 170

NOMBRES_COLORES = ["ROJO", "NARANJA", "AMARILLO", "VERDE", "AZUL"]

# Orden en que se leen las 9 pegatinas de una cara -> posición (fila, columna)
POS_A_CELDA = {
    0: (2, 0), 1: (1, 0), 2: (0, 0),
    3: (0, 1), 4: (0, 2), 5: (1, 2),
    6: (2, 2), 7: (2, 1), 8: (1, 1),
}

# --- Resolución (modo 2) ---
# Para ESCANEAR deja esto vacío:  SOLUCION = ""
# Para RESOLVER pega aquí lo que te dé Kociemba, ejemplo: "R U R' U2 F'"
SOLUCION = "L' D2 B2 U L F B' L D B R' B2 L2 F2 U2 L2 D' R2 U' B2 U"

SUJETAR = 100   # grados que baja el brazo F para apretar las 2 capas de arriba
EXTRA = 80      # grados "de más" que gira la mesa para que la capa pase bien
BASE_90 = 270   # grados que debe girar el motor D para que la mesa gire 90°

# Para convertir lo escaneado al formato de Kociemba
LETRAS = "UFDBLR"            # cara escaneada 0..5 -> letra de Kociemba
GIROS = (0, 0, 0, 2, 3, 3)   # giros de 90° que hay que dar a cada cara escaneada


# =========================================================
#  2) VARIABLES GLOBALES
# =========================================================

# "cubo" guarda lo que ve el robot: 6 caras, cada una de 3x3 pegatinas.
# Al inicio todo es "?" (desconocido). Luego se llena con colores.
cubo = []
for i in range(6):
    cubo.append([["?", "?", "?"], ["?", "?", "?"], ["?", "?", "?"]])

# Posición "cero" del brazo del sensor (se calcula en reiniciar_brazo)
base_brazo = 0


# =========================================================
#  3) LECTURA DE COLORES  (NO SE TOCÓ, FUNCIONA BIEN)
# =========================================================

def calcular_matiz(r, g, b):

    maximo = max(r, g, b)
    minimo = min(r, g, b)

    if maximo == 0:
        return 0, 0

    diferencia = maximo - minimo
    saturacion = diferencia / maximo

    if diferencia == 0:
        return 0, saturacion

    if maximo == r:
        matiz = 60 * (((g - b) / diferencia) % 6)
    elif maximo == g:
        matiz = 60 * (((b - r) / diferencia) + 2)
    else:
        matiz = 60 * (((r - g) / diferencia) + 4)

    if matiz >= 300:
        matiz = matiz - 360

    return matiz, saturacion


def pintar_boton(r, g, b):

    matiz, saturacion = calcular_matiz(r, g, b)

    if saturacion < BLANCO_MAX_SAT:
        light.color(light.POWER, color.WHITE)
    elif matiz <= H_LIMITE_ROJO_NARANJA:
        light.color(light.POWER, color.RED)
    elif matiz <= H_NARANJA_MAX:
        light.color(light.POWER, color.ORANGE)
    elif matiz <= H_AMARILLO_MAX:
        light.color(light.POWER, color.YELLOW)
    elif matiz <= H_VERDE_MAX:
        light.color(light.POWER, color.GREEN)
    else:
        light.color(light.POWER, color.BLUE)


async def leer_pieza(numero_cara, indice):

    suma_r = 0
    suma_g = 0
    suma_b = 0
    for i in range(MUESTRAS):
        r, g, b, luz = color_sensor.rgbi(port.A)
        suma_r = suma_r + r
        suma_g = suma_g + g
        suma_b = suma_b + b
        await runloop.sleep_ms(15)

    promedio_r = suma_r // MUESTRAS
    promedio_g = suma_g // MUESTRAS
    promedio_b = suma_b // MUESTRAS

    fila, columna = POS_A_CELDA[indice]
    cubo[numero_cara][fila][columna] = (promedio_r, promedio_g, promedio_b)

    pintar_boton(promedio_r, promedio_g, promedio_b)


async def leerCara(numero_cara):

    await mover_brazo(POS_CENTRO)
    await runloop.sleep_ms(ESPERA_MS)
    await leer_pieza(numero_cara, 8)

    inicio = motor.relative_position(port.D)

    for k in range(8):
        if k % 2 == 0:
            await mover_brazo(POS_ESQUINA)
        else:
            await mover_brazo(POS_BORDE)

        destino = inicio + PASO_BASE * (k + 1)
        await motor.run_to_relative_position(port.D, destino, VEL_BASE, stop=motor.HOLD)

        await runloop.sleep_ms(ESPERA_MS)
        await leer_pieza(numero_cara, k)

    await mover_brazo(0)


def clasificar_todo():

    matiz_centro = []
    saturacion_centro = []
    for cara in range(6):
        r, g, b = cubo[cara][1][1]
        matiz, saturacion = calcular_matiz(r, g, b)
        matiz_centro.append(matiz)
        saturacion_centro.append(saturacion)

    cara_blanca = 0
    for cara in range(6):
        if saturacion_centro[cara] < saturacion_centro[cara_blanca]:
            cara_blanca = cara

    nombre_centro = ["", "", "", "", "", ""]
    matices_ref = [0, 0, 0, 0, 0]
    nombre_centro[cara_blanca] = "BLANCO"

    for cara in range(6):
        if cara != cara_blanca:
            lugar = 0
            for otra in range(6):
                if otra != cara_blanca:
                    if matiz_centro[otra] < matiz_centro[cara]:
                        lugar = lugar + 1
                    elif matiz_centro[otra] == matiz_centro[cara] and otra < cara:
                        lugar = lugar + 1
            nombre_centro[cara] = NOMBRES_COLORES[lugar]
            matices_ref[lugar] = matiz_centro[cara]

    sat_minima = 999
    for cara in range(6):
        if cara != cara_blanca and saturacion_centro[cara] < sat_minima:
            sat_minima = saturacion_centro[cara]
    umbral = (saturacion_centro[cara_blanca] + sat_minima) / 2

    # Distancia de cada pegatina a cada color (0..4 = colores, 5 = blanco)
    nombres = NOMBRES_COLORES + ["BLANCO"]
    cuenta = [0, 0, 0, 0, 0, 0]
    piezas = []
    for cara in range(6):
        cuenta[nombres.index(nombre_centro[cara])] += 1
        for fila in range(3):
            for columna in range(3):
                if fila == 1 and columna == 1:
                    continue
                matiz, saturacion = calcular_matiz(*cubo[cara][fila][columna])
                d = []
                for i in range(5):
                    x = abs(matiz - matices_ref[i]) % 360
                    if x > 180:
                        x = 360 - x
                    d.append(x + max(0, umbral - saturacion) * 600)
                d.append(max(0, saturacion - umbral) * 600)
                k = d.index(min(d))
                cuenta[k] += 1
                piezas.append([cara, fila, columna, d, k])

    # Cada color debe tener exactamente 9 pegatinas: si sobra en uno y falta en otro,
    # se cambia la pegatina mas dudosa del que sobra al que falta
    for _ in range(54):
        if max(cuenta) <= 9:
            break
        a = cuenta.index(max(cuenta))
        b = cuenta.index(min(cuenta))
        mejor = None
        for p in piezas:
            if p[4] == a:
                costo = p[3][b] - p[3][a]
                if mejor is None or costo < mejor[0]:
                    mejor = (costo, p)
        mejor[1][4] = b
        cuenta[a] -= 1
        cuenta[b] += 1

    for cara in range(6):
        cubo[cara][1][1] = nombre_centro[cara]
    for cara, fila, columna, d, k in piezas:
        cubo[cara][fila][columna] = nombres[k]


def imprimir_cadenas():
    # Letra de cada color = letra de la cara cuyo centro tiene ese color
    letra = {cubo[i][1][1]: LETRAS[i] for i in range(6)}
    # Se imprimen 4 variantes (giro inicial de la cuadrícula); Kociemba acepta solo 1
    for k0 in range(4):
        s = ""
        for cara in (0, 5, 1, 2, 4, 3):    # orden de Kociemba: U R F D L B
            g = cubo[cara]
            for _ in range(k0 + GIROS[cara]):
                g = [[g[2 - j][i] for j in range(3)] for i in range(3)]
            for fila in g:
                for c in fila:
                    s += letra[c]
        print(s)


# =========================================================
#  4) MOVIMIENTOS BÁSICOS DEL ROBOT  ("ladrillos")
#     Todo lo demás se construye con estas piezas simples
# =========================================================

async def reiniciar_brazo():
    # Busca la posición "cero" del brazo del sensor.
    # Cómo: empuja el brazo hasta el tope mecánico (donde ya no se mueve)
    # y ahí marca el cero. Lo hace 2 veces para ser más preciso.
    global base_brazo

    for intento in range(2):

        # En el segundo intento, primero se aleja un poquito del tope
        if intento > 0:
            motor.set_duty_cycle(port.B, 3800)   # se mueve al lado contrario
            await runloop.sleep_ms(100)
            motor.stop(port.B)
            await runloop.sleep_ms(100)

        # Empuja el brazo hacia el tope
        motor.set_duty_cycle(port.B, -3800)

        # Espera hasta que el brazo deje de moverse (llegó al tope)
        pos_actual = motor.relative_position(port.B)
        pos_anterior = pos_actual + 100     # truco para entrar al while
        while pos_actual < pos_anterior:
            await runloop.sleep_ms(100)
            pos_anterior = pos_actual
            pos_actual = motor.relative_position(port.B)

    # Guarda esa posición (+10 de margen) como el "cero" del brazo
    base_brazo = motor.relative_position(port.B) + 10
    motor.stop(port.B)


async def mover_brazo(pos):
    # Mueve el brazo del sensor a una posición, medida desde el "cero"
    destino = base_brazo + pos
    await motor.run_to_relative_position(port.B, destino, VEL_BRAZO, stop=motor.HOLD)


async def esperar_cubo():
    # Espera a que pongas el cubo en la mesa.
    # Usa el sensor de distancia: cuando mide ~80 mm varias veces seguidas,
    # entiende que el cubo ya está puesto.
    seguidas = 0

    while seguidas < LECTURAS_CONFIRMAR:
        mm = distance_sensor.distance(port.C)
        if abs(mm - DISTANCIA_CUBO_MM) <= TOLERANCIA_MM:
            seguidas = seguidas + 1     # lectura buena, suma
        else:
            seguidas = 0                # lectura mala, empieza de nuevo
        await runloop.sleep_ms(50)

    await sound.beep(880, 300, 100)     # pitido: "ya te vi, cubo detectado"
    await runloop.sleep_ms(ESPERA_TRAS_PITIDO_MS)   # tiempo para quitar la mano


async def voltear_cubo():
    # El brazo F empuja el cubo y lo hace rodar 90° hacia adelante.
    # (baja 160 grados, empuja, y vuelve a subir)
    await motor.run_for_degrees(port.F, -160, 350)
    await motor.run_for_degrees(port.F, 160, 350)


async def voltear_cubo_varias_veces(veces):
    # Voltea el cubo 'veces' veces seguidas
    for _ in range(veces):
        await voltear_cubo()


async def girar_mesa_grados(grados):
    # Gira la mesa una cantidad exacta de grados del motor D
    await motor.run_for_degrees(port.D, grados, VEL_BASE)


async def girar_mesa(cuartos):
    # Gira la mesa (y el cubo con ella) en "cuartos de vuelta" (90° cada uno)
    #    cuartos =  1  -> 90° hacia un lado
    #    cuartos = -1  -> 90° hacia el otro lado
    await girar_mesa_grados(cuartos * BASE_90)


async def sujetar_capas_de_arriba():
    # El brazo F baja y aprieta las 2 capas de arriba del cubo
    # para que NO giren cuando la mesa gire la capa de abajo
    await motor.run_for_degrees(port.F, -SUJETAR, 350)


async def soltar_capas_de_arriba():
    # El brazo F sube y suelta el cubo
    await motor.run_for_degrees(port.F, SUJETAR, 350)


async def girar_capa_de_abajo(tipo):
    # Gira SOLO la capa de abajo del cubo.
    #   Idea: el brazo sujeta las 2 capas de arriba, y la mesa gira,
    #   arrastrando únicamente la capa de abajo.
    #
    #   tipo = ""   -> giro normal   (ej: U)   = 90° en un sentido
    #   tipo = "2"  -> giro doble    (ej: U2)  = 180°
    #   tipo = "'"  -> giro inverso  (ej: U')  = 90° en el sentido contrario

    # 1) ¿Cuántos grados debe girar la mesa?
    if tipo == "":
        grados = BASE_90
    elif tipo == "2":
        grados = 2 * BASE_90
    else:                       # tipo == "'"
        grados = -BASE_90

    # 2) ¿Hacia qué lado gira? (+1 o -1) para saber hacia dónde sobregirar
    if grados > 0:
        signo = 1
    else:
        signo = -1

    # 3) Hacer el giro
    await sujetar_capas_de_arriba()
    await girar_mesa_grados(grados + signo * EXTRA)   # gira un poquito de más
    await girar_mesa_grados(-signo * EXTRA)           # regresa ese poquito de más
    await soltar_capas_de_arriba()
    # (Se gira "de más" porque la capa necesita pasar bien el punto de
    #  alineación; luego se regresa para que quede exactamente recta.)


# =========================================================
#  5) UN MOVIMIENTO POR CADA CARA DEL CUBO
# =========================================================
#  El robot SOLO puede girar la capa de ABAJO.
#  Entonces, para girar cualquier cara, siempre hace lo mismo:
#
#     PASO 1: poner la cara que quiero girar ABAJO
#     PASO 2: girar la capa de abajo
#     PASO 3: dejar el cubo como estaba
#
#  Dar 4 volteos de 90° = una vuelta completa = el cubo queda igual
#  que al principio. Por eso, después de girar, se completan los
#  volteos hasta llegar a 4.
#
#  Resumen:
#     Cara | volteos para ponerla abajo | gira la mesa antes
#      D   |            0               |        no
#      B   |            1               |        no
#      U   |            2               |        no
#      F   |            3               |        no
#      R   |            1               |        sí
#      L   |            3               |        sí
#
#  El parámetro "tipo" puede ser:  ""  (normal),  "2"  (doble),  "'"  (inverso)
# =========================================================

async def mover_D(tipo):
    # D (Down = abajo) ya está abajo: no hay que voltear nada
    await girar_capa_de_abajo(tipo)


async def mover_B(tipo):
    # B (Back = atrás)
    await voltear_cubo_varias_veces(1)      # PASO 1: B queda abajo (1 volteo)
    await girar_capa_de_abajo(tipo)         # PASO 2: girar
    await voltear_cubo_varias_veces(3)      # PASO 3: 1 + 3 = 4 volteos, queda igual


async def mover_U(tipo):
    # U (Up = arriba)
    await voltear_cubo_varias_veces(2)      # PASO 1: U queda abajo (2 volteos)
    await girar_capa_de_abajo(tipo)         # PASO 2: girar
    await voltear_cubo_varias_veces(2)      # PASO 3: 2 + 2 = 4 volteos, queda igual


async def mover_F(tipo):
    # F (Front = frente)
    await voltear_cubo_varias_veces(3)      # PASO 1: F queda abajo (3 volteos)
    await girar_capa_de_abajo(tipo)         # PASO 2: girar
    await voltear_cubo_varias_veces(1)      # PASO 3: 3 + 1 = 4 volteos, queda igual


async def mover_R(tipo):
    # R (Right = derecha)
    await girar_mesa(1)                     # antes: gira la mesa para que R quede al frente
    await voltear_cubo_varias_veces(1)      # PASO 1: R queda abajo (1 volteo)
    await girar_capa_de_abajo(tipo)         # PASO 2: girar
    await voltear_cubo_varias_veces(3)      # PASO 3: 1 + 3 = 4 volteos
    await girar_mesa(-1)                    # al final: regresa la mesa a su lugar


async def mover_L(tipo):
    # L (Left = izquierda)
    await girar_mesa(1)                     # antes: gira la mesa para que L quede al frente
    await voltear_cubo_varias_veces(3)      # PASO 1: L queda abajo (3 volteos)
    await girar_capa_de_abajo(tipo)         # PASO 2: girar
    await voltear_cubo_varias_veces(1)      # PASO 3: 3 + 1 = 4 volteos
    await girar_mesa(-1)                    # al final: regresa la mesa a su lugar


# =========================================================
#  6) LEER LA SOLUCIÓN Y EJECUTARLA
# =========================================================

async def ejecutar_movimiento(movimiento):
    # Recibe UN movimiento como texto: "U", "R'", "F2", etc.
    # y llama a la función de la cara correcta.
    #
    #   Ejemplo con "R'":
    #       cara = "R"    (primera letra)
    #       tipo = "'"    (lo que sobra)  -> giro inverso
    cara = movimiento[0]        # primera letra: U, D, F, B, L o R
    tipo = movimiento[1:]       # el resto: "", "2" o "'"

    if cara == "U":
        await mover_U(tipo)
    elif cara == "D":
        await mover_D(tipo)
    elif cara == "F":
        await mover_F(tipo)
    elif cara == "B":
        await mover_B(tipo)
    elif cara == "L":
        await mover_L(tipo)
    elif cara == "R":
        await mover_R(tipo)


async def ejecutar_solucion(solucion):
    # La solución es un texto con movimientos separados por espacios:
    #     "R U R' U2 F'"
    # .split() lo convierte en una lista: ["R", "U", "R'", "U2", "F'"]
    # y se ejecuta uno por uno, en orden.
    for movimiento in solucion.split():
        await ejecutar_movimiento(movimiento)


# =========================================================
#  7) ESCANEAR EL CUBO (modo 1)
# =========================================================

async def escanear_las_6_caras():
    # Lee las 6 caras. Después de leer cada una, mueve el cubo
    # para dejar la siguiente cara lista frente al sensor.
    for numero_cara in range(6):
        await leerCara(numero_cara)

        if numero_cara < 3:
            # Caras 0, 1 y 2: basta con voltear el cubo
            await voltear_cubo()
        elif numero_cara == 3:
            # Después de la cara 3: gira la mesa y voltea
            await girar_mesa(1)
            await voltear_cubo()
        elif numero_cara == 4:
            # Después de la cara 4: voltea dos veces
            await voltear_cubo_varias_veces(2)
        # Después de la cara 5 no hay que mover nada: ya terminó

    # Deja el cubo en la posición inicial (la que necesita la fase de resolución)
    await girar_mesa(-1)
    await voltear_cubo()
    await girar_mesa(-1)


# =========================================================
#  8) PROGRAMA PRINCIPAL
# =========================================================

async def main():
    # Paso 1: dejar el brazo del sensor en su posición cero
    await reiniciar_brazo()

    # Paso 2: esperar a que pongas el cubo
    await esperar_cubo()

    # Paso 3: elegir el modo
    if SOLUCION:
        # MODO 2: hay una solución escrita -> ejecutarla y terminar
        await ejecutar_solucion(SOLUCION)
        return

    # MODO 1: no hay solución -> escanear el cubo
    await escanear_las_6_caras()
    clasificar_todo()       # decide qué color es cada pegatina
    imprimir_cadenas()      # imprime el texto para pasárselo a Kociemba


runloop.run(main())