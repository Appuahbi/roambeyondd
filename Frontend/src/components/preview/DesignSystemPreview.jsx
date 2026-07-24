/*
  ============================================
  DESIGN SYSTEM — EXACT TOKENS (do not deviate)
  ============================================
  
  COLORS:
  --primary:       #2F5233  (deep forest green — CTAs, active, icons)
  --secondary:     #7A9B76  (sage green — gradients, hover, accents)
  --gradient:      linear-gradient(135deg, #2F5233 0%, #4F7A52 100%)
  --cream:         #F5F1E8  (main background)
  --cream-light:   #FAF7F0  (alternating sections)
  --white:         #FFFFFF  (cards, containers)
  --text-dark:     #1F2A1F  (headings)
  --text-muted:    #5C6B5C  (body/secondary)
  --border:        #E3DDCB  (dividers)
  --error:         #8B5E3C  (muted terracotta)
  --success:       #5C7A52  (muted olive-green)
  
  TYPOGRAPHY:
  Display: Playfair Display (H1/H2 only)
  Body: Inter (everything else)
  H1: 56px/1.1 desktop, 36px mobile, weight 700
  H2: 36px/1.2 desktop, 28px mobile, weight 600
  H3: 24px/1.3, weight 600
  Body: 16px/1.6, weight 400
  Small: 14px/1.5, weight 400
  
  SPACING: 8px base scale (8, 16, 24, 32, 48, 64, 96, 128)
  Section padding: 96px desktop / 48px mobile
  
  RADIUS: 12px cards/inputs, 8px buttons, 24px hero
  SHADOWS: soft green-tinted, 3-tier system
*/

import { motion } from 'framer-motion'
import { MapPin, Clock, Users, Star, ArrowRight, Heart } from 'lucide-react'

/* ============================================
   PREVIEW: PRIMARY BUTTON
   ============================================ */
function PreviewButton() {
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '32px' }}>
      {/* Primary — exact spec */}
      <motion.button
        whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(47,82,51,0.25)' }}
        whileTap={{ scale: 0.98 }}
        style={{
          background: 'linear-gradient(135deg, #2F5233 0%, #4F7A52 100%)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '600',
          fontFamily: 'Inter, system-ui, sans-serif',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(47,82,51,0.15)',
          transition: 'all 0.2s ease',
        }}
      >
        Search Packages
      </motion.button>

      {/* Secondary */}
      <motion.button
        whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(122,155,118,0.25)' }}
        whileTap={{ scale: 0.98 }}
        style={{
          background: 'linear-gradient(135deg, #7A9B76 0%, #9BB898 100%)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '600',
          fontFamily: 'Inter, system-ui, sans-serif',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(122,155,118,0.15)',
          transition: 'all 0.2s ease',
        }}
      >
        Learn More
      </motion.button>

      {/* Outline */}
      <motion.button
        whileHover={{ y: -2, background: '#2F5233', color: '#FFFFFF', boxShadow: '0 8px 24px rgba(47,82,51,0.25)' }}
        whileTap={{ scale: 0.98 }}
        style={{
          background: 'transparent',
          color: '#2F5233',
          border: '2px solid #2F5233',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '600',
          fontFamily: 'Inter, system-ui, sans-serif',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        View Details
      </motion.button>
    </div>
  )
}

/* ============================================
   PREVIEW: H1 / H2 TYPOGRAPHY
   ============================================ */
function PreviewTypography() {
  return (
    <div style={{ padding: '32px', background: '#F5F1E8', borderRadius: '12px' }}>
      <h1 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 'clamp(36px, 5vw, 56px)',
        lineHeight: '1.1',
        fontWeight: '700',
        color: '#1F2A1F',
        margin: '0 0 16px 0',
      }}>
        Every Corner of India,
        <br />
        <span style={{ color: '#2F5233' }}>One Platform</span>
      </h1>

      <h2 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 'clamp(28px, 3.5vw, 36px)',
        lineHeight: '1.2',
        fontWeight: '600',
        color: '#1F2A1F',
        margin: '0 0 8px 0',
      }}>
        Tour Categories
      </h2>

      <h3 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: '24px',
        lineHeight: '1.3',
        fontWeight: '600',
        color: '#1F2A1F',
        margin: '0 0 8px 0',
      }}>
        Rajasthan Heritage Tour
      </h3>

      <p style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '16px',
        lineHeight: '1.6',
        fontWeight: '400',
        color: '#5C6B5C',
        margin: '0 0 8px 0',
      }}>
        Discover ancient monuments, vibrant bazaars, and hidden gems with expertly curated tour packages designed for unforgettable adventures across India.
      </p>

      <p style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        lineHeight: '1.5',
        fontWeight: '400',
        color: '#5C6B5C',
        margin: 0,
      }}>
        10,000+ travelers · 50+ destinations · 200+ curated packages
      </p>
    </div>
  )
}

/* ============================================
   PREVIEW: PACKAGE CARD (exact spec)
   ============================================ */
function PreviewCard() {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(47,82,51,0.12)' }}
      style={{
        width: '320px',
        borderRadius: '12px',
        border: '1px solid #E3DDCB',
        background: '#FFFFFF',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(47,82,51,0.06)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
    >
      {/* Image area */}
      <div style={{
        height: '180px',
        background: 'linear-gradient(135deg, #2F5233 0%, #4F7A52 50%, #7A9B76 100%)',
        position: 'relative',
        borderRadius: '12px 12px 0 0',
      }}>
        {/* Discount badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'linear-gradient(135deg, #8B5E3C 0%, #A07050 100%)',
          color: '#FFFFFF',
          fontSize: '11px',
          fontWeight: '700',
          padding: '4px 8px',
          borderRadius: '6px',
        }}>
          25% OFF
        </div>

        {/* Wishlist */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <Heart size={16} color="#5C6B5C" />
        </div>

        {/* Category badge */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          fontSize: '11px',
          fontWeight: '500',
          color: '#2F5233',
          padding: '4px 10px',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          Domestic Tours
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        <h3 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '18px',
          fontWeight: '600',
          color: '#1F2A1F',
          margin: '0 0 6px 0',
        }}>
          Rajasthan Heritage Tour
        </h3>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '13px',
          color: '#5C6B5C',
          margin: '0 0 12px 0',
        }}>
          <MapPin size={14} /> Jaipur, Udaipur, Jodhpur
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '12px',
          color: '#5C6B5C',
          margin: '0 0 12px 0',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> 5 Days
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={12} /> Max 15
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={12} fill="#C8A951" color="#C8A951" /> 4.8
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '8px',
          borderTop: '1px solid #E3DDCB',
          paddingTop: '12px',
        }}>
          <span style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#2F5233',
          }}>
            ₹24,999
          </span>
          <span style={{
            fontSize: '13px',
            color: '#5C6B5C',
            textDecoration: 'line-through',
          }}>
            ₹32,999
          </span>
          <span style={{
            marginLeft: 'auto',
            fontSize: '11px',
            color: '#5C6B5C',
          }}>
            /person
          </span>
        </div>
      </div>
    </motion.div>
  )
}

/* ============================================
   FULL PREVIEW
   ============================================ */
export default function DesignSystemPreview() {
  return (
    <div style={{
      fontFamily: 'Inter, system-ui, sans-serif',
      background: '#F5F1E8',
      minHeight: '100vh',
      padding: '48px',
    }}>
      <h2 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: '24px',
        color: '#1F2A1F',
        marginBottom: '32px',
      }}>
        Design System Preview
      </h2>

      <section style={{ marginBottom: '48px' }}>
        <p style={{ fontSize: '14px', color: '#5C6B5C', marginBottom: '16px', fontWeight: '500' }}>
          Buttons
        </p>
        <PreviewButton />
      </section>

      <section style={{ marginBottom: '48px' }}>
        <p style={{ fontSize: '14px', color: '#5C6B5C', marginBottom: '16px', fontWeight: '500' }}>
          Typography
        </p>
        <PreviewTypography />
      </section>

      <section>
        <p style={{ fontSize: '14px', color: '#5C6B5C', marginBottom: '16px', fontWeight: '500' }}>
          Package Card
        </p>
        <PreviewCard />
      </section>
    </div>
  )
}
