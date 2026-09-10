import React from 'react';

export default function PrintableBill({ customer }) {
  if (!customer) return null;

  const currentMonthName = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });
  const remaining = Math.max(0, (Number(customer.monthlyPrice) || 0) - (Number(customer.advance) || 0));

  return (
    <div className="print-only fixed inset-0 bg-white z-9999 p-8 text-black" style={{ display: 'none' }}>
      <div className="max-w-2xl mx-auto border-2 border-gray-800 p-8 rounded-2xl relative">
        {/* Header / Logo Section */}
        <div className="flex items-center justify-between border-b-2 border-gray-200 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <img src="/logo.jpg" alt="Shree Shyam Rasoi" className="w-24 h-24 object-contain rounded-full border-4 border-primary-500" onError={(e) => e.target.style.display = 'none'} />
            <div>
              <h1 className="text-3xl font-extrabold text-primary-700 tracking-tight">SHREE SHYAM RASOI</h1>
              <p className="text-gray-600 font-medium italic mt-1">"Ghar jaisa swad" — Shuddh, Swachh, Sattvic Khana</p>
              <p className="text-sm text-gray-500 font-semibold">Tiffin Seva - Ghar ya office tak uplabdh</p>
            </div>
          </div>
        </div>


        {/* Bill Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-gray-800 border-b-2 border-gray-800 inline-block pb-1">
            {customer.serviceType === 'weekly' ? 'Weekly' : customer.serviceType === 'custom' ? 'Custom' : 'Monthly'} Bill
          </h2>
          <p className="text-gray-500 mt-2 font-medium">{currentMonthName}</p>
        </div>

        {/* Customer Details */}
        <div className="mb-8">
          <p className="text-gray-500 font-medium mb-2 text-sm uppercase tracking-wider">Billed To:</p>
          <p className="text-xl font-bold text-gray-900">{customer.name}</p>
          <p className="text-gray-700 font-medium">📞 {customer.phone}</p>
          <p className="text-gray-600">📍 {customer.address}</p>
        </div>

        {/* Invoice Table */}
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="bg-primary-50 border-y-2 border-primary-200">
              <th className="py-3 px-4 text-primary-800 font-bold w-1/2">Description</th>
              <th className="py-3 px-4 text-primary-800 font-bold text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-4 px-4">
                <p className="font-semibold text-gray-800 capitalize">Tiffin Plan: {customer.plan}</p>
                <p className="text-sm text-gray-500 mt-1">Rate: ₹{customer.tiffinRate || 0} / tiffin</p>
              </td>
              <td className="py-4 px-4 text-right font-medium text-gray-800">
                ₹{customer.monthlyAmount || 0}
              </td>
            </tr>
            {Number(customer.adjustmentAmount) > 0 && (
              <tr>
                <td className="py-3 px-4 text-amber-600 font-medium">
                  Adjusted Amount {Number(customer.skippedDays) > 0 ? `(${customer.skippedDays} skipped days)` : ''}
                </td>
                <td className="py-3 px-4 text-right text-red-600 font-semibold">- ₹{customer.adjustmentAmount}</td>
              </tr>
            )}
            {customer.discount > 0 && (
              <tr>
                <td className="py-3 px-4 text-gray-600 font-medium">Discount Applied</td>
                <td className="py-3 px-4 text-right text-red-600 font-semibold">- ₹{customer.discount}</td>
              </tr>
            )}
            <tr className="bg-gray-50">
              <td className="py-3 px-4 font-bold text-gray-800">Net Total</td>
              <td className="py-3 px-4 text-right font-bold text-gray-900">₹{customer.monthlyPrice || 0}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-gray-600 font-medium">Advance Paid</td>
              <td className="py-3 px-4 text-right text-green-600 font-semibold">₹{customer.advance || 0}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-800 bg-gray-50">
              <th className="py-4 px-4 text-lg font-extrabold text-gray-900">Total Due Amount</th>
              <th className={`py-4 px-4 text-right text-xl font-extrabold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{remaining}
              </th>
            </tr>
          </tfoot>
        </table>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-4 text-sm mt-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div>
            <p className="text-gray-500 font-medium mb-1">Contact Us</p>
            <p className="font-bold text-gray-800">📱 +91 9165360293</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1">Location</p>
            <p className="font-semibold text-gray-800">Lakshya Vihar-2, Near Palash Parisar-1</p>
            <p className="text-gray-600">Pulak City, Silicon City, Rau, Indore</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12 pt-8 border-t-2 border-gray-200">
          <p className="font-bold text-gray-800 text-lg">Thank You for choosing us!</p>
          <p className="text-gray-500 text-sm mt-1">Please make the payment by the due date.</p>
        </div>
      </div>
    </div>
  );
}
