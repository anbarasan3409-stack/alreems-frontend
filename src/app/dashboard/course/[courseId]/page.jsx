'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import CourseDashboard from '@/components/CourseDashboard';

export default function CoursePage() {
  const params = useParams();
  const courseId = params.courseId;

  return <CourseDashboard courseId={courseId} />;
}
