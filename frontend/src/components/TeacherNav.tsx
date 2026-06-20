import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  Camera,
  ChevronDown,
  ClipboardList,
  GraduationCap,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Trash2,
  UserCircle,
  Users,
  X,
} from "lucide-react";

import api from "../api/axios";

type StoredUser = {
  id?: string;
  nom?: string;
  name?: string;
  prenom?: string;
  email?: string;
  role?: string;
  profile?: {
    avatarUrl?: string;
    avatarPublicId?: string;
  };
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

const getInitials = (user: StoredUser | null) => {
  const first = user?.prenom?.trim()?.[0] || "";
  const last = user?.nom?.trim()?.[0] || "";

  return `${first}${last}`.toUpperCase() || "P";
};

function TeacherNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [currentUser, setCurrentUser] = useState<StoredUser | null>(
    getStoredUser()
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const displayName =
    currentUser?.prenom && currentUser?.nom
      ? `${currentUser.prenom} ${currentUser.nom}`
      : currentUser?.nom || currentUser?.name || "Professeur";

  const displayEmail = currentUser?.email || "Compte professeur";
  const avatarUrl = currentUser?.profile?.avatarUrl || "";
  const initials = getInitials(currentUser);

  const navItems = [
    {
      label: "Tableau de bord",
      path: "/professeur",
      icon: LayoutDashboard,
    },
    {
      label: "Mes cours",
      path: "/professeur/cours",
      icon: BookOpen,
    },
    {
      label: "Mes quiz",
      path: "/professeur/quiz",
      icon: ClipboardList,
    },
    {
      label: "Accès",
      path: "/professeur/cours/acces",
      icon: Users,
    },
    {
      label: "Résultats",
      path: "/professeur/resultats",
      icon: BarChart3,
    },
  ];

  const syncUser = (user: StoredUser) => {
    localStorage.setItem("user", JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/connexion");
  };

  const isActive = (path: string) => {
    if (path === "/professeur") {
      return location.pathname === "/professeur";
    }

    return location.pathname.startsWith(path);
  };

  const goTo = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const openAvatarPicker = () => {
    setProfileMessage("");
    setProfileError("");
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setProfileMessage("");
    setProfileError("");

    if (!file.type.startsWith("image/")) {
      setProfileError("Veuillez choisir une image valide.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setProfileError("L’image est trop volumineuse. Maximum : 2 Mo.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setAvatarLoading(true);

    try {
      const response = await api.patch("/auth/profile/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      syncUser(response.data.user);
      setProfileMessage("Photo de profil mise à jour.");
    } catch (error: any) {
      setProfileError(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour de la photo."
      );
    } finally {
      setAvatarLoading(false);
      event.target.value = "";
    }
  };

  const handleDeleteAvatar = async () => {
    setProfileMessage("");
    setProfileError("");
    setAvatarLoading(true);

    try {
      const response = await api.delete("/auth/profile/avatar");

      syncUser(response.data.user);
      setProfileMessage("Photo de profil supprimée.");
    } catch (error: any) {
      setProfileError(
        error.response?.data?.message ||
          "Erreur lors de la suppression de la photo."
      );
    } finally {
      setAvatarLoading(false);
    }
  };

  const Avatar = ({
    size = "md",
    soft = false,
  }: {
    size?: "sm" | "md" | "lg";
    soft?: boolean;
  }) => {
    const sizeClass =
      size === "sm" ? "h-10 w-10" : size === "lg" ? "h-20 w-20" : "h-14 w-14";

    const textClass =
      size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-lg";

    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={displayName}
          className={`${sizeClass} shrink-0 rounded-full object-cover ring-4 ${
            soft ? "ring-white/70" : "ring-violet-100"
          }`}
        />
      );
    }

    return (
      <div
        className={`${sizeClass} ${textClass} flex shrink-0 items-center justify-center rounded-full bg-violet-600 font-black text-white shadow-lg shadow-violet-600/20 ring-4 ${
          soft ? "ring-white/70" : "ring-violet-100"
        }`}
      >
        {initials}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-violet-100 bg-white/85 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/professeur")}
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
                Espace professeur
              </h1>
            </div>
          </button>

          <nav className="hidden items-center gap-2 xl:flex">
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
                onClick={() => {
                  setProfileOpen((value) => !value);
                  setProfileMessage("");
                  setProfileError("");
                }}
                className="flex items-center gap-3 rounded-full border border-violet-100 bg-white px-3 py-2 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
              >
                <Avatar size="sm" />

                <div className="max-w-[150px] text-left">
                  <p className="truncate text-sm font-bold text-slate-950">
                    {displayName}
                  </p>
                  <p className="truncate text-xs font-medium text-slate-500">
                    Professeur
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
                <div className="absolute right-0 mt-3 w-[360px] overflow-hidden rounded-[2rem] border border-violet-100 bg-white shadow-2xl shadow-violet-100/60">
                  <div className="bg-violet-50/70 p-5">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar size="lg" soft />

                        <button
                          type="button"
                          onClick={openAvatarPicker}
                          disabled={avatarLoading}
                          className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border border-violet-100 bg-white text-violet-700 shadow-md transition hover:bg-violet-50 disabled:opacity-60"
                        >
                          <Camera size={17} />
                        </button>
                      </div>

                      <div className="min-w-0 pt-1">
                        <p className="truncate text-lg font-black text-slate-950">
                          {displayName}
                        </p>
                        <p className="truncate text-sm text-slate-500">
                          {displayEmail}
                        </p>

                        <div className="mt-3 inline-flex rounded-full border border-violet-100 bg-white px-3 py-1 text-xs font-bold text-violet-700">
                          Profil professeur
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />

                    <div className="rounded-[1.5rem] border border-violet-100 bg-white p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                          <UserCircle size={22} />
                        </div>

                        <div>
                          <p className="font-bold text-slate-950">
                            Photo de profil
                          </p>
                          <p className="text-sm text-slate-500">
                            JPG, PNG ou WebP. Maximum 2 Mo.
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-2">
                        <button
                          type="button"
                          onClick={openAvatarPicker}
                          disabled={avatarLoading}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:opacity-60"
                        >
                          <ImagePlus size={18} />
                          {avatarLoading
                            ? "Traitement..."
                            : avatarUrl
                            ? "Changer la photo"
                            : "Ajouter une photo"}
                        </button>

                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={handleDeleteAvatar}
                            disabled={avatarLoading}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                          >
                            <Trash2 size={18} />
                            Supprimer la photo
                          </button>
                        )}
                      </div>
                    </div>

                    {profileMessage && (
                      <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                        {profileMessage}
                      </div>
                    )}

                    {profileError && (
                      <div className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                        {profileError}
                      </div>
                    )}

                    <div className="my-4 h-px bg-slate-100" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
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
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-100 bg-white text-violet-700 shadow-sm transition hover:bg-violet-50 xl:hidden"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-violet-100 py-4 xl:hidden">
            <div className="mb-4 rounded-[1.7rem] border border-violet-100 bg-violet-50/70 p-4">
              <div className="flex items-center gap-3">
                <Avatar size="md" soft />

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
                onClick={openAvatarPicker}
                disabled={avatarLoading}
                className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-50 disabled:opacity-60"
              >
                <ImagePlus size={18} />
                {avatarUrl ? "Changer la photo" : "Ajouter une photo"}
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  disabled={avatarLoading}
                  className="flex items-center gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                >
                  <Trash2 size={18} />
                  Supprimer la photo
                </button>
              )}

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

export default TeacherNav;