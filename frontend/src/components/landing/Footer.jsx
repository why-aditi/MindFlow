import { motion } from 'framer-motion'

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white py-16 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-24 h-24 bg-teal-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <span className="text-white font-bold text-sm">MF</span>
              </div>
              <span className="text-xl font-light">MindFlow</span>
            </div>
            <p className="text-slate-300 font-light leading-relaxed">
              Your gentle companion on the journey to inner peace and mental wellness. Nurturing minds, one breath at a time.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-light text-white">Quick Links</h3>
            <ul className="space-y-3">
              {['About', 'Features', 'Wellness', 'Rewards', 'Contact'].map((link) => (
                <li key={link}>
                  <a href={`#${link.toLowerCase()}`} className="text-slate-300 hover:text-emerald-400 transition-colors font-light">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-light text-white">Support</h3>
            <ul className="space-y-3">
              {['Help Center', 'Privacy Policy', 'Terms of Service', 'Crisis Support', 'Community Guidelines'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-slate-300 hover:text-emerald-400 transition-colors font-light">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-light text-white">Connect With Us</h3>
            <div className="space-y-3">
              <p className="text-slate-300 font-light">support@mindflow.app</p>
              <p className="text-slate-300 font-light">1-800-MINDFLOW</p>
              <div className="flex space-x-4">
                {[
                  { name: 'Twitter', icon: '🐦' },
                  { name: 'Instagram', icon: '📸' },
                  { name: 'Discord', icon: '💬' }
                ].map((social) => (
                  <a 
                    key={social.name} 
                    href="#" 
                    className="text-slate-300 hover:text-emerald-400 transition-colors font-light flex items-center space-x-1"
                  >
                    <span>{social.icon}</span>
                    <span>{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="border-t border-slate-700 mt-12 pt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <p className="text-slate-400 font-light">
            © 2024 MindFlow. All rights reserved. Built with 💚 for your mental wellness journey.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
