import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PerformanceTracker.css';

const PerformanceTracker = ({ isPreview = false }) => {
  const [performanceData, setPerformanceData] = useState({
    productivity: 8.2,
    efficiency: 7.8,
    qualityScore: 9.1,
    innovationIndex: 7.5,
    collaborationScore: 8.6,
    weeklyGrowth: 3.2
  });

  const [kpiData, setKpiData] = useState([
    { 
      id: 1, 
      name: 'Tareas Completadas', 
      current: 127, 
      target: 120, 
      trend: 'up',
      change: '+8%',
      icon: '✅'
    },
    { 
      id: 2, 
      name: 'Proyectos Entregados', 
      current: 8, 
      target: 6, 
      trend: 'up',
      change: '+33%',
      icon: '🚀'
    },
    { 
      id: 3, 
      name: 'Tiempo Promedio', 
      current: 2.3, 
      target: 2.5, 
      trend: 'down',
      change: '-8%',
      icon: '⏱️'
    },
    { 
      id: 4, 
      name: 'Calificación Cliente', 
      current: 4.8, 
      target: 4.5, 
      trend: 'up',
      change: '+6%',
      icon: '⭐'
    }
  ]);

  const [achievements, setAchievements] = useState([
    { 
      id: 1, 
      title: 'Superaste tu meta mensual',
      description: 'Completaste 127 tareas vs 120 objetivo',
      date: 'Hoy',
      type: 'milestone',
      points: 50
    },
    { 
      id: 2, 
      title: 'Racha de calidad',
      description: '7 días consecutivos con 4.5+ estrellas',
      date: 'Ayer',
      type: 'streak',
      points: 35
    },
    { 
      id: 3, 
      title: 'Innovador del mes',
      description: 'Mayor índice de innovación del equipo',
      date: '2 días',
      type: 'recognition',
      points: 75
    }
  ]);

  const [weeklyData, setWeeklyData] = useState([
    { day: 'Lun', productivity: 7.8, efficiency: 8.2, quality: 8.8, innovation: 7.2 },
    { day: 'Mar', productivity: 8.1, efficiency: 7.9, quality: 9.0, innovation: 7.8 },
    { day: 'Mié', productivity: 8.5, efficiency: 8.3, quality: 9.2, innovation: 8.1 },
    { day: 'Jue', productivity: 8.8, efficiency: 8.6, quality: 9.3, innovation: 7.9 },
    { day: 'Vie', productivity: 9.1, efficiency: 8.9, quality: 9.5, innovation: 8.3 },
    { day: 'Sáb', productivity: 6.5, efficiency: 7.2, quality: 8.5, innovation: 6.8 },
    { day: 'Dom', productivity: 5.8, efficiency: 6.5, quality: 8.0, innovation: 6.2 }
  ]);

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  
  const [performanceInsights, setPerformanceInsights] = useState([
    {
      type: 'strength',
      title: 'Excelente en calidad',
      description: 'Tu puntuación de calidad (9.1/10) está 23% por encima del promedio',
      recommendation: 'Comparte tus métodos de control de calidad con el equipo',
      impact: 'high'
    },
    {
      type: 'opportunity',
      title: 'Innovación en crecimiento',
      description: 'Tu índice de innovación subió 15% esta semana',
      recommendation: 'Continúa explorando nuevas metodologías y herramientas',
      impact: 'medium'
    },
    {
      type: 'alert',
      title: 'Productividad variable',
      description: 'Fluctuación del 40% entre días laborales y fin de semana',
      recommendation: 'Considera establecer rutinas más consistentes',
      impact: 'low'
    }
  ]);

  const calculateOverallPerformance = () => {
    const { productivity, efficiency, qualityScore, innovationIndex, collaborationScore } = performanceData;
    return ((productivity + efficiency + qualityScore + innovationIndex + collaborationScore) / 5).toFixed(1);
  };

  const getPerformanceLevel = () => {
    const score = parseFloat(calculateOverallPerformance());
    if (score >= 9.0) return { level: 'Excepcional', color: '#10b981', emoji: '🏆', description: 'Rendimiento excepcional' };
    if (score >= 8.0) return { level: 'Excelente', color: '#3b82f6', emoji: '🎯', description: 'Muy por encima del promedio' };
    if (score >= 7.0) return { level: 'Bueno', color: '#f59e0b', emoji: '📈', description: 'Rendimiento sólido' };
    if (score >= 6.0) return { level: 'Regular', color: '#ef4444', emoji: '⚖️', description: 'Hay espacio para mejorar' };
    return { level: 'Necesita mejora', color: '#ef4444', emoji: '🔧', description: 'Requiere atención inmediata' };
  };

  const generateRecommendations = () => {
    const recs = [];
    
    if (performanceData.productivity < 8.0) {
      recs.push({
        area: 'Productividad',
        action: 'Implementa técnicas de time-boxing y elimina distracciones',
        priority: 'high',
        impact: '+15% productividad estimada'
      });
    }
    
    if (performanceData.innovationIndex < 7.5) {
      recs.push({
        area: 'Innovación',
        action: 'Dedica 20% del tiempo a experimentar con nuevas ideas',
        priority: 'medium',
        impact: 'Incremento en índice de innovación'
      });
    }
    
    if (performanceData.collaborationScore < 8.0) {
      recs.push({
        area: 'Colaboración',
        action: 'Participa más activamente en reuniones y proyectos grupales',
        priority: 'medium',
        impact: 'Mejor trabajo en equipo'
      });
    }

    return recs;
  };

  if (isPreview) {
    return (
      <motion.div 
        className="performance-tracker-preview"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="preview-header">
          <div className="header-info">
            <h3>Análisis de Rendimiento</h3>
            <div className="performance-score">
              <span className="score-value" style={{ color: getPerformanceLevel().color }}>
                {calculateOverallPerformance()}
              </span>
              <span className="score-label">/10</span>
            </div>
          </div>
          <div className="performance-badge">
            <span className="badge-emoji">{getPerformanceLevel().emoji}</span>
            <span className="badge-level" style={{ color: getPerformanceLevel().color }}>
              {getPerformanceLevel().level}
            </span>
          </div>
        </div>

        <div className="preview-metrics">
          <div className="metric-row">
            <div className="metric-icon">📊</div>
            <div className="metric-info">
              <span className="metric-label">Productividad</span>
              <span className="metric-value">{performanceData.productivity}/10</span>
            </div>
            <div className="metric-trend up">+{performanceData.weeklyGrowth}%</div>
          </div>
          <div className="metric-row">
            <div className="metric-icon">⚡</div>
            <div className="metric-info">
              <span className="metric-label">Eficiencia</span>
              <span className="metric-value">{performanceData.efficiency}/10</span>
            </div>
          </div>
          <div className="metric-row">
            <div className="metric-icon">💎</div>
            <div className="metric-info">
              <span className="metric-label">Calidad</span>
              <span className="metric-value">{performanceData.qualityScore}/10</span>
            </div>
          </div>
        </div>

        <div className="preview-kpis">
          <h4>KPIs Destacados</h4>
          <div className="kpi-list">
            {kpiData.slice(0, 2).map(kpi => (
              <div key={kpi.id} className="kpi-item">
                <span className="kpi-icon">{kpi.icon}</span>
                <div className="kpi-data">
                  <span className="kpi-name">{kpi.name}</span>
                  <div className="kpi-numbers">
                    <span className="kpi-current">{kpi.current}</span>
                    <span className={`kpi-change ${kpi.trend}`}>{kpi.change}</span>
                  </div>
                </div>
                <div className={`kpi-status ${kpi.current >= kpi.target ? 'achieved' : 'pending'}`}>
                  {kpi.current >= kpi.target ? '✓' : '○'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {achievements.length > 0 && (
          <div className="preview-achievement">
            <div className="achievement-icon">🏆</div>
            <div className="achievement-info">
              <span className="achievement-title">{achievements[0].title}</span>
              <span className="achievement-points">+{achievements[0].points} pts</span>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="performance-tracker-container">
      <div className="tracker-header">
        <div className="header-content">
          <div className="title-section">
            <div className="title-icon">📊</div>
            <div>
              <h1>Análisis de Rendimiento</h1>
              <p>Monitoreo completo de tu desempeño profesional y desarrollo</p>
            </div>
          </div>
          <div className="performance-overview">
            <div className="performance-circle">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={getPerformanceLevel().color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(parseFloat(calculateOverallPerformance()) / 10) * 314} 314`}
                  strokeDashoffset="0"
                  transform="rotate(-90 60 60)"
                />
                <text x="60" y="65" textAnchor="middle" className="score-text">
                  {calculateOverallPerformance()}
                </text>
              </svg>
            </div>
            <div className="performance-details">
              <div className="performance-level">
                <span className="level-emoji">{getPerformanceLevel().emoji}</span>
                <span className="level-text" style={{ color: getPerformanceLevel().color }}>
                  {getPerformanceLevel().level}
                </span>
              </div>
              <p className="level-description">{getPerformanceLevel().description}</p>
              <div className="weekly-growth">
                <span className="growth-icon">📈</span>
                <span className="growth-text">+{performanceData.weeklyGrowth}% esta semana</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tracker-navigation">
        <div className="nav-tabs">
          {[
            { id: 'overview', label: 'Resumen', icon: '📋' },
            { id: 'kpis', label: 'KPIs', icon: '🎯' },
            { id: 'trends', label: 'Tendencias', icon: '📈' },
            { id: 'achievements', label: 'Logros', icon: '🏆' },
            { id: 'insights', label: 'Insights', icon: '💡' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="timeframe-selector">
          {['week', 'month', 'quarter'].map(tf => (
            <button
              key={tf}
              className={`timeframe-btn ${selectedTimeframe === tf ? 'active' : ''}`}
              onClick={() => setSelectedTimeframe(tf)}
            >
              {tf === 'week' ? 'Semana' : tf === 'month' ? 'Mes' : 'Trimestre'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="overview-content"
          >
            <div className="metrics-dashboard">
              <div className="core-metrics">
                {[
                  { key: 'productivity', label: 'Productividad', icon: '📊', color: '#3b82f6' },
                  { key: 'efficiency', label: 'Eficiencia', icon: '⚡', color: '#10b981' },
                  { key: 'qualityScore', label: 'Calidad', icon: '💎', color: '#8b5cf6' },
                  { key: 'innovationIndex', label: 'Innovación', icon: '💡', color: '#f59e0b' },
                  { key: 'collaborationScore', label: 'Colaboración', icon: '🤝', color: '#ef4444' }
                ].map(metric => (
                  <div key={metric.key} className="metric-card">
                    <div className="metric-header">
                      <span className="metric-icon">{metric.icon}</span>
                      <span className="metric-label">{metric.label}</span>
                    </div>
                    <div className="metric-value-large">
                      {performanceData[metric.key]}
                      <span className="metric-max">/10</span>
                    </div>
                    <div className="metric-progress">
                      <div className="progress-track">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${(performanceData[metric.key] / 10) * 100}%`,
                            backgroundColor: metric.color
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="metric-status">
                      <span className={performanceData[metric.key] >= 8.0 ? 'excellent' : 
                                      performanceData[metric.key] >= 7.0 ? 'good' : 'needs-improvement'}>
                        {performanceData[metric.key] >= 8.0 ? 'Excelente' : 
                         performanceData[metric.key] >= 7.0 ? 'Bueno' : 'Mejora'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="recommendations-panel">
                <h3>🎯 Recomendaciones Personalizadas</h3>
                <div className="recommendations-list">
                  {generateRecommendations().map((rec, index) => (
                    <div key={index} className={`recommendation-item ${rec.priority}`}>
                      <div className="rec-header">
                        <span className="rec-area">{rec.area}</span>
                        <span className={`priority-indicator ${rec.priority}`}>
                          {rec.priority === 'high' ? '🔥' : '📌'}
                        </span>
                      </div>
                      <p className="rec-action">{rec.action}</p>
                      <div className="rec-impact">{rec.impact}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'kpis' && (
          <motion.div
            key="kpis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="kpis-content"
          >
            <div className="kpis-header">
              <h3>🎯 Indicadores Clave de Rendimiento</h3>
              <button className="add-kpi-btn">
                <span>➕</span>
                Nuevo KPI
              </button>
            </div>

            <div className="kpis-grid">
              {kpiData.map(kpi => (
                <div key={kpi.id} className="kpi-card">
                  <div className="kpi-header">
                    <div className="kpi-title">
                      <span className="kpi-icon-large">{kpi.icon}</span>
                      <span className="kpi-name-large">{kpi.name}</span>
                    </div>
                    <div className={`trend-indicator ${kpi.trend}`}>
                      <span className="trend-icon">
                        {kpi.trend === 'up' ? '↗️' : kpi.trend === 'down' ? '↘️' : '↔️'}
                      </span>
                      <span className="trend-change">{kpi.change}</span>
                    </div>
                  </div>

                  <div className="kpi-metrics">
                    <div className="current-value">
                      <span className="value-number">{kpi.current}</span>
                      <span className="value-label">Actual</span>
                    </div>
                    <div className="target-value">
                      <span className="value-number">{kpi.target}</span>
                      <span className="value-label">Objetivo</span>
                    </div>
                  </div>

                  <div className="kpi-progress-bar">
                    <div className="progress-track-kpi">
                      <div 
                        className="progress-fill-kpi"
                        style={{ 
                          width: `${Math.min((kpi.current / kpi.target) * 100, 100)}%`,
                          backgroundColor: kpi.current >= kpi.target ? '#10b981' : 
                                          kpi.current >= kpi.target * 0.8 ? '#f59e0b' : '#ef4444'
                        }}
                      ></div>
                    </div>
                    <span className="progress-percentage">
                      {Math.round((kpi.current / kpi.target) * 100)}%
                    </span>
                  </div>

                  <div className="kpi-status-badge">
                    <span className={`status-text ${kpi.current >= kpi.target ? 'achieved' : 
                                                   kpi.current >= kpi.target * 0.8 ? 'on-track' : 'behind'}`}>
                      {kpi.current >= kpi.target ? '✅ Logrado' : 
                       kpi.current >= kpi.target * 0.8 ? '🎯 En progreso' : '⚠️ Atrasado'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'trends' && (
          <motion.div
            key="trends"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="trends-content"
          >
            <div className="trends-chart">
              <h3>📈 Evolución del Rendimiento</h3>
              <div className="chart-container">
                <div className="chart-legend">
                  {[
                    { key: 'productivity', label: 'Productividad', color: '#3b82f6' },
                    { key: 'efficiency', label: 'Eficiencia', color: '#10b981' },
                    { key: 'quality', label: 'Calidad', color: '#8b5cf6' },
                    { key: 'innovation', label: 'Innovación', color: '#f59e0b' }
                  ].map(item => (
                    <div key={item.key} className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                      <span className="legend-label">{item.label}</span>
                    </div>
                  ))}
                </div>
                
                <div className="trend-chart-grid">
                  {weeklyData.map((day, index) => (
                    <div key={index} className="day-column">
                      <div className="day-label">{day.day}</div>
                      <div className="trend-bars">
                        <div 
                          className="trend-bar productivity" 
                          style={{ 
                            height: `${(day.productivity / 10) * 100}%`,
                            backgroundColor: '#3b82f6'
                          }}
                          title={`Productividad: ${day.productivity}/10`}
                        ></div>
                        <div 
                          className="trend-bar efficiency" 
                          style={{ 
                            height: `${(day.efficiency / 10) * 100}%`,
                            backgroundColor: '#10b981'
                          }}
                          title={`Eficiencia: ${day.efficiency}/10`}
                        ></div>
                        <div 
                          className="trend-bar quality" 
                          style={{ 
                            height: `${(day.quality / 10) * 100}%`,
                            backgroundColor: '#8b5cf6'
                          }}
                          title={`Calidad: ${day.quality}/10`}
                        ></div>
                        <div 
                          className="trend-bar innovation" 
                          style={{ 
                            height: `${(day.innovation / 10) * 100}%`,
                            backgroundColor: '#f59e0b'
                          }}
                          title={`Innovación: ${day.innovation}/10`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="trend-insights">
              <h3>🔍 Análisis de Patrones</h3>
              <div className="insights-grid">
                <div className="trend-insight">
                  <div className="insight-icon">📊</div>
                  <div className="insight-content">
                    <h4>Tendencia General</h4>
                    <p>Mejora constante durante la semana laboral con pico el viernes</p>
                  </div>
                </div>
                <div className="trend-insight">
                  <div className="insight-icon">💡</div>
                  <div className="insight-content">
                    <h4>Punto Fuerte</h4>
                    <p>Calidad consistentemente alta (promedio 9.0/10)</p>
                  </div>
                </div>
                <div className="trend-insight">
                  <div className="insight-icon">⚡</div>
                  <div className="insight-content">
                    <h4>Oportunidad</h4>
                    <p>Mantener niveles de fin de semana más equilibrados</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="achievements-content"
          >
            <div className="achievements-header">
              <h3>🏆 Logros y Reconocimientos</h3>
              <div className="total-points">
                <span className="points-icon">💎</span>
                <span className="points-value">
                  {achievements.reduce((sum, ach) => sum + ach.points, 0)} puntos
                </span>
              </div>
            </div>

            <div className="achievements-list">
              {achievements.map(achievement => (
                <div key={achievement.id} className={`achievement-card ${achievement.type}`}>
                  <div className="achievement-icon-container">
                    {achievement.type === 'milestone' && <span className="achievement-emoji">🎯</span>}
                    {achievement.type === 'streak' && <span className="achievement-emoji">🔥</span>}
                    {achievement.type === 'recognition' && <span className="achievement-emoji">🏆</span>}
                  </div>
                  <div className="achievement-content">
                    <h4>{achievement.title}</h4>
                    <p>{achievement.description}</p>
                    <div className="achievement-meta">
                      <span className="achievement-date">{achievement.date}</span>
                      <span className="achievement-points">+{achievement.points} pts</span>
                    </div>
                  </div>
                  <div className="achievement-badge">
                    <span className={`badge-type ${achievement.type}`}>
                      {achievement.type === 'milestone' ? 'Hito' :
                       achievement.type === 'streak' ? 'Racha' : 'Premio'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="achievements-stats">
              <h3>📊 Estadísticas de Logros</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-value">12</div>
                  <div className="stat-label">Hitos Alcanzados</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">🔥</div>
                  <div className="stat-value">7</div>
                  <div className="stat-label">Rachas Activas</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-value">3</div>
                  <div className="stat-label">Reconocimientos</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">💎</div>
                  <div className="stat-value">485</div>
                  <div className="stat-label">Puntos Totales</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="insights-content"
          >
            <div className="insights-header">
              <h3>💡 Insights de Rendimiento</h3>
              <span className="insights-period">Análisis de los últimos 30 días</span>
            </div>

            <div className="insights-list">
              {performanceInsights.map((insight, index) => (
                <div key={index} className={`insight-card-detailed ${insight.type}`}>
                  <div className="insight-type-icon">
                    {insight.type === 'strength' && <span>💪</span>}
                    {insight.type === 'opportunity' && <span>🌱</span>}
                    {insight.type === 'alert' && <span>⚠️</span>}
                  </div>
                  <div className="insight-content-detailed">
                    <h4>{insight.title}</h4>
                    <p className="insight-description">{insight.description}</p>
                    <div className="insight-recommendation">
                      <strong>Recomendación:</strong> {insight.recommendation}
                    </div>
                    <div className={`impact-badge ${insight.impact}`}>
                      Impacto: {insight.impact === 'high' ? 'Alto' : 
                               insight.impact === 'medium' ? 'Medio' : 'Bajo'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="ai-performance-coach">
              <div className="coach-header">
                <h3>🤖 Tu Coach de Rendimiento IA</h3>
              </div>
              <div className="coach-analysis">
                <div className="coach-avatar">📊</div>
                <div className="coach-message">
                  <p>
                    <strong>Análisis personalizado:</strong> He observado que tu rendimiento 
                    muestra una clara correlación entre la calidad del trabajo y los viernes, 
                    donde alcanzas tu pico máximo de productividad.
                  </p>
                  <p>
                    <strong>Estrategia recomendada:</strong> Aprovecha tu patrón natural 
                    programando tareas críticas para los viernes y usa los lunes para 
                    planificación y tareas menos demandantes. Esto podría incrementar tu 
                    rendimiento general en un 12%.
                  </p>
                  <div className="coach-actions">
                    <button className="coach-btn primary">Aplicar Estrategia</button>
                    <button className="coach-btn secondary">Ver Más Detalles</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PerformanceTracker;