const AI_INSIGHTS_BASE_URL = 'https://eqv7ecjeolvi7q5ijpiu7zbaam0npwwf.lambda-url.us-east-1.on.aws/api/v1/restaurants';

export interface DemandCapacityPeak {
  datetime: string;
  weekday: string;
  hour: string;
  expected_guests: number;
  expected_occupancy: number;
  insight?: string;
}

export interface DemandCapacityHourlyOccupancy {
  hour: string;
  projected_guests: number;
  expected_occupancy: number;
}

export interface DemandCapacityWeekdayDemand {
  weekday: string;
  relative_to_avg: number;
  insight?: string;
}

export interface CancellationRiskByReservation {
  reservation_id: string;
  customer: string;
  scheduled_for: string;
  probability: number;
}

export interface UserProneToCancel {
  customer: string;
  cancel_rate: number;
}

export interface LoyalCustomersForecast {
  expected_next_month: number;
  trend_vs_last_month: number;
  insight?: string;
}

export interface TimingPopularBookingWindow {
  hour: string;
  percentage: number;
}

export interface EconomicsExpectedRevenue {
  date: string;
  projected_revenue: number;
}

export interface EconomicCancellationRisk {
  projected_loss: number;
  message?: string;
}

export interface SegmentationCustomerSegments {
  planificadores?: number;
  espontaneos?: number;
  premium?: number;
  [key: string]: number | undefined;
}

export interface OperationsLowDemandAlert {
  weekday: string;
  hour: string;
  expected_occupancy: number;
}

export interface TrendSeasonalityMaxSlot {
  weekday: string;
  hour: string;
}

export interface RestaurantAiInsights {
  restaurant_id: string;
  restaurant_name: string;
  generated_at: string;
  indicators: {
    demand_capacity?: {
      next_peak?: DemandCapacityPeak;
      hourly_occupancy?: DemandCapacityHourlyOccupancy[];
      weekday_demand?: DemandCapacityWeekdayDemand[];
    };
    cancellations?: {
      cancellation_risk_by_reservation?: CancellationRiskByReservation[];
      users_prone_to_cancel?: UserProneToCancel[];
      loyal_customers_forecast?: LoyalCustomersForecast;
    };
    timing_behavior?: {
      average_lead_time_days?: number;
      lead_time_trend_vs_last_month?: number;
      popular_booking_windows?: TimingPopularBookingWindow[];
    };
    economics?: {
      expected_revenue_next_days?: EconomicsExpectedRevenue[];
      expected_ticket?: number;
      economic_cancellation_risk?: EconomicCancellationRisk;
    };
    segmentation?: {
      customer_segments?: SegmentationCustomerSegments;
      city_growth?: Array<Record<string, unknown>>;
    };
    operations?: {
      extra_capacity_recommendations?: string[];
      low_demand_alerts?: OperationsLowDemandAlert[];
    };
    trend_seasonality?: {
      monthly_trend_pct?: number;
      seasonality_signal?: string;
      max_expected_slot?: TrendSeasonalityMaxSlot;
    };
  };
}

export async function getRestaurantAiInsights(restaurantId: string): Promise<RestaurantAiInsights> {
  const url = `${AI_INSIGHTS_BASE_URL}/${restaurantId}/ai-insights`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`AI insights request failed (${response.status})`);
    }

    const data = (await response.json()) as RestaurantAiInsights;
    return data;
  } catch (error) {
    console.error('Error fetching restaurant AI insights:', error);
    throw error;
  }
}

