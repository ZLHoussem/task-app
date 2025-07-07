'use client';

import { trpc } from '@/utils/trpc';
import { useState } from 'react';

type Task = {
  id: string;
  title: string;
  description: string | null;
};

export default function HomePage() {
  const utils = trpc.useUtils();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const { data: tasks } = trpc.task.list.useQuery();

  const addTask = trpc.task.add.useMutation({
    onSuccess: () => {
      utils.task.list.invalidate();
      setTitle('');
      setDescription('');
    },
  });

  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: () => utils.task.list.invalidate(),
  });

  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => {
      utils.task.list.invalidate();
      setEditId(null);
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addTask.mutate({ title, description });
  };

  const handleEdit = (task: Task) => {
    setEditId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      updateTask.mutate({ id: editId, title: editTitle, description: editDescription });
    }
  };

  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📝 Task List</h1>

      <form onSubmit={handleAdd} className="space-y-2">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="border p-2 w-full"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full"
        />
        <button
          type="submit"
          disabled={addTask.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {addTask.isPending ? 'Adding...' : 'Add Task'}
        </button>
      </form>

      <ul className="mt-6 space-y-4">
        {tasks?.map((task) => (
          <li key={task.id} className="border p-3 rounded shadow">
            {editId === task.id ? (
              <form onSubmit={handleUpdate} className="space-y-2">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="border p-2 w-full"
                />
                <input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="border p-2 w-full"
                />
                <div className="flex gap-2">
                  <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
                  <button type="button" onClick={() => setEditId(null)} className="bg-gray-500 text-white px-3 py-1 rounded">Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <strong>{task.title}</strong>
                  <p className="text-gray-600">{task.description}</p>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(task)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteTask.mutate({ id: task.id })}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    🗑 Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
