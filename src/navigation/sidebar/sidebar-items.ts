import { ROUTES } from './routes';

export type IconifyIconString = string;

export interface INavSubItem {
  title: string;
  url?: string;
  icon?: IconifyIconString;
  comingSoon?: boolean;
  subItems?: INavSubItem[];
  slug: string;
}

export interface INavMainItem {
  title: string;
  url?: string;
  icon?: IconifyIconString;
  subItems?: INavSubItem[];
  comingSoon?: boolean;
  slug: string;
}

export interface INavGroup {
  id: number;
  label?: string;
  items: INavMainItem[];
}

export const sidebarItems: INavGroup[] = [
  {
    id: 1,
    label: 'MANAGEMENT',
    items: [
      {
        title: 'Doctors',
        url: ROUTES.doctor.list,
        icon: 'wpf:doctors-bag',
        slug: 'doctor',
      },
      {
        title: 'Patients',
        icon: 'fluent:patient-24-regular',
        url: ROUTES.patient.list,
        slug: 'patient',
      },
      {
        title: 'Sub Admins',
        icon: 'mdi:account-supervisor',
        url: ROUTES.subadmin.list,
        slug: 'subadmin',
      },
      {
        title: 'Departments',
        icon: 'mingcute:department-line',
        url: ROUTES.department.list,
        slug: 'department',
      },
      {
        title: 'Hospital Referrals',
        icon: 'solar:hospital-line-duotone',
        url: ROUTES.referral.list,
        slug: 'referral',
      },
      {
        title: 'Consultation Reviews',
        icon: 'mdi:star-comment-outline',
        url: ROUTES.consultationReview.list,
        slug: 'consultation-review',
      },
      {
        title: 'Reports',
        icon: 'oui:nav-reports',
        url: ROUTES.report.list,
        slug: 'report',
      },
      // {
      //   title: 'Medical Council States',
      //   icon: 'mdi:map-marker-radius',
      //   url: ROUTES.state.list,
      //   slug: 'state',
      // },
    ],
  },

  {
    id: 2,
    label: 'CMS',
    items: [
      {
        title: 'FAQ',
        url: ROUTES.faq.list,
        icon: 'mdi:comment-question-outline',
        slug: 'faq',
      },
      {
        title: 'Privacy Policy',
        url: ROUTES.legalPages.privacyPolicy,
        icon: 'mdi:shield-lock-outline',
        slug: 'privacy-policy',
      },
      {
        title: 'Terms & Conditions',
        url: ROUTES.legalPages.termsAndConditions,
        icon: 'mdi:scale-balance',
        slug: 'terms-and-conditions',
      },
    ],
  },
  {
    id: 3,
    label: 'Enquiries',
    items: [
      {
        title: 'Enquiries',
        url: ROUTES.enquiry.list,
        icon: 'mdi:comment-question-outline',
        slug: 'enquiry',
      },
    ],
  },
  {
    id: 4,
    label: 'Settings & Configuration',
    items: [
      {
        title: 'Contact Us',
        url: ROUTES.contact,
        icon: 'mdi:scale-balance',
        slug: 'contact',
      },
      {
        title: 'Banners',
        url: ROUTES.settings.banners,
        icon: 'mdi:image-multiple-outline',
        slug: 'banners',
      },
      {
        title: 'Notification',
        icon: 'mdi:bell-outline',
        url: ROUTES.settings.notification,
        slug: 'notification',
      },
    ],
  },
];
