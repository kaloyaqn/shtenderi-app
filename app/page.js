'use client'

import { Inter, Crimson_Text } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const crimson = Crimson_Text({ 
  weight: ['400', '600', '700'],
  subsets: ['latin'] 
})

export default function StendoLanding() {
  return (
    <div className={`min-h-screen bg-gray-100 ${inter.className}`}>
      {/* Main Container with rounded corners */}
      <div className="min-h-screen mx-4 my-8 bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <header className="relative z-50 px-12 py-8">
          <nav className="max-w-7xl mx-auto flex justify-between items-center">
            <div className={`text-3xl font-bold text-gray-900 ${crimson.className}`}>
              Stendo
            </div>
            <div className="hidden lg:flex items-center space-x-10">
              <a href="#about" className="text-gray-600 hover:text-lime-500 transition-colors font-medium">За нас</a>
              <a href="#process" className="text-gray-600 hover:text-lime-500 transition-colors font-medium">Процес</a>
              <a href="#benefits" className="text-gray-600 hover:text-lime-500 transition-colors font-medium">Предимства</a>
              <a href="#contact" className="text-gray-600 hover:text-lime-500 transition-colors font-medium">Контакти</a>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-lime-500 transition-colors font-medium">
                Свържете се ↓
              </button>
              <button className="bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors font-medium">
                Започнете
              </button>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative px-12 pt-16 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className={`text-6xl lg:text-8xl font-bold text-gray-900 mb-8 leading-tight ${crimson.className}`}>
                Вашата стратегия за<br />
                <span className="text-lime-500">по-големи приходи</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
                Увеличете печалбите от магазина си с платформа, проектирана да опростява управлението на стендове,<br />
                оптимизира продажбите и ви помага да постигнете целите си с увереност и прецизност.
              </p>
              <div className="flex items-center justify-center space-x-6">
                <button className="bg-gray-900 text-white px-8 py-4 rounded-full hover:bg-gray-800 transition-colors font-medium flex items-center space-x-2">
                  <span>Започнете сега</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7V17"/>
                  </svg>
                </button>
                <button className="text-gray-600 hover:text-lime-500 transition-colors font-medium underline">
                  Резервирайте обаждане
                </button>
              </div>
            </div>

            {/* 3D Visual Elements */}
            <div className="relative h-[600px] overflow-hidden">
              {/* Background geometric shapes */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Large Q-like shape */}
                <div className="absolute top-20 right-20 w-32 h-32 bg-gray-100 rounded-full border-8 border-gray-200"></div>
                <div className="absolute bottom-32 left-16 w-24 h-24 bg-gray-100 rounded-full border-6 border-gray-200"></div>
                
                {/* Central phone mockup area */}
                <div className="relative z-10 bg-gray-50 rounded-3xl p-8 shadow-xl transform rotate-12 hover:rotate-6 transition-transform duration-500">
                  <div className="w-80 h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Phone header */}
                    <div className="bg-gray-900 h-8 rounded-t-2xl flex items-center justify-center">
                      <div className="w-16 h-1 bg-gray-600 rounded-full"></div>
                    </div>
                    
                    {/* Phone content */}
                    <div className="p-6 space-y-6">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Добре дошли в Stendo</h3>
                        <p className="text-gray-600 text-sm">Вашият партньор за растеж</p>
                      </div>
                      
                      {/* Revenue display */}
                      <div className="bg-lime-50 rounded-2xl p-6 text-center">
                        <div className="text-3xl font-bold text-lime-600 mb-2">BGN 2,450</div>
                        <div className="text-sm text-gray-600">Месечна печалба</div>
                        <div className="text-xs text-lime-600 mt-1">↗ +24.7%</div>
                      </div>
                      
                      {/* Stats bars */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Продажби</span>
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="w-3/4 h-full bg-lime-400 rounded-full"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Стока</span>
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="w-5/6 h-full bg-yellow-400 rounded-full"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Клиенти</span>
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="w-2/3 h-full bg-blue-400 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action button */}
                      <button className="w-full bg-lime-500 text-white py-3 rounded-xl font-medium">
                        Преглед на стенда
                      </button>
                    </div>
                  </div>
                </div>

                {/* Side cards */}
                <div className="absolute top-32 left-20 bg-white rounded-2xl p-6 shadow-xl transform -rotate-12 hover:-rotate-6 transition-transform duration-500">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">BGN 24,498.97</div>
                    <div className="text-sm text-gray-600 mb-2">Общи приходи тази година</div>
                    <div className="text-xs text-lime-600">↗ +4.7%</div>
                    <div className="text-xs text-gray-500 mt-1">Увеличение спрямо миналата година</div>
                  </div>
                  
                  {/* Mini chart */}
                  <div className="mt-4 flex items-end space-x-1 h-16">
                    {[40, 60, 30, 80, 50, 90, 70, 85, 95, 75, 85, 100].map((height, i) => (
                      <div key={i} className="flex-1 bg-lime-200 rounded-t" style={{height: `${height}%`}}></div>
                    ))}
                  </div>
                </div>

                <div className="absolute bottom-20 right-32 bg-white rounded-2xl p-6 shadow-xl transform rotate-6 hover:rotate-3 transition-transform duration-500">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-lime-100 rounded-full flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-lime-600">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                        <path d="M2 17L12 22L22 17"/>
                        <path d="M2 12L12 17L22 12"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Стенд управление</div>
                      <div className="text-sm text-gray-600">Автоматично</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">BGN 10,000</div>
                  <div className="text-sm text-gray-600">Месечен оборот</div>
                </div>

                {/* Floating notification */}
                <div className="absolute bottom-40 left-32 bg-gray-900 text-white px-4 py-2 rounded-full shadow-xl flex items-center space-x-2">
                  <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
                  <span className="text-sm">Осигуряваме пълна сигурност на трансферите!</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="px-12 py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-5xl font-bold text-gray-900 mb-6 ${crimson.className}`}>
                Как работи Stendo?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Три прости стъпки до стабилен пасивен доход
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-lime-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lime-600">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                </div>
                <h3 className={`text-2xl font-semibold text-gray-900 mb-4 ${crimson.className}`}>
                  Поставяме стенда
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Инсталираме професионален стенд с качествени мобилни аксесоари 
                  в магазина ви без никакви разходи от ваша страна.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-lime-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lime-600">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                    <path d="M2 17L12 22L22 17"/>
                    <path d="M2 12L12 17L22 12"/>
                  </svg>
                </div>
                <h3 className={`text-2xl font-semibold text-gray-900 mb-4 ${crimson.className}`}>
                  Поддържаме стока
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Редовно проверяваме и допълваме стоката. Следим тенденциите 
                  и обновяваме асортимента според търсенето.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-lime-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lime-600">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6"/>
                  </svg>
                </div>
                <h3 className={`text-2xl font-semibold text-gray-900 mb-4 ${crimson.className}`}>
                  Вземате печалбата
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Получавате процент от всяка продажба без никакви грижи. 
                  Прозрачно отчитане и редовни плащания.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-12 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className={`text-5xl lg:text-6xl font-bold text-gray-900 mb-8 ${crimson.className}`}>
              Готови ли сте да<br />
              <span className="text-lime-500">започнете?</span>
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Свържете се с нас днес и започнете да печелите от мобилни аксесоари 
              без никакви усилия от ваша страна.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="bg-gray-900 text-white px-12 py-4 rounded-full hover:bg-gray-800 transition-colors font-medium text-lg">
                Свържете се сега
              </button>
              <div className="flex items-center space-x-3 text-gray-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92V19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21C15.0294 21 10.196 19.206 6.29799 15.708C2.79999 11.804 0.999995 6.97058 0.999995 2C0.999995 1.46957 1.21071 0.960859 1.58578 0.585786C1.96086 0.210714 2.46956 0 2.99999 0H5.07C5.32352 0 5.56397 0.101645 5.73982 0.281716C5.91567 0.461787 6.01207 0.705154 5.99999 0.96L5.75999 3.96C5.72671 4.48 5.82399 4.999 6.03999 5.47L7.51999 8.53C7.66156 8.82 7.70265 9.15 7.63599 9.47C7.56933 9.79 7.40199 10.08 7.15999 10.3L5.61999 11.84C6.82999 14.1 8.89999 16.17 11.16 17.38L12.7 15.84C12.92 15.598 13.21 15.4307 13.53 15.364C13.85 15.2973 14.18 15.3384 14.47 15.48L17.53 16.96C18.001 17.176 18.52 17.2733 19.04 17.24L22.04 17C22.2945 16.9879 22.5378 17.0843 22.7179 17.2602C22.898 17.436 22.9996 17.6765 23 17.93V16.92H22Z"/>
                </svg>
                <span className="font-medium">+359 XXX XXX XXX</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-12 py-16 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div>
                <div className={`text-3xl font-bold text-gray-900 mb-6 ${crimson.className}`}>
                  Stendo
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Помагаме на физическите магазини да растат с иновативни решения за пасивен доход.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-6">Услуги</h4>
                <ul className="space-y-3 text-gray-600">
                  <li className="hover:text-lime-500 transition-colors cursor-pointer">Стендове за аксесоари</li>
                  <li className="hover:text-lime-500 transition-colors cursor-pointer">Управление на стока</li>
                  <li className="hover:text-lime-500 transition-colors cursor-pointer">Анализ на продажби</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-6">Компания</h4>
                <ul className="space-y-3 text-gray-600">
                  <li className="hover:text-lime-500 transition-colors cursor-pointer">За нас</li>
                  <li className="hover:text-lime-500 transition-colors cursor-pointer">Контакти</li>
                  <li className="hover:text-lime-500 transition-colors cursor-pointer">Условия</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-6">Контакт</h4>
                <ul className="space-y-3 text-gray-600">
                  <li>info@stendo.bg</li>
                  <li>+359 XXX XXX XXX</li>
                  <li>София, България</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-8 text-center text-gray-500">
              <p>&copy; 2025 Stendo. Всички права запазени.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}