'use client';

import dayjs from 'dayjs';
import { Calendar, Mail, MapPin, Phone, ShieldCheck, User } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PageCardHeader } from '@/@core/components/Table/tanstack-table/CardHeader';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// ❌ import { useGetUserDetails } from '@/api/hooks/customer/hook';

type MockUser = {
  fullName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  createdAt: string;
  status: string;
  userType: string;
  address: any[];
};
type Props = {
  title: string;
  onSubmit: (data: FormValues) => void;
  isPending?: boolean;
  initialData?: FormValues;
};
export type FormValues = {
  name: string;
  description: string;
  icon: File | string | null;
};
const MedicalDeptAddEditForm = ({ title, onSubmit, isPending, initialData }: Props) => {
  const params = useParams();
  const id = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<MockUser | null>(null);

  // ✅ Mock API simulation
  useEffect(() => {
    setTimeout(() => {
      setUser({
        fullName: 'Dr. John Doe',
        email: 'john.doe@example.com',
        phoneNumber: '9876543210',
        countryCode: '+91',
        createdAt: new Date().toISOString(),
        status: 'Active',
        userType: 'Doctor',
        address: [
          {
            firstName: 'John',
            lastName: 'Doe',
            address_line_1: '123 Main Street',
            address_line_2: 'Near City Mall',
            city: 'Kolkata',
            state: 'West Bengal',
            zip_code: '700001',
            address_type: 'Home',
          },
        ],
      });
      setIsLoading(false);
    }, 600);
  }, [id]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center p-6 text-gray-500">
        Loading user details...
      </div>
    );

  if (!user)
    return <div className="flex items-center justify-center p-6 text-red-500">User not found.</div>;

  const statusColor =
    user.status === 'Active'
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-red-100 text-red-700 border-red-200';

  return (
    <div className="space-y-6 p-4">
      <PageCardHeader title="User Details" backButton />

      <Card className="rounded-xl p-6 shadow-sm">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <User />
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold">{user.fullName}</h1>
            <Badge variant="outline" className={`mt-1 capitalize ${statusColor}`}>
              {user.status}
            </Badge>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Personal Info */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium">{user.email || '-'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm font-medium">
                {user.countryCode} {user.phoneNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Registered On</p>
              <p className="text-sm font-medium">{dayjs(user.createdAt).format('DD MMM, YYYY')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">User Type</p>
              <p className="text-sm font-medium capitalize">{user.userType}</p>
            </div>
          </div>
        </div>

        {/* Address Info */}
        {user.address?.length > 0 && (
          <>
            <Separator className="my-4" />
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4" /> Address Details
            </h3>
            <div className="mt-2 space-y-3">
              {user.address.map((addr: any, i: number) => (
                <div key={i} className="rounded-lg border bg-gray-50 p-3 text-sm">
                  <p className="font-medium">
                    {addr.firstName} {addr.lastName}
                  </p>
                  <p>
                    {addr.address_line_1}, {addr.address_line_2}
                  </p>
                  <p>
                    {addr.city}, {addr.state} - {addr.zip_code}
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    {addr.address_type}
                  </Badge>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
export default MedicalDeptAddEditForm;
