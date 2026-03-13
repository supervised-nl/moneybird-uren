import TimeEntryForm from "@/components/TimeEntryForm";

export default function HomePage() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Uren loggen
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Registreer je uren snel en direct in Moneybird.
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-card border border-slate-200 dark:border-slate-700 p-6">
        <TimeEntryForm />
      </div>
    </div>
  );
}
