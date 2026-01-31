export interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  city: string;
  state: string;
  country: string;
  profile: string;
  profile_medium: string;
  created_at: string;
  updated_at: string;
  weight?: number;
}

export interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: StravaAthlete;
}

export interface StravaBestEffort {
  id: number;
  name: string;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  pr_rank: number | null;
  activity: {
    id: number;
  };
}

export interface StravaSplit {
  distance: number;
  elapsed_time: number;
  elevation_difference: number;
  moving_time: number;
  split: number;
  average_speed: number;
  average_heartrate?: number;
  pace_zone?: number;
}

export interface StravaLap {
  id: number;
  name: string;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  distance: number;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  lap_index: number;
  split: number;
  pace_zone?: number;
}

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  elev_high?: number;
  elev_low?: number;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
  max_watts?: number;
  weighted_average_watts?: number;
  kilojoules?: number;
  average_cadence?: number;
  kudos_count: number;
  comment_count: number;
  achievement_count: number;
  athlete_count: number;
  photo_count: number;
  map: {
    id: string;
    summary_polyline: string;
    polyline?: string;
  };
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  gear_id?: string;
  device_name?: string;
  suffer_score?: number;
  best_efforts?: StravaBestEffort[];
  calories?: number;
  splits_metric?: StravaSplit[];
  laps?: StravaLap[];
  description?: string;
  perceived_exertion?: number;
  average_temp?: number;
}

export interface StravaActivityStream {
  type: string;
  data: number[];
  series_type: string;
  original_size: number;
  resolution: string;
}

export interface StravaStats {
  biggest_ride_distance: number;
  biggest_climb_elevation_gain: number;
  recent_ride_totals: StravaTotals;
  recent_run_totals: StravaTotals;
  recent_swim_totals: StravaTotals;
  ytd_ride_totals: StravaTotals;
  ytd_run_totals: StravaTotals;
  ytd_swim_totals: StravaTotals;
  all_ride_totals: StravaTotals;
  all_run_totals: StravaTotals;
  all_swim_totals: StravaTotals;
}

export interface StravaTotals {
  count: number;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  elevation_gain: number;
  achievement_count?: number;
}

export interface StravaZones {
  heart_rate?: {
    custom_zones: boolean;
    zones: StravaZone[];
  };
  power?: {
    zones: StravaZone[];
  };
}

export interface StravaZone {
  min: number;
  max: number;
}

export interface ActivityZones {
  score?: number;
  distribution_buckets: {
    max: number;
    min: number;
    time: number;
  }[];
  type: "heartrate" | "power";
  sensor_based: boolean;
}

export interface BestEffort {
  activityId: number;
  activityName: string;
  date: string;
  distance: number;
  time: number;
  pace: number;
}

export interface FitnessData {
  date: string;
  tss: number;
  ctl: number;
  atl: number;
  tsb: number;
}

export interface TrainingPaces {
  easy: { min: string; max: string };
  marathon: string;
  threshold: string;
  interval: string;
  repetition: string;
}

export interface TrainingContext {
  tsb: number;
  weeklyVolume: number;
  longestRecentRun: number;
  runsPerWeek: number;
}

export interface PredictionAdjustment {
  factor: number;
  reasons: string[];
}

export interface PredictionsData {
  vdot: number;
  vdotConfidence: number;
  effortsUsed: number;
  racePredictions: Record<string, number>;
  adjustments: Record<string, PredictionAdjustment>;
  trainingContext: TrainingContext;
  trainingPaces: TrainingPaces | null;
  bestEfforts: BestEffort[];
  fitnessHistory: FitnessData[];
  currentFitness: {
    ctl: number;
    atl: number;
    tsb: number;
  };
  maxHR: number;
  thresholdHR: number;
}

// Premium Stats Types
export interface PersonalRecord {
  distance: string;
  distanceMeters: number;
  time: number;
  elapsedTime: number;
  date: string;
  activityId: number;
  activityName: string;
  isPR: boolean;
}

export interface InjuryRiskData {
  acwr: number;
  riskLevel: "low" | "moderate" | "high" | "very_high";
  weeklyLoad: number;
  chronicLoad: number;
  recommendation: string;
}

export interface EfficiencyDataPoint {
  date: string;
  activityName: string;
  pace: number;
  avgHR: number;
  efficiency: number;
  paceHRRatio: number;
}

export interface EfficiencyTrend {
  current: number;
  previous: number;
  change: number;
  improving: boolean;
}

export interface TrainingDistribution {
  zone1_2: number;
  zone3: number;
  zone4_5: number;
  isPolarized: boolean;
  recommendation: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  thisWeekActivities: number;
  thisMonthActivities: number;
  consistencyScore: number;
}

export interface PeriodComparison {
  current: { distance: number; time: number; activities: number };
  previous: { distance: number; time: number; activities: number };
  distanceChange: number;
  timeChange: number;
  activitiesChange: number;
}

// Advanced Stats Types
export interface WeeklyTrendData {
  week: string;
  weekStart: string;
  distance: number;
  time: number;
  activities: number;
  avgPace: number;
  avgHR: number;
  elevation: number;
  tss: number;
}

export interface MonthlyTrendData {
  month: string;
  distance: number;
  time: number;
  activities: number;
  avgPace: number;
  elevation: number;
}

export interface YearComparison {
  thisYear: {
    distance: number;
    time: number;
    activities: number;
    elevation: number;
  };
  lastYear: {
    distance: number;
    time: number;
    activities: number;
    elevation: number;
  };
}

export interface ZoneDistributionWeek {
  week: string;
  zone1: number;
  zone2: number;
  zone3: number;
  zone4: number;
  zone5: number;
}

export interface TimeOfDayStats {
  hour: number;
  count: number;
  avgPace: number;
  avgHR: number;
}

export interface DayOfWeekStats {
  day: number;
  dayName: string;
  count: number;
  distance: number;
  avgPace: number;
}

export interface PRProgressionEntry {
  date: string;
  time: number;
  activityId: number;
  activityName: string;
}

export interface PRProgression {
  distance: string;
  history: PRProgressionEntry[];
}

export interface PaceHRPoint {
  date: string;
  pace: number;
  hr: number;
  efficiency: number;
  activityName: string;
}

export interface TrainingGoal {
  id: string;
  type: "weekly_distance" | "weekly_time" | "weekly_activities" | "monthly_distance";
  target: number;
  current: number;
  unit: string;
  period: string;
}

export interface TrainingBalanceData {
  easyPercent: number;
  hardPercent: number;
  moderatePercent: number;
  isPolarized: boolean;
  recommendation: string;
}

export interface AdvancedStatsData {
  weeklyData: WeeklyTrendData[];
  monthlyData: MonthlyTrendData[];
  yearComparison: YearComparison;
  zoneDistribution: ZoneDistributionWeek[];
  timeOfDayData: TimeOfDayStats[];
  dayOfWeekData: DayOfWeekStats[];
  prProgression: PRProgression[];
  paceHRData: PaceHRPoint[];
  efficiencyTrend: number;
  goals: TrainingGoal[];
  trainingBalance: TrainingBalanceData;
  estimatedMaxHR: number;
}

export interface PremiumStatsData {
  personalRecords: PersonalRecord[];
  injuryRisk: InjuryRiskData;
  efficiencyData: EfficiencyDataPoint[];
  efficiencyTrend: EfficiencyTrend | null;
  trainingDistribution: TrainingDistribution;
  streaks: StreakData;
  monthComparison: PeriodComparison;
}
