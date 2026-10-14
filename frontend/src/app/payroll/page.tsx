'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import StatCard from '@/components/StatCard';
import { api } from '@/lib/api';
import { PayrollRecord } from '@/lib/types';
import { useToast } from '@/context/ToastContext';
import {
  Banknote,
  Printer,
  Download,
  CreditCard,
  ShieldCheck,
  Building2,
  FileText,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function PayrollPage() {
  const { addToast } = useToast();
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('October 2026');
  const [viewingSlip, setViewingSlip] = useState<PayrollRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadPayroll = async () => {
    const list = await api.getPayroll();
    setPayroll(list);
  };

  useEffect(() => {
    loadPayroll();
  }, []);

  const totalDisbursed = payroll.reduce((acc, curr) => acc + curr.netSalary, 0);
  const totalGross = payroll.reduce((acc, curr) => acc + curr.grossSalary, 0);
  const totalTax = payroll.reduce((acc, curr) => acc + curr.taxDeduction, 0);
  const totalPf = payroll.reduce((acc, curr) => acc + curr.providentFund, 0);

  const handleProcessPayroll = async () => {
    setIsProcessing(true);
    await api.processPayroll(selectedMonth);
    await loadPayroll();
    setIsProcessing(false);
    addToast(
      'success',
      'Batch Disbursed',
      `Payroll batch for ${selectedMonth} processed and bank 1Link files generated.`
    );
  };

  const printPayslip = () => {
    addToast('info', 'Printing Payslip', 'Preparing confidential payslip document for printing...');
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Header
        title="Payroll & Compensation Governance"
        subtitle="Manage salary disbursements, FBR Section 149 withholding and provident fund"
        onClockAction={loadPayroll}
      />

      <main className="p-8 space-y-6 max-w-7xl mx-auto w-full animate-fadeIn">
        {/* 4 Financial Stat Cards in PKR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Net Salary Disbursed"
            value={`₨ ${(totalDisbursed / 1000000).toFixed(2)}M`}
            subtitle="Credited to employee bank accounts"
            isPositive={true}
            icon={Banknote}
            iconColor="text-emerald-600 dark:text-emerald-400"
            iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          />
          <StatCard
            title="Gross Payroll Cost"
            value={`₨ ${(totalGross / 1000000).toFixed(2)}M`}
            subtitle="Basic pay + allowances"
            icon={Building2}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBg="bg-blue-50 dark:bg-blue-950/40"
          />
          <StatCard
            title="FBR Income Tax Withheld"
            value={`₨ ${(totalTax / 1000).toLocaleString()}k`}
            subtitle="Section 149 statutory deposit"
            isPositive={true}
            icon={ShieldCheck}
            iconColor="text-amber-600 dark:text-amber-400"
            iconBg="bg-amber-50 dark:bg-amber-950/40"
          />
          <StatCard
            title="Provident Fund"
            value={`₨ ${(totalPf / 1000).toLocaleString()}k`}
            subtitle="Corporate matched trust pool"
            icon={CreditCard}
            iconColor="text-indigo-600 dark:text-indigo-400"
            iconBg="bg-indigo-50 dark:bg-indigo-950/40"
          />
        </div>

        {/* Action Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Payroll Cycle:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="October 2026">October 2026</option>
              <option value="September 2026">September 2026</option>
              <option value="August 2026">August 2026</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleProcessPayroll}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Processing Batch...' : 'Disburse Monthly Payroll'}</span>
            </button>
          </div>
        </div>

        {/* Payroll Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200/90 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-4">Basic Pay (PKR)</th>
                  <th className="py-3.5 px-4">Allowances</th>
                  <th className="py-3.5 px-4">Gross Pay</th>
                  <th className="py-3.5 px-4">FBR Tax</th>
                  <th className="py-3.5 px-4">Net Salary</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {payroll.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-6">
                      <p className="font-bold text-slate-900 dark:text-white">{pay.employeeName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {pay.employeeCode} &bull; {pay.designation}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      ₨ {pay.basicSalary.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      ₨ {(pay.medicalAllowance + pay.conveyanceAllowance).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                      ₨ {pay.grossSalary.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-rose-600 dark:text-rose-400">
                      -₨ {pay.taxDeduction.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      ₨ {pay.netSalary.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge status={pay.paymentStatus} />
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => setViewingSlip(pay)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-lg transition-colors inline-flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Slip</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Corporate Payslip Modal */}
      <Modal
        isOpen={!!viewingSlip}
        onClose={() => setViewingSlip(null)}
        title="Official Corporate Salary Slip"
        subtitle={viewingSlip ? `${viewingSlip.employeeName} • ${viewingSlip.month}` : ''}
        maxWidth="max-w-2xl"
      >
        {viewingSlip && (
          <div className="space-y-6 print:p-0">
            {/* Payslip Header */}
            <div className="p-5 rounded-xl bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border border-slate-800">
              <div>
                <h4 className="font-bold text-base tracking-tight">PAKISTAN ENTERPRISE HRMS LTD.</h4>
                <p className="text-xs text-slate-300">Confidential Employee Earnings & Deduction Statement</p>
                <p className="text-[11px] font-mono text-slate-400 mt-1">
                  Tax Year 2026-2027 &bull; NTN: 9482710-3
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-600 text-white">
                  {viewingSlip.month}
                </span>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  Ref: {viewingSlip.id}
                </p>
              </div>
            </div>

            {/* Employee Data Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase">Employee Name</span>
                <p className="font-bold text-slate-800 dark:text-white">{viewingSlip.employeeName}</p>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase">Employee Code</span>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{viewingSlip.employeeCode}</p>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase">Designation</span>
                <p className="font-medium text-slate-800 dark:text-slate-200">{viewingSlip.designation}</p>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase">Department</span>
                <p className="font-medium text-slate-800 dark:text-slate-200">{viewingSlip.department}</p>
              </div>
            </div>

            {/* Earnings and Deductions Two-Column Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Earnings */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                  Earnings (PKR)
                </div>
                <div className="p-4 space-y-2.5 bg-white dark:bg-slate-900/50">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Basic Salary</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-white">₨ {viewingSlip.basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Medical Allowance</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-white">₨ {viewingSlip.medicalAllowance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Conveyance Allowance</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-white">₨ {viewingSlip.conveyanceAllowance.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>Total Gross Pay</span>
                    <span className="font-mono">₨ {viewingSlip.grossSalary.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                  Deductions (PKR)
                </div>
                <div className="p-4 space-y-2.5 bg-white dark:bg-slate-900/50">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">FBR Income Tax</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-medium">-₨ {viewingSlip.taxDeduction.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Provident Fund (Staff)</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-medium">-₨ {viewingSlip.providentFund.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">EOBI Contribution</span>
                    <span className="font-mono text-slate-400 dark:text-slate-500">₨ 0</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-rose-600 dark:text-rose-400">
                    <span>Total Deductions</span>
                    <span className="font-mono">-₨ {(viewingSlip.taxDeduction + viewingSlip.providentFund).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Banner */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">NET SALARY PAYABLE</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                  Transferred via 1Link: {viewingSlip.bankAccount}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-emerald-800 dark:text-emerald-300">
                  ₨ {viewingSlip.netSalary.toLocaleString()}
                </span>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Status: {viewingSlip.paymentStatus}</p>
              </div>
            </div>

            {/* Print and Actions */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                Computer-generated statement. No physical signature required.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewingSlip(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={printPayslip}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Payslip</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
