# Especificación del prototipo de chat con Groq

## Objetivo y alcance

Construir un prototipo de chat para explorar el uso interno de IA antes de desarrollar un producto completo. La interfaz debe comunicarse con un modelo real y hacer visibles y medibles los datos de la conversación, especialmente el consumo de tokens por respuesta y su acumulación durante la sesión.

Esta especificación recoge el brief y los requisitos de [context.md](context.md) y [README.md](README.md). Describe comportamiento esperado, no funcionalidades ya implementadas. Su creación no incluye implementar la aplicación.

## Requisitos técnicos

- Frontend en React/Next.js.
- Proveedor de inferencia: [Groq](https://groq.com/), mediante su API externa.
- Modelo confirmado: `qwen/qwen3.8-27b`, verificado como disponible en el plan gratuito de Groq.
- Cuenta en [Groq Console](https://console.groq.com/) y credencial `GROQ_API_KEY` como variable de entorno exclusiva del servidor.
- Las peticiones a Groq deben pasar por el servidor de Next.js. La clave no debe enviarse al navegador, persistirse con el historial ni incluirse en el repositorio.

## Comportamiento funcional

### Conversación

- Mostrar mensajes diferenciados del usuario y del asistente, en orden cronológico.
- Permitir escribir y enviar mensajes no vacíos.
- Enviar a Groq el historial válido necesario para mantener el contexto, junto con el nuevo mensaje.
- Mostrar la respuesta real del proveedor asociada a la petición correspondiente.

### Flujo asíncrono y estado

- Distinguir los estados de restauración de sesión, listo, envío en curso y error.
- Mostrar un indicador mientras se espera la respuesta y evitar envíos simultáneos o duplicados desde la interfaz.
- Al finalizar una petición, actualizar conjuntamente el mensaje del asistente y sus métricas.
- Gestionar errores de red, credenciales, límites del proveedor y respuestas inválidas sin bloquear la interfaz ni perder el historial previo.
- No presentar una petición fallida como respuesta completada ni inventar métricas para ella.
- Si falta contenido utilizable o la respuesta está incompleta, comunicarlo de forma visible.

### Métricas visibles y medibles

| Dato | Fuente | Presentación requerida |
| --- | --- | --- |
| Tokens de prompt | `usage.prompt_tokens` | Por respuesta y acumulado de sesión |
| Tokens de completado | `usage.completion_tokens` | Por respuesta y acumulado de sesión |
| Tokens totales | `usage.total_tokens` | Por respuesta y acumulado de sesión |
| Métrica adicional | Metadatos de respuesta o medición identificada | Al menos una: modelo utilizado, tiempo de respuesta o tokens por segundo |

- Registrar los valores reales de `usage` asociados a cada respuesta, sin estimarlos a partir del texto.
- Calcular cada acumulado sumando el campo correspondiente de las respuestas registradas, una sola vez por respuesta.
- No sumar nuevamente los tokens de mensajes históricos por el mero hecho de restaurarlos o renderizarlos. Si Groq vuelve a procesar el historial en otra petición, ese consumo sí forma parte del nuevo `usage`.
- Los acumulados representan el uso registrado por el prototipo en esta sesión, no el consumo global ni la facturación de la cuenta de Groq.
- Si falta una métrica, mostrar que no está disponible; no interpretarla como cero ni presentar un acumulado incompleto como completo.
- Si se elige tiempo de respuesta, indicar la unidad y distinguir la latencia medida por la aplicación del tiempo informado por Groq. Si se eligen tokens por segundo, definir la fuente y el cálculo.

### Persistencia de la sesión

- Conservar el historial al recargar la página y al cerrar y volver a abrir la pestaña en el mismo navegador, mientras no se eliminen los datos persistidos.
- Persistir los mensajes y las métricas asociadas de forma coherente para recuperar los mismos acumulados.
- Restaurar la sesión antes de permitir nuevos envíos; no sobrescribir los datos existentes con el estado vacío inicial.
- Validar los datos recuperados y gestionar datos corruptos o almacenamiento no disponible sin bloquear la interfaz. Avisar cuando no pueda garantizarse la persistencia.
- No persistir una petición en curso como respuesta completada. Tras una interrupción, no reenviarla automáticamente ni duplicar mensajes o métricas.
- La persistencia entre dispositivos o navegadores no forma parte del requisito actual.

## Datos mínimos de sesión

La implementación deberá conservar una identificación de la sesión y una estructura versionada que permita validar los datos guardados. Cada mensaje tendrá identificador, rol y contenido; cada respuesta completada tendrá asociados los valores de uso disponibles y la métrica adicional elegida. Los acumulados podrán derivarse de esas respuestas para evitar inconsistencias.

El mecanismo concreto de almacenamiento queda pendiente de elección. No se presupone una base de datos ni se almacenarán credenciales dentro de la sesión.

## Criterios de aceptación

| ID | Comprobación | Resultado esperado |
| --- | --- | --- |
| CA-01 | Enviar un mensaje con la integración configurada | Aparecen el mensaje y una respuesta real de Groq que considera el historial válido |
| CA-02 | Intentar enviar texto vacío o enviar de nuevo durante una petición | No se generan peticiones vacías ni simultáneas |
| CA-03 | Esperar una respuesta y provocar un error de API o red | Se muestran carga y error según corresponda; la interfaz vuelve a permitir el uso y conserva el historial |
| CA-04 | Comparar una respuesta con su objeto `usage` | Los tres contadores por respuesta coinciden con los metadatos recibidos |
| CA-05 | Completar dos peticiones | Cada acumulado coincide con la suma de su campo en ambas respuestas, sin duplicados |
| CA-06 | Inspeccionar una respuesta completada | Se muestra al menos una métrica adicional con fuente y unidades claras cuando proceda |
| CA-07 | Recargar y después cerrar y reabrir la pestaña | Se recuperan historial y métricas; los acumulados permanecen iguales y no se reenvían peticiones |
| CA-08 | Interrumpir una petición o restaurar datos inválidos | No se inventan respuestas ni métricas; se comunica la incidencia y la interfaz sigue siendo utilizable |
| CA-09 | Recibir una respuesta sin `usage` | Se indica que el uso no está disponible y no se muestra como consumo cero |
| CA-10 | Revisar código cliente, tráfico del navegador y datos persistidos | La API Key no aparece; la comunicación con Groq se realiza desde el servidor |

Estos criterios guían la validación futura; no implican crear ni ejecutar pruebas en este paso documental.

## Decisiones pendientes

- Confirmar la disponibilidad e identificador exacto del modelo en Groq.
- Elegir la métrica adicional y el mecanismo de persistencia.
- Concretar el diseño visual y si las respuestas se entregarán completas o mediante streaming.

Autenticación de usuarios, múltiples conversaciones, sincronización entre dispositivos y cálculo de costes no son requisitos del brief actual. Cualquier ampliación se acordará antes de implementarla.