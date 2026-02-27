import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TimeBlocker.css';

const TimeBlocker = ({ isPreview = false }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [timeBlocks, setTimeBlocks] = useState([
    {
      id: 1,
      title: 'Deep Work - Proyecto Alpha',
      startTime: '09:00',
      endTime: '11:30',
      category: 'focus',
      priority: 'high',
      completed: true,
      color: '#3b82f6'
    },
    {
      id: 2,
      title: 'Reunión equipo desarrollo',
      startTime: '11:30',
      endTime: '12:30',
      category: 'meeting',
      priority: 'medium',
      completed: true,
      color: '#f59e0b'
    },
    {
      id: 3,
      title: 'Almuerzo y descanso',
      startTime: '12:30',
      endTime: '13:30',
      category: 'break',
      priority: 'low',
      completed: true,
      color: '#10b981'
    },
    {
      id: 4,
      title: 'Revisión documentos cliente',
      startTime: '13:30',
      endTime: '15:00',
      category: 'admin',
      priority: 'medium',
      completed: false,
      color: '#8b5cf6'
    },
    {
      id: 5,
      title: 'Focus Time - Programación',
      startTime: '15:00',
      endTime: '17:00',
      category: 'focus',
      priority: 'high',
      completed: false,
      color: '#3b82f6'
    },
    {
      id: 6,
      title: 'Emails y seguimientos',
      startTime: '17:00',
      endTime: '17:30',
      category: 'admin',
      priority: 'low',
      completed: false,
      color: '#64748b'
    }
  ]);

  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Día Productivo',
      description: 'Optimizado para máxima concentración y resultados',
      blocks: [
        { title: 'Planificación diaria', startTime: '08:30', endTime: '09:00', category: 'planning' },
        { title: 'Deep Work - Prioridad #1', startTime: '09:00', endTime: '11:00', category: 'focus' },
        { title: 'Break energizante', startTime: '11:00', endTime: '11:15', category: 'break' },
        { title: 'Tareas administrativas', startTime: '11:15', endTime: '12:30', category: 'admin' },
        { title: 'Almuerzo mindful', startTime: '12:30', endTime: '13:30', category: 'break' },
        { title: 'Deep Work - Prioridad #2', startTime: '13:30', endTime: '15:30', category: 'focus' },
        { title: 'Comunicaciones', startTime: '15:30', endTime: '16:30', category: 'communication' },
        { title: 'Revisión y cierre', startTime: '16:30', endTime: '17:00', category: 'planning' }
      ]
    },
    {
      id: 2,
      name: 'Día de Reuniones',
      description: 'Estructura para días con muchas reuniones',
      blocks: [
        { title: 'Prep del día', startTime: '08:30', endTime: '09:00', category: 'planning' },
        { title: 'Reunión matutina', startTime: '09:00', endTime: '10:00', category: 'meeting' },
        { title: 'Follow-up tareas', startTime: '10:00', endTime: '10:30', category: 'admin' },
        { title: 'Reunión proyecto', startTime: '10:30', endTime: '12:00', category: 'meeting' },
        { title: 'Almuerzo rápido', startTime: '12:00', endTime: '13:00', category: 'break' },
        { title: 'Reunión cliente', startTime: '13:00', endTime: '14:30', category: 'meeting' },
        { title: 'Tiempo protegido', startTime: '14:30', endTime: '16:00', category: 'focus' },
        { title: 'Cierre y planificación', startTime: '16:00', endTime: '17:00', category: 'planning' }
      ]
    }
  ]);

  const [activeTab, setActiveTab] = useState('today');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [draggedBlock, setDraggedBlock] = useState(null);

  const [analytics, setAnalytics] = useState({
    focusTime: 4.5,
    meetingTime: 2.5,
    adminTime: 1.5,
    breakTime: 1.0,
    efficiency: 87,
    completionRate: 78
  });

  const [focusSession, setFocusSession] = useState({
    isActive: false,
    currentBlock: null,
    timeRemaining: 0,
    isPaused: false
  });

  const categories = {
    focus: { label: 'Concentración', icon: '🎯', color: '#3b82f6' },
    meeting: { label: 'Reuniones', icon: '👥', color: '#f59e0b' },
    admin: { label: 'Administrativo', icon: '📋', color: '#8b5cf6' },
    break: { label: 'Descanso', icon: '☕', color: '#10b981' },
    planning: { label: 'Planificación', icon: '📅', color: '#ef4444' },
    communication: { label: 'Comunicación', icon: '💬', color: '#64748b' }
  };

  const getCurrentBlock = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    return timeBlocks.find(block => {
      const [startHour, startMin] = block.startTime.split(':').map(Number);
      const [endHour, endMin] = block.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      return currentTime >= startMinutes && currentTime < endMinutes;
    });
  };

  const getNextBlock = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    return timeBlocks.find(block => {
      const [startHour, startMin] = block.startTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      
      return currentTime < startMinutes;
    });
  };

  const formatTimeRemaining = (block) => {
    if (!block) return '';
    
    const now = new Date();
    const [endHour, endMin] = block.endTime.split(':').map(Number);
    const endTime = new Date();
    endTime.setHours(endHour, endMin);
    
    const diff = endTime - now;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes <= 0) return 'Finalizado';
    if (minutes < 60) return `${minutes} min restantes`;
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m restantes`;
  };

  const startFocusSession = (block) => {
    const [endHour, endMin] = block.endTime.split(':').map(Number);
    const endTime = new Date();
    endTime.setHours(endHour, endMin);
    
    const now = new Date();
    const timeRemaining = Math.floor((endTime - now) / 60000);
    
    setFocusSession({
      isActive: true,
      currentBlock: block,
      timeRemaining: timeRemaining,
      isPaused: false
    });
  };

  const toggleBlockCompletion = (blockId) => {
    setTimeBlocks(blocks => 
      blocks.map(block => 
        block.id === blockId 
          ? { ...block, completed: !block.completed }
          : block
      )
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      if (focusSession.isActive && !focusSession.isPaused) {
        setFocusSession(prev => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1)
        }));
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [focusSession.isActive, focusSession.isPaused]);

  if (isPreview) {
    const currentBlock = getCurrentBlock();
    const nextBlock = getNextBlock();

    return (
      <motion.div 
        className="time-blocker-preview"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="preview-header">
          <div className="header-info">
            <h3>Time Blocking</h3>
            <div className="time-display">
              {currentTime.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
          <div className="efficiency-badge">
            <span className="efficiency-icon">⚡</span>
            <span className="efficiency-value">{analytics.efficiency}%</span>
          </div>
        </div>

        {currentBlock ? (
          <div className="current-block-preview">
            <div className="block-status">
              <div 
                className="status-indicator"
                style={{ backgroundColor: currentBlock.color }}
              ></div>
              <span className="status-text">Ahora</span>
            </div>
            <div className="block-info">
              <h4>{currentBlock.title}</h4>
              <div className="block-meta">
                <span className="block-time">
                  {currentBlock.startTime} - {currentBlock.endTime}
                </span>
                <span className="time-remaining">
                  {formatTimeRemaining(currentBlock)}
                </span>
              </div>
            </div>
            {currentBlock.category === 'focus' && (
              <button 
                className="focus-btn"
                onClick={() => startFocusSession(currentBlock)}
              >
                🎯
              </button>
            )}
          </div>
        ) : (
          <div className="no-current-block">
            <div className="free-time-indicator">
              <span className="free-icon">🏃</span>
              <span className="free-text">Tiempo libre</span>
            </div>
          </div>
        )}

        <div className="preview-schedule">
          <h4>Próximos bloques</h4>
          <div className="upcoming-blocks">
            {timeBlocks.slice(0, 3).map(block => (
              <div key={block.id} className="upcoming-block">
                <div 
                  className="block-color"
                  style={{ backgroundColor: block.color }}
                ></div>
                <div className="block-details">
                  <span className="block-title">{block.title}</span>
                  <span className="block-time">{block.startTime}</span>
                </div>
                <div className={`completion-status ${block.completed ? 'completed' : 'pending'}`}>
                  {block.completed ? '✓' : '○'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="preview-stats">
          <div className="stat-item">
            <span className="stat-icon">🎯</span>
            <span className="stat-label">Focus</span>
            <span className="stat-value">{analytics.focusTime}h</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">✅</span>
            <span className="stat-label">Completado</span>
            <span className="stat-value">{analytics.completionRate}%</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="time-blocker-container">
      <div className="blocker-header">
        <div className="header-content">
          <div className="title-section">
            <div className="title-icon">⏰</div>
            <div>
              <h1>Time Blocking</h1>
              <p>Organiza tu tiempo en bloques enfocados para máxima productividad</p>
            </div>
          </div>
          <div className="current-time-section">
            <div className="time-display-large">
              {currentTime.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div className="date-display">
              {currentTime.toLocaleDateString('es-ES', { 
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </div>
            <div className="efficiency-display">
              <span className="efficiency-label">Eficiencia del día</span>
              <span className="efficiency-percentage">{analytics.efficiency}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="blocker-navigation">
        <div className="nav-tabs">
          {[
            { id: 'today', label: 'Hoy', icon: '📋' },
            { id: 'week', label: 'Semana', icon: '📅' },
            { id: 'templates', label: 'Plantillas', icon: '📄' },
            { id: 'analytics', label: 'Análisis', icon: '📊' }
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
        <div className="quick-actions">
          <button 
            className="add-block-btn"
            onClick={() => setShowBlockModal(true)}
          >
            <span>➕</span>
            Nuevo Bloque
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'today' && (
          <motion.div
            key="today"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="today-content"
          >
            {focusSession.isActive && (
              <div className="focus-session-bar">
                <div className="session-info">
                  <span className="session-icon">🎯</span>
                  <span className="session-title">{focusSession.currentBlock?.title}</span>
                  <span className="session-time">
                    {Math.floor(focusSession.timeRemaining / 60)}:
                    {(focusSession.timeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="session-controls">
                  <button 
                    className="pause-btn"
                    onClick={() => setFocusSession(prev => ({ 
                      ...prev, 
                      isPaused: !prev.isPaused 
                    }))}
                  >
                    {focusSession.isPaused ? '▶️' : '⏸️'}
                  </button>
                  <button 
                    className="stop-btn"
                    onClick={() => setFocusSession({ 
                      isActive: false, 
                      currentBlock: null, 
                      timeRemaining: 0, 
                      isPaused: false 
                    })}
                  >
                    ⏹️
                  </button>
                </div>
              </div>
            )}

            <div className="timeline-container">
              <div className="timeline-header">
                <h3>📋 Programación de Hoy</h3>
                <div className="timeline-stats">
                  <span className="blocks-total">{timeBlocks.length} bloques</span>
                  <span className="blocks-completed">
                    {timeBlocks.filter(b => b.completed).length} completados
                  </span>
                </div>
              </div>

              <div className="timeline-grid">
                <div className="time-scale">
                  {Array.from({ length: 10 }, (_, i) => {
                    const hour = 8 + i;
                    return (
                      <div key={hour} className="hour-mark">
                        {hour.toString().padStart(2, '0')}:00
                      </div>
                    );
                  })}
                </div>

                <div className="blocks-timeline">
                  {timeBlocks.map((block, index) => {
                    const [startHour, startMin] = block.startTime.split(':').map(Number);
                    const [endHour, endMin] = block.endTime.split(':').map(Number);
                    const startMinutes = (startHour - 8) * 60 + startMin;
                    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                    
                    const top = (startMinutes / 60) * 80; // 80px por hora
                    const height = (duration / 60) * 80;

                    return (
                      <div
                        key={block.id}
                        className={`timeline-block ${block.completed ? 'completed' : ''}`}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          backgroundColor: block.color,
                          borderLeft: `4px solid ${block.color}`,
                          filter: block.completed ? 'grayscale(0.3)' : 'none'
                        }}
                      >
                        <div className="block-header">
                          <div className="block-category">
                            <span className="category-icon">
                              {categories[block.category]?.icon}
                            </span>
                            <span className="category-label">
                              {categories[block.category]?.label}
                            </span>
                          </div>
                          <div className="block-actions">
                            {block.category === 'focus' && !block.completed && (
                              <button 
                                className="focus-start-btn"
                                onClick={() => startFocusSession(block)}
                                title="Iniciar sesión de concentración"
                              >
                                🎯
                              </button>
                            )}
                            <button 
                              className="complete-btn"
                              onClick={() => toggleBlockCompletion(block.id)}
                              title={block.completed ? 'Marcar como pendiente' : 'Marcar como completado'}
                            >
                              {block.completed ? '✅' : '⭕'}
                            </button>
                          </div>
                        </div>
                        <div className="block-content">
                          <h4 className="block-title">{block.title}</h4>
                          <div className="block-time">
                            {block.startTime} - {block.endTime}
                          </div>
                          {getCurrentBlock()?.id === block.id && (
                            <div className="current-indicator">
                              <span className="pulse-dot"></span>
                              <span className="current-text">En progreso</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="day-summary">
              <h3>📊 Resumen del Día</h3>
              <div className="summary-cards">
                <div className="summary-card focus">
                  <div className="card-icon">🎯</div>
                  <div className="card-content">
                    <h4>Tiempo de Concentración</h4>
                    <div className="card-value">{analytics.focusTime}h</div>
                    <div className="card-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${(analytics.focusTime / 8) * 100}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{Math.round((analytics.focusTime / 8) * 100)}% del día</span>
                    </div>
                  </div>
                </div>

                <div className="summary-card meetings">
                  <div className="card-icon">👥</div>
                  <div className="card-content">
                    <h4>Reuniones</h4>
                    <div className="card-value">{analytics.meetingTime}h</div>
                    <div className="card-detail">
                      {timeBlocks.filter(b => b.category === 'meeting').length} reuniones programadas
                    </div>
                  </div>
                </div>

                <div className="summary-card completion">
                  <div className="card-icon">✅</div>
                  <div className="card-content">
                    <h4>Tasa de Completación</h4>
                    <div className="card-value">{analytics.completionRate}%</div>
                    <div className="card-detail">
                      {timeBlocks.filter(b => b.completed).length} de {timeBlocks.length} bloques
                    </div>
                  </div>
                </div>

                <div className="summary-card efficiency">
                  <div className="card-icon">⚡</div>
                  <div className="card-content">
                    <h4>Eficiencia</h4>
                    <div className="card-value">{analytics.efficiency}%</div>
                    <div className={`trend ${analytics.efficiency > 80 ? 'positive' : 'neutral'}`}>
                      {analytics.efficiency > 80 ? '📈 Excelente' : '📊 Bueno'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="templates-content"
          >
            <div className="templates-header">
              <h3>📄 Plantillas de Time Blocking</h3>
              <button className="create-template-btn">
                <span>➕</span>
                Crear Plantilla
              </button>
            </div>

            <div className="templates-grid">
              {templates.map(template => (
                <div key={template.id} className="template-card">
                  <div className="template-header">
                    <h4>{template.name}</h4>
                    <div className="template-actions">
                      <button className="apply-template-btn">
                        <span>📋</span>
                        Aplicar
                      </button>
                    </div>
                  </div>
                  <p className="template-description">{template.description}</p>
                  
                  <div className="template-preview">
                    <h5>Vista previa:</h5>
                    <div className="blocks-preview">
                      {template.blocks.map((block, index) => (
                        <div key={index} className="preview-block">
                          <div 
                            className="preview-color"
                            style={{ backgroundColor: categories[block.category]?.color }}
                          ></div>
                          <div className="preview-info">
                            <span className="preview-time">{block.startTime}</span>
                            <span className="preview-title">{block.title}</span>
                          </div>
                          <span className="preview-category">
                            {categories[block.category]?.icon}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="template-stats">
                    <div className="stat-item">
                      <span className="stat-label">Bloques:</span>
                      <span className="stat-value">{template.blocks.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Duración:</span>
                      <span className="stat-value">8.5h</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Focus:</span>
                      <span className="stat-value">
                        {template.blocks.filter(b => b.category === 'focus').length}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="template-tips">
              <h3>💡 Consejos para Plantillas Efectivas</h3>
              <div className="tips-grid">
                <div className="tip-card">
                  <div className="tip-icon">🎯</div>
                  <div className="tip-content">
                    <h4>Bloques de Concentración</h4>
                    <p>Dedica 2-4 horas diarias a trabajo profundo sin interrupciones</p>
                  </div>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">⚡</div>
                  <div className="tip-content">
                    <h4>Energía Natural</h4>
                    <p>Programa tareas difíciles cuando tu energía esté en su pico</p>
                  </div>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">🔄</div>
                  <div className="tip-content">
                    <h4>Descansos Regulares</h4>
                    <p>Incluye pausas de 15-30 minutos cada 90-120 minutos</p>
                  </div>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">🛡️</div>
                  <div className="tip-content">
                    <h4>Tiempo Protegido</h4>
                    <p>Bloquea tiempo para imprevistos y trabajo administrativo</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="analytics-content"
          >
            <div className="analytics-overview">
              <h3>📊 Análisis de Productividad</h3>
              <div className="overview-metrics">
                <div className="metric-card large">
                  <div className="metric-header">
                    <h4>Distribución del Tiempo</h4>
                    <span className="metric-period">Esta semana</span>
                  </div>
                  <div className="time-distribution">
                    <div className="distribution-chart">
                      {Object.entries(categories).map(([key, cat]) => {
                        const percentage = key === 'focus' ? 45 : 
                                         key === 'meeting' ? 25 : 
                                         key === 'admin' ? 15 : 
                                         key === 'break' ? 10 : 5;
                        return (
                          <div key={key} className="chart-segment">
                            <div 
                              className="segment-bar"
                              style={{ 
                                width: `${percentage}%`, 
                                backgroundColor: cat.color 
                              }}
                            ></div>
                            <div className="segment-label">
                              <span className="segment-icon">{cat.icon}</span>
                              <span className="segment-name">{cat.label}</span>
                              <span className="segment-percentage">{percentage}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">🎯</div>
                  <div className="metric-content">
                    <h4>Tiempo de Concentración</h4>
                    <div className="metric-value">4.2h</div>
                    <div className="metric-change positive">+12% vs semana anterior</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">⚡</div>
                  <div className="metric-content">
                    <h4>Eficiencia Promedio</h4>
                    <div className="metric-value">{analytics.efficiency}%</div>
                    <div className="metric-change positive">+5% vs semana anterior</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">✅</div>
                  <div className="metric-content">
                    <h4>Completación</h4>
                    <div className="metric-value">{analytics.completionRate}%</div>
                    <div className="metric-change neutral">Estable</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="productivity-insights">
              <h3>🔍 Insights de Productividad</h3>
              <div className="insights-grid">
                <div className="insight-card peak-performance">
                  <div className="insight-header">
                    <div className="insight-icon">🌟</div>
                    <h4>Pico de Rendimiento</h4>
                  </div>
                  <div className="insight-content">
                    <p><strong>Mejor momento:</strong> Martes 9:00-11:00 AM</p>
                    <p>Eficiencia promedio: 94%</p>
                    <div className="insight-recommendation">
                      <strong>Recomendación:</strong> Programa tareas más importantes en este horario
                    </div>
                  </div>
                </div>

                <div className="insight-card interruptions">
                  <div className="insight-header">
                    <div className="insight-icon">🚫</div>
                    <h4>Interrupciones</h4>
                  </div>
                  <div className="insight-content">
                    <p><strong>Promedio diario:</strong> 8 interrupciones</p>
                    <p>Tiempo perdido: 45 minutos</p>
                    <div className="insight-recommendation">
                      <strong>Sugerencia:</strong> Usa modo no molestar durante bloques de concentración
                    </div>
                  </div>
                </div>

                <div className="insight-card patterns">
                  <div className="insight-header">
                    <div className="insight-icon">📈</div>
                    <h4>Patrones Identificados</h4>
                  </div>
                  <div className="insight-content">
                    <p><strong>Tendencia:</strong> Productividad decrece 20% después del almuerzo</p>
                    <div className="insight-recommendation">
                      <strong>Táctica:</strong> Programa tareas ligeras entre 13:00-15:00
                    </div>
                  </div>
                </div>

                <div className="insight-card optimization">
                  <div className="insight-header">
                    <div className="insight-icon">⚡</div>
                    <h4>Oportunidades</h4>
                  </div>
                  <div className="insight-content">
                    <p><strong>Potencial mejora:</strong> +25% productividad</p>
                    <p>Reduciendo reuniones de 30 a 25 min</p>
                    <div className="insight-recommendation">
                      <strong>Acción:</strong> Implementar reuniones más eficientes
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="weekly-comparison">
              <h3>📅 Comparación Semanal</h3>
              <div className="comparison-chart">
                <div className="chart-header">
                  <div className="chart-legend">
                    <div className="legend-item">
                      <div className="legend-color current"></div>
                      <span>Esta semana</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color previous"></div>
                      <span>Semana anterior</span>
                    </div>
                  </div>
                </div>
                <div className="comparison-bars">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie'].map((day, index) => {
                    const currentWeek = [85, 92, 78, 88, 95][index];
                    const previousWeek = [80, 85, 82, 79, 90][index];
                    
                    return (
                      <div key={day} className="day-comparison">
                        <div className="day-label">{day}</div>
                        <div className="bars-container">
                          <div className="efficiency-bars">
                            <div 
                              className="bar current"
                              style={{ height: `${currentWeek}%` }}
                              title={`${currentWeek}% eficiencia`}
                            ></div>
                            <div 
                              className="bar previous"
                              style={{ height: `${previousWeek}%` }}
                              title={`${previousWeek}% semana anterior`}
                            ></div>
                          </div>
                          <div className="day-values">
                            <span className="current-value">{currentWeek}%</span>
                            <span className="previous-value">{previousWeek}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimeBlocker;