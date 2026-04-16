import { useState } from 'react'
import HomeScreen from './screens/HomeScreen'
import PlanScreen from './screens/PlanScreen'
import ProgressScreen from './screens/ProgressScreen'
import CheckInScreen from './screens/CheckInScreen'
import ExerciseScreen from './screens/ExerciseScreen'
import WorkoutScreen from './screens/WorkoutScreen'
import BottomNav from './components/BottomNav'

export default function App() {
  const [screen, setScreen] = useState('home')

  const renderScreen = () => {
    switch(screen) {
      case 'home': return <HomeScreen setScreen={setScreen} />
      case 'plan': return <PlanScreen setScreen={setScreen} />
      case 'progress': return <ProgressScreen />
      case 'checkin': return <CheckInScreen />
      case 'exercise': return <ExerciseScreen />
      case 'workout': return <WorkoutScreen setScreen={setScreen} />
      default: return <HomeScreen setScreen={setScreen} />
    }
  }

  const hideNav = screen === 'workout'

  return (
    <div style={{ paddingBottom: hideNav ? '0' : '80px', minHeight: '100vh' }}>
      {renderScreen()}
      {!hideNav && <BottomNav screen={screen} setScreen={setScreen} />}
    </div>
  )
}