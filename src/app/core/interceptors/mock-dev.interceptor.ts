import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { of, throwError, delay, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  MOCK_USERS,
  MOCK_CLINIC_SETTINGS,
  MOCK_SPECIALTIES,
  MOCK_DOCTORS,
  MOCK_SECRETARIES,
  MOCK_PATIENTS,
  MOCK_APPOINTMENTS,
  MOCK_DAILY_STATS,
  MOCK_REVENUE_POINTS,
  MOCK_DOCTOR_PERFORMANCE,
  MOCK_FINANCIAL_SUMMARY,
  MOCK_HEALTH_PROFILE_P1,
  MOCK_FOLLOW_UP_MEDICATIONS_P2,
  MOCK_SUBSCRIPTION
} from '../http/mock-data';
import {
  AuthTokenResponse,
  PagedResult,
  ConsultationEligibilityResultDto,
  PricingPreviewDto,
  AppointmentVisitWorkspaceDto
} from '../../shared/models';

export const mockDevInterceptor: HttpInterceptorFn = (req, next) => {
  // STRICT RULE: Never mock in production!
  if (environment.production || !environment.useMockInDevIfOffline) {
    return next(req);
  }

  // Attempt real backend call first, fallback to mock if backend is down (status 0 or 404 or 504)
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If error status is 0 (connection refused, server down) or 404/502/503/504 in dev mode, handle with mock
      if (error.status === 0 || error.status === 404 || error.status >= 500) {
        const mockResponse = handleMockRequest(req);
        if (mockResponse) {
          return of(mockResponse).pipe(delay(150));
        }
      }
      return throwError(() => error);
    })
  );
};

function handleMockRequest(req: any): HttpResponse<any> | null {
  const url = req.url;
  const method = req.method;

  // 1. Auth: Login
  if (url.includes('/auth/login') && method === 'POST') {
    const body = req.body;
    const userEntry = MOCK_USERS[body.userName];
    if (userEntry && userEntry.passwordHash === body.password) {
      const response: AuthTokenResponse = {
        accessToken: 'mock-jwt-token-' + userEntry.user.userId,
        accessTokenExpiresAtUtc: new Date(Date.now() + 3600000).toISOString(),
        refreshToken: 'mock-refresh-token-' + userEntry.user.userId,
        refreshTokenExpiresAtUtc: new Date(Date.now() + 86400000).toISOString(),
        user: userEntry.user
      };
      return new HttpResponse({ status: 200, body: response });
    }
    // Return unauthorized for wrong credentials
    throw new HttpErrorResponse({
      status: 400,
      error: {
        errorCode: 'INVALID_CREDENTIALS',
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة.'
      }
    });
  }

  // 2. Auth: Me
  if (url.includes('/auth/me') && method === 'GET') {
    return new HttpResponse({ status: 200, body: MOCK_USERS['admin'].user });
  }

  // 3. Clinic: Public Info & Settings
  if (url.includes('/clinic/public-info')) {
    return new HttpResponse({
      status: 200,
      body: {
        clinicName: MOCK_CLINIC_SETTINGS.clinicName,
        logoUrl: '/assets/brand/clinicflow-logo.png',
        hasLogo: true
      }
    });
  }

  if (url.includes('/clinic/settings')) {
    if (method === 'GET') {
      return new HttpResponse({ status: 200, body: MOCK_CLINIC_SETTINGS });
    }
    if (method === 'PUT') {
      Object.assign(MOCK_CLINIC_SETTINGS, req.body);
      return new HttpResponse({ status: 200, body: MOCK_CLINIC_SETTINGS });
    }
  }

  // 4. Specialties
  if (url.includes('/specialties')) {
    if (method === 'POST' && url.includes('/specialties/seed')) {
      return new HttpResponse({ status: 200, body: MOCK_SPECIALTIES });
    }
    if (method === 'GET') {
      return new HttpResponse({ status: 200, body: MOCK_SPECIALTIES });
    }
    if (method === 'POST') {
      const newSp = {
        id: 'sp-' + (MOCK_SPECIALTIES.length + 1),
        name: req.body.name,
        description: req.body.description || null,
        isActive: true,
        linkedDoctorsCount: 0
      };
      MOCK_SPECIALTIES.push(newSp);
      return new HttpResponse({ status: 200, body: newSp });
    }
  }

  // 5. Doctors
  if (url.includes('/doctors')) {
    if (method === 'GET') {
      return new HttpResponse({ status: 200, body: MOCK_DOCTORS });
    }
    if (method === 'POST') {
      const newDoc = {
        doctorId: 'dddd-' + (MOCK_DOCTORS.length + 1),
        userId: 'uuuu-' + (MOCK_DOCTORS.length + 1),
        userName: req.body.userName,
        fullName: req.body.fullName,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email || null,
        isActive: true,
        maxConsultationsPerCycle: req.body.maxConsultationsPerCycle || null,
        newExamPrice: req.body.newExamPrice || 0,
        consultationPrice: req.body.consultationPrice || 0,
        specialties: req.body.specialtyIds?.map((id: string) => {
          const sp = MOCK_SPECIALTIES.find(s => s.id === id);
          return {
            specialtyId: id,
            specialtyName: sp?.name || 'تخصص عام',
            isPrimary: id === req.body.primarySpecialtyId,
            specialtyIsActive: true
          };
        }) || []
      };
      MOCK_DOCTORS.push(newDoc);
      return new HttpResponse({ status: 200, body: newDoc });
    }
  }

  // 6. Secretaries
  if (url.includes('/secretaries')) {
    if (method === 'GET') {
      return new HttpResponse({ status: 200, body: MOCK_SECRETARIES });
    }
    if (method === 'POST') {
      const newSec = {
        userId: 'sec-' + (MOCK_SECRETARIES.length + 1),
        userName: req.body.userName,
        fullName: req.body.fullName,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email || null,
        isActive: true,
        permittedDoctors: (req.body.allowedDoctorIds || []).map((id: string) => {
          const doc = MOCK_DOCTORS.find(d => d.doctorId === id);
          return { doctorId: id, doctorName: doc?.fullName || '', doctorIsActive: true };
        })
      };
      MOCK_SECRETARIES.push(newSec);
      return new HttpResponse({ status: 200, body: newSec });
    }
  }

  // 7. Patients
  if (url.includes('/patients')) {
    if (url.includes('/health-profile')) {
      if (method === 'GET') {
        return new HttpResponse({ status: 200, body: MOCK_HEALTH_PROFILE_P1 });
      }
      if (method === 'POST') {
        const newItem = {
          id: 'hp-' + (MOCK_HEALTH_PROFILE_P1.length + 1),
          patientId: 'p-1',
          category: req.body.category,
          content: req.body.content,
          source: req.body.source,
          verificationStatus: req.body.verificationStatus,
          addedByUserId: '22222222-2222-2222-2222-222222222222',
          addedByName: 'د. أحمد علي',
          createdAtUtc: new Date().toISOString()
        };
        MOCK_HEALTH_PROFILE_P1.push(newItem);
        return new HttpResponse({ status: 200, body: newItem });
      }
    }

    if (method === 'GET') {
      const paged: PagedResult<any> = {
        items: MOCK_PATIENTS,
        totalCount: MOCK_PATIENTS.length,
        pageNumber: 1,
        pageSize: 20,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false
      };
      return new HttpResponse({ status: 200, body: paged });
    }

    if (method === 'POST') {
      const newPat = {
        patientId: 'p-' + (MOCK_PATIENTS.length + 1),
        fullName: req.body.fullName,
        phoneNumber: req.body.phoneNumber,
        isFollowUp: !!req.body.isFollowUp,
        followUpCardNumber: req.body.followUpCardNumber || null,
        age: req.body.age || null,
        whatsAppNumber: req.body.whatsAppNumber || null,
        hasUsedSpecialPrice: false,
        isActive: true,
        createdAtUtc: new Date().toISOString()
      };
      MOCK_PATIENTS.push(newPat);
      return new HttpResponse({ status: 200, body: newPat });
    }
  }

  // 8. Appointments
  if (url.includes('/appointments')) {
    if (url.includes('/consultations/check-eligibility')) {
      const result: ConsultationEligibilityResultDto = {
        isEligible: true,
        requiresLateExceptionConfirmation: false,
        mustBookAsNewExam: false,
        statusCode: 'ELIGIBLE',
        message: 'المريض مؤهل للحصول على استشارة سارية.',
        originalExamAppointmentId: 'apt-old-1',
        nextConsultationNumber: 1,
        completedConsultationsInCycle: 0,
        maxConsultationsPerCycle: 2,
        validUntilDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        delayDays: 0,
        lastVisit: {
          visitAppointmentId: 'apt-old-1',
          visitType: 'NewExam',
          visitDate: '2026-04-10',
          completedAtUtc: '2026-04-10T11:00:00Z',
          nextConsultationValidUntilDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]
        }
      };
      return new HttpResponse({ status: 200, body: result });
    }

    if (url.includes('/queue/')) {
      const docId = url.split('/queue/')[1]?.split('?')[0];
      const items = MOCK_APPOINTMENTS.filter(a => !docId || a.doctorId === docId);
      return new HttpResponse({ status: 200, body: items });
    }

    if (method === 'GET') {
      const paged: PagedResult<any> = {
        items: MOCK_APPOINTMENTS,
        totalCount: MOCK_APPOINTMENTS.length,
        pageNumber: 1,
        pageSize: 20,
        totalPages: 1
      };
      return new HttpResponse({ status: 200, body: paged });
    }

    if (method === 'POST' && !url.includes('/arrive') && !url.includes('/late') && !url.includes('/return-to-queue') && !url.includes('/cancel') && !url.includes('/not-seen') && !url.includes('/payments')) {
      const doc = MOCK_DOCTORS.find(d => d.doctorId === req.body.doctorId) || MOCK_DOCTORS[0];
      const pat = MOCK_PATIENTS.find(p => p.patientId === req.body.patientId) || MOCK_PATIENTS[0];
      const nextQueue = Math.max(0, ...MOCK_APPOINTMENTS.map(a => a.queueNumber)) + 1;

      const newApt = {
        appointmentId: 'apt-' + (MOCK_APPOINTMENTS.length + 1),
        patientId: pat.patientId,
        patientName: pat.fullName,
        patientPhone: pat.phoneNumber,
        patientIsFollowUp: pat.isFollowUp,
        doctorId: doc.doctorId,
        doctorName: doc.fullName,
        appointmentType: req.body.appointmentType,
        appointmentDate: req.body.appointmentDate,
        queueNumber: nextQueue,
        status: 'Confirmed' as const,
        basePriceSnapshot: req.body.appointmentType === 'NewExam' ? (doc.newExamPrice || 300) : (doc.consultationPrice || 150),
        priceSnapshot: req.body.applySpecialPrice ? (req.body.appointmentType === 'NewExam' ? 200 : 100) : (req.body.appointmentType === 'NewExam' ? 300 : 150),
        isSpecialPriceApplied: !!req.body.applySpecialPrice,
        specialPriceSnapshot: req.body.applySpecialPrice ? 200 : null,
        discountAmountSnapshot: req.body.applySpecialPrice ? 100 : 0,
        specialPriceNotes: req.body.specialPriceNotes || null,
        paidStatus: 'Unpaid' as const,
        originalExamAppointmentId: req.body.explicitOriginalExamAppointmentId || null,
        consultationNumber: req.body.appointmentType === 'Consultation' ? 1 : null,
        isLateConsultationException: !!req.body.allowLateConsultationException,
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
      };
      MOCK_APPOINTMENTS.push(newApt);
      return new HttpResponse({ status: 200, body: newApt });
    }

    // Appointment status mutations
    if (url.includes('/arrive')) {
      const id = url.split('/appointments/')[1]?.split('/arrive')[0];
      const apt = MOCK_APPOINTMENTS.find(a => a.appointmentId === id);
      if (apt) apt.status = 'Arrived';
      return new HttpResponse({ status: 200, body: apt });
    }

    if (url.includes('/late')) {
      const id = url.split('/appointments/')[1]?.split('/late')[0];
      const apt = MOCK_APPOINTMENTS.find(a => a.appointmentId === id);
      if (apt) apt.status = 'Late';
      return new HttpResponse({ status: 200, body: apt });
    }

    if (url.includes('/return-to-queue')) {
      const id = url.split('/appointments/')[1]?.split('/return-to-queue')[0];
      const apt = MOCK_APPOINTMENTS.find(a => a.appointmentId === id);
      if (apt) {
        apt.status = 'Confirmed';
        apt.queueNumber = Math.max(...MOCK_APPOINTMENTS.map(a => a.queueNumber)) + 1;
      }
      return new HttpResponse({ status: 200, body: apt });
    }

    if (url.includes('/cancel')) {
      const id = url.split('/appointments/')[1]?.split('/cancel')[0];
      const apt = MOCK_APPOINTMENTS.find(a => a.appointmentId === id);
      if (apt) {
        apt.status = 'Cancelled';
        apt.cancellationReason = req.body?.reason || 'تم الإلغاء بطلب من المريض';
      }
      return new HttpResponse({ status: 200, body: apt });
    }

    if (url.includes('/not-seen')) {
      const id = url.split('/appointments/')[1]?.split('/not-seen')[0];
      const apt = MOCK_APPOINTMENTS.find(a => a.appointmentId === id);
      if (apt) {
        apt.status = 'NotSeen';
        apt.notSeenReason = req.body?.reason || 'لم يحضر في موعد الكشف';
      }
      return new HttpResponse({ status: 200, body: apt });
    }

    if (url.includes('/payments')) {
      const id = url.split('/appointments/')[1]?.split('/payments')[0];
      const apt = MOCK_APPOINTMENTS.find(a => a.appointmentId === id);
      if (apt) apt.paidStatus = 'Paid';
      return new HttpResponse({ status: 200, body: { success: true, paidStatus: 'Paid' } });
    }
  }

  // 9. Pricing preview
  if (url.includes('/pricing/preview')) {
    const preview: PricingPreviewDto = {
      doctorId: 'dddd1111-1111-1111-1111-111111111111',
      appointmentType: 'NewExam',
      basePrice: 300,
      isSpecialPricingAvailable: true,
      specialPrice: 200,
      discountAmount: 100,
      announcedRulesDescription: 'خصم خاص للحالات الإنسانية ورعاية الأيتام ومحاربي السرطان',
      doctorConditionsNotes: 'متاح لكافة أيام الأسبوع'
    };
    return new HttpResponse({ status: 200, body: preview });
  }

  if (url.includes('/pricing/doctors')) {
    const docPricings = MOCK_DOCTORS.map(d => ({
      doctorId: d.doctorId,
      doctorName: d.fullName,
      newExamPrice: d.newExamPrice || 300,
      consultationPrice: d.consultationPrice || 150,
      updatedAtUtc: new Date().toISOString()
    }));
    return new HttpResponse({ status: 200, body: docPricings });
  }

  if (url.includes('/pricing/special')) {
    const settings = {
      isSpecialPricingEnabled: true,
      announcedRulesDescription: 'خصم خاص للحالات الإنسانية ورعاية الأيتام ومحاربي السرطان',
      doctorSpecialPrices: [
        {
          id: 'sp-pr-1',
          doctorId: 'dddd1111-1111-1111-1111-111111111111',
          doctorName: 'د. أحمد علي',
          appointmentType: 'NewExam',
          basePrice: 300,
          specialPrice: 200,
          discountAmount: 100,
          conditionsNotes: 'لأول 5 حالات يومياً',
          isActive: true
        }
      ]
    };
    return new HttpResponse({ status: 200, body: settings });
  }

  // 10. Medical Visits
  if (url.includes('/medical-visits')) {
    if (url.includes('/workspace')) {
      const workspace: AppointmentVisitWorkspaceDto = {
        appointmentId: 'apt-1',
        patientId: 'p-1',
        patientName: 'أحمد محمد علي',
        patientIsFollowUp: false,
        appointmentType: 'NewExam',
        appointmentDate: new Date().toISOString().split('T')[0],
        queueNumber: 1,
        consultationNumber: null,
        canSetNextConsultationValidity: true,
        remainingConsultationsAfterThisVisit: 2,
        isUnlimitedConsultations: false,
        autoPrefilledCycleDiagnosis: null,
        existingVisit: null
      };
      return new HttpResponse({ status: 200, body: workspace });
    }

    if (url.includes('/complete')) {
      return new HttpResponse({ status: 200, body: { success: true, status: 'Completed' } });
    }

    if (url.includes('/history')) {
      return new HttpResponse({
        status: 200,
        body: [
          {
            medicalVisitId: 'mv-past-1',
            appointmentId: 'apt-past-1',
            patientId: 'p-1',
            patientName: 'أحمد محمد علي',
            patientIsFollowUp: false,
            doctorId: 'dddd1111-1111-1111-1111-111111111111',
            doctorName: 'د. أحمد علي',
            appointmentType: 'NewExam',
            appointmentDate: '2026-03-15',
            consultationNumber: null,
            diagnosis: 'نزلة معوية حادة مع جفاف بسيط',
            diagnosisNotes: 'تم إعطاء محاليل وريدية وتوصية بالراحة التامة',
            nextConsultationValidUntilDate: '2026-03-29',
            completedAtUtc: '2026-03-15T12:00:00Z',
            followUpMedications: []
          }
        ]
      });
    }

    if (url.includes('/follow-up-medications')) {
      return new HttpResponse({ status: 200, body: MOCK_FOLLOW_UP_MEDICATIONS_P2 });
    }
  }

  // 11. Dashboard & Reports
  if (url.includes('/dashboard/daily-stats')) {
    return new HttpResponse({ status: 200, body: MOCK_DAILY_STATS });
  }

  if (url.includes('/dashboard/revenue-last-7-days')) {
    return new HttpResponse({ status: 200, body: MOCK_REVENUE_POINTS });
  }

  if (url.includes('/dashboard/doctors-performance')) {
    return new HttpResponse({ status: 200, body: MOCK_DOCTOR_PERFORMANCE });
  }

  if (url.includes('/dashboard/financial-summary')) {
    return new HttpResponse({ status: 200, body: MOCK_FINANCIAL_SUMMARY });
  }

  if (url.includes('/dashboard/shortcuts-summary')) {
    return new HttpResponse({
      status: 200,
      body: {
        doctorsCount: MOCK_DOCTORS.length,
        secretariesCount: MOCK_SECRETARIES.length,
        todayAppointmentsCount: MOCK_APPOINTMENTS.length,
        totalPatientsCount: MOCK_PATIENTS.length
      }
    });
  }

  if (url.includes('/subscription')) {
    return new HttpResponse({ status: 200, body: MOCK_SUBSCRIPTION });
  }

  return null;
}

