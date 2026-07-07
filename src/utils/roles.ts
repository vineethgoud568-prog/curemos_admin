interface IAccessEntry {
  route?: string;
  accessSubRoutes?: boolean;
}

interface IRoleInfo {
  canAccess: (string | IAccessEntry)[];
}

interface IRoles {
  [role: string]: IRoleInfo;
}

export const roles: IRoles = {
  Admin: {
    canAccess: ['/*'],
  },
  Employee: {
    canAccess: [
      {
        route: '/orders',
        accessSubRoutes: true,
      },
    ],
  },
};
