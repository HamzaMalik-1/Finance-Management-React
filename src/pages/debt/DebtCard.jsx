const DebtCard = ({ debt }) => {
  const isLent = debt.type === 'lent';
  const progress = ((parseFloat(debt.amount) - parseFloat(debt.remainingAmount)) / parseFloat(debt.amount)) * 100;

  return (
    <div className="group flex items-center justify-between p-6 hover:bg-zinc-50 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        {/* Avatar/Initials */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm ${
          isLent ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
        }`}>
          {debt.contactPerson?.name?.charAt(0) || 'D'}
        </div>

        <div className="flex-1">
          <h4 className="font-bold text-zinc-900 text-lg flex items-center gap-2">
            {debt.contactPerson?.name}
            {debt.status === 'paid' && <span className="text-[10px] bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full uppercase">Settled</span>}
          </h4>
          <div className="flex items-center gap-3 mt-1">
             <p className="text-sm text-zinc-500 font-medium flex items-center gap-1 uppercase tracking-tighter">
               {isLent ? 'Receivable' : 'Payable'}
             </p>
             <span className="w-1 h-1 rounded-full bg-zinc-300" />
             <p className="text-sm text-zinc-400 italic">via {debt.Account?.name || 'Cash'}</p>
          </div>
        </div>
      </div>

      <div className="text-right">
        <h3 className={`text-xl font-black ${isLent ? 'text-emerald-600' : 'text-rose-600'}`}>
          ${parseFloat(debt.remainingAmount).toLocaleString()}
        </h3>
        {/* Simple Progress Bar */}
        <div className="w-32 h-1.5 bg-zinc-100 rounded-full mt-2 overflow-hidden ml-auto">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full ${isLent ? 'bg-emerald-500' : 'bg-rose-500'}`}
          />
        </div>
      </div>
    </div>
  );
};