import OpenAI from "openai";

const MODEL_NAME = process.env.OPENAI_MODEL || "gpt-4.1-mini";

const maskApiKey = (apiKey = "") => {
  if (!apiKey) {
    return "absente";
  }

  if (apiKey.length <= 12) {
    return "présente mais trop courte";
  }

  return `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}`;
};

const logInfo = (message, data = {}) => {
  console.log("[AI_ERROR_EXPLANATION]", message, data);
};

const logError = (message, error) => {
  console.error("[AI_ERROR_EXPLANATION_ERROR]", message, {
    status: error?.status || null,
    code: error?.code || error?.error?.code || null,
    type: error?.type || error?.error?.type || null,
    message: error?.message,
  });
};

const safeJsonParse = (text) => {
  if (!text || typeof text !== "string") {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return null;
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return null;
    }
  }
};

const buildFallbackExplanations = (errors) => {
  return errors.map((item, index) => ({
    index: item.index,
    question: item.question,
    studentAnswer: item.studentAnswer,
    correctAnswer: item.correctAnswer,
    competence: item.competence,
    partie: item.partie,
    explanation:
      "La réponse choisie n’est pas correcte. Il faut reprendre la méthode du cours, identifier l’opération à effectuer sur l’inconnue, puis vérifier le résultat dans l’équation de départ.",
  }));
};

export const generateErrorExplanations = async ({ courseTitle, quizTitle, errors }) => {
  const apiKey = process.env.OPENAI_API_KEY;

  logInfo("Démarrage explication des erreurs", {
    key: maskApiKey(apiKey),
    model: MODEL_NAME,
    courseTitle,
    quizTitle,
    errorsCount: Array.isArray(errors) ? errors.length : 0,
  });

  const fallback = {
    source: "fallback",
    explanations: buildFallbackExplanations(errors),
    errorCode: "",
  };

  if (!Array.isArray(errors) || errors.length === 0) {
    return {
      source: "fallback",
      explanations: [],
      errorCode: "NO_ERRORS",
    };
  }

  if (!apiKey) {
    logInfo("Clé OpenAI absente, fallback utilisé");

    return {
      ...fallback,
      errorCode: "OPENAI_API_KEY_MISSING",
    };
  }

  try {
    const client = new OpenAI({
      apiKey,
    });

    const response = await client.responses.create({
      model: MODEL_NAME,
      instructions:
        "Tu es un assistant pédagogique de mathématiques niveau collège. Tu expliques les erreurs d’un élève de manière courte, claire, encourageante et pédagogique. Réponds uniquement en JSON valide, sans markdown.",
      input: `
Explique les erreurs suivantes.

Retourne exactement ce JSON :
{
  "explanations": [
    {
      "index": 0,
      "explanation": "explication courte et pédagogique de l'erreur"
    }
  ]
}

Contraintes :
- Une explication par erreur.
- 2 à 4 phrases maximum par explication.
- Ne dis pas que tu es une IA.
- Ne sois pas humiliant.
- Explique la méthode correcte.
- Ne donne pas une longue leçon.
- Utilise un niveau collège.

Contexte :
${JSON.stringify(
  {
    courseTitle,
    quizTitle,
    errors,
  },
  null,
  2
)}
      `,
    });

    const outputText = response.output_text || "";

    logInfo("Réponse OpenAI reçue", {
      responseId: response.id,
      outputLength: outputText.length,
    });

    const parsed = safeJsonParse(outputText);

    if (!parsed || !Array.isArray(parsed.explanations)) {
      logInfo("Réponse OpenAI non exploitable, fallback utilisé", {
        outputPreview: outputText.slice(0, 200),
      });

      return {
        ...fallback,
        errorCode: "OPENAI_INVALID_JSON",
      };
    }

    const explanationMap = new Map();

    parsed.explanations.forEach((item) => {
      if (typeof item.index === "number" && typeof item.explanation === "string") {
        explanationMap.set(item.index, item.explanation.trim());
      }
    });

    const explanations = errors.map((item) => ({
      index: item.index,
      question: item.question,
      studentAnswer: item.studentAnswer,
      correctAnswer: item.correctAnswer,
      competence: item.competence,
      partie: item.partie,
      explanation:
        explanationMap.get(item.index) ||
        "La réponse choisie n’est pas correcte. Reprends la méthode du cours et vérifie chaque étape du calcul.",
    }));

    return {
      source: "openai",
      explanations,
      errorCode: "",
    };
  } catch (error) {
    logError("Échec appel OpenAI, fallback utilisé", error);

    let errorCode = "OPENAI_ERROR";

    if (error?.status === 401) {
      errorCode = "OPENAI_INVALID_API_KEY";
    }

    if (error?.status === 429) {
      errorCode = "OPENAI_QUOTA_OR_RATE_LIMIT";
    }

    if (error?.status === 400) {
      errorCode = "OPENAI_BAD_REQUEST";
    }

    if (error?.status >= 500) {
      errorCode = "OPENAI_SERVER_ERROR";
    }

    return {
      ...fallback,
      errorCode,
    };
  }
};