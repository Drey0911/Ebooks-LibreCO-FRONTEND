import { BookOpen } from 'lucide-react';
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision mediump float;
uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform float uDensity;
uniform float uHueShift;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform float uTwinkleIntensity;
varying vec2 vUv;

#define NUM_LAYER 3.0
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.04 * uGlowIntensity) / d;
  
  // Rayos de luz sutiles
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity * 0.5;
  
  // Rayos en diagonal
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.2 * flare * uGlowIntensity;
  
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5; 
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      
      // Más estrellas visibles
      if (size < 0.3) continue;
      
      // Flare para estrellas grandes
      float flareSize = smoothstep(0.85, 1.0, size);

      // Colores variados: azules, naranjas, blancos
      float colorType = Hash21(si + 10.0);
      vec3 base;
      
      if (colorType < 0.3) {
        // Estrellas naranjas/rojas (30%)
        float warmth = 0.5 + Hash21(si + 1.0) * 0.5;
        base = vec3(1.0, 0.4 + warmth * 0.4, 0.1 + warmth * 0.2);
      } else if (colorType < 0.6) {
        // Estrellas azules/púrpuras (30%)
        float coolness = 0.5 + Hash21(si + 2.0) * 0.5;
        base = vec3(0.3 + coolness * 0.3, 0.4 + coolness * 0.3, 1.0);
      } else {
        // Estrellas blancas/amarillentas (40%)
        float brightness = 0.7 + Hash21(si + 3.0) * 0.3;
        base = vec3(brightness, brightness * 0.95, brightness * 0.9);
      }
      
      // Aplicar tinte de hue shift
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 offset = vec2(float(x), float(y));
      float star = Star(gv - offset, flareSize);
      
      // Twinkle
      float twinkle = trisn(uTime * 0.8 + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;
      
      col += star * size * base;
    }
  }
  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec3 col = vec3(0.0);
  
  // Múltiples capas de profundidad
  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i);
    float scale = mix(18.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.85, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }
  
  // Nebulosa sutil de fondo
  vec2 nebulaUV = uv * 2.0;
  float nebula = 0.0;
  nebula += sin(nebulaUV.x * 2.0 + uTime * 0.1) * 0.5 + 0.5;
  nebula += cos(nebulaUV.y * 2.0 + uTime * 0.15) * 0.5 + 0.5;
  nebula *= 0.02;
  
  vec3 nebulaColor = vec3(0.2, 0.1, 0.3) * nebula;
  col += nebulaColor;

  gl_FragColor = vec4(col, 1.0);
}
`;

function Galaxy({
  focal = [0.5, 0.5],
  density = 1,
  hueShift = 140,
  glowIntensity = 0.3,
  saturation = 0.0,
  twinkleIntensity = 0.3,
}) {
  const ctnDom = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    if (!ctnDom.current) return;
    const ctn = ctnDom.current;
    const renderer = new Renderer({
      alpha: false,
      premultipliedAlpha: false,
      antialias: false,
      powerPreference: "low-power"
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 1);

    let program;

    function resize() {
      const scale = 0.5;
      renderer.setSize(ctn.offsetWidth * scale, ctn.offsetHeight * scale);
      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';
      if (program) {
        program.uniforms.uResolution.value = new Color(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height
        );
      }
    }
    window.addEventListener('resize', resize, false);
    resize();

    const geometry = new Triangle(gl);
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
        },
        uFocal: { value: new Float32Array(focal) },
        uDensity: { value: density },
        uHueShift: { value: hueShift },
        uGlowIntensity: { value: glowIntensity },
        uSaturation: { value: saturation },
        uTwinkleIntensity: { value: twinkleIntensity }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    let lastTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;

    function update(t) {
      animationFrameId.current = requestAnimationFrame(update);
      
      const deltaTime = t - lastTime;
      if (deltaTime < frameInterval) return;
      
      lastTime = t - (deltaTime % frameInterval);
      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene: mesh });
    }
    
    animationFrameId.current = requestAnimationFrame(update);
    ctn.appendChild(gl.canvas);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', resize);
      if (ctn.contains(gl.canvas)) {
        ctn.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [focal, density, hueShift, glowIntensity, saturation, twinkleIntensity]);

  return (
    <div ref={ctnDom} className="w-full h-full absolute inset-0">
      <style jsx>{`
        canvas {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
          image-rendering: auto;
        }
      `}</style>
    </div>
  );
}

const Hero = () => {
  const handleScrollTo = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="inicio" className="relative overflow-hidden w-full min-h-[600px] lg:min-h-[700px]">
      {/* Fondo de Galaxia */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#2a2f4a]">
        <Galaxy 
          density={0.8}
          glowIntensity={0.5}
          saturation={0.7}
          hueShift={220}
          twinkleIntensity={0.6}
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"></div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
          {/* Contenido de texto */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Viajemos juntos hasta el planeta de los 
              <span className="text-[#F54927]"> E-Books</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed drop-shadow-md">
              Miles de libros digitales esperando por ti, de todas las categorias y de los mas actuales. Lee donde quieras, cuando quieras. 
              Tu biblioteca personal en la nube.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                className="px-6 sm:px-8 py-3 sm:py-4 bg-[#F54927] text-white font-semibold rounded-xl hover:bg-[#e04123] transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                onClick={() => handleScrollTo('catalogo')}
              >
                Explorar Catálogo
              </button>
              <button
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/30 hover:border-[#F54927] hover:bg-[#F54927]/20 transition-all duration-200"
                onClick={() => handleScrollTo('destacados')}
              >
                Ver Populares
              </button>
            </div>
          </div>
          
          {/* Planeta flotante */}
          <div className="relative order-1 lg:order-2 flex justify-center items-center min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
            <div className="relative w-full max-w-[280px] sm:max-w-[350px] lg:max-w-[450px]">
              {/* Efecto de brillo detrás del planeta */}
              <div className="absolute inset-0 bg-[#F54927]/20 rounded-full blur-3xl animate-pulse"></div>
              
              {/* Planeta con animación */}
              <div className="relative animate-float">
                <img 
                  src="/assets/img/planetEbook.png"
                  alt="Planeta eBook"
                  className="w-full h-auto drop-shadow-2xl"
                />
                
                {/* Anillos decorativos alrededor */}
                <div className="absolute inset-0 animate-spin-slow opacity-30">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-2 border-[#F54927] rounded-full"></div>
                </div>
                <div className="absolute inset-0 animate-spin-slower opacity-20">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border-2 border-orange-400 rounded-full"></div>
                </div>
              </div>

              {/* Iconos de libros flotantes alrededor */}
              <div className="absolute top-0 left-0 animate-float-delayed opacity-80">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F54927] rounded-lg flex items-center justify-center shadow-lg">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="absolute top-1/4 right-0 animate-float opacity-80">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="absolute bottom-1/4 left-0 animate-float-delayed opacity-80">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F54927] rounded-lg flex items-center justify-center shadow-lg">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;