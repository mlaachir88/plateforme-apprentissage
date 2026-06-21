import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  Layers,
  Lightbulb,
  ListChecks,
  PlayCircle,
  Sigma,
  Sparkles,
} from "lucide-react";

import api from "../api/axios";
import StudentNav from "../components/StudentNav";
import MathContent from "../components/MathContent";

type CoursePart = {
  _id: string;
  titre: string;
  description: string;
};

type Course = {
  _id: string;
  titre: string;
  description: string;
  niveau: string;
  matiere: string;
  contenuTexte: string;
  pdfUrl?: string;
  parties?: CoursePart[];
};

type Quiz = {
  _id: string;
  titre: string;
  description: string;
  type: "diagnostic" | "practice";
  partieId?: string;
  questions: {
    _id: string;
    question: string;
    choix: string[];
    partieId?: string;
    competence?: string;
  }[];
};

type LessonPart = {
  id: string;
  titre: string;
  description: string;
  body: string;
};

type ContentBlock =
  | { kind: "heading"; text: string }
  | { kind: "subheading"; text: string }
  | { kind: "formula"; text: string }
  | { kind: "callout"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "step"; number: string; text: string }
  | { kind: "paragraph"; text: string };

const quizTypeLabel = {
  diagnostic: "Diagnostic général",
  practice: "Exercice d’entraînement",
};

const quizTypeStyle = {
  diagnostic: "border-violet-100 bg-violet-50 text-violet-700",
  practice: "border-emerald-100 bg-emerald-50 text-emerald-700",
};

const partAccentStyles = [
  {
    icon: "bg-violet-600 text-white shadow-violet-600/20",
    chip: "border-violet-100 bg-violet-50 text-violet-700",
    progress: "from-violet-500 to-fuchsia-500",
    panel: "from-violet-50/90 to-white",
  },
  {
    icon: "bg-fuchsia-600 text-white shadow-fuchsia-600/20",
    chip: "border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700",
    progress: "from-fuchsia-500 to-violet-500",
    panel: "from-fuchsia-50/90 to-white",
  },
  {
    icon: "bg-amber-500 text-white shadow-amber-500/20",
    chip: "border-amber-100 bg-amber-50 text-amber-700",
    progress: "from-amber-400 to-violet-500",
    panel: "from-amber-50/90 to-white",
  },
];

const normalizeText = (value: string) => {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
};

const findFirstMarkerIndex = (content: string, markers: string[]) => {
  const indexes = markers
    .map((marker) => content.indexOf(marker))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b);

  return indexes.length > 0 ? indexes[0] : -1;
};

const buildPartMarkers = (part: CoursePart, index: number) => {
  return [
    `## ${index + 1}. ${part.titre}`,
    `# ${index + 1}. ${part.titre}`,
    `${index + 1}. ${part.titre}`,
  ];
};

const removeLeadingPartTitle = (
  content: string,
  part: CoursePart,
  index: number
) => {
  const lines = content.split(/\r?\n/);
  const normalizedTitle = normalizeText(part.titre);
  const normalizedNumberedTitle = normalizeText(`${index + 1}. ${part.titre}`);

  const cleanedLines = lines.filter((line, lineIndex) => {
    if (lineIndex > 3) {
      return true;
    }

    const normalizedLine = normalizeText(line.replace(/^#+\s*/, ""));

    return (
      normalizedLine !== normalizedTitle &&
      normalizedLine !== normalizedNumberedTitle
    );
  });

  return cleanedLines.join("\n").trim();
};

const splitCourseIntoLessonParts = (course: Course): LessonPart[] => {
  const parts = course.parties || [];
  const content = course.contenuTexte || "";

  if (!content.trim() || parts.length === 0) {
    return [];
  }

  return parts
    .map((part, index) => {
      const currentMarkers = buildPartMarkers(part, index);
      const startIndex = findFirstMarkerIndex(content, currentMarkers);

      if (startIndex < 0) {
        return {
          id: part._id,
          titre: part.titre,
          description: part.description,
          body: part.description || "",
        };
      }

      const nextPart = parts[index + 1];
      const nextIndex = nextPart
        ? findFirstMarkerIndex(content.slice(startIndex + 1), buildPartMarkers(nextPart, index + 1))
        : -1;

      const realNextIndex = nextIndex >= 0 ? startIndex + 1 + nextIndex : -1;

      const rawBody =
        realNextIndex >= 0
          ? content.slice(startIndex, realNextIndex)
          : content.slice(startIndex);

      return {
        id: part._id,
        titre: part.titre,
        description: part.description,
        body: removeLeadingPartTitle(rawBody, part, index),
      };
    })
    .filter((part) => part.body.trim() || part.description.trim());
};

const extractIntroContent = (course: Course) => {
  const parts = course.parties || [];

  if (!course.contenuTexte || parts.length === 0) {
    return "";
  }

  const firstPartIndex = findFirstMarkerIndex(
    course.contenuTexte,
    buildPartMarkers(parts[0], 0)
  );

  if (firstPartIndex < 0) {
    return "";
  }

  return course.contenuTexte.slice(0, firstPartIndex).trim();
};

const parseContentBlocks = (raw: string): ContentBlock[] => {
  const blocks: ContentBlock[] = [];
  const lines = raw.split(/\r?\n/);

  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let calloutLines: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      blocks.push({
        kind: "paragraph",
        text: paragraphLines.join(" ").trim(),
      });
      paragraphLines = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({
        kind: "list",
        items: [...listItems],
      });
      listItems = [];
    }
  };

  const flushCallout = () => {
    if (calloutLines.length > 0) {
      blocks.push({
        kind: "callout",
        text: calloutLines.join(" ").trim(),
      });
      calloutLines = [];
    }
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
    flushCallout();
  };

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = rawLine.trim();

    if (!line) {
      flushAll();
      continue;
    }

    if (line === "---") {
      flushAll();
      continue;
    }

    if (line.startsWith("$$")) {
      flushAll();

      const formulaLines = [line];
      const isSingleLine = line.length > 2 && line.endsWith("$$");

      if (!isSingleLine) {
        index += 1;

        while (index < lines.length) {
          formulaLines.push(lines[index]);

          if (lines[index].includes("$$")) {
            break;
          }

          index += 1;
        }
      }

      blocks.push({
        kind: "formula",
        text: formulaLines.join("\n").trim(),
      });
      continue;
    }

    const headingMatch = line.match(/^(#{3,6})\s+(.*)$/);

    if (headingMatch) {
      flushAll();

      const headingLevel = headingMatch[1].length;
      const headingText = headingMatch[2].trim();

      blocks.push({
        kind: headingLevel <= 3 ? "heading" : "subheading",
        text: headingText,
      });
      continue;
    }

    if (/^(exemple|exemple\s*\d+|astuce|remarque|attention|à retenir)\b/i.test(line)) {
      flushAll();
      calloutLines.push(line);
      continue;
    }

    if (line.startsWith(">")) {
      flushParagraph();
      flushList();
      calloutLines.push(line.replace(/^>\s?/, ""));
      continue;
    }

    if (/^[-*•—]\s+/.test(line)) {
      flushParagraph();
      flushCallout();
      listItems.push(line.replace(/^[-*•—]\s+/, ""));
      continue;
    }

    const stepMatch = line.match(/^(\d+)\.\s+(.*)$/);

    if (stepMatch) {
      flushAll();

      blocks.push({
        kind: "step",
        number: stepMatch[1],
        text: stepMatch[2],
      });
      continue;
    }

    flushList();
    flushCallout();

    const isSmallHeading =
      line.length <= 55 &&
      !line.endsWith(".") &&
      !line.endsWith(";") &&
      !line.includes("=") &&
      !line.includes("$");

    if (isSmallHeading) {
      flushParagraph();

      blocks.push({
        kind: "subheading",
        text: line,
      });
      continue;
    }

    paragraphLines.push(line);
  }

  flushAll();

  return blocks;
};

function RichBlock({ block }: { block: ContentBlock }) {
  if (block.kind === "heading") {
    return (
      <h3 className="mt-8 flex items-center gap-3 text-xl font-black tracking-tight text-slate-950 first:mt-0 md:text-2xl">
        <span className="h-7 w-1.5 rounded-full bg-violet-500" />
        <span>
          <MathContent content={block.text} />
        </span>
      </h3>
    );
  }

  if (block.kind === "subheading") {
    return (
      <h4 className="mt-6 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.11em] text-violet-700 shadow-sm">
        <MathContent content={block.text} />
      </h4>
    );
  }

  if (block.kind === "formula") {
    return (
      <div className="my-5 overflow-x-auto rounded-[1.6rem] border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50/60 px-5 py-5 text-center shadow-sm">
        <div className="mb-2 flex items-center justify-center gap-1.5 text-[0.7rem] font-black uppercase tracking-wider text-violet-500">
          <Sigma size={13} />
          Formule
        </div>

        <div className="text-base font-semibold text-slate-900 md:text-lg">
          <MathContent content={block.text} />
        </div>
      </div>
    );
  }

  if (block.kind === "callout") {
    return (
      <div className="my-5 flex gap-3 rounded-[1.6rem] border border-amber-100 bg-amber-50/80 p-4 md:p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <Lightbulb size={18} />
        </div>

        <div className="text-sm font-semibold leading-7 text-amber-900 md:text-[0.95rem]">
          <MathContent content={block.text} />
        </div>
      </div>
    );
  }

  if (block.kind === "list") {
    return (
      <ul className="my-4 space-y-2.5 rounded-[1.6rem] border border-violet-100 bg-violet-50/40 p-4">
        {block.items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex gap-3 text-sm font-semibold leading-7 text-slate-700 md:text-[0.95rem]"
          >
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
            <span className="flex-1">
              <MathContent content={item} />
            </span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.kind === "step") {
    return (
      <div className="my-3 flex gap-3 rounded-[1.4rem] border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-black text-white">
          {block.number}
        </div>

        <div className="text-sm font-semibold leading-7 text-slate-700">
          <MathContent content={block.text} />
        </div>
      </div>
    );
  }

  return (
    <div className="my-3 text-sm font-medium leading-7 text-slate-700 md:text-[0.95rem] md:leading-8">
      <MathContent content={block.text} />
    </div>
  );
}

function StudentCourseDetailPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [course, setCourse] = useState<Course | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [activePartIndex, setActivePartIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesResponse = await api.get("/courses");

        const selectedCourse = coursesResponse.data.find(
          (item: Course) => item._id === courseId
        );

        if (!selectedCourse) {
          setErreur("Cours introuvable ou accès refusé");
          return;
        }

        setCourse(selectedCourse);

        const quizzesResponse = await api.get(`/quizzes/course/${courseId}`);
        setQuizzes(quizzesResponse.data);
      } catch (error: any) {
        setErreur(
          error.response?.data?.message ||
            "Erreur lors du chargement du cours"
        );
      } finally {
        setChargement(false);
      }
    };

    fetchData();
  }, [courseId]);

  const diagnosticQuiz = useMemo(
    () => quizzes.find((quiz) => quiz.type === "diagnostic"),
    [quizzes]
  );

  const sortedQuizzes = useMemo(() => {
    return [...quizzes].sort((a, b) => {
      if (a.type === "diagnostic" && b.type !== "diagnostic") {
        return -1;
      }

      if (a.type !== "diagnostic" && b.type === "diagnostic") {
        return 1;
      }

      return a.titre.localeCompare(b.titre);
    });
  }, [quizzes]);

  const lessonParts = useMemo(() => {
    if (!course) {
      return [];
    }

    return splitCourseIntoLessonParts(course);
  }, [course]);

  const introContent = useMemo(() => {
    if (!course) {
      return "";
    }

    return extractIntroContent(course);
  }, [course]);

  const totalParts = lessonParts.length;
  const safePartIndex =
    totalParts > 0 ? Math.min(activePartIndex, totalParts - 1) : 0;
  const activeLessonPart = lessonParts[safePartIndex] || null;
  const activeAccent = partAccentStyles[safePartIndex % partAccentStyles.length];

  const activeBlocks = useMemo(() => {
    if (!activeLessonPart) {
      return [];
    }

    return parseContentBlocks(activeLessonPart.body);
  }, [activeLessonPart]);

  const activePracticeQuizzes = useMemo(() => {
    if (!activeLessonPart) {
      return [];
    }

    return quizzes.filter(
      (quiz) =>
        quiz.type === "practice" && quiz.partieId === activeLessonPart.id
    );
  }, [activeLessonPart, quizzes]);

  const getPartTitle = (partieId?: string) => {
    if (!course || !partieId) {
      return "";
    }

    const part = course.parties?.find(
      (coursePart) => coursePart._id === partieId
    );

    return part?.titre || "";
  };

  const goToPart = (index: number) => {
    if (index < 0 || index >= totalParts) {
      return;
    }

    setActivePartIndex(index);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbf8ff] text-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-220px] h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-violet-200/35 blur-3xl" />
        <div className="absolute right-[-220px] top-[260px] h-[460px] w-[460px] rounded-full bg-fuchsia-200/20 blur-3xl" />
        <div className="absolute bottom-[-240px] left-[-160px] h-[500px] w-[500px] rounded-full bg-amber-100/35 blur-3xl" />
      </div>

      <StudentNav />

      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        {chargement && (
          <section className="rounded-[2rem] border border-violet-100 bg-white/90 p-6 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Clock3 size={23} />
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  Chargement du cours...
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Nous préparons une lecture claire et adaptée au chapitre.
                </p>
              </div>
            </div>
          </section>
        )}

        {erreur && (
          <section className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            <p className="font-bold">Une erreur est survenue</p>
            <p className="mt-2 text-sm leading-6">{erreur}</p>

            <button
              onClick={() => navigate("/etudiant")}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50"
            >
              <ArrowLeft size={17} />
              Retour à mes cours
            </button>
          </section>
        )}

        {!chargement && !erreur && course && (
          <>
            <section className="mb-6 rounded-[2.5rem] border border-violet-100 bg-white/90 p-6 shadow-xl shadow-violet-100/40 backdrop-blur-2xl md:p-8">
              <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">
                    <GraduationCap size={16} />
                    {course.matiere} · {course.niveau}
                  </div>

                  <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-[-0.055em] text-slate-950 md:text-5xl">
                    {course.titre}
                  </h1>

                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                    {course.description}
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => navigate("/etudiant")}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-100 bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
                    >
                      <ArrowLeft size={17} />
                      Retour aux cours
                    </button>

                    {diagnosticQuiz && (
                      <button
                        onClick={() =>
                          navigate(`/etudiant/quiz/${diagnosticQuiz._id}`)
                        }
                        className="group inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                      >
                        Commencer le diagnostic
                        <ArrowRight
                          size={17}
                          className="transition group-hover:translate-x-0.5"
                        />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-[2rem] border border-violet-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-violet-700">
                          Quiz disponibles
                        </p>
                        <p className="mt-2 text-4xl font-black tracking-tight text-slate-950">
                          {quizzes.length}
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-sm">
                        <ListChecks size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-fuchsia-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-fuchsia-700">
                          Parties du cours
                        </p>
                        <p className="mt-2 text-4xl font-black tracking-tight text-slate-950">
                          {course.parties?.length || 0}
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600 shadow-sm">
                        <Layers size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-amber-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-amber-700">
                          Lecture
                        </p>
                        <p className="mt-2 text-lg font-black tracking-tight text-slate-950">
                          Partie par partie
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm">
                        <FileText size={24} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {totalParts > 0 && (
                <div className="mt-8 rounded-[2rem] border border-violet-100 bg-violet-50/40 p-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {lessonParts.map((part, index) => {
                      const isActive = index === safePartIndex;
                      const accent =
                        partAccentStyles[index % partAccentStyles.length];

                      return (
                        <button
                          key={part.id}
                          type="button"
                          onClick={() => goToPart(index)}
                          className={`rounded-[1.5rem] border p-4 text-left transition ${
                            isActive
                              ? "border-violet-200 bg-white shadow-lg shadow-violet-100/50"
                              : "border-transparent bg-white/50 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-black shadow-lg ${
                                isActive
                                  ? accent.icon
                                  : "bg-slate-100 text-slate-500 shadow-transparent"
                              }`}
                            >
                              {index + 1}
                            </div>

                            <div>
                              <p
                                className={`text-xs font-black uppercase tracking-[0.12em] ${
                                  isActive ? "text-violet-700" : "text-slate-400"
                                }`}
                              >
                                Partie {index + 1}
                              </p>

                              <h3 className="mt-1 text-sm font-black leading-5 text-slate-950">
                                {part.titre}
                              </h3>

                              {part.description && (
                                <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-slate-500">
                                  {part.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-6">
                {introContent && safePartIndex === 0 && (
                  <section className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-lg shadow-violet-100/30 backdrop-blur-xl md:p-8">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                        <Sparkles size={24} />
                      </div>

                      <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-950">
                          Avant de commencer
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          Les objectifs essentiels du chapitre.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-[1.7rem] border border-slate-100 bg-slate-50 p-5 md:p-6">
                      {parseContentBlocks(introContent).map((block, index) => (
                        <RichBlock key={index} block={block} />
                      ))}
                    </div>
                  </section>
                )}

                <section className="overflow-hidden rounded-[2.4rem] border border-violet-100 bg-white/95 shadow-xl shadow-violet-100/35 backdrop-blur-xl">
                  {activeLessonPart ? (
                    <>
                      <div
                        className={`border-b border-violet-100 bg-gradient-to-br ${activeAccent.panel} p-6 md:p-8`}
                      >
                        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                          <div className="flex items-start gap-4">
                            <div
                              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.4rem] text-2xl font-black shadow-xl ${activeAccent.icon}`}
                            >
                              {safePartIndex + 1}
                            </div>

                            <div>
                              <div
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${activeAccent.chip}`}
                              >
                                Partie {safePartIndex + 1} sur {totalParts}
                              </div>

                              <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.045em] text-slate-950 md:text-4xl">
                                {activeLessonPart.titre}
                              </h2>

                              {activeLessonPart.description && (
                                <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-slate-600 md:text-base">
                                  {activeLessonPart.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="rounded-[1.5rem] border border-white bg-white/80 p-4 shadow-sm">
                            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                              Progression
                            </p>
                            <p className="mt-1 text-2xl font-black text-slate-950">
                              {Math.round(((safePartIndex + 1) / totalParts) * 100)}
                              %
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 h-2 rounded-full bg-white">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r ${activeAccent.progress}`}
                            style={{
                              width: `${((safePartIndex + 1) / totalParts) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="p-6 md:p-8">
                        <div className="rounded-[1.8rem] border border-slate-100 bg-slate-50/80 p-5 md:p-7">
                          {activeBlocks.length > 0 ? (
                            activeBlocks.map((block, index) => (
                              <RichBlock key={index} block={block} />
                            ))
                          ) : (
                            <p className="text-sm font-semibold text-slate-500">
                              Aucun contenu détaillé pour cette partie.
                            </p>
                          )}
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <button
                            type="button"
                            onClick={() => goToPart(safePartIndex - 1)}
                            disabled={safePartIndex === 0}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-100 bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                          >
                            <ChevronLeft size={18} />
                            Partie précédente
                          </button>

                          <div className="flex justify-center gap-1.5">
                            {lessonParts.map((part, index) => (
                              <button
                                key={part.id}
                                type="button"
                                onClick={() => goToPart(index)}
                                aria-label={`Aller à la partie ${index + 1}`}
                                className={`h-2.5 rounded-full transition-all ${
                                  index === safePartIndex
                                    ? "w-7 bg-violet-600"
                                    : "w-2.5 bg-violet-200 hover:bg-violet-300"
                                }`}
                              />
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => goToPart(safePartIndex + 1)}
                            disabled={safePartIndex === totalParts - 1}
                            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                          >
                            Partie suivante
                            <ChevronRight
                              size={18}
                              className="transition group-hover:translate-x-0.5"
                            />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 md:p-8">
                      <div className="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-5 text-sm leading-7 text-slate-700 md:p-6">
                        {course.contenuTexte ? (
                          <MathContent content={course.contenuTexte} />
                        ) : (
                          "Aucun contenu texte disponible."
                        )}
                      </div>
                    </div>
                  )}
                </section>
              </div>

              <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                      <ListChecks size={23} />
                    </div>

                    <div>
                      <h2 className="text-xl font-black text-slate-950">
                        Quiz général
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Diagnostic principal du cours.
                      </p>
                    </div>
                  </div>

                  {diagnosticQuiz ? (
                    <div className="mt-5 rounded-[1.7rem] border border-violet-100 bg-violet-50/60 p-5">
                      <span className="inline-flex rounded-full border border-violet-100 bg-white px-3 py-1 text-xs font-bold text-violet-700">
                        Diagnostic général
                      </span>

                      <h3 className="mt-3 font-black text-slate-950">
                        {diagnosticQuiz.titre}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {diagnosticQuiz.description || "Quiz diagnostique"}
                      </p>

                      <div className="mt-4 rounded-2xl bg-white p-4">
                        <p className="text-xs font-semibold text-slate-500">
                          Questions
                        </p>
                        <p className="mt-1 font-bold text-slate-950">
                          {diagnosticQuiz.questions.length} question(s)
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          navigate(`/etudiant/quiz/${diagnosticQuiz._id}`)
                        }
                        className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                      >
                        Commencer le diagnostic
                        <PlayCircle
                          size={18}
                          className="transition group-hover:translate-x-0.5"
                        />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[1.5rem] bg-slate-50 p-5 text-sm text-slate-500">
                      Aucun diagnostic général disponible pour ce cours.
                    </div>
                  )}
                </div>

                {activeLessonPart && (
                  <div className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg ${activeAccent.icon}`}
                      >
                        <Layers size={23} />
                      </div>

                      <div>
                        <h2 className="text-xl font-black text-slate-950">
                          Partie active
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          Lecture ciblée.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[1.7rem] border border-slate-100 bg-slate-50 p-5">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-violet-700">
                        Partie {safePartIndex + 1}
                      </p>

                      <h3 className="mt-2 text-lg font-black text-slate-950">
                        {activeLessonPart.titre}
                      </h3>

                      {activeLessonPart.description && (
                        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                          {activeLessonPart.description}
                        </p>
                      )}
                    </div>

                    {activePracticeQuizzes.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                          Exercices liés
                        </p>

                        {activePracticeQuizzes.map((quiz) => (
                          <button
                            key={quiz._id}
                            onClick={() => navigate(`/etudiant/quiz/${quiz._id}`)}
                            className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:bg-emerald-100"
                          >
                            <span className="text-sm font-bold text-emerald-900">
                              {quiz.titre}
                            </span>
                            <PlayCircle
                              size={17}
                              className="shrink-0 text-emerald-700 transition group-hover:translate-x-0.5"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-lg shadow-violet-100/30 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                      <BrainCircuit size={23} />
                    </div>

                    <div>
                      <h2 className="text-xl font-black text-slate-950">
                        Diagnostic IA
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Recommandations après diagnostic.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-500">
                        Cours
                      </p>
                      <p className="mt-1 font-bold text-slate-950">
                        Disponible
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-500">
                        Quiz
                      </p>
                      <p className="mt-1 font-bold text-slate-950">
                        {quizzes.length} quiz disponible(s)
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-500">
                        Recommandations
                      </p>
                      <p className="mt-1 font-bold text-slate-950">
                        Après le diagnostic
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/etudiant/recommandations")}
                    className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-100 bg-white px-4 py-3.5 text-sm font-bold text-violet-700 transition hover:-translate-y-0.5 hover:bg-violet-50"
                  >
                    Voir mes recommandations
                    <ArrowRight
                      size={17}
                      className="transition group-hover:translate-x-0.5"
                    />
                  </button>
                </div>
              </aside>
            </section>

            <section className="mt-6 rounded-[2.2rem] border border-violet-100 bg-white/95 p-6 shadow-lg shadow-violet-100/30 backdrop-blur-xl md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">
                    <Sparkles size={16} />
                    Exercices et diagnostics
                  </div>

                  <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
                    Quiz disponibles
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Passez un diagnostic général ou entraînez-vous sur une
                    partie ciblée.
                  </p>
                </div>
              </div>

              {sortedQuizzes.length === 0 ? (
                <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-6 text-sm text-slate-500">
                  Aucun quiz disponible pour ce cours.
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  {sortedQuizzes.map((quiz) => {
                    const partTitle = getPartTitle(quiz.partieId);
                    const isLinkedToActivePart =
                      activeLessonPart && quiz.partieId === activeLessonPart.id;

                    return (
                      <article
                        key={quiz._id}
                        className={`rounded-[1.8rem] border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                          isLinkedToActivePart
                            ? "border-violet-200 ring-4 ring-violet-50"
                            : "border-slate-100"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                                quizTypeStyle[quiz.type || "diagnostic"]
                              }`}
                            >
                              {quizTypeLabel[quiz.type || "diagnostic"]}
                            </span>

                            <h3 className="mt-3 text-lg font-black text-slate-950">
                              {quiz.titre}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {quiz.description || "Quiz pédagogique"}
                            </p>
                          </div>

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                            <ListChecks size={23} />
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-3">
                          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-xs font-semibold text-slate-500">
                              Questions
                            </p>
                            <p className="mt-1 font-bold text-slate-950">
                              {quiz.questions.length} question(s)
                            </p>
                          </div>

                          {partTitle && (
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                              <p className="text-xs font-bold text-emerald-700">
                                Entraînement lié à
                              </p>
                              <p className="mt-1 font-bold text-emerald-900">
                                {partTitle}
                              </p>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => navigate(`/etudiant/quiz/${quiz._id}`)}
                          className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
                        >
                          {quiz.type === "practice"
                            ? "Commencer l’entraînement"
                            : "Commencer le diagnostic"}
                          <PlayCircle
                            size={18}
                            className="transition group-hover:translate-x-0.5"
                          />
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default StudentCourseDetailPage;