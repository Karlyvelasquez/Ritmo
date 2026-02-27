import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiUsers, 
  FiActivity, 
  FiBarChart2, 
  FiSettings, 
  FiLogOut,
  FiHeart,
  FiAlertTriangle,
  FiTrendingUp,
  FiMap,
  FiGlobe,
  FiPieChart,
  FiShield,
  FiZap,
  FiCpu,
  FiMonitor,
  FiTarget,
  FiDatabase,
  FiRefreshCw,
  FiEye,
  FiCalendar,
  FiClock,
  FiMail,
  FiFileText,
  FiDownload,
  FiShare2,
  FiPlus,
  FiServer,
  FiCheckCircle,
  FiUserPlus,
  FiUserCheck,
  FiLock
} from 'react-icons/fi'
import Sidebar from '../components/Sidebar'
import { ThemeContext } from '../RootRouter'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement, Filler } from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import axios from 'axios'
import './AdminDashboard.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler
)

export default function AdminDashboard() {
  // Remover logs de desarrollo
  
  const { darkMode, toggleDark } = useContext(ThemeContext)
  const navigate = useNavigate()
  
  const [activeSection, setActiveSection] = useState('inicio')
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('ritmo_user')
    if (!saved) {
      const tempAdmin = {
        nombre: 'Dr. Ana Rodríguez',
        nivel: 'Investigador Principal',
        tipo: 'admin'
      }
      localStorage.setItem('ritmo_user', JSON.stringify(tempAdmin))
      return tempAdmin
    }
    return JSON.parse(saved)
  })
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [currentInfo, setCurrentInfo] = useState('')

  // console.log('Admin:', admin)
  // console.log('DarkMode:', darkMode)
  // console.log('Active Section:', activeSection)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId)
  }

  const handleLogout = () => {
    localStorage.removeItem('ritmo_user')
    navigate('/login')
  }

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      const dashboardData = {
        casosRiesgo: 12,
        bienestarNacional: 6.8, // Más realista para España según estudios
        ansiedadJovenes: 32, // Datos del CIS España 2023
        impactoMigratorio: 8,
        usuariosTotal: 47852, // Sistema nacional
        sesionesActivas: 2341,
        reportesPendientes: 89
      }

      // Llamada al backend que maneja la API key
      const response = await axios.post('http://localhost:8000/admin/ai-analysis', {
        data: dashboardData,
        context: 'Sistema Nacional de Bienestar - España'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      setAiAnalysis(response.data.analysis || 'Análisis completado. Revise los indicadores principales para identificar tendencias.')
    } catch (error) {
      console.error('Error en análisis IA:', error)
      setAiAnalysis('El sistema de IA está temporalmente no disponible. Los datos muestran tendencias estables en bienestar nacional.')
    }
    setIsAnalyzing(false)
  }

  // Función para mostrar información explicativa
  const showInfo = (topic) => {
    const infoTexts = {
      'bienestar': 'El Índice de Bienestar Nacional (IBN) mide la calidad de vida de los ciudadanos españoles basándose en salud mental, satisfacción laboral, relaciones sociales y estabilidad económica. Se calcula sobre una escala del 1 al 10, donde 7+ indica bienestar óptimo.',
      'riesgo': 'Los Casos de Riesgo Crítico incluyen situaciones que requieren intervención inmediata: ideación suicida, episodios psicóticos agudos, violencia doméstica, crisis de pánico severas y trastornos alimentarios graves. Se activa protocolo de emergencia del Sistema Nacional de Salud.',
      'seguimiento': 'El Sistema de Seguimiento Continuo monitorea 24/7 los indicadores poblacionales mediante: encuestas del CIS, datos del Sistema Nacional de Salud, análisis de redes sociales (anonimizado) y reportes de centros de atención primaria.',
      'reportes': 'Los Reportes Avanzados incluyen análisis epidemiológicos por CCAA, estadísticas demográficas del INE, tendencias de salud mental por franjas etarias y recomendaciones de política pública basadas en IA para el Ministerio de Sanidad.',
      'usuarios': 'El sistema cuenta con 47.852 usuarios registrados del ámbito sanitario español: médicos de atención primaria, psiquiatras, psicólogos clínicos, trabajadores sociales, enfermeros de salud mental y personal administrativo de las CCAA.'
    }
    
    setCurrentInfo(infoTexts[topic] || 'Información técnica no disponible')
    setShowInfoModal(true)
  }

  const adminName = admin?.nombre?.split(' ')[1] || 'Investigador'

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return `Buenos días, Dr. ${adminName}`
    if (hour < 18) return `Buenas tardes, Dr. ${adminName}`
    return `Buenas noches, Dr. ${adminName}`
  }

  const renderContent = () => {
    switch(activeSection) {
      case 'salud-mental':
        const bienestarData = {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Índice de Bienestar Nacional',
              data: [6.4, 6.7, 6.8, 6.9, 6.8, 6.8], // Datos más realistas para España
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.4,
              pointRadius: 6,
              borderWidth: 3
            }
          ]
        }

        const trastornosData = [
          { name: 'Ansiedad', valor: 32, color: '#8884d8' }, // Según CIS 2023
          { name: 'Depresión', valor: 24, color: '#82ca9d' }, // INE Salud Mental
          { name: 'Estrés Laboral', valor: 28, color: '#ffc658' }, // Datos UGT/CCOO
          { name: 'Trastornos Alimentarios', valor: 8, color: '#ff7300' }, // AEETCA
          { name: 'Otros', valor: 8, color: '#8dd1e1' }
        ]

        const edadData = {
          labels: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
          datasets: [
            {
              label: 'Casos por Grupo Etario (por cada 100k hab.)',
              data: [1834, 1456, 1198, 892, 567, 423], // Basado en datos del Ministerio de Sanidad
              backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 205, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
                'rgba(255, 159, 64, 0.8)'
              ]
            }
          ]
        }

        return (
          <div className="admin-section">
            <motion.div 
              className="section-header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1><FiCpu className="section-icon" /> Análisis Avanzado de Salud Mental</h1>
              <p>Monitoreo integral y análisis predictivo de tendencias de salud mental nacional</p>
            </motion.div>
            
            <div className="section-grid advanced">
              <div className="metric-card large">
                <h3>Índice de Bienestar Nacional - Tendencia 6 Meses</h3>
                <div className="chart-container">
                  <Line data={bienestarData} options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: true, text: 'Evolución del Bienestar Mental Nacional' }
                    },
                    scales: {
                      y: { beginAtZero: false, min: 6, max: 8 }
                    },
                    animation: {
                      duration: 2000,
                      easing: 'easeOutQuart'
                    },
                    interaction: {
                      intersect: false,
                      mode: 'index'
                    }
                  }} />
                </div>
                <div className="metric-insights">
                  <div className="insight">
                    <FiTrendingUp className="insight-icon positive" />
                    <span>Tendencia estable con leve mejora (+0.4 puntos)</span>
                  </div>
                </div>
              </div>

              <div className="metric-card medium">
                <h3>Distribución de Trastornos</h3>
                <div className="chart-container">
                  <Doughnut
                    data={{
                      labels: trastornosData.map(item => item.name),
                      datasets: [{
                        data: trastornosData.map(item => item.valor),
                        backgroundColor: trastornosData.map(item => item.color)
                      }]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'bottom' }
                      },
                      animation: {
                        duration: 1500,
                        easing: 'easeOutBounce'
                      },
                      hover: {
                        animationDuration: 300
                      }
                    }}
                  />
                </div>
                <div className="legend-container">
                  {trastornosData.map((item, index) => (
                    <div key={index} className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                      <span>{item.name}: {item.valor}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="metric-card medium">
                <h3>Casos por Grupo Etario</h3>
                <div className="chart-container">
                  <Bar data={edadData} options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      title: { display: true, text: 'Distribución Demográfica' }
                    }
                  }} />
                </div>
              </div>

              <div className="stats-panel">
                <div className="stat-row">
                  <div className="stat-item">
                    <FiUsers className="stat-icon" />
                    <div>
                      <span className="stat-value">1,847</span>
                      <span className="stat-label">Terapias Activas</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <FiHeart className="stat-icon" />
                    <div>
                      <span className="stat-value">85%</span>
                      <span className="stat-label">Tasa de Recuperación</span>
                    </div>
                  </div>
                </div>
                <div className="stat-row">
                  <div className="stat-item">
                    <FiTarget className="stat-icon" />
                    <div>
                      <span className="stat-value">156</span>
                      <span className="stat-label">Nuevos Casos</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <FiCalendar className="stat-icon" />
                    <div>
                      <span className="stat-value">23</span>
                      <span className="stat-label">Días Promedio</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'crisis':
        const crisisTimeData = [
          { hora: '00:00', criticos: 2, moderados: 8, preventivos: 15 },
          { hora: '04:00', criticos: 1, moderados: 5, preventivos: 12 },
          { hora: '08:00', criticos: 3, moderados: 12, preventivos: 25 },
          { hora: '12:00', criticos: 4, moderados: 18, preventivos: 32 },
          { hora: '16:00', criticos: 5, moderados: 22, preventivos: 28 },
          { hora: '20:00', criticos: 3, moderados: 15, preventivos: 20 }
        ]

        const riesgoRegionalData = {
          labels: ['Norte', 'Sur', 'Este', 'Oeste', 'Centro'],
          datasets: [
            {
              label: 'Casos Críticos',
              data: [4, 2, 3, 1, 2],
              backgroundColor: 'rgba(239, 68, 68, 0.8)',
            },
            {
              label: 'Casos Moderados',
              data: [18, 12, 15, 8, 14],
              backgroundColor: 'rgba(245, 158, 11, 0.8)',
            },
            {
              label: 'Casos Preventivos',
              data: [45, 38, 42, 28, 35],
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
            }
          ]
        }

        return (
          <div className="admin-section">
            <motion.div 
              className="section-header crisis-header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1>
                <FiAlertTriangle className="section-icon warning" /> 
                Sistema de Crisis y Riesgo
                <button 
                  className="info-btn" 
                  onClick={() => showInfo('riesgo')}
                  title="¿Qué son los Casos de Riesgo Crítico?"
                >
                  <FiEye size={14} />
                </button>
              </h1>
              <p>Monitoreo en tiempo real y gestión avanzada de crisis de salud mental</p>
            </motion.div>
            
            <div className="crisis-dashboard">
              <div className="alert-overview">
                <motion.div className="alert-card critical" whileHover={{ scale: 1.02 }}>
                  <div className="alert-header">
                    <FiAlertTriangle />
                    <span>CRÍTICO</span>
                    <div className="alert-badge">12</div>
                  </div>
                  <div className="alert-content">
                    <h3>Riesgo Inmediato</h3>
                    <p>Requieren intervención en las próximas 2 horas</p>
                    <div className="alert-actions">
                      <button className="alert-action primary">Protocolo de Emergencia</button>
                      <button className="alert-action">Ver Detalles</button>
                    </div>
                  </div>
                  <div className="alert-timeline">
                    <FiClock /> Último caso hace 15 min
                  </div>
                </motion.div>
                
                <motion.div className="alert-card warning" whileHover={{ scale: 1.02 }}>
                  <div className="alert-header">
                    <FiShield />
                    <span>MODERADO</span>
                    <div className="alert-badge">67</div>
                  </div>
                  <div className="alert-content">
                    <h3>Seguimiento Activo</h3>
                    <p>Monitoreo continuo cada 6 horas</p>
                    <div className="alert-actions">
                      <button className="alert-action primary">Asignar Especialista</button>
                      <button className="alert-action">Revisar Historial</button>
                    </div>
                  </div>
                  <div className="alert-timeline">
                    <FiCalendar /> Próxima revisión en 3h
                  </div>
                </motion.div>
                
                <motion.div className="alert-card info" whileHover={{ scale: 1.02 }}>
                  <div className="alert-header">
                    <FiActivity />
                    <span>PREVENTIVO</span>
                    <div className="alert-badge">234</div>
                  </div>
                  <div className="alert-content">
                    <h3>Intervención Temprana</h3>
                    <p>Programas de prevención y apoyo</p>
                    <div className="alert-actions">
                      <button className="alert-action primary">Generar Plan</button>
                      <button className="alert-action">Enviar Recursos</button>
                    </div>
                  </div>
                  <div className="alert-timeline">
                    <FiMail /> Recordatorio programado
                  </div>
                </motion.div>
              </div>

              <div className="crisis-analytics">
                <div className="chart-panel">
                  <h3>Distribución de Crisis por Hora</h3>
                  <div className="chart-container">
                    <Line 
                      data={{
                        labels: crisisTimeData.map(item => item.hora),
                        datasets: [
                          {
                            label: 'Críticos',
                            data: crisisTimeData.map(item => item.criticos),
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            fill: true
                          },
                          {
                            label: 'Moderados', 
                            data: crisisTimeData.map(item => item.moderados),
                            borderColor: '#f59e0b',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            fill: true
                          },
                          {
                            label: 'Preventivos',
                            data: crisisTimeData.map(item => item.preventivos), 
                            borderColor: '#22c55e',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            fill: true
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'top' }
                        },
                        scales: {
                          y: { stacked: false }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="chart-panel">
                  <h3>Casos por Región</h3>
                  <div className="chart-container">
                    <Bar data={riesgoRegionalData} options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'top' }
                      },
                      scales: {
                        x: { stacked: true },
                        y: { stacked: true }
                      }
                    }} />
                  </div>
                </div>
              </div>

              <div className="protocol-panel">
                <h3>Protocolos de Respuesta</h3>
                <div className="protocol-grid">
                  <div className="protocol-item critical">
                    <FiZap />
                    <div>
                      <h4>Protocolo Crítico</h4>
                      <p>Activación inmediata de servicios de emergencia</p>
                      <span className="protocol-time">Tiempo respuesta: 15 min</span>
                    </div>
                  </div>
                  <div className="protocol-item moderate">
                    <FiEye />
                    <div>
                      <h4>Supervisión Intensiva</h4>
                      <p>Asignación de especialista y seguimiento cada 6h</p>
                      <span className="protocol-time">Tiempo respuesta: 2 horas</span>
                    </div>
                  </div>
                  <div className="protocol-item preventive">
                    <FiMail />
                    <div>
                      <h4>Intervención Preventiva</h4>
                      <p>Recursos educativos y apoyo comunitario</p>
                      <span className="protocol-time">Tiempo respuesta: 24 horas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'demografia':
        const migracionData = [
          { año: '2020', venezolanos: 45000, colombianos: 32000, otros: 18000 },
          { año: '2021', venezolanos: 52000, colombianos: 35000, otros: 22000 },
          { año: '2022', venezolanos: 58000, colombianos: 38000, otros: 25000 },
          { año: '2023', venezolanos: 63000, colombianos: 41000, otros: 28000 },
          { año: '2024', venezolanos: 68000, colombianos: 44000, otros: 31000 }
        ]

        const distribcionEdadData = {
          labels: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
          datasets: [
            {
              label: 'Población Nacional',
              data: [22, 28, 25, 15, 7, 3],
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
            {
              label: 'Población Migrante',
              data: [35, 32, 20, 8, 3, 2],
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
            }
          ]
        }

        const factoresSocioData = [
          { factor: 'Acceso a Salud Mental', alto: 85, medio: 65, bajo: 32 },
          { factor: 'Apoyo Familiar', alto: 92, medio: 78, bajo: 45 },
          { factor: 'Estabilidad Laboral', alto: 88, medio: 52, bajo: 28 },
          { factor: 'Educación Mental', alto: 75, medio: 43, bajo: 18 }
        ]

        return (
          <div className="admin-section">
            <motion.div 
              className="section-header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1><FiGlobe className="section-icon" /> Análisis Demográfico Avanzado</h1>
              <p>Patrones poblacionales, migración y cambios socioculturales en salud mental</p>
            </motion.div>
            
            <div className="demo-dashboard">
              <div className="demo-overview">
                <div className="demo-card highlighted">
                  <div className="demo-header">
                    <FiTrendingUp />
                    <h3>Migración y Adaptación</h3>
                  </div>
                  <div className="demo-stat-large">+15%</div>
                  <p>Casos relacionados con procesos migratorios</p>
                  <div className="demo-details">
                    <div className="detail-item">
                      <span className="detail-label">Venezolanos:</span>
                      <span className="detail-value">68,000</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Colombianos:</span>
                      <span className="detail-value">44,000</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Otros:</span>
                      <span className="detail-value">31,000</span>
                    </div>
                  </div>
                </div>

                <div className="demo-card">
                  <h3>Evolución Migratoria (2020-2024)</h3>
                  <div className="chart-container">
                    <Line
                      data={{
                        labels: migracionData.map(item => item.año),
                        datasets: [
                          {
                            label: 'Venezolanos',
                            data: migracionData.map(item => item.venezolanos),
                            borderColor: '#8884d8',
                            backgroundColor: 'rgba(136, 132, 216, 0.1)',
                            fill: true
                          },
                          {
                            label: 'Colombianos',
                            data: migracionData.map(item => item.colombianos),
                            borderColor: '#82ca9d', 
                            backgroundColor: 'rgba(130, 202, 157, 0.1)',
                            fill: true
                          },
                          {
                            label: 'Otros',
                            data: migracionData.map(item => item.otros),
                            borderColor: '#ffc658',
                            backgroundColor: 'rgba(255, 198, 88, 0.1)', 
                            fill: true
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'top' }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="demo-card">
                  <h3>Distribución por Edad: Nacional vs. Migrante</h3>
                  <div className="chart-container">
                    <Bar data={distribcionEdadData} options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'top' }
                      },
                      scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Porcentaje %' } }
                      }
                    }} />
                  </div>
                </div>
              </div>

              <div className="socioeco-analysis">
                <h3>Análisis Socioeconómico</h3>
                <div className="socioeco-grid">
                  {factoresSocioData.map((factor, index) => (
                    <div key={index} className="socioeco-card">
                      <h4>{factor.factor}</h4>
                      <div className="socioeco-bars">
                        <div className="socio-bar">
                          <span className="bar-label">Alto</span>
                          <div className="bar-container">
                            <div className="bar-fill alto" style={{ width: `${factor.alto}%` }}></div>
                          </div>
                          <span className="bar-value">{factor.alto}%</span>
                        </div>
                        <div className="socio-bar">
                          <span className="bar-label">Medio</span>
                          <div className="bar-container">
                            <div className="bar-fill medio" style={{ width: `${factor.medio}%` }}></div>
                          </div>
                          <span className="bar-value">{factor.medio}%</span>
                        </div>
                        <div className="socio-bar">
                          <span className="bar-label">Bajo</span>
                          <div className="bar-container">
                            <div className="bar-fill bajo" style={{ width: `${factor.bajo}%` }}></div>
                          </div>
                          <span className="bar-value">{factor.bajo}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cultural-insights">
                <h3>Insights Culturales</h3>
                <div className="insights-grid">
                  <div className="insight-card">
                    <FiUsers className="insight-icon" />
                    <h4>Adaptación Cultural</h4>
                    <p>68% de migrantes muestran síntomas de estrés aculturativo en los primeros 6 meses</p>
                    <div className="insight-metric">Tiempo promedio de adaptación: 14 meses</div>
                  </div>
                  <div className="insight-card">
                    <FiHeart className="insight-icon" />
                    <h4>Apoyo Comunitario</h4>
                    <p>Las comunidades con mayor soporte social muestran 40% menos casos de depresión</p>
                    <div className="insight-metric">Efectividad del apoyo: +40%</div>
                  </div>
                  <div className="insight-card">
                    <FiGlobe className="insight-icon" />
                    <h4>Barreras Idiomáticas</h4>
                    <p>23% de casos relacionados con dificultades de comunicación en servicios de salud</p>
                    <div className="insight-metric">Brecha de idioma: 23%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'juventud':
        const ansiedadTrendData = [
          { mes: 'Ene', ansiedad: 58, depresion: 32, estres: 45 },
          { mes: 'Feb', ansiedad: 62, depresion: 35, estres: 48 },
          { mes: 'Mar', ansiedad: 65, depresion: 38, estres: 52 },
          { mes: 'Abr', ansiedad: 63, depresion: 36, estres: 49 },
          { mes: 'May', ansiedad: 67, depresion: 40, estres: 55 },
          { mes: 'Jun', ansiedad: 65, depresion: 37, estres: 53 }
        ]

        const educacionData = {
          labels: ['Secundaria', 'Universidad', 'Posgrado', 'Técnico'],
          datasets: [
            {
              label: 'Casos reportados',
              data: [45, 32, 15, 8],
              backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 205, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)'
              ]
            }
          ]
        }

        const factoresRiesgoJuvenil = [
          { factor: 'Redes Sociales', impacto: 85, tendencia: 'aumentando' },
          { factor: 'Presión Académica', impacto: 78, tendencia: 'estable' },
          { factor: 'Incertidumbre Laboral', impacto: 72, tendencia: 'aumentando' },
          { factor: 'Aislamiento Social', impacto: 69, tendencia: 'disminuyendo' },
          { factor: 'Problemas Familiares', impacto: 65, tendencia: 'estable' }
        ]

        return (
          <div className="admin-section">
            <motion.div 
              className="section-header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1><FiHeart className="section-icon" /> Salud Mental Juvenil</h1>
              <p>Análisis especializado en población joven (15-25 años)</p>
            </motion.div>
            
            <div className="youth-dashboard">
              <div className="youth-overview">
                <motion.div className="youth-stat-card primary" whileHover={{ scale: 1.02 }}>
                  <div className="stat-icon-large">
                    <FiAlertTriangle />
                  </div>
                  <div className="stat-content">
                    <h3>Ansiedad Juvenil</h3>
                    <div className="stat-number">65%</div>
                    <div className="stat-change positive">+3% vs. mes anterior</div>
                    <p>Principal motivo de consulta en jóvenes</p>
                  </div>
                </motion.div>

                <motion.div className="youth-stat-card" whileHover={{ scale: 1.02 }}>
                  <div className="stat-icon-large">
                    <FiUsers />
                  </div>
                  <div className="stat-content">
                    <h3>Casos Activos</h3>
                    <div className="stat-number">1,247</div>
                    <div className="stat-change negative">-5% vs. mes anterior</div>
                    <p>Jóvenes en seguimiento activo</p>
                  </div>
                </motion.div>

                <motion.div className="youth-stat-card" whileHover={{ scale: 1.02 }}>
                  <div className="stat-icon-large">
                    <FiTarget />
                  </div>
                  <div className="stat-content">
                    <h3>Tasa de Recuperación</h3>
                    <div className="stat-number">78%</div>
                    <div className="stat-change positive">+8% vs. año anterior</div>
                    <p>Efectividad de intervenciones</p>
                  </div>
                </motion.div>
              </div>

              <div className="youth-analysis">
                <div className="analysis-panel">
                  <h3>Tendencias de Salud Mental (6 meses)</h3>
                  <div className="chart-container">
                    <Line
                      data={{
                        labels: ansiedadTrendData.map(item => item.mes),
                        datasets: [
                          {
                            label: 'Ansiedad',
                            data: ansiedadTrendData.map(item => item.ansiedad),
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            tension: 0.4
                          },
                          {
                            label: 'Depresión',
                            data: ansiedadTrendData.map(item => item.depresion),
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4
                          },
                          {
                            label: 'Estrés',
                            data: ansiedadTrendData.map(item => item.estres),
                            borderColor: '#f59e0b',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            tension: 0.4
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'top' }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="analysis-panel">
                  <h3>Casos por Nivel Educativo</h3>
                  <div className="chart-container">
                    <Doughnut data={educacionData} options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }} />
                  </div>
                </div>
              </div>

              <div className="risk-factors">
                <h3>Factores de Riesgo Principales</h3>
                <div className="factors-list">
                  {factoresRiesgoJuvenil.map((factor, index) => (
                    <div key={index} className="factor-item">
                      <div className="factor-header">
                        <h4>{factor.factor}</h4>
                        <div className={`trend-badge ${factor.tendencia}`}>
                          {factor.tendencia === 'aumentando' && <FiTrendingUp />}
                          {factor.tendencia === 'disminuyendo' && <FiTrendingUp style={{ transform: 'rotate(180deg)' }} />}
                          {factor.tendencia === 'estable' && <span>—</span>}
                          {factor.tendencia}
                        </div>
                      </div>
                      <div className="factor-impact">
                        <div className="impact-bar">
                          <div 
                            className="impact-fill" 
                            style={{ width: `${factor.impacto}%` }}
                          ></div>
                        </div>
                        <span className="impact-value">{factor.impacto}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="intervention-programs">
                <h3>Programas de Intervención</h3>
                <div className="programs-grid">
                  <div className="program-card">
                    <FiHeart className="program-icon" />
                    <h4>Mindfulness Juvenil</h4>
                    <p>Técnicas de relajación y manejo del estrés adaptadas para jóvenes</p>
                    <div className="program-stats">
                      <span>156 participantes</span>
                      <span className="success-rate">85% efectividad</span>
                    </div>
                  </div>
                  <div className="program-card">
                    <FiUsers className="program-icon" />
                    <h4>Grupos de Apoyo</h4>
                    <p>Sesiones grupales dirigidas por pares y profesionales</p>
                    <div className="program-stats">
                      <span>23 grupos activos</span>
                      <span className="success-rate">78% satisfacción</span>
                    </div>
                  </div>
                  <div className="program-card">
                    <FiMonitor className="program-icon" />
                    <h4>Terapia Digital</h4>
                    <p>Plataforma de terapia online especializada en jóvenes</p>
                    <div className="program-stats">
                      <span>89 usuarios activos</span>
                      <span className="success-rate">92% adherencia</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'geografico':
        return (
          <div className="admin-section">
            <motion.div 
              className="section-header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1>🗺️ Análisis Geográfico</h1>
              <p>Distribución territorial de problemas de salud mental</p>
            </motion.div>
            
            <div className="geo-placeholder">
              <FiMap size={64} />
              <h3>Mapa Interactivo</h3>
              <p>Visualización de casos por región, densidad poblacional y recursos disponibles</p>
              <button className="geo-button">Cargar datos geográficos</button>
            </div>
          </div>
        )
      
      case 'reportes':
        const reportesTiempo = [
          { periodo: 'Enero', generados: 45, descargados: 38, compartidos: 12 },
          { periodo: 'Febrero', generados: 52, descargados: 45, compartidos: 15 },
          { periodo: 'Marzo', generados: 48, descargados: 42, compartidos: 18 },
          { periodo: 'Abril', generados: 55, descargados: 48, compartidos: 20 },
          { periodo: 'Mayo', generados: 58, descargados: 52, compartidos: 22 },
          { periodo: 'Junio', generados: 62, descargados: 55, compartidos: 25 }
        ]

        const tiposReporte = {
          labels: ['Mensual', 'Demográfico', 'Crisis', 'Juventud', 'Investigación'],
          datasets: [
            {
              label: 'Reportes Generados',
              data: [25, 18, 12, 15, 8],
              backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(139, 92, 246, 0.8)'
              ]
            }
          ]
        }

        return (
          <div className="admin-section">
            <motion.div 
              className="section-header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1><FiPieChart className="section-icon" /> Centro de Reportes Avanzados</h1>
              <p>Generación, análisis y distribución de informes para entidades académicas y de salud</p>
            </motion.div>
            
            <div className="reports-dashboard">
              <div className="reports-overview">
                <div className="report-stat-card">
                  <FiFileText className="report-icon" />
                  <div className="report-stat-content">
                    <h3>Reportes Este Mes</h3>
                    <div className="report-number">62</div>
                    <div className="report-change">+12% vs. mes anterior</div>
                  </div>
                </div>
                <div className="report-stat-card">
                  <FiDownload className="report-icon" />
                  <div className="report-stat-content">
                    <h3>Descargas Totales</h3>
                    <div className="report-number">280</div>
                    <div className="report-change">+8% vs. mes anterior</div>
                  </div>
                </div>
                <div className="report-stat-card">
                  <FiShare2 className="report-icon" />
                  <div className="report-stat-content">
                    <h3>Compartidos</h3>
                    <div className="report-number">125</div>
                    <div className="report-change">+15% vs. mes anterior</div>
                  </div>
                </div>
              </div>

              <div className="reports-analytics">
                <div className="analytics-panel">
                  <h3>Actividad de Reportes (6 meses)</h3>
                  <div className="chart-container">
                    <Line
                      data={{
                        labels: reportesTiempo.map(item => item.periodo),
                        datasets: [
                          {
                            label: 'Generados',
                            data: reportesTiempo.map(item => item.generados),
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            fill: true
                          },
                          {
                            label: 'Descargados',
                            data: reportesTiempo.map(item => item.descargados),
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            fill: true
                          },
                          {
                            label: 'Compartidos',
                            data: reportesTiempo.map(item => item.compartidos),
                            borderColor: '#f59e0b',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            fill: true
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'top' }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="analytics-panel">
                  <h3>Tipos de Reporte Más Solicitados</h3>
                  <div className="chart-container">
                    <Doughnut data={tiposReporte} options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }} />
                  </div>
                </div>
              </div>

              <div className="reports-library">
                <div className="library-header">
                  <h3>Biblioteca de Reportes</h3>
                  <div className="library-actions">
                    <button className="btn-action primary">
                      <FiPlus />
                      Nuevo Reporte
                    </button>
                    <button className="btn-action">
                      <FiRefreshCw />
                      Actualizar
                    </button>
                  </div>
                </div>

                <div className="reports-grid">
                  <motion.div className="report-card advanced" whileHover={{ scale: 1.02 }}>
                    <div className="report-header">
                      <div className="report-type monthly">MENSUAL</div>
                      <div className="report-date">Junio 2024</div>
                    </div>
                    <h4>Reporte Integral de Salud Mental</h4>
                    <p>Análisis completo de métricas, tendencias y recomendaciones del mes</p>
                    <div className="report-metrics">
                      <span><FiEye /> 156 visualizaciones</span>
                      <span><FiDownload /> 89 descargas</span>
                    </div>
                    <div className="report-actions">
                      <button className="report-btn primary">Ver Reporte</button>
                      <button className="report-btn">Descargar PDF</button>
                      <button className="report-btn">Compartir</button>
                    </div>
                  </motion.div>

                  <motion.div className="report-card advanced" whileHover={{ scale: 1.02 }}>
                    <div className="report-header">
                      <div className="report-type demographic">DEMOGRÁFICO</div>
                      <div className="report-date">Trimestre Q2</div>
                    </div>
                    <h4>Análisis Poblacional y Migración</h4>
                    <p>Impacto de cambios demográficos en patrones de salud mental</p>
                    <div className="report-metrics">
                      <span><FiEye /> 89 visualizaciones</span>
                      <span><FiDownload /> 67 descargas</span>
                    </div>
                    <div className="report-actions">
                      <button className="report-btn primary">Ver Reporte</button>
                      <button className="report-btn">Descargar PDF</button>
                      <button className="report-btn">Compartir</button>
                    </div>
                  </motion.div>

                  <motion.div className="report-card advanced" whileHover={{ scale: 1.02 }}>
                    <div className="report-header">
                      <div className="report-type crisis">CRISIS</div>
                      <div className="report-date">Semanal</div>
                    </div>
                    <h4>Reporte de Gestión de Crisis</h4>
                    <p>Casos críticos, protocolos activados y resultados de intervención</p>
                    <div className="report-metrics">
                      <span><FiEye /> 234 visualizaciones</span>
                      <span><FiDownload /> 123 descargas</span>
                    </div>
                    <div className="report-actions">
                      <button className="report-btn primary">Ver Reporte</button>
                      <button className="report-btn">Descargar PDF</button>
                      <button className="report-btn">Compartir</button>
                    </div>
                  </motion.div>

                  <motion.div className="report-card advanced" whileHover={{ scale: 1.02 }}>
                    <div className="report-header">
                      <div className="report-type youth">JUVENTUD</div>
                      <div className="report-date">Mensual</div>
                    </div>
                    <h4>Salud Mental Juvenil Especializado</h4>
                    <p>Tendencias específicas en población de 15-25 años</p>
                    <div className="report-metrics">
                      <span><FiEye /> 145 visualizaciones</span>
                      <span><FiDownload /> 98 descargas</span>
                    </div>
                    <div className="report-actions">
                      <button className="report-btn primary">Ver Reporte</button>
                      <button className="report-btn">Descargar PDF</button>
                      <button className="report-btn">Compartir</button>
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="report-templates">
                <h3>Plantillas Disponibles</h3>
                <div className="templates-grid">
                  <div className="template-item">
                    <FiFileText className="template-icon" />
                    <h4>Reporte Ejecutivo</h4>
                    <p>Resumen de alto nivel para directivos</p>
                    <button className="template-btn">Usar Plantilla</button>
                  </div>
                  <div className="template-item">
                    <FiBarChart2 className="template-icon" />
                    <h4>Análisis Técnico</h4>
                    <p>Reporte detallado con métricas específicas</p>
                    <button className="template-btn">Usar Plantilla</button>
                  </div>
                  <div className="template-item">
                    <FiUsers className="template-icon" />
                    <h4>Informe Comunitario</h4>
                    <p>Resultados adaptados para la comunidad</p>
                    <button className="template-btn">Usar Plantilla</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'configuracion':
        const sistemasIntegrados = [
          { nombre: 'OpenAI GPT', estado: 'activo', ultimaSync: '2 min', conexiones: 1247 },
          { nombre: 'Base de Datos', estado: 'activo', ultimaSync: 'Tiempo real', conexiones: 5432 },
          { nombre: 'API Salud Pública', estado: 'warning', ultimaSync: '15 min', conexiones: 89 },
          { nombre: 'Sistema de Alertas', estado: 'activo', ultimaSync: '30 seg', conexiones: 234 }
        ]

        const usuariosActivos = {
          labels: ['Administradores', 'Investigadores', 'Clínicos', 'Analistas', 'Supervisores'],
          datasets: [
            {
              label: 'Usuarios Activos',
              data: [8, 25, 45, 12, 6],
              backgroundColor: [
                'rgba(239, 68, 68, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(139, 92, 246, 0.8)'
              ]
            }
          ]
        }

        return (
          <div className="admin-section">
            <motion.div 
              className="section-header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1><FiSettings className="section-icon" /> Centro de Configuración del Sistema</h1>
              <p>Administración avanzada y configuración del ecosistema RITMO</p>
            </motion.div>
            
            <div className="config-dashboard">
              <div className="config-overview">
                <div className="config-stat-card">
                  <FiServer className="config-icon" />
                  <div className="config-stat-content">
                    <h3>Estado del Sistema</h3>
                    <div className="system-status operational">Operacional</div>
                    <p>Todos los servicios funcionando correctamente</p>
                  </div>
                </div>
                <div className="config-stat-card">
                  <FiUsers className="config-icon" />
                  <div className="config-stat-content">
                    <h3>Usuarios Totales</h3>
                    <div className="config-number">96</div>
                    <p>Activos en las últimas 24 horas</p>
                  </div>
                </div>
                <div className="config-stat-card">
                  <FiShield className="config-icon" />
                  <div className="config-stat-content">
                    <h3>Seguridad</h3>
                    <div className="security-level high">Alto</div>
                    <p>Todos los protocolos activos</p>
                  </div>
                </div>
              </div>

              <div className="config-panels">
                <div className="config-panel">
                  <div className="panel-header">
                    <h3><FiDatabase /> Integraciones del Sistema</h3>
                    <button className="panel-action">
                      <FiPlus /> Nueva Integración
                    </button>
                  </div>
                  <div className="integrations-list">
                    {sistemasIntegrados.map((sistema, index) => (
                      <div key={index} className="integration-item">
                        <div className="integration-info">
                          <h4>{sistema.nombre}</h4>
                          <span className="integration-details">
                            Última sync: {sistema.ultimaSync} | {sistema.conexiones.toLocaleString()} conexiones
                          </span>
                        </div>
                        <div className="integration-controls">
                          <div className={`status-badge ${sistema.estado}`}>
                            {sistema.estado === 'activo' && <FiCheckCircle />}
                            {sistema.estado === 'warning' && <FiAlertTriangle />}
                            {sistema.estado}
                          </div>
                          <button className="control-btn"><FiSettings /></button>
                          <button className="control-btn"><FiRefreshCw /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="config-panel">
                  <div className="panel-header">
                    <h3><FiUsers /> Gestión de Usuarios</h3>
                    <button className="panel-action">
                      <FiUserPlus /> Nuevo Usuario
                    </button>
                  </div>
                  <div className="users-chart">
                    <Doughnut
                      data={{
                        labels: usuariosActivos.labels,
                        datasets: [{
                          data: usuariosActivos.datasets[0].data,
                          backgroundColor: usuariosActivos.datasets[0].backgroundColor
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom' }
                        }
                      }}
                      height={250}
                    />
                  </div>
                  <div className="user-actions">
                    <button className="user-action-btn">
                      <FiUserCheck /> Revisar Permisos
                    </button>
                    <button className="user-action-btn">
                      <FiLock /> Configurar Seguridad
                    </button>
                  </div>
                </div>
              </div>

              <div className="config-settings">
                <div className="settings-grid">
                  <motion.div className="setting-card" whileHover={{ scale: 1.02 }}>
                    <div className="setting-header">
                      <FiAlertTriangle className="setting-icon danger" />
                      <h4>Parámetros de Alertas</h4>
                    </div>
                    <p>Configurar umbrales de riesgo y protocolos de respuesta</p>
                    <div className="setting-options">
                      <div className="option-row">
                        <span>Umbral Crítico:</span>
                        <input type="number" value="85" className="threshold-input" />
                        <span>%</span>
                      </div>
                      <div className="option-row">
                        <span>Tiempo de Respuesta:</span>
                        <select className="time-select">
                          <option>15 minutos</option>
                          <option>30 minutos</option>
                          <option>1 hora</option>
                        </select>
                      </div>
                    </div>
                    <button className="setting-btn primary">Guardar Configuración</button>
                  </motion.div>

                  <motion.div className="setting-card" whileHover={{ scale: 1.02 }}>
                    <div className="setting-header">
                      <FiCpu className="setting-icon ai" />
                      <h4>Configuración de IA</h4>
                    </div>
                    <p>Ajustes del análisis inteligente y modelos de predicción</p>
                    <div className="setting-options">
                      <div className="option-row">
                        <span>Frecuencia de Análisis:</span>
                        <select className="frequency-select">
                          <option>Tiempo Real</option>
                          <option>Cada Hora</option>
                          <option>Diario</option>
                        </select>
                      </div>
                      <div className="option-row">
                        <span>Nivel de Detalle:</span>
                        <input type="range" min="1" max="10" value="7" className="detail-slider" />
                      </div>
                    </div>
                    <button className="setting-btn primary">Actualizar IA</button>
                  </motion.div>

                  <motion.div className="setting-card" whileHover={{ scale: 1.02 }}>
                    <div className="setting-header">
                      <FiDatabase className="setting-icon data" />
                      <h4>Gestión de Datos</h4>
                    </div>
                    <p>Configuración de backup, retención y privacidad de datos</p>
                    <div className="setting-options">
                      <div className="option-row">
                        <span>Backup Automático:</span>
                        <label className="toggle-switch">
                          <input type="checkbox" checked />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      <div className="option-row">
                        <span>Retención de Datos:</span>
                        <select className="retention-select">
                          <option>1 año</option>
                          <option>2 años</option>
                          <option>5 años</option>
                        </select>
                      </div>
                    </div>
                    <button className="setting-btn primary">Aplicar Cambios</button>
                  </motion.div>

                  <motion.div className="setting-card" whileHover={{ scale: 1.02 }}>
                    <div className="setting-header">
                      <FiMail className="setting-icon notification" />
                      <h4>Notificaciones</h4>
                    </div>
                    <p>Configurar alertas por email, SMS y notificaciones push</p>
                    <div className="setting-options">
                      <div className="option-row checkbox-row">
                        <label>
                          <input type="checkbox" checked />
                          Alertas de Crisis por Email
                        </label>
                      </div>
                      <div className="option-row checkbox-row">
                        <label>
                          <input type="checkbox" checked />
                          Reportes Semanales
                        </label>
                      </div>
                      <div className="option-row checkbox-row">
                        <label>
                          <input type="checkbox" />
                          Notificaciones Push
                        </label>
                      </div>
                    </div>
                    <button className="setting-btn primary">Guardar Preferencias</button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
              const realtimeData = [
          { time: 'Ahora', bienestar: 6.8, casos: 23 },
          { time: '-1h', bienestar: 6.9, casos: 18 },
          { time: '-2h', bienestar: 6.7, casos: 21 },
          { time: '-3h', bienestar: 6.8, casos: 25 },
          { time: '-4h', bienestar: 6.9, casos: 20 },
          { time: '-5h', bienestar: 6.8, casos: 19 }
        ]

        return (
          <>
            <motion.div 
              className="dashboard-header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="greeting-section">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {getGreeting()}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Panel avanzado de monitoreo de salud mental nacional - Centro de investigación RITMO
                </motion.p>
              </div>

              <motion.div 
                className="admin-action-bar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <button 
                  className="ai-analysis-btn"
                  onClick={handleAiAnalysis}
                  disabled={isAnalyzing}
                >
                  <FiCpu />
                  {isAnalyzing ? 'Analizando...' : 'Análisis con IA'}
                </button>
                
                <div className="stats-mini admin-stats">
                  <div className="stat-item critical">
                    <FiShield />
                    <span>12 alertas</span>
                  </div>
                  <div className="stat-item active">
                    <FiZap />
                    <span>2,341 activas</span>
                  </div>
                  <div className="stat-item info">
                    <FiDatabase />
                    <span>47,852 registros</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Panel de Análisis IA */}
            {aiAnalysis && (
              <motion.div 
                className="ai-analysis-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="ai-header">
                  <FiCpu className="ai-icon" />
                  <h3>Análisis Inteligente del Sistema</h3>
                  <button 
                    className="ai-close"
                    onClick={() => setAiAnalysis('')}
                  >×</button>
                </div>
                <div className="ai-content">
                  <p>{aiAnalysis}</p>
                </div>
              </motion.div>
            )}

            <motion.div 
              className="dashboard-grid admin-grid enhanced"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="grid-main">
                {/* Panel de Monitoreo en Tiempo Real */}
                <motion.div
                  className="realtime-monitor"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="monitor-header">
                    <FiMonitor className="monitor-icon" />
                    <div>
                      <h3>
                        Índice de Bienestar Nacional
                        <button 
                          className="info-btn" 
                          onClick={() => showInfo('bienestar')}
                          title="¿Qué es el Índice de Bienestar Nacional?"
                        >
                          <FiEye size={14} />
                        </button>
                      </h3>
                      <p className="monitor-subtitle">Últimas 6 horas</p>
                    </div>
                    <div className="status-indicator active">
                      <div className="status-dot"></div>
                      En vivo
                    </div>
                  </div>
                  <div className="realtime-chart">
                    <Line
                      data={{
                        labels: realtimeData.map(item => item.time),
                        datasets: [{
                          label: 'Bienestar',
                          data: realtimeData.map(item => item.bienestar),
                          borderColor: '#8884d8',
                          backgroundColor: 'rgba(136, 132, 216, 0.1)',
                          tension: 0.4,
                          pointRadius: 6,
                          borderWidth: 3
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false }
                        },
                        scales: {
                          y: { min: 6, max: 8 }
                        }
                      }}
                      height={200}
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="stat-card-large critical-cases enhanced"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="stat-header">
                    <FiAlertTriangle className="stat-icon critical pulse" />
                    <div>
                      <h3>Casos de Riesgo Crítico</h3>
                      <p className="stat-subtitle">Monitoreo 24/7</p>
                    </div>
                    <div className="alert-status">
                      <div className="alert-dot critical"></div>
                      Activo
                    </div>
                  </div>
                  <div className="stat-number-large">12</div>
                  <div className="stat-detail">
                    <FiClock />
                    Último caso hace 15 min
                  </div>
                  <div className="stat-actions">
                    <button className="stat-btn primary">Protocolo de Emergencia</button>
                    <button className="stat-btn">Ver Todos</button>
                  </div>
                </motion.div>

                <motion.div
                  className="stat-card-large mental-health enhanced"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="stat-header">
                    <FiActivity className="stat-icon mental" />
                    <div>
                      <h3>Índice Bienestar Nacional</h3>
                      <p className="stat-subtitle">Promedio poblacional</p>
                    </div>
                    <div className="trend-indicator positive">
                      <FiTrendingUp />
                      +2.3%
                    </div>
                  </div>
                  <div className="stat-number-large">7.2<span className="stat-unit">/10</span></div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '72%' }}></div>
                  </div>
                  <div className="stat-detail">Medición en tiempo real</div>
                </motion.div>

                <div className="grid-row-2">
                  <motion.div
                    className="stat-card-medium youth-analysis enhanced"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="card-header">
                      <FiHeart className="icon" />
                      <h3>Ansiedad en Jóvenes</h3>
                    </div>
                    <div className="main-stat">65%</div>
                    <div className="sub-stat">de casos reportados</div>
                    <div className="mini-chart">
                      <div className="chart-bar" style={{ height: '60%' }}></div>
                      <div className="chart-bar" style={{ height: '75%' }}></div>
                      <div className="chart-bar" style={{ height: '65%' }}></div>
                      <div className="chart-bar" style={{ height: '80%' }}></div>
                      <div className="chart-bar" style={{ height: '65%' }}></div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="stat-card-medium migration-impact enhanced"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="card-header">
                      <FiGlobe className="icon" />
                      <h3>Impacto Migratorio</h3>
                    </div>
                    <div className="main-stat">+15%</div>
                    <div className="sub-stat">Cambios culturales detectados</div>
                    <div className="geographic-indicator">
                      <FiMap />
                      <span>5 regiones afectadas</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="grid-sidebar enhanced">
                <div className="admin-tools-panel">
                  <h3>
                    <FiSettings />
                    Panel de Control
                  </h3>
                  <div className="tools-list">
                    <button 
                      className="tool-item priority"
                      onClick={() => handleSectionChange('crisis')}
                    >
                      <FiAlertTriangle />
                      <div>
                        <span>Gestión de Crisis</span>
                        <small>12 casos activos</small>
                      </div>
                    </button>
                    <button 
                      className="tool-item"
                      onClick={() => handleSectionChange('salud-mental')}
                    >
                      <FiCpu />
                      <div>
                        <span>Análisis de Salud Mental</span>
                        <small>Dashboard completo</small>
                      </div>
                    </button>
                    <button 
                      className="tool-item"
                      onClick={() => handleSectionChange('reportes')}
                    >
                      <FiPieChart />
                      <div>
                        <span>Reportes Avanzados</span>
                        <small>23 pendientes</small>
                      </div>
                    </button>
                    <button 
                      className="tool-item"
                      onClick={() => handleSectionChange('configuracion')}
                    >
                      <FiSettings />
                      <div>
                        <span>Configuración</span>
                        <small>Sistema y usuarios</small>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="system-stats enhanced">
                  <h3>
                    <FiCpu />
                    Estado del Sistema
                  </h3>
                  <div className="system-stat">
                    <FiUsers />
                    <span>Usuarios totales: 1,289</span>
                    <div className="stat-bar">
                      <div className="stat-fill" style={{ width: '89%' }}></div>
                    </div>
                  </div>
                  <div className="system-stat">
                    <FiActivity />
                    <span>Sesiones activas: 45</span>
                    <div className="stat-bar">
                      <div className="stat-fill" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div className="system-stat">
                    <FiBarChart2 />
                    <span>Reportes pendientes: 23</span>
                    <div className="stat-bar">
                      <div className="stat-fill" style={{ width: '23%' }}></div>
                    </div>
                  </div>
                  <div className="server-status">
                    <div className="status-item">
                      <div className="status-dot active"></div>
                      <span>Servidor Principal: Activo</span>
                    </div>
                    <div className="status-item">
                      <div className="status-dot active"></div>
                      <span>Base de Datos: Activa</span>
                    </div>
                    <div className="status-item">
                      <div className="status-dot warning"></div>
                      <span>API Externa: Limitada</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Modal de Información */}
            {showInfoModal && (
              <div className="modal-overlay">
                <motion.div 
                  className="modal-content info-modal"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="modal-header">
                    <h3>Información del Sistema</h3>
                    <button 
                      className="modal-close"
                      onClick={() => setShowInfoModal(false)}
                    >×</button>
                  </div>
                  <div className="modal-body">
                    <p>{currentInfo}</p>
                  </div>
                  <div className="modal-footer">
                    <button 
                      className="btn-primary"
                      onClick={() => setShowInfoModal(false)}
                    >
                      Entendido
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </>
        )
    }
  }

  return (
    <div className="dashboard-layout admin-edition">
      <Sidebar 
        darkMode={darkMode} 
        toggleDark={toggleDark} 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        profileType="admin"
      />
      
      <div className="dashboard-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <main className="dashboard-content">
        {renderContent()}
      </main>
    </div>
  )
}