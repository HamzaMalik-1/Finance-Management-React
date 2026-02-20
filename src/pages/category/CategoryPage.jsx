import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
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
  const IconComponent = Icons[name] || HelpCircle;
  return <IconComponent size={size} {...props} />;
};

/** UPDATED ICON BOX: Uses dynamic size prop for sub-categories **/
const IconBox = ({ name, color, isSub = false }) => {
  const size = isSub ? 16 : 22;
  const padding = isSub ? 'p-2' : 'p-3';
  const radius = isSub ? 'rounded-xl' : 'rounded-2xl';

  return (
    <div 
      className={`${padding} ${radius} transition-all shadow-sm flex items-center justify-center flex-shrink-0`}
      style={{ 
        backgroundColor: `${color}15`, // 15% opacity tint
        color: color                 // Full opacity icon
      }}
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
  const { user } = useSelector((state) => state.auth);
  const { data: treeResponse, isLoading } = useGetCategoryTreeQuery(user?.id);
  const [deleteCategory] = useDeleteCategoryMutation();

  const [activeTab, setActiveTab] = useState('expense');
  const [expandedRows, setExpandedRows] = useState([]);
  
  // UI States
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const [editData, setEditData] = useState(null);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const categories = treeResponse?.data || [];
  const filteredCategories = categories.filter(cat => cat.type === activeTab);

  const toggleRow = (id) => {
    setExpandedRows(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  /** HANDLERS **/
  const handleAddNewMain = () => {
    setEditData(null);
    setIsCatModalOpen(true);
  };

  const handleEditParent = (item) => {
    setEditData(item);
    setIsCatModalOpen(true);
  };

  const handleAddSub = (parentId) => {
    setEditData(null);
    setSelectedParentId(parentId);
    setIsSubModalOpen(true);
  };

  const handleEditSub = (item) => {
    setEditData(item);
    setSelectedParentId(item.parentId); 
    setIsSubModalOpen(true);
  };

  const initiateDelete = (id) => {
    setCategoryToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteCategory(categoryToDelete).unwrap();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="space-y-8 pb-10 min-h-screen bg-transparent">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight dark:text-zinc-100 italic uppercase">Classifications</h2>
          <p className="text-zinc-500 font-medium">Hierarchy of your ledger categories</p>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={handleAddNewMain}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-200 transition-hover hover:bg-indigo-700"
        >
          <Plus size={20} strokeWidth={3} /> Add Category
        </motion.button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-xl flex border border-zinc-200 dark:border-zinc-700 w-full lg:w-fit shadow-sm">
          {['expense', 'income'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 lg:flex-none px-10 py-2.5 rounded-xl capitalize font-bold transition-all duration-300 ${
                activeTab === tab ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            > {tab} </button>
          ))}
        </div>
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`} 
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-zinc-800 dark:text-zinc-200 shadow-sm"
          />
        </div>
      </div>

      {/* List container */}
      <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {isLoading ? (
            <div className="p-20 text-center text-zinc-400 animate-pulse">Synchronizing Ledger...</div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-20 text-center text-zinc-400 bg-zinc-50/30 dark:bg-zinc-800/30 font-medium">No {activeTab} classifications found.</div>
          ) : (
            filteredCategories.map((cat) => (
              <div key={cat.id} className="group">
                {/* Parent Row */}
                <div className={`flex items-center justify-between p-6 md:px-10 transition-colors ${expandedRows.includes(cat.id) ? 'bg-zinc-50/50 dark:bg-zinc-800/50' : 'hover:bg-zinc-50/30 dark:hover:bg-zinc-800/30'}`}>
                  <div className="flex items-center gap-5 flex-1">
                    <motion.button 
                      animate={{ rotate: expandedRows.includes(cat.id) ? 90 : 0 }}
                      onClick={() => toggleRow(cat.id)} 
                      className={`p-1 transition-colors ${expandedRows.includes(cat.id) ? 'text-indigo-600' : 'text-zinc-300 hover:text-zinc-500'}`}
                    >
                      <ChevronRight size={24} strokeWidth={3} />
                    </motion.button>
                    
                    <IconBox name={cat.icon} color={cat.color} />
                    
                    <div>
                      <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xl tracking-tight">{cat.name}</h3>
                      <span className="text-[10px] font-black uppercase text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                        {cat.subCategories?.length || 0} Sub-categories
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button onClick={() => handleAddSub(cat.id)} className="p-3 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl"><FolderPlus size={20} /></button>
                    <button onClick={() => handleEditParent(cat)} className="p-3 text-zinc-400 hover:text-amber-500 hover:bg-amber-900/20 rounded-2xl"><Edit2 size={20} /></button>
                    <button onClick={() => initiateDelete(cat.id)} className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-900/20 rounded-2xl"><Trash2 size={20} /></button>
                  </div>
                </div>

                {/* Sub-categories List */}
                <AnimatePresence>
                  {expandedRows.includes(cat.id) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: "auto", opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }} 
                      className="overflow-hidden bg-white dark:bg-zinc-900/20"
                    >
                      <div className="ml-16 md:ml-28 mr-8 pb-6 space-y-1 border-l-2 border-zinc-100 dark:border-zinc-800">
                        {cat.subCategories?.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between p-4 pl-8 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/80 rounded-r-3xl transition-all group/sub">
                            <div className="flex items-center gap-4 flex-1">
                              {/* ✅ Sub-category now uses IconBox with its own data */}
                              <IconBox name={sub.icon} color={sub.color} isSub={true} />
                              <span className="text-md text-zinc-700 dark:text-zinc-300 font-bold">{sub.name}</span>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover/sub:opacity-100 transition-all">
                               <button onClick={() => handleEditSub(sub)} className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl"><Edit2 size={16} /></button>
                               <button onClick={() => initiateDelete(sub.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={16} /></button>
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

      {/* Modals Integration */}
      <AddCategoryModal 
        isOpen={isCatModalOpen} 
        onClose={() => { setIsCatModalOpen(false); setEditData(null); }} 
        userId={user?.id} 
        editData={editData} 
      />
      <AddSubCategoryModal 
        isOpen={isSubModalOpen} 
        onClose={() => { setIsSubModalOpen(false); setEditData(null); }} 
        parentId={selectedParentId} 
        userId={user?.id} 
        type={activeTab} 
        editData={editData} 
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={handleConfirmDelete} 
        title="categories.delete_title" 
        message="categories.delete_warning" 
      />
    </div>
  );
};

export default CategoryPage;