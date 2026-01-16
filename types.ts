
export interface HiringRequirements {
  skills: string[];
  technologies: string[];
  experienceLevel: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Unspecified';
  quantity: number;
  location?: string;
  originalRequest: string;
}

export interface Candidate {
  id: string;
  name: string;
  headline: string;
  skills: string[];
  platforms: {
    name: string;
    url: string;
  }[];
  score: number;
  explanation: string;
  evidence: string[];
}

export enum AgentStatus {
  IDLE = 'IDLE',
  PARSING = 'PARSING',
  DISCOVERING = 'DISCOVERING',
  EVALUATING = 'EVALUATING',
  RANKING = 'RANKING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface AgentStep {
  id: AgentStatus;
  label: string;
  description: string;
}
