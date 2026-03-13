import WeekGrid from "@/components/WeekGrid";

export default function WeekPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Weekoverzicht
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Overzicht van je geregistreerde uren per week.
        </p>
      </div>
      <WeekGrid />
    </div>
  );
}
