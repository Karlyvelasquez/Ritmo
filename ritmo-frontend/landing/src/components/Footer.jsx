export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-brand-header">
              <img src="/image/2.png" alt="RITMO" />
              <span>RITMO</span>
            </div>
            <p>
              Una IA de acompañamiento humano. No te juzga. No te empuja.
              Solo está.
            </p>
          </div>

          <div className="footer-col">
            <h4>Producto</h4>
            <a href="#features">Características</a>
            <a href="#how-it-works">Cómo funciona</a>
            <a href="#profiles">Perfiles</a>
          </div>

          <div className="footer-col">
            <h4>Recursos</h4>
            <a href="#">Documentación</a>
            <a href="#">API</a>
            <a href="#">Telegram Bot</a>
          </div>

          <div className="footer-col">
            <h4>Legal</h4>
            <a href="#">Privacidad</a>
            <a href="#">Términos</a>
            <a href="#">Cookies</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 RITMO. Todos los derechos reservados.</p>
          <div className="footer-hackathon">
            Desarrollado en <span>OdiseIA4Good 2026</span> — Madrid
          </div>
        </div>
      </div>
    </footer>
  )
}
