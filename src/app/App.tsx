import { useEffect, useState } from "react";
import {
  Home, Train, AlertTriangle, User, Bell, Star, MapPin,
  Clock, Users, CheckCircle, Mail, Camera, ArrowLeft,
  ChevronDown, Car, Trophy, CreditCard, Navigation,
  Trash2, Shield, Settings, Phone, ChevronRight, Plus,
  Minus, Search, Smartphone, Wrench, Lock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type CitizenTab = "home" | "mobility" | "report" | "maintenance" | "profile";
type HomeScreen = "dashboard" | "ticketDetail" | "allTickets" | "notifications" | "notificationDetail";
type MobilityScreen = "hub" | "ticketForm" | "payment" | "success" | "carpooling" | "offerRide" | "offerSuccess";
type ReportScreen = "form" | "success";
type WorkerScreen = "map" | "jobDetail" | "jobComplete";
type DefectStatus = "new" | "approved" | "pending" | "in-progress" | "rejected" | "completed";
type AdminTab = "defects" | "team";
type AdminFilter = "all" | DefectStatus;
type AdminView = "map" | "table";

interface DefectItem {
  id: number;
  x: number;
  y: number;
  status: DefectStatus;
  label: string;
  address: string;
  priority: string;
  category: string;
  reporter: string;
  time: string;
  team: string;
  detail: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────
const TICKETS = [
  { id: 1, type: "ÖV-Tageskarte", date: "20. Juni 2026", price: "CHF 24.00", emoji: "🚋", active: true, persons: 2, zone: "Zonen 1–9", code: "MCY-2026-7842-4591" },
  { id: 2, type: "Mitfahrt Zürich–Winterthur", date: "18. Juni 2026", price: "CHF 8.00", emoji: "🚗", active: true, persons: 1, zone: "Carpooling", code: "MCY-2026-8131-2270" },
  { id: 3, type: "ÖV-Tageskarte", date: "02. Juni 2026", price: "CHF 12.00", emoji: "🚋", active: false, persons: 1, zone: "Zonen 1–9", code: "MCY-2026-3345-9910" },
  { id: 4, type: "ÖV-Tageskarte", date: "15. Mai 2026", price: "CHF 24.00", emoji: "🚋", active: false, persons: 2, zone: "Zonen 1–9", code: "MCY-2026-1122-3387" },
  { id: 5, type: "Mitfahrt Bern–Basel", date: "10. Mai 2026", price: "CHF 7.00", emoji: "🚗", active: false, persons: 1, zone: "Carpooling", code: "MCY-2026-5567-0012" },
];

const NOTIFICATIONS = [
  { id: 1, title: "Mängelmeldung aktualisiert", body: "Ihre Meldung «Strassenlampe defekt» wurde einem Techniker zugewiesen. Bearbeitung läuft.", time: "Heute, 14:23", type: "report" as const, read: false, detail: "Auftrag #MCY-2001 wurde an Techniker Jörg Baumann zugewiesen. Geplante Behebung: heute bis 18:00 Uhr. Sie werden bei Abschluss benachrichtigt." },
  { id: 2, title: "Ticket bestätigt", body: "Ihre ÖV-Tageskarte für den 20. Juni 2026 ist aktiv und einsatzbereit.", time: "Heute, 08:15", type: "ticket" as const, read: false, detail: "ÖV-Tageskarte (MCY-2026-7842-4591) ist gültig für den 20. Juni 2026, Zonen 1–9, 2 Personen. Zeigen Sie den QR-Code beim Einsteigen vor." },
  { id: 3, title: "Mangel behoben ✓", body: "Ihre Meldung «Schlagloch Hauptstrasse» wurde erfolgreich behoben.", time: "Gestern, 16:40", type: "report" as const, read: true, detail: "Der gemeldete Defekt an der Hauptstrasse 12 wurde durch das Wartungsteam behoben. Vielen Dank für Ihre Mithilfe, myMetroCity sicherer zu machen!" },
  { id: 4, title: "Neue Mitfahrt verfügbar", body: "Eine neue Mitfahrt von Zürich HB nach Winterthur um 07:30 Uhr ist verfügbar.", time: "Gestern, 07:00", type: "ticket" as const, read: true, detail: "Thomas M. bietet eine Mitfahrt an: Zürich HB → Winterthur, 07:30 Uhr, CHF 8.00 pro Platz, 2 freie Plätze." },
];

const RIDES = [
  { id: 1, driver: "Thomas M.", avatar: "TM", rating: 4.8, reviews: 23, from: "Zürich HB", to: "Winterthur", time: "07:30", seats: 2, price: 8 },
  { id: 2, driver: "Sabrina K.", avatar: "SK", rating: 4.6, reviews: 15, from: "Zürich HB", to: "Winterthur", time: "08:00", seats: 3, price: 7 },
  { id: 3, driver: "Marco B.", avatar: "MB", rating: 5.0, reviews: 41, from: "Zürich HB", to: "Winterthur", time: "08:45", seats: 1, price: 9 },
  { id: 4, driver: "Lisa W.", avatar: "LW", rating: 4.3, reviews: 9, from: "Zürich HB", to: "Winterthur", time: "09:15", seats: 2, price: 7 },
];

const DEFECTS: DefectItem[] = [
  { id: 1, x: 148, y: 185, status: "new", label: "Strassenlampe defekt", address: "Hauptstrasse 47", priority: "hoch", category: "Beleuchtung", reporter: "Anna Müller", time: "Heute, 06:45", team: "Noch nicht zugewiesen", detail: "Leuchtmittel defekt. Bereich ist schlecht sichtbar, besonders in der Abenddämmerung." },
  { id: 2, x: 245, y: 255, status: "pending", label: "Schlagloch Hauptstr.", address: "Hauptstrasse 12", priority: "mittel", category: "Strasse", reporter: "Marco B.", time: "Heute, 08:10", team: "Team 2", detail: "Schlagloch ca. 30 cm Durchmesser, 8 cm tief. Verkehrssicherheit eingeschränkt." },
  { id: 3, x: 88, y: 315, status: "in-progress", label: "Ampel ausgefallen", address: "Bahnhofplatz 3", priority: "hoch", category: "Verkehrssteuerung", reporter: "Lisa W.", time: "Heute, 09:20", team: "Team 1", detail: "Ampelsteuerung reagiert nicht auf Signalwechsel. Sperrung erforderlich." },
  { id: 4, x: 282, y: 158, status: "approved", label: "Vandalismusschaden", address: "Kirchgasse 8", priority: "niedrig", category: "Sicherheit", reporter: "Thomas M.", time: "Gestern, 18:30", team: "Noch nicht zugewiesen", detail: "Glasscheibe beschädigt. Kleinerer Schaden, aber sofortige Sicherung sinnvoll." },
  { id: 5, x: 198, y: 375, status: "rejected", label: "Kanaldeckel locker", address: "Parkweg 15", priority: "mittel", category: "Infrastruktur", reporter: "Sabrina K.", time: "Gestern, 21:05", team: "-", detail: "Kanaldeckel war nur kurz gelockert; Meldung wurde als nicht relevant eingestuft." },
  { id: 6, x: 150, y: 445, status: "completed", label: "Bodenplatte gesichert", address: "Parkweg 22", priority: "niedrig", category: "Sicherheit", reporter: "Nora R.", time: "Gestern, 14:00", team: "Team 3", detail: "Arbeitsbereich wurde abgesichert und abgeschlossen." },
];

const REJECTION_REASONS = [
  "spam",
  "scam",
  "bot",
  "not a real accident",
  "duplicate report",
  "insufficient details",
];

const QR_PATTERN = [
  [1,1,1,1,1,1,1,0,1,0,0,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,1,1,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,0,0,1,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,1,0,0,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
  [0,1,1,0,1,0,1,1,1,0,1,1,0,1,0,1,1,0,1],
  [1,0,1,0,0,1,0,0,0,1,0,0,1,0,1,0,0,1,0],
  [1,1,0,1,1,0,1,0,1,1,0,1,0,0,1,1,0,1,1],
  [0,0,1,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0],
  [1,1,1,1,1,1,1,0,1,0,0,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,1,1,0,0,0,1,0,0,1,0],
  [1,0,1,1,1,0,1,0,1,0,0,1,1,1,0,1,1,0,1],
  [1,0,1,1,1,0,1,0,0,1,1,0,0,0,1,0,0,1,1],
  [1,0,1,1,1,0,1,0,1,0,0,1,1,1,0,1,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,0,1,0],
  [1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,0,1,0,1],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function QRCode({ size = 171 }: { size?: number }) {
  const cell = size / 19;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" />
      {QR_PATTERN.map((row, y) =>
        row.map((cell_, x) =>
          cell_ ? <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill="#0F172A" /> : null
        )
      )}
    </svg>
  );
}

function StarRow({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-[#D1D5DB] fill-[#D1D5DB]"} />
      ))}
    </div>
  );
}

function getStatusLabel(status: DefectStatus) {
  switch (status) {
    case "new": return "Neu";
    case "approved": return "Angenommen";
    case "pending": return "Wartet";
    case "in-progress": return "In Bearbeitung";
    case "rejected": return "Abgelehnt";
    case "completed": return "Erledigt";
  }
}

function getStatusPillClass(status: DefectStatus) {
  switch (status) {
    case "new": return "bg-red-50 text-red-600";
    case "approved": return "bg-blue-50 text-blue-600";
    case "pending": return "bg-amber-50 text-amber-700";
    case "in-progress": return "bg-emerald-50 text-emerald-600";
    case "rejected": return "bg-slate-100 text-slate-600";
    case "completed": return "bg-green-50 text-green-700";
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  // Navigation state
  const [citizenTab, setCitizenTab] = useState<CitizenTab>("home");
  const [homeScreen, setHomeScreen] = useState<HomeScreen>("dashboard");
  const [mobilityScreen, setMobilityScreen] = useState<MobilityScreen>("hub");
  const [reportScreen, setReportScreen] = useState<ReportScreen>("form");
  const [workerScreen, setWorkerScreen] = useState<WorkerScreen>("map");

  // Selection state
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [selectedNotifId, setSelectedNotifId] = useState<number | null>(null);
  const [carpoolModalId, setCarpoolModalId] = useState<number | null>(null);
  const [selectedPinId, setSelectedPinId] = useState(1);

  // Ticket purchase state
  const [persons, setPersons] = useState(1);
  const [ticketDate, setTicketDate] = useState("2026-06-20");
  const [selectedPayment, setSelectedPayment] = useState<"card" | "twint">("card");

  // Report state
  const [reportPhotoUploaded, setReportPhotoUploaded] = useState(false);

  // Worker state
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [workerTaskId, setWorkerTaskId] = useState<number | null>(null);

  // Profile tab
  const [profileTab, setProfileTab] = useState<"account" | "reviews">("account");

  // Admin panel state
  const [defects, setDefects] = useState<DefectItem[]>(DEFECTS);
  const [adminMode, setAdminMode] = useState(false);
  const [adminTab, setAdminTab] = useState<AdminTab>("defects");
  const [adminView, setAdminView] = useState<AdminView>("map");
  const [adminFilter, setAdminFilter] = useState<AdminFilter>("all");
  const [adminSearch, setAdminSearch] = useState("");
  const [selectedAdminDefectId, setSelectedAdminDefectId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState(REJECTION_REASONS[0]);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : false
  );
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Derived
  const totalPrice = (12 * persons).toFixed(2);
  const selectedRide = RIDES.find((r) => r.id === carpoolModalId);
  const selectedTicket = TICKETS.find((t) => t.id === selectedTicketId);
  const selectedNotif = NOTIFICATIONS.find((n) => n.id === selectedNotifId);
  const selectedDefect = defects.find((d) => d.id === selectedPinId);
  const selectedAdminDefect = defects.find((d) => d.id === selectedAdminDefectId);
  const workerActiveTask = defects.find((d) => d.id === workerTaskId);
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;
  const activeTickets = TICKETS.filter((t) => t.active);
  const openWorkerTasks = defects.filter((d) => d.status === "new" || d.status === "pending" || d.status === "approved").length;
  const activeWorkerAssignments = defects.filter((d) => d.status === "in-progress").length;
  const filteredDefects = defects.filter((d) => {
    const matchesFilter = adminFilter === "all" || d.status === adminFilter;
    const query = adminSearch.toLowerCase();
    const matchesSearch = !query || `${d.label} ${d.address} ${d.category}`.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
  const adminCounts = {
    all: defects.length,
    new: defects.filter((d) => d.status === "new").length,
    approved: defects.filter((d) => d.status === "approved").length,
    pending: defects.filter((d) => d.status === "pending").length,
    "in-progress": defects.filter((d) => d.status === "in-progress").length,
    rejected: defects.filter((d) => d.status === "rejected").length,
    completed: defects.filter((d) => d.status === "completed").length,
  };

  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (selectedAdminDefectId && filteredDefects.some((d) => d.id === selectedAdminDefectId)) {
      return;
    }
    setSelectedAdminDefectId(filteredDefects[0]?.id ?? null);
  }, [filteredDefects, selectedAdminDefectId]);

  function goToTab(tab: CitizenTab) {
    setCitizenTab(tab);
    setHomeScreen("dashboard");
    setMobilityScreen("hub");
    setReportScreen("form");
    if (tab !== "profile") {
      setAdminMode(false);
      setSelectedAdminDefectId(null);
    }
  }

  function openAdminPanel() {
    setAdminMode(true);
    setAdminTab("defects");
    setAdminFilter("all");
    setSelectedAdminDefectId(null);
    setSuccessNotice(null);
  }

  function updateDefectStatus(id: number, status: DefectStatus, reason?: string) {
    setDefects((current) =>
      current.map((d) =>
        d.id === id
          ? {
              ...d,
              status,
              team: status === "pending" || status === "in-progress" ? "Team 2" : d.team,
            }
          : d
      )
    );
    setSelectedAdminDefectId(id);
    if (status === "pending") {
      setSuccessNotice("Anfrage wurde angenommen und dem Wartungsteam zugewiesen.");
    }
    if (status === "in-progress") {
      setSuccessNotice("Der Auftrag ist jetzt in Bearbeitung.");
    }
    if (status === "rejected" && reason) {
      setSuccessNotice(`Anfrage wurde abgelehnt (${reason}).`);
    }
  }

  function acceptWorkerTask(id: number) {
    if (workerTaskId !== null && workerTaskId !== id) {
      return;
    }
    setDefects((current) =>
      current.map((d) =>
        d.id === id
          ? {
              ...d,
              status: "in-progress",
              team: "Mein Team",
            }
          : d
      )
    );
    setWorkerTaskId(id);
    setSelectedPinId(id);
    setWorkerScreen("jobDetail");
  }

  function completeWorkerTask() {
    if (!workerTaskId) return;
    setDefects((current) =>
      current.map((d) =>
        d.id === workerTaskId
          ? {
              ...d,
              status: "completed",
            }
          : d
      )
    );
    setWorkerTaskId(null);
    setPhotoUploaded(false);
    setWorkerScreen("map");
    setSuccessNotice("Auftrag wurde erfolgreich abgeschlossen.");
  }

  // ── HOME: DASHBOARD ─────────────────────────────────────────────────────────
  function renderDashboard() {
    return (
      <div className="px-5 pt-3 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm text-[#64748B]">Guten Morgen,</p>
            <h1 className="text-[26px] font-extrabold text-[#0F172A] leading-tight">Anna Müller</h1>
          </div>
          <button
            onClick={() => setHomeScreen("notifications")}
            className="relative w-12 h-12 rounded-2xl bg-white border border-[#D1D5DB] flex items-center justify-center shadow-sm"
          >
            <Bell size={22} className="text-[#0F172A]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#10B981] rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Gamification card */}
        <div className="bg-[#0F172A] rounded-2xl p-5 mb-5 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-36 h-36 bg-[#10B981]/10 rounded-full pointer-events-none" />
          <div className="relative flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-[#10B981]" />
              <span className="text-white/70 text-sm font-semibold">CarpoolPoints</span>
            </div>
            <span className="bg-[#10B981] text-white text-xs font-bold px-2.5 py-1 rounded-full">Level 4</span>
          </div>
          <div className="relative text-[42px] font-extrabold text-white leading-none mb-1">1'248</div>
          <div className="text-white/40 text-sm mb-4">Punkte gesammelt</div>
          <div className="w-full bg-white/10 rounded-full h-2 mb-1.5">
            <div className="bg-[#10B981] h-2 rounded-full" style={{ width: "62%" }} />
          </div>
          <div className="flex justify-between text-xs text-white/30">
            <span>Level 4</span><span>752 bis Level 5</span>
          </div>
        </div>

        {/* Active tickets */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-bold text-[#0F172A]">Aktive Tickets</h2>
          <button
            onClick={() => setHomeScreen("allTickets")}
            className="text-[#10B981] text-sm font-semibold"
          >
            Alle anzeigen
          </button>
        </div>

        <div className="space-y-2.5 mb-6">
          {activeTickets.map((t) => (
            <button
              key={t.id}
              onClick={() => { setSelectedTicketId(t.id); setHomeScreen("ticketDetail"); }}
              className="w-full bg-white rounded-xl px-4 py-3 border border-[#D1D5DB] flex items-center gap-3 shadow-sm active:border-[#10B981] transition-colors text-left"
            >
              <div className="w-10 h-10 bg-[#ECFDF5] rounded-xl flex items-center justify-center text-lg flex-shrink-0">{t.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[#0F172A] text-[15px] truncate">{t.type}</div>
                <div className="text-xs text-[#64748B]">{t.date}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="font-bold text-[#0F172A] text-sm">{t.price}</div>
                <ChevronRight size={16} className="text-[#10B981]" />
              </div>
            </button>
          ))}
          {/* Expired ticket preview — disabled */}
          <div className="w-full bg-[#F8FAFC] rounded-xl px-4 py-3 border border-[#D1D5DB] flex items-center gap-3 opacity-50">
            <div className="w-10 h-10 bg-[#F1F5F9] rounded-xl flex items-center justify-center text-lg flex-shrink-0">🚋</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[#64748B] text-[15px] truncate">ÖV-Tageskarte</div>
              <div className="text-xs text-[#94A3B8]">02. Juni 2026 · Abgelaufen</div>
            </div>
            <span className="text-xs bg-[#F1F5F9] text-[#94A3B8] px-2 py-0.5 rounded-full font-semibold flex-shrink-0">Inaktiv</span>
          </div>
        </div>

        {/* Quick actions */}
        <h2 className="text-[17px] font-bold text-[#0F172A] mb-3">Schnellzugriff</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Ticket kaufen", emoji: "🎫", action: () => { setCitizenTab("mobility"); setMobilityScreen("ticketForm"); } },
            { label: "Mitfahrt suchen", emoji: "🚗", action: () => { setCitizenTab("mobility"); setMobilityScreen("carpooling"); } },
            { label: "Mängel melden", emoji: "🔧", action: () => setCitizenTab("report") },
            { label: "Mein Profil", emoji: "👤", action: () => setCitizenTab("profile") },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="bg-white border border-[#D1D5DB] rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm active:bg-[#ECFDF5] transition-colors min-h-[90px] justify-center"
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-sm font-semibold text-[#0F172A] text-center leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── HOME: TICKET DETAIL ──────────────────────────────────────────────────────
  function renderTicketDetail() {
    if (!selectedTicket) return null;
    return (
      <div className="px-5 pt-3 pb-8 flex flex-col items-center">
        <button onClick={() => setHomeScreen("dashboard")} className="flex items-center gap-2 text-[#64748B] mb-4 self-start h-10">
          <ArrowLeft size={20} /><span>Zurück</span>
        </button>

        <div className="w-8 h-8 bg-[#D1FAE5] rounded-full flex items-center justify-center mb-2">
          <CheckCircle size={18} className="text-[#10B981]" />
        </div>
        <h1 className="text-xl font-extrabold text-[#0F172A] mb-1">{selectedTicket.type}</h1>
        <p className="text-[#64748B] text-sm mb-5">Gültig am {selectedTicket.date}</p>

        <div className="w-full bg-white border-2 border-[#D1D5DB] rounded-2xl overflow-hidden shadow-lg mb-5">
          <div className="bg-[#0F172A] px-5 py-4 flex justify-between items-center">
            <div>
              <div className="text-white/40 text-xs">myMetroCity</div>
              <div className="text-white font-bold text-lg">{selectedTicket.type}</div>
            </div>
            <div className="text-right">
              <div className="text-white/40 text-xs">Gültig am</div>
              <div className="text-white font-semibold text-sm">{selectedTicket.date}</div>
            </div>
          </div>
          <div className="p-5 flex flex-col items-center">
            <div className="border-2 border-[#D1D5DB] rounded-xl p-3 mb-3 bg-white">
              <QRCode size={171} />
            </div>
            <div className="font-mono text-xs text-[#64748B] mb-2.5">{selectedTicket.code}</div>
            <div className="flex gap-2">
              <span className="bg-[#ECFDF5] text-[#10B981] text-xs font-semibold px-3 py-1 rounded-full">{selectedTicket.zone}</span>
              <span className="bg-[#ECFDF5] text-[#10B981] text-xs font-semibold px-3 py-1 rounded-full">
                {selectedTicket.persons} {selectedTicket.persons === 1 ? "Person" : "Personen"}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full space-y-3">
          <button className="w-full h-14 bg-[#ECFDF5] border-2 border-[#10B981] text-[#10B981] font-bold rounded-2xl flex items-center justify-center gap-2">
            <Mail size={20} />Ticket per E-Mail senden
          </button>
          <button
            onClick={() => setHomeScreen("dashboard")}
            className="w-full h-14 bg-[#0F172A] text-white font-bold rounded-2xl"
          >
            Zurück zu Home
          </button>
        </div>
      </div>
    );
  }

  // ── HOME: ALL TICKETS ────────────────────────────────────────────────────────
  function renderAllTickets() {
    return (
      <div className="px-5 pt-3 pb-6">
        <button onClick={() => setHomeScreen("dashboard")} className="flex items-center gap-2 text-[#64748B] mb-4 h-10">
          <ArrowLeft size={20} /><span>Zurück</span>
        </button>
        <h1 className="text-[26px] font-extrabold text-[#0F172A] mb-1">Alle Tickets</h1>
        <p className="text-[#64748B] text-sm mb-5">{activeTickets.length} aktiv · {TICKETS.length - activeTickets.length} abgelaufen</p>

        <p className="text-xs font-bold text-[#64748B] tracking-widest mb-2">AKTIV</p>
        <div className="space-y-2.5 mb-5">
          {TICKETS.filter((t) => t.active).map((t) => (
            <button
              key={t.id}
              onClick={() => { setSelectedTicketId(t.id); setHomeScreen("ticketDetail"); }}
              className="w-full bg-white rounded-xl px-4 py-3 border border-[#D1D5DB] flex items-center gap-3 shadow-sm active:border-[#10B981] transition-colors text-left"
            >
              <div className="w-10 h-10 bg-[#ECFDF5] rounded-xl flex items-center justify-center text-lg flex-shrink-0">{t.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[#0F172A] text-[15px] truncate">{t.type}</div>
                <div className="text-xs text-[#64748B]">{t.date}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="font-bold text-[#0F172A] text-sm">{t.price}</div>
                <ChevronRight size={16} className="text-[#10B981]" />
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs font-bold text-[#64748B] tracking-widest mb-2">ABGELAUFEN</p>
        <div className="space-y-2.5">
          {TICKETS.filter((t) => !t.active).map((t) => (
            <div
              key={t.id}
              className="w-full bg-[#F8FAFC] rounded-xl px-4 py-3 border border-[#D1D5DB] flex items-center gap-3 opacity-50"
            >
              <div className="w-10 h-10 bg-[#F1F5F9] rounded-xl flex items-center justify-center text-lg flex-shrink-0">{t.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[#64748B] text-[15px] truncate">{t.type}</div>
                <div className="text-xs text-[#94A3B8]">{t.date}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs bg-[#F1F5F9] text-[#94A3B8] px-2 py-0.5 rounded-full font-semibold">Inaktiv</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── HOME: NOTIFICATIONS ──────────────────────────────────────────────────────
  function renderNotifications() {
    return (
      <div className="px-5 pt-3 pb-6">
        <button onClick={() => setHomeScreen("dashboard")} className="flex items-center gap-2 text-[#64748B] mb-4 h-10">
          <ArrowLeft size={20} /><span>Zurück</span>
        </button>
        <h1 className="text-[26px] font-extrabold text-[#0F172A] mb-1">Benachrichtigungen</h1>
        <p className="text-[#64748B] text-sm mb-5">{unreadCount} ungelesen</p>

        <div className="space-y-3">
          {NOTIFICATIONS.map((n) => (
            <button
              key={n.id}
              onClick={() => { setSelectedNotifId(n.id); setHomeScreen("notificationDetail"); }}
              className={`w-full rounded-2xl p-4 text-left border transition-colors active:border-[#10B981] ${
                n.read ? "bg-white border-[#D1D5DB]" : "bg-[#ECFDF5] border-[#10B981]/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  n.type === "report" ? "bg-orange-100 text-orange-500" : "bg-[#D1FAE5] text-[#10B981]"
                }`}>
                  {n.type === "report" ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className={`font-semibold text-[#0F172A] text-sm truncate ${!n.read ? "font-bold" : ""}`}>{n.title}</div>
                    {!n.read && <div className="w-2 h-2 bg-[#10B981] rounded-full flex-shrink-0" />}
                  </div>
                  <div className="text-xs text-[#64748B] line-clamp-2 mb-1">{n.body}</div>
                  <div className="text-xs text-[#94A3B8]">{n.time}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── HOME: NOTIFICATION DETAIL ────────────────────────────────────────────────
  function renderNotificationDetail() {
    if (!selectedNotif) return null;
    return (
      <div className="px-5 pt-3 pb-6">
        <button onClick={() => setHomeScreen("notifications")} className="flex items-center gap-2 text-[#64748B] mb-4 h-10">
          <ArrowLeft size={20} /><span>Benachrichtigungen</span>
        </button>

        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
          selectedNotif.type === "report" ? "bg-orange-100" : "bg-[#D1FAE5]"
        }`}>
          {selectedNotif.type === "report"
            ? <AlertTriangle size={26} className="text-orange-500" />
            : <CheckCircle size={26} className="text-[#10B981]" />}
        </div>

        <h1 className="text-xl font-extrabold text-[#0F172A] mb-1">{selectedNotif.title}</h1>
        <p className="text-xs text-[#94A3B8] mb-5">{selectedNotif.time}</p>

        <div className="bg-white border border-[#D1D5DB] rounded-2xl p-5 mb-5 shadow-sm">
          <p className="text-[#0F172A] text-base leading-relaxed">{selectedNotif.detail}</p>
        </div>

        {selectedNotif.type === "report" && (
          <div className="bg-[#ECFDF5] border border-[#10B981]/20 rounded-2xl p-4 mb-5">
            <p className="text-xs font-bold text-[#64748B] tracking-widest mb-3">STATUS</p>
            <div className="space-y-3">
              {[
                { label: "Meldung eingegangen", done: true },
                { label: "Techniker zugewiesen", done: true },
                { label: "Behebung in Arbeit", done: selectedNotif.title.includes("behoben") },
                { label: "Abgeschlossen", done: selectedNotif.title.includes("behoben") },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.done ? "bg-[#10B981]" : "bg-[#D1D5DB]"
                  }`}>
                    {step.done && <CheckCircle size={13} className="text-white" />}
                  </div>
                  <span className={`text-sm font-semibold ${step.done ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setHomeScreen("dashboard")}
          className="w-full h-14 bg-[#0F172A] text-white font-bold rounded-2xl"
        >
          Zurück zu Home
        </button>
      </div>
    );
  }

  // ── MOBILITY: HUB ───────────────────────────────────────────────────────────
  function renderMobilityHub() {
    return (
      <div className="px-5 pt-3 pb-6">
        <h1 className="text-[26px] font-extrabold text-[#0F172A] mb-1">Mobilität</h1>
        <p className="text-[#64748B] text-sm mb-6">Tickets & Carpooling · myMetroCity</p>
        <div className="space-y-4">
          {[
            { label: "ÖV-Tageskarte kaufen", sub: "Ab CHF 12.00 pro Person · Zonen 1–9", icon: <Train size={26} />, action: () => setMobilityScreen("ticketForm"), primary: true },
            { label: "Mitfahrt anbieten", sub: "Punkte sammeln & CO₂ sparen", icon: <Car size={26} />, action: () => setMobilityScreen("offerRide"), primary: false },
            { label: "Mitfahrt suchen", sub: "Verfügbare Fahrten in der Nähe", icon: <Search size={26} />, action: () => setMobilityScreen("carpooling"), primary: false },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all active:scale-[0.98] ${
                item.primary ? "bg-[#0F172A] shadow-lg" : "bg-white border-2 border-[#D1D5DB] shadow-sm"
              }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                item.primary ? "bg-[#10B981] text-white" : "bg-[#ECFDF5] text-[#10B981]"
              }`}>
                {item.icon}
              </div>
              <div className="flex-1 text-left">
                <div className={`font-bold text-lg leading-snug ${item.primary ? "text-white" : "text-[#0F172A]"}`}>{item.label}</div>
                <div className={`text-sm mt-0.5 ${item.primary ? "text-white/60" : "text-[#64748B]"}`}>{item.sub}</div>
              </div>
              <ChevronRight size={20} className={item.primary ? "text-white/40" : "text-[#D1D5DB]"} />
            </button>
          ))}
        </div>
        <div className="mt-6 bg-[#ECFDF5] border border-[#D1FAE5] rounded-2xl p-4 flex items-center gap-3">
          <Trophy size={22} className="text-[#10B981] flex-shrink-0" />
          <div>
            <div className="font-semibold text-[#0F172A] text-sm">Mein Punktestand</div>
            <div className="text-[#10B981] font-bold">1'248 Punkte · Level 4</div>
          </div>
        </div>
      </div>
    );
  }

  // ── MOBILITY: OFFER RIDE ─────────────────────────────────────────────────────
  function renderOfferRide() {
    return (
      <div className="px-5 pt-3 pb-8">
        <button onClick={() => setMobilityScreen("hub")} className="flex items-center gap-2 text-[#64748B] mb-4 h-10">
          <ArrowLeft size={20} /><span>Zurück</span>
        </button>
        <h1 className="text-[26px] font-extrabold text-[#0F172A] mb-1">Mitfahrt anbieten</h1>
        <p className="text-[#64748B] text-sm mb-5">CO₂ sparen und Punkte sammeln</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-2">Von (Startort)</label>
            <div className="h-14 px-4 rounded-xl border-2 border-[#D1D5DB] bg-white flex items-center gap-2 focus-within:border-[#10B981] transition-colors">
              <MapPin size={18} className="text-[#10B981] flex-shrink-0" />
              <input type="text" placeholder="z.B. Zürich HB" className="flex-1 bg-transparent text-[#0F172A] text-base outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-2">Bis (Zielort)</label>
            <div className="h-14 px-4 rounded-xl border-2 border-[#D1D5DB] bg-white flex items-center gap-2 focus-within:border-[#10B981] transition-colors">
              <MapPin size={18} className="text-[#64748B] flex-shrink-0" />
              <input type="text" placeholder="z.B. Winterthur Bahnhof" className="flex-1 bg-transparent text-[#0F172A] text-base outline-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-bold text-[#0F172A] mb-2">Datum</label>
              <input
                type="date"
                defaultValue="2026-06-20"
                className="w-full h-14 px-4 rounded-xl border-2 border-[#D1D5DB] bg-white focus:border-[#10B981] focus:outline-none text-[#0F172A] text-sm transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-[#0F172A] mb-2">Zeit</label>
              <div className="h-14 px-4 rounded-xl border-2 border-[#D1D5DB] bg-white flex items-center gap-2 focus-within:border-[#10B981] transition-colors">
                <Clock size={16} className="text-[#64748B] flex-shrink-0" />
                <input type="time" defaultValue="07:30" className="flex-1 bg-transparent text-[#0F172A] text-sm outline-none" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-2">Preis pro Person (CHF)</label>
            <div className="h-14 px-4 rounded-xl border-2 border-[#D1D5DB] bg-white flex items-center gap-2 focus-within:border-[#10B981] transition-colors">
              <span className="text-[#64748B] font-semibold">CHF</span>
              <input type="number" placeholder="8" min="1" max="99" className="flex-1 bg-transparent text-[#0F172A] text-base outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-2">Freie Plätze</label>
            <div className="relative">
              <select className="w-full h-14 px-4 pr-10 rounded-xl border-2 border-[#D1D5DB] bg-white text-[#0F172A] appearance-none focus:border-[#10B981] focus:outline-none text-base">
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? "Platz" : "Plätze"}</option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-2">Beschreibung (optional)</label>
            <textarea
              rows={3}
              placeholder="z.B. Kofferraum vorhanden, Haustiere erlaubt, Nichtraucherfahrzeug..."
              className="w-full px-4 py-3 rounded-xl border-2 border-[#D1D5DB] bg-white text-[#0F172A] text-base focus:border-[#10B981] focus:outline-none resize-none transition-colors"
            />
          </div>
        </div>

        <div className="mt-5 bg-[#ECFDF5] border border-[#10B981]/25 rounded-2xl p-4 flex items-center gap-3">
          <Trophy size={20} className="text-[#10B981] flex-shrink-0" />
          <div className="text-sm text-[#0F172A]">
            <span className="font-bold">+50 Punkte</span> für das Anbieten dieser Fahrt
          </div>
        </div>

        <button
          onClick={() => setMobilityScreen("offerSuccess")}
          className="w-full mt-4 h-16 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-lg rounded-2xl transition-colors shadow-lg"
        >
          Fahrt anbieten
        </button>
      </div>
    );
  }

  // ── MOBILITY: OFFER SUCCESS ──────────────────────────────────────────────────
  function renderOfferSuccess() {
    return (
      <div className="px-5 pt-10 pb-8 flex flex-col items-center">
        <div className="w-20 h-20 bg-[#D1FAE5] rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={44} className="text-[#10B981]" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] mb-2 text-center">Fahrt erfolgreich inseriert!</h1>
        <p className="text-[#64748B] text-sm mb-6 text-center">Ihre Mitfahrt ist jetzt sichtbar. Sie werden benachrichtigt, sobald sich jemand anmeldet.</p>
        <div className="w-full bg-[#ECFDF5] border border-[#10B981]/25 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={18} className="text-[#10B981]" />
            <span className="font-bold text-[#0F172A]">+50 Punkte erhalten!</span>
          </div>
          <div className="text-sm text-[#64748B]">Neuer Punktestand: 1'298 Punkte</div>
        </div>
        <button onClick={() => { setCitizenTab("home"); setMobilityScreen("hub"); }} className="w-full h-14 bg-[#0F172A] text-white font-bold rounded-2xl">
          Zurück zu Home
        </button>
      </div>
    );
  }

  // ── MOBILITY: TICKET FORM ────────────────────────────────────────────────────
  function renderTicketForm() {
    return (
      <div className="px-5 pt-3 pb-6">
        <button onClick={() => setMobilityScreen("hub")} className="flex items-center gap-2 text-[#64748B] mb-4 h-10">
          <ArrowLeft size={20} /><span>Zurück</span>
        </button>
        <h1 className="text-[26px] font-extrabold text-[#0F172A] mb-1">Tageskarte kaufen</h1>
        <p className="text-[#64748B] text-sm mb-5">ÖV Zonen 1–9 · Ganzer Tag gültig</p>
        <div className="space-y-4">
          {[{ label: "Vorname", val: "Anna" }, { label: "Name", val: "Müller" }].map((f) => (
            <div key={f.label}>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">{f.label}</label>
              <input type="text" defaultValue={f.val} className="w-full h-14 px-4 rounded-xl border-2 border-[#D1D5DB] bg-white focus:border-[#10B981] focus:outline-none text-[#0F172A] text-base transition-colors" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-2">Datum</label>
            <input type="date" value={ticketDate} onChange={(e) => setTicketDate(e.target.value)} className="w-full h-14 px-4 rounded-xl border-2 border-[#D1D5DB] bg-white focus:border-[#10B981] focus:outline-none text-[#0F172A] text-base transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-2">Anzahl Personen</label>
            <div className="flex items-center gap-3 h-14 px-4 rounded-xl border-2 border-[#D1D5DB] bg-white">
              <button onClick={() => setPersons(Math.max(1, persons - 1))} className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                <Minus size={16} className="text-[#0F172A]" />
              </button>
              <span className="flex-1 text-center text-xl font-bold text-[#0F172A]">{persons}</span>
              <button onClick={() => setPersons(Math.min(9, persons + 1))} className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                <Plus size={16} className="text-[#0F172A]" />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-5 bg-[#ECFDF5] border border-[#10B981]/25 rounded-2xl p-5">
          <div className="flex justify-between text-sm text-[#64748B] mb-2">
            <span>CHF 12.00 × {persons} {persons === 1 ? "Person" : "Personen"}</span>
            <span>CHF {totalPrice}</span>
          </div>
          <div className="border-t border-[#10B981]/20 pt-2.5 flex justify-between items-center">
            <span className="font-bold text-[#0F172A] text-base">Total</span>
            <span className="font-extrabold text-[#0F172A] text-2xl">CHF {totalPrice}</span>
          </div>
        </div>
        <button onClick={() => setMobilityScreen("payment")} className="w-full mt-4 h-16 bg-[#10B981] text-white font-bold text-lg rounded-2xl shadow-lg">
          Weiter zur Zahlung
        </button>
      </div>
    );
  }

  // ── MOBILITY: PAYMENT ────────────────────────────────────────────────────────
  function renderPayment() {
    return (
      <div className="px-5 pt-3 pb-6">
        <button onClick={() => setMobilityScreen("ticketForm")} className="flex items-center gap-2 text-[#64748B] mb-4 h-10">
          <ArrowLeft size={20} /><span>Zurück</span>
        </button>
        <h1 className="text-[26px] font-extrabold text-[#0F172A] mb-5">Bezahlen</h1>
        <div className="bg-white border border-[#D1D5DB] rounded-2xl p-5 mb-5 shadow-sm">
          <p className="text-xs font-bold text-[#64748B] tracking-widest mb-3">BESTELLÜBERSICHT</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-[#ECFDF5] rounded-xl flex items-center justify-center text-xl flex-shrink-0">🎫</div>
            <div className="flex-1">
              <div className="font-semibold text-[#0F172A]">ÖV-Tageskarte</div>
              <div className="text-sm text-[#64748B]">{persons} {persons === 1 ? "Person" : "Personen"} · {ticketDate}</div>
            </div>
            <span className="font-bold text-[#0F172A]">CHF {totalPrice}</span>
          </div>
          <div className="border-t border-[#D1D5DB] pt-3 flex justify-between items-center">
            <span className="font-bold text-[#0F172A]">Total</span>
            <span className="font-extrabold text-[#10B981] text-2xl">CHF {totalPrice}</span>
          </div>
        </div>
        <p className="font-bold text-[#0F172A] mb-3">Zahlungsmethode</p>
        <div className="space-y-3 mb-5">
          {[
            { id: "card", label: "Kreditkarte", sub: "Visa, Mastercard, Amex", icon: <CreditCard size={22} /> },
            { id: "twint", label: "TWINT", sub: "Schweizer Mobile-Payment", icon: <Smartphone size={22} /> },
          ].map((m) => (
            <button key={m.id} onClick={() => setSelectedPayment(m.id as "card" | "twint")}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${selectedPayment === m.id ? "border-[#10B981] bg-[#ECFDF5]" : "border-[#D1D5DB] bg-white"}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedPayment === m.id ? "bg-[#10B981] text-white" : "bg-[#F1F5F9] text-[#64748B]"}`}>{m.icon}</div>
              <div className="flex-1 text-left">
                <div className="font-bold text-[#0F172A]">{m.label}</div>
                <div className="text-sm text-[#64748B]">{m.sub}</div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPayment === m.id ? "border-[#10B981] bg-[#10B981]" : "border-[#D1D5DB]"}`}>
                {selectedPayment === m.id && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
            </button>
          ))}
        </div>
        <button onClick={() => setMobilityScreen("success")} className="w-full h-16 bg-[#10B981] text-white font-bold text-xl rounded-2xl shadow-lg">
          Jetzt Bezahlen
        </button>
        <div className="flex items-center justify-center gap-1.5 mt-3 text-[#64748B] text-xs">
          <Shield size={13} /><span>256-Bit SSL Verschlüsselung</span>
        </div>
      </div>
    );
  }

  // ── MOBILITY: TICKET SUCCESS ─────────────────────────────────────────────────
  function renderTicketSuccess() {
    return (
      <div className="px-5 pt-4 pb-8 flex flex-col items-center">
        <div className="w-20 h-20 bg-[#D1FAE5] rounded-full flex items-center justify-center mb-3">
          <CheckCircle size={44} className="text-[#10B981]" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] mb-1">Zahlung erfolgreich!</h1>
        <p className="text-[#64748B] text-sm mb-5 text-center">QR-Code beim Einsteigen vorzeigen.</p>
        <div className="w-full bg-white border-2 border-[#D1D5DB] rounded-2xl overflow-hidden shadow-lg mb-5">
          <div className="bg-[#0F172A] px-5 py-4 flex justify-between items-center">
            <div>
              <div className="text-white/40 text-xs">myMetroCity</div>
              <div className="text-white font-bold text-lg">ÖV-Tageskarte</div>
            </div>
            <div className="text-right">
              <div className="text-white/40 text-xs">Gültig am</div>
              <div className="text-white font-semibold text-sm">{ticketDate}</div>
            </div>
          </div>
          <div className="p-5 flex flex-col items-center">
            <div className="border-2 border-[#D1D5DB] rounded-xl p-3 mb-3 bg-white">
              <QRCode size={171} />
            </div>
            <div className="font-mono text-xs text-[#64748B] mb-2.5">MCY-2026-7842-4591</div>
            <div className="flex gap-2">
              <span className="bg-[#ECFDF5] text-[#10B981] text-xs font-semibold px-3 py-1 rounded-full">Zonen 1–9</span>
              <span className="bg-[#ECFDF5] text-[#10B981] text-xs font-semibold px-3 py-1 rounded-full">
                {persons} {persons === 1 ? "Person" : "Personen"}
              </span>
            </div>
          </div>
        </div>
        <div className="w-full space-y-3">
          <button className="w-full h-14 bg-[#ECFDF5] border-2 border-[#10B981] text-[#10B981] font-bold rounded-2xl flex items-center justify-center gap-2">
            <Mail size={20} />Ticket per E-Mail senden
          </button>
          <button onClick={() => { setCitizenTab("home"); setMobilityScreen("hub"); }} className="w-full h-14 bg-[#0F172A] text-white font-bold rounded-2xl">
            Zurück zu Home
          </button>
        </div>
      </div>
    );
  }

  // ── MOBILITY: CARPOOLING ─────────────────────────────────────────────────────
  function renderCarpooling() {
    return (
      <div className="pb-4">
        <div className="px-5 pt-3 pb-4">
          <button onClick={() => setMobilityScreen("hub")} className="flex items-center gap-2 text-[#64748B] mb-3 h-10">
            <ArrowLeft size={20} /><span>Zurück</span>
          </button>
          <h1 className="text-[26px] font-extrabold text-[#0F172A] mb-4">Mitfahrt suchen</h1>
          <div className="space-y-2 mb-3">
            <div className="flex gap-2">
              {["Zürich HB", "Winterthur"].map((v, i) => (
                <div key={i} className="flex-1 h-12 bg-white border-2 border-[#D1D5DB] rounded-xl px-3 flex items-center gap-2">
                  <MapPin size={15} className={i === 0 ? "text-[#10B981]" : "text-[#64748B]"} />
                  <span className="text-[#0F172A] text-sm truncate">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-12 bg-white border-2 border-[#D1D5DB] rounded-xl px-3 flex items-center gap-2">
                <Clock size={15} className="text-[#64748B]" /><span className="text-[#0F172A] text-sm">07:00 Uhr</span>
              </div>
              <div className="flex-1 h-12 bg-white border-2 border-[#D1D5DB] rounded-xl px-3 flex items-center">
                <span className="text-[#0F172A] text-sm">20. Juni 2026</span>
              </div>
            </div>
            <button className="w-full h-12 bg-[#10B981] text-white font-semibold rounded-xl flex items-center justify-center gap-2">
              <Search size={16} />Suchen
            </button>
          </div>
        </div>
        <div className="px-5">
          <p className="text-sm font-bold text-[#0F172A] mb-3">{RIDES.length} Fahrten gefunden</p>
          <div className="space-y-3">
            {RIDES.map((ride) => (
              <button key={ride.id} onClick={() => setCarpoolModalId(ride.id)}
                className="w-full bg-white border border-[#D1D5DB] rounded-2xl p-4 text-left shadow-sm active:border-[#10B981] transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-[#0F172A] rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{ride.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[#0F172A]">{ride.driver}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <StarRow rating={ride.rating} size={11} />
                      <span className="text-xs text-[#64748B] ml-1">{ride.rating} ({ride.reviews})</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-extrabold text-[#0F172A] text-lg">{ride.time}</div>
                    <div className="text-[#10B981] font-bold text-sm">CHF {ride.price}.–</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                  <div className="w-2 h-2 bg-[#10B981] rounded-full flex-shrink-0" />
                  <span>{ride.from}</span>
                  <div className="flex-1 border-t border-dashed border-[#D1D5DB]" />
                  <span>{ride.to}</span>
                  <div className="w-2 h-2 bg-[#0F172A] rounded-full flex-shrink-0" />
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-[#64748B]">
                  <Users size={12} /><span>{ride.seats} freie {ride.seats === 1 ? "Platz" : "Plätze"}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── REPORT ───────────────────────────────────────────────────────────────────
  function renderReportForm() {
    const canSubmit = reportPhotoUploaded;
    return (
      <div className="px-5 pt-3 pb-6">
        <h1 className="text-[26px] font-extrabold text-[#0F172A] mb-1">Mangel melden</h1>
        <p className="text-[#64748B] text-sm mb-5">Defekte & Schäden in myMetroCity melden</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-2">Kategorie</label>
            <div className="relative">
              <select className="w-full h-14 px-4 pr-10 rounded-xl border-2 border-[#D1D5DB] bg-white text-[#0F172A] appearance-none focus:border-[#10B981] focus:outline-none text-base">
                <option>Strassenlampe defekt</option>
                <option>Schlagloch</option>
                <option>Vandalismus</option>
                <option>Ampelstörung</option>
                <option>Sonstiges</option>
              </select>
              <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-2">Standort</label>
            <div className="h-14 px-4 rounded-xl border-2 border-[#D1D5DB] bg-white flex items-center gap-2">
              <MapPin size={18} className="text-[#10B981]" />
              <input type="text" placeholder="Adresse oder GPS-Standort" className="flex-1 bg-transparent text-[#0F172A] text-base outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-2">Beschreibung</label>
            <textarea rows={3} placeholder="Beschreiben Sie den Mangel..." className="w-full px-4 py-3 rounded-xl border-2 border-[#D1D5DB] bg-white text-[#0F172A] text-base focus:border-[#10B981] focus:outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-2">
              Foto-Nachweis <span className="text-red-500">*</span> <span className="text-[#64748B] font-normal">(obligatorisch)</span>
            </label>
            <button
              onClick={() => setReportPhotoUploaded(!reportPhotoUploaded)}
              className={`w-full h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
                reportPhotoUploaded ? "border-[#10B981] bg-[#ECFDF5]" : "border-[#D1D5DB] bg-[#F8FAFC]"
              }`}
            >
              {reportPhotoUploaded ? (
                <>
                  <div className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center">
                    <CheckCircle size={24} className="text-white" />
                  </div>
                  <span className="text-[#10B981] font-semibold text-sm">Foto hochgeladen</span>
                  <span className="text-xs text-[#64748B]">Tippen zum Ändern</span>
                </>
              ) : (
                <>
                  <Camera size={30} className="text-[#D1D5DB]" />
                  <span className="text-sm font-semibold text-[#64748B]">Foto aufnehmen oder hochladen</span>
                  <span className="text-xs text-red-400">Foto ist zwingend erforderlich</span>
                </>
              )}
            </button>
          </div>
        </div>
        <button
          disabled={!canSubmit}
          onClick={() => setReportScreen("success")}
          className={`w-full mt-5 h-16 font-bold text-lg rounded-2xl transition-all ${
            canSubmit ? "bg-[#10B981] text-white shadow-lg" : "bg-[#D1D5DB] text-[#94A3B8] cursor-not-allowed"
          }`}
        >
          {canSubmit ? "Meldung abschicken" : "Foto erforderlich"}
        </button>
      </div>
    );
  }

  function renderReportSuccess() {
    return (
      <div className="px-5 pt-10 pb-8 flex flex-col items-center">
        <div className="w-20 h-20 bg-[#D1FAE5] rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={44} className="text-[#10B981]" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] mb-2 text-center">Meldung abgeschickt!</h1>
        <p className="text-[#64748B] text-base text-center mb-6 leading-relaxed">
          Ihre Anfrage wird bearbeitet. Sie erhalten Benachrichtigungen über den aktuellen Stand Ihrer Meldung.
        </p>

        <div className="w-full bg-[#ECFDF5] border border-[#10B981]/25 rounded-2xl p-5 mb-5">
          <p className="text-xs font-bold text-[#64748B] tracking-widest mb-4">AKTUELLER STATUS</p>
          <div className="space-y-3">
            {[
              { label: "Meldung eingegangen", done: true },
              { label: "Wird geprüft", done: false },
              { label: "Techniker zugewiesen", done: false },
              { label: "Behoben", done: false },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? "bg-[#10B981]" : "bg-[#D1D5DB]"}`}>
                  {step.done && <CheckCircle size={13} className="text-white" />}
                </div>
                <span className={`text-sm font-semibold ${step.done ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full bg-white border border-[#D1D5DB] rounded-2xl p-4 mb-6 flex items-start gap-3 shadow-sm">
          <Bell size={18} className="text-[#10B981] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#64748B]">
            Sie werden per <strong className="text-[#0F172A]">Push-Benachrichtigung</strong> über jeden Statuswechsel informiert.
          </p>
        </div>

        <button
          onClick={() => { setCitizenTab("home"); setReportScreen("form"); setReportPhotoUploaded(false); }}
          className="w-full h-14 bg-[#0F172A] text-white font-bold rounded-2xl"
        >
          Zurück zu Home
        </button>
      </div>
    );
  }

  // ── PROFILE ──────────────────────────────────────────────────────────────────
  function renderProfile() {
    return (
      <div className="pb-6">
        <div className="bg-[#0F172A] px-5 pt-5 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-[#10B981] rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl flex-shrink-0">AM</div>
            <div>
              <div className="text-white font-bold text-xl">Anna Müller</div>
              <div className="text-white/50 text-sm">anna.mueller@email.ch</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-[#10B981] text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Trophy size={11} />Level 4</span>
                <span className="text-[#10B981] text-sm font-semibold">1'248 Punkte</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex border-b border-[#D1D5DB] bg-white sticky top-0 z-10">
          {[{ id: "account", label: "Account Infos" }, { id: "reviews", label: "Bewertungen" }].map((tab) => (
            <button key={tab.id} onClick={() => setProfileTab(tab.id as "account" | "reviews")}
              className={`flex-1 py-4 text-base font-semibold border-b-2 transition-colors ${profileTab === tab.id ? "border-[#10B981] text-[#10B981]" : "border-transparent text-[#64748B]"}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="px-5 pt-4">
          {profileTab === "account" ? (
            <div className="space-y-3">
              {[
                { icon: <Mail size={20} />, label: "E-Mail", val: "anna.mueller@email.ch" },
                { icon: <Phone size={20} />, label: "Telefon", val: "+41 79 123 45 67" },
                { icon: <Shield size={20} />, label: "Datenschutz", val: "Einstellungen" },
                { icon: <Settings size={20} />, label: "Kontoeinstellungen", val: "Verwalten" },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-[#D1D5DB] rounded-xl p-4 flex items-center gap-3 shadow-sm">
                  <div className="w-11 h-11 bg-[#ECFDF5] rounded-xl flex items-center justify-center text-[#10B981] flex-shrink-0">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[#64748B]">{item.label}</div>
                    <div className="font-semibold text-[#0F172A] truncate">{item.val}</div>
                  </div>
                  <ChevronRight size={18} className="text-[#D1D5DB] flex-shrink-0" />
                </div>
              ))}
              <button
                onClick={() => {
                  if (isDesktop) {
                    openAdminPanel();
                    setCitizenTab("profile");
                  } else {
                    setAdminMode(true);
                    setSuccessNotice(null);
                  }
                }}
                className="w-full mt-2 h-14 bg-[#0F172A] text-white font-bold rounded-2xl flex items-center justify-center gap-2"
              >
                <Shield size={18} />
                Admin Panel öffnen
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { name: "Marco B.", rating: 5, comment: "Sehr pünktlich und angenehme Fahrt. Gerne wieder!" },
                { name: "Lisa W.", rating: 4, comment: "Nettes Gespräch, sauberes Auto. Sehr empfehlenswert." },
                { name: "Thomas M.", rating: 5, comment: "Top Mitfahrerin, absolut zuverlässig." },
              ].map((r, i) => (
                <div key={i} className="bg-white border border-[#D1D5DB] rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-9 h-9 bg-[#0F172A] rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {r.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="font-semibold text-[#0F172A] text-sm">{r.name}</div>
                      <StarRow rating={r.rating} size={11} />
                    </div>
                  </div>
                  <p className="text-sm text-[#64748B]">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderAdminUnavailable() {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-6 py-12 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-[#ECFDF5] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Smartphone size={28} className="text-[#10B981]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#0F172A] mb-2">Admin Panel</h2>
          <p className="text-[#64748B] leading-relaxed">Die Admin Panel ist nur auf der Desktop-Version verfügbar.</p>
        </div>
      </div>
    );
  }

  function renderAdminPanel() {
    const visibleDefects = filteredDefects;
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="flex h-screen">
          <aside className="w-72 bg-white border-r border-[#E2E8F0] p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-[#64748B]">myMetroCity</p>
                <h2 className="text-xl font-extrabold text-[#0F172A]">Admin</h2>
              </div>
              <button onClick={() => { setAdminMode(false); setCitizenTab("profile"); }} className="text-[#64748B] text-sm">Zurück</button>
            </div>
            <button onClick={() => setAdminTab("defects")} className={`text-left px-4 py-3 rounded-2xl font-semibold ${adminTab === "defects" ? "bg-[#ECFDF5] text-[#10B981]" : "text-[#0F172A] hover:bg-slate-50"}`}>
              1. Mängel
            </button>
            <button onClick={() => setAdminTab("team")} className={`text-left px-4 py-3 rounded-2xl font-semibold ${adminTab === "team" ? "bg-[#ECFDF5] text-[#10B981]" : "text-[#0F172A] hover:bg-slate-50"}`}>
              2. Wartungsteam
            </button>
          </aside>
          <main className="flex-1 p-6 overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-[#64748B]">Übersicht</p>
                <h3 className="text-2xl font-extrabold text-[#0F172A]">{adminTab === "defects" ? "Mängel" : "Wartungsteam"}</h3>
              </div>
              {successNotice && (
                <div className="bg-[#ECFDF5] text-[#10B981] px-4 py-2 rounded-xl text-sm font-semibold">{successNotice}</div>
              )}
            </div>
            {adminTab === "defects" ? (
              <div className="grid grid-cols-[340px_1fr] gap-6">
                <section className="bg-white rounded-3xl border border-[#E2E8F0] p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Search size={18} className="text-[#64748B]" />
                    <input value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} placeholder="Suche nach Ort oder Kategorie" className="w-full bg-transparent outline-none text-sm text-[#0F172A] placeholder:text-[#94A3B8]" />
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(["all", "new", "approved", "pending", "in-progress", "rejected", "completed"] as const).map((filter) => (
                      <button key={filter} onClick={() => setAdminFilter(filter)} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${adminFilter === filter ? "bg-[#0F172A] text-white" : "bg-[#F8FAFC] text-[#64748B]"}`}>
                        {filter === "all" ? "Alle" : filter}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
                    {visibleDefects.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-6 text-center text-sm text-[#64748B]">
                        Keine Meldungen passen zu den aktuellen Filtern.
                      </div>
                    ) : (
                      visibleDefects.map((d) => (
                        <button key={d.id} onClick={() => setSelectedAdminDefectId(d.id)} className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedAdminDefectId === d.id ? "border-[#10B981] bg-[#ECFDF5] shadow-sm" : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1]"}`}>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-bold text-[#0F172A]">{d.label}</span>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${getStatusPillClass(d.status)}`}>{getStatusLabel(d.status)}</span>
                          </div>
                          <div className="text-sm text-[#64748B]">{d.address}</div>
                          <div className="text-xs text-[#94A3B8] mt-1">{d.time} · {d.category}</div>
                        </button>
                      ))
                    )}
                  </div>
                </section>
                <section className="bg-white rounded-3xl border border-[#E2E8F0] p-6 relative overflow-hidden">
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {[
                      { label: "Neu", value: adminCounts.new, tone: "bg-red-50 text-red-600" },
                      { label: "Angenommen", value: adminCounts.approved, tone: "bg-blue-50 text-blue-600" },
                      { label: "Wartung", value: adminCounts["in-progress"], tone: "bg-[#ECFDF5] text-[#10B981]" },
                      { label: "Abgelehnt", value: adminCounts.rejected, tone: "bg-gray-50 text-gray-600" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl bg-[#F8FAFC] p-4">
                        <div className={`text-xs font-bold px-2 py-1 rounded-full inline-flex ${item.tone}`}>{item.label}</div>
                        <div className="text-3xl font-extrabold text-[#0F172A] mt-2">{item.value}</div>
                      </div>
                    ))}
                  </div>
                  {selectedAdminDefect ? (
                    <div className="grid grid-cols-[1.2fr_0.8fr] gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusPillClass(selectedAdminDefect.status)}`}>{getStatusLabel(selectedAdminDefect.status)}</span>
                          <span className="text-xs text-[#64748B]">#{selectedAdminDefect.id}</span>
                        </div>
                        <h4 className="text-2xl font-extrabold text-[#0F172A] mb-2">{selectedAdminDefect.label}</h4>
                        <p className="text-[#64748B] mb-4">{selectedAdminDefect.address}</p>
                        <div className="bg-[#F8FAFC] rounded-2xl p-4 mb-4">
                          <div className="text-sm text-[#64748B] mb-2">Beschreibung</div>
                          <p className="text-[#0F172A] leading-relaxed">{selectedAdminDefect.detail}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3"><div className="text-xs text-[#64748B]">Kategorie</div><div className="font-semibold text-[#0F172A]">{selectedAdminDefect.category}</div></div>
                          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3"><div className="text-xs text-[#64748B]">Priorität</div><div className="font-semibold text-[#0F172A]">{selectedAdminDefect.priority}</div></div>
                          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3"><div className="text-xs text-[#64748B]">Meldender</div><div className="font-semibold text-[#0F172A]">{selectedAdminDefect.reporter}</div></div>
                          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3"><div className="text-xs text-[#64748B]">Team</div><div className="font-semibold text-[#0F172A]">{selectedAdminDefect.team}</div></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <button onClick={() => updateDefectStatus(selectedAdminDefect.id, "pending")} className="w-full h-14 bg-[#10B981] text-white font-bold rounded-2xl">Annehmen</button>
                        <button onClick={() => { setAdminTab("team"); setAdminView("map"); setSelectedAdminDefectId(selectedAdminDefect.id); setSuccessNotice(null); }} className="w-full h-14 bg-[#0F172A] text-white font-bold rounded-2xl">Auf Karte anzeigen</button>
                        {selectedAdminDefect.status === "in-progress" && (
                          <button onClick={() => updateDefectStatus(selectedAdminDefect.id, "completed")} className="w-full h-14 bg-[#0F172A] text-white font-bold rounded-2xl">Als erledigt markieren</button>
                        )}
                        <div className="bg-[#F8FAFC] rounded-2xl p-4">
                          <label className="block text-xs text-[#64748B] mb-2">Ablehnungsgrund</label>
                          <select value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="w-full rounded-xl border border-[#D1D5DB] px-3 py-2 text-sm text-[#0F172A] bg-white">
                            {REJECTION_REASONS.map((reason) => <option key={reason} value={reason}>{reason}</option>)}
                          </select>
                        </div>
                        <button onClick={() => updateDefectStatus(selectedAdminDefect.id, "rejected", rejectionReason)} className="w-full h-14 bg-white border border-[#D1D5DB] text-[#0F172A] font-bold rounded-2xl">Ablehnen</button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[#64748B]">Bitte wählen Sie eine Meldung aus.</div>
                  )}
                </section>
              </div>
            ) : (
              <div className="grid grid-cols-[320px_1fr_280px] gap-6 h-[80vh]">
                <section className="bg-white rounded-3xl border border-[#E2E8F0] p-4 overflow-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-[#0F172A]">Aufträge</h4>
                    <span className="text-xs text-[#64748B]">{defects.filter((d) => d.status === "pending" || d.status === "in-progress").length} aktiv</span>
                  </div>
                  <div className="space-y-3">
                    {defects.filter((d) => d.status === "pending" || d.status === "in-progress").map((d) => (
                      <button key={d.id} onClick={() => setSelectedAdminDefectId(d.id)} className={`w-full text-left p-3 rounded-2xl border ${selectedAdminDefectId === d.id ? "border-[#10B981] bg-[#ECFDF5]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`}>
                        <div className="font-semibold text-[#0F172A] text-sm">{d.label}</div>
                        <div className="text-xs text-[#64748B] mt-1">{d.address}</div>
                        <div className="text-xs text-[#10B981] font-semibold mt-2">{d.status === "pending" ? "Wartet auf Team" : "In Bearbeitung"}</div>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="bg-white rounded-3xl border border-[#E2E8F0] p-4 overflow-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-[#64748B]">Ansicht</p>
                      <h4 className="font-bold text-[#0F172A]">{adminView === "map" ? "Karte" : "Tabelle"}</h4>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setAdminView("map")} className={`px-3 py-2 rounded-xl text-sm font-semibold ${adminView === "map" ? "bg-[#0F172A] text-white" : "bg-[#F8FAFC] text-[#64748B]"}`}>Map</button>
                      <button onClick={() => setAdminView("table")} className={`px-3 py-2 rounded-xl text-sm font-semibold ${adminView === "table" ? "bg-[#0F172A] text-white" : "bg-[#F8FAFC] text-[#64748B]"}`}>Tabelle</button>
                    </div>
                  </div>
                  {adminView === "map" ? (
                    <div className="relative h-[68vh] rounded-3xl overflow-hidden bg-[#E2E8F0]">
                      <svg viewBox="0 0 600 500" className="absolute inset-0 w-full h-full">
                        <rect width="600" height="500" fill="#E2E8F0" />
                        <rect x="0" y="120" width="600" height="30" fill="#F8FAFC" />
                        <rect x="0" y="260" width="600" height="30" fill="#F8FAFC" />
                        <rect x="0" y="400" width="600" height="30" fill="#F8FAFC" />
                        <rect x="120" y="0" width="30" height="500" fill="#F8FAFC" />
                        <rect x="300" y="0" width="30" height="500" fill="#F8FAFC" />
                        <rect x="480" y="0" width="30" height="500" fill="#F8FAFC" />
                      </svg>
                      {defects.filter((d) => d.status !== "completed" && d.status !== "approved" && d.status !== "rejected").map((d) => (
                        <button key={d.id} onClick={() => setSelectedAdminDefectId(d.id)} className="absolute" style={{ left: d.x * 1.7, top: d.y * 1.2 }}>
                          <div className={`w-5 h-5 rounded-full border-2 border-white ${d.status === "new" ? "bg-red-500" : "bg-yellow-500"}`} />
                        </button>
                      ))}
                      {selectedAdminDefect && (
                        <div className="absolute inset-x-4 bottom-4 bg-white rounded-3xl border border-[#E2E8F0] shadow-xl p-4">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div>
                              <div className="text-xs text-[#64748B]">Ausgewählt</div>
                              <div className="font-bold text-[#0F172A]">{selectedAdminDefect.label}</div>
                            </div>
                            <button onClick={() => setSelectedAdminDefectId(null)} className="text-sm text-[#64748B]">Schließen</button>
                          </div>
                          <p className="text-sm text-[#64748B] mb-3">{selectedAdminDefect.address}</p>
                          <div className="flex gap-2">
                            {['Team 1', 'Team 2', 'Team 3'].map((team) => (
                              <button
                                key={team}
                                onClick={() => {
                                  setDefects((current) =>
                                    current.map((d) =>
                                      d.id === selectedAdminDefect.id
                                        ? { ...d, team, status: "in-progress" }
                                        : d
                                    )
                                  );
                                  setSuccessNotice(`Mangel wurde ${team} zugewiesen.`);
                                }}
                                className="flex-1 px-3 py-2 rounded-xl bg-[#F8FAFC] text-[#0F172A] text-sm font-semibold"
                              >
                                {team}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-[#64748B]">
                            <th className="pb-2">Mangel</th>
                            <th className="pb-2">Ort</th>
                            <th className="pb-2">Status</th>
                            <th className="pb-2">Team</th>
                          </tr>
                        </thead>
                        <tbody>
                          {defects.filter((d) => d.status === "pending" || d.status === "in-progress").map((d) => (
                            <tr key={d.id} className="border-t border-[#E2E8F0]">
                              <td className="py-3 font-semibold text-[#0F172A]">{d.label}</td>
                              <td className="py-3 text-[#64748B]">{d.address}</td>
                              <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${d.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-[#ECFDF5] text-[#10B981]"}`}>{d.status === "pending" ? "wartet" : "in Arbeit"}</span></td>
                              <td className="py-3 text-[#64748B]">{d.team}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
                <aside className="bg-white rounded-3xl border border-[#E2E8F0] p-4 overflow-auto">
                  <h4 className="font-bold text-[#0F172A] mb-4">Filter</h4>
                  <div className="space-y-2">
                    {(["all", "pending", "in-progress", "completed"] as const).map((filter) => (
                      <button key={filter} onClick={() => setAdminFilter(filter)} className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold ${adminFilter === filter ? "bg-[#0F172A] text-white" : "bg-[#F8FAFC] text-[#64748B]"}`}>{filter === "all" ? "Alle" : filter}</button>
                    ))}
                  </div>
                </aside>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  // ── MAINTENANCE: MAP ─────────────────────────────────────────────────────────
  function renderWorkerMap() {
    const availableTasks = defects.filter((d) => d.status === "new" || d.status === "pending" || d.status === "approved");
    const hasActiveTask = workerTaskId !== null;
    return (
      <div className="relative" style={{ height: "calc(100dvh - 80px)" }}>
        <svg viewBox="0 0 390 800" className="absolute inset-0">
          <rect width="390" height="800" fill="#CBD5E1" />
          <rect x="0" y="155" width="390" height="26" fill="#F9FAFB" />
          <rect x="0" y="335" width="390" height="26" fill="#F9FAFB" />
          <rect x="0" y="515" width="390" height="26" fill="#F9FAFB" />
          <rect x="0" y="680" width="390" height="26" fill="#F9FAFB" />
          <rect x="75" y="0" width="26" height="800" fill="#F9FAFB" />
          <rect x="195" y="0" width="26" height="800" fill="#F9FAFB" />
          <rect x="305" y="0" width="26" height="800" fill="#F9FAFB" />
          {[[0,0,65,145],[111,0,74,145],[231,0,64,145],[341,0,49,145],[0,191,65,134],[111,191,74,134],[231,191,64,134],[341,191,49,134],[0,371,65,134],[111,371,74,134],[231,371,64,134],[341,371,49,134],[0,551,65,119],[111,551,74,119],[231,551,64,119],[341,551,49,119],[0,716,65,84],[111,716,74,84],[231,716,64,84],[341,716,49,84]].map(([x,y,w,h],i)=>(
            <rect key={i} x={x} y={y} width={w} height={h} fill="#E2E8F0" rx="3"/>
          ))}
          <rect x="111" y="371" width="74" height="134" fill="#D1FAE5" rx="3"/>
          <text x="148" y="442" fill="#10B981" fontSize="11" textAnchor="middle" fontWeight="700">Park</text>
          <text x="4" y="151" fill="#94A3B8" fontSize="9">Hauptstrasse</text>
          <text x="4" y="331" fill="#94A3B8" fontSize="9">Bahnhofstrasse</text>
          <text x="4" y="511" fill="#94A3B8" fontSize="9">Parkweg</text>
          <text x="4" y="676" fill="#94A3B8" fontSize="9">Kirchgasse</text>
        </svg>
        {availableTasks.map((d) => (
          <button
            key={d.id}
            onClick={() => {
              if (hasActiveTask && workerTaskId !== d.id) return;
              setSelectedPinId(d.id);
              setWorkerScreen("jobDetail");
            }}
            className={`absolute flex flex-col items-center transition-transform ${hasActiveTask && workerTaskId !== d.id ? "opacity-40" : "active:scale-125"}`}
            style={{ left: d.x - 14, top: d.y - 38 }}
            disabled={hasActiveTask && workerTaskId !== d.id}
          >
            <div className={`w-7 h-7 rounded-full border-[2.5px] border-white shadow-lg flex items-center justify-center ${d.status === "new" ? "bg-red-500" : "bg-yellow-500"}`}>
              <AlertTriangle size={13} className="text-white" />
            </div>
            <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent" style={{ borderTopColor: d.status === "new" ? "#EF4444" : "#EAB308" }} />
          </button>
        ))}
        <div className="absolute top-2 left-3 right-3">
          <div className="bg-white rounded-2xl p-3 shadow-xl border border-[#D1D5DB] flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center flex-shrink-0">
              <Navigation size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-[#0F172A] text-sm">Wartungsteam · myMetroCity</div>
              <div className="text-xs text-[#64748B]">{openWorkerTasks} offen · {activeWorkerAssignments} in Bearbeitung</div>
            </div>
            <div className="relative">
              <Bell size={22} className="text-[#0F172A]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">1</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-3 right-3">
          {workerActiveTask ? (
            <div className="bg-[#0F172A] rounded-2xl p-4 shadow-lg text-white">
              <div className="text-[10px] uppercase tracking-wide text-[#94A3B8]">Aktive Aufgabe</div>
              <div className="font-bold text-sm mt-1">{workerActiveTask.label}</div>
              <div className="text-xs text-[#CBD5E1] mt-0.5">{workerActiveTask.address}</div>
              <button
                onClick={() => setWorkerScreen("jobComplete")}
                className="mt-3 w-full h-12 rounded-xl bg-[#10B981] text-white font-semibold text-sm"
              >
                Aufgabe abschließen
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-3 shadow-lg border border-[#D1D5DB]">
              <div className="text-xs text-[#64748B]">Aktive Aufgabe</div>
              <div className="text-sm font-semibold text-[#0F172A]">Kein Auftrag aktuell angenommen</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── MAINTENANCE: JOB DETAIL ──────────────────────────────────────────────────
  function renderWorkerJobDetail() {
    const d = defects.find((def) => def.id === selectedPinId);
    const canAccept = workerTaskId === null || workerTaskId === d?.id;
    if (!d) return null;
    return (
      <div className="pb-6">
        <div className="relative" style={{ height: "192px" }}>
          <svg width="390" height="192" viewBox="0 0 390 192" className="absolute inset-0">
            <rect width="390" height="192" fill="#CBD5E1"/>
            <rect x="0" y="78" width="390" height="22" fill="#F9FAFB"/>
            <rect x="80" y="0" width="22" height="192" fill="#F9FAFB"/>
            <rect x="200" y="0" width="22" height="192" fill="#F9FAFB"/>
            <rect x="0" y="0" width="70" height="68" fill="#E2E8F0" rx="3"/>
            <rect x="112" y="0" width="78" height="68" fill="#E2E8F0" rx="3"/>
            <rect x="232" y="0" width="158" height="68" fill="#E2E8F0" rx="3"/>
            <rect x="0" y="110" width="70" height="82" fill="#E2E8F0" rx="3"/>
            <rect x="112" y="110" width="78" height="82" fill="#D1FAE5" rx="3"/>
            <rect x="232" y="110" width="158" height="82" fill="#E2E8F0" rx="3"/>
            <polyline points="40,162 40,89 151,89 151,148" fill="none" stroke="#10B981" strokeWidth="3.5" strokeDasharray="8,4" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="40" cy="162" r="9" fill="#0F172A"/><circle cx="40" cy="162" r="4" fill="white"/>
            <circle cx="151" cy="148" r="10" fill="#EF4444"/>
            <text x="151" y="153" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">!</text>
          </svg>
          <button
            onClick={() => setWorkerScreen("map")}
            className="absolute top-3 left-3 w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center"
          >
            <ArrowLeft size={20} className="text-[#0F172A]" />
          </button>
          <div className="absolute bottom-2 left-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2">
            <Navigation size={14} className="text-[#10B981]" />
            <span className="text-xs font-semibold text-[#0F172A]">Route berechnet · ca. 8 Min. Fahrzeit</span>
          </div>
        </div>
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${d.status === "new" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>
              {d.status === "new" ? "● NEUER AUFTRAG" : "● IN BEARBEITUNG"}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#0F172A] mb-1">{d.label}</h1>
          <div className="flex items-center gap-1.5 text-[#64748B] text-sm mb-4">
            <MapPin size={13} /><span>{d.address}, myMetroCity</span>
          </div>
          <div className="bg-[#F8FAFC] border border-[#D1D5DB] rounded-xl p-4 mb-4">
            <h3 className="font-bold text-[#0F172A] text-sm mb-2">Fehlerbeschreibung</h3>
            <p className="text-[#64748B] text-sm leading-relaxed">
              {d.status === "new"
                ? "Defekt seit gestern Abend. Leuchtmittel oder Steuerung ausgefallen. Verkehrssicherheit beeinträchtigt. Sofortige Prüfung erforderlich."
                : "Schlagloch ca. 30 cm Durchmesser, 8 cm tief. Mitte der Fahrbahn. Verkehrsbehinderung bei Nässe möglich."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[["Priorität", d.status === "new" ? "⚠️ Hoch" : "Mittel"],["Gemeldet","Heute, 06:45"],[`Auftrag-Nr.`,`#MCY-${2000+d.id}`],["Bereich","Strassenunterhalt"]].map(([k,v])=>(
              <div key={k} className="bg-white border border-[#D1D5DB] rounded-xl p-3">
                <div className="text-xs text-[#64748B]">{k}</div>
                <div className="font-semibold text-[#0F172A] text-sm">{v}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              if (workerTaskId === d.id) {
                setWorkerScreen("jobComplete");
                return;
              }
              if (workerTaskId !== null && workerTaskId !== d.id) return;
              acceptWorkerTask(d.id);
            }}
            className={`w-full h-16 font-bold text-lg rounded-2xl shadow-lg ${workerTaskId === d.id ? "bg-[#10B981] text-white" : canAccept ? "bg-[#10B981] text-white" : "bg-[#D1D5DB] text-[#94A3B8] cursor-not-allowed"}`}
          >
            {workerTaskId === d.id ? "Auftrag abschließen" : "Auftrag annehmen"}
          </button>
          {workerTaskId !== null && workerTaskId !== d.id && (
            <p className="mt-3 text-center text-xs text-[#64748B]">Du kannst nur ein aktives Aufgab gleichzeitig übernehmen.</p>
          )}
        </div>
      </div>
    );
  }

  // ── MAINTENANCE: JOB COMPLETE ────────────────────────────────────────────────
  function renderWorkerJobComplete() {
    const d = defects.find((def) => def.id === selectedPinId);
    return (
      <div className="px-5 pt-3 pb-8">
        <button onClick={() => setWorkerScreen("jobDetail")} className="flex items-center gap-2 text-[#64748B] mb-4 h-10">
          <ArrowLeft size={20} /><span>Zurück</span>
        </button>
        <h1 className="text-[26px] font-extrabold text-[#0F172A] mb-1">Auftrag abschliessen</h1>
        <p className="text-[#64748B] text-sm mb-4">Foto-Nachweis hochladen, dann bestätigen.</p>
        {d && (
          <div className="bg-[#F8FAFC] border border-[#D1D5DB] rounded-xl p-3 mb-4 flex items-center gap-3">
            <AlertTriangle size={18} className="text-yellow-500 flex-shrink-0" />
            <div>
              <div className="font-semibold text-[#0F172A] text-sm">{d.label}</div>
              <div className="text-xs text-[#64748B]">{d.address}, myMetroCity</div>
            </div>
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-bold text-[#0F172A] mb-2">Foto-Nachweis <span className="text-red-500">*</span></label>
          <button onClick={() => setPhotoUploaded(!photoUploaded)}
            className={`w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all ${photoUploaded ? "border-[#10B981] bg-[#ECFDF5]" : "border-[#D1D5DB] bg-[#F8FAFC]"}`}
            style={{ height: "200px" }}>
            {photoUploaded ? (
              <><div className="w-16 h-16 bg-[#10B981] rounded-full flex items-center justify-center"><CheckCircle size={32} className="text-white"/></div>
              <div className="text-[#10B981] font-semibold">Foto hochgeladen</div>
              <div className="text-xs text-[#64748B]">Tippen zum Ändern</div></>
            ) : (
              <><div className="w-20 h-20 bg-[#E2E8F0] rounded-full flex items-center justify-center"><Camera size={36} className="text-[#94A3B8]"/></div>
              <div className="text-[#0F172A] font-semibold text-base">Foto aufnehmen</div>
              <div className="text-sm text-[#64748B]">Tippen zum Öffnen der Kamera</div></>
            )}
          </button>
        </div>
        <div className="mb-5">
          <label className="block text-sm font-bold text-[#0F172A] mb-2">Anmerkungen (optional)</label>
          <textarea rows={3} placeholder="z.B. Ersatzteil eingebaut, Strassensperrung aufgehoben..." className="w-full px-4 py-3 rounded-xl border-2 border-[#D1D5DB] bg-white text-[#0F172A] text-base focus:border-[#10B981] focus:outline-none resize-none"/>
        </div>
        <button
          disabled={!photoUploaded}
          onClick={completeWorkerTask}
          className={`w-full h-16 font-bold text-xl rounded-2xl transition-all ${photoUploaded ? "bg-[#10B981] text-white shadow-lg" : "bg-[#D1D5DB] text-[#94A3B8] cursor-not-allowed"}`}
        >
          ✓ Erledigt
        </button>
        {!photoUploaded && <p className="text-center text-xs text-[#64748B] mt-2">Foto-Nachweis ist zwingend erforderlich</p>}
      </div>
    );
  }

  // ─── Routing ──────────────────────────────────────────────────────────────────
  function renderContent() {
    if (adminMode) {
      if (isDesktop) return renderAdminPanel();
      return renderAdminUnavailable();
    }
    if (citizenTab === "home") {
      if (homeScreen === "ticketDetail") return renderTicketDetail();
      if (homeScreen === "allTickets") return renderAllTickets();
      if (homeScreen === "notifications") return renderNotifications();
      if (homeScreen === "notificationDetail") return renderNotificationDetail();
      return renderDashboard();
    }
    if (citizenTab === "mobility") {
      if (mobilityScreen === "hub") return renderMobilityHub();
      if (mobilityScreen === "offerRide") return renderOfferRide();
      if (mobilityScreen === "offerSuccess") return renderOfferSuccess();
      if (mobilityScreen === "ticketForm") return renderTicketForm();
      if (mobilityScreen === "payment") return renderPayment();
      if (mobilityScreen === "success") return renderTicketSuccess();
      if (mobilityScreen === "carpooling") return renderCarpooling();
    }
    if (citizenTab === "report") {
      if (reportScreen === "success") return renderReportSuccess();
      return renderReportForm();
    }
    if (citizenTab === "maintenance") {
      if (workerScreen === "map") return renderWorkerMap();
      if (workerScreen === "jobDetail") return renderWorkerJobDetail();
      if (workerScreen === "jobComplete") return renderWorkerJobComplete();
    }
    if (citizenTab === "profile") return renderProfile();
    return null;
  }

  // ─── Bottom Nav ───────────────────────────────────────────────────────────────
  const navItems = [
    { id: "home" as CitizenTab, icon: <Home size={22} />, label: "Home" },
    { id: "mobility" as CitizenTab, icon: <Train size={22} />, label: "Mobilität" },
    { id: "report" as CitizenTab, icon: <AlertTriangle size={22} />, label: "Mängel" },
    { id: "maintenance" as CitizenTab, icon: <Wrench size={22} />, label: "Wartung", locked: true },
    { id: "profile" as CitizenTab, icon: <User size={22} />, label: "Profil" },
  ];
  const shouldShowBottomNav = !adminMode;

  return (
    <div
    >
      {/* Phone Frame */}
      <div
        className="relative bg-[#F8FAFC] overflow-hidden"
        style={{ height: "100dvh",  margin: '0 auto' }}
      >

        {/* Content */}
        <div
          className={`${citizenTab === 'maintenance' && workerScreen === 'map' ?  'overflow-y-hidden' : 'overflow-y-auto'} overscroll-contain ${shouldShowBottomNav ? 'pb-12' : ''}`}
          style={{ height: shouldShowBottomNav ? "calc(100dvh - 80px)" : "100dvh", scrollbarWidth: "none" }}
        >
          {renderContent()}
        </div>

        {/* Carpooling Modal */}
        {carpoolModalId !== null && selectedRide && citizenTab === "mobility" && mobilityScreen === "carpooling" && (
          <div className="absolute inset-0 bg-black/50 flex items-end z-50" onClick={() => setCarpoolModalId(null)}>
            <div className="w-full bg-white rounded-t-3xl p-6" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-1 bg-[#D1D5DB] rounded-full mx-auto mb-5" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-[#0F172A] rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">{selectedRide.avatar}</div>
                <div>
                  <div className="font-bold text-[#0F172A] text-lg">{selectedRide.driver}</div>
                  <div className="flex items-center gap-1"><StarRow rating={selectedRide.rating} size={13}/><span className="text-sm text-[#64748B] ml-1">{selectedRide.rating} ({selectedRide.reviews} Bew.)</span></div>
                </div>
              </div>
              <div className="bg-[#F8FAFC] rounded-2xl p-4 mb-4 space-y-2.5">
                {[["Von",selectedRide.from],["Nach",selectedRide.to],["Abfahrt",`${selectedRide.time} Uhr`],["Freie Plätze",`${selectedRide.seats}`],["Preis pro Platz",`CHF ${selectedRide.price}.00`]].map(([k,v])=>(
                  <div key={k} className="flex justify-between">
                    <span className="text-[#64748B] text-sm">{k}</span>
                    <span className="font-semibold text-[#0F172A] text-sm">{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setCarpoolModalId(null)} className="w-full h-16 bg-[#10B981] text-white font-bold text-lg rounded-2xl">
                Kostenpflichtig buchen · CHF {selectedRide.price}.00
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation — 5 tabs */}
        {shouldShowBottomNav && (
          <div className="absolute left-0 right-0 bg-white border-t border-[#D1D5DB] flex items-start pt-3 px-2" style={{ height: "80px", bottom: 0}}>
            {navItems.map((item) => {
              const active = citizenTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    goToTab(item.id);
                    if (item.id === "maintenance") setWorkerScreen("map");
                  }}
                  className={`flex-1 flex flex-col items-center gap-0.5 transition-colors relative ${active ? "text-[#10B981]" : "text-[#94A3B8]"}`}
                >
                  <div className="relative">
                    {item.icon}
                    {"locked" in item && item.locked && (
                      <div className="absolute -top-1 -right-2 w-4 h-4 bg-[#0F172A] rounded-full flex items-center justify-center">
                        <Lock size={8} className="text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-bold leading-tight text-center">{item.label}</span>
                  {active && <div className="w-1 h-1 bg-[#10B981] rounded-full" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Home indicator */}
      </div>
    </div>
  );
}
