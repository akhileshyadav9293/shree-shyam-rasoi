import { FileText } from 'lucide-react';

export default function ReportsDaily() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Daily Report</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Summary of today's activities</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
        <FileText className="w-12 h-12 text-primary-300 dark:text-primary-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Detailed Daily Reports</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Soon you will be able to export a PDF containing today's total deliveries, expenses incurred, and payments collected.
        </p>
      </div>
    </div>
  );
}
