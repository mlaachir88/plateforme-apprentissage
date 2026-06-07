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
  console.log("[AI_TEACHER_ANALYSIS]", message, data);
};

const logError = (message, error) => {
  console.error("[AI_TEACHER_ANALYSIS_ERROR]", message, {
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

const buildFallbackTeacherAnalysis = ({
  course,
  stats,
  partiesAnalysis,
  competencesFaibles,
  studentsToSupport,
}) => {
  const weakestPart = partiesAnalysis?.[0];

  return {
    source: "fallback",
    errorCode: "",
    synthese:
      weakestPart
        ? `La classe doit renforcer en priorité la partie « ${weakestPart.titre} », avec un score moyen de ${weakestPart.scoreMoyen}%.`
        : "Aucune difficulté prioritaire n’a été détectée pour le moment.",
    planAction:
      weakestPart
        ? `Il est conseillé de reprendre la partie « ${weakestPart.titre} » en classe, puis de proposer des exercices d’entraînement ciblés avant de refaire un diagnostic.`
        : "Il est conseillé de continuer le suivi des résultats après les prochains quiz.",
    groupes:
      studentsToSupport?.length > 0
        ? `${studentsToSupport.length} élève(s) nécessitent un accompagnement prioritaire.`
        : "Aucun élève n’apparaît en difficulté prioritaire pour le moment.",
    resumeClasse: `Cours : ${course?.titre || "cours"} | Score moyen : ${
      stats?.averageScore ?? 0
    }% | Résultats analysés : ${stats?.resultsCount ?? 0}`,
  };
};

export const generateTeacherAnalysis = async ({
  course,
  stats,
  partiesAnalysis,
  competencesFaibles,
  studentsToSupport,
}) => {
  const apiKey = process.env.OPENAI_API_KEY;

  logInfo("Démarrage analyse professeur", {
    key: maskApiKey(apiKey),
    model: MODEL_NAME,
    courseTitle: course?.titre,
    studentsCount: stats?.studentsCount,
    resultsCount: stats?.resultsCount,
    averageScore: stats?.averageScore,
    partiesCount: partiesAnalysis?.length || 0,
    competencesCount: competencesFaibles?.length || 0,
    studentsToSupportCount: studentsToSupport?.length || 0,
  });

  const fallback = buildFallbackTeacherAnalysis({
    course,
    stats,
    partiesAnalysis,
    competencesFaibles,
    studentsToSupport,
  });

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

    const input = {
      course,
      stats,
      partiesAnalysis,
      competencesFaibles,
      studentsToSupport,
    };

    const response = await client.responses.create({
      model: MODEL_NAME,
      instructions:
        "Tu es un assistant pédagogique pour professeur de mathématiques niveau collège. Tu analyses les résultats d'une classe et proposes un plan d'action clair. Réponds uniquement en JSON valide, sans markdown.",
      input: `
Analyse ces résultats de classe.

Retourne exactement ce JSON :
{
  "synthese": "synthèse claire de la situation de la classe en 3 à 5 phrases",
  "planAction": "plan d'action pédagogique concret pour le professeur",
  "groupes": "proposition de groupes ou d'accompagnement selon les difficultés",
  "resumeClasse": "résumé court du niveau global de la classe"
}

Contraintes :
- Ne dis pas que tu es une IA.
- Ton professionnel, clair et utile pour un professeur.
- Mentionne les parties faibles prioritaires.
- Mentionne les compétences à retravailler.
- Propose des actions concrètes en classe.
- Ne cite pas tous les élèves si ce n'est pas utile.
- Reste concis.

Données :
${JSON.stringify(input, null, 2)}
      `,
    });

    const outputText = response.output_text || "";

    logInfo("Réponse OpenAI reçue", {
      responseId: response.id,
      outputLength: outputText.length,
    });

    const parsed = safeJsonParse(outputText);

    if (!parsed || typeof parsed !== "object") {
      logInfo("Réponse OpenAI non exploitable, fallback utilisé", {
        outputPreview: outputText.slice(0, 200),
      });

      return {
        ...fallback,
        errorCode: "OPENAI_INVALID_JSON",
      };
    }

    return {
      source: "openai",
      errorCode: "",
      synthese:
        typeof parsed.synthese === "string"
          ? parsed.synthese.trim()
          : fallback.synthese,
      planAction:
        typeof parsed.planAction === "string"
          ? parsed.planAction.trim()
          : fallback.planAction,
      groupes:
        typeof parsed.groupes === "string"
          ? parsed.groupes.trim()
          : fallback.groupes,
      resumeClasse:
        typeof parsed.resumeClasse === "string"
          ? parsed.resumeClasse.trim()
          : fallback.resumeClasse,
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