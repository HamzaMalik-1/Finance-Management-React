import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCheck,
  AlertCircle,
  Wallet,
  Info,
  Zap,
  Check,
} from "lucide-react";
import {
  useGetNotificationsQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} from "../../store/api/notificationApi";
import { formatDistanceToNow } from "date-fns";
import { useTranslation, Trans } from "react-i18next";

const NotificationPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ur";
  const { user } = useSelector((state) => state.auth);
  
  // ✅ State for Filter
  const [filter, setFilter] = useState("all");

  const { data: response, isLoading } = useGetNotificationsQuery(user?.id);
  const [markRead] = useMarkReadMutation();
  const [markAllRead] = useMarkAllReadMutation();

  const notifications = response?.data?.list || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ✅ Filtering Logic
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const handleNotificationClick = async (n) => {
    if (!n.isRead) await markRead(n.id).unwrap();
    if (n.link) navigate(n.link);
  };

  const getIcon = (type) => {
    switch (type) {
      case "budget_exceeded": return <AlertCircle className="text-rose-500" />;
      case "budget_warning": return <Zap className="text-amber-500" />;
      case "debt_settled": return <Wallet className="text-emerald-500" />;
      default: return <Info className="text-indigo-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-1" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4 px-1">
        <div>
          <h2 className="text-3xl font-black text-app uppercase tracking-tighter">
            {t("notifications.title")}
          </h2>
          <p className="text-zinc-500 font-medium">
            <Trans i18nKey="notifications.subtitle" values={{ count: unreadCount }}>
              You have <span className="text-indigo-500 font-bold">{{unreadCount}}</span> unread updates
            </Trans>
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead(user.id)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:bg-indigo-500/10 px-4 py-2 rounded-xl transition-all border border-indigo-500/20"
          >
            <CheckCheck size={16} /> {t("notifications.mark_all")}
          </button>
        )}
      </header>

      {/* ✅ Centered Filter Bar */}
      <div className="flex justify-center w-full py-2">
        <div className="flex p-1.5 bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm gap-1 shadow-2xl">
          {["all", "unread", "read"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                filter === f
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              {/* ✅ Correctly resolving lowercase keys */}
              {t(`notifications.filters.${f}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-zinc-900 border border-zinc-800 rounded-[2.2rem]" />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-24 text-center bg-zinc-950 border border-dashed border-zinc-800 rounded-[3rem]">
            <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-zinc-800">
              <Bell size={40} className="text-zinc-800" />
            </div>
            <p className="text-zinc-600 font-black uppercase text-[10px] tracking-widest px-4">
              {/* ✅ Specific empty states for filters */}
              {filter === "all" ? t("notifications.empty_state") : t(`notifications.empty_${filter}`)}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => handleNotificationClick(n)}
                className={`relative p-6 rounded-[2.2rem] border cursor-pointer group transition-all bg-zinc-950 border-zinc-800 ${
                  n.isRead ? "opacity-40" : "opacity-100 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                }`}
              >
                <div className="flex gap-5">
                  <div className="mt-1 p-3 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-inner h-fit">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        {t(`notifications.types.${n.type}`) || n.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded tabular-nums border border-zinc-800">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pr-2">
                      <p className={`text-sm leading-relaxed max-w-[90%] ${
                        n.isRead ? "text-zinc-400" : "text-zinc-100 font-bold"
                      }`}>
                        {n.message}
                      </p>
                      <Check
                        size={18}
                        className={`transition-colors ${
                          n.isRead ? "text-emerald-500" : "text-zinc-800 group-hover:text-indigo-500"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {!n.isRead && (
                  <div className={`absolute top-6 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] ${isRTL ? "left-6" : "right-6"}`} />
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