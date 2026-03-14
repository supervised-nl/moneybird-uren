import TimeEntryForm from "@/components/TimeEntryForm";

export default function HomePage() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Uren loggen
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Registreer je uren snel en direct.
        </p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <TimeEntryForm />
      </div>
    </div>
  );
}
