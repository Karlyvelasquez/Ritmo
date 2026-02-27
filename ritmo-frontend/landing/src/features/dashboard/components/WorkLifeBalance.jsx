import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './WorkLifeBalance.css';

const WorkLifeBalance = ({ isPreview = false }) => {
  const [balanceData, setBalanceData] = useState({
    workHours: 8.5,
    personalHours: 7.5,
    restHours: 8,
    workSatisfaction: 4.2,
    personalSatisfaction: 3.8,
    stressLevel: 3.1,
    burnoutRisk: 2.3
  });

  const [weekData, setWeekData] = useState([
    { day: 'Lun', work: 9, personal: 6, rest: 9, stress: 3.5 },
    { day: 'Mar', work: 8.5, personal: 7, rest: 8.5, stress: 2.8 },
    { day: 'Mié', work: 10, personal: 5, rest: 9, stress: 4.2 },
    { day: 'Jue', work: 8, personal: 8, rest: 8, stress: 2.5 },
    { day: 'Vie', work: 7.5, personal: 8.5, rest: 8, stress: 2.0 },
    { day: 'Sáb', work: 2, personal: 12, rest: 10, stress: 1.5 },
    { day: 'Dom', work: 1, personal: 10, rest: 13, stress: 1.2 }
  ]);

  const [activeTab, setActiveTab] = useState('overview');
  const [recommendations, setRecommendations] = useState([]);
  const [balanceGoals, setBalanceGoals] = useState([
    { id: 1, title: 'Terminar trabajo a las 6 PM', completed: false, streak: 3 },
    { id: 2, title: '30 min ejercicio diario', completed: true, streak: 12 },
    { id: 3, title: 'Tiempo familiar sin dispositivos', completed: true, streak: 5 },
    { id: 4, title: 'Dormir antes de las 11 PM', completed: false, streak: 0 }
  ]);

  const [insights, setInsights] = useState([
    { 
      type: 'positive', 
      title: 'Mejora en ejercicio',
      description: 'Has mantenido una rutina constante durante 12 días consecutivos',
      icon: '💪'
    },
    { 
      type: 'warning', 
      title: 'Horas extras frecuentes',
      description: 'Esta semana trabajaste 3.5 horas extras promedio',
      icon: '⚠️'
    },
    { 
      type: 'tip', 
      title: 'Fin de semana equilibrado',
      description: 'Tu balance el fin de semana es ejemplar. Aplícalo entre semana',
      icon: '💡'
    }
  ]);

  const calculateBalanceScore = () => {
    const workBalance = Math.max(0, 5 - Math.abs(balanceData.workHours - 8));
    const restBalance = Math.max(0, 5 - Math.abs(balanceData.restHours - 8));
    const satisfactionAvg = (balanceData.workSatisfaction + balanceData.personalSatisfaction) / 2;
    const stressImpact = Math.max(0, 5 - balanceData.stressLevel);
    
    return ((workBalance + restBalance + satisfactionAvg + stressImpact) / 4).toFixed(1);
  };

  const getBalanceStatus = () => {
    const score = parseFloat(calculateBalanceScore());
    if (score >= 4.5) return { status: 'Excelente', color: '#10b981', emoji: '🎯' };
    if (score >= 3.5) return { status: 'Bueno', color: '#3b82f6', emoji: '📈' };
    if (score >= 2.5) return { status: 'Regular', color: '#f59e0b', emoji: '⚖️' };
    return { status: 'Necesita atención', color: '#ef4444', emoji: '🚨' };
  };

  const generateRecommendations = () => {
    const recs = [];
    
    if (balanceData.workHours > 9) {
      recs.push({
        title: 'Optimiza tu tiempo de trabajo',
        action: 'Establece límites claros y delega tareas cuando sea posible',
        priority: 'high',
        icon: '⏰'
      });
    }
    
    if (balanceData.stressLevel > 3.5) {
      recs.push({
        title: 'Gestiona tu estrés',
        action: 'Incorpora técnicas de relajación y pausas regulares',
        priority: 'high',
        icon: '🧘'
      });
    }
    
    if (balanceData.personalSatisfaction < 3.5) {
      recs.push({
        title: 'Enriquece tu tiempo personal',
        action: 'Dedica tiempo a hobbies y actividades que realmente disfrutes',
        priority: 'medium',
        icon: '🎨'
      });
    }
    
    if (balanceData.restHours < 7) {
      recs.push({
        title: 'Prioriza tu descanso',
        action: 'Establece una rutina de sueño consistente de al menos 8 horas',
        priority: 'high',
        icon: '😴'
      });
    }

    setRecommendations(recs);
  };

  useEffect(() => {
    generateRecommendations();
  }, [balanceData]);

  if (isPreview) {
    return (
      <motion.div 
        className="work-life-balance-preview"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="preview-header">
          <div className="header-info">
            <h3>Balance Vida-Trabajo</h3>
            <div className="balance-score">
              <span className="score-value">{calculateBalanceScore()}</span>
              <span className="score-label">/5.0</span>
            </div>
          </div>
          <div className="status-indicator">
            <span className="status-emoji">{getBalanceStatus().emoji}</span>
            <span className="status-text" style={{ color: getBalanceStatus().color }}>
              {getBalanceStatus().status}
            </span>
          </div>
        </div>

        <div className="preview-metrics">
          <div className="metric-item">
            <div className="metric-icon">💼</div>
            <div className="metric-info">
              <span className="metric-label">Trabajo hoy</span>
              <span className="metric-value">{balanceData.workHours}h</span>
            </div>
          </div>
          <div className="metric-item">
            <div className="metric-icon">🏠</div>
            <div className="metric-info">
              <span className="metric-label">Tiempo Personal</span>
              <span className="metric-value">{balanceData.personalHours}h</span>
            </div>
          </div>
          <div className="metric-item">
            <div className="metric-icon">😴</div>
            <div className="metric-info">
              <span className="metric-label">Descanso</span>
              <span className="metric-value">{balanceData.restHours}h</span>
            </div>
          </div>
        </div>

        <div className="preview-goals">
          <h4>Objetivos de balance</h4>
          <div className="goals-progress">
            {balanceGoals.slice(0, 2).map(goal => (
              <div key={goal.id} className="goal-item">
                <div className={`goal-check ${goal.completed ? 'completed' : ''}`}>
                  {goal.completed && <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>}
                </div>
                <span className={`goal-text ${goal.completed ? 'completed' : ''}`}>
                  {goal.title}
                </span>
                {goal.streak > 0 && (
                  <span className="goal-streak">🔥 {goal.streak}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="preview-recommendation">
            <div className="rec-icon">{recommendations[0].icon}</div>
            <div className="rec-info">
              <span className="rec-title">{recommendations[0].title}</span>
              <span className="rec-action">{recommendations[0].action}</span>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="work-life-balance-container">
      <div className="balance-header">
        <div className="header-content">
          <div className="title-section">
            <div className="title-icon">⚖️</div>
            <div>
              <h1>Balance Vida-Trabajo</h1>
              <p>Encuentra el equilibrio perfecto para una vida plena y productiva</p>
            </div>
          </div>
          <div className="score-section">
            <div className="balance-score-large">
              <div className="score-circle">
                <span className="score-number">{calculateBalanceScore()}</span>
                <span className="score-max">/5.0</span>
              </div>
              <div className="score-status">
                <span className="status-emoji">{getBalanceStatus().emoji}</span>
                <span className="status-text" style={{ color: getBalanceStatus().color }}>
                  {getBalanceStatus().status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="balance-navigation">
        <div className="nav-tabs">
          {[
            { id: 'overview', label: 'Vista General', icon: '📊' },
            { id: 'weekly', label: 'Análisis Semanal', icon: '📅' },
            { id: 'goals', label: 'Objetivos', icon: '🎯' },
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
            <div className="metrics-grid">
              <div className="metric-card work">
                <div className="card-header">
                  <h3>💼 Trabajo</h3>
                  <span className="metric-hours">{balanceData.workHours}h</span>
                </div>
                <div className="satisfaction-bar">
                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${(balanceData.workSatisfaction / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="satisfaction-label">
                    Satisfacción: {balanceData.workSatisfaction}/5
                  </span>
                </div>
                <div className="metric-insights">
                  <span className={balanceData.workHours > 9 ? 'warning' : 'good'}>
                    {balanceData.workHours > 9 ? 'Por encima del ideal' : 'Dentro del rango ideal'}
                  </span>
                </div>
              </div>

              <div className="metric-card personal">
                <div className="card-header">
                  <h3>🏠 Personal</h3>
                  <span className="metric-hours">{balanceData.personalHours}h</span>
                </div>
                <div className="satisfaction-bar">
                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${(balanceData.personalSatisfaction / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="satisfaction-label">
                    Satisfacción: {balanceData.personalSatisfaction}/5
                  </span>
                </div>
                <div className="metric-insights">
                  <span className={balanceData.personalHours < 6 ? 'warning' : 'good'}>
                    {balanceData.personalHours < 6 ? 'Necesita más tiempo' : 'Tiempo adecuado'}
                  </span>
                </div>
              </div>

              <div className="metric-card rest">
                <div className="card-header">
                  <h3>😴 Descanso</h3>
                  <span className="metric-hours">{balanceData.restHours}h</span>
                </div>
                <div className="quality-indicator">
                  <div className="quality-dots">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i}
                        className={`quality-dot ${i < Math.floor(balanceData.restHours / 2) ? 'active' : ''}`}
                      ></div>
                    ))}
                  </div>
                  <span className="quality-label">Calidad del sueño</span>
                </div>
                <div className="metric-insights">
                  <span className={balanceData.restHours < 7 ? 'warning' : 'good'}>
                    {balanceData.restHours < 7 ? 'Insuficiente' : 'Saludable'}
                  </span>
                </div>
              </div>

              <div className="metric-card stress" style={{ gridColumn: 'span 3' }}>
                <div className="stress-header">
                  <h3>📊 Bienestar General</h3>
                  <div className="wellness-indicators">
                    <div className="indicator">
                      <span className="indicator-label">Estrés</span>
                      <div className="stress-level">
                        <div 
                          className="stress-bar" 
                          style={{ 
                            width: `${(balanceData.stressLevel / 5) * 100}%`,
                            backgroundColor: balanceData.stressLevel > 3.5 ? '#ef4444' : 
                                           balanceData.stressLevel > 2.5 ? '#f59e0b' : '#10b981'
                          }}
                        ></div>
                      </div>
                      <span className="stress-value">{balanceData.stressLevel}/5</span>
                    </div>
                    <div className="indicator">
                      <span className="indicator-label">Riesgo Burnout</span>
                      <div className="burnout-gauge">
                        <div 
                          className="gauge-fill" 
                          style={{ 
                            width: `${(balanceData.burnoutRisk / 5) * 100}%`,
                            backgroundColor: balanceData.burnoutRisk > 3.5 ? '#ef4444' : 
                                           balanceData.burnoutRisk > 2.5 ? '#f59e0b' : '#10b981'
                          }}
                        ></div>
                      </div>
                      <span className="burnout-value">{balanceData.burnoutRisk}/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {recommendations.length > 0 && (
              <div className="recommendations-section">
                <h3>🎯 Recomendaciones Personalizadas</h3>
                <div className="recommendations-grid">
                  {recommendations.map((rec, index) => (
                    <div key={index} className={`recommendation-card ${rec.priority}`}>
                      <div className="rec-icon">{rec.icon}</div>
                      <div className="rec-content">
                        <h4>{rec.title}</h4>
                        <p>{rec.action}</p>
                      </div>
                      <div className="rec-priority">
                        <span className={`priority-badge ${rec.priority}`}>
                          {rec.priority === 'high' ? 'Alta' : 
                           rec.priority === 'medium' ? 'Media' : 'Baja'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'weekly' && (
          <motion.div
            key="weekly"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="weekly-content"
          >
            <div className="weekly-chart">
              <h3>Distribución Semanal de Tiempo</h3>
              <div className="chart-container">
                <div className="chart-grid">
                  {weekData.map((day, index) => (
                    <div key={index} className="day-column">
                      <div className="day-label">{day.day}</div>
                      <div className="time-bars">
                        <div 
                          className="time-bar work" 
                          style={{ height: `${(day.work / 14) * 100}%` }}
                          title={`Trabajo: ${day.work}h`}
                        ></div>
                        <div 
                          className="time-bar personal" 
                          style={{ height: `${(day.personal / 14) * 100}%` }}
                          title={`Personal: ${day.personal}h`}
                        ></div>
                        <div 
                          className="time-bar rest" 
                          style={{ height: `${(day.rest / 14) * 100}%` }}
                          title={`Descanso: ${day.rest}h`}
                        ></div>
                      </div>
                      <div className="stress-indicator">
                        <div 
                          className="stress-dot" 
                          style={{ 
                            backgroundColor: day.stress > 3.5 ? '#ef4444' : 
                                           day.stress > 2.5 ? '#f59e0b' : '#10b981'
                          }}
                        ></div>
                        <span className="stress-number">{day.stress}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color work"></div>
                    <span>Trabajo</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color personal"></div>
                    <span>Personal</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color rest"></div>
                    <span>Descanso</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="weekly-insights">
              <h3>Análisis de Patrones</h3>
              <div className="insights-grid">
                <div className="insight-card">
                  <div className="insight-icon">📈</div>
                  <div className="insight-content">
                    <h4>Tendencia Trabajo</h4>
                    <p>Picos los miércoles. Considera redistribuir carga laboral.</p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">🔋</div>
                  <div className="insight-content">
                    <h4>Mejores Días</h4>
                    <p>Viernes y fin de semana muestran el mejor balance.</p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">⚠️</div>
                  <div className="insight-content">
                    <h4>Área de Mejora</h4>
                    <p>Miércoles presenta el mayor nivel de estrés (4.2/5).</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'goals' && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="goals-content"
          >
            <div className="goals-header">
              <h3>🎯 Objetivos de Balance</h3>
              <button className="add-goal-btn">
                <span>➕</span>
                Nuevo Objetivo
              </button>
            </div>

            <div className="goals-list">
              {balanceGoals.map(goal => (
                <div key={goal.id} className={`goal-item-full ${goal.completed ? 'completed' : ''}`}>
                  <div className="goal-check-large">
                    <input 
                      type="checkbox" 
                      checked={goal.completed}
                      onChange={() => {
                        setBalanceGoals(goals => 
                          goals.map(g => 
                            g.id === goal.id 
                              ? { ...g, completed: !g.completed, streak: !g.completed ? g.streak : 0 }
                              : g
                          )
                        );
                      }}
                    />
                    {goal.completed && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                  </div>
                  <div className="goal-info-full">
                    <h4>{goal.title}</h4>
                    {goal.streak > 0 && (
                      <div className="goal-streak-full">
                        <span className="streak-icon">🔥</span>
                        <span className="streak-text">{goal.streak} días consecutivos</span>
                      </div>
                    )}
                    <div className="goal-progress-visual">
                      <div className="progress-dots">
                        {[...Array(7)].map((_, i) => (
                          <div 
                            key={i}
                            className={`progress-dot ${i < goal.streak ? 'active' : ''}`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="goal-actions-full">
                    <button className="edit-goal">✏️</button>
                    <button className="delete-goal">🗑️</button>
                  </div>
                </div>
              ))}
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
              <h3>💡 Insights Personalizados</h3>
              <span className="insights-date">Análisis de esta semana</span>
            </div>

            <div className="insights-list">
              {insights.map((insight, index) => (
                <div key={index} className={`insight-card-full ${insight.type}`}>
                  <div className="insight-icon-large">{insight.icon}</div>
                  <div className="insight-content-full">
                    <h4>{insight.title}</h4>
                    <p>{insight.description}</p>
                  </div>
                  <div className="insight-type-badge">
                    <span className={`type-label ${insight.type}`}>
                      {insight.type === 'positive' ? 'Logro' :
                       insight.type === 'warning' ? 'Atención' : 'Consejo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="ai-coach-section">
              <div className="coach-header">
                <h3>🤖 Tu Coach de Balance IA</h3>
              </div>
              <div className="coach-message">
                <div className="coach-avatar">🎯</div>
                <div className="coach-text">
                  <p>
                    <strong>Análisis de esta semana:</strong> Has mostrado una mejora significativa 
                    en mantener tiempo personal de calidad. Sin embargo, he notado que los miércoles 
                    tienden a ser más estresantes. 
                  </p>
                  <p>
                    <strong>Mi recomendación:</strong> Prueba programar reuniones menos intensas 
                    los miércoles y reserva tareas creativas para este día. Esto podría reducir 
                    tu nivel de estrés en un 20%.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkLifeBalance;