import React, { useState, useRef } from 'react';
import { Plus, Check, Trash2, Edit2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Task } from '@/types';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (title: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string, title: string) => void;
  completedCount: number;
  pendingCount: number;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  completedCount,
  pendingCount,
}) => {
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (newTask.trim()) {
      onAddTask(newTask);
      setNewTask('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditValue(task.title);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const saveEdit = () => {
    if (editingId && editValue.trim()) {
      onEditTask(editingId, editValue);
      setEditingId(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Tasks</h3>
          <p className="text-white/50 text-sm">
            {pendingCount} pending, {completedCount} done
          </p>
        </div>
      </div>

      {/* Add task input */}
      <div className="flex gap-2 mb-4">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new task..."
          className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/30"
        />
        <Button
          onClick={handleAdd}
          disabled={!newTask.trim()}
          className="bg-white/10 hover:bg-white/20 text-white disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Task list */}
      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-white/30">
              <p className="text-sm">No tasks yet</p>
              <p className="text-xs mt-1">Add a task to get started</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                  task.completed
                    ? 'bg-white/5'
                    : 'bg-white/10 hover:bg-white/15'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => onToggleTask(task.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                    task.completed
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-white/30 hover:border-white/50'
                  }`}
                >
                  {task.completed && <Check className="w-3 h-3 text-white" />}
                </button>

                {/* Task content */}
                {editingId === task.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      ref={inputRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      onBlur={saveEdit}
                      className="flex-1 h-8 bg-white/10 border-white/20 text-white text-sm"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={saveEdit}
                      className="h-7 w-7 text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={cancelEdit}
                      className="h-7 w-7 text-rose-400 hover:text-rose-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span
                      className={`flex-1 text-sm transition-all duration-200 ${
                        task.completed
                          ? 'text-white/40 line-through'
                          : 'text-white'
                      }`}
                    >
                      {task.title}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEdit(task)}
                        className="h-7 w-7 text-white/50 hover:text-white"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDeleteTask(task.id)}
                        className="h-7 w-7 text-white/50 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer stats */}
      {tasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>Progress</span>
            <span>
              {Math.round((completedCount / tasks.length) * 100)}%
            </span>
          </div>
          <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${(completedCount / tasks.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
