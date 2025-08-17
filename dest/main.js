/////////////////////////// SCROLL ///////////////////////////////
$(document).ready(function () {
  let header = $('.header'),
    btnMenu = $('.header__btnmenu'),
    mobile,
    tablet,
    screen = {
      mobile: 767,
      tablet: 991,
      desktop: 1199,
    };

  gsap.registerPlugin(ScrollTrigger);
  gsap.registerPlugin(SplitText);

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
  function smoothLenis(){
    const lenis = new Lenis({
      smooth: true,
      autoRaf: false,
      lerp:0.1
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000); 
    });

    // Disable lag smoothing in GSAP to prevent any delay in scroll animations
    gsap.ticker.lagSmoothing(0);
  }

   // Background Squares
  function bgSquares() {
      const direction = 'right'; // 'right', 'left', 'up', 'down', or 'diagonal'
    const speed = 0.5;
    const borderColor = '#333';
    const squareSize = 40;
    const hoverFillColor = '#11d0f2';

    const canvas = document.createElement('canvas');
    canvas.className = 'squares-canvas';
    document.getElementById('bg-squares-canvas').appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let requestRef = null;
    let numSquaresX, numSquaresY;
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
  function bgSilk () {
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
        color: '#7B7481',
        noiseIntensity: 1.5,
        rotation: 0,
      },
      blue: {
        speed: 1,
        scale: 1,
        color: '#11d0f2',
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

    renderShape(configs.grey, 'silk-grey');
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
  };

  // Scroll Cards
  function scrollPrjCards() {
    const cards = document.querySelectorAll('.homepage .projects .projects__list-card');
    const container = document.querySelector('.homepage .projects .projects__list');
    const horizontal = document.getElementById('prj-list-track');

    const cardWidth = window.innerWidth;
    const gap = 0;
    const totalWidth = (cardWidth + gap) * cards.length - gap;
    const viewportWidth = window.innerWidth;
    const scrollDistance = Math.max(0, totalWidth - viewportWidth);

    if (!horizontal || !container) {
      console.error('Horizontal track or container not found.');
      return;
    }


    // Add performance hints
    horizontal.style.willChange = 'transform';


    // Create the horizontal scroll timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: () => `+=${scrollDistance}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        markers: true, // Remove in production
        onUpdate: (self) => {
          const progress = self.progress;
          // Optional: Log scroll progress
          if (Math.round(progress * 100) % 20 === 0) {
            console.log('Scroll progress:', Math.round(progress * 100) + '%');
          }
        },
      },
    });

    // Animate the horizontal movement
    tl.to(horizontal, {
      x: -scrollDistance,
      ease: 'none',
      duration: 1,
      force3D: true,
    }, 0);

    // Image parallax animations

    // Card scale and reveal animation with better effects
     tl.fromTo(
      cards,
      {
        scale: 0.9,
        clipPath: 'inset(30% 30% 30% 30%)',
      },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        scale: 1,
        ease: 'none',
        duration: 0.3,
        force3D: true,
        scrollTrigger: {
          trigger: container,
          start: 'start start+=30%',
          end: 'end end',
          scrub: 1,
          invalidateOnRefresh: true,
        },
      },
    );

    // Add container-level effects
    // tl.to(container, {
    //   filter: 'hue-rotate(5deg) saturate(1.05)',
    //   duration: 1,
    //   ease: 'none',
    // }, 0);


    // Optimized resize handler
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 250);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    window.cleanupScrollCards = function () {
      window.removeEventListener('resize', handleResize);
      horizontal.style.willChange = 'auto';
      cardsImgs.forEach(img => {
        img.style.willChange = 'auto';
      });
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === container) {
          trigger.kill();
        }
      });
    };
  };

  // Projects animation
  function prjAnimation(){
      const subTitles = document.querySelectorAll('.homepage .projects .projects__list-card .content .sub-title');
      const titles = document.querySelectorAll('.homepage .projects .projects__list-card .content .title');
      const descs = document.querySelectorAll('.homepage .projects .projects__list-card .content .desc');
      const cards = document.querySelectorAll('.homepage .projects .projects__list-card');

      if (!titles.length || !cards.length) {
        console.warn('Project animation: No titles or cards found');
        return;
      }

      // Animate each title individually
      titles.forEach((title, index) => {
        const card = cards[index];
        if (!card) return;


        // Split text for this specific title
        const splitTitle = new SplitText(title, {
          // type: "lines, words",
          // linesClass: "line-overflow"
            type: "lines, words",
            mask: "lines",
            autoSplit: true,
        });

        // Set initial state
        gsap.set(splitTitle.words, {
          y: 100,
          opacity: 0
        });

        // Create ScrollTrigger for this specific card
        ScrollTrigger.create({
          trigger: card,
          start: "left 70%",
          end: "right 30%",
          horizontal: true,  
          // scrub: 1,
          markers:true,
          invalidateOnRefresh: true,
          immediateRender:true,

          onEnter: () => {
            gsap.to(splitTitle.words, {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.03,
              ease: "power2.out",
            });
          },
          onLeave: () => {
            gsap.to(splitTitle.words, {
              y: -50,
              opacity: 0,
              duration: 0.5,
              stagger: 0.02,
              ease: "power2.in"
            });
          },
          onEnterBack: () => {
            gsap.to(splitTitle.words, {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.03,
              ease: "power2.out"
            });
          }
        });
      });

      // // Animate subtitles and descriptions
      // subTitles.forEach((subTitle, index) => {
      //   const card = cards[index];
      //   if (!card) return;

      //   ScrollTrigger.create({
      //     trigger: card,
      //     start: "left 70%",
      //     end: "right 30%",
      //     horizontal: true,
      //     scrub: false,
      //     invalidateOnRefresh: true,
      //     onEnter: () => {
      //       gsap.from(subTitle, {
      //         y: 30,
      //         opacity: 0,
      //         duration: 0.6,
      //         delay: 0.2,
      //         ease: "power2.out"
      //       });
      //     }
      //   });
      // });

      // descs.forEach((desc, index) => {
      //   const card = cards[index];
      //   if (!card) return;

      //   ScrollTrigger.create({
      //     trigger: card,
      //     start: "left 60%",
      //     end: "right 40%",
      //     horizontal: true,
      //     scrub: false,
      //     invalidateOnRefresh: true,
      //     onEnter: () => {
      //       gsap.from(desc, {
      //         y: 20,
      //         opacity: 0,
      //         duration: 0.8,
      //         delay: 0.4,
      //         ease: "power2.out"
      //       });
      //     }
      //   });
      // });

      // Cleanup function
      window.cleanupPrjAnimation = function() {
        ScrollTrigger.getAll().forEach(trigger => {
          if (trigger.trigger && cards.includes(trigger.trigger)) {
            trigger.kill();
          }
        });
      };
  }



    mobileDetect();
     smoothLenis();
     bgSquares();
     bgSilk();
     scrollPrjCards();
     prjAnimation()

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
    if (window.cleanupScrollCards) window.cleanupScrollCards();
    if (window.cleanupPrjAnimation) window.cleanupPrjAnimation();
  });
});



