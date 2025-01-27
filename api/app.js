import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { id } from "date-fns/locale";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { isToday } from "date-fns";

const app = express();
const prisma = new PrismaClient();
const port = 3001;

// Configurar CORS para permitir solicitudes desde cualquier origen (o uno específico)
app.use(
  cors({
    origin: "*", // Permitir todos los orígenes (puedes restringirlo a dominios específicos)
    methods: ["GET", "POST", "PUT", "DELETE"], // Métodos permitidos
  })
);

app.use(express.json()); // Middleware para manejar JSON

// Crear un nuevo usuario
app.post("/users", async (req, res) => {
  const { email, name, password } = req.body;
  try {
    const newUser = await prisma.user.create({
      data: { email, name, password },
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: "Error creando usuario" });
  }
});

// Obtener todos los usuarios
app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post("/workspaces", async (req, res) => {
  const { name, userId } = req.body;

  try {
    const newWorkspace = await prisma.workspace.create({
      data: {
        name,
        users: {
          create: { userId }, // Asignamos el Clerk User ID al usuario
        },
        chat: {
          create: {}, // Creamos el chat vacío asociado al workspace
        },
      },
      include: {
        chat: true, // Incluimos el chat en la respuesta
      },
    });

    res.status(201).json(newWorkspace);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error creando el workspace y el chat asociado" });
  }
});

// Añadir un usuario a un workspace
app.post("/workspaces/:id/users", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const workspace = await prisma.workspace.update({
      where: { id: parseInt(id) },
      data: {
        users: {
          create: {
            userId: parseInt(userId),
          },
        },
      },
    });
    res.json(workspace);
  } catch (error) {
    res.status(400).json({ error: "Error agregando usuario al workspace" });
  }
});

// Obtener todos los workspaces
app.get("/workspaces", async (req, res) => {
  const workspaces = await prisma.workspace.findMany({
    include: {
      users: true,
    },
  });
  res.json(workspaces);
});

// Obtener los workspaces de un usuario
app.get("/users/:userId/workspaces", async (req, res) => {
  const { userId } = req.params;

  try {
    // Busca en el modelo Workspace aquellos que tengan un userId en la tabla intermedia WorkspaceUser
    const workspaces = await prisma.workspace.findMany({
      where: {
        users: {
          some: { userId: userId }, // Filtra los workspaces que tengan un usuario con el userId dado
        },
      },
    });

    res.json(workspaces); // Devuelve los workspaces al frontend
  } catch (error) {
    console.error("Error obteniendo workspaces:", error);
    res.status(500).json({ error: "Error obteniendo workspaces" });
  }
});

// Crear una colección en un workspace
app.post("/workspaces/:workspaceId/collections", async (req, res) => {
  const { workspaceId } = req.params;
  const { name } = req.body;

  try {
    const newCollection = await prisma.collection.create({
      data: {
        name,
        workspace: {
          connect: { id: parseInt(workspaceId) },
        },
      },
    });
    res.status(201).json(newCollection);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Error creando colección" });
  }
});

app.get("/workspaces/:workspaceId/collections", async (req, res) => {
  const { workspaceId } = req.params;

  console.log("Workspace ID recibido en el servidor:", workspaceId);

  try {
    const collections = await prisma.collection.findMany({
      where: { workspaceId: parseInt(workspaceId) },
      select: {
        id: true,
        name: true,
        workspaceId: true,
        flashcards: {
          select: {
            id: true,
            question: true,
            answer: true,
            status: true,
            nextReviewDate: true,
          },
        },
      },
    });

    console.log("Collections encontradas:", collections);
    res.json(collections);
  } catch (error) {
    console.error("Error en el servidor al obtener colecciones:", error);
    res
      .status(400)
      .json({ error: "Error obteniendo colecciones del workspace" });
  }
});

// Crear una flashcard en una colección
app.post("/collections/:collectionId/flashcards", async (req, res) => {
  const { collectionId } = req.params;
  const { question, answer } = req.body;

  try {
    const newFlashcard = await prisma.flashcard.create({
      data: {
        question,
        answer,
        collectionId: parseInt(collectionId),
      },
    });
    res.status(201).json(newFlashcard);
  } catch (error) {
    res.status(400).json({ error: "Error creando flashcard" });
  }
});

// Obtener todas las flashcards de una colección
app.get("/collections/:collectionId/flashcards", async (req, res) => {
  const { collectionId } = req.params;

  try {
    const flashcards = await prisma.flashcard.findMany({
      where: { collectionId: parseInt(collectionId) },
    });
    res.json(flashcards);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error obteniendo flashcards de la colección" });
  }
});

app.post("/collections/:collectionId/studySession", async (req, res) => {
  const { collectionId } = req.params;
  const { userId } = req.body;

  try {
    const newStudySession = await prisma.studySession.create({
      data: {
        userId,
        collectionId: parseInt(collectionId),
        timeSpent: 0,
      },
    });

    res.status(201).json(newStudySession);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Error creando sesión de estudio" });
  }
});

app.get("/collections/:collectionId/stats", async (req, res) => {
  const { collectionId } = req.params;

  try {
    const flashcards = await prisma.flashcard.findMany({
      where: { collectionId: parseInt(collectionId) },
    });

    // Flashcards creadas hoy
    const creadasHoy = await prisma.flashcard.count({
      where: {
        collectionId: parseInt(collectionId),
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Desde el inicio del día
        },
      },
    });

    // Flashcards creadas en los últimos 7 días
    const creadasUltimos7Dias = await prisma.flashcard.count({
      where: {
        collectionId: parseInt(collectionId),
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
        },
      },
    });

    // Flashcards completadas en los últimos 7 días
    const completadasUltimos7Dias = await prisma.flashcard.count({
      where: {
        collectionId: parseInt(collectionId),
        completionDate: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
        },
      },
    });

    let estadosFinales = [
      { status: "SIN_HACER", count: 0 },
      { status: "REVISAR", count: 0 },
      { status: "COMPLETADA", count: 0 },
    ];

    flashcards.forEach((flashcard) => {
      if (flashcard.status === "SIN_HACER") {
        estadosFinales[0].count += 1;
      } else if (flashcard.status === "COMPLETADA") {
        if (
          flashcard.nextReviewDate &&
          isToday(new Date(flashcard.nextReviewDate))
        ) {
          estadosFinales[1].count += 1;
        } else {
          estadosFinales[2].count += 1;
        }
      }
    });

    const totalCompletadas = flashcards.reduce((acc, card) => {
      if (card.status === "COMPLETADA") {
        acc++;
      }
      return acc;
    }, 0);

    const progreso = Math.round((totalCompletadas / flashcards.length) * 100);
    console.log("Progreso:", progreso);

    // 7. Tiempo promedio de estudio por sesión
    const tiempoPromedio = await prisma.flashcardActivity.aggregate({
      where: {
        flashcard: { collectionId: parseInt(collectionId) },
      },
      _avg: {
        timeSpent: true,
      },
    });

    //8. Tiempo promedio de estudio por sesión
    const tiempoDeSesion = await prisma.studySession.findMany({
      where: {
        collectionId: parseInt(collectionId),
      },
      select: {
        timeSpent: true,
      },
    });

    const tiempoTotalDeEstudio = Math.ceil(
      tiempoDeSesion.reduce((acc, sesion) => acc + sesion.timeSpent, 0) / 60 ||
        0
    );

    const tiempoPromedioPorSesion =
      Math.ceil(
        tiempoDeSesion.reduce((acc, sesion) => acc + sesion.timeSpent, 0) /
          tiempoDeSesion.length /
          60
      ) || 0;

    res.json({
      flashcards,
      totalFlashcards: flashcards.length,
      creadasHoy,
      creadasUltimos7Dias,
      completadasUltimos7Dias,
      estados: estadosFinales,
      tiempoPromedioPorFlashcard:
        Math.ceil(tiempoPromedio._avg.timeSpent / 60) || 0,
      tiempoPromedioPorSesion,
      tiempoTotalDeEstudio,
      progreso,
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({ error: "Error obteniendo estadísticas" });
  }
});

// Actualizar la fecha de revisión, estado y registrar la actividad de una flashcard
app.put("/flashcards/:flashcardId/review", async (req, res) => {
  const { flashcardId } = req.params;
  const { nextReviewDate, status, timeSpent, studySessionId } = req.body;

  try {
    // Actualiza la flashcard con el nuevo estado y fecha de revisión
    const updatedFlashcard = await prisma.flashcard.update({
      where: { id: parseInt(flashcardId) },
      data: {
        nextReviewDate,
        completionDate: new Date(),
        status,
      },
    });

    // Obtiene la sesión de estudio actual para conocer el valor de `timeSpent`
    const existingStudySession = await prisma.studySession.findUnique({
      where: { id: parseInt(studySessionId) },
      select: { timeSpent: true },
    });

    // Calcula el nuevo valor de `timeSpent`
    const newTimeSpent = (existingStudySession.timeSpent || 0) + timeSpent;

    // Actualiza `timeSpent` con el nuevo valor
    await prisma.studySession.update({
      where: { id: parseInt(studySessionId) },
      data: {
        timeSpent: newTimeSpent,
      },
    });

    // Registra la actividad en la tabla FlashcardActivity
    const newActivity = await prisma.flashcardActivity.create({
      data: {
        flashcardId: parseInt(flashcardId),
        studySessionId: parseInt(studySessionId),
        result: status, // Estado después del estudio (e.g., "COMPLETADA")
        timeSpent, // Tiempo dedicado en segundos
      },
    });

    res.json({ updatedFlashcard, newActivity });
  } catch (error) {
    console.error("Error al actualizar la flashcard:", error);
    res.status(400).json({ error: "Error al actualizar la flashcard" });
  }
});

// Modificar una flashcard existente
app.put("/flashcards/:flashcardId", async (req, res) => {
  const { flashcardId } = req.params;
  const { question, answer } = req.body;

  try {
    const updatedFlashcard = await prisma.flashcard.update({
      where: { id: parseInt(flashcardId) },
      data: {
        question,
        answer,
        updatedAt: new Date(),
      },
    });
    res.json(updatedFlashcard);
  } catch (error) {
    console.error("Error actualizando flashcard:", error);
    res.status(400).json({ error: "Error actualizando flashcard" });
  }
});

// Obtener mensajes del chat basado solo en workspaceId
app.get("/workspaces/:workspaceId/chat/messages", async (req, res) => {
  const { workspaceId } = req.params;

  try {
    // Encontrar el chat correspondiente al workspace
    const chat = await prisma.chat.findUnique({
      where: {
        workspaceId: parseInt(workspaceId),
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    // Si no se encuentra el chat, devolver un error 404
    if (!chat) {
      return res
        .status(404)
        .json({ error: "Chat no encontrado para el workspace especificado" });
    }

    // Enviar los mensajes del chat encontrado
    res.json(chat.messages);
  } catch (error) {
    console.error("Error al obtener mensajes del chat:", error);
    res.status(500).json({ error: "Error al obtener mensajes del chat" });
  }
});

// Añadir un mensaje al chat del workspace
app.post("/workspaces/:workspaceId/chat/messages", async (req, res) => {
  const { workspaceId } = req.params;
  const { content, userId } = req.body;

  console.log("userId recibido:", userId, "contenido: ", content);
  console.log("WorkspaceID recibido:", workspaceId);

  // Verificar que userId esté definido y sea un número
  if (!userId) {
    return res
      .status(400)
      .json({ error: "userId no válido o no proporcionado" });
  }

  try {
    // Verificar si el chat ya existe para el workspace
    let chat = await prisma.chat.findUnique({
      where: {
        workspaceId: parseInt(workspaceId),
      },
    });

    console.log("Paso");

    // Si no existe el chat, crearlo
    if (!chat) {
      console.log("No existe el chat, creando...");
      chat = await prisma.chat.create({
        data: {
          workspaceId: parseInt(workspaceId),
        },
      });
    }

    console.log(chat);

    // Añadir el nuevo mensaje al chat
    const newMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        userId: userId,
        content,
      },
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error añadiendo mensaje:", error);
    res.status(500).json({ error: "Error al añadir mensaje" });
  }
});

// Funciones de utilidad para la generación de flashcards
const validateFlashcard = (flashcard) => {
  const minQuestionLength = 10;
  const maxQuestionLength = 200;
  const minAnswerLength = 5;
  const maxAnswerLength = 500;

  return {
    isValid:
      flashcard.pregunta?.length >= minQuestionLength &&
      flashcard.pregunta?.length <= maxQuestionLength &&
      flashcard.respuesta?.length >= minAnswerLength &&
      flashcard.respuesta?.length <= maxAnswerLength &&
      typeof flashcard.pregunta === "string" &&
      typeof flashcard.respuesta === "string",
    reason: !flashcard.pregunta
      ? "Pregunta faltante"
      : !flashcard.respuesta
      ? "Respuesta faltante"
      : flashcard.pregunta.length < minQuestionLength
      ? "Pregunta demasiado corta"
      : flashcard.pregunta.length > maxQuestionLength
      ? "Pregunta demasiado larga"
      : flashcard.respuesta.length < minAnswerLength
      ? "Respuesta demasiado corta"
      : flashcard.respuesta.length > maxAnswerLength
      ? "Respuesta demasiado larga"
      : "Válida",
  };
};

const validateResponse = (response) => {
  if (!Array.isArray(response)) return false;
  if (response.length === 0) return false;
  return response.every((flashcard) => validateFlashcard(flashcard).isValid);
};

const buildPrompt = (learningContext, userPrompt) => {
  const systemPrompt = `Eres un experto en crear flashcards educativas. Tu tarea es generar flashcards en formato JSON.

IMPORTANTE: Debes responder SOLO con un array JSON válido, sin texto adicional ni comillas invertidas.

Ejemplo del formato esperado:
[
  {
    "pregunta": "¿Qué es la fotosíntesis?",
    "respuesta": "Proceso por el cual las plantas convierten luz solar en energía química",
    "dificultad": 3,
    "tema": "biología básica"
  }
]

Reglas para las flashcards:
1. Preguntas concisas y claras
2. Respuestas precisas y directas
3. Dificultad entre 1-5
4. Tema específico relacionado con el contexto`;

  const previousQuestions = learningContext.previousFlashcards
    .map(
      (card) =>
        `- ${card.question} (Dificultad: ${card.difficulty}, Tema: ${card.topic})`
    )
    .join("\n");

  return `${systemPrompt}

CONTEXTO:
- Tema principal: ${learningContext.mainTopic}
- Subtemas: ${learningContext.subtopics.join(", ")}
- Dificultad objetivo: ${learningContext.difficulty}
- Preferencias: Dificultad ${
    learningContext.userPreferences.preferredDifficulty
  }, Enfoque en ${learningContext.userPreferences.focusAreas.join(", ")}

Preguntas existentes:
${previousQuestions}

Instrucción del usuario: ${userPrompt}

RECUERDA: Responde SOLO con el array JSON de 5 flashcards, sin texto adicional.`;
};

async function generateWithRetry(model, prompt, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const startTime = Date.now();
      const result = await model.generateContent(prompt);
      const response = result.response.text().trim();
      
      console.log("Respuesta del modelo:", response);

      // Intentar extraer JSON válido de la respuesta
      let jsonStr = response;
      
      // Si la respuesta está envuelta en comillas invertidas, eliminarlas
      if (response.startsWith('`') && response.endsWith('`')) {
        jsonStr = response.slice(1, -1);
      }
      
      // Buscar el array JSON en la respuesta
      const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error("No se encontró un array JSON válido en la respuesta");
        throw new Error("No se encontró un array JSON válido en la respuesta");
      }

      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (validateResponse(parsed)) {
          return {
            data: parsed,
            metadata: {
              generationAttempt: attempt + 1,
              generationTime: Date.now() - startTime,
              success: true,
              modelVersion: "gemini-1.5-flash",
              contextSize: prompt.length,
              rawResponse: response // Guardar la respuesta completa para debugging
            },
          };
        }
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        console.log("Attempting to parse:", jsonMatch[0]);
      }

      throw new Error("Invalid response format");
    } catch (error) {
      attempt++;
      console.warn(`Attempt ${attempt} failed:`, error.message);

      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
}

app.post("/collections/:collectionId/generate", async (req, res) => {
  const { collectionId } = req.params;
  const {
    userPrompt,
    contextPrompt,
    generatedFlashcardsHistory,
    userPreferences = {
      preferredDifficulty: 3,
      focusAreas: [],
    },
  } = req.body;

  try {
    // Estructurar el contexto
    const learningContext = {
      mainTopic: contextPrompt,
      subtopics: [], // Podrías extraer subtemas del contextPrompt o recibirlos como parámetro
      difficulty: userPreferences.preferredDifficulty,
      previousFlashcards: generatedFlashcardsHistory.map((card) => ({
        question: card.question,
        topic: "general", // Podrías categorizar las preguntas
        difficulty: 3, // Podrías asignar dificultad basada en algún criterio
      })),
      userPreferences,
    };

    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construir el prompt y generar contenido con retry
    const prompt = buildPrompt(learningContext, userPrompt);
    const { data: generatedFlashcards, metadata } = await generateWithRetry(
      model,
      prompt
    );

    // Filtrar y validar las flashcards generadas
    const validFlashcards = generatedFlashcards.filter((flashcard) => {
      const validation = validateFlashcard(flashcard);
      if (!validation.isValid) {
        console.warn("Flashcard inválida:", validation.reason, flashcard);
      }
      return validation.isValid;
    });

    // Si no hay flashcards válidas, lanzar error
    if (validFlashcards.length === 0) {
      throw new Error("No se generaron flashcards válidas");
    }

    // Guardar las flashcards y la metadata
    const savedFlashcards = await Promise.all(
      validFlashcards.map(async (flashcard) => {
        try {
          return await prisma.flashcard.create({
            data: {
              question: flashcard.pregunta,
              answer: flashcard.respuesta,
              collectionId: parseInt(collectionId),
              difficulty: flashcard.dificultad || 3,
              topic: flashcard.tema || "general",
            },
          });
        } catch (error) {
          console.error("Error al guardar flashcard:", error);
          return null;
        }
      })
    );

    // Filtrar las flashcards que se guardaron correctamente
    const successfulFlashcards = savedFlashcards.filter(card => card !== null);

    if (successfulFlashcards.length === 0) {
      throw new Error("No se pudo guardar ninguna flashcard");
    }

    // Registrar la metadata de la generación
    const generationMetadata = await prisma.flashcardGeneration.create({
      data: {
        collectionId: parseInt(collectionId),
        metadata: metadata,
        success: true,
        generatedCount: successfulFlashcards.length,
      },
    }).catch((error) => {
      console.error("Error al guardar metadata:", error);
      return null;
    });

    res.json({
      flashcards: successfulFlashcards,
      metadata: {
        ...metadata,
        validCount: successfulFlashcards.length,
        totalGenerated: generatedFlashcards.length,
        generationId: generationMetadata?.id
      },
    });
  } catch (error) {
    console.error("Error en la generación de flashcards:", error);
    res.status(500).json({
      error: "Error en la generación de flashcards",
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
