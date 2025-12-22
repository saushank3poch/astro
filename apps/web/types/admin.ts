// Admin Dashboard Types

// Overview Stats
export interface OverviewStats {
  totalUsers: number;
  activeUsers: number;
  totalPredictions: number;
  totalRevenue: number;
  aiCosts: number;
  profit: number;
  userGrowth: number; // %
  revenueGrowth: number; // %
  predictionsByType: Record<string, number>;
  recentPredictions: RecentPrediction[];
  recentErrors: ErrorLog[];
  topUsers: TopUser[];
}

export interface RecentPrediction {
  id: string;
  type: string;
  userId: string;
  username?: string;
  createdAt: string;
  status: string;
  confidenceScore?: number;
}

export interface TopUser {
  id: string;
  username?: string;
  email?: string;
  predictionCount: number;
  totalSpent: number;
  joinedAt: string;
}

// AI Costs Stats
export interface AICostStats {
  totalCost: number;
  totalTokens: number;
  byPredictionType: Record<string, AICostByType>;
  byModel: Record<string, number>;
  timeline: TimelineData[];
  topExpensivePredictions: ExpensivePrediction[];
  budget: BudgetInfo;
}

export interface AICostByType {
  cost: number;
  tokens: number;
  count: number;
}

export interface TimelineData {
  date: string;
  cost: number;
  tokens: number;
}

export interface ExpensivePrediction {
  id: string;
  type: string;
  cost: number;
  tokens: number;
  model: string;
  createdAt: string;
}

export interface BudgetInfo {
  monthlyBudget: number;
  currentSpend: number;
  percentage: number;
  daysRemaining: number;
}

// Performance Stats
export interface PerformanceStats {
  totalRequests: number;
  avgResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  p50: number;
  p95: number;
  p99: number;
  timelineData: PerformanceTimeline[];
  requestsByEndpoint: EndpointStats[];
  slowRequests: SlowRequest[];
  cacheStats: CacheStats;
}

export interface PerformanceTimeline {
  timestamp: string;
  p50: number;
  p95: number;
  p99: number;
  requests: number;
}

export interface EndpointStats {
  endpoint: string;
  requests: number;
  avgResponseTime: number;
  errorRate: number;
}

export interface SlowRequest {
  id: string;
  endpoint: string;
  method: string;
  responseTime: number;
  timestamp: string;
  userId?: string;
  statusCode: number;
}

export interface CacheStats {
  hitRate: number;
  missRate: number;
  totalEntries: number;
  mostCached: CachedItem[];
}

export interface CachedItem {
  key: string;
  hits: number;
  createdAt: string;
}

// Error Stats
export interface ErrorStats {
  totalErrors: number;
  errorRate: number;
  byType: Record<string, number>;
  bySeverity: Record<ErrorSeverity, number>;
  resolvedCount: number;
  unresolvedCount: number;
}

export interface ErrorLog {
  id: string;
  errorType: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  resolved: boolean;
  endpoint?: string;
  userId?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorFilters {
  severity?: ErrorSeverity;
  resolved?: boolean;
  startDate?: string;
  endDate?: string;
}

// Feedback Stats
export interface FeedbackStats {
  avgRating: number;
  totalFeedback: number;
  helpfulPercentage: number;
  accuracyPercentage: number;
  ratingsDistribution: Record<number, number>; // 1-5 stars
  byPredictionType: Record<string, PredictionTypeFeedback>;
  timeline: FeedbackTimeline[];
  recentFeedback: PredictionFeedback[];
}

export interface PredictionTypeFeedback {
  avgRating: number;
  count: number;
  helpfulPercentage: number;
  accuracyPercentage: number;
}

export interface FeedbackTimeline {
  date: string;
  avgRating: number;
  count: number;
}

export interface PredictionFeedback {
  id: string;
  predictionId: string;
  predictionType: string;
  userId: string;
  username?: string;
  rating: number; // 1-5
  wasHelpful: boolean | null;
  cameTrue: boolean | null; // null = too early to tell
  comment?: string;
  createdAt: string;
}

export interface FeedbackFilters {
  predictionType?: string;
  rating?: number;
  startDate?: string;
  endDate?: string;
  wasHelpful?: boolean;
  cameTrue?: boolean;
}

export interface FeedbackInput {
  predictionId: string;
  rating: number;
  wasHelpful?: boolean;
  cameTrue?: boolean | null;
  comment?: string;
}

// Date Range Preset
export type DateRangePreset = 'today' | 'last7days' | 'last30days' | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
  preset: DateRangePreset;
}
