
export interface PerformanceData {
  timestamp: string;
  requests: number;
  failures: number;
  medianResponseTime: number;
  p95ResponseTime: number;
}

export enum ActiveTab {
  SETUP = 'setup',
  GENERATOR = 'generator',
  DASHBOARD = 'dashboard',
  AI_ADVISOR = 'ai_advisor'
}

export interface CodeSnippet {
  filename: string;
  language: string;
  code: string;
  description: string;
}
