'use client';

import { Icon } from '@iconify/react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AccessDeniedProps {
  title?: string;
  description?: string;
}

const AccessDenied = ({
  title = 'Access Denied',
  description = "You don't have permission to access this resource.",
}: AccessDeniedProps) => {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Icon icon="lucide:shield-alert" className="text-destructive h-5 w-5" />
          <CardTitle className="text-2xl">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <Icon icon="lucide:lock" className="text-muted-foreground/50 h-16 w-16" />
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessDenied;
