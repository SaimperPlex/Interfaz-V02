import React, { useState, useRef, useEffect } from 'react';
import { Home, Download, RotateCcw, Undo2, Redo2, Trash2, RotateCw, ZoomIn, ZoomOut, Sun, Moon, ChevronDown, Image, Type, Shapes, Package, X } from 'lucide-react';

export default function Editor() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [textInput, setTextInput] = useState('');
  const [selectedFont, setSelectedFont] = useState('Roboto');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [dragging, setDragging] = useState(null);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [productDimensions, setProductDimensions] = useState({ width: 0, height: 0 });
  const [pinching, setPinching] = useState(null);
  const elementIdCounter = useRef(0);

  const [eventConfig, setEventConfig] = useState({
    eventName: '',
    editorBackground: null,
    products: [],
    images: [],
    cliparts: [],
    availableFonts: [],
    availableColors: []
  });

  const [loading, setLoading] = useState(true);

  // Lista completa de fuentes de Google (para cargar en el head)
  const GOOGLE_FONTS = [
    { name: 'Roboto', family: 'Roboto, sans-serif', googleName: 'Roboto' },
    { name: 'Montserrat', family: 'Montserrat, sans-serif', googleName: 'Montserrat' },
    { name: 'Poppins', family: 'Poppins, sans-serif', googleName: 'Poppins' },
    { name: 'Raleway', family: 'Raleway, sans-serif', googleName: 'Raleway' },
    { name: 'Inter', family: 'Inter, sans-serif', googleName: 'Inter' },
    { name: 'Playfair Display', family: "'Playfair Display', serif", googleName: 'Playfair+Display' },
    { name: 'Merriweather', family: 'Merriweather, serif', googleName: 'Merriweather' },
    { name: 'Cormorant Garamond', family: "'Cormorant Garamond', serif", googleName: 'Cormorant+Garamond' },
    { name: 'Cinzel', family: 'Cinzel, serif', googleName: 'Cinzel' },
    { name: 'Abril Fatface', family: "'Abril Fatface', serif", googleName: 'Abril+Fatface' },
    { name: 'Dancing Script', family: "'Dancing Script', cursive", googleName: 'Dancing+Script' },
    { name: 'Great Vibes', family: "'Great Vibes', cursive", googleName: 'Great+Vibes' },
    { name: 'Sacramento', family: 'Sacramento, cursive', googleName: 'Sacramento' },
    { name: 'Parisienne', family: 'Parisienne, cursive', googleName: 'Parisienne' },
    { name: 'Tangerine', family: 'Tangerine, cursive', googleName: 'Tangerine' },
    { name: 'Lobster', family: 'Lobster, cursive', googleName: 'Lobster' },
    { name: 'Pacifico', family: 'Pacifico, cursive', googleName: 'Pacifico' },
    { name: 'Bebas Neue', family: "'Bebas Neue', sans-serif", googleName: 'Bebas+Neue' },
    { name: 'Oswald', family: 'Oswald, sans-serif', googleName: 'Oswald' },
    { name: 'Righteous', family: 'Righteous, cursive', googleName: 'Righteous' }
  ];

  // Cargar solo las fuentes configuradas en el Admin Panel
  useEffect(() => {
    if (eventConfig.availableFonts && eventConfig.availableFonts.length > 0) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      const fontFamilies = eventConfig.availableFonts
        .map(font => `family=${font.googleName}:wght@400`)
        .join('&');
      link.href = `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`;
      document.head.appendChild(link);
      
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [eventConfig.availableFonts]);

  useEffect(() => {
    loadEventConfig();
  }, []);

  const loadEventConfig = () => {
    try {
      const savedEventName = localStorage.getItem('event-name');
      const savedWelcomeBg = localStorage.getItem('welcome-bg');
      const savedEditorBg = localStorage.getItem('editor-bg');
      const savedProducts = localStorage.getItem('products');
      const savedImages = localStorage.getItem('images');
      const savedCliparts = localStorage.getItem('cliparts');
      const savedFonts = localStorage.getItem('available-fonts');
      const savedColors = localStorage.getItem('available-colors');

      const data = {
        eventName: savedEventName || '',
        welcomeBackground: savedWelcomeBg || null,
        editorBackground: savedEditorBg || null,
        products: [],
        images: [],
        cliparts: [],
        availableFonts: [],
        availableColors: []
      };

      if (savedProducts) {
        try {
          data.products = JSON.parse(savedProducts);
        } catch (e) {
          console.error('Error al parsear productos:', e);
        }
      }

      if (savedImages) {
        try {
          data.images = JSON.parse(savedImages);
        } catch (e) {
          console.error('Error al parsear imágenes:', e);
        }
      }

      if (savedCliparts) {
        try {
          data.cliparts = JSON.parse(savedCliparts);
        } catch (e) {
          console.error('Error al parsear cliparts:', e);
        }
      }

      // Cargar fuentes disponibles desde localStorage
      if (savedFonts) {
        try {
          data.availableFonts = JSON.parse(savedFonts);
        } catch (e) {
          console.error('Error al parsear fuentes:', e);
          // Fallback a fuentes por defecto si hay error
          data.availableFonts = [
            { name: 'Roboto', family: 'Roboto, sans-serif', googleName: 'Roboto' },
            { name: 'Montserrat', family: 'Montserrat, sans-serif', googleName: 'Montserrat' },
            { name: 'Poppins', family: 'Poppins, sans-serif', googleName: 'Poppins' }
          ];
        }
      } else {
        // Si no hay fuentes guardadas, usar las por defecto
        data.availableFonts = [
          { name: 'Roboto', family: 'Roboto, sans-serif', googleName: 'Roboto' },
          { name: 'Montserrat', family: 'Montserrat, sans-serif', googleName: 'Montserrat' },
          { name: 'Poppins', family: 'Poppins, sans-serif', googleName: 'Poppins' }
        ];
      }

      // Cargar colores disponibles desde localStorage
      if (savedColors) {
        try {
          data.availableColors = JSON.parse(savedColors);
        } catch (e) {
          console.error('Error al parsear colores:', e);
          // Fallback a colores por defecto si hay error
          data.availableColors = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF'];
        }
      } else {
        // Si no hay colores guardados, usar los por defecto
        data.availableColors = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF'];
      }

      setEventConfig(data);
      
      // Establecer la primera fuente disponible como seleccionada
      if (data.availableFonts && data.availableFonts.length > 0) {
        setSelectedFont(data.availableFonts[0].name);
      }
      
      // Establecer el primer color disponible como seleccionado
      if (data.availableColors && data.availableColors.length > 0) {
        setSelectedColor(data.availableColors[0]);
      }
      
      if (data.products && data.products.length > 0) {
        setSelectedProduct(data.products[0]);
        loadProductDimensions(data.products[0]);
      }
      
      console.log('✓ Configuración cargada:', {
        fuentes: data.availableFonts.length,
        colores: data.availableColors.length,
        productos: data.products.length,
        imágenes: data.images.length,
        cliparts: data.cliparts.length
      });
      
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductDimensions = (product) => {
    const img = new window.Image();
    img.onload = () => {
      setProductDimensions({ width: img.width, height: img.height });
      console.log('Dimensiones del producto:', img.width, 'x', img.height);
    };
    img.src = product.image;
  };

  const theme = {
    dark: {
      bg: 'bg-zinc-950',
      bgSecondary: 'bg-zinc-900',
      bgTertiary: 'bg-zinc-800',
      text: 'text-zinc-100',
      textSecondary: 'text-zinc-400',
      textMuted: 'text-zinc-600',
      border: 'border-zinc-800',
      borderHover: 'border-zinc-700',
      hover: 'hover:bg-zinc-800',
      hoverSecondary: 'hover:bg-zinc-700',
      iconColor: 'text-zinc-100',
      panelBg: 'bg-zinc-900/98'
    },
    light: {
      bg: 'bg-slate-50',
      bgSecondary: 'bg-white',
      bgTertiary: 'bg-slate-100',
      text: 'text-slate-900',
      textSecondary: 'text-slate-600',
      textMuted: 'text-slate-400',
      border: 'border-slate-200',
      borderHover: 'border-slate-300',
      hover: 'hover:bg-slate-100',
      hoverSecondary: 'hover:bg-slate-200',
      iconColor: 'text-slate-900',
      panelBg: 'bg-white/98'
    }
  };

  const t = isDarkMode ? theme.dark : theme.light;

  const addToHistory = (newElements) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newElements)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const addTextElement = () => {
    if (!textInput.trim()) return;
    
    // Buscar la fuente en availableFonts
    const fontData = eventConfig.availableFonts.find(f => f.name === selectedFont);
    const fontFamily = fontData ? fontData.family : 'Roboto, sans-serif';
    
    const newElement = {
      id: ++elementIdCounter.current,
      type: 'text',
      content: textInput,
      x: 50,
      y: 50,
      fontSize: 32,
      color: selectedColor,
      fontFamily: fontFamily,
      fontName: selectedFont,
      rotation: 0,
      scale: 1
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
    setTextInput('');
  };

  const addClipartElement = (clipart) => {
    const newElement = {
      id: ++elementIdCounter.current,
      type: 'clipart',
      content: clipart.image,
      x: 50,
      y: 50,
      rotation: 0,
      scale: 1,
      width: 80,
      height: 80
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
  };

  const addImageElement = (image) => {
    const newElement = {
      id: ++elementIdCounter.current,
      type: 'image',
      content: image,
      x: 50,
      y: 50,
      rotation: 0,
      scale: 1,
      width: 100,
      height: 100
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
  };

  const updateElement = (id, updates) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
  };

  const commitUpdate = () => {
    addToHistory(elements);
  };

  const deleteElement = (id) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    addToHistory(newElements);
    setSelectedElement(null);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  const reset = () => {
    setElements([]);
    setHistory([]);
    setHistoryIndex(-1);
    setSelectedElement(null);
  };

  const goHome = () => {
    if (window.confirm('¿Volver a la pantalla de inicio? Se perderán los cambios no guardados.')) {
      window.location.href = '/Interfaz-V02';
    }
  };

  const rotateElement = (degrees) => {
    if (!selectedElement) return;
    const element = elements.find(el => el.id === selectedElement);
    if (element) {
      updateElement(selectedElement, { rotation: (element.rotation + degrees) % 360 });
      commitUpdate();
    }
  };

  const scaleElement = (factor) => {
    if (!selectedElement) return;
    const element = elements.find(el => el.id === selectedElement);
    if (element) {
      const newScale = Math.max(0.5, Math.min(3, element.scale + factor));
      updateElement(selectedElement, { scale: newScale });
      commitUpdate();
    }
  };

  const getDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e, element) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const distance = getDistance(e.touches[0], e.touches[1]);
      setPinching({
        id: element.id,
        startDistance: distance,
        startScale: element.scale,
        startRotation: element.rotation,
        center: {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2
        }
      });
      setSelectedElement(element.id);
    } else if (e.touches.length === 1) {
      handleDragStart(e, element);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinching) {
      e.preventDefault();
      const element = elements.find(el => el.id === pinching.id);
      if (!element) return;

      const distance = getDistance(e.touches[0], e.touches[1]);
      const scale = (distance / pinching.startDistance) * pinching.startScale;
      const newScale = Math.max(0.5, Math.min(3, scale));

      const angle1 = Math.atan2(
        e.touches[1].clientY - e.touches[0].clientY,
        e.touches[1].clientX - e.touches[0].clientX
      );
      const angle2 = Math.atan2(
        pinching.center.y - e.touches[0].clientY,
        pinching.center.x - e.touches[0].clientX
      );
      const rotationDelta = (angle1 - angle2) * (180 / Math.PI);
      const newRotation = (pinching.startRotation + rotationDelta) % 360;

      updateElement(pinching.id, { 
        scale: newScale,
        rotation: newRotation
      });
    } else if (e.touches.length === 1 && dragging) {
      handleDragMove(e);
    }
  };

  const handleTouchEnd = (e) => {
    if (pinching) {
      commitUpdate();
      setPinching(null);
    }
    if (dragging && e.touches.length === 0) {
      handleDragEnd();
    }
  };

  const handleDragStart = (e, element) => {
    e.preventDefault();
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    setDragging({
      id: element.id,
      startX: clientX,
      startY: clientY,
      elementX: element.x,
      elementY: element.y
    });
    setSelectedElement(element.id);
  };

  const handleDragMove = (e) => {
    if (!dragging) return;
    const rect = document.getElementById('editor-area').getBoundingClientRect();
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    const deltaX = ((clientX - dragging.startX) / rect.width) * 100;
    const deltaY = ((clientY - dragging.startY) / rect.height) * 100;
    const newX = Math.max(0, Math.min(100, dragging.elementX + deltaX));
    const newY = Math.max(0, Math.min(100, dragging.elementY + deltaY));
    updateElement(dragging.id, { x: newX, y: newY });
  };

  const handleDragEnd = () => {
    if (dragging) {
      commitUpdate();
      setDragging(null);
    }
  };

  const saveDesign = async () => {
    if (!clientName.trim()) return;

    const canvas = document.createElement('canvas');
    canvas.width = productDimensions.width;
    canvas.height = productDimensions.height;
    const ctx = canvas.getContext('2d');

    if (selectedProduct) {
      const img = new window.Image();
      img.src = selectedProduct.image;
      
      await new Promise((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, productDimensions.width, productDimensions.height);
          resolve();
        };
        img.onerror = () => resolve();
      });
    }

    for (const element of elements) {
      ctx.save();
      const x = (element.x / 100) * productDimensions.width;
      const y = (element.y / 100) * productDimensions.height;
      ctx.translate(x, y);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.scale(element.scale, element.scale);
      
      if (element.type === 'text') {
        const fontData = eventConfig.availableFonts.find(f => f.name === element.fontName);
        const fontFamily = fontData ? fontData.family : element.fontFamily;
        ctx.font = `${element.fontSize}px ${fontFamily}`;
        ctx.fillStyle = element.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(element.content, 0, 0);
      } else if (element.type === 'clipart' || element.type === 'image') {
        const elementImg = new window.Image();
        elementImg.src = element.content;
        await new Promise((resolve) => {
          elementImg.onload = () => {
            ctx.drawImage(elementImg, -element.width/2, -element.height/2, element.width, element.height);
            resolve();
          };
          elementImg.onerror = () => resolve();
        });
      }
      ctx.restore();
    }

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${clientName}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setShowSaveModal(false);
      setShowSuccessModal(true);
      setClientName('');
      setTimeout(() => setShowSuccessModal(false), 2000);
    }, 'image/png');
  };

  const getFontStyle = (fontName) => {
    const font = eventConfig.availableFonts.find(f => f.name === fontName);
    return { fontFamily: font ? font.family : 'Roboto, sans-serif' };
  };

  const getTabIcon = (tab) => {
    switch(tab) {
      case 'productos': return <Package className="w-5 h-5" />;
      case 'cliparts': return <Shapes className="w-5 h-5" />;
      case 'imágenes': return <Image className="w-5 h-5" />;
      case 'elementos': return <Shapes className="w-5 h-5" />;
      case 'texto': return <Type className="w-5 h-5" />;
      default: return null;
    }
  };

  const toggleTab = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  if (loading) {
    return (
      <div className={`w-full h-screen ${t.bg} flex items-center justify-center`}>
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`w-full h-screen ${t.bg} flex flex-col overflow-hidden`}>
      <div 
        id="editor-area"
        className="flex-1 relative overflow-hidden"
        style={{ 
          backgroundImage: eventConfig.editorBackground 
            ? `url(${eventConfig.editorBackground})` 
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          if (e.target.id === 'editor-area' || e.target.classList.contains('absolute')) {
            setSelectedElement(null);
          }
        }}
      >
        {!eventConfig.editorBackground && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: isDarkMode 
                ? 'radial-gradient(circle, rgba(255,255,255,.02) 1px, transparent 1px)'
                : 'radial-gradient(circle, rgba(0,0,0,.02) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
        )}

        {selectedProduct && (
          <img
            src={selectedProduct.image}
            alt={selectedProduct.name}
            className="absolute inset-0 w-full h-full pointer-events-none select-none z-10 object-contain p-4 sm:p-6 md:p-8 lg:p-12"
            draggable="false"
          />
        )}

        {elements.map(element => (
          <div
            key={element.id}
            onMouseDown={(e) => handleDragStart(e, element)}
            onTouchStart={(e) => handleTouchStart(e, element)}
            style={{
              position: 'absolute',
              left: `${element.x}%`,
              top: `${element.y}%`,
              transform: `translate(-50%, -50%) rotate(${element.rotation}deg) scale(${element.scale})`,
              cursor: 'move',
              fontSize: element.type === 'text' ? `${element.fontSize}px` : undefined,
              color: element.color,
              fontFamily: element.fontFamily,
              userSelect: 'none',
              touchAction: 'none',
              border: selectedElement === element.id ? '2px solid #3B82F6' : 'none',
              padding: element.type === 'text' ? '8px' : '0',
              whiteSpace: element.type === 'text' ? 'nowrap' : 'normal',
              borderRadius: '12px',
              background: selectedElement === element.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              zIndex: 15
            }}
          >
            {element.type === 'text' ? (
              <span style={{ 
                fontFamily: element.fontFamily,
                color: element.color,
                fontSize: `${element.fontSize}px`,
                display: 'inline-block'
              }}>
                {element.content}
              </span>
            ) : (
              <img 
                src={element.content} 
                alt="element" 
                style={{ 
                  width: `${element.width}px`, 
                  height: `${element.height}px`, 
                  pointerEvents: 'none',
                  maxWidth: 'none'
                }} 
              />
            )}
          </div>
        ))}

        {selectedElement && (
          <div
            className={`fixed
              left-1/2 transform -translate-x-1/2
              bottom-[calc(64px+40px+env(safe-area-inset-bottom)+6px)]
              sm:bottom-[calc(72px+44px+env(safe-area-inset-bottom)+6px)]
              md:bottom-[calc(80px+48px+env(safe-area-inset-bottom)+6px)]
              ${t.panelBg} backdrop-blur-2xl rounded-full shadow-2xl p-2 flex items-center gap-1.5 sm:gap-2
              border ${t.border} pointer-events-auto z-[90]`}
            role="dialog"
            aria-label="Selected item actions"
          >
            <button onClick={() => rotateElement(-15)} className={`w-9 h-9 sm:w-11 sm:h-11 ${t.bgTertiary} rounded-full flex items-center justify-center ${t.hover} transition-all active:scale-90`}>
              <RotateCcw className={`w-4 h-4 sm:w-5 sm:h-5 ${t.iconColor}`} />
            </button>
            <button onClick={() => rotateElement(15)} className={`w-9 h-9 sm:w-11 sm:h-11 ${t.bgTertiary} rounded-full flex items-center justify-center ${t.hover} transition-all active:scale-90`}>
              <RotateCw className={`w-4 h-4 sm:w-5 sm:h-5 ${t.iconColor}`} />
            </button>
            <button onClick={() => scaleElement(-0.1)} className={`w-9 h-9 sm:w-11 sm:h-11 ${t.bgTertiary} rounded-full flex items-center justify-center ${t.hover} transition-all active:scale-90`}>
              <ZoomOut className={`w-4 h-4 sm:w-5 sm:h-5 ${t.iconColor}`} />
            </button>
            <button onClick={() => scaleElement(0.1)} className={`w-9 h-9 sm:w-11 sm:h-11 ${t.bgTertiary} rounded-full flex items-center justify-center ${t.hover} transition-all active:scale-90`}>
              <ZoomIn className={`w-4 h-4 sm:w-5 sm:h-5 ${t.iconColor}`} />
            </button>

            <div className={`w-px h-6 sm:h-8 ${isDarkMode ? 'bg-zinc-700' : 'bg-slate-300'} mx-1`}></div>

            <button onClick={() => deleteElement(selectedElement)} className="w-9 h-9 sm:w-11 sm:h-11 bg-red-500/90 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-red-600 transition-all active:scale-90">
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Overlay que permite cerrar tocando fuera */}
      {activeTab && (
        <div
          className="fixed inset-0 z-60 bg-transparent"
          onClick={() => setActiveTab(null)}
          aria-hidden="true"
        />
      )}

      {/* BAR HORIZONTAL Pegada al toolbar */}
      <div
        className={`fixed left-0 right-0
          bottom-[calc(104px+env(safe-area-inset-bottom))] 
          sm:bottom-[calc(116px+env(safe-area-inset-bottom))] 
          md:bottom-[calc(128px+env(safe-area-inset-bottom))]
          ${t.panelBg} backdrop-blur-3xl border-t ${t.border}
          transform transition-transform duration-180 ease-out z-70
          ${activeTab ? 'translate-y-0' : 'translate-y-full'}
          pointer-events-auto`}
      >
        {activeTab && (
          <div
            className="mx-auto max-w-7xl px-3 sm:px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center h-12 sm:h-14 md:h-16">
              <div className="flex items-center gap-3 pr-3 sm:pr-4 border-r h-full flex-shrink-0">
                <div className={`${t.iconColor} flex items-center`}>
                  {getTabIcon(activeTab)}
                </div>
                <span className={`hidden sm:inline-block font-semibold ${t.text} capitalize`}>
                  {activeTab}
                </span>
              </div>

              <div className="flex-1 pl-3 sm:pl-4 overflow-x-auto scrollbar-hidden">
                <div className="inline-flex items-center gap-3 py-1">
                  {/* Productos */}
                  {activeTab === 'productos' && (
                    <>
                      {eventConfig.products && eventConfig.products.length > 0 ? (
                        eventConfig.products.map(product => (
                          <button
                            key={product.id}
                            onClick={() => { setSelectedProduct(product); loadProductDimensions(product); setActiveTab(null); }}
                            className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden border-2 ${t.bgTertiary} transition-all 
                              ${selectedProduct?.id === product.id ? 'border-blue-500 scale-95 shadow-lg shadow-blue-500/20' : `${t.border} ${t.borderHover} hover:scale-95 active:scale-90`}`}
                            aria-label={product.name}
                          >
                            <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1 sm:p-2" />
                          </button>
                        ))
                      ) : (
                        <div className={`${t.textMuted} flex items-center gap-3 px-4`}>
                          <Package className={`w-6 h-6 ${t.iconColor} opacity-20`} />
                          <span className="text-sm">No hay productos</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Cliparts */}
                  {activeTab === 'cliparts' && (
                    <>
                      {eventConfig.cliparts && eventConfig.cliparts.length > 0 ? (
                        eventConfig.cliparts.map(c => (
                          <button
                            key={c.id}
                            onClick={() => { addClipartElement(c); setActiveTab(null); }}
                            className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden border-2 ${t.bgTertiary} transition-all 
                              ${t.border} ${t.borderHover} hover:scale-95 active:scale-90 hover:border-blue-500`}
                            aria-label={c.name}
                          >
                            <img src={c.image} alt={c.name} className="w-full h-full object-contain p-1 sm:p-2" />
                          </button>
                        ))
                      ) : (
                        <div className={`${t.textMuted} flex items-center gap-3 px-4`}>
                          <Shapes className={`w-6 h-6 ${t.iconColor} opacity-20`} />
                          <span className="text-sm">No hay cliparts</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Imágenes */}
                  {activeTab === 'imágenes' && (
                    <>
                      {eventConfig.images && eventConfig.images.length > 0 ? (
                        eventConfig.images.map(img => (
                          <button
                            key={img.id}
                            onClick={() => { addImageElement(img.image); setActiveTab(null); }}
                            className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden border-2 ${t.bgTertiary} transition-all 
                              ${t.border} ${t.borderHover} hover:scale-95 active:scale-90 hover:border-blue-500`}
                            aria-label={img.name}
                          >
                            <img src={img.image} alt={img.name} className="w-full h-full object-contain p-1 sm:p-2" />
                          </button>
                        ))
                      ) : (
                        <div className={`${t.textMuted} flex items-center gap-3 px-4`}>
                          <Image className={`w-6 h-6 ${t.iconColor} opacity-20`} />
                          <span className="text-sm">No hay imágenes</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Elementos */}
                  {activeTab === 'elementos' && (
                    <>
                      {elements && elements.length > 0 ? (
                        elements.map(el => (
                          <button
                            key={el.id}
                            onClick={() => { setSelectedElement(el.id); setActiveTab(null); }}
                            className={`flex-shrink-0 w-36 sm:w-44 rounded-2xl ${t.bgTertiary} p-2 sm:p-3 flex items-center justify-between gap-3 border-2 transition-all 
                              ${selectedElement === el.id ? 'border-blue-500 shadow-lg shadow-blue-500/10' : `${t.border} ${t.borderHover} hover:scale-[0.98] active:scale-95`}`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {el.type === 'text' && <Type className={`w-4 h-4 sm:w-5 sm:h-5 ${t.textSecondary}`} />}
                              {el.type === 'clipart' && <Shapes className={`w-4 h-4 sm:w-5 sm:h-5 ${t.textSecondary}`} />}
                              {el.type === 'image' && <Image className={`w-4 h-4 sm:w-5 sm:h-5 ${t.textSecondary}`} />}
                              <span className="truncate text-sm">{el.type === 'text' ? el.content : (el.type === 'clipart' ? 'Clipart' : 'Imagen')}</span>
                            </div>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        ))
                      ) : (
                        <div className={`${t.textMuted} px-4 text-sm`}>No hay elementos</div>
                      )}
                    </>
                  )}

{/* ---------- TEXTO: controles (SOLO aparece si activeTab === 'texto') ---------- */}
{activeTab === 'texto' && (
  <div className="flex items-center gap-3 relative z-[200]">
    {/* --- Botón de selección de fuente --- */}
    <div className="relative">
      <button
        onClick={() => setShowFontDropdown(prev => !prev)}
        className={`${t.bgTertiary} ${t.border} border-2 rounded-2xl px-3 py-2 ${t.text} text-sm flex items-center gap-2 whitespace-nowrap`}
        type="button"
      >
        <span style={getFontStyle(selectedFont)}>{selectedFont}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showFontDropdown ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown flotante (fixed para que no quede recortado) */}
      {showFontDropdown && (
        <div
          className={`fixed ${t.bgSecondary} ${t.border} border-2 rounded-2xl shadow-2xl overflow-hidden z-[99999] min-w-[220px] max-w-[280px] max-h-[300px] overflow-y-auto backdrop-blur-xl`}
          style={{
            /* Ajusta top/left para colocarlo donde quieras; aquí está arriba/izquierda fija */
            top: '20vh',
            left: '50%',
            transform: 'translateX(-50%) translateY(-10px)',
          }}
        >
          {eventConfig.availableFonts && eventConfig.availableFonts.length > 0 ? (
            eventConfig.availableFonts.map(font => (
              <button
                key={font.name}
                onClick={() => {
                  setSelectedFont(font.name);
                  setShowFontDropdown(false);
                }}
                className={`w-full px-4 py-3 text-left ${t.hover} ${t.text} transition-colors ${selectedFont === font.name ? 'bg-blue-500/20' : ''}`}
                style={{ fontFamily: font.family }}
                type="button"
              >
                {font.name}
              </button>
            ))
          ) : (
            <div className={`px-4 py-3 ${t.textMuted} text-sm`}>No hay fuentes disponibles</div>
          )}
        </div>
      )}
    </div>

    {/* --- Paleta de colores --- */}
    <div className="flex items-center gap-1.5 bg-black/20 rounded-2xl p-1.5">
      {eventConfig.availableColors && eventConfig.availableColors.length > 0 ? (
        eventConfig.availableColors.map((color, index) => (
          <button
            key={index}
            onClick={() => setSelectedColor(color)}
            className={`w-8 h-8 rounded-xl transition-all hover:scale-110 ${selectedColor === color ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-900 scale-110' : ''}`}
            style={{ backgroundColor: color }}
            title={color}
            type="button"
          />
        ))
      ) : (
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-8 h-8 rounded-2xl p-0 cursor-pointer"
        />
      )}
    </div>

    {/* --- Input de texto y botón añadir --- */}
    <input
      type="text"
      value={textInput}
      onChange={(e) => setTextInput(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && addTextElement()}
      placeholder="Escribe..."
      className={`min-w-[160px] ${t.bgTertiary} ${t.border} border-2 rounded-2xl px-3 py-2 ${t.text} text-sm`}
    />
    <button
      onClick={addTextElement}
      disabled={!textInput.trim()}
      className="w-8 h-8 bg-blue-500 rounded-xl text-white flex items-center justify-center disabled:opacity-50 hover:bg-blue-600 transition-all active:scale-90"
      type="button"
    >
      +
    </button>
  </div>
)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GRUPO 1 - Dock inferior (Paneles) centrado */}
      <div
        className={`fixed bottom-0 left-0 right-0 ${t.panelBg} backdrop-blur-3xl border-t ${t.border} safe-area-bottom z-50`}
      >
        <div className="flex items-center justify-center px-3 sm:px-6 py-3 sm:py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button 
              onClick={() => toggleTab('productos')}
              className={`w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all active:scale-90 ${
                activeTab === 'productos' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : `${t.bgTertiary} ${t.iconColor} ${t.hover}`
              }`}
            >
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button 
              onClick={() => toggleTab('cliparts')}
              className={`w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all active:scale-90 ${
                activeTab === 'cliparts' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : `${t.bgTertiary} ${t.iconColor} ${t.hover}`
              }`}
            >
              <Shapes className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button 
              onClick={() => toggleTab('imágenes')}
              className={`w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all active:scale-90 ${
                activeTab === 'imágenes' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : `${t.bgTertiary} ${t.iconColor} ${t.hover}`
              }`}
            >
              <Image className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button 
              onClick={() => toggleTab('elementos')}
              className={`w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all active:scale-90 ${
                activeTab === 'elementos' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : `${t.bgTertiary} ${t.iconColor} ${t.hover}`
              }`}
            >
              <Shapes className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button 
              onClick={() => toggleTab('texto')}
              className={`w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all active:scale-90 ${
                activeTab === 'texto' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : `${t.bgTertiary} ${t.iconColor} ${t.hover}`
              }`}
            >
              <Type className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* TOOLBAR GRUPO 2 - Acciones (Guardar, Home, etc.) */}
      <div
        className={`fixed left-0 right-0 
          bottom-[calc(64px+env(safe-area-inset-bottom))] 
          sm:bottom-[calc(72px+env(safe-area-inset-bottom))] 
          md:bottom-[calc(80px+env(safe-area-inset-bottom))]
          ${t.panelBg} backdrop-blur-3xl border-t ${t.border} z-60`}
      >
        <div className="flex items-center justify-center px-3 sm:px-6 py-1 sm:py-1.5 max-w-7xl mx-auto">
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Undo */}
            <button 
              onClick={undo} 
              disabled={historyIndex <= 0}
              className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 ${t.bgTertiary} rounded-xl flex items-center justify-center ${t.hover} disabled:opacity-30 transition-all active:scale-90`}
            >
              <Undo2 className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${t.iconColor}`} />
            </button>

            {/* Redo */}
            <button 
              onClick={redo} 
              disabled={historyIndex >= history.length - 1}
              className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 ${t.bgTertiary} rounded-xl flex items-center justify-center ${t.hover} disabled:opacity-30 transition-all active:scale-90`}
            >
              <Redo2 className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${t.iconColor}`} />
            </button>

            {/* Reset */}
            <button 
              onClick={reset}
              className={`hidden sm:flex w-9 h-9 md:w-10 md:h-10 ${t.bgTertiary} rounded-xl items-center justify-center ${t.hover} transition-all active:scale-90`}
            >
              <RotateCcw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${t.iconColor}`} />
            </button>

            {/* Home */}
            <button 
              onClick={goHome}
              className={`hidden sm:flex w-9 h-9 md:w-10 md:h-10 ${t.bgTertiary} rounded-xl items-center justify-center ${t.hover} transition-all active:scale-90`}
            >
              <Home className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${t.iconColor}`} />
            </button>

            {/* Modo Oscuro / Claro */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`hidden sm:flex w-9 h-9 md:w-10 md:h-10 ${t.bgTertiary} rounded-xl items-center justify-center ${t.hover} transition-all active:scale-90`}
            >
              {isDarkMode 
                ? <Sun className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${t.iconColor}`} /> 
                : <Moon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${t.iconColor}`} />}
            </button>

            {/* Guardar */}
            <button 
              onClick={() => setShowSaveModal(true)}
              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-md shadow-blue-500/30 active:scale-90"
            >
              <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de guardado */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`${t.bgSecondary} rounded-3xl sm:rounded-[2rem] p-6 sm:p-10 w-full max-w-sm ${t.border} border-2 shadow-2xl`}>
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/10 rounded-2xl sm:rounded-3xl flex items-center justify-center">
                <Download className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
              </div>
            </div>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && saveDesign()}
              placeholder="Tu nombre"
              className={`w-full ${t.bgTertiary} ${t.border} border-2 rounded-2xl sm:rounded-3xl p-4 sm:p-5 mb-6 sm:mb-8 ${t.text} placeholder-gray-500 text-center text-base sm:text-lg`}
              autoFocus
            />
            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={() => setShowSaveModal(false)}
                className={`flex-1 py-4 sm:py-5 ${t.border} border-2 ${t.textSecondary} rounded-2xl sm:rounded-3xl ${t.hover} transition-all hover:scale-[0.98] active:scale-95 text-sm sm:text-base font-medium`}
              >
                Cancelar
              </button>
              <button
                onClick={saveDesign}
                disabled={!clientName.trim()}
                className="flex-1 py-4 sm:py-5 bg-blue-500 text-white rounded-2xl sm:rounded-3xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[0.98] active:scale-95 text-sm sm:text-base font-medium"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className={`${t.bgSecondary} rounded-3xl sm:rounded-[2rem] p-8 sm:p-12 text-center ${t.border} border-2 shadow-2xl max-w-sm mx-4`}>
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/10 rounded-2xl sm:rounded-3xl flex items-center justify-center">
                <Download className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
              </div>
            </div>
            <h3 className={`text-2xl sm:text-3xl font-semibold ${t.text} mb-2`}>¡Listo!</h3>
            <p className={`text-base sm:text-lg ${t.textSecondary}`}>Diseño guardado</p>
          </div>
        </div>
      )}

      {/* Dropdown cerrar al hacer click fuera */}
      {showFontDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowFontDropdown(false)}
        />
      )}
    </div>
  );
}