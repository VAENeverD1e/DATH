import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const sections = [
  {
    title: "Authentication",
    description: "Log in or sign up before using protected areas.",
    items: [
      { to: "/login", label: "User Login" },
      { to: "/admin-login", label: "Admin Login" },
      { to: "/register", label: "Register" },
    ],
  },
  {
    title: "Dashboards",
    description: "Jump directly to the workspace suited to your role.",
    items: [
      { to: "/user-dashboard", label: "User Dashboard" },
      { to: "/doctor", label: "Doctor Dashboard" },
      { to: "/admin", label: "Admin Dashboard" },
      { to: "/appointment-dashboard", label: "Appointment Dashboard" },
    ],
  },
  {
    title: "Public Pages",
    description: "Marketing and general-purpose content.",
    items: [
      { to: "/home", label: "Home" },
      { to: "/services", label: "Services" },
    ],
  },
  {
    title: "Tools",
    description: "Developer & QA utilities.",
    items: [{ to: "/api-playground", label: "API Playground" }],
  },
];

export default function FloatingMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredSections = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return sections;
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          item.label.toLowerCase().includes(keyword)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [search]);

  const closeMenu = () => setOpen(false);

  const handleNavigate = (to) => {
    closeMenu();
    navigate(to);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close quick navigator" : "Open quick navigator"}
        className="w-14 h-14 rounded-full bg-indigo-600 text-white text-2xl flex items-center justify-center shadow-lg hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {open ? "×" : "☰"}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-40"
          onClick={closeMenu}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-[420px] max-w-[90vw] max-h-[85vh] flex flex-col p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="mb-4">
              <p className="text-sm uppercase text-indigo-600 font-semibold tracking-wide">
                Quick Navigator
              </p>
              <h2 className="text-2xl font-bold text-gray-900">
                Where would you like to go?
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Choose a destination or search by keyword.
              </p>
            </header>

            <label className="mb-4">
              <span className="sr-only">Search pages</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pages..."
                className="w-full rounded-xl border border-gray-200 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </label>

            <div className="overflow-y-auto space-y-5 pr-1">
              {filteredSections.length === 0 && (
                <p className="text-center text-sm text-gray-500">
                  No matches. Try a different term.
                </p>
              )}
              {filteredSections.map((section) => (
                <section key={section.title}>
                  <div className="mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">
                      {section.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {section.description}
                    </p>
                  </div>
                  <div className="grid gap-2">
                    {section.items.map((item) => (
                      <button
                        key={item.to}
                        type="button"
                        onClick={() => handleNavigate(item.to)}
                        className="w-full text-left px-4 py-2 rounded-lg border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition text-sm font-medium text-gray-700"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setSearch("")}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition text-sm font-semibold"
              >
                Clear search
              </button>
              <button
                type="button"
                onClick={closeMenu}
                className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}