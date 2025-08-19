/////////////////////////// SCROLL ///////////////////////////////
$(document).ready(async function () {
  let lenis,
    mobile,
    tablet,
    screen = {
      mobile: 767,
      tablet: 991,
      desktop: 1199,
    };

  gsap.registerPlugin(ScrollTrigger);
  gsap.registerPlugin(SplitText);
  gsap.registerPlugin(DrawSVGPlugin);

  // DETECT DEVICE
  function mobileDetect() {
    let md = new MobileDetect(window.navigator.userAgent);
    if (md.mobile() != null || md.tablet() != null) {
      mobile = true;
      tablet = true;
    } else {
      mobile = false;
      tablet = false;
    }
  }

  // Scroll Smooth Lenis
  function smoothLenis() {
    lenis = new Lenis({
      smooth: true,
      autoRaf: true,
      lerp: 0.5,
      smoothWheel: true,
      duration: 1.5,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // Disable lag smoothing in GSAP to prevent any delay in scroll animations
    gsap.ticker.lagSmoothing(0);
  }

  // View Contact
  function viewContact() {
    const footer = document.getElementById('footer');
    const contact = document.querySelector('.header .nav .contact');
    contact.addEventListener('click', (e) => {
      e.preventDefault();
      // footer.scrollIntoView({ behavior: 'smooth' });
      lenis.scrollTo(footer, {});
    });
  }

  // Background Squares
  function bgSquares() {
    const direction = 'right'; // 'right', 'left', 'up', 'down', or 'diagonal'
    const speed = 0.5;
    const borderColor = '#ecebebff';
    const squareSize = 40;
    const hoverFillColor = '#11d0f2';

    const canvas = document.createElement('canvas');
    canvas.className = 'squares-canvas';
    document.getElementById('bg-squares-canvas').appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let requestRef = null;
    let gridOffset = { x: 0, y: 0 };
    let hoveredSquare = null;
    let isVisible = true;

    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      numSquaresX = Math.ceil(canvas.width / squareSize) + 1;
      numSquaresY = Math.ceil(canvas.height / squareSize) + 1;
    }
    function drawGrid() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const startX = Math.floor(gridOffset.x / squareSize) * squareSize;
      const startY = Math.floor(gridOffset.y / squareSize) * squareSize;

      for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
        for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
          const squareX = x - (gridOffset.x % squareSize);
          const squareY = y - (gridOffset.y % squareSize);

          if (
            hoveredSquare &&
            Math.floor((x - startX) / squareSize) === hoveredSquare.x &&
            Math.floor((y - startY) / squareSize) === hoveredSquare.y
          ) {
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(squareX, squareY, squareSize, squareSize);
          }

          ctx.strokeStyle = borderColor;
          ctx.strokeRect(squareX, squareY, squareSize, squareSize);
        }
      }

      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2,
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    function updateAnimation() {
      // Only animate if visible
      if (!isVisible) {
        requestRef = requestAnimationFrame(updateAnimation);
        return;
      }

      const effectiveSpeed = Math.max(speed, 0.1);

      switch (direction) {
        case 'right':
          gridOffset.x = (gridOffset.x - effectiveSpeed + squareSize) % squareSize;
          break;
        case 'left':
          gridOffset.x = (gridOffset.x + effectiveSpeed + squareSize) % squareSize;
          break;
        case 'up':
          gridOffset.y = (gridOffset.y + effectiveSpeed + squareSize) % squareSize;
          break;
        case 'down':
          gridOffset.y = (gridOffset.y - effectiveSpeed + squareSize) % squareSize;
          break;
        case 'diagonal':
          gridOffset.x = (gridOffset.x - effectiveSpeed + squareSize) % squareSize;
          gridOffset.y = (gridOffset.y - effectiveSpeed + squareSize) % squareSize;
          break;
      }

      drawGrid();
      requestRef = requestAnimationFrame(updateAnimation);
    }

    window.addEventListener('resize', resizeCanvas);

    resizeCanvas();
    requestRef = requestAnimationFrame(updateAnimation);

    window.cleanupSquares = function () {
      if (requestRef) {
        cancelAnimationFrame(requestRef);
      }
      window.removeEventListener('resize', resizeCanvas);
      canvas.remove();
    };
  }

  // Background Silk
  function bgSilk() {
    const hexToNormalizedRGB = (hex) => {
      hex = hex.replace('#', '');
      return [
        parseInt(hex.slice(0, 2), 16) / 255,
        parseInt(hex.slice(2, 4), 16) / 255,
        parseInt(hex.slice(4, 6), 16) / 255,
      ];
    };
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        vPosition = position;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const fragmentShader = `
        varying vec2 vUv;
        varying vec3 vPosition;

        uniform float uTime;
        uniform vec3  uColor;
        uniform float uSpeed;
        uniform float uScale;
        uniform float uRotation;
        uniform float uNoiseIntensity;

        const float e = 2.71828182845904523536;

        float noise(vec2 texCoord) {
          float G = e;
          vec2  r = (G * sin(G * texCoord));
          return fract(r.x * r.y * (1.0 + texCoord.x));
        }

        vec2 rotateUvs(vec2 uv, float angle) {
          float c = cos(angle);
          float s = sin(angle);
          mat2  rot = mat2(c, -s, s, c);
          return rot * uv;
        }

        void main() {
          float rnd        = noise(gl_FragCoord.xy);
          vec2  uv         = rotateUvs(vUv * uScale, uRotation);
          vec2  tex        = uv * uScale;
          float tOffset    = uSpeed * uTime;

          tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

          float pattern = 0.6 +
                          0.4 * sin(5.0 * (tex.x + tex.y +
                                          cos(3.0 * tex.x + 5.0 * tex.y) +
                                          0.02 * tOffset) +
                                  sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

          vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
          col.a = 1.0;
          gl_FragColor = col;
        }
    `;

    const renderers = [];
    const scenes = [];
    let isVisible = true;

    // === CONFIGURABLE UNIFORMS ===
    const configs = {
      grey: {
        speed: 1,
        scale: 1,
        color: '#E1DBFD',
        noiseIntensity: 1.5,
        rotation: 0,
      },
      blue: {
        speed: 1,
        scale: 1,
        color: '#90C3CD',
        noiseIntensity: 6,
        rotation: 1,
      },
    };

    const renderShape = (cfgs, parentId) => {
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 1;

      const renderer = new THREE.WebGLRenderer({
        antialias: false,
        powerPreference: 'high-performance',
      });
      renderer.setSize(window.innerWidth, window.innerHeight);

      const ele = document.getElementById(parentId);
      if (!ele) return; // Safety check
      ele.appendChild(renderer.domElement);

      // Convert color to normalized RGB
      const rgbColor = hexToNormalizedRGB(cfgs.color);

      // Shader material
      const uniforms = {
        uSpeed: { value: cfgs.speed },
        uScale: { value: cfgs.scale },
        uNoiseIntensity: { value: cfgs.noiseIntensity },
        uColor: { value: new THREE.Color(...rgbColor) },
        uRotation: { value: cfgs.rotation },
        uTime: { value: 0 },
      };

      const geometry = new THREE.PlaneGeometry(2, 2);
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Store for cleanup
      scenes.push(scene);
      renderers.push(renderer);

      // Optimized resize handler
      let resizeTimeout;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          renderer.setSize(window.innerWidth, window.innerHeight);
        }, 100);
      };

      window.addEventListener('resize', handleResize);

      // Animation loop
      let clock = new THREE.Clock();
      let animationId;

      function animate() {
        animationId = requestAnimationFrame(animate);

        // Only render if visible
        if (isVisible) {
          uniforms.uTime.value += clock.getDelta();
          renderer.render(scene, camera);
        }
      }

      animate();
    };

    // Visibility API
    function handleVisibilityChange() {
      isVisible = !document.hidden;
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    renderShape(configs.blue, 'silk-blue');

    // Cleanup function
    window.cleanupSilk = function () {
      scenes.forEach((scene) => {
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) object.material.dispose();
        });
      });

      renderers.forEach((renderer) => {
        renderer.dispose();
      });

      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }

  // Explore cards
  function exploreCards() {
    const explore = document.querySelector('.homepage .hero .explore');
    const cards = document.querySelectorAll('.homepage .explore .cards .cards__item');

    const centerCard = cards[2];

    if (cards.length === 0) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: explore,
        start: 'center bottom',
        end: 'bottom top',
        scrub: 1,
        markers: false,
      },
    });

    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const centerRect = centerCard.getBoundingClientRect();
      const centerX = centerRect.left + centerRect.width / 2;
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const moveDistance = centerX - cardCenterX;

      tl.to(
        card,
        {
          x: moveDistance,
          rotation: 0,
          scale: 0.8,
          y: 200,
          opacity: 0,
          duration: 1,
          ease: 'power2.inOut',
        },
        0,
      );
    });
  }

  // Scroll Cards
  function prjAnimation() {
    const cards = document.querySelectorAll('.homepage .projects .projects__list-card');
    const container = document.querySelector('.homepage .projects .projects__list');
    const horizontal = document.getElementById('prj-list-track');

    const cardWidth = window.innerWidth;
    const gap = 0;
    const totalWidth = (cardWidth + gap) * cards.length - gap;
    const viewportWidth = window.innerWidth;
    const scrollDistance = Math.max(0, totalWidth - viewportWidth);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: () => `+=${scrollDistance}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
        },
      },
    });

    function scrollHorizontal() {
      horizontal.style.willChange = 'transform';
      tl.to(
        horizontal,
        {
          x: -scrollDistance,
          ease: 'none',
          duration: 1,
          force3D: true,
        },
        0,
      );

      tl.fromTo(
        cards,
        {
          clipPath: 'inset(50% 50% 50% 50%)',
        },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          duration: 0.3,
          force3D: true,
          // rotate: (i) => i === 0 ? 0 : rotates[i],
          scrollTrigger: {
            trigger: container,
            start: 'start start+=30%',
            end: 'end end',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        },
      );
    }

    function drawSVG() {
      const rootLine = document.querySelector('.projects .line .line__path.root');
      const subLine1 = document.querySelector('.projects .line .line__path.sub__1');
      const subLine2 = document.querySelector('.projects .line .line__path.sub__2');
      const subLine3 = document.querySelector('.projects .line .line__path.sub__3');
      const subLine4 = document.querySelector('.projects .line .line__path.sub__4');

      gsap.fromTo(
        subLine4,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: subLine4,
            start: 'start start+=30%',
            end: 'end end',
            scrub: 1,
          },
        },
      );

      const createDraw = (ele, duration = 1) => {
        gsap.set(ele, {
          drawSVG: '0%',
        });
        tl.to(
          ele,
          {
            drawSVG: '0% 100%',
            ease: 'none',
            duration: duration,
          },
          0,
        );
      };

      createDraw(rootLine);
      createDraw(subLine1, 1.05);
      createDraw(subLine2, 1.1);
      createDraw(subLine3, 1.15);
    }

    scrollHorizontal();
    drawSVG();

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 250);
    };
    window.addEventListener('resize', handleResize);

    window.cleanupPrjAnimation = function () {
      window.removeEventListener('resize', handleResize);
      horizontal.style.willChange = 'auto';
      cardsImgs.forEach((img) => {
        img.style.willChange = 'auto';
      });
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === container) {
          trigger.kill();
        }
      });
    };
  }

  // Skills Cards
  function skillsCards() {
    const skills = document.querySelector('.homepage .skills');
    const cards = document.querySelectorAll('.homepage .skills .cards .cards__item');

    const centerCard = cards[2];

    if (cards.length === 0) return;

    const start = mobile || tablet ? 'center bottom+=80%' : 'center bottom+=45%';

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: skills,
        start: start,
        end: 'bottom bottom',
        scrub: 1,
        markers: false,
      },
    });

    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const centerRect = centerCard.getBoundingClientRect();
      const centerX = centerRect.left + centerRect.width / 2;
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const moveDistance = centerX - cardCenterX;

      const rotates = [16, 8, 0, -8, -16];
      const xDistances = [6, 3, 0, -3, -6];

      tl.set(
        card,
        {
          x: moveDistance,
          rotation: 0,
          scale: 0.8,
          y: -50,
          opacity: 0.3,
          ease: 'power2.inOut',
        },
        0,
      );

      if (mobile || tablet) {
        tl.to(
          card,
          {
            scale: 1,
            y: 250 * index + 12,
            opacity: 1,
            duration: 1,
            ease: 'power2.inOut',
          },
          0,
        );
      } else {
        tl.to(
          card,
          {
            x: xDistances[index],
            rotation: rotates[index],
            scale: 1,
            y: 100,
            opacity: 1,
            duration: 1,
            ease: 'power2.inOut',
          },
          0,
        );
      }
    });
  }

  // Hover fixed
  function hoverFixed() {
    let hoverFixed = $('.hover-fixed');

    hoverFixed.mouseleave(function (e) {
      gsap.to($(this), 0.3, { x: 0, y: 0 });
    });
    hoverFixed.mousemove(function (e) {
      followParallaxMouse(e, $(this));
    });

    function followParallaxMouse(e, target) {
      parallaxMouse(e, target, 80);
    }

    function parallaxMouse(e, target, movement) {
      let $this = target;
      let relX = e.pageX - $this.offset().left;
      let relY = e.pageY - $this.offset().top;
      gsap.to(target, 0.3, {
        x: ((relX - $this.width() / 2) / $this.width()) * movement,
        y: ((relY - $this.height() / 2) / $this.height()) * movement,
      });
    }
  }

  // Parallax stories
  function parallaxStories() {
    const storyItems = gsap.utils.toArray('.stories__list-item');

    storyItems.forEach((item, index) => {
      const bg = item.querySelector('.bg');
      const img = bg.querySelector('img');

      gsap.fromTo(
        img,
        {
          yPercent: -20,
        },
        {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
            markers: false,
          },
        },
      );
    });
  }

  //  Kimfund, ITSM, Sakura, JobsOnDemand, Bambuup

  mobileDetect();
  viewContact();
  await smoothLenis();
  bgSquares();
  bgSilk();
  prjAnimation();
  exploreCards();
  skillsCards();
  hoverFixed();
  parallaxStories();

  // Init
  function init() {
    $('body')
      .imagesLoaded()
      .progress({ background: true }, function (instance, image) {})
      .always(function (instance) {
        // setTimeout(() => {
        //     $('.loading').addClass('--hide')
        // }, 150)
      })
      .fail(function () {
        // console.log('all images loaded, at least one is broken');
      })
      .done(function (instance) {
        // console.log('all images successfully loaded');
      });
  }
  init();

  // Global cleanup function for page unload
  window.addEventListener('beforeunload', function () {
    if (window.cleanupSquares) window.cleanupSquares();
    if (window.cleanupSilk) window.cleanupSilk();
    if (window.cleanupPrjAnimation) window.cleanupPrjAnimation();
  });
});
