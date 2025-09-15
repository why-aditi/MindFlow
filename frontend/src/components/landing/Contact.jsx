import { motion } from 'framer-motion'
import { Button } from '../ui/Button'

const Contact = () => {
  const contactMethods = [
    {
      icon: "💌",
      title: "Email Support",
      description: "Get help from our compassionate support team",
      contact: "support@mindflow.app",
      response: "Usually within 24 hours"
    },
    {
      icon: "💬",
      title: "Live Chat",
      description: "Chat with our wellness specialists in real-time",
      contact: "Available 9 AM - 9 PM EST",
      response: "Instant response"
    },
    {
      icon: "📞",
      title: "Crisis Support",
      description: "24/7 mental health crisis support line",
      contact: "1-800-MINDFLOW",
      response: "Always available"
    },
    {
      icon: "🤝",
      title: "Community",
      description: "Connect with others on their wellness journey",
      contact: "Join our Discord",
      response: "Peer support"
    }
  ]

  const faqs = [
    {
      question: "Is MindFlow suitable for beginners?",
      answer: "Absolutely! MindFlow is designed for all experience levels. We provide gentle guidance and beginner-friendly practices to help you start your wellness journey at your own pace."
    },
    {
      question: "How does the AI companion work?",
      answer: "Our AI companion uses advanced natural language processing to provide compassionate, personalized support. It's trained on mental health best practices and is available 24/7 to listen and guide you."
    },
    {
      question: "Is my data private and secure?",
      answer: "Your privacy is our top priority. All your journal entries, conversations, and personal data are encrypted and stored securely. We never share your information without your explicit consent."
    },
    {
      question: "Can I use MindFlow without VR equipment?",
      answer: "Yes! While VR enhances the experience, all core features including meditation, journaling, and AI conversations work perfectly on any device without VR equipment."
    }
  ]

  return (
    <section id="contact" className="py-24 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-36 h-36 bg-emerald-100/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-40 h-40 bg-teal-100/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.1, 0.3]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-6xl font-light text-slate-800 mb-6 leading-tight">
            Get Support on Your{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent font-normal">
              Wellness Journey
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
            Our compassionate team is here to support you every step of the way. Whether you need technical help, wellness guidance, or crisis support, we're just a message away.
          </p>
        </motion.div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {contactMethods.map((method, index) => (
            <motion.div
              key={method.title}
              className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/30 text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="text-4xl mb-4">{method.icon}</div>
              <h3 className="text-xl font-light text-slate-800 mb-2">{method.title}</h3>
              <p className="text-slate-600 text-sm font-light mb-4 leading-relaxed">{method.description}</p>
              <div className="space-y-2">
                <p className="text-emerald-600 font-medium text-sm">{method.contact}</p>
                <p className="text-slate-500 text-xs">{method.response}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div 
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-light text-slate-800 mb-4">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent font-normal">
                Questions
              </span>
            </h3>
            <p className="text-lg text-slate-600 font-light">
              Find answers to common questions about MindFlow and your wellness journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <h4 className="text-lg font-medium text-slate-800 mb-3">{faq.question}</h4>
                <p className="text-slate-600 font-light leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-white/30 max-w-4xl mx-auto">
            <h3 className="text-3xl lg:text-4xl font-light text-slate-800 mb-4">
              Ready to Start Your{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent font-normal">
                Wellness Journey?
              </span>
            </h3>
            <p className="text-lg text-slate-600 mb-8 font-light max-w-2xl mx-auto">
              Join our community of mindful individuals who are transforming their mental health. Your journey to inner peace starts today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Get Started Free
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg font-medium rounded-full border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-emerald-700 transition-all duration-300"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Contact
