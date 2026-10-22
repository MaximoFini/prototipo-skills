import { lazy, Suspense, useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useApp } from '@/store/useApp'
import { BottomNav, NAV_ITEMS, PageLoading, PhoneFrame } from '@/design'
import { NotificationHost } from '@/features/notifications/NotificationHost'
import { DemoPanel } from '@/features/demo/DemoPanel'
import { PresentationTour } from '@/features/demo/PresentationTour'

const Onboarding = lazy(() => import('@/features/onboarding/OnboardingPage'))
const Placement = lazy(() => import('@/features/placement/PlacementPage'))
const Path = lazy(() => import('@/features/path/PathPage'))
const Profile = lazy(() => import('@/features/profile/ProfilePage'))
const Stats = lazy(() => import('@/features/profile/StatsPage'))
const Settings = lazy(() => import('@/features/profile/SettingsPage'))
const ReminderSettings = lazy(() => import('@/features/profile/ReminderSettingsPage'))
const Friends = lazy(() => import('@/features/friends/FriendsPage'))
const Lesson = lazy(() => import('@/features/lesson/LessonPage'))
const Shop = lazy(() => import('@/features/gamification/ShopPage'))
const Quests = lazy(() => import('@/features/gamification/QuestsPage'))
const Achievements = lazy(() => import('@/features/gamification/AchievementsPage'))
const League = lazy(() => import('@/features/league/LeaguePage'))
const Vacation = lazy(() => import('@/features/vacation/VacationPage'))
const Rewards = lazy(() => import('@/features/vacation/RewardsPage'))
const Practice = lazy(() => import('@/features/practice/PracticePage'))
const Vocabulary = lazy(() => import('@/features/practice/VocabularyPage'))
const PracticeSession = lazy(() => import('@/features/practice/PracticeSessionPage'))
const Admin = lazy(() => import('@/features/admin/AdminApp'))

/** Mantiene el estado fresco: regeneración de corazones y cortes de racha. */
function useHeartbeat() {
  const refresh = useApp((s) => s.refresh)
  useEffect(() => {
    refresh()
    const i = setInterval(refresh, 30_000)
    const onVis = () => document.visibilityState === 'visible' && refresh()
    document.addEventListener('visibilitychange', onVis)
    return () => { clearInterval(i); document.removeEventListener('visibilitychange', onVis) }
  }, [refresh])
}

function RequireOnboarding() {
  const onboarded = useApp((s) => s.profile.onboarded)
  const loc = useLocation()
  if (!onboarded) return <Navigate to="/welcome" replace state={{ from: loc.pathname }} />
  return <Outlet />
}
/** Pestañas: la pantalla nueva entra deslizándose desde el lado de la pestaña tocada. */
function WithNav() {
  const { pathname } = useLocation()
  const reduce = useReducedMotion()
  const idx = Math.max(0, NAV_ITEMS.findIndex((i) => i.to === pathname))
  const prev = useRef(idx)
  const dir = idx === prev.current ? 0 : idx > prev.current ? 1 : -1
  useEffect(() => { prev.current = idx }, [idx])
  return (
    <>
      <main className="min-h-0 flex-1 overflow-hidden">
        <motion.div key={pathname} className="h-full"
          initial={reduce || !dir ? false : { opacity: 0, x: 28 * dir }} animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 34 }}>
          <Outlet />
        </motion.div>
      </main>
      <BottomNav />
    </>
  )
}
function Phone() {
  return (
    <PhoneFrame>
      <Suspense fallback={<PageLoading />}><Outlet /></Suspense>
      <NotificationHost />
      <DemoPanel />
    </PhoneFrame>
  )
}

export default function App() {
  useHeartbeat()
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <PresentationTour />
      <Routes>
        <Route path="/admin/*" element={<Suspense fallback={<PageLoading />}><Admin /></Suspense>} />
        <Route element={<Phone />}>
          <Route path="/welcome" element={<Onboarding />} />
          <Route element={<RequireOnboarding />}>
            <Route element={<WithNav />}>
              <Route path="/" element={<Path />} />
              <Route path="/league" element={<League />} />
              <Route path="/quests" element={<Quests />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="/placement" element={<Placement />} />
            <Route path="/lesson/:lessonId" element={<Lesson />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/practice/session" element={<PracticeSession />} />
            <Route path="/practice/vocabulary" element={<Vocabulary />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/vacation" element={<Vacation />} />
            <Route path="/profile/achievements" element={<Achievements />} />
            <Route path="/profile/stats" element={<Stats />} />
            <Route path="/profile/friends" element={<Friends />} />
            <Route path="/profile/rewards" element={<Rewards />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/reminders" element={<ReminderSettings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
