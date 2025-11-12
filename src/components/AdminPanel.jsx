import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Plus, Save, Image, Package, Sparkles, RotateCcw, Type, Palette } from 'lucide-react';

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState('welcome');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  
  const [welcomeBackground, setWelcomeBackground] = useState(null);
  const [editorBackground, setEditorBackground] = useState(null);
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [cliparts, setCliparts] = useState([]);
  const [eventName, setEventName] = useState('');
  
  // Nuevos estados para fuentes y colores
  const [availableFonts, setAvailableFonts] = useState([
    { name: 'Roboto', family: 'Roboto, sans-serif', googleName: 'Roboto' },
    { name: 'Montserrat', family: 'Montserrat, sans-serif', googleName: 'Montserrat' },
    { name: 'Poppins', family: 'Poppins, sans-serif', googleName: 'Poppins' }
  ]);
  const [availableColors, setAvailableColors] = useState([
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF'
  ]);

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

  const generateUniqueId = () => {
    return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  };

  const compressImage = (file, maxWidth, maxHeight, quality) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new window.Image();
        
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height = height * (maxWidth / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = width * (maxHeight / height);
              height = maxHeight;
            }
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const imageData = ctx.getImageData(0, 0, width, height);
          let hasTransparency = false;
          for (let i = 3; i < imageData.data.length; i += 4) {
            if (imageData.data[i] < 255) {
              hasTransparency = true;
              break;
            }
          }
          
          const format = hasTransparency ? 'image/png' : 'image/jpeg';
          let compressedDataUrl = canvas.toDataURL(format, quality);
          
          let currentQuality = quality;
          while (compressedDataUrl.length > 500000 && currentQuality > 0.3) {
            currentQuality -= 0.1;
            compressedDataUrl = canvas.toDataURL(format, currentQuality);
          }
          
          const sizeKB = (compressedDataUrl.length / 1024).toFixed(0);
          console.log(`✅ ${img.width}x${img.height} → ${width}x${height} (${format}) ${sizeKB}KB Q:${(currentQuality*100).toFixed(0)}%`);
          
          resolve(compressedDataUrl);
        };
        
        img.onerror = () => reject(new Error('Error al cargar imagen'));
        img.src = e.target.result;
      };
      
      reader.onerror = () => reject(new Error('Error al leer archivo'));
      reader.readAsDataURL(file);
    });
  };

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

      if (savedEventName) setEventName(savedEventName);
      if (savedWelcomeBg) setWelcomeBackground(savedWelcomeBg);
      if (savedEditorBg) setEditorBackground(savedEditorBg);
      if (savedProducts) setProducts(JSON.parse(savedProducts));
      if (savedImages) setImages(JSON.parse(savedImages));
      if (savedCliparts) setCliparts(JSON.parse(savedCliparts));
      if (savedFonts) setAvailableFonts(JSON.parse(savedFonts));
      if (savedColors) setAvailableColors(JSON.parse(savedColors));

      console.log('✓ Configuración cargada desde localStorage');
    } catch (error) {
      console.log('Nueva configuración:', error);
    }
  };

  const handleMultipleFilesUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setCompressing(true);
    const newItems = [];
    
    try {
      for (const file of files) {
        let maxWidth, maxHeight, quality;
        
        if (type === 'product') {
          maxWidth = 600;
          maxHeight = 600;
          quality = 0.75;
        } else if (type === 'image') {
          maxWidth = 400;
          maxHeight = 400;
          quality = 0.7;
        } else if (type === 'clipart') {
          maxWidth = 200;
          maxHeight = 200;
          quality = 0.75;
        }
        
        const compressedBase64 = await compressImage(file, maxWidth, maxHeight, quality);
        
        newItems.push({
          id: generateUniqueId(),
          name: file.name.split('.')[0],
          image: compressedBase64
        });
      }
      
      if (type === 'product') {
        setProducts(prev => [...prev, ...newItems]);
      } else if (type === 'image') {
        setImages(prev => [...prev, ...newItems]);
      } else if (type === 'clipart') {
        setCliparts(prev => [...prev, ...newItems]);
      }
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar imágenes');
    } finally {
      setCompressing(false);
      e.target.value = '';
    }
  };

  const handleSingleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setCompressing(true);
    
    try {
      const maxWidth = 1200;
      const maxHeight = 800;
      const quality = 0.75;
      
      const compressedBase64 = await compressImage(file, maxWidth, maxHeight, quality);
      
      if (type === 'welcome') {
        setWelcomeBackground(compressedBase64);
      } else if (type === 'editor') {
        setEditorBackground(compressedBase64);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar imagen');
    } finally {
      setCompressing(false);
    }
  };

  const deleteProduct = (id) => setProducts(products.filter(p => p.id !== id));
  const deleteImage = (id) => setImages(images.filter(i => i.id !== id));
  const deleteClipart = (id) => setCliparts(cliparts.filter(c => c.id !== id));

  const toggleFont = (font) => {
    const exists = availableFonts.find(f => f.name === font.name);
    if (exists) {
      setAvailableFonts(availableFonts.filter(f => f.name !== font.name));
    } else {
      setAvailableFonts([...availableFonts, font]);
    }
  };

  const addColor = (color) => {
    if (!availableColors.includes(color)) {
      setAvailableColors([...availableColors, color]);
    }
  };

  const removeColor = (color) => {
    setAvailableColors(availableColors.filter(c => c !== color));
  };

  const saveEventConfig = () => {
    setSaving(true);
    
    try {
      localStorage.setItem('event-name', eventName);
      localStorage.setItem('products', JSON.stringify(products));
      localStorage.setItem('images', JSON.stringify(images));
      localStorage.setItem('cliparts', JSON.stringify(cliparts));
      localStorage.setItem('available-fonts', JSON.stringify(availableFonts));
      localStorage.setItem('available-colors', JSON.stringify(availableColors));

      if (welcomeBackground) {
        localStorage.setItem('welcome-bg', welcomeBackground);
      }
      if (editorBackground) {
        localStorage.setItem('editor-bg', editorBackground);
      }

      console.log('✓ Guardado exitoso en localStorage');
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        window.location.href = '/Interfaz-V02/#/editor';
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar. El tamaño de las imágenes excede el límite de localStorage. Reduce el número de imágenes o elimina algunas.');
    } finally {
      setSaving(false);
    }
  };

  const resetAllConfig = () => {
    localStorage.removeItem('event-name');
    localStorage.removeItem('welcome-bg');
    localStorage.removeItem('editor-bg');
    localStorage.removeItem('products');
    localStorage.removeItem('images');
    localStorage.removeItem('cliparts');
    localStorage.removeItem('available-fonts');
    localStorage.removeItem('available-colors');

    setEventName('');
    setWelcomeBackground(null);
    setEditorBackground(null);
    setProducts([]);
    setImages([]);
    setCliparts([]);
    setAvailableFonts([
      { name: 'Roboto', family: 'Roboto, sans-serif', googleName: 'Roboto' },
      { name: 'Montserrat', family: 'Montserrat, sans-serif', googleName: 'Montserrat' },
      { name: 'Poppins', family: 'Poppins, sans-serif', googleName: 'Poppins' }
    ]);
    setAvailableColors(['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF']);

    setShowResetModal(false);
    console.log('✓ Configuración restablecida completamente');
  };

  const sections = [
    { id: 'welcome', label: 'Bienvenida', icon: Image },
    { id: 'editor', label: 'Editor BG', icon: Image },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'images', label: 'Imágenes', icon: Image },
    { id: 'cliparts', label: 'Cliparts', icon: Sparkles },
    { id: 'fonts', label: 'Fuentes', icon: Type },
    { id: 'colors', label: 'Colores', icon: Palette }
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Panel Admin</h1>
              <p className="text-purple-300 text-sm mt-1">Configura tu evento de personalización</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(true)}
                disabled={saving || compressing}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <RotateCcw className="w-5 h-5" />
                Restablecer Todo
              </button>
              <button
                onClick={saveEventConfig}
                disabled={saving || compressing}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar Evento'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showResetModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-white/10">
            <h3 className="text-xl font-bold text-white mb-2">¿Restablecer configuración?</h3>
            <p className="text-gray-300 mb-6">
              Esta acción eliminará todos los productos, imágenes, cliparts y fondos. 
              No se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={resetAllConfig}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sí, Restablecer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeSection === section.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </button>
            );
          })}
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 min-h-[500px]">
          {activeSection === 'welcome' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Fondo de Bienvenida</h2>
              <p className="text-gray-300 mb-6 text-sm">Imagen de pantalla inicial (máx 1200x800px, compresión agresiva)</p>
              
              <div className="space-y-4">
                <label className="block">
                  <div className="border-2 border-dashed border-purple-500/50 rounded-xl p-8 hover:border-purple-500 transition-colors cursor-pointer bg-black/20">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSingleFileUpload(e, 'welcome')}
                      disabled={compressing}
                      className="hidden"
                    />
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                      <p className="text-white font-medium">
                        {compressing ? 'Comprimiendo...' : 'Subir imagen'}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">PNG, JPG (optimización automática)</p>
                    </div>
                  </div>
                </label>

                {welcomeBackground && (
                  <div className="relative rounded-xl overflow-hidden bg-black/40 p-4">
                    <img src={welcomeBackground} alt="Welcome" className="w-full h-64 object-cover rounded-lg" />
                    <button
                      onClick={() => setWelcomeBackground(null)}
                      className="absolute top-6 right-6 p-2 bg-red-500 rounded-lg hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'editor' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Fondo del Editor</h2>
              <p className="text-gray-300 mb-6 text-sm">Fondo del canvas (máx 1200x800px)</p>
              
              <div className="space-y-4">
                <label className="block">
                  <div className="border-2 border-dashed border-purple-500/50 rounded-xl p-8 hover:border-purple-500 transition-colors cursor-pointer bg-black/20">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSingleFileUpload(e, 'editor')}
                      disabled={compressing}
                      className="hidden"
                    />
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                      <p className="text-white font-medium">
                        {compressing ? 'Comprimiendo...' : 'Subir flyer'}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">Optimización automática</p>
                    </div>
                  </div>
                </label>

                {editorBackground && (
                  <div className="relative rounded-xl overflow-hidden bg-black/40 p-4">
                    <img src={editorBackground} alt="Editor BG" className="w-full h-64 object-cover rounded-lg" />
                    <button
                      onClick={() => setEditorBackground(null)}
                      className="absolute top-6 right-6 p-2 bg-red-500 rounded-lg hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'products' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Productos</h2>
              <p className="text-gray-300 mb-6 text-sm">Productos personalizables (máx 600x600px)</p>
              
              <label className="block mb-6">
                <div className="border-2 border-dashed border-purple-500/50 rounded-xl p-6 hover:border-purple-500 transition-colors cursor-pointer bg-black/20">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleMultipleFilesUpload(e, 'product')}
                    disabled={compressing}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-3">
                    <Plus className="w-6 h-6 text-purple-400" />
                    <span className="text-white font-medium">
                      {compressing ? 'Comprimiendo...' : 'Agregar Productos'}
                    </span>
                  </div>
                </div>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.map(product => (
                  <div key={product.id} className="relative group bg-black/40 rounded-xl p-3 border border-white/10">
                    <img src={product.image} alt={product.name} className="w-full h-32 object-contain rounded-lg mb-2" />
                    <p className="text-white text-sm truncate text-center">{product.name}</p>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
              
              {products.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p>No hay productos</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'images' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Imágenes</h2>
              <p className="text-gray-300 mb-6 text-sm">Recursos visuales (máx 400x400px)</p>
              
              <label className="block mb-6">
                <div className="border-2 border-dashed border-purple-500/50 rounded-xl p-6 hover:border-purple-500 transition-colors cursor-pointer bg-black/20">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleMultipleFilesUpload(e, 'image')}
                    disabled={compressing}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-3">
                    <Plus className="w-6 h-6 text-purple-400" />
                    <span className="text-white font-medium">
                      {compressing ? 'Comprimiendo...' : 'Agregar Imágenes'}
                    </span>
                  </div>
                </div>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map(image => (
                  <div key={image.id} className="relative group bg-black/40 rounded-xl p-3 border border-white/10">
                    <img src={image.image} alt={image.name} className="w-full h-32 object-contain rounded-lg mb-2" />
                    <p className="text-white text-sm truncate text-center">{image.name}</p>
                    <button
                      onClick={() => deleteImage(image.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>

              {images.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Image className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p>No hay imágenes</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'cliparts' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Cliparts</h2>
              <p className="text-gray-300 mb-6 text-sm">Decoraciones (máx 200x200px)</p>
              
              <label className="block mb-6">
                <div className="border-2 border-dashed border-purple-500/50 rounded-xl p-6 hover:border-purple-500 transition-colors cursor-pointer bg-black/20">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleMultipleFilesUpload(e, 'clipart')}
                    disabled={compressing}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-3">
                    <Plus className="w-6 h-6 text-purple-400" />
                    <span className="text-white font-medium">
                      {compressing ? 'Comprimiendo...' : 'Agregar Cliparts'}
                    </span>
                  </div>
                </div>
              </label>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {cliparts.map(clipart => (
                  <div key={clipart.id} className="relative group bg-black/40 rounded-lg p-2 border border-white/10 aspect-square">
                    <img src={clipart.image} alt={clipart.name} className="w-full h-full object-contain" />
                    <button
                      onClick={() => deleteClipart(clipart.id)}
                      className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>

              {cliparts.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Sparkles className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p>No hay cliparts</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'fonts' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Fuentes Disponibles</h2>
              <p className="text-gray-300 mb-6 text-sm">Selecciona las fuentes que estarán disponibles en el editor</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {GOOGLE_FONTS.map(font => {
                  const isSelected = availableFonts.find(f => f.name === font.name);
                  return (
                    <button
                      key={font.name}
                      onClick={() => toggleFont(font)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected 
                          ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20' 
                          : 'bg-black/40 border-white/10 hover:border-purple-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">{font.name}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'bg-purple-500 border-purple-500' : 'border-white/30'
                        }`}>
                          {isSelected && <span className="text-white text-xs">✓</span>}
                        </div>
                      </div>
                      <p 
                        className="text-gray-300 text-lg"
                        style={{ fontFamily: font.family }}
                      >
                        Texto de ejemplo
                      </p>
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-blue-300 text-sm">
                  <strong>Fuentes seleccionadas:</strong> {availableFonts.length} de {GOOGLE_FONTS.length}
                </p>
              </div>
            </div>
          )}

          {activeSection === 'colors' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Paleta de Colores</h2>
              <p className="text-gray-300 mb-6 text-sm">Configura los colores disponibles para texto</p>
              
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">Agregar Color</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    id="color-picker"
                    className="w-16 h-16 rounded-xl cursor-pointer border-2 border-white/20"
                  />
                  <button
                    onClick={() => {
                      const colorInput = document.getElementById('color-picker');
                      addColor(colorInput.value);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Agregar Color
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-white font-medium">Colores Disponibles ({availableColors.length})</h3>
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                  {availableColors.map((color, index) => (
                    <div key={index} className="relative group">
                      <div
                        className="w-full aspect-square rounded-xl border-2 border-white/20 cursor-pointer hover:scale-110 transition-transform shadow-lg"
                        style={{ backgroundColor: color }}
                      />
                      <button
                        onClick={() => removeColor(color)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                      <p className="text-center text-white text-xs mt-1 font-mono">{color}</p>
                    </div>
                  ))}
                </div>
                
                {availableColors.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Palette className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    <p>No hay colores configurados</p>
                  </div>
                )}
              </div>

                        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                          <p className="text-yellow-300 text-sm">
                            💡 <strong>Tip:</strong> Selecciona colores que contrasten bien con tus productos para mejor legibilidad
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }