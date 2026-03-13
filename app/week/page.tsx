import WeekGrid from "@/components/WeekGrid";

export default function WeekPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Weekoverzicht
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Overzicht van je geregistreerde uren per week.
        </p>
      </div>
      <WeekGrid />
    </div>
  );
}
