export type UserRole = {
  _id: string;
  role: string;
  roleDisplayName: string;
};
export type TUsersType = {
  _id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  userName: string;
  profileImage: string;
  isEmailVerified: boolean;
  status: string;
  createdAt: string;
};
