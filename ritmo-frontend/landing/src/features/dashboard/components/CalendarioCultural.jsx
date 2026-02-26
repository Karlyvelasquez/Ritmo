import { useState, useEffect } from 'react'
import { Calendar, MapPin, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import './WidgetsShared.css'

export default function CalendarioCultural() {
    const [selectedEvent, setSelectedEvent] = useState(null)

    const eventosProximos = [
        {
            id: 1,
            fecha: '25 Feb',
            nombre: 'Carnaval de Canarias',
            tipo: 'Festivo Regional',
            descripcion: 'Gran celebración con disfraces, música y desfiles. Las islas Canarias celebran uno de los carnavales más famosos de España.',
            ubicacion: 'Canarias',
            importancia: 'regional',
            consejos: 'Si estás en Canarias, es una experiencia única. El ambiente es muy alegre y familiar.'
        },
        {
            id: 2,
            fecha: '8 Mar',
            nombre: 'Día Internacional de la Mujer',
            tipo: 'Día Nacional',
            descripcion: 'Se organizan manifestaciones y eventos por la igualdad. Es un día muy importante en España.',
            ubicacion: 'Todo el país',
            importancia: 'nacional',
            consejos: 'Muchas empresas dan el día libre o se unen a las actividades. Es normal ver manifestaciones pacíficas.'
        },
        {
            id: 3,
            fecha: '19 Mar',
            nombre: 'Día de San José / Fallas (Valencia)',
            tipo: 'Festivo Regional',
            descripcion: 'Las Fallas de Valencia son Patrimonio de la Humanidad. Se queman enormes figuras de papel maché.',
            ubicacion: 'Valencia',
            importancia: 'regional',
            consejos: 'Si visitas Valencia en estas fechas, reserva alojamiento con mucha antelación. ¡Es espectacular!'
        },
        {
            id: 4,
            fecha: '28-30 Mar',
            nombre: 'Semana Santa',
            tipo: 'Festivo Nacional',
            descripcion: 'Procesiones religiosas en toda España. Cada región tiene sus propias tradiciones.',
            ubicacion: 'Todo el país',
            importancia: 'nacional',
            consejos: 'Muchos comercios cierran. Las procesiones son impresionantes, especialmente en Andalucía.'
        },
        {
            id: 5,
            fecha: '23 Abr',
            nombre: 'Día de San Jorge / Día del Libro',
            tipo: 'Cultural',
            descripcion: 'Especialmente celebrado en Cataluña. Tradición de regalar rosas y libros.',
            ubicacion: 'Cataluña (principalmente)',
            importancia: 'regional',
            consejos: 'En Barcelona verás las Ramblas llenas de puestos de flores y libros. Es muy romántico.'
        },
        {
            id: 6,
            fecha: '1 May',
            nombre: 'Día del Trabajo',
            tipo: 'Festivo Nacional',
            descripcion: 'Día festivo nacional. Se organizan manifestaciones y eventos laborales.',
            ubicacion: 'Todo el país',
            importancia: 'nacional',
            consejos: 'Todo está cerrado excepto algunos restaurantes y servicios turísticos.'
        }
    ]

    const getImportanceColor = (importancia) => {
        switch (importancia) {
            case 'nacional': return '#EF4444'
            case 'regional': return '#F59E0B'
            case 'cultural': return '#8B5CF6'
            default: return '#6B7280'
        }
    }

    const getImportanceIcon = (importancia) => {
        switch (importancia) {
            case 'nacional': return '🇪🇸'
            case 'regional': return '🏛️'
            case 'cultural': return '🎭'
            default: return '📅'
        }
    }

    return (
        <motion.div
            className="widget-card calendario-cultural"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
        >
            <div className="widget-header">
                <div className="header-left">
                    <Calendar size={20} className="widget-icon" />
                    <h3>Calendario Cultural</h3>
                </div>
                <span className="events-count">{eventosProximos.length} próximos</span>
            </div>

            <div className="events-calendar">
                {eventosProximos.map((evento, index) => (
                    <motion.div
                        key={evento.id}
                        className={`event-item ${selectedEvent?.id === evento.id ? 'expanded' : ''}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setSelectedEvent(selectedEvent?.id === evento.id ? null : evento)}
                    >
                        <div className="event-summary">
                            <div className="event-date">
                                <span className="date-text">{evento.fecha}</span>
                            </div>

                            <div className="event-basic-info">
                                <div className="event-title">
                                    <span className="importance-emoji">
                                        {getImportanceIcon(evento.importancia)}
                                    </span>
                                    <h4>{evento.nombre}</h4>
                                </div>
                                <p className="event-type">{evento.tipo}</p>
                            </div>

                            <div className="event-location">
                                <MapPin size={14} />
                                <small>{evento.ubicacion}</small>
                            </div>
                        </div>

                        {selectedEvent?.id === evento.id && (
                            <motion.div
                                className="event-details"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <p className="event-description">{evento.descripcion}</p>

                                <div className="cultural-tip">
                                    <Star size={16} />
                                    <div>
                                        <strong>Tip cultural:</strong>
                                        <p>{evento.consejos}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="calendar-footer">
                <small>🗓️ Toca cualquier evento para conocer más detalles culturales</small>
            </div>
        </motion.div>
    )
}