import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { UploadPage } from './components/UploadPage';
import { AnimalInfoPage } from './components/AnimalInfoPage';
import { SimilarAnimalsPage } from './components/SimilarAnimalsPage';
import { AdminPanel } from './components/AdminPanel';

interface RouterProps {
  user: any; // тип User
}

export function Router({ user }: RouterProps) {
  return (
    <Routes>
      <Route path="/" element={<HomePage user={user} />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/upload" element={<UploadPage user={user} />} />
      <Route path="/animal/:id" element={<AnimalInfoPage user={user} />} />
      <Route path="/search" element={<SimilarAnimalsPage user={user} />} />
      <Route path="/admin" element={<AdminPanel user={user} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}