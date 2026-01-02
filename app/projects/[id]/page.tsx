'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Github, X } from 'lucide-react';
import { Project } from '@/types';
import { getProjects } from '@/lib/localStorage';
import TechBackground from '@/components/TechBackground';
import ReactMarkdown from 'react-markdown';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

  useEffect(() => {
    const projects = getProjects();
    const foundProject = projects.find((p) => p.id === params.id);
    setProject(foundProject || null);
  }, [params.id]);

  const images = project?.images || (project?.image ? [project.image] : []);
  const totalImages = images.length;

  const nextImage = () => {
    if (totalImages === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    if (totalImages === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const openLightbox = (index: number) => {
    setLightboxImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const nextLightboxImage = () => {
    if (totalImages === 0) return;
    setLightboxImageIndex((prev) => (prev + 1) % totalImages);
  };

  const prevLightboxImage = () => {
    if (totalImages === 0) return;
    setLightboxImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Lightbox navigation
      if (isLightboxOpen) {
        if (e.key === 'ArrowRight') {
          nextLightboxImage();
        }
        if (e.key === 'ArrowLeft') {
          prevLightboxImage();
        }
        if (e.key === 'Escape') {
          closeLightbox();
        }
        return;
      }

      // Regular carousel navigation
      if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) => (prev + 1) % totalImages);
      }
      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
      }
      if (e.key === 'Escape') {
        router.push('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, totalImages, router, isLightboxOpen, lightboxImageIndex]);

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <TechBackground />
        <div className="relative z-10 text-center">
          <p className="text-xl text-gray-400">Project not found</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-cyan-400 hover:text-cyan-300"
          >
            ← Back to Portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TechBackground />

      <div className="relative z-10">
        {/* Header with back button */}
        <div className="mx-auto max-w-7xl px-6 py-8">
          <button
            onClick={() => router.push('/')}
            className="group flex items-center gap-2 text-gray-400 transition-colors hover:text-cyan-400"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Portfolio</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-6 pb-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Left Column - Image Carousel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-white/20 bg-white/5 backdrop-blur-sm">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={images[currentImageIndex]}
                    alt={`${project.title} - Screenshot ${currentImageIndex + 1}`}
                    className="aspect-video w-full cursor-pointer object-cover transition-transform hover:scale-105"
                    onClick={() => openLightbox(currentImageIndex)}
                  />
                </AnimatePresence>

                {/* Navigation Arrows */}
                {totalImages > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      disabled={currentImageIndex === 0}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white/80 backdrop-blur-sm transition-all hover:bg-black/80 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      disabled={currentImageIndex === totalImages - 1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white/80 backdrop-blur-sm transition-all hover:bg-black/80 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {totalImages > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white/90 backdrop-blur-sm">
                    {currentImageIndex + 1} / {totalImages}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {totalImages > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-cyan-400 opacity-100'
                          : 'border-white/20 opacity-50 hover:opacity-75'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="h-16 w-24 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right Column - Project Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Title & Description with Markdown */}
              <div>
                <h1 className="mb-6 text-4xl font-bold text-white lg:text-5xl">
                  {project.title}
                </h1>
                <div className="prose prose-invert prose-lg max-w-none">
                  <ReactMarkdown
                    components={{
                      h2: ({ children }) => (
                        <h2 className="mb-3 mt-8 text-2xl font-semibold text-white">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="mb-2 mt-6 text-xl font-semibold text-white">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="mb-4 leading-relaxed text-gray-300">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-300">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-4 ml-6 list-decimal space-y-2 text-gray-300">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-white">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-gray-200">{children}</em>
                      ),
                      code: ({ children }) => (
                        <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-cyan-400">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {project.description}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Tech Stack */}
              {project.tags && project.tags.length > 0 && (
                <div>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Tech Stack
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Features */}
              {project.features && project.features.length > 0 && (
                <div>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Key Features
                  </h2>
                  <ul className="space-y-2">
                    {project.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-4 pt-4">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-medium text-white transition-all hover:border-white/40 hover:bg-white/10"
                  >
                    <Github className="h-5 w-5" />
                    View Code
                  </a>
                )}
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 font-medium text-white transition-colors hover:bg-cyan-600"
                  >
                    <ExternalLink className="h-5 w-5" />
                    Live Demo
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute right-6 top-6 z-10 rounded-lg p-2 text-white/70 transition-all hover:bg-white/10 hover:text-white"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Navigation Arrows */}
            {totalImages > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevLightboxImage();
                  }}
                  disabled={lightboxImageIndex === 0}
                  className="absolute left-6 top-1/2 z-10 -translate-y-1/2 rounded-full p-3 text-white/70 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="h-10 w-10" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextLightboxImage();
                  }}
                  disabled={lightboxImageIndex === totalImages - 1}
                  className="absolute right-6 top-1/2 z-10 -translate-y-1/2 rounded-full p-3 text-white/70 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight className="h-10 w-10" />
                </button>
              </>
            )}

            {/* Image */}
            <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={lightboxImageIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  src={images[lightboxImageIndex]}
                  alt={`${project.title} - Screenshot ${lightboxImageIndex + 1}`}
                  className="max-h-[90vh] max-w-[90vw] rounded-lg border-2 border-white/20 object-contain shadow-2xl"
                />
              </AnimatePresence>

              {/* Image Counter */}
              {totalImages > 1 && (
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm">
                  {lightboxImageIndex + 1} / {totalImages}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
