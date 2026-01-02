export interface ProjectSection {
  title: string;
  content: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;  // Short one-liner description
  image: string;  // Backward compatibility - first image
  images: string[];  // Array of all images
  tags: string[];
  link?: string;
  githubUrl?: string;
  features?: string[];
  sections?: ProjectSection[];  // Detailed project sections (Overview, Challenge, Solution, etc.)
}
