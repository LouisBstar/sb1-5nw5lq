import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Plus, X, Edit2, Trash2, Search } from 'lucide-react';
import { PREDEFINED_TAG_COLORS } from '../constants';

interface TagManagerProps {
  isOpen: boolean;
  onClose: () => void;
  tags: { name: string; color: string }[];
  onAddTag: (tag: { name: string; color: string }) => void;
  onUpdateTag: (oldName: string, newTag: { name: string; color: string }) => void;
  onDeleteTag: (tagName: string) => void;
}

export function TagManager({
  isOpen,
  onClose,
  tags,
  onAddTag,
  onUpdateTag,
  onDeleteTag,
}: TagManagerProps) {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(PREDEFINED_TAG_COLORS[0]);
  const [editingTag, setEditingTag] = useState<{ name: string; color: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagName.trim()) {
      if (editingTag) {
        onUpdateTag(editingTag.name, { name: newTagName.trim(), color: newTagColor });
        setEditingTag(null);
      } else {
        onAddTag({ name: newTagName.trim(), color: newTagColor });
      }
      setNewTagName('');
      setNewTagColor(PREDEFINED_TAG_COLORS[0]);
    }
  };

  const startEditing = (tag: { name: string; color: string }) => {
    setEditingTag(tag);
    setNewTagName(tag.name);
    setNewTagColor(tag.color);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Tag className="text-indigo-600" size={24} />
                  <h2 className="text-xl font-semibold text-gray-900">Tag Manager</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tag Name
                  </label>
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter tag name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tag Color
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {PREDEFINED_TAG_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewTagColor(color)}
                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                          newTagColor === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Tag Preview */}
                {newTagName.trim() && (
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center"
                    >
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: newTagColor }}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {newTagName}
                        </span>
                        <span className="text-xs text-gray-500">(0)</span>
                      </div>
                    </motion.div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingTag ? 'Update Tag' : 'Add Tag'}
                </button>
              </form>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Existing Tags</h3>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tags"
                      className="pl-9 pr-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  {filteredTags.map((tag) => (
                    <motion.div
                      key={tag.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="font-medium text-gray-700">
                          {tag.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditing(tag)}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 transition-colors rounded-lg hover:bg-white"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteTag(tag.name)}
                          className="p-1.5 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-white"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}