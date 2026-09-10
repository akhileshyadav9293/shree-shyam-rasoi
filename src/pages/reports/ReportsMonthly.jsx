import { FileText } from 'lucide-react';

export default function ReportsMonthly() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Monthly Report</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Summary of this month's activities</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
        <FileText className="w-12 h-12 text-blue-300 dark:text-blue-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Detailed Monthly Reports</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Soon you will be able to export a PDF containing the entire month's delivery logs, total expenses, and comprehensive revenue reports.
        </p>
      </div>
    </div>
  );
}
