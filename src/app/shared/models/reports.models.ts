export interface DailyDashboardStatsDto {
  date: string;
  totalAppointmentsCount: number;
  completedCount: number;
  waitingCount: number;
  cancelledCount: number;
  notSeenCount: number;
  collectedAmount: number;
  outstandingAmount: number;
}

export interface DailyRevenueChartPointDto {
  date: string;
  dayNameAr: string;
  collectedAmount: number;
  outstandingAmount: number;
  totalBillableValue: number;
  completedAppointmentsCount: number;
}

export interface DoctorDailyPerformanceDto {
  doctorId: string;
  doctorName: string;
  completedExamsCount: number;
  completedConsultationsCount: number;
  waitingPatientsCount: number;
  collectedRevenue: number;
  outstandingRevenue: number;
  totalBillableValue: number;
}

export interface FinancialSummaryDto {
  fromDate: string;
  toDate: string;
  totalAppointmentsValue: number;
  collectedAmount: number;
  outstandingAmount: number;
}

export interface DoctorFinancialReportItemDto {
  doctorId: string;
  doctorName: string;
  totalAppointmentsCount: number;
  completedNewExamsCount: number;
  completedConsultationsCount: number;
  waitingCount: number;
  cancelledCount: number;
  notSeenCount: number;
  totalBillableValue: number;
  collectedAmount: number;
  outstandingAmount: number;
}

export interface PeriodFinancialMetricsDto {
  fromDate: string;
  toDate: string;
  totalDaysInPeriod: number;
  totalAppointmentsCount: number;
  completedNewExamsCount: number;
  completedConsultationsCount: number;
  waitingCount: number;
  cancelledCount: number;
  notSeenCount: number;
  averageDailyCompletedExams: number;
  totalBillableValue: number;
  collectedAmount: number;
  outstandingAmount: number;
}

export interface DetailedFinancialReportDto {
  primaryPeriod: PeriodFinancialMetricsDto;
  doctorBreakdown: DoctorFinancialReportItemDto[];
}

export interface SubscriptionDto {
  clinicId: string;
  clinicName: string;
  planName: string;
  status: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  isExpired?: boolean;
  isTrial?: boolean;
}

export interface SubscriptionHistoryItemDto {
  id: string;
  planName: string;
  startDate: string;
  endDate: string;
  action: string;
  createdAtUtc: string;
}

export interface ShortcutsSummaryDto {
  doctorsCount: number;
  secretariesCount: number;
  todayAppointmentsCount: number;
  totalPatientsCount: number;
}

