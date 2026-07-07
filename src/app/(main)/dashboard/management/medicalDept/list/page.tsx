import { Suspense } from 'react';

import MedicalDeptList from '@/module/medicalDept/pages/MedicalDeptList';

const MedicalDeptListPage = () => {
  return (
    <Suspense>
      <MedicalDeptList />
    </Suspense>
  );
};

export default MedicalDeptListPage;
