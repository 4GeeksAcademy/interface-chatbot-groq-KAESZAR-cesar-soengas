# Contexto del proyecto

## Objetivo

Construir un prototipo de interfaz de chat para que un cliente explore el uso interno de interfaces con inteligencia artificial antes de comprometerse con un producto completo. El prototipo debe comunicarse con un modelo de lenguaje real mediante una API externa y hacer visible y medible el consumo de la conversación.

## Tecnología y modelo

- **Interfaz:** React/Next.js.
- **Proveedor de inferencia:** [Groq](https://groq.com/).
- **Modelo solicitado:** `qwen/qwen3.6-27b`, disponible en el plan gratuito de Groq según el brief.
- **Credenciales:** la API Key de Groq debe configurarse como variable de entorno; no debe exponerse en el frontend ni guardarse en el repositorio.

## Requisitos funcionales

1. Permitir que el usuario escriba mensajes y reciba respuestas del asistente.
2. Gestionar correctamente las llamadas asíncronas a Groq y el estado de la interfaz (por ejemplo, envío en curso y errores).
3. Leer los metadatos `usage` de cada respuesta y mostrar:
   - tokens del prompt;
   - tokens de completado;
   - tokens totales;
   - acumulados de consumo durante la sesión.
4. Mostrar al menos una métrica adicional de la respuesta, como el nombre del modelo, el tiempo de respuesta o los tokens por segundo.
5. Persistir el historial de conversación para que sobreviva a una recarga de página.

## Criterios de implementación

- Mantener la API Key en el entorno del servidor y realizar las llamadas a Groq desde un punto seguro del backend de Next.js.
- Tratar el historial y los acumulados como datos de sesión coherentes; definir con claridad dónde se persisten y cómo se restauran.
- Considerar respuestas incompletas, errores de red/API y estados de carga en la experiencia de chat.
- La interfaz debe permitir entender el uso de tokens tanto por respuesta como acumulado, no solo mostrar la respuesta textual del modelo.

## Alcance

Este documento recoge el contexto y los requisitos proporcionados para el prototipo. No presupone decisiones de implementación adicionales que todavía no se hayan acordado.