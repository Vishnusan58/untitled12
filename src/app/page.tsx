import { CgpaCalculator } from "@/components/cgpa-calculator"

export default function Home() {
  return (
      <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-gray-800 dark:text-gray-100">
            CGPA Calculator
          </h1>
          <p className="text-center mb-8 text-gray-600 dark:text-gray-300">
            Calculate your Cumulative Grade Point Average based on Anna University 2021 grade system
          </p>
          <CgpaCalculator />
        </div>
      </main>
  )
}