import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  BrainCircuit,
  ChevronDown,
  GraduationCap,
  LogOut,
  Menu,
  Trophy,
  UserCircle,
  X,
} from "lucide-react";

type StoredUser = {
  nom?: string;
  name?: string;
  prenom?: string;
  email?: string;
  role?: string;
};

const getStoredUser = (): StoredUser | null => {
  try {
    const rawUser = localStorage.getItem("user");

    if (!rawUser) {
      return null;
    }

    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

function StudentNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const user = getStoredUser();

  const displayName =
    user?.prenom && user?.nom
      ? `${user.prenom} ${user.nom}`
      : user?.nom || user?.name || "Étudiant";

  const displayEmail = user?.email || "Compte étudiant";

  const navItems = [
    {
      label: "Mes cours",
      path: "/etudiant",
      icon: BookOpen,
    },
    {
      label: "Recommandations",
      path: "/etudiant/recommandations",
      icon: BrainCircuit,
    },
    {
      label: "Résultats",
      path: "/etudiant/resultats",
      icon: Trophy,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/connexion");
  };

  const isActive = (path: string) => {
    if (path === "/etudiant") {
      return location.pathname === "/etudiant";
    }

    return location.pathname.startsWith(path);
  };

  const goTo = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-violet-100 bg-white/85 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/etudiant")}
            className="group flex items-center gap-3 text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-xl shadow-violet-600/20 transition group-hover:-translate-y-0.5">
              <GraduationCap size={25} />
            </div>

            <div className="hidden sm:block">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Plateforme IA
              </p>

              <h1 className="text-lg font-black tracking-[-0.03em] text-slate-950">
                Espace étudiant
              </h1>
            </div>
          </button>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => goTo(item.path)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition ${
                    active
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                      : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                  }`}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="flex items-center gap-3 rounded-full border border-violet-100 bg-white px-3 py-2 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                  <UserCircle size={23} />
                </div>

                <div className="max-w-[150px] text-left">
                  <p className="truncate text-sm font-bold text-slate-950">
                    {displayName}
                  </p>
                  <p className="truncate text-xs font-medium text-slate-500">
                    Étudiant
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-[1.7rem] border border-violet-100 bg-white shadow-2xl shadow-violet-100/60">
                  <div className="border-b border-slate-100 bg-violet-50/70 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
                        <UserCircle size={30} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-black text-slate-950">
                          {displayName}
                        </p>
                        <p className="truncate text-sm text-slate-500">
                          {displayEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/etudiant");
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                    >
                      <BookOpen size={18} />
                      Mes cours
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/etudiant/resultats");
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                    >
                      <Trophy size={18} />
                      Mes résultats
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/etudiant/recommandations");
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                    >
                      <BrainCircuit size={18} />
                      Recommandations IA
                    </button>

                    <div className="my-2 h-px bg-slate-100" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={18} />
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-100 bg-white text-violet-700 shadow-sm transition hover:bg-violet-50 lg:hidden"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-violet-100 py-4 lg:hidden">
            <div className="mb-4 rounded-[1.7rem] border border-violet-100 bg-violet-50/70 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white">
                  <UserCircle size={27} />
                </div>

                <div className="min-w-0">
                  <p className="truncate font-black text-slate-950">
                    {displayName}
                  </p>
                  <p className="truncate text-sm text-slate-500">
                    {displayEmail}
                  </p>
                </div>
              </div>
            </div>

            <nav className="grid grid-cols-1 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => goTo(item.path)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                      active
                        ? "bg-violet-600 text-white"
                        : "bg-white text-slate-700 hover:bg-violet-50 hover:text-violet-700"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default StudentNav;