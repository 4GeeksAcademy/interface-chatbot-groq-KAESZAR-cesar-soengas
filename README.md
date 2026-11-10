# Prototipo de chat con Groq

Prototipo de una interfaz de chat en React/Next.js para explorar el uso interno de modelos de lenguaje y hacer visible el consumo de cada conversación. El proyecto forma parte de una prueba de concepto; los requisitos y el contexto están documentados en [`context.md`](./context.md).

## Objetivo

Enviar mensajes a un modelo real a través de la API de [Groq](https://groq.com/), mostrar sus respuestas y entender las métricas de uso a lo largo de una sesión.

## Requisitos previstos

- Chat para enviar mensajes y recibir respuestas de la IA.
- Integración con el modelo `qwen/qwen3.8-27b` de Groq.
- Indicadores de estado para el envío y manejo de errores de la API o de red.
- Métricas de tokens por respuesta y acumuladas en la sesión:
	- tokens del prompt;
	- tokens de completado;
	- tokens totales.
- Al menos una métrica complementaria, como el nombre del modelo, el tiempo de respuesta o los tokens por segundo.
- Persistencia del historial para restaurar la conversación tras recargar la página.

## Configuración de Groq

Se necesita una cuenta en [Groq Console](https://console.groq.com/) y una API Key. La clave debe configurarse como variable de entorno del servidor y no debe incluirse en el código del frontend ni subirse al repositorio.

En un proyecto Next.js, crea un archivo `.env.local` en la raíz:

```dotenv
GROQ_API_KEY=tu_api_key_de_groq
```

No uses el prefijo `NEXT_PUBLIC_` para esta variable: la clave es secreta y debe permanecer del lado del servidor. Asegúrate de que `.env.local` esté excluido del control de versiones.

## Métricas de uso

Las respuestas de Groq incluyen metadatos de uso. La interfaz debe registrar y presentar los campos de uso que devuelva la respuesta —normalmente `prompt_tokens`, `completion_tokens` y `total_tokens`— y sumar esos valores para mostrar el consumo acumulado de la sesión. También debe mostrar al menos una métrica adicional de respuesta.

## Persistencia de la conversación

El historial de chat debe conservarse al recargar la página y restaurarse al volver a abrir la sesión. La implementación deberá mantener la persistencia alineada con los mensajes y las métricas acumuladas que se muestran.

## Estado del proyecto

Este README recoge el objetivo y los requisitos del prototipo. La estructura de la aplicación y los comandos para instalar dependencias o ejecutarla se documentarán cuando se incorpore el código correspondiente.