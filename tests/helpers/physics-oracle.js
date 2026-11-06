/**
 * tests/helpers/physics-oracle.js
 * Mathematical reference oracle for physics, affine deformation, scroll choreography, and spotlight coordinates.
 */

class PhysicsOracle {
  /**
   * Calculates particle velocity update with inertia and friction.
   */
  static updateVelocity(currentVelocity, targetVelocity, lerpFactor = 0.08, friction = 0.95) {
    const updated = currentVelocity + (targetVelocity - currentVelocity) * lerpFactor;
    return updated * friction;
  }

  /**
   * Calculates scroll phase based on scroll percentage [0.0, 1.0].
   */
  static getScrollPhase(scrollPercent) {
    const p = Math.max(0, Math.min(1, scrollPercent));
    if (p < 0.25) {
      return { phase: 1, name: 'Typographic Awakening', progress: Math.min(1, p / 0.25) };
    } else if (p < 0.55) {
      return { phase: 2, name: 'Roadone HD55 Perspective Morph', progress: Math.min(1, (p - 0.25) / 0.30) };
    } else if (p < 0.80) {
      return { phase: 3, name: 'Telemetry Hotspots & Scanning', progress: Math.min(1, (p - 0.55) / 0.25) };
    } else {
      const prog = (p - 0.80) / 0.20;
      return { phase: 4, name: 'Landing into WhatsApp Quote Bar', progress: prog >= 0.999999 ? 1.0 : prog };
    }
  }

  /**
   * Phase 1 inverse blur calculation.
   * Blur transitions from 14px at p=0 to 0px at p=1.
   */
  static getPhase1Blur(phase1Progress) {
    const clamped = Math.max(0, Math.min(1, phase1Progress));
    return 14 * (1 - clamped);
  }

  /**
   * Phase 2 dual-WebP crossfade opacities.
   * Frente transitions from 1.0 to 0.0, 45 transitions from 0.0 to 1.0.
   */
  static getPhase2Opacities(phase2Progress) {
    const clamped = Math.max(0, Math.min(1, phase2Progress));
    return {
      frenteOpacity: 1 - clamped,
      angle45Opacity: clamped
    };
  }

  /**
   * Phase 2 contact shadow affine matrix deformation.
   * Model: Matrix deformation matching tire perspective tilt angle (0 to 45 deg).
   */
  static getShadowAffineMatrix(phase2Progress) {
    const p = Math.max(0, Math.min(1, phase2Progress));
    const angleRad = (p * 45 * Math.PI) / 180;
    const scaleX = 1 + 0.15 * Math.sin(angleRad);
    const rawSkewX = -0.35 * Math.sin(angleRad);
    const skewX = Math.abs(rawSkewX) < 1e-6 ? 0 : rawSkewX;
    const scaleY = 1 - 0.25 * Math.sin(angleRad);
    return {
      a: scaleX,
      b: 0,
      c: skewX,
      d: scaleY,
      tx: 20 * p,
      ty: 10 * p,
      cssString: `matrix(${scaleX.toFixed(4)}, 0, ${skewX.toFixed(4)}, ${scaleY.toFixed(4)}, ${(20 * p).toFixed(2)}, ${(10 * p).toFixed(2)})`
    };
  }

  /**
   * Catalog card spotlight coordinate calculations.
   */
  static calculateSpotlightCoords(clientX, clientY, cardBoundingBox) {
    const mouseX = clientX - cardBoundingBox.left;
    const mouseY = clientY - cardBoundingBox.top;
    const isInside = mouseX >= 0 && mouseX <= cardBoundingBox.width && mouseY >= 0 && mouseY <= cardBoundingBox.height;
    return {
      mouseX,
      mouseY,
      isInside,
      cssVarX: `${Math.round(mouseX)}px`,
      cssVarY: `${Math.round(mouseY)}px`
    };
  }

  /**
   * Builds and validates WhatsApp quote URL.
   */
  static buildWhatsAppQuoteURL(vehicle, size, brand, phone = '59172960725') {
    const text = `Hola, quisiera consultar disponibilidad y precio para ${vehicle}, medida ${size}, marca ${brand}.`;
    const encoded = encodeURIComponent(text);
    return `https://wa.me/${phone}?text=${encoded}`;
  }
}

module.exports = PhysicsOracle;
