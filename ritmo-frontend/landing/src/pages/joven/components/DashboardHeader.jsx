import { mockUser, mockCheckInHistory, estadoConfig } from '../../data/mockData'

export default function DashboardHeader() {
  const now = new Date()
  const hour = now.getHours()
  let greeting = 'Buenas noches'
  if (hour >= 5 && hour < 12) greeting = 'Buenos dias'
  else if (hour >= 12 && hour < 20) greeting = 'Buenas tardes'

  const dateStr = now.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  // Last check-in state
  const lastCheckIn = mockCheckInHistory[mockCheckInHistory.length - 1]
  const stateInfo = lastCheckIn ? estadoConfig[lastCheckIn.estado] : null

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-inner">
        <div className="header-greeting">
          <h1>{greeting}, {mockUser.nombre}</h1>
          <p>{dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}</p>
        </div>
        {stateInfo && (
          <div
            className="header-status-badge"
            style={{
              background: stateInfo.colorLight,
              color: stateInfo.colorDark || stateInfo.color,
            }}
          >
            <span
              className="header-status-dot"
              style={{ background: stateInfo.color }}
            />
            {'Ultimo check-in: ' + stateInfo.label}
          </div>
        )}
      </div>
    </header>
  )
}
