import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ReceptionPage from '@/pages/ReceptionPage'
import PrescriptionPage from '@/pages/PrescriptionPage'
import DispensingPage from '@/pages/DispensingPage'
import ReviewPage from '@/pages/ReviewPage'
import PaymentPage from '@/pages/PaymentPage'
import ClaimPage from '@/pages/ClaimPage'
import PluginManagePage from '@/pages/PluginManagePage'
import DashboardPage from '@/pages/DashboardPage'
import WorkflowLayout from '@/components/WorkflowLayout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<WorkflowLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reception" element={<ReceptionPage />} />
          <Route path="/prescription" element={<PrescriptionPage />} />
          <Route path="/dispensing" element={<DispensingPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/claim" element={<ClaimPage />} />
        </Route>
        <Route path="/plugins" element={<PluginManagePage />} />
      </Routes>
    </BrowserRouter>
  )
}
