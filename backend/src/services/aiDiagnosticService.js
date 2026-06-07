import OpenAI from "openai";

const MODEL_NAME = process.env.OPENAI_MODEL || "gpt-4.1-mini";

const competenceLabels = {
  comprehension: "compréhension de la consigne",
  calcul: "calcul",
  resolution_equation: "résolution d’équations",
  application_regle: "application d’une règle",
  raisonnement: "raisonnement mathématique",
  autre: "autre compétence",
};

const statutLabels = {
  maitrise: "maîtrisée",
  a_renforcer: "à renforcer",
  fragile: "fragile",
};

const maskApiKey = (apiKey = "") => {
  if (!apiKey) {
    return "absente";
  }

  if (apiKey.length <= 12) {
    return "présente mais trop courte";
  }

  return `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}`;
};

const logAiInfo = (message, data = {}) => {
  console.log("[AI_DIAGNOSTIC]", message, data);
};

const logAiError = (message, error) => {
  const status = error?.status || error?.response?.status || null;
  const code = error?.code || error?.error?.code || null;
  const type = error?.type || error?.error?.type || null;

  console.error("[AI_DIAGNOSTIC_ERROR]", message, {
    status,
    code,
    type,
    message: error?.message,
  });
};

const buildFallbackDiagnostic = ({
  partieFaible,
  analyseParPartie,
  competencesFaibles,
}) => {
  const commentaire =
    partieFaible && partieFaible !== ""
      ? `L’élève doit renforcer la partie : ${partieFaible}.`
      : "L’élève doit poursuivre l’entraînement sur les notions du cours.";

  const recommandation =
    partieFaible && partieFaible !== ""
      ? `Il est conseillé de revoir la partie « ${partieFaible} », puis de refaire les exercices d’entraînement associés.`
      : "Il est conseillé de refaire quelques exercices d’entraînement pour consolider les acquis.";

  const synthese =
    Array.isArray(analyseParPartie) && analyseParPartie.length > 0
      ? analyseParPartie
          .map((partie) => {
            const statut =
              statutLabels[partie.statut] || partie.statut || "non défini";

            return `${partie.titre} : ${partie.score}% (${statut})`;
          })
          .join(" | ")
      : "Aucune analyse par partie disponible.";

  const competences =
    Array.isArray(competencesFaibles) && competencesFaibles.length > 0
      ? competencesFaibles
          .map((item) => {
            const label =
              competenceLabels[item.competence] ||
              item.competence ||
              "compétence non définie";

            return `${label} (${item.erreurs} erreur(s))`;
          })
          .join(", ")
      : "Aucune compétence faible clairement détectée.";

  return {
    commentaire,
    recommandation,
    synthese,
    competences,
    source: "fallback",
  };
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

const validateAiDiagnostic = (parsed) => {
  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  return {
    commentaire:
      typeof parsed.commentaire === "string" ? parsed.commentaire.trim() : "",
    recommandation:
      typeof parsed.recommandation === "string"
        ? parsed.recommandation.trim()
        : "",
    synthese: typeof parsed.synthese === "string" ? parsed.synthese.trim() : "",
    competences:
      typeof parsed.competences === "string" ? parsed.competences.trim() : "",
  };
};

export const generateAiDiagnostic = async ({
  courseTitle,
  quizTitle,
  score,
  niveauDetecte,
  partieFaible,
  analyseParPartie,
  competencesFaibles,
}) => {
  const apiKey = process.env.OPENAI_API_KEY;

  logAiInfo("Démarrage génération diagnostic", {
    key: maskApiKey(apiKey),
    model: MODEL_NAME,
    score,
    niveauDetecte,
    partieFaible,
    parties: Array.isArray(analyseParPartie) ? analyseParPartie.length : 0,
    competencesFaibles: Array.isArray(competencesFaibles)
      ? competencesFaibles.length
      : 0,
  });

  const fallback = buildFallbackDiagnostic({
    partieFaible,
    analyseParPartie,
    competencesFaibles,
  });

  if (!apiKey) {
    logAiInfo("Clé OpenAI absente, utilisation du fallback");
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
      courseTitle,
      quizTitle,
      score,
      niveauDetecte,
      partieFaible,
      analyseParPartie,
      competencesFaibles,
    };

    const response = await client.responses.create({
      model: MODEL_NAME,
      instructions:
        "Tu es un assistant pédagogique spécialisé en mathématiques niveau collège. Tu analyses les résultats d’un quiz diagnostique. Réponds uniquement en JSON valide, sans markdown. Le ton doit être clair, professionnel, encourageant et adapté à un élève.",
      input: `
Analyse ces résultats et retourne exactement ce JSON :
{
  "commentaire": "2 à 4 phrases pédagogiques sur les difficultés et les points forts de l'élève",
  "recommandation": "1 à 2 phrases avec une action précise à faire ensuite",
  "synthese": "résumé court des scores par partie",
  "competences": "liste courte des compétences à renforcer"
}

Contraintes :
- Ne dis pas que tu es une IA.
- Ne donne pas la correction complète du quiz.
- Utilise un ton encourageant.
- Mentionne la partie la plus faible.
- Recommande les exercices d'entraînement liés aux parties faibles.

Données :
${JSON.stringify(input, null, 2)}
      `,
    });

    const outputText = response.output_text || "";

    logAiInfo("Réponse OpenAI reçue", {
      responseId: response.id,
      outputLength: outputText.length,
    });

    const parsed = safeJsonParse(outputText);
    const validated = validateAiDiagnostic(parsed);

    if (!validated) {
      logAiInfo("Réponse OpenAI non exploitable, fallback utilisé", {
        outputPreview: outputText.slice(0, 200),
      });

      return {
        ...fallback,
        errorCode: "OPENAI_INVALID_JSON",
      };
    }

    return {
      commentaire: validated.commentaire || fallback.commentaire,
      recommandation: validated.recommandation || fallback.recommandation,
      synthese: validated.synthese || fallback.synthese,
      competences: validated.competences || fallback.competences,
      source: "openai",
    };
  } catch (error) {
    logAiError("Échec appel OpenAI, fallback utilisé", error);

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