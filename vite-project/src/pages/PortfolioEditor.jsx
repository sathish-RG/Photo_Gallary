import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiChevronDown, FiChevronRight, FiPlus, FiX, FiEye, FiSave, FiStar, FiCheck } from 'react-icons/fi';
import * as FiIcons from 'react-icons/fi';
import { upsertPortfolio, getMyPortfolio } from '../api/portfolioApi';
import MediaPickerModal from '../components/MediaPickerModal';
import Button from '../components/ui/Button';
import { COLOR_PALETTES, FONT_PAIRS, SOCIAL_PLATFORMS, LAYOUT_VARIANTS, PROFILE_IMAGE_STYLES } from '../constants/themeConstants';

/**
 * PortfolioEditor - Advanced Theme Engine
 * With color palettes, fonts, layouts, and social manager
 */
const PortfolioEditor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('hero');

  // Accordion states
  const [expandedSections, setExpandedSections] = useState({
    hero: true,
    theme: false,
    layout: false,
    gallery: false,
    services: false,
    testimonials: false,
    social: false,
    contact: false,
  });

  // Portfolio data with new design config
  const [portfolioData, setPortfolioData] = useState({
    slug: '',
    heroSection: { title: '', subtitle: '', backgroundImage: null },
    aboutSection: { bio: '', profileImage: null, layoutVariant: 'split-left' },
    galleryItems: [],
    services: [],
    testimonials: [],
    contactEmail: '',
    showSections: {
      showGallery: true,
      showServices: false,
      showTestimonials: false,
      showAbout: true,
      showContact: false,
    },
    socialLinks: [],
    designConfig: {
      colors: {
        primary: '#4f46e5',
        background: '#ffffff',
        text: '#1f2937',
        accent: '#8b5cf6'
      },
      typography: {
        headingFont: 'Playfair Display',
        bodyFont: 'Lato'
      },
      borderRadius: '12px',
      profileImageStyle: 'circle'
    },
  });

  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const response = await getMyPortfolio();
      if (response.data) {
        const portfolio = response.data;

        // Migrate old socialLinks format to new array format
        let socialLinksArray = [];
        if (portfolio.socialLinks) {
          if (Array.isArray(portfolio.socialLinks)) {
            // Already in new format
            socialLinksArray = portfolio.socialLinks;
          } else {
            // Old format - migrate to array
            if (portfolio.socialLinks.instagram) {
              socialLinksArray.push({ platform: 'instagram', url: portfolio.socialLinks.instagram, icon: 'FiInstagram', order: 0 });
            }
            if (portfolio.socialLinks.website) {
              socialLinksArray.push({ platform: 'website', url: portfolio.socialLinks.website, icon: 'FiGlobe', order: 1 });
            }
            if (portfolio.socialLinks.email) {
              socialLinksArray.push({ platform: 'email', url: `mailto:${portfolio.socialLinks.email}`, icon: 'FiMail', order: 2 });
            }
          }
        }

        setPortfolioData({
          slug: portfolio.slug || '',
          heroSection: {
            title: portfolio.heroSection?.title || '',
            subtitle: portfolio.heroSection?.subtitle || '',
            backgroundImage: portfolio.heroSection?.backgroundImage?._id || null,
          },
          aboutSection: {
            bio: portfolio.aboutSection?.bio || '',
            profileImage: portfolio.aboutSection?.profileImage?._id || null,
            layoutVariant: portfolio.aboutSection?.layoutVariant || 'split-left',
          },
          galleryItems: portfolio.galleryItems?.map((item, index) => ({
            media: item.media?._id,
            category: item.category,
            order: item.order || index,
            _tempUrl: item.media?.filePath,
            _tempCaption: item.media?.caption,
          })) || [],
          services: portfolio.services || [],
          testimonials: portfolio.testimonials || [],
          contactEmail: portfolio.contactEmail || '',
          showSections: portfolio.showSections || {
            showGallery: true,
            showServices: false,
            showTestimonials: false,
            showAbout: true,
            showContact: false,
          },
          socialLinks: socialLinksArray,
          designConfig: portfolio.designConfig || {
            colors: { primary: '#4f46e5', background: '#ffffff', text: '#1f2937', accent: '#8b5cf6' },
            typography: { headingFont: 'Playfair Display', bodyFont: 'Lato' },
            borderRadius: '12px',
            profileImageStyle: 'circle'
          },
        });
        setHeroImageUrl(portfolio.heroSection?.backgroundImage?.filePath || '');
        setProfileImageUrl(portfolio.aboutSection?.profileImage?.filePath || '');
      }
    } catch (error) {
      console.log('No existing portfolio found');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setPortfolioData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    } else {
      setPortfolioData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleDesignConfigChange = (section, field, value) => {
    setPortfolioData(prev => ({
      ...prev,
      designConfig: {
        ...prev.designConfig,
        [section]: {
          ...prev.designConfig[section],
          [field]: value
        }
      }
    }));
  };

  const applyColorPalette = (palette) => {
    setPortfolioData(prev => ({
      ...prev,
      designConfig: {
        ...prev.designConfig,
        colors: palette.colors
      }
    }));
    toast.success(`Applied ${palette.name} palette`);
  };

  const applyFontPair = (fontPair) => {
    setPortfolioData(prev => ({
      ...prev,
      designConfig: {
        ...prev.designConfig,
        typography: {
          headingFont: fontPair.heading,
          bodyFont: fontPair.body
        }
      }
    }));
    toast.success(`Applied ${fontPair.name} fonts`);
  };

  // Social Links Management
  const addSocialLink = () => {
    setPortfolioData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, {
        platform: 'instagram',
        url: '',
        icon: 'FiInstagram',
        order: prev.socialLinks.length
      }]
    }));
  };

  const updateSocialLink = (index, field, value) => {
    setPortfolioData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => {
        if (i === index) {
          if (field === 'platform') {
            const platform = SOCIAL_PLATFORMS.find(p => p.value === value);
            return { ...link, platform: value, icon: platform?.icon || 'FiLink' };
          }
          return { ...link, [field]: value };
        }
        return link;
      })
    }));
  };

  const removeSocialLink = (index) => {
    setPortfolioData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  // Service & Testimonial management (keep existing from previous version)
  const addService = () => {
    setPortfolioData(prev => ({
      ...prev,
      services: [...prev.services, { title: '', price: '', description: '', icon: '📸' }]
    }));
  };

  const updateService = (index, field, value) => {
    setPortfolioData(prev => ({
      ...prev,
      services: prev.services.map((s, i) => i === index ? { ...s, [field]: value } : s)
    }));
  };

  const removeService = (index) => {
    setPortfolioData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const addTestimonial = () => {
    setPortfolioData(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, { clientName: '', quote: '', rating: 5 }]
    }));
  };

  const updateTestimonial = (index, field, value) => {
    setPortfolioData(prev => ({
      ...prev,
      testimonials: prev.testimonials.map((t, i) => i === index ? { ...t, [field]: value } : t)
    }));
  };

  const removeTestimonial = (index) => {
    setPortfolioData(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index)
    }));
  };

  const openMediaPicker = (mode) => {
    setPickerMode(mode);
    setShowMediaPicker(true);
  };

  const handleMediaSelect = (selectedMedia) => {
    if (pickerMode === 'hero') {
      if (selectedMedia.length > 0) {
        handleInputChange('heroSection', 'backgroundImage', selectedMedia[0].id);
        setHeroImageUrl(selectedMedia[0].url);
        toast.success('Hero image selected');
      }
    } else if (pickerMode === 'profile') {
      if (selectedMedia.length > 0) {
        handleInputChange('aboutSection', 'profileImage', selectedMedia[0].id);
        setProfileImageUrl(selectedMedia[0].url);
        toast.success('Profile image selected');
      }
    } else if (pickerMode === 'gallery') {
      const newItems = selectedMedia.map((media, index) => ({
        media: media.id,
        category: 'Uncategorized',
        order: portfolioData.galleryItems.length + index,
        _tempUrl: media.url,
        _tempCaption: media.caption,
      }));
      setPortfolioData(prev => ({ ...prev, galleryItems: [...prev.galleryItems, ...newItems] }));
      toast.success(`Added ${selectedMedia.length} photo(s)`);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const dataToSave = {
        ...portfolioData,
        galleryItems: portfolioData.galleryItems.map(({ media, category, order }) => ({ media, category, order })),
        services: portfolioData.services.filter(s => s.title && s.title.trim()),
        testimonials: portfolioData.testimonials.filter(t => t.clientName && t.clientName.trim() && t.quote && t.quote.trim()),
        socialLinks: portfolioData.socialLinks.filter(l => l.platform && l.url && l.url.trim()),
      };

      const response = await upsertPortfolio(dataToSave);
      toast.success(response.message || 'Website saved successfully!');
    } catch (error) {
      console.error('Error saving:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const AccordionHeader = ({ title, section, badge }) => (
    <button onClick={() => toggleSection(section)} className="flex items-center justify-between w-full p-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-center">
        {expandedSections[section] ? <FiChevronDown className="w-5 h-5 mr-2" /> : <FiChevronRight className="w-5 h-5 mr-2" />}
        <span className="font-semibold text-slate-800">{title}</span>
        {badge && <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">{badge}</span>}
      </div>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Left Sidebar - Advanced Configurator */}
      <div className="w-96 bg-white border-r border-slate-200 overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800">Theme Engine</h1>
          <p className="text-sm text-slate-500 mt-1">Advanced customization</p>
        </div>

        {/* Accordion Sections */}
        <div className="divide-y divide-slate-200">
          {/* Hero Section */}
          <div>
            <AccordionHeader title="Hero & Branding" section="hero" />
            {expandedSections.hero && (
              <div className="p-4 space-y-4 bg-slate-50">
                <input type="text" value={portfolioData.slug} onChange={(e) => handleInputChange(null, 'slug', e.target.value.toLowerCase())} placeholder="portfolio-slug" className="w-full px-3 py-2 border rounded-lg text-sm" />
                <input type="text" value={portfolioData.heroSection.title} onChange={(e) => handleInputChange('heroSection', 'title', e.target.value)} placeholder="Your Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
                <input type="text" value={portfolioData.heroSection.subtitle} onChange={(e) => handleInputChange('heroSection', 'subtitle', e.target.value)} placeholder="Tagline" className="w-full px-3 py-2 border rounded-lg text-sm" />
                <button onClick={() => openMediaPicker('hero')} className="w-full py-2 border-2 border-dashed rounded-lg text-sm hover:border-indigo-500">
                  {heroImageUrl ? '✓ Hero Image Set' : '+ Select Hero Image'}
                </button>
              </div>
            )}
          </div>

          {/* Theme Customization */}
          <div>
            <AccordionHeader title="Theme & Colors" section="theme" />
            {expandedSections.theme && (
              <div className="p-4 space-y-6 bg-slate-50">
                {/* Color Palettes */}
                <div>
                  <p className="text-sm font-medium mb-3">Color Palettes</p>
                  <div className="grid grid-cols-2 gap-2">
                    {COLOR_PALETTES.map((palette, idx) => (
                      <button
                        key={idx}
                        onClick={() => applyColorPalette(palette)}
                        className="p-3 bg-white rounded-lg border hover:border-indigo-500 transition-all text-left"
                      >
                        <div className="flex gap-1 mb-2">
                          {Object.values(palette.colors).map((color, i) => (
                            <div key={i} className="w-6 h-6 rounded" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                        <p className="text-xs font-medium">{palette.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Custom Colors</p>
                  {['primary', 'background', 'text', 'accent'].map((colorKey) => (
                    <div key={colorKey} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={portfolioData.designConfig.colors[colorKey]}
                        onChange={(e) => handleDesignConfigChange('colors', colorKey, e.target.value)}
                        className="w-10 h-8 rounded cursor-pointer"
                      />
                      <span className="text-xs capitalize flex-1">{colorKey}</span>
                      <input
                        type="text"
                        value={portfolioData.designConfig.colors[colorKey]}
                        onChange={(e) => handleDesignConfigChange('colors', colorKey, e.target.value)}
                        className="w-20 px-2 py-1 border rounded text-xs"
                      />
                    </div>
                  ))}
                </div>

                {/* Font Pairing */}
                <div>
                  <p className="text-sm font-medium mb-2">Font Pairing</p>
                  {FONT_PAIRS.map((pair, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyFontPair(pair)}
                      className="w-full p-2 mb-1 bg-white rounded border hover:border-indigo-500 text-left text-sm"
                    >
                      {pair.name}
                    </button>
                  ))}
                </div>

                {/* Border Radius */}
                <div>
                  <p className="text-sm font-medium mb-2">Border Radius</p>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={parseInt(portfolioData.designConfig.borderRadius)}
                    onChange={(e) => setPortfolioData(prev => ({
                      ...prev,
                      designConfig: { ...prev.designConfig, borderRadius: `${e.target.value}px` }
                    }))}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 mt-1">{portfolioData.designConfig.borderRadius}</p>
                </div>
              </div>
            )}
          </div>

          {/* Layout Customization */}
          <div>
            <AccordionHeader title="Layout & Profile" section="layout" />
            {expandedSections.layout && (
              <div className="p-4 space-y-4 bg-slate-50">
                <div>
                  <p className="text-sm font-medium mb-2">About Section Layout</p>
                  <div className="grid grid-cols-2 gap-2">
                    {LAYOUT_VARIANTS.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => handleInputChange('aboutSection', 'layoutVariant', variant.id)}
                        className={`p-3 border rounded-lg text-left text-xs ${portfolioData.aboutSection.layoutVariant === variant.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'bg-white hover:border-indigo-300'
                          }`}
                      >
                        <p className="font-medium">{variant.name}</p>
                        <p className="text-slate-500 text-xs mt-1">{variant.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Profile Image Style</p>
                  <div className="flex gap-2">
                    {PROFILE_IMAGE_STYLES.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => setPortfolioData(prev => ({
                          ...prev,
                          designConfig: { ...prev.designConfig, profileImageStyle: style.value }
                        }))}
                        className={`flex-1 py-2 px-3 border rounded-lg text-xs ${portfolioData.designConfig.profileImageStyle === style.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'bg-white'
                          }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => openMediaPicker('profile')} className="w-full py-2 border-2 border-dashed rounded-lg text-sm hover:border-indigo-500">
                  {profileImageUrl ? '✓ Profile Image Set' : '+ Select Profile Image'}
                </button>
              </div>
            )}
          </div>

          {/* Social Media Manager */}
          <div>
            <AccordionHeader title="Social Media" section="social" badge={portfolioData.socialLinks.length} />
            {expandedSections.social && (
              <div className="p-4 space-y-3 bg-slate-50">
                <button onClick={addSocialLink} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  <FiPlus className="inline mr-1" /> Add Social Link
                </button>
                {portfolioData.socialLinks.map((link, index) => (
                  <div key={index} className="p-3 bg-white rounded-lg border space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={link.platform}
                        onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                        className="flex-1 px-2 py-1 border rounded text-sm"
                      >
                        {SOCIAL_PLATFORMS.map((platform) => (
                          <option key={platform.value} value={platform.value}>{platform.label}</option>
                        ))}
                      </select>
                      <button onClick={() => removeSocialLink(index)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-1 border rounded text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gallery, Services, Testimonials, Contact */}
          <div>
            <AccordionHeader title="Gallery" section="gallery" badge={portfolioData.galleryItems.length} />
            {expandedSections.gallery && (
              <div className="p-4 space-y-3 bg-slate-50">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={portfolioData.showSections.showGallery} onChange={() => setPortfolioData(prev => ({ ...prev, showSections: { ...prev.showSections, showGallery: !prev.showSections.showGallery } }))} className="rounded" />
                  <span className="text-sm">Show Gallery Section</span>
                </label>
                <button onClick={() => openMediaPicker('gallery')} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">
                  <FiPlus className="inline mr-1" /> Add Photos
                </button>

                {/* Gallery Items List with Category Editor */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {portfolioData.galleryItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                      {/* Thumbnail */}
                      {item._tempUrl && (
                        <img src={item._tempUrl} alt={item.category} className="w-12 h-12 object-cover rounded" />
                      )}

                      {/* Category Input */}
                      <input
                        type="text"
                        value={item.category}
                        onChange={(e) => {
                          const newItems = [...portfolioData.galleryItems];
                          newItems[index].category = e.target.value;
                          setPortfolioData(prev => ({ ...prev, galleryItems: newItems }));
                        }}
                        placeholder="Category (e.g., Wedding)"
                        className="flex-1 px-2 py-1 border rounded text-sm"
                      />

                      {/* Move Up/Down */}
                      <div className="flex flex-col">
                        <button
                          onClick={() => {
                            if (index > 0) {
                              const newItems = [...portfolioData.galleryItems];
                              [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
                              newItems.forEach((item, i) => item.order = i);
                              setPortfolioData(prev => ({ ...prev, galleryItems: newItems }));
                            }
                          }}
                          disabled={index === 0}
                          className="text-xs text-slate-600 hover:text-indigo-600 disabled:opacity-30"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => {
                            if (index < portfolioData.galleryItems.length - 1) {
                              const newItems = [...portfolioData.galleryItems];
                              [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
                              newItems.forEach((item, i) => item.order = i);
                              setPortfolioData(prev => ({ ...prev, galleryItems: newItems }));
                            }
                          }}
                          disabled={index === portfolioData.galleryItems.length - 1}
                          className="text-xs text-slate-600 hover:text-indigo-600 disabled:opacity-30"
                        >
                          ▼
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          const newItems = portfolioData.galleryItems.filter((_, i) => i !== index);
                          newItems.forEach((item, i) => item.order = i);
                          setPortfolioData(prev => ({ ...prev, galleryItems: newItems }));
                        }}
                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-500">{portfolioData.galleryItems.length} photos added</p>
              </div>
            )}
          </div>

          <div>
            <AccordionHeader title="Services" section="services" badge={portfolioData.services.length} />
            {expandedSections.services && (
              <div className="p-4 space-y-3 bg-slate-50">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={portfolioData.showSections.showServices} onChange={() => setPortfolioData(prev => ({ ...prev, showSections: { ...prev.showSections, showServices: !prev.showSections.showServices } }))} className="rounded" />
                  <span className="text-sm">Show Services Section</span>
                </label>
                <button onClick={addService} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  <FiPlus className="inline mr-1" /> Add Service
                </button>
                {portfolioData.services.map((service, index) => (
                  <div key={index} className="p-3 bg-white rounded-lg border space-y-2">
                    <div className="flex justify-between items-start">
                      <input type="text" value={service.icon} onChange={(e) => updateService(index, 'icon', e.target.value)} placeholder="📸" className="w-12 px-2 py-1 border rounded text-center text-sm" />
                      <button onClick={() => removeService(index)} className="text-red-600 hover:bg-red-50 p-1 rounded">
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                    <input type="text" value={service.title} onChange={(e) => updateService(index, 'title', e.target.value)} placeholder="Service Title" className="w-full px-3 py-1 border rounded text-sm" />
                    <input type="text" value={service.price} onChange={(e) => updateService(index, 'price', e.target.value)} placeholder="$500" className="w-full px-3 py-1 border rounded text-sm" />
                    <textarea value={service.description} onChange={(e) => updateService(index, 'description', e.target.value)} placeholder="Description..." rows={2} className="w-full px-3 py-1 border rounded text-sm resize-none" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <AccordionHeader title="Testimonials" section="testimonials" badge={portfolioData.testimonials.length} />
            {expandedSections.testimonials && (
              <div className="p-4 space-y-3 bg-slate-50">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={portfolioData.showSections.showTestimonials} onChange={() => setPortfolioData(prev => ({ ...prev, showSections: { ...prev.showSections, showTestimonials: !prev.showSections.showTestimonials } }))} className="rounded" />
                  <span className="text-sm">Show Testimonials Section</span>
                </label>
                <button onClick={addTestimonial} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  <FiPlus className="inline mr-1" /> Add Testimonial
                </button>
                {portfolioData.testimonials.map((testimonial, index) => (
                  <div key={index} className="p-3 bg-white rounded-lg border space-y-2">
                    <div className="flex justify-between">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar key={star} onClick={() => updateTestimonial(index, 'rating', star)} className={`w-4 h-4 cursor-pointer ${star <= testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <button onClick={() => removeTestimonial(index)} className="text-red-600 hover:bg-red-50 p-1 rounded">
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                    <input type="text" value={testimonial.clientName} onChange={(e) => updateTestimonial(index, 'clientName', e.target.value)} placeholder="Client Name" className="w-full px-3 py-1 border rounded text-sm" />
                    <textarea value={testimonial.quote} onChange={(e) => updateTestimonial(index, 'quote', e.target.value)} placeholder="Testimonial quote..." rows={3} className="w-full px-3 py-1 border rounded text-sm resize-none" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <AccordionHeader title="Contact" section="contact" />
            {expandedSections.contact && (
              <div className="p-4 space-y-3 bg-slate-50">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={portfolioData.showSections.showContact} onChange={() => setPortfolioData(prev => ({ ...prev, showSections: { ...prev.showSections, showContact: !prev.showSections.showContact } }))} className="rounded" />
                  <span className="text-sm">Show Contact Form</span>
                </label>
                <input type="email" value={portfolioData.contactEmail} onChange={(e) => handleInputChange(null, 'contactEmail', e.target.value)} placeholder="contact@email.com" className="w-full px-3 py-2 border rounded-lg text-sm" />
                <textarea value={portfolioData.aboutSection.bio} onChange={(e) => handleInputChange('aboutSection', 'bio', e.target.value)} placeholder="Write your bio here..." rows={4} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
              </div>
            )}
          </div>
        </div>

        {/* Save & Preview Buttons */}
        <div className="p-4 border-t border-slate-200 space-y-2">
          <Button onClick={handleSave} isLoading={saving} className="w-full flex items-center justify-center gap-2">
            <FiSave className="w-4 h-4" /> Save Website
          </Button>
          <Button variant="secondary" onClick={() => window.open(`/p/${portfolioData.slug}`, '_blank')} className="w-full flex items-center justify-center gap-2">
            <FiEye className="w-4 h-4" /> View Live Site
          </Button>
        </div>
      </div>

      {/* Right Preview Pane - FULL LIVE PREVIEW */}
      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: portfolioData.designConfig.colors.background }}>
        <div
          className="min-h-screen"
          style={{
            '--primary': portfolioData.designConfig.colors.primary,
            '--background': portfolioData.designConfig.colors.background,
            '--text': portfolioData.designConfig.colors.text,
            '--accent': portfolioData.designConfig.colors.accent,
            backgroundColor: portfolioData.designConfig.colors.background,
            color: portfolioData.designConfig.colors.text,
            fontFamily: portfolioData.designConfig.typography.bodyFont
          }}
        >
          {/* Preview Sticky Navigation */}
          <nav className="sticky top-0 bg-white/90 backdrop-blur-md shadow-sm z-50">
            <div className="px-6 py-4 flex items-center justify-between">
              <h1 className="text-xl font-bold" style={{ color: portfolioData.designConfig.colors.primary, fontFamily: portfolioData.designConfig.typography.headingFont }}>
                {portfolioData.heroSection.title || 'Portfolio'}
              </h1>
              <div className="flex gap-6 text-sm">
                {['Home', 'Gallery', 'Services', 'About'].map((section) => (
                  <span key={section} className="font-medium cursor-pointer hover:opacity-70" style={{ color: portfolioData.designConfig.colors.text }}>
                    {section}
                  </span>
                ))}
              </div>
            </div>
          </nav>

          {/* Preview Hero */}
          <div
            className="relative h-96 flex items-center justify-center text-white"
            style={{
              backgroundImage: heroImageUrl ? `url(${heroImageUrl})` : `linear-gradient(135deg, ${portfolioData.designConfig.colors.primary}, ${portfolioData.designConfig.colors.accent})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 text-center px-4">
              <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: portfolioData.designConfig.typography.headingFont }}>
                {portfolioData.heroSection.title || 'Your Name'}
              </h1>
              {portfolioData.heroSection.subtitle && (
                <p className="text-xl opacity-90">{portfolioData.heroSection.subtitle}</p>
              )}
            </div>
          </div>

          {/* Preview Gallery */}
          {portfolioData.showSections.showGallery && portfolioData.galleryItems.length > 0 && (
            <div className="py-16 px-6" style={{ backgroundColor: `${portfolioData.designConfig.colors.primary}08` }}>
              <h2 className="text-4xl font-bold text-center mb-8" style={{ fontFamily: portfolioData.designConfig.typography.headingFont }}>Gallery</h2>
              <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
                {portfolioData.galleryItems.slice(0, 6).map((item, idx) => (
                  <div key={idx} className="aspect-square overflow-hidden shadow-md" style={{ borderRadius: portfolioData.designConfig.borderRadius }}>
                    {item._tempUrl && (
                      <img src={item._tempUrl} alt={item.category} className="w-full h-full object-cover hover:scale-110 transition-transform" />
                    )}
                  </div>
                ))}
              </div>
              {portfolioData.galleryItems.length > 6 && (
                <p className="text-center mt-4 text-sm opacity-75">+ {portfolioData.galleryItems.length - 6} more photos</p>
              )}
            </div>
          )}

          {/* Preview Services */}
          {portfolioData.showSections.showServices && portfolioData.services.length > 0 && (
            <div className="py-16 px-6">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl font-bold text-center mb-12" style={{ fontFamily: portfolioData.designConfig.typography.headingFont }}>Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {portfolioData.services.map((service, idx) => (
                    <div key={idx} className="p-6 bg-white shadow-lg border" style={{ borderRadius: portfolioData.designConfig.borderRadius }}>
                      <div className="text-4xl mb-3">{service.icon}</div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: portfolioData.designConfig.colors.primary }}>{service.title}</h3>
                      {service.price && <p className="text-2xl font-bold mb-3">{service.price}</p>}
                      {service.description && <p className="text-sm opacity-80">{service.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Preview Testimonials */}
          {portfolioData.showSections.showTestimonials && portfolioData.testimonials.length > 0 && (
            <div className="py-16 px-6" style={{ backgroundColor: `${portfolioData.designConfig.colors.primary}08` }}>
              <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold text-center mb-12" style={{ fontFamily: portfolioData.designConfig.typography.headingFont }}>Testimonials</h2>
                <div className="bg-white p-8 shadow-xl" style={{ borderRadius: portfolioData.designConfig.borderRadius }}>
                  {portfolioData.testimonials[0] && (
                    <>
                      <div className="flex gap-1 justify-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} className={`w-5 h-5 ${i < portfolioData.testimonials[0].rating ? 'fill-current' : ''}`} style={{ color: portfolioData.designConfig.colors.primary }} />
                        ))}
                      </div>
                      <p className="text-lg text-center italic mb-4">"{portfolioData.testimonials[0].quote}"</p>
                      <p className="text-center font-semibold" style={{ color: portfolioData.designConfig.colors.primary }}>
                        — {portfolioData.testimonials[0].clientName}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Preview About Section with Layout Variants */}
          {portfolioData.showSections.showAbout && portfolioData.aboutSection.bio && (
            <div className="py-16 px-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold text-center mb-12" style={{ fontFamily: portfolioData.designConfig.typography.headingFont }}>About</h2>
                {(() => {
                  const imageStyle = {
                    circle: 'rounded-full',
                    square: 'rounded-none',
                    rounded: 'rounded-2xl'
                  }[portfolioData.designConfig.profileImageStyle];

                  switch (portfolioData.aboutSection.layoutVariant) {
                    case 'split-left':
                      return (
                        <div className="flex flex-col md:flex-row items-center gap-8">
                          {profileImageUrl && <img src={profileImageUrl} alt="Profile" className={`w-48 h-48 object-cover shadow-xl ${imageStyle}`} />}
                          <div className="flex-1 text-center md:text-left"><p className="leading-relaxed whitespace-pre-wrap">{portfolioData.aboutSection.bio}</p></div>
                        </div>
                      );
                    case 'split-right':
                      return (
                        <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                          {profileImageUrl && <img src={profileImageUrl} alt="Profile" className={`w-48 h-48 object-cover shadow-xl ${imageStyle}`} />}
                          <div className="flex-1 text-center md:text-left"><p className="leading-relaxed whitespace-pre-wrap">{portfolioData.aboutSection.bio}</p></div>
                        </div>
                      );
                    case 'centered-card':
                      return (
                        <div className="flex flex-col items-center text-center">
                          {profileImageUrl && <img src={profileImageUrl} alt="Profile" className={`w-40 h-40 mb-6 object-cover shadow-xl ${imageStyle}`} />}
                          <p className="leading-relaxed whitespace-pre-wrap max-w-2xl">{portfolioData.aboutSection.bio}</p>
                        </div>
                      );
                    case 'minimal-hero':
                      return (
                        <div className="flex flex-col items-center text-center">
                          {profileImageUrl && <img src={profileImageUrl} alt="Profile" className={`w-24 h-24 mb-4 object-cover shadow-xl ${imageStyle}`} />}
                          <p className="text-3xl font-bold whitespace-pre-wrap">{portfolioData.aboutSection.bio}</p>
                        </div>
                      );
                    default:
                      return <p>{portfolioData.aboutSection.bio}</p>;
                  }
                })()}
              </div>
            </div>
          )}

          {/* Preview Social Links */}
          {portfolioData.socialLinks.length > 0 && (
            <div className="py-12 px-6" style={{ backgroundColor: portfolioData.designConfig.colors.text, color: portfolioData.designConfig.colors.background }}>
              <div className="max-w-4xl mx-auto text-center">
                <div className="flex items-center justify-center gap-4 mb-6">
                  {portfolioData.socialLinks.map((link, idx) => {
                    const Icon = FiIcons[link.icon] || FiIcons.FiLink;
                    return (
                      <div key={idx} className="p-3 rounded-full" style={{ backgroundColor: `${portfolioData.designConfig.colors.primary}20`, borderRadius: portfolioData.designConfig.borderRadius }}>
                        <Icon className="w-5 h-5" style={{ color: portfolioData.designConfig.colors.primary }} />
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm opacity-75">© 2025 {portfolioData.heroSection.title || 'Your Portfolio'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
        multiSelect={pickerMode === 'gallery'}
      />
    </div>
  );
};

export default PortfolioEditor;
