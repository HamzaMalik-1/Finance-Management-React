import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useRtl } from '../../hooks/useRtl';
import * as Icons from 'lucide-react';
import { 
  Plus, Search, ChevronRight, Edit2, Trash2, FolderPlus, HelpCircle 
} from 'lucide-react';

import { 
  useGetCategoryTreeQuery, 
  useDeleteCategoryMutation 
} from '../../store/api/categoryApi';
import AddCategoryModal from './CategoryModal';
import AddSubCategoryModal from './SubCategoryModal';
import ConfirmDialog from '../../components/ConfirmDialog';

/** DYNAMIC ICON COMPONENT **/
const DynamicIcon = ({ name, size = 20, ...props }) => {
  const formatIconName = (str) => {
    if (!str) return 'Layout';
    return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  };
  const IconComponent = Icons[formatIconName(name)] || HelpCircle;
  return <IconComponent size={size} {...props} />;
};

/** ICON BOX: Reusable for both Parent and Sub **/
const IconBox = ({ name, color, isSub = false }) => {
  const size = isSub ? 16 : 22;
  return (
    <div 
      className={`${isSub ? 'p-2 rounded-xl' : 'p-3 rounded-2xl'} transition-all shadow-sm flex items-center justify-center flex-shrink-0`}
      style={{ backgroundColor: `${color}15`, color: color }}
    >
      <DynamicIcon 
        name={name === 'category-default' ? (isSub ? 'FileText' : 'Folder') : name} 
        size={size} 
        strokeWidth={isSub ? 2 : 2.5} 
      />
    </div>
  );
};

const CategoryPage = () => {
  const { t } = useTranslation();
  const { isRTL } = useRtl();
  const { user } = useSelector((state) => state.auth);
  const { data: treeResponse, isLoading } = useGetCategoryTreeQuery(user?.id);
  const [deleteCategory] = useDeleteCategoryMutation();

  const [activeTab, setActiveTab] = useState('expense');
  const [expandedRows, setExpandedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const [editData, setEditData] = useState(null);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const categories = treeResponse?.data || [];
  const filteredCategories = categories.filter(cat => 
    cat.type === activeTab && cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleRow = (id) => {
    setExpandedRows(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const initiateDelete = (e, id) => {
    e.stopPropagation(); // ✅ Prevent toggling the row when clicking delete
    setCategoryToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteCategory(categoryToDelete).unwrap();
      setIsConfirmOpen(false);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="space-y-8 pb-10 min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-3xl font-black text-app-text tracking-tight italic uppercase">
            {t('categories.title')}
          </h2>
          <p className="text-zinc-500 font-medium">{t('categories.subtitle')}</p>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => { setEditData(null); setIsCatModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
        >
          <Plus size={20} strokeWidth={3} /> {t('categories.add_btn')}
        </motion.button>
      </div>

      {/* 2. Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl flex border border-zinc-200 dark:border-zinc-700 w-full lg:w-fit shadow-sm">
          {['expense', 'income'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 lg:flex-none px-10 py-2.5 rounded-xl capitalize font-bold transition-all duration-300 ${
                activeTab === tab ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-md' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            > {t(`nav.${tab}`)} </button>
          ))}
        </div>
        <div className="relative flex-1 w-full">
          <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-zinc-400`} size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('categories.search_placeholder', { type: t(`nav.${activeTab}`) })} 
            className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-zinc-800 dark:text-zinc-200 shadow-sm`}
          />
        </div>
      </div>

      {/* 3. List Container */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {isLoading ? (
            <div className="p-20 text-center text-zinc-400 animate-pulse font-bold">{t('categories.syncing')}</div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-20 text-center text-zinc-400 font-bold">{t('categories.empty', { type: t(`nav.${activeTab}`) })}</div>
          ) : (
           filteredCategories.map((cat) => (
  <div key={cat.id} className="group">
    {/* Parent Row: Using absolute black for text in light theme */}
   <div 
  // ✅ Only allow toggle if sub-categories exist
  onClick={() => cat.subCategories?.length > 0 && toggleRow(cat.id)}
  className={`flex items-center justify-between p-6 md:px-10 transition-all duration-300 ${
    cat.subCategories?.length > 0 ? 'cursor-pointer' : 'cursor-default'
  } ${
    expandedRows.includes(cat.id) 
      ? 'bg-zinc-50/80 dark:bg-zinc-800/50' 
      : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30'
  }`}
>
  <div className="flex items-center gap-5 flex-1">
    {/* ✅ Show arrow only if sub-categories exist */}
    {cat.subCategories?.length > 0 && (
      <motion.button 
        animate={{ rotate: expandedRows.includes(cat.id) ? 90 : 0 }}
        className={`p-1 transition-colors ${
          expandedRows.includes(cat.id) ? 'text-indigo-600' : 'text-zinc-400'
        }`}
      >
        <ChevronRight size={22} strokeWidth={3} className={isRTL ? 'rotate-180' : ''} />
      </motion.button>
    )}
    
    {/* Layout remains identical to maintain the Vault theme */}
    <IconBox name={cat.icon} color={cat.color} />
    
    <div className={isRTL ? 'text-right' : 'text-left'}>
      <h3 className="font-black text-zinc-950 dark:text-white text-xl tracking-tight">
        {cat.name}
      </h3>
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mt-0.5 block">
        {t('categories.sub_count', { count: cat.subCategories?.length || 0 })}
      </span>
    </div>
  </div>

  {/* Action Buttons: Kept exactly the same */}
  <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
    <button 
      onClick={(e) => { e.stopPropagation(); setSelectedParentId(cat.id); setEditData(null); setIsSubModalOpen(true); }} 
      className="p-2.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
    >
      <FolderPlus size={20} />
    </button>
    <button 
      onClick={(e) => { e.stopPropagation(); setEditData(cat); setIsCatModalOpen(true); }} 
      className="p-2.5 text-zinc-400 hover:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/20 rounded-xl transition-all"
    >
      <Edit2 size={18} />
    </button>
    <button 
      onClick={(e) => initiateDelete(e, cat.id)} 
      className="p-2.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/20 rounded-xl transition-all"
    >
      <Trash2 size={18} />
    </button>
  </div>
</div>

    {/* Sub-categories List: Clean hierarchal tree lines */}
    <AnimatePresence>
      {expandedRows.includes(cat.id) && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }} 
          animate={{ height: "auto", opacity: 1 }} 
          exit={{ height: 0, opacity: 0 }} 
          className="overflow-hidden bg-zinc-50/30 dark:bg-zinc-900/5"
        >
          <div className={`${
            isRTL 
              ? 'mr-16 md:mr-28 ml-8 border-r-2' 
              : 'ml-16 md:ml-28 mr-8 border-l-2'
            } pb-6 pt-2 space-y-1 border-zinc-200 dark:border-zinc-800`}
          >
            {cat.subCategories?.map((sub) => (
              <div 
                key={sub.id} 
                className={`flex items-center justify-between p-3.5 group/sub transition-all ${
                  isRTL ? 'pr-8 rounded-l-2xl' : 'pl-8 rounded-r-2xl'
                } hover:bg-white dark:hover:bg-zinc-800 shadow-none hover:shadow-sm`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <IconBox name={sub.icon} color={sub.color} isSub={true} />
                  {/* ✅ Force darker text for subcategories for better readability */}
                  <span className="text-base text-zinc-800 dark:text-zinc-200 font-bold tracking-tight">
                    {sub.name}
                  </span>
                </div>
                
                <div className="flex gap-2 opacity-0 group-hover/sub:opacity-100 transition-all">
                   <button 
                    onClick={() => { setEditData(sub); setSelectedParentId(sub.parentId); setIsSubModalOpen(true); }} 
                    className="p-2 text-zinc-400 hover:text-amber-600 transition-colors"
                   >
                    <Edit2 size={16} />
                   </button>
                   <button 
                    onClick={(e) => initiateDelete(e, sub.id)} 
                    className="p-2 text-zinc-400 hover:text-rose-600 transition-colors"
                   >
                    <Trash2 size={16} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
))
          )}
        </div>
      </div>

      {/* 4. Modals */}
      <AddCategoryModal isOpen={isCatModalOpen} onClose={() => { setIsCatModalOpen(false); setEditData(null); }} userId={user?.id} editData={editData} />
      <AddSubCategoryModal isOpen={isSubModalOpen} onClose={() => { setIsSubModalOpen(false); setEditData(null); }} parentId={selectedParentId} userId={user?.id} type={activeTab} editData={editData} />
      <ConfirmDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmDelete} title={t('categories.delete_title')} message={t('categories.delete_warning')} />
    </div>
  );
};

export default CategoryPage;