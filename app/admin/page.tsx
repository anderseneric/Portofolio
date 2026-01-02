'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Project } from '@/types';
import { getProjects, saveProjects, deleteProject } from '@/lib/localStorage';
import { X, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Image Item Component
function SortableImageItem({
  id,
  image,
  index,
  onRemove,
}: {
  id: string;
  image: string;
  index: number;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 ${
        isDragging ? 'shadow-lg shadow-cyan-500/50 z-50' : ''
      }`}
    >
      {/* Drag Handle */}
      <button
        type="button"
        className="cursor-grab text-gray-400 hover:text-cyan-400 active:cursor-grabbing transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Image Path */}
      <span className="flex-1 truncate text-sm text-gray-300">
        {index + 1}. {image}
      </span>

      {/* Delete Button */}
      <button
        type="button"
        onClick={onRemove}
        className="ml-2 text-red-400 transition-colors hover:text-red-300"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function AdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    image: '',
    images: [],
    tags: [],
    link: '',
    githubUrl: '',
    features: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [sectionTitleInput, setSectionTitleInput] = useState('');
  const [sectionContentInput, setSectionContentInput] = useState('');

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const stored = getProjects();
    setProjects(stored);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentProject.title || !currentProject.description) {
      alert('Please fill in title and description');
      return;
    }

    if (!currentProject.images || currentProject.images.length === 0) {
      alert('Please add at least one image');
      return;
    }

    const newProject: Project = {
      id: currentProject.id || Date.now().toString(),
      title: currentProject.title,
      description: currentProject.description,
      image: currentProject.images[0], // First image for backward compatibility
      images: currentProject.images,
      tags: currentProject.tags || [],
      link: currentProject.link,
    };

    let updatedProjects;
    if (isEditing && currentProject.id) {
      updatedProjects = projects.map((p) =>
        p.id === currentProject.id ? newProject : p
      );
    } else {
      updatedProjects = [...projects, newProject];
    }

    saveProjects(updatedProjects);
    setProjects(updatedProjects);
    resetForm();
  };

  const handleEdit = (project: Project) => {
    setCurrentProject(project);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
      loadProjects();
    }
  };

  const resetForm = () => {
    setCurrentProject({
      title: '',
      description: '',
      image: '',
      images: [],
      tags: [],
      link: '',
      githubUrl: '',
      features: [],
      sections: [],
    });
    setTagInput('');
    setImageInput('');
    setFeatureInput('');
    setSectionTitleInput('');
    setSectionContentInput('');
    setIsEditing(false);
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setCurrentProject({
        ...currentProject,
        tags: [...(currentProject.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setCurrentProject({
      ...currentProject,
      tags: currentProject.tags?.filter((_, i) => i !== index),
    });
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setCurrentProject({
        ...currentProject,
        images: [...(currentProject.images || []), imageInput.trim()],
      });
      setImageInput('');
    }
  };

  const removeImage = (index: number) => {
    setCurrentProject({
      ...currentProject,
      images: currentProject.images?.filter((_, i) => i !== index),
    });
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setCurrentProject({
        ...currentProject,
        features: [...(currentProject.features || []), featureInput.trim()],
      });
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setCurrentProject({
      ...currentProject,
      features: currentProject.features?.filter((_, i) => i !== index),
    });
  };

  const addSection = () => {
    if (sectionTitleInput.trim() && sectionContentInput.trim()) {
      setCurrentProject({
        ...currentProject,
        sections: [
          ...(currentProject.sections || []),
          { title: sectionTitleInput.trim(), content: sectionContentInput.trim() },
        ],
      });
      setSectionTitleInput('');
      setSectionContentInput('');
    }
  };

  const removeSection = (index: number) => {
    setCurrentProject({
      ...currentProject,
      sections: currentProject.sections?.filter((_, i) => i !== index),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const images = currentProject.images || [];
    const oldIndex = images.findIndex((_, i) => `image-${i}` === active.id);
    const newIndex = images.findIndex((_, i) => `image-${i}` === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedImages = arrayMove(images, oldIndex, newIndex);
      setCurrentProject({
        ...currentProject,
        images: reorderedImages,
      });
    }
  };

  return (
    <div className="min-h-screen bg-black py-12 px-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 text-4xl font-light tracking-wide text-white">
            Admin Panel
          </h1>
          <a
            href="/"
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Back to Portfolio
          </a>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm"
          >
            <h2 className="mb-6 text-2xl font-semibold text-white">
              {isEditing ? 'Edit Project' : 'Add New Project'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Title *
                </label>
                <input
                  type="text"
                  value={currentProject.title || ''}
                  onChange={(e) =>
                    setCurrentProject({ ...currentProject, title: e.target.value })
                  }
                  className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Project Title"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Description * (Markdown supported)
                </label>
                <textarea
                  value={currentProject.description || ''}
                  onChange={(e) =>
                    setCurrentProject({
                      ...currentProject,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-lg bg-white/10 px-4 py-2 font-mono text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Use Markdown for formatting:
## Heading
**Bold text**
*Italic text*
- List item
1. Numbered item"
                  rows={12}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Tip: Use ## for headings, **bold**, *italic*, - for lists
                </p>
              </div>

              {/* MULTIPLE IMAGES */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Images * (Multiple)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                    className="flex-1 rounded-lg bg-white/10 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="/projects/image.png"
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="rounded-lg bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {currentProject.images && currentProject.images.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={currentProject.images.map((_, i) => `image-${i}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        {currentProject.images.map((img, index) => (
                          <SortableImageItem
                            key={`image-${index}`}
                            id={`image-${index}`}
                            image={img}
                            index={index}
                            onRemove={() => removeImage(index)}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No images added yet</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Live Demo Link
                </label>
                <input
                  type="text"
                  value={currentProject.link || ''}
                  onChange={(e) =>
                    setCurrentProject({ ...currentProject, link: e.target.value })
                  }
                  className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  GitHub URL
                </label>
                <input
                  type="text"
                  value={currentProject.githubUrl || ''}
                  onChange={(e) =>
                    setCurrentProject({ ...currentProject, githubUrl: e.target.value })
                  }
                  className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 rounded-lg bg-white/10 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="rounded-lg bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentProject.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-2 rounded-full bg-cyan-500/20 px-3 py-1 text-sm text-cyan-300"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* KEY FEATURES */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Key Features
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className="flex-1 rounded-lg bg-white/10 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="Add a key feature"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="rounded-lg bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  {currentProject.features?.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between rounded-lg bg-white/10 px-3 py-2"
                    >
                      <span className="flex-1 text-sm text-gray-300">
                        • {feature}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="ml-2 text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-cyan-500 px-6 py-3 font-medium text-white hover:bg-cyan-600 transition-colors"
                >
                  {isEditing ? 'Update Project' : 'Add Project'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg bg-gray-500 px-6 py-3 font-medium text-white hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </motion.div>

          {/* Projects List Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm"
          >
            <h2 className="mb-6 text-2xl font-semibold text-white">
              Manage Projects ({projects.length})
            </h2>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {projects.length === 0 ? (
                <p className="text-center text-gray-400">No projects yet</p>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-lg bg-white/10 p-4 hover:bg-white/15 transition-colors"
                  >
                    <h3 className="mb-2 text-lg font-semibold text-white">
                      {project.title}
                    </h3>
                    <p className="mb-2 text-sm text-gray-300">
                      {project.images?.length || 0} image(s)
                    </p>
                    <p className="mb-3 text-sm text-gray-300 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="mb-3 flex flex-wrap gap-1">
                      {project.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(project)}
                        className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
