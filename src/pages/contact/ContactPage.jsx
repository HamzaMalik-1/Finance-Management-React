import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Phone, Search, MoreVertical, ExternalLink } from 'lucide-react';
import { useGetContactsQuery } from '../../store/api/contactApi';

const ContactPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { data: response, isLoading } = useGetContactsQuery(user?.id);
  const contacts = response?.data || [];
  const [search, setSearch] = useState("");

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-zinc-900 tracking-tight dark:text-zinc-100">Directory</h2>
        <p className="text-zinc-500 font-medium">Manage your financial network</p>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
        <input 
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
        />
      </div>

      {/* Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-20 text-center animate-pulse text-zinc-400 font-bold">Loading Directory...</div>
        ) : filteredContacts.map((contact, idx) => (
          <ContactCard key={contact.id} contact={contact} index={idx} />
        ))}
      </div>
    </div>
  );
};

const ContactCard = ({ contact, index }) => {
  // Logic to determine color based on net balance (if your backend provides it)
  // Let's assume netBalance is provided: positive = they owe you, negative = you owe them
  const isOwed = (contact.netBalance || 0) > 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner">
          {contact.name.charAt(0)}
        </div>
        <button className="p-2 text-zinc-300 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{contact.name}</h3>
        <p className="flex items-center gap-2 text-zinc-500 text-sm font-medium mt-1">
          <Phone size={14} className="text-zinc-300" />
          {contact.phoneNumber || 'No phone recorded'}
        </p>
      </div>

      <div className="pt-5 border-t border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Total Position</p>
          <p className={`text-lg font-black ${isOwed ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isOwed ? '+' : ''}${Math.abs(contact.netBalance || 0).toLocaleString()}
          </p>
        </div>
        <button className="p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-indigo-600 rounded-2xl transition-all group-hover:scale-110">
          <ExternalLink size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default ContactPage;