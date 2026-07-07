export enum ROUTES_TYPE {
  management = '/management',
  cms = '/cms',
  auth = '/auth',
  dashboard = '/dashboard',
  profile = '/profile',
  settings = '/settings',
}
export const ROUTES = {
  dashboard: ROUTES_TYPE.dashboard,

  auth: {
    login: `${ROUTES_TYPE.auth}/login`,
    signup: `${ROUTES_TYPE.auth}/sign-up`,
    forgetPassword: `${ROUTES_TYPE.auth}/forget-password`,
  },
  medicalDept: {
    list: `${ROUTES_TYPE.dashboard}${ROUTES_TYPE.management}/medicalDept/list`,
    add: `${ROUTES_TYPE.dashboard}${ROUTES_TYPE.management}/medicalDept/create`,
    edit: (id: string) =>
      `${ROUTES_TYPE.dashboard}${ROUTES_TYPE.management}/medicalDept/edit/${id}`,
    details: (id: string) =>
      `${ROUTES_TYPE.dashboard}${ROUTES_TYPE.management}/medicalDept/details/${id}`,
  },
  patient: {
    list: `${ROUTES_TYPE.dashboard}/patient/list`,
    add: `${ROUTES_TYPE.dashboard}/patient/add`,
    edit: (id: string) => `${ROUTES_TYPE.dashboard}/patient/edit/${id}`,
    view: (id: string) => `${ROUTES_TYPE.dashboard}/patient/view/${id}`,
  },
  doctor: {
    list: `${ROUTES_TYPE.dashboard}/doctor/list`,
    add: `${ROUTES_TYPE.dashboard}/doctor/add`,
    edit: (id: string) => `${ROUTES_TYPE.dashboard}/doctor/edit/${id}`,
    view: (id: string) => `${ROUTES_TYPE.dashboard}/doctor/view/${id}`,
  },
  subadmin: {
    list: `${ROUTES_TYPE.dashboard}/subadmin/list`,
    add: `${ROUTES_TYPE.dashboard}/subadmin/add`,
    edit: (id: string) => `${ROUTES_TYPE.dashboard}/subadmin/edit/${id}`,
    view: (id: string) => `${ROUTES_TYPE.dashboard}/subadmin/view/${id}`,
  },
  report: {
    list: `${ROUTES_TYPE.dashboard}/report/list`,
    add: `${ROUTES_TYPE.dashboard}/report/add`,
    edit: (id: string) => `${ROUTES_TYPE.dashboard}/report/edit/${id}`,
    view: (id: string) => `${ROUTES_TYPE.dashboard}/report/view/${id}`,
    viewPatients: (id: string) => `${ROUTES_TYPE.dashboard}/report/view-report/${id}`,
  },
  state: {
    list: `${ROUTES_TYPE.dashboard}/state/list`,
    add: `${ROUTES_TYPE.dashboard}/state/add`,
    edit: (id: string) => `${ROUTES_TYPE.dashboard}/state/edit/${id}`,
  },
  department: {
    list: `${ROUTES_TYPE.dashboard}/department/list`,
    add: `${ROUTES_TYPE.dashboard}/department/add`,
    edit: (id: string) => `${ROUTES_TYPE.dashboard}/department/edit/${id}`,
    view: (id: string) => `${ROUTES_TYPE.dashboard}/department/view/${id}`,
  },
  contact: `${ROUTES_TYPE.dashboard}/cms/contact`,
  faq: {
    list: `${ROUTES_TYPE.dashboard}${ROUTES_TYPE.cms}/faq/list`,
    add: `${ROUTES_TYPE.dashboard}${ROUTES_TYPE.cms}/faq/create`,
    edit: (id: string) => `${ROUTES_TYPE.dashboard}${ROUTES_TYPE.cms}/faq/edit/${id}`,
  },
  legalPages: {
    termsAndConditions: `${ROUTES_TYPE.dashboard}${ROUTES_TYPE.cms}/legal/terms-and-conditions`,
    privacyPolicy: `${ROUTES_TYPE.dashboard}${ROUTES_TYPE.cms}/legal/privacy-policy`,
  },
  settings: {
    banners: `${ROUTES_TYPE.dashboard}${ROUTES_TYPE.settings}/banners`,
    notification: `${ROUTES_TYPE.dashboard}${ROUTES_TYPE.settings}/notification`,
  },
  profile: {
    view: `${ROUTES_TYPE.dashboard}${ROUTES_TYPE.profile}`,
    edit: `${ROUTES_TYPE.dashboard}${ROUTES_TYPE.profile}/edit`,
  },
  referral: {
    list: `${ROUTES_TYPE.dashboard}${ROUTES_TYPE.management}/referral/list`,
    view: (id: string) => `${ROUTES_TYPE.dashboard}${ROUTES_TYPE.management}/referral/view/${id}`,
  },
  consultationReview: {
    list: `${ROUTES_TYPE.dashboard}${ROUTES_TYPE.management}/consultation-reviews/list`,
  },
  enquiry: {
    list: `${ROUTES_TYPE.dashboard}/enquiry/list`,
    view: (id: string) => `${ROUTES_TYPE.dashboard}/enquiry/view/${id}`,
  },
};
