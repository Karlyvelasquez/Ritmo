// Servicio para manejo de hábitos conectado con el backend
const API_BASE = 'http://localhost:8000';

export class HabitsService {
  constructor() {
    this.baseURL = API_BASE;
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutos
  }

  // Obtener perfil del usuario para hábitos personalizados
  getUserProfile() {
    const userData = localStorage.getItem('ritmo_user');
    if (userData) {
      const user = JSON.parse(userData);
      return {
        profileType: user.perfil || 'joven',
        age: user.edad || 25,
        preferences: user.preferencias || []
      };
    }
    return { profileType: 'joven', age: 25, preferences: [] };
  }

  // Generar hábitos basados en el backend habitos.py
  async generateHabitsRecommendations() {
    try {
      const userProfile = this.getUserProfile();
      
      const response = await fetch(`${this.baseURL}/agents/habitos/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_type: userProfile.profileType,
          time_of_day: this.getCurrentTimeOfDay(),
          user_preferences: userProfile.preferences
        })
      });

      if (!response.ok) {
        throw new Error('Error fetching habits recommendations');
      }

      const habits = await response.json();
      return this.transformBackendHabits(habits);
    } catch (error) {
      console.warn('Error fetching backend habits, using local data:', error);
      return this.getLocalHabitsData();
    }
  }

  // Obtener momento del día actual
  getCurrentTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'mañana';
    if (hour >= 12 && hour < 18) return 'tarde';
    return 'noche';
  }

  // Transformar datos del backend al formato del componente
  transformBackendHabits(backendData) {
    const categories = {
      'bienestar': {
        id: 'wellness',
        name: 'Wellness',
        color: '#8AAF8B',
        habits: []
      },
      'productividad': {
        id: 'productivity', 
        name: 'Productivity',
        color: '#5B9BD5',
        habits: []
      },
      'social': {
        id: 'social',
        name: 'Social', 
        color: '#E67E22',
        habits: []
      }
    };

    // Procesar hábitos del backend
    if (backendData.habits) {
      backendData.habits.forEach((habit, index) => {
        const category = this.categorizeHabit(habit.description);
        const transformedHabit = {
          id: index + 1,
          name: habit.description,
          completed: false,
          streak: Math.floor(Math.random() * 15), // Temporal hasta tener datos reales
          points: habit.priority * 10 + 10,
          difficulty: this.getDifficultyFromPriority(habit.priority),
          timeOfDay: habit.time || this.getCurrentTimeOfDay(),
          estimatedTime: this.estimateTime(habit.description)
        };
        
        if (categories[category]) {
          categories[category].habits.push(transformedHabit);
        }
      });
    }

    // Filtrar categorías vacías y agregar datos por defecto si es necesario
    const validCategories = Object.values(categories).filter(cat => cat.habits.length > 0);
    
    if (validCategories.length === 0) {
      return this.getLocalHabitsData();
    }

    return {
      totalPoints: this.calculateTotalPoints(),
      level: this.calculateLevel(),
      nextLevelPoints: 1000,
      currentStreak: this.getCurrentStreak(),
      bestStreak: this.getBestStreak(),
      categories: validCategories
    };
  }

  // Categorizar hábito basado en palabras clave
  categorizeHabit(description) {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('meditar') || lowerDesc.includes('ejercicio') || 
        lowerDesc.includes('agua') || lowerDesc.includes('dormir') ||
        lowerDesc.includes('salud') || lowerDesc.includes('descanso')) {
      return 'bienestar';
    }
    
    if (lowerDesc.includes('estudiar') || lowerDesc.includes('leer') || 
        lowerDesc.includes('trabajo') || lowerDesc.includes('aprender') ||
        lowerDesc.includes('planear') || lowerDesc.includes('organizar')) {
      return 'productividad';
    }
    
    if (lowerDesc.includes('familia') || lowerDesc.includes('amigos') || 
        lowerDesc.includes('social') || lowerDesc.includes('llamar') ||
        lowerDesc.includes('compartir') || lowerDesc.includes('conectar')) {
      return 'social';
    }
    
    return 'bienestar'; // Por defecto
  }

  // Determinar dificultad basada en prioridad
  getDifficultyFromPriority(priority) {
    if (priority <= 3) return 'easy';
    if (priority <= 7) return 'medium';
    return 'hard';
  }

  // Estimar tiempo basado en descripción
  estimateTime(description) {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('meditar')) return '10-15 min';
    if (lowerDesc.includes('ejercicio')) return '30-45 min';
    if (lowerDesc.includes('estudiar')) return '1-2 horas';
    if (lowerDesc.includes('leer')) return '30-45 min';
    if (lowerDesc.includes('agua')) return 'Todo el día';
    if (lowerDesc.includes('llamar')) return '15-20 min';
    
    return '20-30 min'; // Por defecto
  }

  // Datos locales como fallback
  getLocalHabitsData() {
    return {
      totalPoints: 850,
      level: 12,
      nextLevelPoints: 1000,
      currentStreak: 7,
      bestStreak: 21,
      categories: [
        {
          id: 'wellness',
          name: 'Wellness',
          color: '#8AAF8B',
          habits: [
            { 
              id: 1, 
              name: 'Meditar 10 minutos', 
              completed: false, 
              streak: 14, 
              points: 25,
              difficulty: 'easy',
              timeOfDay: 'morning',
              estimatedTime: '10 min'
            },
            { 
              id: 2, 
              name: 'Ejercicio cardiovascular', 
              completed: false, 
              streak: 3, 
              points: 40,
              difficulty: 'medium',
              timeOfDay: 'afternoon',
              estimatedTime: '30 min'
            },
            { 
              id: 3, 
              name: '8 vasos de agua', 
              completed: false, 
              streak: 9, 
              points: 20,
              difficulty: 'easy',
              timeOfDay: 'all-day',
              estimatedTime: 'Todo el día'
            }
          ]
        },
        {
          id: 'productivity',
          name: 'Productivity',
          color: '#5B9BD5',
          habits: [
            { 
              id: 4, 
              name: 'Estudiar 2 horas', 
              completed: false, 
              streak: 5, 
              points: 50,
              difficulty: 'hard',
              timeOfDay: 'morning',
              estimatedTime: '2 horas'
            },
            { 
              id: 5, 
              name: 'Leer 30 páginas', 
              completed: false, 
              streak: 0, 
              points: 30,
              difficulty: 'medium',
              timeOfDay: 'evening',
              estimatedTime: '45 min'
            }
          ]
        }
      ]
    };
  }

  // Guardar estado de hábitos
  async saveHabitState(habitId, completed, categoryId) {
    try {
      const key = `habits_${new Date().toDateString()}`;
      const todayHabits = JSON.parse(localStorage.getItem(key) || '{}');
      
      todayHabits[habitId] = {
        completed,
        timestamp: new Date().toISOString(),
        categoryId
      };
      
      localStorage.setItem(key, JSON.stringify(todayHabits));
      
      // Intentar enviar al backend
      await fetch(`${this.baseURL}/habits/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          habit_id: habitId,
          completed,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.warn('Error saving habit state to backend:', error);
      // Los datos locales ya se guardaron, así que no es crítico
    }
  }

  // Cargar estado de hábitos del día
  loadTodayHabitsState() {
    const key = `habits_${new Date().toDateString()}`;
    return JSON.parse(localStorage.getItem(key) || '{}');
  }

  // Calcular estadísticas
  calculateTotalPoints() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('habits_'));
    let points = 0;
    
    keys.forEach(key => {
      const dayHabits = JSON.parse(localStorage.getItem(key) || '{}');
      Object.values(dayHabits).forEach(habit => {
        if (habit.completed) points += 20; // Puntos base por hábito completado
      });
    });
    
    return points;
  }

  calculateLevel() {
    return Math.floor(this.calculateTotalPoints() / 100) + 1;
  }

  getCurrentStreak() {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = `habits_${date.toDateString()}`;
      const dayHabits = JSON.parse(localStorage.getItem(key) || '{}');
      
      const completedToday = Object.values(dayHabits).some(h => h.completed);
      if (completedToday) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  getBestStreak() {
    return parseInt(localStorage.getItem('best_streak') || '0');
  }

  updateBestStreak(currentStreak) {
    const bestStreak = this.getBestStreak();
    if (currentStreak > bestStreak) {
      localStorage.setItem('best_streak', currentStreak.toString());
    }
  }

  // Achievements system
  checkAchievements() {
    const achievements = [];
    const currentStreak = this.getCurrentStreak();
    const totalPoints = this.calculateTotalPoints();
    
    // Achievement: Primera semana
    if (currentStreak >= 7) {
      achievements.push({
        id: 'first_week',
        name: '7 días seguidos',
        icon: '🔥',
        unlocked: true,
        progress: 100
      });
    }
    
    // Achievement: Maestro de hábitos
    if (totalPoints >= 500) {
      achievements.push({
        id: 'habit_master',
        name: 'Maestro de Hábitos',
        icon: '👑',
        unlocked: totalPoints >= 1000,
        progress: Math.min(100, (totalPoints / 1000) * 100)
      });
    }
    
    return achievements;
  }
}

export default new HabitsService();