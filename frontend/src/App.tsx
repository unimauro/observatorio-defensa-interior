import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Resumen } from './pages/Resumen'
import { Empresas } from './pages/Empresas'
import { Presupuesto } from './pages/Presupuesto'
import { Pensiones } from './pages/Pensiones'
import { Remuneraciones } from './pages/Remuneraciones'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Resumen />} />
        <Route path="/empresas" element={<Empresas />} />
        <Route path="/presupuesto" element={<Presupuesto />} />
        <Route path="/pensiones" element={<Pensiones />} />
        <Route path="/remuneraciones" element={<Remuneraciones />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
