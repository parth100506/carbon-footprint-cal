import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  BarChart3,
  Bus,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Globe,
  Home,
  Leaf,
  Lightbulb,
  Menu,
  Minus,
  Plus,
  RotateCcw,
  ShoppingBag,
  Sun,
  TreePine,
  TrendingDown,
  Users,
  Utensils,
  Wind,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────
interface FlightEntry {
  id: number;
  from: string;
  to: string;
  distanceKm: string;
  flightClass: "economy" | "business" | "first";
  trips: string;
}

interface FormData {
  // Welcome
  country: string;
  timePeriod: "monthly" | "yearly";
  // House
  electricityKwh: string;
  gasM3: string;
  coalKg: string;
  householdPeople: string;
  // Flights
  flights: FlightEntry[];
  // Car
  carDistancePerDay: string;
  carVehicleType: string;
  carFuelType: string;
  // Motorbike
  bikeDistancePerDay: string;
  bikeType: string;
  // Bus & Rail
  localBusKm: string;
  coachKm: string;
  localTrainKm: string;
  longTrainKm: string;
  taxiKm: string;
  // Secondary
  foodDrink: string;
  clothes: string;
  electronics: string;
  personalCare: string;
  leisure: string;
  otherGoods: string;
}

const defaultFormData: FormData = {
  country: "India",
  timePeriod: "monthly",
  electricityKwh: "",
  gasM3: "",
  coalKg: "",
  householdPeople: "1",
  flights: [],
  carDistancePerDay: "",
  carVehicleType: "medium",
  carFuelType: "Petrol",
  bikeDistancePerDay: "",
  bikeType: "Small",
  localBusKm: "",
  coachKm: "",
  localTrainKm: "",
  longTrainKm: "",
  taxiKm: "",
  foodDrink: "",
  clothes: "",
  electronics: "",
  personalCare: "",
  leisure: "",
  otherGoods: "",
};

// ─── Emission calculations ────────────────────────────────────────────────────
function calcHouse(d: FormData) {
  const elec = Number(d.electricityKwh) || 0;
  const gas = Number(d.gasM3) || 0;
  const coal = Number(d.coalKg) || 0;
  const electricityCo2 = elec * 0.5;
  const gasCo2 = gas * 2.0;
  const coalCo2 = coal * 2.42;
  return electricityCo2 + gasCo2 + coalCo2;
}

function calcFlights(d: FormData) {
  const classMap: Record<string, number> = {
    economy: 1,
    business: 1.5,
    first: 2,
  };
  return d.flights.reduce((sum, f) => {
    const dist = Number(f.distanceKm) || 0;
    const trips = Number(f.trips) || 1;
    const mult = classMap[f.flightClass] ?? 1;
    return sum + dist * trips * mult * 0.15;
  }, 0);
}

function calcCar(d: FormData) {
  const fuelFactors: Record<string, number> = {
    Petrol: 0.2,
    Diesel: 0.15,
    Electric: 0.05,
    Hybrid: 0.1,
    None: 0,
  };
  const dist = Number(d.carDistancePerDay) || 0;
  const factor = fuelFactors[d.carFuelType] ?? 0;
  return dist * 30 * factor;
}

function calcBike(d: FormData) {
  const dist = Number(d.bikeDistancePerDay) || 0;
  return dist * 30 * 0.08;
}

function calcTransit(d: FormData) {
  // Inputs are weekly distances; convert to monthly using ×4
  const bus = (Number(d.localBusKm) || 0) * 4 * 0.05;
  const coach = (Number(d.coachKm) || 0) * 4 * 0.05;
  const localTrain = (Number(d.localTrainKm) || 0) * 4 * 0.04;
  const longTrain = (Number(d.longTrainKm) || 0) * 4 * 0.04;
  const taxi = (Number(d.taxiKm) || 0) * 4 * 0.2;
  return bus + coach + localTrain + longTrain + taxi;
}

function calcSecondary(d: FormData) {
  const food = (Number(d.foodDrink) || 0) * 0.02;
  const clothes = (Number(d.clothes) || 0) * 0.03;
  const electronics = (Number(d.electronics) || 0) * 0.04;
  const lifestyle =
    ((Number(d.personalCare) || 0) +
      (Number(d.leisure) || 0) +
      (Number(d.otherGoods) || 0)) *
    0.03;
  return food + clothes + electronics + lifestyle;
}

function calcTotal(d: FormData) {
  return (
    calcHouse(d) +
    calcFlights(d) +
    calcCar(d) +
    calcBike(d) +
    calcTransit(d) +
    calcSecondary(d)
  );
}

function classifyTotal(total: number): "low" | "medium" | "high" {
  if (total < 100) return "low";
  if (total <= 300) return "medium";
  return "high";
}

// ─── Nav links ───────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Objectives", href: "#objectives" },
  { label: "Methodology", href: "#methodology" },
  { label: "Calculator", href: "#calculator" },
  { label: "Team", href: "#team" },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#home" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-eco-600 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-eco-800 text-sm sm:text-base">
              Carbon Footprint Calculator
            </span>
          </a>
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-medium text-muted-foreground hover:text-eco-700 transition-colors duration-150"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#calculator"
              data-ocid="nav.primary_button"
              className="inline-flex items-center gap-1.5 bg-eco-600 hover:bg-eco-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Start Calculating
            </a>
          </nav>
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-eco-50"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {/* Mobile nav */}
      {open && (
        <div className="md:hidden bg-white border-t border-border px-4 py-4">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-foreground hover:text-eco-700 py-1"
              >
                {l.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                window.location.hash = "#calculator";
              }}
              className="mt-2 flex items-center justify-center gap-1.5 bg-eco-600 hover:bg-eco-700 text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Start Calculating
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      id="home"
      className="hero-bg pt-24 pb-16 md:pt-28 md:pb-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-white/20">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">
                MIT Academy of Engineering
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-tight mb-4 tracking-tight">
              Carbon Footprint
              <span className="block text-eco-200">Calculator</span>
            </h1>
            <p className="text-lg sm:text-xl font-medium text-white/90 mb-3">
              Measure your impact and build a sustainable future
            </p>
            <p className="text-white/75 text-base leading-relaxed mb-8 max-w-lg">
              Calculate your CO₂ emissions from daily activities —
              transportation, energy use, and food choices — and discover how to
              reduce your environmental impact.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#calculator"
                data-ocid="hero.primary_button"
                className="inline-flex items-center gap-2 bg-white text-eco-700 hover:bg-eco-50 font-bold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-base"
              >
                Calculate Now
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#about"
                data-ocid="hero.secondary_button"
                className="inline-flex items-center gap-2 border-2 border-white/50 text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-full transition-all duration-200 text-base"
              >
                Learn More
              </a>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { val: "7", label: "Emission sources" },
                { val: "8", label: "Step wizard" },
                { val: "100%", label: "Free to use" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-extrabold text-white">
                    {stat.val}
                  </div>
                  <div className="text-xs text-white/65 font-medium mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center lg:justify-end animate-fade-in-up anim-delay-300">
            <div className="relative">
              <div className="absolute inset-0 bg-white/5 rounded-3xl blur-2xl" />
              <img
                src="/assets/generated/eco-hero-illustration-transparent.dim_600x500.png"
                alt="Eco illustration"
                className="relative w-full max-w-[480px] drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Tab Calculator ───────────────────────────────────────────────────────────
const TABS = [
  { id: "welcome", label: "Welcome", icon: "🌿" },
  { id: "house", label: "House", icon: "🏠" },
  { id: "flights", label: "Flights", icon: "✈️" },
  { id: "car", label: "Car", icon: "🚗" },
  { id: "motorbike", label: "Motorbike", icon: "🏍️" },
  { id: "busrail", label: "Bus & Rail", icon: "🚌" },
  { id: "secondary", label: "Secondary", icon: "🛍️" },
  { id: "results", label: "Results", icon: "📊" },
  { id: "report", label: "Report", icon: "📋" },
];

function LiveBadge({ formData }: { formData: FormData }) {
  const total = calcTotal(formData);
  if (total === 0) return null;
  const cls = classifyTotal(total);
  const colors = {
    low: "bg-eco-600",
    medium: "bg-yellow-500",
    high: "bg-red-500",
  };
  return (
    <div
      className={`fixed bottom-4 right-4 z-50 ${colors[cls]} text-white rounded-full px-4 py-2 shadow-lg text-sm font-bold flex items-center gap-2 animate-in`}
    >
      <Leaf className="w-4 h-4" />
      {total.toFixed(1)} kg CO₂/mo
    </div>
  );
}

// Input helper
function FieldRow({
  label,
  id,
  value,
  onChange,
  placeholder = "0",
  unit,
  type = "number",
  ocid,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  unit?: string;
  type?: string;
  ocid?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          min={0}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-ocid={ocid ?? id}
          className="h-10 rounded-xl border-border pr-12"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

// Sub-total pill
function SubTotal({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between bg-eco-50 border border-eco-200 rounded-xl px-4 py-3 mt-4">
      <span className="text-sm font-semibold text-eco-700">{label}</span>
      <span className="text-base font-extrabold text-eco-700">
        {value.toFixed(2)} kg CO₂
      </span>
    </div>
  );
}

function WelcomeTab({
  formData,
  update,
}: {
  formData: FormData;
  update: (k: keyof FormData, v: string) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="text-5xl mb-4">🌍</div>
        <h2 className="text-2xl font-extrabold text-foreground mb-2">
          Let&apos;s measure your carbon footprint
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We&apos;ll walk you through 7 categories step by step. It only takes a
          few minutes!
        </p>
      </div>

      {/* Category icons */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
        {[
          { icon: "🏠", label: "House" },
          { icon: "✈️", label: "Flights" },
          { icon: "🚗", label: "Car" },
          { icon: "🏍️", label: "Motorbike" },
          { icon: "🚌", label: "Bus & Rail" },
          { icon: "🛍️", label: "Secondary" },
          { icon: "📊", label: "Results" },
        ].map((c) => (
          <div
            key={c.label}
            className="flex flex-col items-center gap-1 bg-eco-50 rounded-xl p-3 border border-eco-100"
          >
            <span className="text-2xl">{c.icon}</span>
            <span className="text-xs font-medium text-eco-700">{c.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-foreground">
            Country
          </Label>
          <Select
            value={formData.country}
            onValueChange={(v) => update("country", v)}
          >
            <SelectTrigger
              data-ocid="welcome.select"
              className="h-10 rounded-xl"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["India", "USA", "UK", "Germany", "Australia", "Other"].map(
                (c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-foreground">
            Time Period
          </Label>
          <Select
            value={formData.timePeriod}
            onValueChange={(v) =>
              update("timePeriod", v as "monthly" | "yearly")
            }
          >
            <SelectTrigger
              data-ocid="welcome.period_select"
              className="h-10 rounded-xl"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function HouseTab({
  formData,
  update,
}: {
  formData: FormData;
  update: (k: keyof FormData, v: string) => void;
}) {
  const total = calcHouse(formData);
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-eco-100 flex items-center justify-center text-eco-600">
          <Home className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Home Energy Usage</h3>
          <p className="text-xs text-muted-foreground">
            Enter your monthly household consumption
          </p>
        </div>
      </div>
      <FieldRow
        label="Monthly electricity usage"
        id="electricity"
        value={formData.electricityKwh}
        onChange={(v) => update("electricityKwh", v)}
        unit="kWh"
        ocid="house.electricity_input"
      />
      <FieldRow
        label="Monthly gas / LPG usage"
        id="gas"
        value={formData.gasM3}
        onChange={(v) => update("gasM3", v)}
        unit="m³"
        ocid="house.gas_input"
      />
      <FieldRow
        label="Coal or firewood used (optional)"
        id="coal"
        value={formData.coalKg}
        onChange={(v) => update("coalKg", v)}
        unit="kg"
        ocid="house.coal_input"
      />
      <FieldRow
        label="Number of people in household"
        id="people"
        value={formData.householdPeople}
        onChange={(v) => update("householdPeople", v)}
        placeholder="1"
        ocid="house.people_input"
      />
      <SubTotal label="House CO₂ this month" value={total} />
    </div>
  );
}

function FlightsTab({
  formData,
  setFormData,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  const nextId = useRef(1);

  const addFlight = () => {
    const id = nextId.current++;
    setFormData((prev) => ({
      ...prev,
      flights: [
        ...prev.flights,
        {
          id,
          from: "",
          to: "",
          distanceKm: "",
          flightClass: "economy",
          trips: "1",
        },
      ],
    }));
  };

  const removeFlight = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      flights: prev.flights.filter((f) => f.id !== id),
    }));
  };

  const updateFlight = (
    id: number,
    field: keyof FlightEntry,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      flights: prev.flights.map((f) =>
        f.id === id ? { ...f, [field]: value } : f,
      ),
    }));
  };

  const total = calcFlights(formData);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-eco-100 flex items-center justify-center">
            <span className="text-lg">✈️</span>
          </div>
          <div>
            <h3 className="font-bold text-foreground">Flights</h3>
            <p className="text-xs text-muted-foreground">
              Add each flight route separately
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addFlight}
          data-ocid="flights.add_button"
          className="flex items-center gap-1.5 text-eco-700 border-eco-300 hover:bg-eco-50 rounded-xl"
        >
          <Plus className="w-4 h-4" /> Add Flight
        </Button>
      </div>

      {formData.flights.length === 0 && (
        <div
          className="text-center py-8 bg-eco-50 rounded-xl border border-eco-100"
          data-ocid="flights.empty_state"
        >
          <span className="text-3xl">✈️</span>
          <p className="text-muted-foreground text-sm mt-2">
            No flights added. Click &quot;Add Flight&quot; to begin.
          </p>
        </div>
      )}

      {formData.flights.map((flight, i) => (
        <div
          key={flight.id}
          data-ocid={`flights.item.${i + 1}`}
          className="bg-eco-50 border border-eco-100 rounded-2xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-eco-700 uppercase tracking-wide">
              Flight {i + 1}
            </span>
            <button
              type="button"
              onClick={() => removeFlight(flight.id)}
              data-ocid={`flights.delete_button.${i + 1}`}
              className="text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">From</Label>
              <Input
                type="text"
                placeholder="e.g. Mumbai"
                value={flight.from}
                onChange={(e) =>
                  updateFlight(flight.id, "from", e.target.value)
                }
                className="h-9 rounded-xl text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">To</Label>
              <Input
                type="text"
                placeholder="e.g. Delhi"
                value={flight.to}
                onChange={(e) => updateFlight(flight.id, "to", e.target.value)}
                className="h-9 rounded-xl text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Distance (km)</Label>
              <Input
                type="number"
                min={0}
                placeholder="1400"
                value={flight.distanceKm}
                onChange={(e) =>
                  updateFlight(flight.id, "distanceKm", e.target.value)
                }
                className="h-9 rounded-xl text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Trips</Label>
              <Input
                type="number"
                min={1}
                placeholder="1"
                value={flight.trips}
                onChange={(e) =>
                  updateFlight(flight.id, "trips", e.target.value)
                }
                className="h-9 rounded-xl text-sm"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs font-semibold">Class</Label>
              <Select
                value={flight.flightClass}
                onValueChange={(v) => updateFlight(flight.id, "flightClass", v)}
              >
                <SelectTrigger className="h-9 rounded-xl text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy (×1)</SelectItem>
                  <SelectItem value="business">Business (×1.5)</SelectItem>
                  <SelectItem value="first">First Class (×2)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ))}

      {formData.flights.length > 0 && (
        <SubTotal label="Flights CO₂ this month" value={total} />
      )}
    </div>
  );
}

function CarTab({
  formData,
  update,
}: {
  formData: FormData;
  update: (k: keyof FormData, v: string) => void;
}) {
  const total = calcCar(formData);
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-eco-100 flex items-center justify-center text-eco-600">
          <Car className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Car Usage</h3>
          <p className="text-xs text-muted-foreground">
            How much do you drive?
          </p>
        </div>
      </div>
      <FieldRow
        label="Distance driven per day"
        id="carDist"
        value={formData.carDistancePerDay}
        onChange={(v) => update("carDistancePerDay", v)}
        unit="km/day"
        ocid="car.distance_input"
      />
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-foreground">
          Vehicle Type
        </Label>
        <Select
          value={formData.carVehicleType}
          onValueChange={(v) => update("carVehicleType", v)}
        >
          <SelectTrigger
            data-ocid="car.vehicle_select"
            className="h-10 rounded-xl"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small Car</SelectItem>
            <SelectItem value="medium">Medium Car</SelectItem>
            <SelectItem value="large">Large Car</SelectItem>
            <SelectItem value="suv">SUV</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-foreground">
          Fuel Type
        </Label>
        <Select
          value={formData.carFuelType}
          onValueChange={(v) => update("carFuelType", v)}
        >
          <SelectTrigger
            data-ocid="car.fuel_select"
            className="h-10 rounded-xl"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Petrol">Petrol (0.21 kg/km)</SelectItem>
            <SelectItem value="Diesel">Diesel (0.17 kg/km)</SelectItem>
            <SelectItem value="Electric">Electric (0.05 kg/km)</SelectItem>
            <SelectItem value="Hybrid">Hybrid (0.11 kg/km)</SelectItem>
            <SelectItem value="None">None (no car)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <SubTotal label="Car CO₂ this month" value={total} />
    </div>
  );
}

function MotorbikeTab({
  formData,
  update,
}: {
  formData: FormData;
  update: (k: keyof FormData, v: string) => void;
}) {
  const total = calcBike(formData);
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-eco-100 flex items-center justify-center">
          <span className="text-lg">🏍️</span>
        </div>
        <div>
          <h3 className="font-bold text-foreground">Motorbike Usage</h3>
          <p className="text-xs text-muted-foreground">
            Daily motorbike / scooter usage
          </p>
        </div>
      </div>
      <FieldRow
        label="Distance ridden per day"
        id="bikeDist"
        value={formData.bikeDistancePerDay}
        onChange={(v) => update("bikeDistancePerDay", v)}
        unit="km/day"
        ocid="bike.distance_input"
      />
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-foreground">
          Bike Engine Size
        </Label>
        <Select
          value={formData.bikeType}
          onValueChange={(v) => update("bikeType", v)}
        >
          <SelectTrigger
            data-ocid="bike.type_select"
            className="h-10 rounded-xl"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Small">
              Small (&lt;125cc) — 0.083 kg/km
            </SelectItem>
            <SelectItem value="Medium">
              Medium (125–500cc) — 0.101 kg/km
            </SelectItem>
            <SelectItem value="Large">
              Large (&gt;500cc) — 0.132 kg/km
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <SubTotal label="Motorbike CO₂ this month" value={total} />
    </div>
  );
}

function BusRailTab({
  formData,
  update,
}: {
  formData: FormData;
  update: (k: keyof FormData, v: string) => void;
}) {
  const total = calcTransit(formData);
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-eco-100 flex items-center justify-center text-eco-600">
          <Bus className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Public Transport</h3>
          <p className="text-xs text-muted-foreground">
            Enter average km per day for each mode
          </p>
        </div>
      </div>
      <FieldRow
        label="Local bus"
        id="localBus"
        value={formData.localBusKm}
        onChange={(v) => update("localBusKm", v)}
        unit="km/day"
        ocid="transit.bus_input"
      />
      <FieldRow
        label="Coach / long-distance bus"
        id="coach"
        value={formData.coachKm}
        onChange={(v) => update("coachKm", v)}
        unit="km/day"
        ocid="transit.coach_input"
      />
      <FieldRow
        label="Local train / metro"
        id="localTrain"
        value={formData.localTrainKm}
        onChange={(v) => update("localTrainKm", v)}
        unit="km/day"
        ocid="transit.local_train_input"
      />
      <FieldRow
        label="Long-distance train"
        id="longTrain"
        value={formData.longTrainKm}
        onChange={(v) => update("longTrainKm", v)}
        unit="km/day"
        ocid="transit.long_train_input"
      />
      <FieldRow
        label="Taxi / rideshare"
        id="taxi"
        value={formData.taxiKm}
        onChange={(v) => update("taxiKm", v)}
        unit="km/day"
        ocid="transit.taxi_input"
      />
      <SubTotal label="Transit CO₂ this month" value={total} />
    </div>
  );
}

function SecondaryTab({
  formData,
  update,
}: {
  formData: FormData;
  update: (k: keyof FormData, v: string) => void;
}) {
  const total = calcSecondary(formData);
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-eco-100 flex items-center justify-center text-eco-600">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Secondary Spending</h3>
          <p className="text-xs text-muted-foreground">
            Monthly spending in ₹ — used to estimate embedded CO₂
          </p>
        </div>
      </div>
      <FieldRow
        label="Food & Drink"
        id="foodDrink"
        value={formData.foodDrink}
        onChange={(v) => update("foodDrink", v)}
        unit="₹/mo"
        ocid="secondary.food_input"
      />
      <FieldRow
        label="Clothes & Footwear"
        id="clothes"
        value={formData.clothes}
        onChange={(v) => update("clothes", v)}
        unit="₹/mo"
        ocid="secondary.clothes_input"
      />
      <FieldRow
        label="Electronics & Appliances"
        id="electronics"
        value={formData.electronics}
        onChange={(v) => update("electronics", v)}
        unit="₹/mo"
        ocid="secondary.electronics_input"
      />
      <FieldRow
        label="Personal Care Products"
        id="personalCare"
        value={formData.personalCare}
        onChange={(v) => update("personalCare", v)}
        unit="₹/mo"
        ocid="secondary.care_input"
      />
      <FieldRow
        label="Leisure & Entertainment"
        id="leisure"
        value={formData.leisure}
        onChange={(v) => update("leisure", v)}
        unit="₹/mo"
        ocid="secondary.leisure_input"
      />
      <FieldRow
        label="Other Goods"
        id="otherGoods"
        value={formData.otherGoods}
        onChange={(v) => update("otherGoods", v)}
        unit="₹/mo"
        ocid="secondary.other_input"
      />
      <SubTotal label="Secondary CO₂ this month" value={total} />
    </div>
  );
}

function ResultsTab({
  formData,
  onReset,
  setActiveTab,
}: {
  formData: FormData;
  onReset: () => void;
  setActiveTab: (i: number) => void;
}) {
  const house = calcHouse(formData);
  const flights = calcFlights(formData);
  const car = calcCar(formData);
  const bike = calcBike(formData);
  const transit = calcTransit(formData);
  const secondary = calcSecondary(formData);
  const total = house + flights + car + bike + transit + secondary;
  const annualTonnes = (total * 12) / 1000;
  const cls = classifyTotal(total);

  const clsConfig = {
    low: {
      label: "Low",
      badge: "bg-eco-100 text-eco-800 border-eco-300",
      icon: "🟢",
      impacts: [
        "Your carbon footprint is impressively low — keep it up!",
        "You're contributing minimally to greenhouse gas emissions.",
        "Reducing your footprint by even 20% more can inspire those around you.",
      ],
      tips: [
        { icon: "♻️", text: "Maintain your eco-friendly habits" },
        { icon: "🌱", text: "Try zero-waste living to go further" },
        { icon: "💡", text: "Consider carbon offset programs" },
        { icon: "🤝", text: "Inspire friends and family to follow suit" },
      ],
    },
    medium: {
      label: "Medium",
      badge: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: "🟡",
      impacts: [
        "Your footprint has a moderate impact on the environment.",
        "Lifestyle changes can significantly reduce your emissions.",
        "Reducing your footprint by even 20% can make a meaningful difference to the planet.",
      ],
      tips: [
        { icon: "🔌", text: "Reduce electricity usage — switch to LED" },
        { icon: "🚌", text: "Use public transport more often" },
        { icon: "🥗", text: "Reduce meat intake to 3 days per week" },
        { icon: "🌞", text: "Explore solar energy options" },
      ],
    },
    high: {
      label: "High",
      badge: "bg-red-100 text-red-800 border-red-300",
      icon: "🔴",
      impacts: [
        "Your carbon footprint is contributing significantly to global warming and climate change.",
        "Transport and energy emissions contribute to CO₂, methane, and PM2.5 air pollution.",
        "Reducing your footprint by even 20% can make a meaningful difference to the planet.",
      ],
      tips: [
        {
          icon: "🚶",
          text: "Avoid private car — walk, cycle, or take transit",
        },
        { icon: "❄️", text: "Reduce AC usage and improve home insulation" },
        { icon: "⚡", text: "Switch to renewable energy sources" },
        { icon: "🥦", text: "Adopt a plant-based diet" },
        { icon: "✈️", text: "Reduce or eliminate short-haul flights" },
        { icon: "🌳", text: "Plant trees or fund reforestation projects" },
      ],
    },
  };

  const cfg = clsConfig[cls];

  const pieData = [
    {
      name: "House",
      value: Number.parseFloat(house.toFixed(2)),
      fill: "#4ade80",
    },
    {
      name: "Flights",
      value: Number.parseFloat(flights.toFixed(2)),
      fill: "#60a5fa",
    },
    { name: "Car", value: Number.parseFloat(car.toFixed(2)), fill: "#f97316" },
    {
      name: "Motorbike",
      value: Number.parseFloat(bike.toFixed(2)),
      fill: "#a78bfa",
    },
    {
      name: "Transit",
      value: Number.parseFloat(transit.toFixed(2)),
      fill: "#facc15",
    },
    {
      name: "Secondary",
      value: Number.parseFloat(secondary.toFixed(2)),
      fill: "#f472b6",
    },
  ].filter((d) => d.value > 0);

  const compData = [
    {
      name: "You",
      value: Number.parseFloat(total.toFixed(1)),
      fill:
        cls === "low" ? "#22c55e" : cls === "medium" ? "#eab308" : "#ef4444",
    },
    { name: "India Avg", value: 158, fill: "#6b7280" },
    { name: "World Avg", value: 392, fill: "#9ca3af" },
  ];

  return (
    <div className="space-y-8" data-ocid="results.section">
      {/* Total & classification */}
      <div
        className="text-center bg-eco-50 rounded-2xl border border-eco-200 p-6"
        data-ocid="results.card"
      >
        <p className="text-sm font-semibold text-muted-foreground mb-1">
          Your Monthly CO₂ Footprint
        </p>
        <div className="text-5xl font-extrabold text-eco-700 mb-1">
          {total.toFixed(1)}
          <span className="text-xl font-semibold text-eco-500 ml-1">
            kg CO₂
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Equivalent to <strong>{annualTonnes.toFixed(2)} tonnes</strong> per
          year
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl">{cfg.icon}</span>
          <Badge className={`${cfg.badge} border font-bold text-sm px-3 py-1`}>
            {cfg.label} Emissions
          </Badge>
        </div>
      </div>

      {/* Breakdown bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { label: "House", value: house, color: "bg-green-400" },
          { label: "Flights", value: flights, color: "bg-blue-400" },
          { label: "Car", value: car, color: "bg-orange-400" },
          { label: "Motorbike", value: bike, color: "bg-purple-400" },
          { label: "Transit", value: transit, color: "bg-yellow-400" },
          { label: "Secondary", value: secondary, color: "bg-pink-400" },
        ].map((item) => (
          <div
            key={item.label}
            className="text-center bg-background rounded-xl border border-border p-2"
          >
            <div
              className={`w-2 h-2 rounded-full ${item.color} mx-auto mb-1`}
            />
            <div className="text-xs font-bold text-foreground">
              {item.value.toFixed(1)} kg
            </div>
            <div className="text-xs text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Environmental Impact */}
      <div className="space-y-3">
        <h4 className="font-bold text-foreground">Environmental Impact</h4>
        {cfg.impacts.map((impact) => (
          <div
            key={impact}
            className="flex items-start gap-3 bg-background border border-border rounded-xl p-4"
          >
            <span className="text-eco-500 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <p className="text-sm text-foreground leading-relaxed">{impact}</p>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div className="space-y-3">
        <h4 className="font-bold text-foreground">Personalized Suggestions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cfg.tips.map((tip) => (
            <div
              key={tip.text}
              className="flex items-center gap-3 bg-eco-50 border border-eco-100 rounded-xl p-3"
            >
              <span className="text-xl">{tip.icon}</span>
              <p className="text-sm font-medium text-eco-900">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison chart */}
      <div className="space-y-3">
        <h4 className="font-bold text-foreground">How You Compare</h4>
        <div className="bg-background border border-border rounded-2xl p-4">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={compData}
              layout="vertical"
              margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
            >
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={72}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(v: number) => [`${v} kg/mo`]} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {compData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            India avg: ~158 kg/mo · World avg: ~392 kg/mo
          </p>
        </div>
      </div>

      {/* Pie chart */}
      {pieData.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-bold text-foreground">Category Breakdown</h4>
          <div className="bg-background border border-border rounded-2xl p-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    percent > 0.05
                      ? `${name} ${(percent * 100).toFixed(0)}%`
                      : ""
                  }
                  labelLine={false}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} kg CO₂`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Generate Report */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setActiveTab(8)}
          data-ocid="results.report_button"
          className="w-full bg-eco-600 hover:bg-eco-700 text-white font-bold py-4 px-6 rounded-2xl text-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mb-3"
        >
          📋 Generate Detailed Report
        </button>
      </div>

      {/* Reset */}
      <div className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          data-ocid="results.reset_button"
          className="w-full h-11 rounded-full border-eco-300 text-eco-700 hover:bg-eco-50 font-semibold flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Start Over
        </Button>
      </div>
    </div>
  );
}

function ReportTab({
  formData,
  onReset,
}: {
  formData: FormData;
  onReset: () => void;
}) {
  const house = calcHouse(formData);
  const flights = calcFlights(formData);
  const car = calcCar(formData);
  const bike = calcBike(formData);
  const transit = calcTransit(formData);
  const secondary = calcSecondary(formData);
  const total = house + flights + car + bike + transit + secondary;
  const annualTonnes = (total * 12) / 1000;
  const cls = classifyTotal(total);
  const today = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const clsConfig = {
    low: {
      label: "Low",
      color: "text-eco-700",
      bg: "bg-eco-50 border-eco-200",
      badge: "bg-eco-100 text-eco-800 border-eco-300",
      icon: "🟢",
      impacts: [
        "Your carbon footprint is impressively low — keep it up!",
        "You are contributing minimally to greenhouse gas emissions.",
        "Reducing your footprint by even 20% more can inspire those around you.",
      ],
      tips: [
        "Maintain your eco-friendly habits and share them with others.",
        "Try zero-waste living: reduce packaging, compost food scraps.",
        "Consider carbon offset programs to neutralize residual emissions.",
        "Inspire friends and family to adopt sustainable practices.",
        "Explore community solar or renewable energy subscriptions.",
      ],
    },
    medium: {
      label: "Medium",
      color: "text-yellow-700",
      bg: "bg-yellow-50 border-yellow-200",
      badge: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: "🟡",
      impacts: [
        "Your footprint has a moderate impact on the environment.",
        "Lifestyle changes can significantly reduce your emissions.",
        "Moderate emissions contribute to urban heat islands and air quality issues.",
        "Reducing your footprint by 20% can make a meaningful difference to the planet.",
      ],
      tips: [
        "Reduce electricity usage — switch to LED bulbs and energy-efficient appliances.",
        "Use public transport, carpool, or cycle for daily commutes.",
        "Reduce meat intake; opt for plant-based meals 3–4 days per week.",
        "Explore rooftop solar or green energy tariffs from your provider.",
        "Unplug devices on standby and optimise home insulation.",
        "Buy second-hand clothing and electronics where possible.",
      ],
    },
    high: {
      label: "High",
      color: "text-red-700",
      bg: "bg-red-50 border-red-200",
      badge: "bg-red-100 text-red-800 border-red-300",
      icon: "🔴",
      impacts: [
        "Your carbon footprint is contributing significantly to global warming and climate change.",
        "Transport and energy emissions contribute to CO₂, methane, and PM2.5 air pollution.",
        "High emissions accelerate ice melt, sea-level rise, and extreme weather events.",
        "Reducing your footprint by even 20% can make a meaningful difference to the planet.",
      ],
      tips: [
        "Avoid private car trips — walk, cycle, or use public transit instead.",
        "Reduce or eliminate air travel; choose train or video calls where possible.",
        "Reduce AC and heating usage; improve home insulation.",
        "Switch to renewable electricity (solar, wind) for your home.",
        "Adopt a largely plant-based diet and reduce food waste.",
        "Plant trees or fund certified reforestation projects.",
        "Replace petrol/diesel vehicles with EVs or hybrids.",
        "Buy fewer new goods; repair, reuse, and recycle.",
      ],
    },
  };

  const cfg = clsConfig[cls];

  const breakdown = [
    {
      label: "House / Energy",
      value: house,
      color: "bg-green-400",
      pct: total > 0 ? (house / total) * 100 : 0,
    },
    {
      label: "Flights",
      value: flights,
      color: "bg-blue-400",
      pct: total > 0 ? (flights / total) * 100 : 0,
    },
    {
      label: "Car",
      value: car,
      color: "bg-orange-400",
      pct: total > 0 ? (car / total) * 100 : 0,
    },
    {
      label: "Motorbike",
      value: bike,
      color: "bg-purple-400",
      pct: total > 0 ? (bike / total) * 100 : 0,
    },
    {
      label: "Bus & Rail",
      value: transit,
      color: "bg-yellow-400",
      pct: total > 0 ? (transit / total) * 100 : 0,
    },
    {
      label: "Secondary",
      value: secondary,
      color: "bg-pink-400",
      pct: total > 0 ? (secondary / total) * 100 : 0,
    },
  ];

  const indiaAnnual = 1.9;
  const worldAnnual = 4.7;
  const yourAnnual = annualTonnes;

  return (
    <div className="space-y-6 report-page" data-ocid="report.section">
      {/* Report Header */}
      <div className="text-center py-4 border-b-2 border-eco-200">
        <div className="inline-flex items-center gap-2 bg-eco-100 text-eco-700 rounded-full px-4 py-1.5 mb-3 text-sm font-semibold">
          🌍 MIT Academy of Engineering
        </div>
        <h2 className="text-3xl font-extrabold text-eco-800 mb-1">
          Carbon Footprint Report
        </h2>
        <p className="text-sm text-muted-foreground">
          Generated on {today} · Country: {formData.country || "India"} ·
          Period: {formData.timePeriod === "yearly" ? "Yearly" : "Monthly"}
        </p>
      </div>

      {/* Summary Card */}
      <div
        className={`rounded-2xl border-2 p-6 ${cfg.bg}`}
        data-ocid="report.card"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              Total Monthly CO₂ Footprint
            </p>
            <div className={`text-5xl font-extrabold ${cfg.color} mb-1`}>
              {total.toFixed(2)}{" "}
              <span className="text-xl font-semibold">kg CO₂</span>
            </div>
            <p className="text-sm text-muted-foreground">
              ≈ <strong>{annualTonnes.toFixed(3)} tonnes/year</strong>
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-2">{cfg.icon}</div>
            <span
              className={`inline-block border rounded-full px-4 py-1.5 font-bold text-base ${cfg.badge}`}
            >
              {cfg.label} Emissions
            </span>
          </div>
        </div>
      </div>

      {/* Your Inputs */}
      <div
        className="bg-white rounded-2xl border border-border p-5 space-y-4"
        data-ocid="report.panel"
      >
        <h3 className="text-lg font-bold text-eco-800 flex items-center gap-2">
          📋 Your Inputs
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {/* House */}
          <div className="bg-eco-50 rounded-xl p-4 border border-eco-100">
            <p className="font-bold text-eco-700 mb-2">🏠 House / Energy</p>
            <div className="space-y-1 text-muted-foreground">
              <p>
                Electricity:{" "}
                <span className="text-foreground font-medium">
                  {formData.electricityKwh || "0"} kWh/mo
                </span>
              </p>
              <p>
                Gas:{" "}
                <span className="text-foreground font-medium">
                  {formData.gasM3 || "0"} m³/mo
                </span>
              </p>
              <p>
                Coal / Wood:{" "}
                <span className="text-foreground font-medium">
                  {formData.coalKg || "0"} kg/mo
                </span>
              </p>
              <p>
                Household size:{" "}
                <span className="text-foreground font-medium">
                  {formData.householdPeople} people
                </span>
              </p>
            </div>
          </div>
          {/* Flights */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="font-bold text-blue-700 mb-2">✈️ Flights</p>
            {formData.flights.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No flights entered
              </p>
            ) : (
              <div className="space-y-1 text-muted-foreground">
                {formData.flights.map((fl, i) => (
                  <p key={`flight-${i}-${fl.from}-${fl.to}`}>
                    {fl.from || "?"} → {fl.to || "?"} · {fl.flightClass} ·{" "}
                    {fl.trips} trip(s)
                  </p>
                ))}
              </div>
            )}
          </div>
          {/* Car */}
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <p className="font-bold text-orange-700 mb-2">🚗 Car</p>
            <div className="space-y-1 text-muted-foreground">
              <p>
                Distance/day:{" "}
                <span className="text-foreground font-medium">
                  {formData.carDistancePerDay || "0"} km
                </span>
              </p>
              <p>
                Vehicle type:{" "}
                <span className="text-foreground font-medium">
                  {formData.carVehicleType}
                </span>
              </p>
              <p>
                Fuel type:{" "}
                <span className="text-foreground font-medium">
                  {formData.carFuelType}
                </span>
              </p>
            </div>
          </div>
          {/* Motorbike */}
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <p className="font-bold text-purple-700 mb-2">🏍️ Motorbike</p>
            <div className="space-y-1 text-muted-foreground">
              <p>
                Distance/day:{" "}
                <span className="text-foreground font-medium">
                  {formData.bikeDistancePerDay || "0"} km
                </span>
              </p>
              <p>
                Bike type:{" "}
                <span className="text-foreground font-medium">
                  {formData.bikeType}
                </span>
              </p>
            </div>
          </div>
          {/* Bus & Rail */}
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
            <p className="font-bold text-yellow-700 mb-2">🚌 Bus & Rail</p>
            <div className="space-y-1 text-muted-foreground">
              <p>
                Local bus:{" "}
                <span className="text-foreground font-medium">
                  {formData.localBusKm || "0"} km/wk
                </span>
              </p>
              <p>
                Coach:{" "}
                <span className="text-foreground font-medium">
                  {formData.coachKm || "0"} km/wk
                </span>
              </p>
              <p>
                Local train:{" "}
                <span className="text-foreground font-medium">
                  {formData.localTrainKm || "0"} km/wk
                </span>
              </p>
              <p>
                Long train:{" "}
                <span className="text-foreground font-medium">
                  {formData.longTrainKm || "0"} km/wk
                </span>
              </p>
              <p>
                Taxi:{" "}
                <span className="text-foreground font-medium">
                  {formData.taxiKm || "0"} km/wk
                </span>
              </p>
            </div>
          </div>
          {/* Secondary */}
          <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
            <p className="font-bold text-pink-700 mb-2">🛍️ Secondary Spending</p>
            <div className="space-y-1 text-muted-foreground">
              <p>
                Food & Drink:{" "}
                <span className="text-foreground font-medium">
                  ₹{formData.foodDrink || "0"}/mo
                </span>
              </p>
              <p>
                Clothes:{" "}
                <span className="text-foreground font-medium">
                  ₹{formData.clothes || "0"}/mo
                </span>
              </p>
              <p>
                Electronics:{" "}
                <span className="text-foreground font-medium">
                  ₹{formData.electronics || "0"}/mo
                </span>
              </p>
              <p>
                Personal care:{" "}
                <span className="text-foreground font-medium">
                  ₹{formData.personalCare || "0"}/mo
                </span>
              </p>
              <p>
                Leisure:{" "}
                <span className="text-foreground font-medium">
                  ₹{formData.leisure || "0"}/mo
                </span>
              </p>
              <p>
                Other goods:{" "}
                <span className="text-foreground font-medium">
                  ₹{formData.otherGoods || "0"}/mo
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emissions Breakdown */}
      <div
        className="bg-white rounded-2xl border border-border p-5"
        data-ocid="report.table"
      >
        <h3 className="text-lg font-bold text-eco-800 mb-4 flex items-center gap-2">
          📊 Emissions Breakdown
        </h3>
        <div className="space-y-3">
          {breakdown.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-28 text-sm font-medium text-muted-foreground shrink-0">
                {item.label}
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full ${item.color} transition-all duration-700`}
                  style={{ width: `${Math.min(item.pct, 100)}%` }}
                />
              </div>
              <div className="w-28 text-right text-sm font-bold text-foreground shrink-0">
                {item.value.toFixed(2)} kg{" "}
                <span className="text-muted-foreground font-normal">
                  ({item.pct.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between border-t pt-3 mt-2">
            <span className="font-bold text-eco-800">Total</span>
            <span className="font-extrabold text-eco-700 text-lg">
              {total.toFixed(2)} kg CO₂/month
            </span>
          </div>
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h3 className="text-lg font-bold text-eco-800 mb-4 flex items-center gap-2">
          🌍 Environmental Impact
        </h3>
        <div className="space-y-3">
          {cfg.impacts.map((impact) => (
            <div
              key={impact}
              className="flex items-start gap-3 bg-eco-50 border border-eco-100 rounded-xl p-3"
            >
              <span className="text-eco-600 mt-0.5 shrink-0">⚠️</span>
              <p className="text-sm text-foreground leading-relaxed">
                {impact}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h3 className="text-lg font-bold text-eco-800 mb-4 flex items-center gap-2">
          💡 Recommendations
        </h3>
        <ol className="space-y-3">
          {cfg.tips.map((tip, i) => (
            <li
              key={tip}
              className="flex items-start gap-3 bg-eco-50 border border-eco-100 rounded-xl p-3"
            >
              <span className="bg-eco-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-foreground leading-relaxed">{tip}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Comparison */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h3 className="text-lg font-bold text-eco-800 mb-4 flex items-center gap-2">
          📈 How You Compare
        </h3>
        <div className="space-y-3">
          {[
            {
              label: "You",
              value: yourAnnual,
              color:
                cls === "low"
                  ? "bg-eco-500"
                  : cls === "medium"
                    ? "bg-yellow-500"
                    : "bg-red-500",
              highlight: true,
            },
            {
              label: "India Average",
              value: indiaAnnual,
              color: "bg-gray-400",
              highlight: false,
            },
            {
              label: "World Average",
              value: worldAnnual,
              color: "bg-gray-500",
              highlight: false,
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 rounded-xl p-3 ${item.highlight ? `${cfg.bg} border` : "bg-gray-50 border border-gray-100"}`}
            >
              <div className="w-28 text-sm font-medium shrink-0">
                {item.label}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-4 rounded-full ${item.color}`}
                  style={{
                    width: `${Math.min((item.value / Math.max(yourAnnual, worldAnnual, 1)) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="w-24 text-right text-sm font-bold shrink-0">
                {item.value.toFixed(2)} t/yr
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          India avg: 1.9 t/yr · World avg: 4.7 t/yr · Global target: &lt;2 t/yr
          by 2050
        </p>
      </div>

      {/* Conclusion */}
      <div className={`rounded-2xl border-2 p-5 ${cfg.bg}`}>
        <h3 className="text-lg font-bold text-eco-800 mb-3 flex items-center gap-2">
          📝 Conclusion
        </h3>
        <p className="text-sm text-foreground leading-relaxed">
          Based on your inputs, your monthly carbon footprint is{" "}
          <strong>{total.toFixed(2)} kg CO₂</strong>, equivalent to
          approximately <strong>{annualTonnes.toFixed(3)} tonnes/year</strong>.
          This is classified as{" "}
          <strong className={cfg.color}>{cfg.label} Emissions</strong>{" "}
          {cfg.icon}.{" "}
          {cls === "low" &&
            "You are already leading an eco-friendly lifestyle. Continue your green habits and encourage others to do the same to amplify positive impact."}
          {cls === "medium" &&
            "With targeted changes — particularly in energy use and transport choices — you can significantly reduce your footprint and approach the global 2-tonne target."}
          {cls === "high" &&
            "Significant lifestyle adjustments, especially reducing private vehicle use, aviation, and high-carbon energy, are needed to bring your footprint in line with sustainable global targets."}
        </p>
        <p className="text-xs text-muted-foreground mt-3">
          Report generated for academic purposes · MIT Academy of Engineering ·
          Carbon Footprint Calculator Project
        </p>
      </div>

      {/* Print Button */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2 no-print">
        <button
          type="button"
          onClick={() => window.print()}
          data-ocid="report.print_button"
          className="flex-1 bg-eco-600 hover:bg-eco-700 text-white font-bold py-4 px-6 rounded-2xl text-base shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          🖨️ Print / Download PDF
        </button>
        <button
          type="button"
          onClick={onReset}
          data-ocid="report.reset_button"
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-2xl text-base transition-all duration-200 flex items-center justify-center gap-2"
        >
          🔄 Start Over
        </button>
      </div>
    </div>
  );
}

function TabCalculator() {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const tabBarRef = useRef<HTMLDivElement>(null);

  const update = (k: keyof FormData, v: string) => {
    setFormData((prev) => ({ ...prev, [k]: v }));
  };

  const goNext = () => setActiveTab((t) => Math.min(t + 1, TABS.length - 1));
  const goBack = () => setActiveTab((t) => Math.max(t - 1, 0));

  const handleReset = () => {
    setFormData(defaultFormData);
    setActiveTab(0);
  };

  // Scroll active tab into view on mobile
  useEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    const activeEl = bar.querySelectorAll("button")[activeTab] as
      | HTMLButtonElement
      | undefined;
    activeEl?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeTab]);

  const renderTab = () => {
    switch (TABS[activeTab].id) {
      case "welcome":
        return <WelcomeTab formData={formData} update={update} />;
      case "house":
        return <HouseTab formData={formData} update={update} />;
      case "flights":
        return <FlightsTab formData={formData} setFormData={setFormData} />;
      case "car":
        return <CarTab formData={formData} update={update} />;
      case "motorbike":
        return <MotorbikeTab formData={formData} update={update} />;
      case "busrail":
        return <BusRailTab formData={formData} update={update} />;
      case "secondary":
        return <SecondaryTab formData={formData} update={update} />;
      case "results":
        return (
          <ResultsTab
            formData={formData}
            onReset={handleReset}
            setActiveTab={setActiveTab}
          />
        );
      case "report":
        return <ReportTab formData={formData} onReset={handleReset} />;
      default:
        return null;
    }
  };

  return (
    <section id="calculator" className="py-16 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-eco-100 text-eco-700 rounded-full px-4 py-1.5 mb-4 text-sm font-semibold">
            <Zap className="w-4 h-4" /> Step-by-Step Calculator
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Calculate Your Carbon Footprint
          </h2>
          <p className="text-muted-foreground">
            Complete each section to get a detailed breakdown of your CO₂
            emissions.
          </p>
        </div>

        {/* Tab bar */}
        <div
          ref={tabBarRef}
          className="tab-bar-scroll gap-2 mb-6"
          role="tablist"
        >
          {TABS.map((tab, i) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={i === activeTab}
              onClick={() => setActiveTab(i)}
              data-ocid={`calculator.${tab.id}_tab`}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                i === activeTab
                  ? "bg-eco-600 text-white shadow-md"
                  : "bg-eco-50 text-eco-700 hover:bg-eco-100 border border-eco-100"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab panel */}
        <div className="bg-card rounded-3xl border border-border shadow-card p-6 sm:p-8 min-h-[420px]">
          {renderTab()}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={activeTab === 0}
              data-ocid="calculator.back_button"
              className="flex items-center gap-2 rounded-full px-5 border-eco-300 text-eco-700 hover:bg-eco-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>

            {activeTab < TABS.length - 1 ? (
              <Button
                type="button"
                onClick={goNext}
                data-ocid="calculator.next_button"
                className="flex items-center gap-2 bg-eco-600 hover:bg-eco-700 text-white rounded-full px-6 font-semibold shadow-md"
              >
                {activeTab === 0 ? "Get Started" : "Next"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <LiveBadge formData={formData} />
    </section>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────
function AboutSection() {
  const features = [
    {
      icon: <Car className="w-6 h-6" />,
      title: "Transport",
      desc: "Track emissions from car, bike, bus, or walking based on daily commute distance.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Energy",
      desc: "Measure your household electricity consumption and its carbon equivalent.",
    },
    {
      icon: <Utensils className="w-6 h-6" />,
      title: "Lifestyle",
      desc: "Capture secondary spending impacts from food, clothing, electronics and more.",
    },
  ];

  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-eco-100 text-eco-700 rounded-full px-4 py-1.5 mb-4 text-sm font-semibold">
            <Leaf className="w-4 h-4" /> About This Project
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            About This Project
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            This system calculates your personal carbon emissions based on seven
            key daily activity categories —{" "}
            <strong className="text-foreground">transportation</strong>,{" "}
            <strong className="text-foreground">energy use</strong>, and{" "}
            <strong className="text-foreground">lifestyle spending</strong>. By
            understanding your environmental impact, you can take meaningful
            steps toward a more sustainable lifestyle and reduce your CO₂
            footprint day by day.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="card-hover bg-background rounded-2xl p-6 border border-border shadow-card text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-eco-100 flex items-center justify-center text-eco-600 mx-auto mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">
                {f.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Objectives ───────────────────────────────────────────────────────────────
function ObjectivesSection() {
  const objectives = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Calculate Carbon Footprint",
      desc: "Accurately measure daily CO₂ emissions from individual lifestyle choices.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analyze Lifestyle Impact",
      desc: "Understand how daily habits — transport, food, and energy — affect the planet.",
    },
    {
      icon: <TrendingDown className="w-6 h-6" />,
      title: "Classify Emissions",
      desc: "Categorize your footprint as Low, Medium, or High based on standard thresholds.",
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Provide Suggestions",
      desc: "Offer personalized, actionable recommendations to lower your environmental impact.",
    },
    {
      icon: <TreePine className="w-6 h-6" />,
      title: "Promote Eco-Friendly Habits",
      desc: "Inspire behavioral change by highlighting the benefits of sustainable living.",
    },
  ];

  return (
    <section id="objectives" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-eco-100 text-eco-700 rounded-full px-4 py-1.5 mb-4 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Our Goals
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Our Objectives
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Five core goals that guide this project toward a measurable
            environmental impact.
          </p>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          data-ocid="objectives.list"
        >
          {objectives.map((obj, i) => (
            <div
              key={obj.title}
              data-ocid={`objectives.item.${i + 1}`}
              className="card-hover bg-card rounded-2xl p-6 border border-border shadow-card"
            >
              <div className="w-12 h-12 rounded-xl bg-eco-100 flex items-center justify-center text-eco-600 mb-4">
                {obj.icon}
              </div>
              <h3 className="font-bold text-base text-foreground mb-2">
                {obj.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {obj.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Methodology ──────────────────────────────────────────────────────────────
function MethodologySection() {
  const [diagramTab, setDiagramTab] = useState<"flowchart" | "mindmap">(
    "flowchart",
  );
  const steps = [
    {
      n: 1,
      title: "Input Collection",
      desc: "Gather transport, energy, and spending data from the user.",
      icon: <Users className="w-5 h-5" />,
    },
    {
      n: 2,
      title: "Assign Emission Factors",
      desc: "Apply standardized CO₂ emission factors per unit for each activity.",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      n: 3,
      title: "Calculate Emissions",
      desc: "Multiply usage data by emission factors to compute category emissions.",
      icon: <Zap className="w-5 h-5" />,
    },
    {
      n: 4,
      title: "Total CO₂ Calculation",
      desc: "Sum all category emissions to derive the total monthly carbon footprint.",
      icon: <Globe className="w-5 h-5" />,
    },
    {
      n: 5,
      title: "Classification",
      desc: "Classify the total into Low (<100 kg), Medium (100–300 kg), or High (>300 kg) per month.",
      icon: <TrendingDown className="w-5 h-5" />,
    },
    {
      n: 6,
      title: "Suggestion Generation",
      desc: "Generate targeted, actionable eco-friendly recommendations based on classification.",
      icon: <Lightbulb className="w-5 h-5" />,
    },
  ];

  return (
    <section id="methodology" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-eco-100 text-eco-700 rounded-full px-4 py-1.5 mb-4 text-sm font-semibold">
            <ChevronRight className="w-4 h-4" /> How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Methodology
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A systematic six-step process to accurately measure and act on your
            carbon emissions.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {steps.map((step) => (
            <div
              key={step.n}
              className="card-hover bg-background rounded-2xl p-6 border border-border shadow-card"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-eco-600 flex items-center justify-center text-white font-bold text-sm">
                  {step.n}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-eco-500">{step.icon}</span>
                    <h3 className="font-bold text-sm text-foreground">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Diagram Tabs */}
        <div className="rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="flex border-b border-border bg-eco-50">
            <button
              type="button"
              onClick={() => setDiagramTab("flowchart")}
              className={`flex-1 py-3 px-6 text-sm font-semibold transition-all duration-200 ${diagramTab === "flowchart" ? "bg-eco-600 text-white shadow-inner" : "text-eco-700 hover:bg-eco-100"}`}
            >
              📊 Flowchart Diagram
            </button>
            <button
              type="button"
              onClick={() => setDiagramTab("mindmap")}
              className={`flex-1 py-3 px-6 text-sm font-semibold transition-all duration-200 ${diagramTab === "mindmap" ? "bg-eco-600 text-white shadow-inner" : "text-eco-700 hover:bg-eco-100"}`}
            >
              🧠 Mind Map
            </button>
          </div>
          <div className="p-4 bg-white">
            {diagramTab === "flowchart" ? (
              <img
                src="/assets/generated/flowchart-clear.dim_1600x900.png"
                alt="Carbon Footprint Calculator Flowchart"
                className="w-full rounded-xl object-contain max-h-[600px]"
              />
            ) : (
              <img
                src="/assets/uploads/image-019d2eb8-82b2-708a-82f2-2e6bab4702e7-2.png"
                alt="Carbon Footprint Calculator Mind Map"
                className="w-full rounded-xl object-contain max-h-[700px]"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Team ─────────────────────────────────────────────────────────────────────
function TeamSection() {
  const team = [
    { name: "Abhay Gaikwad", role: "Team Member", initials: "AG" },
    { name: "Jeet Kshirsagar", role: "Team Member", initials: "JK" },
    { name: "Parth Isekar", role: "Team Member", initials: "PI" },
    { name: "Parth Sugandhi", role: "Team Member", initials: "PS" },
  ];

  return (
    <section id="team" className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-eco-100 text-eco-700 rounded-full px-4 py-1.5 mb-4 text-sm font-semibold">
            <Users className="w-4 h-4" /> The Team
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Our Team
          </h2>
          <p className="text-muted-foreground text-lg">
            The minds behind this eco-awareness project.
          </p>
          <p className="text-eco-600 font-semibold mt-2">
            MIT Academy of Engineering
          </p>
        </div>
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-6"
          data-ocid="team.list"
        >
          {team.map((member, i) => (
            <div
              key={member.name}
              data-ocid={`team.item.${i + 1}`}
              className="card-hover flex flex-col items-center text-center bg-background rounded-2xl border border-border shadow-card p-6"
            >
              <div className="w-16 h-16 rounded-full bg-eco-600 flex items-center justify-center text-white font-bold text-xl mb-3 shadow-md">
                {member.initials}
              </div>
              <h3 className="font-bold text-sm text-foreground">
                {member.name}
              </h3>
              <p className="text-muted-foreground text-xs mt-1">
                {member.role}
              </p>
              <div className="mt-3 w-8 h-1 rounded-full bg-eco-400" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const year = new Date().getFullYear();
  const utmUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="footer-bg text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-eco-500 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-base">
                Carbon Footprint Calculator
              </span>
            </div>
            <p className="text-eco-300 text-sm leading-relaxed">
              A college project by MIT Academy of Engineering aimed at raising
              eco-awareness and promoting sustainable living.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-eco-200 text-sm uppercase tracking-wider mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {["Home", "About", "Calculator", "Team"].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="text-eco-300 hover:text-white text-sm transition-colors duration-150"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-eco-200 text-sm uppercase tracking-wider mb-3">
              Project Info
            </h4>
            <div className="space-y-2 text-sm text-eco-300">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-eco-400" />
                MIT Academy of Engineering
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-eco-400" />
                Department of Computer Science
              </div>
              <div className="flex items-center gap-2">
                <TreePine className="w-4 h-4 text-eco-400" />
                For a Greener Tomorrow
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-eco-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-eco-400">
          <span>
            © {year} Carbon Footprint Calculator · MIT Academy of Engineering.
            All Rights Reserved.
          </span>
          <span>
            Built with ❤️ using{" "}
            <a
              href={utmUrl}
              className="text-eco-300 hover:text-white underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div className="min-h-screen font-poppins">
      <Navbar />
      <main>
        <HeroSection />
        <TabCalculator />
        <AboutSection />
        <ObjectivesSection />
        <MethodologySection />
        <TeamSection />
      </main>
      <Footer />
    </div>
  );
}
