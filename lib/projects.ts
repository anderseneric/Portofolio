import { Project } from '@/types';

export const dummyProjects: Project[] = [
  {
    id: 'trading-ai',
    title: "Eric's Trading AI",
    description: `## Overview

Full-stack swing trading platform for the Norwegian stock market. Combines real-time data with AI-driven sentiment analysis to identify trading opportunities. Track any Norwegian stocks in your portfolio - **currently demonstrated with a 25,000 NOK portfolio** featuring MOWI, Vår Energi, and Yara.

## Key Features

- **Real-time Portfolio Tracking** - Live P&L analysis and performance metrics
- **AI Sentiment Analysis** - Claude Sonnet 4.5 analyzes market news sentiment
- **Automated News Scraping** - Monitors Newsweb continuously with Puppeteer
- **Smart "Top Movers" Detection** - Identifies significant price/volume changes
- **Interactive AI Assistant** - Chat-based portfolio insights
- **Automated Notifications** - Real-time alerts for market events

## Technical Stack

Built with modern web technologies for performance and scalability

### Frontend
- React with TypeScript
- Tailwind CSS
- Interactive particle background

### Backend
- Node.js & Express
- SQLite database
- Node-cron scheduling

### AI & Automation
- Anthropic Claude API
- Puppeteer web scraping
- Custom market algorithms`,
    image: '/projects/trading.png',
    images: [
      '/projects/trading.png',
      '/projects/chatbot.png',
      '/projects/portofolio.png',
      '/projects/performance.png',
      '/projects/news.png',
      '/projects/recommendations.png',
      '/projects/analytics.png'
    ],
    tags: ['React', 'TypeScript', 'Node.js', 'Express', 'SQLite', 'Claude API', 'Puppeteer', 'Tailwind CSS'],
    githubUrl: 'https://github.com/anderseneric',
    features: [
      'Real-time Portfolio Tracking with live P&L',
      'AI Sentiment Analysis using Claude Sonnet 4.5',
      'Automated News Scraping with Puppeteer',
      'Smart Top Movers Detection',
      'Interactive AI Assistant',
      'Automated Market Notifications'
    ]
  }
];
