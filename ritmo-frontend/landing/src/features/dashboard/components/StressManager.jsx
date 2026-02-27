import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './StressManager.css';

const StressManager = ({ isPreview = false }) => {
  const [stressLevel, setStressLevel] = useState(6.2);
  const [stressData, setStressData] = useState({
    current: 6.2,
    average: 5.8,
    peak: 8.4,
    lowest: 2.1,
    trend: 'stable'
  });

  const [stressFactors, setStressFactors] = useState([
    { id: 1, factor: 'Carga de trabajo', impact: 8.5, frequency: 'Diaria', icon: '💼' },
    { id: 2, factor: 'Reuniones frecuentes', impact: 6.8, frequency: 'Semanal', icon: '📅' },
    { id: 3, factor: 'Deadlines ajustados', impact: 9.2, frequency: 'Mensual', icon: '⏰' },
    { id: 4, factor: 'Comunicación con cliente', impact: 5.4, frequency: 'Ocasional', icon: '📞' },
    { id: 5, factor: 'Cambios de prioridades', impact: 7.6, frequency: 'Semanal', icon: '🔄' }
  ]);

  const [reliefTechniques, setReliefTechniques] = useState([
    { 
      id: 1, 
      name: 'Respiración profunda', 
      duration: '5 min', 
      effectiveness: 8.5, 
      category: 'inmediato',
      description: 'Técnica de respiración 4-7-8 para relajación instantánea',
      icon: '🫁',
      steps: ['Inhala por 4 seg', 'Mantén por 7 seg', 'Exhala por 8 seg', 'Repite 4 veces']
    },
    { 
      id: 2, 
      name: 'Meditación mindfulness', 
      duration: '10 min', 
      effectiveness: 9.1, 
      category: 'corto',
      description: 'Meditación guiada para centrar la mente y reducir ansiedad',
      icon: '🧘',
      steps: ['Busca lugar tranquilo', 'Cierra los ojos', 'Concéntrate en respiración', 'Observa pensamientos sin juzgar']
    },
    { 
      id: 3, 
      name: 'Caminata activa', 
      duration: '15 min', 
      effectiveness: 7.8, 
      category: 'activo',
      description: 'Ejercicio ligero al aire libre para liberar tensión',
      icon: '🚶',
      steps: ['Sal al exterior', 'Camina a ritmo moderado', 'Respira aire fresco', 'Observa el entorno']
    },
    { 
      id: 4, 
      name: 'Pausa visual', 
      duration: '3 min', 
      effectiveness: 6.2, 
      category: 'inmediato',
      description: 'Descanso para los ojos y la mente durante trabajo intenso',
      icon: '👀',
      steps: ['Mira punto lejano', 'Parpadea conscientemente', 'Masajea sienes', 'Estira cuello']
    }
  ]);

  const [weeklyStress, setWeeklyStress] = useState([
    { day: 'Lun', morning: 4.2, afternoon: 6.8, evening: 5.3, triggers: ['Reunión matutina', 'Email urgente'] },
    { day: 'Mar', morning: 3.8, afternoon: 7.2, evening: 4.9, triggers: ['Presentación', 'Deadline proyecto'] },
    { day: 'Mié', morning: 5.1, afternoon: 8.4, evening: 6.7, triggers: ['Conflicto equipo', 'Cambio requisitos'] },
    { day: 'Jue', morning: 4.6, afternoon: 6.1, evening: 5.8, triggers: ['Revisión cliente', 'Problema técnico'] },
    { day: 'Vie', morning: 3.2, afternoon: 5.4, evening: 3.8, triggers: ['Cierre semanal'] },
    { day: 'Sáb', morning: 2.1, afternoon: 3.5, evening: 2.8, triggers: ['Tiempo personal'] },
    { day: 'Dom', morning: 1.8, afternoon: 2.9, evening: 3.4, triggers: ['Preparación semana'] }
  ]);

  const [activeTab, setActiveTab] = useState('monitor');
  const [activeSession, setActiveSession] = useState(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const [stressAlerts, setStressAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Nivel de estrés elevado',
      description: 'Tu estrés ha estado por encima de 6.0 durante 3 horas',
      timestamp: '14:30',
      action: 'Tomar un descanso de 10 minutos'
    },
    {
      id: 2,
      type: 'suggestion',
      title: 'Momento ideal para meditación',
      description: 'Patrón detectado: meditación a esta hora reduce 40% el estrés',
      timestamp: '11:45',
      action: 'Iniciar sesión de mindfulness'
    }
  ]);

  const getStressColor = (level) => {
    if (level <= 3) return '#10b981';
    if (level <= 5) return '#3b82f6';
    if (level <= 7) return '#f59e0b';
    return '#ef4444';
  };

  const getStressCategory = (level) => {
    if (level <= 3) return { label: 'Bajo', emoji: '😌', description: 'Estado relajado' };
    if (level <= 5) return { label: 'Moderado', emoji: '😐', description: 'Nivel manejable' };
    if (level <= 7) return { label: 'Alto', emoji: '😰', description: 'Requiere atención' };
    return { label: 'Crítico', emoji: '😵', description: 'Acción inmediata necesaria' };
  };

  const startRelaxationSession = (technique) => {
    setActiveSession(technique);
    setSessionTimer(0);
    setIsSessionActive(true);
  };

  const stopSession = () => {
    setIsSessionActive(false);
    setActiveSession(null);
    setSessionTimer(0);
  };

  useEffect(() => {
    let interval;
    if (isSessionActive && activeSession) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, activeSession]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateRecommendations = () => {
    const recs = [];
    
    if (stressData.current > 7) {
      recs.push({
        priority: 'urgent',
        title: 'Reducción inmediata necesaria',
        action: 'Toma un descanso de 15 minutos y practica respiración profunda',
        technique: 'Respiración profunda'
      });
    }
    
    if (stressData.average > 6) {
      recs.push({
        priority: 'high',
        title: 'Patrón de estrés elevado',
        action: 'Integra 2 sesiones de meditación diarias en tu rutina',
        technique: 'Meditación mindfulness'
      });
    }
    
    if (weeklyStress.filter(day => day.afternoon > 7).length > 2) {
      recs.push({
        priority: 'medium',
        title: 'Tardes estresantes recurrentes',
        action: 'Programa pausas activas cada 2 horas en las tardes',
        technique: 'Caminata activa'
      });
    }

    return recs;
  };

  if (isPreview) {
    return (
      <motion.div 
        className="stress-manager-preview"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="preview-header">
          <div className="header-info">
            <h3>Gestión del Estrés</h3>
            <div className="stress-indicator">
              <div 
                className="stress-bar" 
                style={{ backgroundColor: getStressColor(stressData.current) }}
              >
                <div className="stress-level-text">{stressData.current}/10</div>
              </div>
            </div>
          </div>
          <div className="stress-status">
            <span className="status-emoji">{getStressCategory(stressData.current).emoji}</span>
            <span className="status-label" style={{ color: getStressColor(stressData.current) }}>
              {getStressCategory(stressData.current).label}
            </span>
          </div>
        </div>

        <div className="preview-metrics">
          <div className="metric-item">
            <span className="metric-icon">📊</span>
            <div className="metric-info">
              <span className="metric-label">Promedio</span>
              <span className="metric-value">{stressData.average}/10</span>
            </div>
          </div>
          <div className="metric-item">
            <span className="metric-icon">📈</span>
            <div className="metric-info">
              <span className="metric-label">Pico máximo</span>
              <span className="metric-value">{stressData.peak}/10</span>
            </div>
          </div>
          <div className="metric-item">
            <span className="metric-icon">🎯</span>
            <div className="metric-info">
              <span className="metric-label">Tendencia</span>
              <span className="metric-value">{stressData.trend}</span>
            </div>
          </div>
        </div>

        <div className="preview-top-factors">
          <h4>Principales factores</h4>
          <div className="factors-list">
            {stressFactors.slice(0, 2).map(factor => (
              <div key={factor.id} className="factor-item">
                <span className="factor-icon">{factor.icon}</span>
                <div className="factor-info">
                  <span className="factor-name">{factor.factor}</span>
                  <div className="factor-impact">
                    <span className="impact-level">Impacto: {factor.impact}/10</span>
                    <span className="impact-frequency">{factor.frequency}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="preview-quick-relief">
          <button 
            className="quick-relief-btn"
            onClick={() => startRelaxationSession(reliefTechniques[0])}
          >
            <span className="relief-icon">🫁</span>
            <span className="relief-text">Alivio rápido (5 min)</span>
          </button>
        </div>

        {stressAlerts.length > 0 && (
          <div className="preview-alert">
            <div className="alert-icon">⚠️</div>
            <div className="alert-info">
              <span className="alert-title">{stressAlerts[0].title}</span>
              <span className="alert-time">{stressAlerts[0].timestamp}</span>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="stress-manager-container">
      <div className="stress-header">
        <div className="header-content">
          <div className="title-section">
            <div className="title-icon">🧘</div>
            <div>
              <h1>Gestión del Estrés</h1>
              <p>Monitorea, comprende y gestiona tu estrés de manera inteligente</p>
            </div>
          </div>
          <div className="current-stress-display">
            <div className="stress-gauge">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke={getStressColor(stressData.current)}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(stressData.current / 10) * 282} 282`}
                  strokeDashoffset="0"
                  transform="rotate(-90 60 60)"
                />
                <text x="60" y="65" textAnchor="middle" className="gauge-text">
                  {stressData.current}
                </text>
              </svg>
            </div>
            <div className="stress-info">
              <div className="stress-category">
                <span className="category-emoji">{getStressCategory(stressData.current).emoji}</span>
                <span className="category-label" style={{ color: getStressColor(stressData.current) }}>
                  {getStressCategory(stressData.current).label}
                </span>
              </div>
              <p className="category-description">{getStressCategory(stressData.current).description}</p>
              <div className="trend-indicator">
                <span className="trend-icon">
                  {stressData.trend === 'up' ? '📈' : stressData.trend === 'down' ? '📉' : '📊'}
                </span>
                <span className="trend-text">Tendencia {stressData.trend}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="stress-navigation">
        <div className="nav-tabs">
          {[
            { id: 'monitor', label: 'Monitor', icon: '📊' },
            { id: 'factors', label: 'Factores', icon: '🎯' },
            { id: 'relief', label: 'Alivio', icon: '🧘' },
            { id: 'patterns', label: 'Patrones', icon: '📈' },
            { id: 'alerts', label: 'Alertas', icon: '🚨' }
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
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'monitor' && (
          <motion.div
            key="monitor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="monitor-content"
          >
            <div className="stress-overview">
              <div className="overview-cards">
                <div className="overview-card current">
                  <div className="card-icon">📊</div>
                  <div className="card-content">
                    <h3>Nivel Actual</h3>
                    <div className="card-value" style={{ color: getStressColor(stressData.current) }}>
                      {stressData.current}/10
                    </div>
                    <div className="card-status">{getStressCategory(stressData.current).label}</div>
                  </div>
                </div>

                <div className="overview-card average">
                  <div className="card-icon">⚖️</div>
                  <div className="card-content">
                    <h3>Promedio Semanal</h3>
                    <div className="card-value" style={{ color: getStressColor(stressData.average) }}>
                      {stressData.average}/10
                    </div>
                    <div className="card-change">
                      {stressData.current > stressData.average ? '+' : ''}
                      {(stressData.current - stressData.average).toFixed(1)} vs promedio
                    </div>
                  </div>
                </div>

                <div className="overview-card peak">
                  <div className="card-icon">⚠️</div>
                  <div className="card-content">
                    <h3>Pico Máximo</h3>
                    <div className="card-value" style={{ color: getStressColor(stressData.peak) }}>
                      {stressData.peak}/10
                    </div>
                    <div className="card-time">Miércoles 15:30</div>
                  </div>
                </div>

                <div className="overview-card lowest">
                  <div className="card-icon">😌</div>
                  <div className="card-content">
                    <h3>Punto Más Bajo</h3>
                    <div className="card-value" style={{ color: getStressColor(stressData.lowest) }}>
                      {stressData.lowest}/10
                    </div>
                    <div className="card-time">Sábado 09:15</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="recommendations-section">
              <h3>🎯 Recomendaciones Personalizadas</h3>
              <div className="recommendations-grid">
                {generateRecommendations().map((rec, index) => (
                  <div key={index} className={`recommendation-card ${rec.priority}`}>
                    <div className="rec-priority">
                      <span className={`priority-badge ${rec.priority}`}>
                        {rec.priority === 'urgent' ? '🚨 Urgente' : 
                         rec.priority === 'high' ? '🔥 Alta' : '📌 Media'}
                      </span>
                    </div>
                    <h4>{rec.title}</h4>
                    <p>{rec.action}</p>
                    <button 
                      className="rec-action-btn"
                      onClick={() => {
                        const technique = reliefTechniques.find(t => t.name === rec.technique);
                        if (technique) startRelaxationSession(technique);
                      }}
                    >
                      Iniciar {rec.technique}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'factors' && (
          <motion.div
            key="factors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="factors-content"
          >
            <div className="factors-header">
              <h3>🎯 Factores de Estrés</h3>
              <button className="add-factor-btn">
                <span>➕</span>
                Agregar Factor
              </button>
            </div>

            <div className="factors-analysis">
              <div className="factors-chart">
                <h4>Impacto por Factor</h4>
                <div className="chart-bars">
                  {stressFactors.map(factor => (
                    <div key={factor.id} className="factor-bar-container">
                      <div className="factor-info-bar">
                        <span className="factor-icon-chart">{factor.icon}</span>
                        <span className="factor-name-chart">{factor.factor}</span>
                        <span className="factor-impact-value">{factor.impact}/10</span>
                      </div>
                      <div className="factor-bar">
                        <div 
                          className="factor-bar-fill"
                          style={{ 
                            width: `${(factor.impact / 10) * 100}%`,
                            backgroundColor: getStressColor(factor.impact)
                          }}
                        ></div>
                      </div>
                      <div className="factor-frequency">{factor.frequency}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="factors-insights">
                <h4>💡 Insights de Factores</h4>
                <div className="insights-list">
                  <div className="insight-item high-impact">
                    <div className="insight-icon">🚨</div>
                    <div className="insight-content">
                      <h5>Factor Crítico</h5>
                      <p>Deadlines ajustados (9.2/10) es tu mayor fuente de estrés</p>
                      <span className="insight-suggestion">Considera negociar plazos más realistas</span>
                    </div>
                  </div>
                  <div className="insight-item pattern">
                    <div className="insight-icon">📊</div>
                    <div className="insight-content">
                      <h5>Patrón Identificado</h5>
                      <p>Carga de trabajo y cambios de prioridades están correlacionados</p>
                      <span className="insight-suggestion">Implementa mejor planificación semanal</span>
                    </div>
                  </div>
                  <div className="insight-item improvement">
                    <div className="insight-icon">📈</div>
                    <div className="insight-content">
                      <h5>Área de Mejora</h5>
                      <p>Comunicación con cliente (5.4/10) es manejable con técnicas</p>
                      <span className="insight-suggestion">Practica comunicación asertiva</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'relief' && (
          <motion.div
            key="relief"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relief-content"
          >
            {!isSessionActive ? (
              <>
                <div className="relief-header">
                  <h3>🧘 Técnicas de Alivio</h3>
                  <div className="relief-categories">
                    {['inmediato', 'corto', 'activo'].map(category => (
                      <button 
                        key={category}
                        className={`category-filter ${category}`}
                      >
                        {category === 'inmediato' ? '⚡ Inmediato' : 
                         category === 'corto' ? '⏰ Corto plazo' : '🏃 Activo'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="techniques-grid">
                  {reliefTechniques.map(technique => (
                    <div key={technique.id} className={`technique-card ${technique.category}`}>
                      <div className="technique-header">
                        <div className="technique-icon">{technique.icon}</div>
                        <div className="technique-info">
                          <h4>{technique.name}</h4>
                          <div className="technique-meta">
                            <span className="duration">{technique.duration}</span>
                            <span className="effectiveness">
                              ⭐ {technique.effectiveness}/10
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="technique-description">{technique.description}</p>
                      <div className="technique-steps">
                        <h5>Pasos:</h5>
                        <ul>
                          {technique.steps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ul>
                      </div>
                      <button 
                        className="start-technique-btn"
                        onClick={() => startRelaxationSession(technique)}
                      >
                        <span>▶️</span>
                        Iniciar Sesión
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="active-session">
                <div className="session-header">
                  <h3>{activeSession.icon} {activeSession.name}</h3>
                  <button className="stop-session-btn" onClick={stopSession}>
                    ❌ Detener
                  </button>
                </div>

                <div className="session-timer">
                  <div className="timer-display">{formatTime(sessionTimer)}</div>
                  <div className="timer-progress">
                    <div 
                      className="progress-bar"
                      style={{ 
                        width: `${(sessionTimer / (parseInt(activeSession.duration) * 60)) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="timer-target">
                    Objetivo: {activeSession.duration}
                  </div>
                </div>

                <div className="session-guide">
                  <h4>Guía paso a paso:</h4>
                  <div className="steps-list">
                    {activeSession.steps.map((step, index) => (
                      <div key={index} className="step-item">
                        <div className="step-number">{index + 1}</div>
                        <div className="step-text">{step}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="session-ambient">
                  <div className="breathing-animation">
                    <div className="breath-circle"></div>
                    <div className="breath-text">
                      {activeSession.name.includes('Respiración') ? 'Respira profundo...' : 'Relájate...'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'patterns' && (
          <motion.div
            key="patterns"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="patterns-content"
          >
            <div className="patterns-chart">
              <h3>📈 Patrones de Estrés Semanales</h3>
              <div className="weekly-chart">
                <div className="chart-grid">
                  {weeklyStress.map((day, index) => (
                    <div key={index} className="day-column">
                      <div className="day-label">{day.day}</div>
                      <div className="stress-periods">
                        <div className="period morning">
                          <div 
                            className="period-bar"
                            style={{ 
                              height: `${(day.morning / 10) * 100}%`,
                              backgroundColor: getStressColor(day.morning)
                            }}
                            title={`Mañana: ${day.morning}/10`}
                          ></div>
                          <span className="period-label">AM</span>
                        </div>
                        <div className="period afternoon">
                          <div 
                            className="period-bar"
                            style={{ 
                              height: `${(day.afternoon / 10) * 100}%`,
                              backgroundColor: getStressColor(day.afternoon)
                            }}
                            title={`Tarde: ${day.afternoon}/10`}
                          ></div>
                          <span className="period-label">PM</span>
                        </div>
                        <div className="period evening">
                          <div 
                            className="period-bar"
                            style={{ 
                              height: `${(day.evening / 10) * 100}%`,
                              backgroundColor: getStressColor(day.evening)
                            }}
                            title={`Noche: ${day.evening}/10`}
                          ></div>
                          <span className="period-label">Noche</span>
                        </div>
                      </div>
                      <div className="day-triggers">
                        {day.triggers.slice(0, 2).map((trigger, tIndex) => (
                          <div key={tIndex} className="trigger-tag">{trigger}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="patterns-analysis">
              <h3>🔍 Análisis de Patrones</h3>
              <div className="analysis-grid">
                <div className="pattern-insight">
                  <div className="insight-icon">📊</div>
                  <div className="insight-content">
                    <h4>Pico de la Semana</h4>
                    <p>Miércoles por la tarde (8.4/10) - Mayor nivel de estrés</p>
                    <div className="insight-recommendation">
                      <strong>Recomendación:</strong> Programa descansos extra los miércoles
                    </div>
                  </div>
                </div>

                <div className="pattern-insight">
                  <div className="insight-icon">🌅</div>
                  <div className="insight-content">
                    <h4>Mejor Momento</h4>
                    <p>Domingos por la mañana (1.8/10) - Mayor relajación</p>
                    <div className="insight-recommendation">
                      <strong>Estrategia:</strong> Replica rutina dominical en otros días
                    </div>
                  </div>
                </div>

                <div className="pattern-insight">
                  <div className="insight-icon">⏰</div>
                  <div className="insight-content">
                    <h4>Patrón Temporal</h4>
                    <p>Tardes 38% más estresantes que mañanas</p>
                    <div className="insight-recommendation">
                      <strong>Táctica:</strong> Tareas complejas por la mañana, simples por la tarde
                    </div>
                  </div>
                </div>

                <div className="pattern-insight">
                  <div className="insight-icon">📅</div>
                  <div className="insight-content">
                    <h4>Ciclo Semanal</h4>
                    <p>Reducción gradual viernes-domingo</p>
                    <div className="insight-recommendation">
                      <strong>Beneficio:</strong> Buena gestión del fin de semana laboral
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'alerts' && (
          <motion.div
            key="alerts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="alerts-content"
          >
            <div className="alerts-header">
              <h3>🚨 Alertas y Notificaciones</h3>
              <div className="alerts-settings">
                <button className="settings-btn">⚙️ Configurar</button>
              </div>
            </div>

            <div className="alerts-list">
              {stressAlerts.map(alert => (
                <div key={alert.id} className={`alert-card ${alert.type}`}>
                  <div className="alert-icon-container">
                    {alert.type === 'warning' && <span className="alert-emoji">⚠️</span>}
                    {alert.type === 'suggestion' && <span className="alert-emoji">💡</span>}
                    {alert.type === 'critical' && <span className="alert-emoji">🚨</span>}
                  </div>
                  <div className="alert-content">
                    <div className="alert-header">
                      <h4>{alert.title}</h4>
                      <span className="alert-timestamp">{alert.timestamp}</span>
                    </div>
                    <p className="alert-description">{alert.description}</p>
                    <div className="alert-action">
                      <span className="action-label">Acción sugerida:</span>
                      <span className="action-text">{alert.action}</span>
                    </div>
                  </div>
                  <div className="alert-actions">
                    <button className="action-btn primary">Aplicar</button>
                    <button className="action-btn secondary">Posponer</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="smart-alerts-section">
              <h3>🤖 Alertas Inteligentes</h3>
              <div className="smart-features">
                <div className="feature-card">
                  <div className="feature-icon">🧠</div>
                  <div className="feature-content">
                    <h4>Predicción de Estrés</h4>
                    <p>IA detecta patrones y predice momentos de alto estrés con 87% de precisión</p>
                    <div className="feature-status enabled">✓ Activado</div>
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">⏰</div>
                  <div className="feature-content">
                    <h4>Recordatorios Adaptativos</h4>
                    <p>Sugerencias de técnicas de alivio en momentos óptimos personalizados</p>
                    <div className="feature-status enabled">✓ Activado</div>
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">📊</div>
                  <div className="feature-content">
                    <h4>Análisis de Tendencias</h4>
                    <p>Evaluación automática de la efectividad de tus técnicas de manejo</p>
                    <div className="feature-status disabled">○ Desactivado</div>
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

export default StressManager;