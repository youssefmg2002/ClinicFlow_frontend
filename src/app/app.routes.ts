import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { tenantResolver } from './core/guards/tenant.resolver';
import { superAdminGuard } from './core/guards/super-admin.guard';

export const routes: Routes = [
  // Public Marketing Website
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/marketing/landing-page.component').then(m => m.LandingPageComponent)
  },
  {
    path: 'pricing',
    loadComponent: () =>
      import('./features/marketing/pricing-page.component').then(m => m.PricingPageComponent)
  },

  // Public Self-Service Clinic Registration & Verification
  {
    path: 'register',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/auth/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'verify',
        loadComponent: () =>
          import('./features/auth/register-verify.component').then(m => m.RegisterVerifyComponent)
      }
    ]
  },

  // General Clinic Login Portal (by Slug)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/general-login.component').then(m => m.GeneralLoginComponent)
  },

  // Super Admin Platform Console
  {
    path: 'super-admin/login',
    loadComponent: () =>
      import('./features/super-admin/super-admin-login.component').then(m => m.SuperAdminLoginComponent)
  },
  {
    path: 'super-admin',
    canActivate: [superAdminGuard],
    loadComponent: () =>
      import('./core/layout/super-admin-layout.component').then(m => m.SuperAdminLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/super-admin/super-admin-dashboard.component').then(m => m.SuperAdminDashboardComponent)
      },
      {
        path: 'clinics',
        loadComponent: () =>
          import('./features/super-admin/super-admin-clinics.component').then(m => m.SuperAdminClinicsComponent)
      },
      {
        path: 'plans',
        loadComponent: () =>
          import('./features/super-admin/super-admin-plans.component').then(m => m.SuperAdminPlansComponent)
      },
      {
        path: 'promo-codes',
        loadComponent: () =>
          import('./features/super-admin/super-admin-promo-codes.component').then(m => m.SuperAdminPromoCodesComponent)
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/super-admin/super-admin-payments.component').then(m => m.SuperAdminPaymentsComponent)
      },
      {
        path: 'specialties',
        loadComponent: () =>
          import('./features/super-admin/super-admin-specialties.component').then(m => m.SuperAdminSpecialtiesComponent)
      },
      {
        path: 'cms',
        loadComponent: () =>
          import('./features/super-admin/super-admin-cms.component').then(m => m.SuperAdminCmsComponent)
      },
      {
        path: 'staff',
        loadComponent: () =>
          import('./features/super-admin/super-admin-staff.component').then(m => m.SuperAdminStaffComponent)
      }
    ]
  },

  // Error Pages (Global)
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./features/shared-pages/forbidden.component').then(m => m.ForbiddenComponent)
  },
  {
    path: 'server-error',
    loadComponent: () =>
      import('./features/shared-pages/server-error.component').then(m => m.ServerErrorComponent)
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./features/shared-pages/not-found.component').then(m => m.NotFoundComponent)
  },

  // Multi-tenant root (/:clinicSlug)
  {
    path: ':clinicSlug',
    resolve: { tenant: tenantResolver },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login.component').then(m => m.LoginComponent)
      },

      // Shared authenticated account pages
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/shared-pages/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'change-password',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/shared-pages/change-password.component').then(m => m.ChangePasswordComponent)
      },

      // ==========================================
      // ADMIN SECTION
      // ==========================================
      {
        path: 'admin',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Admin'] },
        loadComponent: () =>
          import('./core/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'dashboard'
          },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
          },
          {
            path: 'doctors',
            loadComponent: () =>
              import('./features/admin/doctors/doctors-list.component').then(m => m.DoctorsListComponent)
          },
          {
            path: 'secretaries',
            loadComponent: () =>
              import('./features/admin/secretaries/secretaries-list.component').then(m => m.SecretariesListComponent)
          },
          {
            path: 'specialties',
            loadComponent: () =>
              import('./features/admin/specialties/specialties-list.component').then(m => m.SpecialtiesListComponent)
          },
          {
            path: 'patients',
            loadComponent: () =>
              import('./features/admin/patients/admin-patients-list.component').then(m => m.AdminPatientsListComponent)
          },
          {
            path: 'appointments',
            loadComponent: () =>
              import('./features/admin/appointments/admin-appointments-list.component').then(m => m.AdminAppointmentsListComponent)
          },
          {
            path: 'pricing',
            loadComponent: () =>
              import('./features/admin/pricing/pricing-management.component').then(m => m.PricingManagementComponent)
          },
          {
            path: 'special-pricing',
            loadComponent: () =>
              import('./features/admin/special-pricing/special-pricing.component').then(m => m.SpecialPricingComponent)
          },
          {
            path: 'schedules',
            loadComponent: () =>
              import('./features/admin/schedules/doctor-schedules.component').then(m => m.DoctorSchedulesComponent)
          },
          {
            path: 'reports',
            loadComponent: () =>
              import('./features/admin/reports/financial-reports.component').then(m => m.FinancialReportsComponent)
          },
          {
            path: 'settings',
            loadComponent: () =>
              import('./features/admin/clinic-settings/clinic-settings.component').then(m => m.ClinicSettingsComponent)
          },
          {
            path: 'subscription',
            loadComponent: () =>
              import('./features/admin/subscription/subscription.component').then(m => m.SubscriptionComponent)
          }
        ]
      },

      // ==========================================
      // SECRETARY SECTION
      // ==========================================
      {
        path: 'secretary',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Secretary'] },
        loadComponent: () =>
          import('./core/layout/secretary-layout.component').then(m => m.SecretaryLayoutComponent),
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'dashboard'
          },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/secretary/dashboard/secretary-dashboard.component').then(m => m.SecretaryDashboardComponent)
          },
          {
            path: 'queue',
            loadComponent: () =>
              import('./features/secretary/queue/secretary-queue.component').then(m => m.SecretaryQueueComponent)
          },
          {
            path: 'booking',
            loadComponent: () =>
              import('./features/secretary/booking/secretary-booking.component').then(m => m.SecretaryBookingComponent)
          },
          {
            path: 'payments',
            loadComponent: () =>
              import('./features/secretary/payments/secretary-payments.component').then(m => m.SecretaryPaymentsComponent)
          },
          {
            path: 'patients',
            loadComponent: () =>
              import('./features/secretary/patients/secretary-patients.component').then(m => m.SecretaryPatientsComponent)
          },
          {
            path: 'follow-up-treatment',
            loadComponent: () =>
              import('./features/secretary/follow-up-treatment/secretary-follow-up-treatment.component').then(m => m.SecretaryFollowUpTreatmentComponent)
          }
        ]
      },

      // ==========================================
      // DOCTOR SECTION
      // ==========================================
      {
        path: 'doctor',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Doctor'] },
        loadComponent: () =>
          import('./core/layout/doctor-layout.component').then(m => m.DoctorLayoutComponent),
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'dashboard'
          },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/doctor/dashboard/doctor-dashboard.component').then(m => m.DoctorDashboardComponent)
          },
          {
            path: 'appointments',
            loadComponent: () =>
              import('./features/doctor/appointments/doctor-appointments.component').then(m => m.DoctorAppointmentsComponent)
          },
          {
            path: 'visit',
            loadComponent: () =>
              import('./features/doctor/visit/doctor-visit.component').then(m => m.DoctorVisitComponent)
          },
          {
            path: 'health-profile',
            loadComponent: () =>
              import('./features/doctor/health-profile/doctor-health-profile.component').then(m => m.DoctorHealthProfileComponent)
          },
          {
            path: 'medical-history',
            loadComponent: () =>
              import('./features/doctor/medical-history/doctor-medical-history.component').then(m => m.DoctorMedicalHistoryComponent)
          }
        ]
      }
    ]
  },

  // Fallback Wildcard
  {
    path: '**',
    loadComponent: () =>
      import('./features/shared-pages/not-found.component').then(m => m.NotFoundComponent)
  }
];
