export interface OutlineItem {
  section: string;
  details: string[];
}

export interface AnalyticalRating {
  newness: number;
  urgency: number;
  feasibility: number;
  comment: string;
}

export interface SurveyRow {
  criteria: string;
  achievedCount: number;
  achievedRate: number;
  notAchievedCount: number;
  notAchievedRate: number;
}

export interface SurveyData {
  totalQty: number;
  surveyRows: SurveyRow[];
  pedagogicalComment: string;
}

export interface Solution {
  index: number;
  title: string;
  purpose: string;
  steps: string[];
  pedagogicalAdvice?: string;
  evidenceDescription?: string;
  infographicConcept?: string;
}

export interface ComparisonItem {
  category: string;
  controlGroup: number;
  experimentalGroup: number;
}

export interface ExperimentData {
  comparisonData: ComparisonItem[];
  statisticalAnalysis: string;
  conclusion: string;
}

export interface EvaluationItem {
  scores: {
    novelty: number;
    practicality: number;
    scientificValue: number;
    presentation: number;
    total: number;
  };
  pros: string[];
  cons: string[];
  suggestions: string[];
}

export interface SlideItem {
  slideIndex: number;
  title: string;
  subtitle?: string;
  bullets: string[];
}

export interface SlideStructure {
  presentationTheme: string;
  slides: SlideItem[];
}

export interface SpellError {
  original: string;
  corrected: string;
  reason: string;
}

export interface ProofingResult {
  totalErrorsCount: number;
  errorsList: SpellError[];
  govComplianceComment: string;
  improvedParagraph: string;
}

export interface CriteriaItem {
  name: string;
  maxScore: number;
  description: string;
}

export interface UploadedCriteria {
  fileName: string;
  uploadedAt: string;
  rawTextPreview: string;
  criteriaList: CriteriaItem[];
  requirements: string[];
  focusPoints: string[];
  aiSummary: string;
}

export interface Project {
  id: string;
  title: string;
  author: string;
  school: string;
  grade: string;
  subject: string;
  level: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  
  // Uploaded criteria document
  uploadedCriteria?: UploadedCriteria;

  // 11 steps sections
  outline?: {
    analyticalRating?: AnalyticalRating;
    items?: OutlineItem[];
  };
  survey?: SurveyData;
  solutions?: Solution[];
  solutionsCount?: number;
  solutionOptions?: {
    tables: boolean;
    evidence: boolean;
    infographic: boolean;
  };
  experiment?: ExperimentData;
  textEditorContent?: string;
  annexList?: string[];
  evaluation?: EvaluationItem;
  slides?: SlideStructure;
  proofing?: ProofingResult;

  // AI execution status
  status?: "idle" | "generating" | "error";
  errorMsg?: string;
}
