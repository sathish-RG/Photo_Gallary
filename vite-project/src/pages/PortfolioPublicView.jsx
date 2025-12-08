import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { getPortfolioBySlug } from '../api/portfolioApi';
import toast from 'react-hot-toast';

/**
 * ProfessionalPortfolioView - with Advanced Theme Engine
 * Applies CSS variables, layout variants, and dynamic social icons
 */
const ProfessionalPortfolioView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [activeSection, setActiveSection] = useState('home');

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  useEffect(() => {
    fetchPortfolio();
  }, [slug]);

  useEffect(() => {
    if (!portfolio) return;
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach((section) => observer.observe(section));
    return () => sections.forEach((section) => observer.unobserve(section));
  }, [portfolio]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await getPortfolioBySlug(slug);
      setPortfolio(response.data);
    } catch (error) {
      setError(error.response?.status === 404 ? 'Portfolio not found' : 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center max-w-md px-6">
        <h1 className="text-5xl font-bold text-slate-800 mb-3">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">{error}</h2>
        <button onClick={() => navigate('/')} className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700">Go Home</button>
      </div>
    </div>
  );

  const design = portfolio.designConfig || {};
  const colors = design.colors || {};
  const typography = design.typography || {};
  const categories = ['All', ...new Set(portfolio.galleryItems?.map(item => item.category) || [])];
  const filteredGallery = activeCategory === 'All' ? portfolio.galleryItems || [] : (portfolio.galleryItems || []).filter(item => item.category === activeCategory);

  // Layout variant rendering
  const ProfileImageClasses = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-2xl'
  };

  const renderAboutSection = () => {
    const { layoutVariant, bio, profileImage } = portfolio.aboutSection;
    const imageUrl = profileImage?.filePath;
    const imageClass = `object-cover shadow-xl ${ProfileImageClasses[design.profileImageStyle || 'circle']}`;

    switch (layoutVariant) {
      case 'split-left':
        return (
          <div className="flex flex-col md:flex-row items-center gap-12">
            {imageUrl && <img src={imageUrl} alt={portfolio.heroSection?.title} className={`w-48 h-48 md:w-64 md:h-64 ${imageClass}`} />}
            <div className="flex-1 text-center md:text-left"><p className="text-lg leading-relaxed whitespace-pre-wrap">{bio}</p></div>
          </div>
        );
      case 'split-right':
        return (
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            {imageUrl && <img src={imageUrl} alt={portfolio.heroSection?.title} className={`w-48 h-48 md:w-64 md:h-64 ${imageClass}`} />}
            <div className="flex-1 text-center md:text-left"><p className="text-lg leading-relaxed whitespace-pre-wrap">{bio}</p></div>
          </div>
        );
      case 'centered-card':
        return (
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            {imageUrl && <img src={imageUrl} alt={portfolio.heroSection?.title} className={`w-48 h-48 mb-8 ${imageClass}`} />}
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{bio}</p>
          </div>
        );
      case 'minimal-hero':
        return (
          <div className="flex flex-col items-center text-center">
            {imageUrl && <img src={imageUrl} alt={portfolio.heroSection?.title} className={`w-32 h-32 mb-4 ${imageClass}`} />}
            <p className="text-4xl font-bold mb-6 whitespace-pre-wrap">{bio}</p>
          </div>
        );
      default:
        return <p>{bio}</p>;
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        '--primary': colors.primary || '#4f46e5',
        '--background': colors.background || '#ffffff',
        '--text': colors.text || '#1f2937',
        '--accent': colors.accent || '#8b5cf6',
        '--border-radius': design.borderRadius || '12px',
        '--heading-font': `'${typography.headingFont}', serif`,
        '--body-font': `'${typography.bodyFont}', sans-serif`,
        backgroundColor: colors.background,
        color: colors.text
      }}
    >
      {/* Load Google Fonts */}
      <link href={`https://fonts.googleapis.com/css2?family=${typography.headingFont?.replace(/ /g, '+')}:wght@400;700&family=${typography.bodyFont?.replace(/ /g, '+')}:wght@400;500&display=swap`} rel="stylesheet" />

      {/* Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ color: colors.primary, fontFamily: `var(--heading-font)` }}>
            {portfolio.heroSection?.title || 'Portfolio'}
          </h1>
          <div className="hidden md:flex gap-8">
            {['home', 'gallery', 'services', 'testimonials', 'contact'].map((section) => {
              const shouldShow = section === 'home' || portfolio.showSections?.[`show${section.charAt(0).toUpperCase() + section.slice(1)}`];
              if (!shouldShow) return null;
              return (
                <button key={section} onClick={() => scrollToSection(section)} className="capitalize font-medium transition-colors" style={{ color: activeSection === section ? colors.primary : colors.text }}>
                  {section}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            y,
            backgroundImage: portfolio.heroSection?.backgroundImage?.filePath ? `url(${portfolio.heroSection.backgroundImage.filePath})` : `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="relative z-10 text-center text-white px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-4" style={{ fontFamily: `var(--heading-font)` }}>{portfolio.heroSection?.title}</h1>
          {portfolio.heroSection?.subtitle && <p className="text-2xl md:text-3xl" style={{ fontFamily: `var(--body-font)` }}>{portfolio.heroSection.subtitle}</p>}
        </motion.div>
      </section>

      {/* Gallery Section */}
      {portfolio.showSections?.showGallery && portfolio.galleryItems?.length > 0 && (
        <section id="gallery" className="py-20 px-4" style={{ backgroundColor: `${colors.primary}08` }}>
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="text-5xl font-bold text-center mb-12" style={{ fontFamily: `var(--heading-font)` }}>Featured Work</h2>
            </motion.div>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category) => (
                <button key={category} onClick={() => setActiveCategory(category)} className="px-6 py-2 rounded-full font-medium transition-all" style={{ backgroundColor: activeCategory === category ? colors.primary : '#fff', color: activeCategory === category ? '#fff' : colors.text, borderRadius: design.borderRadius }}>
                  {category}
                </button>
              ))}
            </div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGallery.map((item, index) => (
                <motion.div key={index} variants={fadeUp} className="group relative overflow-hidden shadow-md hover:shadow-2xl transition-all" style={{ borderRadius: design.borderRadius }}>
                  <img src={item.media?.filePath} alt={item.category} className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Services Section */}
      {portfolio.showSections?.showServices && portfolio.services?.length > 0 && (
        <section id="services" className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-bold text-center mb-16" style={{ fontFamily: `var(--heading-font)` }}>Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolio.services.map((service, index) => (
                <motion.div key={index} whileHover={{ y: -8 }} className="p-8 shadow-lg border transition-all" style={{ borderRadius: design.borderRadius }}>
                  <div className="text-5xl mb-4">{service.icon}</div>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>{service.title}</h3>
                  {service.price && <p className="text-3xl font-bold mb-4">{service.price}</p>}
                  {service.description && <p className="leading-relaxed">{service.description}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      {portfolio.showSections?.showAbout && portfolio.aboutSection?.bio && (
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="text-5xl font-bold text-center mb-12" style={{ fontFamily: `var(--heading-font)` }}>About</h2>
              {renderAboutSection()}
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer with Dynamic Social Links */}
      <footer className="py-12 px-4" style={{ backgroundColor: colors.text, color: colors.background }}>
        <div className="max-w-4xl mx-auto text-center">
          {portfolio.socialLinks?.length > 0 && (
            <div className="flex items-center justify-center gap-6 mb-8">
              {portfolio.socialLinks.map((link, idx) => {
                const Icon = FiIcons[link.icon] || FiIcons.FiLink;
                return (
                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full transition-all hover:scale-110" style={{ backgroundColor: `${colors.primary}20`, borderRadius: design.borderRadius }}>
                    <Icon className="w-6 h-6" style={{ color: colors.primary }} />
                  </a>
                );
              })}
            </div>
          )}
          <p className="text-sm opacity-75">© {new Date().getFullYear()} {portfolio.heroSection?.title}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ProfessionalPortfolioView;
