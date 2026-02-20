import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Calendar, User, Wallet, 
  ArrowUpRight, ArrowDownLeft, Plus, History 
} from 'lucide-react';
import { useGetDebtDetailsQuery } from '../../store/api/debtApi';
import moment from 'moment';
import AddRepaymentModal from './AddRepaymentModal';

const DebtDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: response, isLoading } = useGetDebtDetailsQuery(id);
  const debt = response?.data;

  if (isLoading) return <div className="p-20 text-center animate-pulse text-zinc-400 font-bold">Synchronizing Ledger...</div>;
  if (!debt) return <div className="p-20 text-center text-zinc-500 font-bold">Debt record not found.</div>;

  const isLent = debt.type === 'lent';
  const paidAmount = parseFloat(debt.amount) - parseFloat(debt.remainingAmount);
  const progress = (paidAmount / parseFloat(debt.amount)) * 100;


  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);

  return (
    <div className="space-y-8 pb-10 max-w-4xl mx-auto">
      {/* Back Button & Header */}
      


<AddRepaymentModal 
  isOpen={isRepayModalOpen} 
  onClose={() => setIsRepayModalOpen(false)} 
  debt={debt} 
/>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white border border-zinc-200 rounded-2xl text-zinc-500 hover:bg-zinc-50 transition-colors shadow-sm"
        >
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Debt Details</h2>
          <p className="text-zinc-500 text-sm font-medium">Tracking history with {debt.contactPerson?.name}</p>
        </div>
      </div>

      {/* Hero Stats Card */}
      <div className="bg-white rounded-[2.5rem] border border-zinc-200 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
              isLent ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {isLent ? 'Money Receivable' : 'Money Payable'}
            </span>
            <h3 className="text-5xl font-black text-zinc-900 mt-4 tracking-tighter">
              ${parseFloat(debt.remainingAmount).toLocaleString()}
            </h3>
            <p className="text-zinc-400 font-bold mt-1 uppercase text-xs tracking-widest">Remaining Balance</p>
          </div>
          
          <div className="flex gap-3">
             <button onClick={() => setIsRepayModalOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-2">
                <Plus size={18} strokeWidth={3} /> Repay
             </button>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-black uppercase tracking-widest text-zinc-400 px-1">
            <span>Settled: ${paidAmount.toLocaleString()}</span>
            <span>Total: ${parseFloat(debt.amount).toLocaleString()}</span>
          </div>
          <div className="h-4 bg-zinc-100 rounded-full overflow-hidden p-1 border border-zinc-50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={`h-full rounded-full ${isLent ? 'bg-emerald-500' : 'bg-indigo-600'}`}
            />
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <InfoBlock icon={<Calendar />} label="Created On" value={moment(debt.createdAt).format('MMM DD, YYYY')} />
         <InfoBlock icon={<Wallet />} label="Account" value={debt.Account?.name || 'Cash'} />
         <InfoBlock icon={<User />} label="Person" value={debt.contactPerson?.name} />
      </div>

      {/* Timeline Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <History size={20} className="text-zinc-400" />
          <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Timeline</h3>
        </div>

        <div className="relative ml-4 pl-8 border-l-2 border-zinc-100 space-y-8">
          {/* Initial Debt Entry */}
          <TimelineItem 
            date={debt.createdAt} 
            title="Initial Debt Created" 
            amount={debt.amount}
            type="initial"
          />

          {/* Repayment entries mapping (Assuming debt has an array of Transactions) */}
          {debt.Transactions?.map((tx, idx) => (
            <TimelineItem 
              key={tx.id}
              date={tx.createdAt} 
              title="Repayment Received" 
              amount={tx.amount}
              type="payment"
            />
          ))}

          {debt.status === 'paid' && (
            <div className="absolute -bottom-2 -left-3 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-sm flex items-center justify-center">
               <ArrowUpRight size={12} className="text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoBlock = ({ icon, label, value }) => (
  <div className="bg-white border border-zinc-200 p-5 rounded-3xl flex items-center gap-4 shadow-sm">
    <div className="text-indigo-500 bg-indigo-50 p-2.5 rounded-xl">{icon}</div>
    <div>
      <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest leading-none mb-1">{label}</p>
      <p className="text-zinc-900 font-bold">{value}</p>
    </div>
  </div>
);

const TimelineItem = ({ date, title, amount, type }) => (
  <div className="relative">
    <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm ${
      type === 'initial' ? 'bg-zinc-900' : 'bg-indigo-500'
    }`} />
    <div className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm flex justify-between items-center">
      <div>
        <p className="text-xs text-zinc-400 font-bold">{moment(date).format('MMM DD, YYYY · hh:mm A')}</p>
        <h4 className="font-bold text-zinc-900">{title}</h4>
      </div>
      <div className="text-right">
        <p className={`text-lg font-black ${type === 'initial' ? 'text-zinc-900' : 'text-indigo-600'}`}>
          {type === 'initial' ? '' : '-'}${parseFloat(amount).toLocaleString()}
        </p>
      </div>
    </div>
  </div>
);

export default DebtDetailsPage;