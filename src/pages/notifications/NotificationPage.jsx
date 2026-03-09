import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  CheckCheck, 
  AlertCircle, 
  Wallet, 
  Info, 
  Zap, 
  ChevronRight 
} from 'lucide-react';
import { 
  useGetNotificationsQuery, 
  useMarkReadMutation, 
  useMarkAllReadMutation 
} from '../../store/api/notificationApi';
import { formatDistanceToNow } from 'date-fns';

const NotificationPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const { data: response, isLoading } = useGetNotificationsQuery(user?.id);
  const [markRead] = useMarkReadMutation();
  const [markAllRead] = useMarkAllReadMutation();

  const notifications = response?.data?.list || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      await markRead(n.id).unwrap();
    }
    // If the notification has a deep link (e.g. /main/budgets), navigate there
    if (n.link) {
      navigate(n.link);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'budget_exceeded': return <AlertCircle className="text-rose-500" />;
      case 'budget_warning': return <Zap className="text-amber-500" />;
      case 'debt_settled': return <Wallet className="text-emerald-500" />;
      default: return <Info className="text-indigo-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header Section */}
      <header className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 italic uppercase tracking-tighter">
            Alert Center
          </h2>
          <p className="text-zinc-500 font-medium">
            You have <span className="text-indigo-600 font-bold">{unreadCount}</span> unread updates
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={() => markAllRead(user.id)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-4 py-2 rounded-xl transition-all"
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </header>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-800/50 rounded-[2rem]" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-24 text-center bg-zinc-50 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Bell size={40} className="text-zinc-200" />
            </div>
            <p className="text-zinc-400 font-black uppercase text-xs tracking-widest">
              Silence is golden. All caught up!
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => handleNotificationClick(n)}
                className={`relative p-6 rounded-[2.2rem] border transition-all cursor-pointer group ${
                  n.isRead 
                  ? 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 opacity-60' 
                  : 'bg-indigo-50/40 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/20 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex gap-5">
                  <div className="mt-1 p-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm">
                    {getIcon(n.type)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        {n.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pr-2">
                      <p className={`text-sm leading-relaxed max-w-[90%] ${
                        n.isRead ? 'text-zinc-600' : 'text-zinc-900 dark:text-zinc-100 font-bold'
                      }`}>
                        {n.message}
                      </p>
                      {n.link && (
                        <ChevronRight size={18} className="text-zinc-300 group-hover:text-indigo-500 transition-colors" />
                      )}
                    </div>
                  </div>
                </div>

                {!n.isRead && (
                  <div className="absolute top-6 right-6 w-2.5 h-2.5 bg-indigo-600 rounded-full border-2 border-white dark:border-zinc-900" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;