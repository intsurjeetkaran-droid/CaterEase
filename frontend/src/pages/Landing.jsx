
import { Link } from 'react-router-dom'
import {
  Search, ChefHat, ArrowRight, UtensilsCrossed, Star, Shield,
  Clock, TrendingUp, CheckCircle, Sparkles, Users, Award, Heart, CreditCard
} from 'lucide-react'

function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 py-16 sm:py-24 lg:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTEsMTQ2LDYwLDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-orange-600 text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-full mb-6 shadow-sm">
            <Sparkles size={14} />
            Plan your catering visually
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Catering made <span className="text-orange-500">simple</span><br className="hidden sm:block" /> &amp; delicious
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Browse top catering providers, build your menu interactively, and get live pricing — all in one place.
          </p>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search event type or cuisine..."
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm shadow-sm"
              />
            </div>
            <Link
              to="/register"
              className="bg-orange-500 text-white px-6 sm:px-8 py-3.5 rounded-xl font-semibold hover:bg-orange-600 transition-all flex items-center gap-2 justify-center shadow-lg hover:shadow-xl"
            >
              Get Started <ArrowRight size={16} />
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              <span>Verified Caterers</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-blue-500" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={16} className="text-yellow-500" />
              <span>Top Rated</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 sm:py-16 px-4 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {[
            { value: '500+', label: 'Happy Customers' },
            { value: '100+', label: 'Caterers' },
            { value: '2000+', label: 'Events Catered' },
            { value: '4.9/5', label: 'Avg Rating' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1">{stat.value}</p>
              <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">How it works</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Book your perfect catering in three simple steps</p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              icon: <Search size={28} className="text-orange-500" />,
              step: '01',
              title: 'Browse Providers',
              desc: 'Explore verified catering providers with menus, pricing, and customer reviews.',
            },
            {
              icon: <UtensilsCrossed size={28} className="text-orange-500" />,
              step: '02',
              title: 'Build Your Menu',
              desc: 'Select dishes, set quantities, and watch your total update in real time.',
            },
            {
              icon: <ChefHat size={28} className="text-orange-500" />,
              step: '03',
              title: 'Book & Track',
              desc: 'Confirm your order, make payments, and track every step to your event.',
            },
          ].map((f) => (
            <div key={f.title} className="relative bg-white rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all border border-gray-100 group">
              <div className="absolute top-4 right-4 text-5xl font-bold text-orange-50 group-hover:text-orange-100 transition-colors">
                {f.step}
              </div>
              <div className="flex justify-center mb-4 relative z-10">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed text-center">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="py-16 sm:py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Why choose CaterEase?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Everything you need for stress-free event catering</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Clock size={22} />, title: 'Real-Time Updates', desc: 'Track your order status from booking to completion' },
              { icon: <Shield size={22} />, title: 'Verified Caterers', desc: 'All providers are admin-approved and background-checked' },
              { icon: <CreditCard size={22} />, title: 'Flexible Payments', desc: 'Pay in advance or split payments — your choice' },
              { icon: <Star size={22} />, title: 'Quality Guaranteed', desc: 'Top-rated caterers with proven track records' },
              { icon: <Users size={22} />, title: 'Easy Management', desc: 'Manage everything from one simple dashboard' },
              { icon: <Heart size={22} />, title: '24/7 Support', desc: 'Our team is here to help whenever you need' },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-6 border border-gray-100 hover:border-orange-200 transition-all">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Caterers */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
                <ChefHat size={14} />
                For Catering Businesses
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Grow your catering business
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Join our platform and reach thousands of customers looking for quality catering services. Manage orders, track payments, and grow your business — all from one dashboard.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Get discovered by customers in your area',
                  'Manage orders and menus effortlessly',
                  'Track earnings and payment history',
                  'Build your reputation with reviews',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-700">
                    <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
              >
                Join as Caterer <ArrowRight size={16} />
              </Link>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl p-8 sm:p-12 shadow-xl">
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <ChefHat size={20} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">New Order!</p>
                      <p className="text-xs text-gray-500">Wedding · 200 guests</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold text-orange-500">₹45,000</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">24</p>
                    <p className="text-xs text-gray-500">Orders</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">₹2.4L</p>
                    <p className="text-xs text-gray-500">Earnings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Loved by customers</h2>
            <p className="text-gray-500">See what our users have to say</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Priya Sharma',
                role: 'Event Planner',
                text: 'CaterEase made planning my client\'s wedding so easy. The live pricing and menu builder saved me hours!',
                rating: 5,
              },
              {
                name: 'Rajesh Kumar',
                role: 'Corporate Manager',
                text: 'We use CaterEase for all our office events. The caterers are professional and the platform is super intuitive.',
                rating: 5,
              },
              {
                name: 'Anita Desai',
                role: 'Catering Business Owner',
                text: 'Since joining CaterEase, my bookings have tripled. The dashboard makes managing orders a breeze!',
                rating: 5,
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600 font-semibold text-sm">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                    <p className="text-xs text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular cuisines */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Popular cuisines</h2>
            <p className="text-gray-500">From traditional to fusion — we have it all</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'North Indian', emoji: '🍛' },
              { name: 'South Indian', emoji: '🥘' },
              { name: 'Chinese', emoji: '🥡' },
              { name: 'Continental', emoji: '🍝' },
              { name: 'Desserts', emoji: '🍰' },
              { name: 'Beverages', emoji: '🥤' },
            ].map((cuisine) => (
              <div
                key={cuisine.name}
                className="bg-white rounded-xl p-4 sm:p-6 text-center border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="text-3xl sm:text-4xl mb-2">{cuisine.emoji}</div>
                <p className="text-xs sm:text-sm font-medium text-gray-700">{cuisine.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-16 sm:py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to plan your event?</h2>
          <p className="text-orange-100 mb-8 text-base sm:text-lg">Join thousands of happy customers and providers.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/register"
              className="bg-white text-orange-500 font-semibold px-6 sm:px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors shadow-lg"
            >
              Sign up as Customer
            </Link>
            <Link
              to="/register"
              className="border-2 border-white text-white font-semibold px-6 sm:px-8 py-3 rounded-xl hover:bg-orange-600 transition-colors"
            >
              Join as Caterer
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-white mb-4">
              <UtensilsCrossed size={20} />
              <span className="font-bold text-lg">CaterEase</span>
            </div>
            <p className="text-sm leading-relaxed">
              Your trusted platform for hassle-free event catering. Quality food, reliable service.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">For Customers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register" className="hover:text-orange-400 transition-colors">Browse Caterers</Link></li>
              <li><Link to="/register" className="hover:text-orange-400 transition-colors">How It Works</Link></li>
              <li><Link to="/login" className="hover:text-orange-400 transition-colors">My Orders</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">For Caterers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register" className="hover:text-orange-400 transition-colors">Join Platform</Link></li>
              <li><Link to="/login" className="hover:text-orange-400 transition-colors">Manage Orders</Link></li>
              <li><Link to="/login" className="hover:text-orange-400 transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-orange-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 border-t border-gray-800 text-center text-sm">
          © 2026 CaterEase. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default Landing
