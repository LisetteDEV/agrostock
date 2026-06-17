import React from 'react';
import { MapPin, Phone, Mail, ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FacebookIcon = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.5 1.6-1.5h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.8v3.2h2.3V21h3.4Z" />
  </svg>
);

const TikTokIcon = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M15.8 3c.3 2 1.5 3.3 3.2 3.9v2.7c-1.4 0-2.6-.4-3.7-1.2v5.7c0 3.4-2.3 5.9-5.6 5.9-3.2 0-5.7-2.4-5.7-5.4 0-3.2 2.6-5.5 5.9-5.4v2.8c-1.6-.1-3 .9-3 2.6 0 1.5 1.2 2.6 2.7 2.6 1.7 0 2.7-1.3 2.7-3V3h3.5Z" />
  </svg>
);

const WhatsAppIcon = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20 12A8 8 0 0 1 8.3 19l-3.3.9.9-3.2A8 8 0 1 1 20 12Zm-8-6.4A6.4 6.4 0 0 0 6.4 16l.2.3-.5 1.9 2-.5.3.2A6.4 6.4 0 1 0 12 5.6Zm3.5 8.1c-.2-.1-1.3-.6-1.5-.7-.2-.1-.3-.1-.5.1l-.4.6c-.1.1-.2.2-.4.1-1.2-.6-2.1-1.5-2.8-2.7-.1-.2 0-.3.1-.4l.4-.5.1-.2c.1-.1.1-.3 0-.4l-.7-1.6c-.1-.2-.2-.2-.4-.2h-.3c-.2 0-.4.1-.5.3-.7.7-1 1.7-.8 2.7.3 1.5 1.2 2.8 2.4 4 1.4 1.3 3 2.2 4.7 2.4.9.1 1.8-.2 2.4-.8.2-.2.3-.5.4-.7.1-.2.1-.4 0-.4Z" />
  </svg>
);

const footerBg = '#0b120d';
const panelBg = '#111a13';
const muted = '#9aa79f';
const text = '#e8f1eb';
const green = '#1ab273';

const socialItems = [
  { name: 'Facebook', icon: <FacebookIcon />, link: 'https://www.facebook.com', external: true },
  { name: 'TikTok', icon: <TikTokIcon />, link: 'https://www.tiktok.com', external: true },
  { name: 'WhatsApp', icon: <WhatsAppIcon />, link: 'https://wa.me/22900000000', external: true },
];

const navItems = [
  { label: 'Accueil', url: '/' },
  { label: 'A propos', url: '/a-propos' },
  { label: 'Catalogue', url: '/catalogue' },
  { label: 'Transformateurs', url: '/transformateurs' },
  { label: 'Blog', url: '/blog' },
  { label: 'Contact', url: '/contact' },
];

const communityItems = [
  { label: 'Devenir transformateur', action: 'register' },
  { label: 'Publier vos produits', action: 'register' },
  { label: 'FAQ', url: '/#faq' },
  { label: 'Centre de contact', url: '/contact' },
  { label: 'Support WhatsApp', external: true, url: 'https://wa.me/22900000000' },
];

const contactItems = [
  { icon: <MapPin size={17} />, text: 'Cotonou, Benin | Avenue Pape Jean Paul II' },
  { icon: <Phone size={17} />, text: '+229 00 00 00 00', href: 'tel:+22900000000' },
  { icon: <Mail size={17} />, text: 'contact@agrostock.bj', href: 'mailto:contact@agrostock.bj' },
  { icon: <MessageCircle size={17} />, text: 'WhatsApp: +229 00 00 00 00', href: 'https://wa.me/22900000000', external: true },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const openRegister = () => {
    window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'register' } }));
  };

  return (
    <footer style={{ background: footerBg, color: text }} className="pt-5 pb-3 position-relative overflow-hidden">
      <div className="footer-watermark" aria-hidden="true"><span className="wm-green">AGRO</span><span className="wm-yellow">STOCK</span> <span className="wm-red">BENIN</span></div>

      <div className="container pt-4 position-relative" style={{ zIndex: 2 }}>
        <div className="row g-4 mb-5">
          <div className="col-12 col-lg-4 pe-lg-4">
            <Link className="d-inline-flex align-items-center text-decoration-none mb-4" to="/">
              <img src="/images/logoAgro.png" alt="AgroStock" style={{ height: '52px', width: 'auto' }} />
            </Link>

            <p className="mb-4" style={{ color: muted, lineHeight: 1.7 }}>
              Plateforme beninoise dediee aux produits transformes locaux. Nous relions les transformateurs
              aux acheteurs avec un cadre professionnel, securise et fiable.
            </p>

            <button type="button" onClick={openRegister} className="btn btn-sm rounded-pill fw-bold px-3 py-2 mb-3 footer-cta">
              Ouvrir un compte transformateur
            </button>

            <div className="d-flex gap-2">
              {socialItems.map((social) => (
                <a
                  key={social.name}
                  href={social.link}
                  aria-label={social.name}
                  className="footer-social d-inline-flex align-items-center justify-content-center text-decoration-none"
                  target={social.external ? '_blank' : undefined}
                  rel={social.external ? 'noopener noreferrer' : undefined}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-2 offset-lg-1">
            <h6 className="fw-bold mb-3 text-uppercase" style={{ color: '#d5e7da', letterSpacing: '0.08em', fontSize: '0.78rem' }}>
              Navigation
            </h6>
            <ul className="list-unstyled m-0 d-flex flex-column gap-2">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link to={item.url} className="footer-link d-inline-flex align-items-center gap-2 text-decoration-none">
                    <ArrowRight size={12} className="footer-link-icon" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <h6 className="fw-bold mb-3 text-uppercase" style={{ color: '#d5e7da', letterSpacing: '0.08em', fontSize: '0.78rem' }}>
              Communaute
            </h6>
            <ul className="list-unstyled m-0 d-flex flex-column gap-2">
              {communityItems.map((item) => (
                <li key={item.label}>
                  {item.action === 'register' ? (
                    <button type="button" className="footer-link footer-btn text-decoration-none" onClick={openRegister}>
                      {item.label}
                    </button>
                  ) : item.external ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="footer-link text-decoration-none">
                      {item.label}
                    </a>
                  ) : (
                    <Link to={item.url} className="footer-link text-decoration-none">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="col-12 col-md-4 col-lg-3">
            <h6 className="fw-bold mb-3 text-uppercase" style={{ color: '#d5e7da', letterSpacing: '0.08em', fontSize: '0.78rem' }}>
              Contact
            </h6>
            <ul className="list-unstyled m-0 d-flex flex-column gap-3">
              {contactItems.map((item) => (
                <li key={item.text} className="d-flex align-items-start gap-2">
                  <span className="footer-contact-icon d-inline-flex align-items-center justify-content-center">{item.icon}</span>
                  {item.href ? (
                    <a
                      href={item.href}
                      style={{ color: muted, fontSize: '0.92rem' }}
                      className="footer-contact-link text-decoration-none"
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span style={{ color: muted, fontSize: '0.92rem' }}>{item.text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="mb-2 mb-md-0" style={{ color: '#7f8f85', fontSize: '0.84rem' }}>
            &copy; {currentYear} AgroStock Benin. Tous droits reserves.
          </p>
          <div className="d-flex gap-3" style={{ fontSize: '0.84rem' }}>
            <Link to="/contact" className="footer-bottom-link text-decoration-none">Mentions legales</Link>
            <Link to="/contact" className="footer-bottom-link text-decoration-none">Confidentialite</Link>
          </div>
        </div>
      </div>

      <style>{`
        .footer-watermark {
          position: absolute;
          left: 0;
          bottom: -12px;
          width: 100%;
          text-align: center;
          font-size: clamp(1.8rem, 7.6vw, 7.2rem);
          font-weight: 900;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          white-space: nowrap;
          user-select: none;
          pointer-events: none;
          z-index: 1;
        }
        .wm-green { color: rgba(26, 178, 115, 0.22); }
        .wm-yellow { color: rgba(245, 181, 24, 0.24); }
        .wm-red { color: rgba(222, 62, 48, 0.22); }
        .footer-watermark span {
          display: inline-block;
        }
        .footer-cta {
          background: rgba(26, 178, 115, 0.14);
          border: 1px solid rgba(26, 178, 115, 0.45);
          color: #dff7ea;
        }
        .footer-cta:hover {
          background: ${green};
          color: #fff;
          border-color: ${green};
        }
        .footer-social {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(26, 178, 115, 0.35);
          color: #9acfb7;
          background: ${panelBg};
          transition: all 0.2s ease;
        }
        .footer-social:hover {
          color: #ffffff;
          background: ${green};
          border-color: ${green};
          transform: translateY(-1px);
        }
        .footer-link {
          color: ${muted};
          transition: color 0.2s ease;
        }
        .footer-link:hover {
          color: ${green};
        }
        .footer-btn {
          background: transparent;
          border: 0;
          padding: 0;
          text-align: left;
        }
        .footer-link-icon {
          opacity: 0.7;
        }
        .footer-contact-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          color: ${green};
          background: rgba(26, 178, 115, 0.14);
          flex-shrink: 0;
          margin-top: 1px;
        }
        .footer-contact-link:hover {
          color: ${green} !important;
        }
        .footer-bottom-link {
          color: #7f8f85;
          transition: color 0.2s ease;
        }
        .footer-bottom-link:hover {
          color: ${green};
        }
      `}</style>
    </footer>
  );
};

export default Footer;