import { useApp } from '../state/store'
import FirstEncounterEditor from '../components/FirstEncounterEditor'
import FirstEncounterView from '../components/FirstEncounterView'

export default function FirstEncounterPage() {
  const { state } = useApp()
  const encounter = state.firstEncounter

  if (!encounter || !encounter.isLocked) {
    return (
      <div className="first-encounter-page">
        <h1>重返初遇</h1>
        <FirstEncounterEditor />
      </div>
    )
  }

  return (
    <div className="first-encounter-page">
      <h1>初遇回望</h1>
      <FirstEncounterView encounter={encounter} />
    </div>
  )
}