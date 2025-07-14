'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function StendoLanding() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    setIsLoaded(true)
    
    const handleScroll = () => {
      const sections = ['hero', 'about', 'process', 'benefits', 'contact']
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    // <div className={`min-h-screen bg-gray-100 font-sans transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
    //   {/* Main Container with rounded corners */}
    //   <div className="min-h-screen mx-4 my-8 bg-white rounded-3xl shadow-2xl overflow-hidden">
        
    //     {/* Header */}
    //     <header className="fixed top-8 left-4 right-4 z-50 bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl">
    //       <nav className="max-w-7xl mx-auto px-8 py-6">
    //         <div className="flex justify-between items-center">
    //           <div className="font-serif text-3xl font-bold text-gray-900" style={{ fontFamily: 'Canela, serif' }}>
    //             Stendo
    //           </div>
    //           <div className="hidden lg:flex items-center space-x-10">
    //             <button 
    //               onClick={() => scrollToSection('about')}
    //               className={`transition-colors font-medium ${activeSection === 'about' ? 'text-lime-500' : 'text-gray-600 hover:text-lime-500'}`}
    //             >
    //               За нас
    //             </button>
    //             <button 
    //               onClick={() => scrollToSection('process')}
    //               className={`transition-colors font-medium ${activeSection === 'process' ? 'text-lime-500' : 'text-gray-600 hover:text-lime-500'}`}
    //             >
    //               Процес
    //             </button>
    //             <button 
    //               onClick={() => scrollToSection('benefits')}
    //               className={`transition-colors font-medium ${activeSection === 'benefits' ? 'text-lime-500' : 'text-gray-600 hover:text-lime-500'}`}
    //             >
    //               Предимства
    //             </button>
    //             <button 
    //               onClick={() => scrollToSection('contact')}
    //               className={`transition-colors font-medium ${activeSection === 'contact' ? 'text-lime-500' : 'text-gray-600 hover:text-lime-500'}`}
    //             >
    //               Контакти
    //             </button>
    //           </div>
    //           <div className="flex items-center space-x-4">
    //             <button 
    //               onClick={() => scrollToSection('contact')}
    //               className="text-gray-600 hover:text-lime-500 transition-colors font-medium"
    //             >
    //               Свържете се ↓
    //             </button>
    //             <button 
    //               onClick={() => scrollToSection('contact')}
    //               className="bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 font-medium"
    //             >
    //               Започнете
    //             </button>
    //           </div>
    //         </div>
    //       </nav>
    //     </header>

    //     {/* Hero Section */}
    //     <section id="hero" className="relative px-12 pt-32 pb-20 min-h-screen flex items-center">
    //       <div className="max-w-7xl mx-auto w-full">
    //         <div className="text-center mb-16">
    //           <h1 className="font-serif text-6xl !leading-tight lg:text-8xl text-gray-900 mb-8" style={{ fontFamily: 'Canela, serif' }}>
    //             Вашата стратегия за<br />
    //             <span className="text-lime-500 italic">по-големи приходи</span>
    //           </h1>
    //           <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
    //             Увеличете печалбите от магазина си с платформа, проектирана да опростява управлението на стендове,
    //             оптимизира продажбите и ви помага да постигнете целите си с увереност и прецизност.
    //           </p>
    //           <div className="flex items-center justify-center space-x-6">
    //             <button 
    //               onClick={() => scrollToSection('contact')}
    //               className="bg-gray-900 text-white px-8 py-4 rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 font-medium flex items-center space-x-2"
    //             >
    //               <span>Започнете сега</span>
    //               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //                 <path d="M7 17L17 7M17 7H7M17 7V17"/>
    //               </svg>
    //             </button>
    //       <Link href="/dashboard">
    //                       <button 
    //               onClick={() => scrollToSection('contact')}
    //               className="text-gray-600 hover:text-lime-500 transition-colors font-medium underline"
    //             >
    //               Към администрация
    //             </button></Link>
    //           </div>
    //         </div>

    //         {/* 3D Visual Elements */}
    //         <div className="relative h-[600px] overflow-hidden">
    //           {/* Background geometric shapes */}
    //           <div className="absolute inset-0 flex items-center justify-center">
    //             {/* Large decorative shapes */}
    //             <div className="absolute top-20 right-20 w-32 h-32 bg-gray-100 rounded-full border-8 border-gray-200 animate-pulse-glow"></div>
    //             <div className="absolute bottom-32 left-16 w-24 h-24 bg-gray-100 rounded-full border-6 border-gray-200 animate-float"></div>
                
    //             {/* Central phone mockup area */}
    //             <div className="relative z-10 glass-card rounded-3xl p-8 shadow-xl transform rotate-12 hover:rotate-6 transition-transform duration-500">
    //               <div className="w-80 h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
    //                 {/* Phone header */}
    //                 <div className="bg-gray-900 h-8 rounded-t-2xl flex items-center justify-center">
    //                   <div className="w-16 h-1 bg-gray-600 rounded-full"></div>
    //                 </div>
                    
    //                 {/* Phone content */}
    //                 <div className="p-6 space-y-6">
    //                   <div className="text-center">
    //                     <h3 className="text-lg font-semibold text-gray-900 mb-2">Добре дошли в Stendo</h3>
    //                     <p className="text-gray-600 text-sm">Вашият партньор за растеж</p>
    //                   </div>
                      
    //                   {/* Revenue display */}
    //                   <div className="bg-lime-50 rounded-2xl p-6 text-center">
    //                     <div className="text-3xl font-bold text-lime-600 mb-2">BGN 2,450</div>
    //                     <div className="text-sm text-gray-600">Месечна печалба</div>
    //                     <div className="text-xs text-lime-600 mt-1">↗ +24.7%</div>
    //                   </div>
                      
    //                   {/* Stats bars */}
    //                   <div className="space-y-3">
    //                     <div className="flex items-center justify-between">
    //                       <span className="text-sm text-gray-600">Продажби</span>
    //                       <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
    //                         <div className="w-3/4 h-full bg-lime-400 rounded-full"></div>
    //                       </div>
    //                     </div>
    //                     <div className="flex items-center justify-between">
    //                       <span className="text-sm text-gray-600">Стока</span>
    //                       <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
    //                         <div className="w-5/6 h-full bg-yellow-400 rounded-full"></div>
    //                       </div>
    //                     </div>
    //                     <div className="flex items-center justify-between">
    //                       <span className="text-sm text-gray-600">Клиенти</span>
    //                       <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
    //                         <div className="w-2/3 h-full bg-blue-400 rounded-full"></div>
    //                       </div>
    //                     </div>
    //                   </div>
                      
    //                   {/* Action button */}
    //                   <button className="w-full bg-lime-500 text-white py-3 rounded-xl font-medium hover:bg-lime-600 transition-colors">
    //                     Преглед на стенда
    //                   </button>
    //                 </div>
    //               </div>
    //             </div>

    //             {/* Side cards */}
    //             <div className="absolute top-32 left-20 glass-card rounded-2xl p-6 shadow-xl transform -rotate-12 hover:-rotate-6 transition-transform duration-500">
    //               <div className="text-center">
    //                 <div className="text-2xl font-bold text-gray-900 mb-2">BGN 24,498.97</div>
    //                 <div className="text-sm text-gray-600 mb-2">Общи приходи тази година</div>
    //                 <div className="text-xs text-lime-600">↗ +4.7%</div>
    //                 <div className="text-xs text-gray-500 mt-1">Увеличение спрямо миналата година</div>
    //               </div>
                  
    //               {/* Mini chart */}
    //               <div className="mt-4 flex items-end space-x-1 h-16">
    //                 {[40, 60, 30, 80, 50, 90, 70, 85, 95, 75, 85, 100].map((height, i) => (
    //                   <div key={i} className="flex-1 bg-lime-200 rounded-t transition-all duration-300 hover:bg-lime-300" style={{height: `${height}%`}}></div>
    //                 ))}
    //               </div>
    //             </div>

    //             <div className="absolute bottom-20 right-32 glass-card rounded-2xl p-6 shadow-xl transform rotate-6 hover:rotate-3 transition-transform duration-500">
    //               <div className="flex items-center space-x-4 mb-4">
    //                 <div className="w-12 h-12 bg-lime-100 rounded-full flex items-center justify-center">
    //                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-lime-600">
    //                     <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
    //                     <path d="M2 17L12 22L22 17"/>
    //                     <path d="M2 12L12 17L22 12"/>
    //                   </svg>
    //                 </div>
    //                 <div>
    //                   <div className="font-semibold text-gray-900">Стенд управление</div>
    //                   <div className="text-sm text-gray-600">Автоматично</div>
    //                 </div>
    //               </div>
    //               <div className="text-2xl font-bold text-gray-900 mb-1">BGN 10,000</div>
    //               <div className="text-sm text-gray-600">Месечен оборот</div>
    //             </div>

    //             {/* Floating notification */}
    //             <div className="absolute bottom-40 left-32 bg-gray-900 text-white px-4 py-2 rounded-full shadow-xl flex items-center space-x-2 animate-float">
    //               <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></div>
    //               <span className="text-sm">Осигуряваме пълна сигурност на трансферите!</span>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </section>

    //     {/* About Section */}
    //     <section id="about" className="px-12 py-20 bg-gray-50">
    //       <div className="max-w-7xl mx-auto">
    //         <div className="text-center mb-16">
    //           <h2 className="font-serif text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Canela, serif' }}>
    //             Какво е <span className="text-lime-500">Stendo</span>?
    //           </h2>
    //           <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
    //             Stendo е иновативна платформа, която помага на физическите магазини да увеличат приходите си 
    //             чрез професионални стендове с мобилни аксесоари. Ние се грижим за всичко - от инсталацията 
    //             до поддръжката, а вие просто получавате процент от продажбите.
    //           </p>
    //         </div>
            
    //         <div className="grid lg:grid-cols-3 gap-8">
    //           <div className="metric-card rounded-3xl p-8 text-center hover:shadow-xl transition-shadow duration-300">
    //             <div className="w-16 h-16 bg-lime-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
    //               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lime-600">
    //                 <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
    //                 <path d="M2 17L12 22L22 17"/>
    //                 <path d="M2 12L12 17L22 12"/>
    //               </svg>
    //             </div>
    //             <h3 className="font-serif text-2xl font-semibold text-gray-900 mb-4">Без инвестиция</h3>
    //             <p className="text-gray-600">Инсталираме стенда безплатно в магазина ви</p>
    //           </div>

    //           <div className="metric-card rounded-3xl p-8 text-center hover:shadow-xl transition-shadow duration-300">
    //             <div className="w-16 h-16 bg-lime-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
    //               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lime-600">
    //                 <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
    //               </svg>
    //             </div>
    //             <h3 className="font-serif text-2xl font-semibold text-gray-900 mb-4">Без грижи</h3>
    //             <p className="text-gray-600">Ние се грижим за стоката и поддръжката</p>
    //           </div>

    //           <div className="metric-card rounded-3xl p-8 text-center hover:shadow-xl transition-shadow duration-300">
    //             <div className="w-16 h-16 bg-lime-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
    //               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lime-600">
    //                 <line x1="12" y1="1" x2="12" y2="23"/>
    //                 <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6"/>
    //               </svg>
    //             </div>
    //             <h3 className="font-serif text-2xl font-semibold text-gray-900 mb-4">Само печалба</h3>
    //             <p className="text-gray-600">Получавате процент от всяка продажба</p>
    //           </div>
    //         </div>
    //       </div>
    //     </section>

    //     {/* Process Section */}
    //     <section id="process" className="px-12 py-20 bg-white">
    //       <div className="max-w-7xl mx-auto">
    //         <div className="text-center mb-16">
    //           <h2 className="font-serif text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Canela, serif' }}>
    //             Как работи <span className="text-lime-500">Stendo</span>?
    //           </h2>
    //           <p className="text-xl text-gray-600 max-w-3xl mx-auto">
    //             Три прости стъпки до стабилен пасивен доход
    //           </p>
    //         </div>
            
    //         <div className="grid lg:grid-cols-3 gap-12">
    //           <div className="text-center group">
    //             <div className="w-20 h-20 bg-lime-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-lime-200 transition-colors duration-300">
    //               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lime-600">
    //                 <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"/>
    //                 <polyline points="9,22 9,12 15,12 15,22"/>
    //               </svg>
    //             </div>
    //             <div className="bg-lime-500 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">1</div>
    //             <h3 className="font-serif text-2xl font-semibold text-gray-900 mb-4">
    //               Поставяме стенда
    //             </h3>
    //             <p className="text-gray-600 leading-relaxed">
    //               Инсталираме професионален стенд с качествени мобилни аксесоари 
    //               в магазина ви без никакви разходи от ваша страна.
    //             </p>
    //           </div>

    //           <div className="text-center group">
    //             <div className="w-20 h-20 bg-lime-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-lime-200 transition-colors duration-300">
    //               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lime-600">
    //                 <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
    //                 <path d="M2 17L12 22L22 17"/>
    //                 <path d="M2 12L12 17L22 12"/>
    //               </svg>
    //             </div>
    //             <div className="bg-lime-500 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">2</div>
    //             <h3 className="font-serif text-2xl font-semibold text-gray-900 mb-4">
    //               Поддържаме стока
    //             </h3>
    //             <p className="text-gray-600 leading-relaxed">
    //               Редовно проверяваме и допълваме стоката. Следим тенденциите 
    //               и обновяваме асортимента според търсенето.
    //             </p>
    //           </div>

    //           <div className="text-center group">
    //             <div className="w-20 h-20 bg-lime-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-lime-200 transition-colors duration-300">
    //               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lime-600">
    //                 <line x1="12" y1="1" x2="12" y2="23"/>
    //                 <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6"/>
    //               </svg>
    //             </div>
    //             <div className="bg-lime-500 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">3</div>
    //             <h3 className="font-serif text-2xl font-semibold text-gray-900 mb-4">
    //               Вземате печалбата
    //             </h3>
    //             <p className="text-gray-600 leading-relaxed">
    //               Получавате процент от всяка продажба без никакви грижи. 
    //               Прозрачно отчитане и редовни плащания.
    //             </p>
    //           </div>
    //         </div>
    //       </div>
    //     </section>

    //     {/* Benefits Section */}
    //     <section id="benefits" className="px-12 py-20 bg-gradient-to-br from-lime-500 to-green-600 text-white">
    //       <div className="max-w-7xl mx-auto">
    //         <div className="grid lg:grid-cols-2 gap-16 items-center">
    //           <div>
    //             <h2 className="font-serif text-4xl lg:text-5xl font-bold mb-8 leading-tight" style={{ fontFamily: 'Canela, serif' }}>
    //               Защо да изберете<br />
    //               <span className="font-light italic">Stendo</span>?
    //             </h2>
    //             <p className="text-xl opacity-90 mb-8 leading-relaxed">
    //               Нашата експертиза в областта на мобилните аксесоари и управлението на стендове 
    //               ви гарантира максимални приходи с минимални усилия.
    //             </p>
    //             <div className="space-y-4">
    //               <div className="flex items-center space-x-3">
    //                 <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
    //                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //                     <polyline points="20,6 9,17 4,12"/>
    //                   </svg>
    //                 </div>
    //                 <span>Безплатна инсталация и настройка</span>
    //               </div>
    //               <div className="flex items-center space-x-3">
    //                 <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
    //                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //                     <polyline points="20,6 9,17 4,12"/>
    //                   </svg>
    //                 </div>
    //                 <span>Редовна поддръжка и попълване на стока</span>
    //               </div>
    //               <div className="flex items-center space-x-3">
    //                 <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
    //                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //                     <polyline points="20,6 9,17 4,12"/>
    //                   </svg>
    //                 </div>
    //                 <span>Прозрачно отчитане на продажбите</span>
    //               </div>
    //               <div className="flex items-center space-x-3">
    //                 <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
    //                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //                     <polyline points="20,6 9,17 4,12"/>
    //                   </svg>
    //                 </div>
    //                 <span>Месечни плащания без забавяне</span>
    //               </div>
    //             </div>
    //           </div>
              
    //           <div className="grid grid-cols-2 gap-6">
    //             <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-colors duration-300">
    //               <div className="text-3xl font-bold mb-2">500+</div>
    //               <div className="text-sm opacity-90">Активни стендове</div>
    //             </div>
    //             <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-colors duration-300">
    //               <div className="text-3xl font-bold mb-2">95%</div>
    //               <div className="text-sm opacity-90">Доволни партньори</div>
    //             </div>
    //             <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-colors duration-300 col-span-2">
    //               <div className="text-3xl font-bold mb-2">BGN 2,500</div>
    //               <div className="text-sm opacity-90">Средна месечна печалба на партньор</div>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </section>

    //     {/* Stats Section */}
    //     <section className="px-12 py-20 bg-white">
    //       <div className="max-w-7xl mx-auto">
    //         <div className="text-center mb-16">
    //           <h2 className="font-serif text-4xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Canela, serif' }}>
    //             Нашите <span className="text-lime-500">резултати</span>
    //           </h2>
    //           <p className="text-gray-600 mb-8 max-w-3xl mx-auto">
    //             Помогнахме на стотици магазини в България да увеличат приходите си 
    //             с нашите иновативни решения за мобилни аксесоари.
    //           </p>
    //         </div>
            
    //         <div className="grid lg:grid-cols-4 gap-8">
    //           <div className="text-center group">
    //             <div className="text-5xl font-bold text-gray-900 mb-2 group-hover:text-lime-500 transition-colors duration-300">500+</div>
    //             <div className="text-gray-600 mb-1">Активни стендове</div>
    //             <div className="text-sm text-lime-500">в цяла България</div>
    //           </div>
              
    //           <div className="text-center group">
    //             <div className="text-5xl font-bold text-gray-900 mb-2 group-hover:text-lime-500 transition-colors duration-300">95%</div>
    //             <div className="text-gray-600 mb-1">Доволни партньори</div>
    //             <div className="text-sm text-lime-500">препоръчват услугите ни</div>
    //           </div>
              
    //           <div className="text-center group">
    //             <div className="text-5xl font-bold text-gray-900 mb-2 group-hover:text-lime-500 transition-colors duration-300">BGN 2.5K</div>
    //             <div className="text-gray-600 mb-1">Средна месечна печалба</div>
    //             <div className="text-sm text-lime-500">на партньор</div>
    //           </div>
              
    //           <div className="text-center group">
    //             <div className="text-5xl font-bold text-gray-900 mb-2 group-hover:text-lime-500 transition-colors duration-300">3+</div>
    //             <div className="text-gray-600 mb-1">Години опит</div>
    //             <div className="text-sm text-lime-500">в индустрията</div>
    //           </div>
    //         </div>
    //       </div>
    //     </section>

    //     {/* CTA Section */}
    //     <section id="contact" className="px-12 py-20 bg-gradient-to-br from-lime-500 to-green-600 text-white text-center">
    //       <div className="max-w-4xl mx-auto">
    //         <h2 className="font-serif text-5xl lg:text-6xl font-bold mb-8 leading-tight" style={{ fontFamily: 'Canela, serif' }}>
    //           Готови ли сте да<br />
    //           <span className="italic font-light">започнете?</span>
    //         </h2>
    //         <p className="text-xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-90">
    //           Свържете се с нас днес и започнете да печелите от мобилни аксесоари 
    //           без никакви усилия от ваша страна. Безплатна консултация и оценка на локацията.
    //         </p>
    //         <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
    //           <button className="bg-white text-lime-600 px-12 py-4 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 font-semibold text-lg">
    //             Свържете се сега
    //           </button>
    //           <div className="flex items-center space-x-3 text-white/90">
    //             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //               <path d="M22 16.92V19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21C15.0294 21 10.196 19.206 6.29799 15.708C2.79999 11.804 0.999995 6.97058 0.999995 2C0.999995 1.46957 1.21071 0.960859 1.58578 0.585786C1.96086 0.210714 2.46956 0 2.99999 0H5.07C5.32352 0 5.56397 0.101645 5.73982 0.281716C5.91567 0.461787 6.01207 0.705154 5.99999 0.96L5.75999 3.96C5.72671 4.48 5.82399 4.999 6.03999 5.47L7.51999 8.53C7.66156 8.82 7.70265 9.15 7.63599 9.47C7.56933 9.79 7.40199 10.08 7.15999 10.3L5.61999 11.84C6.82999 14.1 8.89999 16.17 11.16 17.38L12.7 15.84C12.92 15.598 13.21 15.4307 13.53 15.364C13.85 15.2973 14.18 15.3384 14.47 15.48L17.53 16.96C18.001 17.176 18.52 17.2733 19.04 17.24L22.04 17C22.2945 16.9879 22.5378 17.0843 22.7179 17.2602C22.898 17.436 22.9996 17.6765 23 17.93V16.92H22Z"/>
    //             </svg>
    //             <span className="font-medium">+359 888 123 456</span>
    //           </div>
    //         </div>
            
    //         {/* Contact Form */}
    //         <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm rounded-3xl p-8">
    //           <h3 className="text-2xl font-semibold mb-6">Заявете безплатна консултация</h3>
    //           <form className="space-y-4">
    //             <div className="grid md:grid-cols-2 gap-4">
    //               <input 
    //                 type="text" 
    //                 placeholder="Вашето име" 
    //                 className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
    //               />
    //               <input 
    //                 type="tel" 
    //                 placeholder="Телефон" 
    //                 className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
    //               />
    //             </div>
    //             <input 
    //               type="email" 
    //               placeholder="Email адрес" 
    //               className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
    //             />
    //             <input 
    //               type="text" 
    //               placeholder="Адрес на магазина" 
    //               className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
    //             />
    //             <textarea 
    //               placeholder="Допълнителна информация (незадължително)" 
    //               rows={4}
    //               className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
    //             ></textarea>
    //             <button 
    //               type="submit"
    //               className="w-full bg-white text-lime-600 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-300"
    //             >
    //               Изпратете заявката
    //             </button>
    //           </form>
    //         </div>
    //       </div>
    //     </section>

    //     {/* Footer */}
    //     <footer className="px-12 py-16 bg-gray-900 text-white">
    //       <div className="max-w-7xl mx-auto">
    //         <div className="grid md:grid-cols-4 gap-12 mb-12">
    //           <div>
    //             <div className="font-serif text-3xl font-bold mb-6" style={{ fontFamily: 'Canela, serif' }}>
    //               Stendo
    //             </div>
    //             <p className="text-gray-400 leading-relaxed mb-6">
    //               Помагаме на физическите магазини да растат с иновативни решения за пасивен доход.
    //             </p>
    //             <div className="flex space-x-4">
    //               <div className="w-10 h-10 bg-lime-500 rounded-lg flex items-center justify-center hover:bg-lime-600 transition-colors cursor-pointer">
    //                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    //                   <path d="M24 4.557C23.117 4.949 22.168 5.213 21.172 5.332C22.189 4.723 22.97 3.758 23.337 2.608C22.386 3.172 21.332 3.582 20.21 3.803C19.313 2.846 18.032 2.248 16.616 2.248C13.437 2.248 11.101 5.214 11.819 8.293C7.728 8.088 4.1 6.128 1.671 3.149C0.381 5.362 1.002 8.257 3.194 9.723C2.388 9.697 1.628 9.476 0.965 9.107C0.911 11.388 2.546 13.522 4.914 13.997C4.221 14.185 3.462 14.229 2.69 14.081C3.316 16.037 5.134 17.46 7.29 17.5C5.22 19.123 2.612 19.848 0 19.54C2.179 20.937 4.768 21.752 7.548 21.752C16.69 21.752 21.855 14.031 21.543 7.106C22.505 6.411 23.34 5.544 24 4.557Z"/>
    //                 </svg>
    //               </div>
    //               <div className="w-10 h-10 bg-lime-500 rounded-lg flex items-center justify-center hover:bg-lime-600 transition-colors cursor-pointer">
    //                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    //                   <path d="M22.46 6C21.69 6.35 20.86 6.58 20 6.69C20.88 6.16 21.56 5.32 21.88 4.31C21.05 4.81 20.13 5.16 19.16 5.36C18.37 4.5 17.26 4 16 4C13.65 4 11.73 5.92 11.73 8.29C11.73 8.63 11.77 8.96 11.84 9.27C8.28 9.09 5.11 7.38 3 4.79C2.63 5.42 2.42 6.16 2.42 6.94C2.42 8.43 3.17 9.75 4.33 10.5C3.62 10.5 2.96 10.3 2.38 10C2.38 10 2.38 10 2.38 10.03C2.38 12.11 3.86 13.85 5.82 14.24C5.46 14.34 5.08 14.39 4.69 14.39C4.42 14.39 4.15 14.36 3.89 14.31C4.43 16 6 17.26 7.89 17.29C6.43 18.45 4.58 19.13 2.56 19.13C2.22 19.13 1.88 19.11 1.54 19.07C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79C20.33 8.6 20.33 8.42 20.32 8.23C21.16 7.63 21.88 6.87 22.46 6Z"/>
    //                 </svg>
    //               </div>
    //               <div className="w-10 h-10 bg-lime-500 rounded-lg flex items-center justify-center hover:bg-lime-600 transition-colors cursor-pointer">
    //                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    //                   <path d="M20.447 20.452H16.893V14.883C16.893 13.555 16.866 11.846 15.041 11.846C13.188 11.846 12.905 13.291 12.905 14.785V20.452H9.351V9H12.765V10.561H12.811C13.288 9.661 14.448 8.711 16.181 8.711C19.782 8.711 20.448 11.081 20.448 14.166V20.452H20.447ZM5.337 7.433C4.193 7.433 3.274 6.507 3.274 5.368C3.274 4.23 4.194 3.305 5.337 3.305C6.477 3.305 7.401 4.23 7.401 5.368C7.401 6.507 6.476 7.433 5.337 7.433ZM7.119 20.452H3.555V9H7.119V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 24 23.227 24 22.271V1.729C24 0.774 23.2 0 22.222 0H22.225Z"/>
    //                 </svg>
    //               </div>
    //             </div>
    //           </div>
    //           <div>
    //             <h4 className="font-semibold mb-6">Услуги</h4>
    //             <ul className="space-y-3 text-gray-400">
    //               <li className="hover:text-lime-500 transition-colors cursor-pointer">Стендове за аксесоари</li>
    //               <li className="hover:text-lime-500 transition-colors cursor-pointer">Управление на стока</li>
    //               <li className="hover:text-lime-500 transition-colors cursor-pointer">Анализ на продажби</li>
    //               <li className="hover:text-lime-500 transition-colors cursor-pointer">Техническа поддръжка</li>
    //             </ul>
    //           </div>
    //           <div>
    //             <h4 className="font-semibold mb-6">Компания</h4>
    //             <ul className="space-y-3 text-gray-400">
    //               <li className="hover:text-lime-500 transition-colors cursor-pointer">За нас</li>
    //               <li className="hover:text-lime-500 transition-colors cursor-pointer">Нашият екип</li>
    //               <li className="hover:text-lime-500 transition-colors cursor-pointer">Кариери</li>
    //               <li className="hover:text-lime-500 transition-colors cursor-pointer">Контакти</li>
    //             </ul>
    //           </div>
    //           <div>
    //             <h4 className="font-semibold mb-6">Контакт</h4>
    //             <ul className="space-y-3 text-gray-400">
    //               <li className="flex items-center space-x-2">
    //                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //                   <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"/>
    //                   <polyline points="22,6 12,13 2,6"/>
    //                 </svg>
    //                 <span>info@stendo.bg</span>
    //               </li>
    //               <li className="flex items-center space-x-2">
    //                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //                   <path d="M22 16.92V19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21C15.0294 21 10.196 19.206 6.29799 15.708C2.79999 11.804 0.999995 6.97058 0.999995 2C0.999995 1.46957 1.21071 0.960859 1.58578 0.585786C1.96086 0.210714 2.46956 0 2.99999 0H5.07C5.32352 0 5.56397 0.101645 5.73982 0.281716C5.91567 0.461787 6.01207 0.705154 5.99999 0.96L5.75999 3.96C5.72671 4.48 5.82399 4.999 6.03999 5.47L7.51999 8.53C7.66156 8.82 7.70265 9.15 7.63599 9.47C7.56933 9.79 7.40199 10.08 7.15999 10.3L5.61999 11.84C6.82999 14.1 8.89999 16.17 11.16 17.38L12.7 15.84C12.92 15.598 13.21 15.4307 13.53 15.364C13.85 15.2973 14.18 15.3384 14.47 15.48L17.53 16.96C18.001 17.176 18.52 17.2733 19.04 17.24L22.04 17C22.2945 16.9879 22.5378 17.0843 22.7179 17.2602C22.898 17.436 22.9996 17.6765 23 17.93V16.92H22Z"/>
    //                 </svg>
    //                 <span>+359 888 123 456</span>
    //               </li>
    //               <li className="flex items-center space-x-2">
    //                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    //                   <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z"/>
    //                   <circle cx="12" cy="10" r="3"/>
    //                 </svg>
    //                 <span>София, България</span>
    //               </li>
    //             </ul>
    //           </div>
    //         </div>
    //         <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
    //           <p className="text-gray-400 text-sm mb-4 md:mb-0">
    //             &copy; 2025 Stendo. Всички права запазени.
    //           </p>
    //           <div className="flex space-x-6 text-sm text-gray-400">
    //             <a href="#" className="hover:text-lime-500 transition-colors">Политика за поверителност</a>
    //             <a href="#" className="hover:text-lime-500 transition-colors">Общи условия</a>
    //             <a href="#" className="hover:text-lime-500 transition-colors">Бисквитки</a>
    //           </div>
    //         </div>
    //       </div>
    //     </footer>
    //   </div>
    // </div>

    <div className='flex w-full h-[100vh] items-center justify-center'>
        <Link href={'/dashboard'}>
      <Button>Към администрация</Button>
        
        </Link>
    </div>
  )
}