import {
  CurrentUserProfileDto,
  DoctorDto,
  SecretaryDto,
  SpecialtyDto,
  PatientDto,
  AppointmentDto,
  DailyDashboardStatsDto,
  DailyRevenueChartPointDto,
  DoctorDailyPerformanceDto,
  FinancialSummaryDto,
  HealthProfileItemDto,
  FollowUpMedicationDto,
  ClinicSettingsDto,
  SubscriptionDto
} from '../../shared/models';

export const MOCK_CLINIC_SETTINGS: ClinicSettingsDto = {
  clinicName: 'عيادة النور التخصصية',
  address: '123 شارع الجمهورية - القاهرة',
  phoneNumber: '01012345678',
  whatsAppNumber: '01012345678',
  email: 'info@alnoorclinic.com',
  timeZone: 'Africa/Cairo',
  isRtl: true,
  hasLogo: true
};

export const MOCK_USERS: Record<string, { user: CurrentUserProfileDto; passwordHash: string }> = {
  admin: {
    passwordHash: 'Admin@123',
    user: {
      userId: '11111111-1111-1111-1111-111111111111',
      clinicId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      clinicSlug: 'alnoor',
      clinicName: 'عيادة النور التخصصية',
      userName: 'admin',
      fullName: 'م. أحمد محمد',
      phoneNumber: '01012345678',
      email: 'admin@alnoorclinic.com',
      role: 'Admin',
      doctorId: null
    }
  },
  dr_ahmed: {
    passwordHash: 'Doctor@123',
    user: {
      userId: '22222222-2222-2222-2222-222222222222',
      clinicId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      clinicSlug: 'alnoor',
      clinicName: 'عيادة النور التخصصية',
      userName: 'dr_ahmed',
      fullName: 'د. أحمد علي',
      phoneNumber: '01023456789',
      email: 'dr.ahmed@alnoorclinic.com',
      role: 'Doctor',
      doctorId: 'dddd1111-1111-1111-1111-111111111111'
    }
  },
  dr_maryam: {
    passwordHash: 'Doctor@123',
    user: {
      userId: '33333333-3333-3333-3333-333333333333',
      clinicId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      clinicSlug: 'alnoor',
      clinicName: 'عيادة النور التخصصية',
      userName: 'dr_maryam',
      fullName: 'د. مريم محمود',
      phoneNumber: '01087654321',
      email: 'dr.maryam@alnoorclinic.com',
      role: 'Doctor',
      doctorId: 'dddd2222-2222-2222-2222-222222222222'
    }
  },
  sec_sarah: {
    passwordHash: 'Sec@123',
    user: {
      userId: '44444444-4444-4444-4444-444444444444',
      clinicId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      clinicSlug: 'alnoor',
      clinicName: 'عيادة النور التخصصية',
      userName: 'sec_sarah',
      fullName: 'سارة أحمد',
      phoneNumber: '01122334455',
      email: 'sarah@alnoorclinic.com',
      role: 'Secretary',
      doctorId: null
    }
  }
};

export const MOCK_SPECIALTIES: SpecialtyDto[] = [
  { id: 'sp-1', name: 'باطنة عامة', description: 'تشخيص وعلاج الأمراض الباطنية والمزمنة وارتفاع ضغط الدم والسكري', isActive: true, linkedDoctorsCount: 1 },
  { id: 'sp-2', name: 'أمراض القلب والأوعية الدموية', description: 'رعاية وتشخيص أمراض القلب والشرايين ورسم القلب وإيكو', isActive: true, linkedDoctorsCount: 1 },
  { id: 'sp-3', name: 'طب الأطفال وحديثي الولادة', description: 'متابعة صحة ونمو الأطفال، التطعيمات، وعلاج أمراض الطفولة', isActive: true, linkedDoctorsCount: 1 },
  { id: 'sp-4', name: 'النساء والتوليد', description: 'متابعة الحمل والولادة، السونار، وصحة المرأة الإنجابية', isActive: true, linkedDoctorsCount: 0 },
  { id: 'sp-5', name: 'جراحة العظام والمفاصل', description: 'علاج الكسور، آلام المفاصل والعمود الفقري، وإصابات الملاعب', isActive: true, linkedDoctorsCount: 0 },
  { id: 'sp-6', name: 'الجلدية والتناسلية والليزر', description: 'علاج الأمراض الجلدية، العناية بالبشرة، وجلسات الليزر', isActive: true, linkedDoctorsCount: 1 },
  { id: 'sp-7', name: 'أنف وأذن وحنجرة', description: 'علاج التهابات الجيوب الأنفية، مشاكل السمع، الحساسية، واللوزتين', isActive: true, linkedDoctorsCount: 0 },
  { id: 'sp-8', name: 'طب وجراحة العيون', description: 'فحص قاع العين، قياس النظر، علاج أمراض القرنية والشبكية', isActive: true, linkedDoctorsCount: 0 },
  { id: 'sp-9', name: 'جراحة المسالك البولية والذكورة', description: 'علاج حصوات الكلى والمسالك البولية ومشاكل البروستاتا والذكورة', isActive: true, linkedDoctorsCount: 0 },
  { id: 'sp-10', name: 'طب وجراحة الفم والأسنان', description: 'تنظيف الأسنان، الحشوات التجميلية، علاج الجذور، وتقويم الأسنان', isActive: true, linkedDoctorsCount: 0 },
  { id: 'sp-11', name: 'المخ والأعصاب', description: 'تشخيص وعلاج الصداع المزمن، الصرع، واضطرابات الجهاز العصبي', isActive: true, linkedDoctorsCount: 0 },
  { id: 'sp-12', name: 'العلاج الطبيعي والتأهيل', description: 'إعادة التأهيل بعد العمليات، علاج الانزلاق الغضروفي، وتأهيل المفاصل', isActive: true, linkedDoctorsCount: 0 },
  { id: 'sp-13', name: 'الجهاز الهضمي والكبد والمناظير', description: 'علاج اضطرابات القولون العصبي، قرحة المعدة، وأمراض الكبد والمناظير', isActive: true, linkedDoctorsCount: 0 },
  { id: 'sp-14', name: 'الصدر والجهاز التنفسي', description: 'علاج حساسية الصدر، الربو الشعبي، والتهابات الجهاز التنفسي', isActive: true, linkedDoctorsCount: 0 },
  { id: 'sp-15', name: 'الجراحة العامة وجراحة الأورام', description: 'جراحات اليوم الواحد، استئصال الزائدة والمرارة، والجراحات الصغرى', isActive: true, linkedDoctorsCount: 0 },
  { id: 'sp-16', name: 'الغدد الصماء والسكري', description: 'تنظيم سكر الدم، علاج اضطرابات الغدة الدرقية، واضطرابات الهرمونات', isActive: true, linkedDoctorsCount: 0 },
  { id: 'sp-17', name: 'الطب النفسي وعلاج الإدمان', description: 'الاستشارات النفسية، علاج القلق والاكتئاب، والاضطرابات السلوكية', isActive: true, linkedDoctorsCount: 0 },
  { id: 'sp-18', name: 'التغذية العلاجية وعلاج السمنة', description: 'برامج غذائية مخصصة للسمنة والنحافة وتغذية الرياضيين وأصحاب الأمراض المزمنة', isActive: true, linkedDoctorsCount: 0 }
];

export const MOCK_DOCTORS: DoctorDto[] = [
  {
    doctorId: 'dddd1111-1111-1111-1111-111111111111',
    userId: '22222222-2222-2222-2222-222222222222',
    userName: 'dr_ahmed',
    fullName: 'د. أحمد علي',
    phoneNumber: '01023456789',
    email: 'dr.ahmed@alnoorclinic.com',
    isActive: true,
    maxConsultationsPerCycle: 2,
    newExamPrice: 300,
    consultationPrice: 150,
    specialties: [
      { specialtyId: 'sp-1', specialtyName: 'باطنة عامة وقلب', isPrimary: true, specialtyIsActive: true }
    ]
  },
  {
    doctorId: 'dddd2222-2222-2222-2222-222222222222',
    userId: '33333333-3333-3333-3333-333333333333',
    userName: 'dr_maryam',
    fullName: 'د. مريم محمود',
    phoneNumber: '01087654321',
    email: 'dr.maryam@alnoorclinic.com',
    isActive: true,
    maxConsultationsPerCycle: 1,
    newExamPrice: 250,
    consultationPrice: 120,
    specialties: [
      { specialtyId: 'sp-2', specialtyName: 'طب الأطفال وحديثي الولادة', isPrimary: true, specialtyIsActive: true }
    ]
  },
  {
    doctorId: 'dddd3333-3333-3333-3333-333333333333',
    userId: '55555555-5555-5555-5555-555555555555',
    userName: 'dr_khaled',
    fullName: 'د. خالد سعيد',
    phoneNumber: '01123456789',
    email: 'dr.khaled@alnoorclinic.com',
    isActive: true,
    maxConsultationsPerCycle: 2,
    newExamPrice: 350,
    consultationPrice: 180,
    specialties: [
      { specialtyId: 'sp-3', specialtyName: 'جلدية وتناسلية', isPrimary: true, specialtyIsActive: true }
    ]
  }
];

export const MOCK_SECRETARIES: SecretaryDto[] = [
  {
    userId: '44444444-4444-4444-4444-444444444444',
    userName: 'sec_sarah',
    fullName: 'سارة أحمد',
    phoneNumber: '01122334455',
    email: 'sarah@alnoorclinic.com',
    isActive: true,
    permittedDoctors: [
      { doctorId: 'dddd1111-1111-1111-1111-111111111111', doctorName: 'د. أحمد علي', doctorIsActive: true },
      { doctorId: 'dddd2222-2222-2222-2222-222222222222', doctorName: 'د. مريم محمود', doctorIsActive: true }
    ]
  },
  {
    userId: '66666666-6666-6666-6666-666666666666',
    userName: 'sec_nour',
    fullName: 'نور خالد',
    phoneNumber: '01098765432',
    email: 'nour@alnoorclinic.com',
    isActive: true,
    permittedDoctors: [
      { doctorId: 'dddd1111-1111-1111-1111-111111111111', doctorName: 'د. أحمد علي', doctorIsActive: true },
      { doctorId: 'dddd3333-3333-3333-3333-333333333333', doctorName: 'د. خالد سعيد', doctorIsActive: true }
    ]
  }
];

export const MOCK_PATIENTS: PatientDto[] = [
  {
    patientId: 'p-1',
    fullName: 'أحمد محمد علي',
    phoneNumber: '01012345678',
    isFollowUp: false,
    followUpCardNumber: null,
    age: 35,
    whatsAppNumber: '01012345678',
    hasUsedSpecialPrice: false,
    isActive: true,
    createdAtUtc: '2026-04-10T10:00:00Z'
  },
  {
    patientId: 'p-2',
    fullName: 'سارة محمود أحمد',
    phoneNumber: '01087654321',
    isFollowUp: true,
    followUpCardNumber: 'FOL-2026-089',
    age: 28,
    whatsAppNumber: '01087654321',
    hasUsedSpecialPrice: true,
    isActive: true,
    createdAtUtc: '2026-04-08T11:30:00Z'
  },
  {
    patientId: 'p-3',
    fullName: 'علي حسن محمود',
    phoneNumber: '01123456789',
    isFollowUp: false,
    followUpCardNumber: null,
    age: 45,
    whatsAppNumber: null,
    hasUsedSpecialPrice: false,
    isActive: true,
    createdAtUtc: '2026-04-05T09:15:00Z'
  },
  {
    patientId: 'p-4',
    fullName: 'هبة محمد عبد الله',
    phoneNumber: '01098765432',
    isFollowUp: false,
    followUpCardNumber: null,
    age: 32,
    whatsAppNumber: '01098765432',
    hasUsedSpecialPrice: false,
    isActive: true,
    createdAtUtc: '2026-04-01T14:20:00Z'
  },
  {
    patientId: 'p-5',
    fullName: 'محمد خالد إبراهيم',
    phoneNumber: '01111223344',
    isFollowUp: true,
    followUpCardNumber: 'FOL-2026-104',
    age: 50,
    whatsAppNumber: '01111223344',
    hasUsedSpecialPrice: false,
    isActive: true,
    createdAtUtc: '2026-03-28T16:00:00Z'
  }
];

const todayStr = new Date().toISOString().split('T')[0];

export const MOCK_APPOINTMENTS: AppointmentDto[] = [
  {
    appointmentId: 'apt-1',
    patientId: 'p-1',
    patientName: 'أحمد محمد علي',
    patientPhone: '01012345678',
    patientIsFollowUp: false,
    doctorId: 'dddd1111-1111-1111-1111-111111111111',
    doctorName: 'د. أحمد علي',
    appointmentType: 'NewExam',
    appointmentDate: todayStr,
    queueNumber: 1,
    status: 'Arrived',
    basePriceSnapshot: 300,
    priceSnapshot: 300,
    isSpecialPriceApplied: false,
    specialPriceSnapshot: null,
    discountAmountSnapshot: 0,
    specialPriceNotes: null,
    paidStatus: 'Paid',
    originalExamAppointmentId: null,
    consultationNumber: null,
    isLateConsultationException: false,
    lateConsultationDelayDays: null,
    rescheduledFromAppointmentId: null,
    rescheduledToAppointmentId: null,
    cancellationReason: null,
    notSeenReason: null,
    createdByUserId: '44444444-4444-4444-4444-444444444444',
    createdByName: 'سارة أحمد',
    lastModifiedByUserId: '44444444-4444-4444-4444-444444444444',
    lastModifiedByName: 'سارة أحمد',
    createdAtUtc: new Date().toISOString(),
    completedAtUtc: null
  },
  {
    appointmentId: 'apt-2',
    patientId: 'p-2',
    patientName: 'سارة محمود أحمد',
    patientPhone: '01087654321',
    patientIsFollowUp: true,
    doctorId: 'dddd1111-1111-1111-1111-111111111111',
    doctorName: 'د. أحمد علي',
    appointmentType: 'Consultation',
    appointmentDate: todayStr,
    queueNumber: 2,
    status: 'Confirmed',
    basePriceSnapshot: 150,
    priceSnapshot: 100,
    isSpecialPriceApplied: true,
    specialPriceSnapshot: 100,
    discountAmountSnapshot: 50,
    specialPriceNotes: 'تطبيق تخفيض مريض متابعة منتظم',
    paidStatus: 'Paid',
    originalExamAppointmentId: 'apt-old-1',
    consultationNumber: 1,
    isLateConsultationException: false,
    lateConsultationDelayDays: null,
    rescheduledFromAppointmentId: null,
    rescheduledToAppointmentId: null,
    cancellationReason: null,
    notSeenReason: null,
    createdByUserId: '44444444-4444-4444-4444-444444444444',
    createdByName: 'سارة أحمد',
    lastModifiedByUserId: '44444444-4444-4444-4444-444444444444',
    lastModifiedByName: 'سارة أحمد',
    createdAtUtc: new Date().toISOString(),
    completedAtUtc: null
  },
  {
    appointmentId: 'apt-3',
    patientId: 'p-3',
    patientName: 'علي حسن محمود',
    patientPhone: '01123456789',
    patientIsFollowUp: false,
    doctorId: 'dddd1111-1111-1111-1111-111111111111',
    doctorName: 'د. أحمد علي',
    appointmentType: 'NewExam',
    appointmentDate: todayStr,
    queueNumber: 3,
    status: 'Late',
    basePriceSnapshot: 300,
    priceSnapshot: 300,
    isSpecialPriceApplied: false,
    specialPriceSnapshot: null,
    discountAmountSnapshot: 0,
    specialPriceNotes: null,
    paidStatus: 'Unpaid',
    originalExamAppointmentId: null,
    consultationNumber: null,
    isLateConsultationException: false,
    lateConsultationDelayDays: null,
    rescheduledFromAppointmentId: null,
    rescheduledToAppointmentId: null,
    cancellationReason: null,
    notSeenReason: null,
    createdByUserId: '44444444-4444-4444-4444-444444444444',
    createdByName: 'سارة أحمد',
    lastModifiedByUserId: '44444444-4444-4444-4444-444444444444',
    lastModifiedByName: 'سارة أحمد',
    createdAtUtc: new Date().toISOString(),
    completedAtUtc: null
  },
  {
    appointmentId: 'apt-4',
    patientId: 'p-4',
    patientName: 'هبة محمد عبد الله',
    patientPhone: '01098765432',
    patientIsFollowUp: false,
    doctorId: 'dddd2222-2222-2222-2222-222222222222',
    doctorName: 'د. مريم محمود',
    appointmentType: 'NewExam',
    appointmentDate: todayStr,
    queueNumber: 1,
    status: 'Completed',
    basePriceSnapshot: 250,
    priceSnapshot: 250,
    isSpecialPriceApplied: false,
    specialPriceSnapshot: null,
    discountAmountSnapshot: 0,
    specialPriceNotes: null,
    paidStatus: 'Paid',
    originalExamAppointmentId: null,
    consultationNumber: null,
    isLateConsultationException: false,
    lateConsultationDelayDays: null,
    rescheduledFromAppointmentId: null,
    rescheduledToAppointmentId: null,
    cancellationReason: null,
    notSeenReason: null,
    createdByUserId: '44444444-4444-4444-4444-444444444444',
    createdByName: 'سارة أحمد',
    lastModifiedByUserId: '33333333-3333-3333-3333-333333333333',
    lastModifiedByName: 'د. مريم محمود',
    createdAtUtc: new Date().toISOString(),
    completedAtUtc: new Date().toISOString()
  },
  {
    appointmentId: 'apt-5',
    patientId: 'p-5',
    patientName: 'محمد خالد إبراهيم',
    patientPhone: '01111223344',
    patientIsFollowUp: true,
    doctorId: 'dddd1111-1111-1111-1111-111111111111',
    doctorName: 'د. أحمد علي',
    appointmentType: 'Consultation',
    appointmentDate: todayStr,
    queueNumber: 4,
    status: 'Confirmed',
    basePriceSnapshot: 150,
    priceSnapshot: 150,
    isSpecialPriceApplied: false,
    specialPriceSnapshot: null,
    discountAmountSnapshot: 0,
    specialPriceNotes: null,
    paidStatus: 'Unpaid',
    originalExamAppointmentId: 'apt-old-2',
    consultationNumber: 2,
    isLateConsultationException: false,
    lateConsultationDelayDays: null,
    rescheduledFromAppointmentId: null,
    rescheduledToAppointmentId: null,
    cancellationReason: null,
    notSeenReason: null,
    createdByUserId: '44444444-4444-4444-4444-444444444444',
    createdByName: 'سارة أحمد',
    lastModifiedByUserId: '44444444-4444-4444-4444-444444444444',
    lastModifiedByName: 'سارة أحمد',
    createdAtUtc: new Date().toISOString(),
    completedAtUtc: null
  }
];

export const MOCK_DAILY_STATS: DailyDashboardStatsDto = {
  date: todayStr,
  totalAppointmentsCount: 45,
  completedCount: 38,
  waitingCount: 7,
  cancelledCount: 2,
  notSeenCount: 1,
  collectedAmount: 12500,
  outstandingAmount: 2100
};

export const MOCK_REVENUE_POINTS: DailyRevenueChartPointDto[] = [
  { date: '2026-04-20', dayNameAr: 'السبت', collectedAmount: 8500, outstandingAmount: 1200, totalBillableValue: 9700, completedAppointmentsCount: 28 },
  { date: '2026-04-21', dayNameAr: 'الأحد', collectedAmount: 10200, outstandingAmount: 1500, totalBillableValue: 11700, completedAppointmentsCount: 34 },
  { date: '2026-04-22', dayNameAr: 'الإثنين', collectedAmount: 9400, outstandingAmount: 800, totalBillableValue: 10200, completedAppointmentsCount: 30 },
  { date: '2026-04-23', dayNameAr: 'الثلاثاء', collectedAmount: 11800, outstandingAmount: 2000, totalBillableValue: 13800, completedAppointmentsCount: 39 },
  { date: '2026-04-24', dayNameAr: 'الأربعاء', collectedAmount: 13200, outstandingAmount: 1700, totalBillableValue: 14900, completedAppointmentsCount: 42 },
  { date: '2026-04-25', dayNameAr: 'الخميس', collectedAmount: 14500, outstandingAmount: 2200, totalBillableValue: 16700, completedAppointmentsCount: 46 },
  { date: '2026-04-26', dayNameAr: 'الجمعة', collectedAmount: 12500, outstandingAmount: 2100, totalBillableValue: 14600, completedAppointmentsCount: 38 }
];

export const MOCK_DOCTOR_PERFORMANCE: DoctorDailyPerformanceDto[] = [
  { doctorId: 'dddd1111-1111-1111-1111-111111111111', doctorName: 'د. أحمد علي', completedExamsCount: 18, completedConsultationsCount: 6, waitingPatientsCount: 4, collectedRevenue: 6300, outstandingRevenue: 900, totalBillableValue: 7200 },
  { doctorId: 'dddd2222-2222-2222-2222-222222222222', doctorName: 'د. مريم محمود', completedExamsCount: 12, completedConsultationsCount: 4, waitingPatientsCount: 2, collectedRevenue: 3480, outstandingRevenue: 500, totalBillableValue: 3980 },
  { doctorId: 'dddd3333-3333-3333-3333-333333333333', doctorName: 'د. خالد سعيد', completedExamsCount: 8, completedConsultationsCount: 2, waitingPatientsCount: 1, collectedRevenue: 2720, outstandingRevenue: 700, totalBillableValue: 3420 }
];

export const MOCK_FINANCIAL_SUMMARY: FinancialSummaryDto = {
  fromDate: '2026-04-01',
  toDate: todayStr,
  totalAppointmentsValue: 109500,
  collectedAmount: 85000,
  outstandingAmount: 24500
};

export const MOCK_HEALTH_PROFILE_P1: HealthProfileItemDto[] = [
  { id: 'hp-1', patientId: 'p-1', category: 'ChronicDisease', content: 'ارتفاع ضغط الدم المزمن', source: 'ConfirmedByPatient', verificationStatus: 'Confirmed', addedByUserId: '22222222-2222-2222-2222-222222222222', addedByName: 'د. أحمد علي', createdAtUtc: '2026-04-10T10:00:00Z' },
  { id: 'hp-2', patientId: 'p-1', category: 'FoodAllergy', content: 'حساسية من المكسرات', source: 'ConfirmedByPatient', verificationStatus: 'Confirmed', addedByUserId: '22222222-2222-2222-2222-222222222222', addedByName: 'د. أحمد علي', createdAtUtc: '2026-04-10T10:00:00Z' },
  { id: 'hp-3', patientId: 'p-1', category: 'DrugAllergy', content: 'حساسية من البنسلين ومشتقاته', source: 'RecordedByDoctor', verificationStatus: 'Confirmed', addedByUserId: '22222222-2222-2222-2222-222222222222', addedByName: 'د. أحمد علي', createdAtUtc: '2026-04-10T10:00:00Z' },
  { id: 'hp-4', patientId: 'p-1', category: 'GeneralMedicalNote', content: 'المريض يتناول أدوية الضغط بانتظام في الصباح', source: 'RecordedByDoctor', verificationStatus: 'Confirmed', addedByUserId: '22222222-2222-2222-2222-222222222222', addedByName: 'د. أحمد علي', createdAtUtc: '2026-04-10T10:00:00Z' }
];

export const MOCK_FOLLOW_UP_MEDICATIONS_P2: FollowUpMedicationDto[] = [
  { id: 'med-1', medicalVisitId: 'mv-2', medicineName: 'Amoxicillin 500mg', dosage: '1 كبسولة', frequency: '3 مرات يومياً', duration: '5 أيام', notes: 'بعد الأكل', enteredByUserId: '44444444-4444-4444-4444-444444444444', lastModifiedByUserId: '44444444-4444-4444-4444-444444444444', createdAtUtc: '2026-04-20T11:00:00Z' },
  { id: 'med-2', medicalVisitId: 'mv-2', medicineName: 'Paracetamol 500mg', dosage: '1 قرص', frequency: 'عند اللزوم', duration: 'حتى التحسن', notes: 'كل 8 ساعات كحد أقصى', enteredByUserId: '44444444-4444-4444-4444-444444444444', lastModifiedByUserId: '44444444-4444-4444-4444-444444444444', createdAtUtc: '2026-04-20T11:00:00Z' }
];

export const MOCK_SUBSCRIPTION: SubscriptionDto = {
  clinicId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  clinicName: 'عيادة النور التخصصية',
  planName: 'الباقة المتقدمة الاحترافية (Clinic Pro)',
  status: 'Active',
  startDate: '2026-01-01',
  endDate: '2027-01-01',
  daysRemaining: 243
};

