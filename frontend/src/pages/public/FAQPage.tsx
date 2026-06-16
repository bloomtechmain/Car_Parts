import { motion } from 'framer-motion';
import Accordion, { type AccordionItem } from '../../components/ui/Accordion';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

const faqs: AccordionItem[] = [
  {
    question: 'Is it free to submit a part request?',
    answer: 'Yes, completely free. There are no charges for customers to submit a request, receive quotes, or contact suppliers through our platform. We earn from suppliers who use our platform to connect with customers.',
  },
  {
    question: 'How long does it take to receive quotes?',
    answer: 'Most customers receive their first supplier quote within a few hours. In some cases, especially for rare parts, it may take up to 24–48 hours. We notify you by email as soon as we have quotes ready.',
  },
  {
    question: 'Will suppliers be able to see my contact information?',
    answer: 'No. Suppliers only see your part request details — the car make, model, year, and what part you need. Your name, email, phone number, and location are never shared with suppliers. All communication is managed through our team.',
  },
  {
    question: 'How are your suppliers verified?',
    answer: 'Every supplier on our platform goes through a verification process before they can access customer requests. We verify their trade license, physical location, and contact details. Suppliers are regularly reviewed based on the quality of their responses.',
  },
  {
    question: 'Can I request both OEM and aftermarket parts?',
    answer: 'Yes. In the part description, you can specify whether you prefer OEM (original equipment manufacturer) parts, aftermarket alternatives, or if you\'re open to both. Our suppliers stock a wide range and will indicate what type of part they\'re quoting.',
  },
  {
    question: 'What happens after I receive a quote?',
    answer: 'Once our team has gathered quotes from interested suppliers, we\'ll contact you directly by phone or email to discuss your options. You can compare prices, ask questions about the parts, and make an informed decision with no pressure.',
  },
  {
    question: 'What if no suppliers have the part I need?',
    answer: 'In rare cases where no supplier can fulfill a request, we\'ll let you know as soon as possible. Our team will also make suggestions for alternative parts or alternative suppliers outside our immediate network when possible.',
  },
  {
    question: 'Can I submit a request for multiple parts at once?',
    answer: 'Currently, each submission is for one specific part. If you need multiple parts, you\'re welcome to submit separate requests for each. This helps suppliers respond more accurately to each individual part.',
  },
  {
    question: 'Is CarParts Finder available outside the UAE?',
    answer: 'Currently, our supplier network is focused on the UAE. We are working on expanding to other GCC countries. If you\'re outside the UAE, feel free to submit a request and we\'ll do our best to assist.',
  },
  {
    question: 'How do I know I\'m getting a fair price?',
    answer: 'Because multiple suppliers respond to each request and compete for your business, you\'re naturally getting market-competitive pricing. You can also use our platform to benchmark quotes against each other before deciding.',
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gold font-semibold text-sm tracking-widest uppercase mb-4"
          >
            FAQ
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg"
          >
            Everything you need to know about how CarParts Finder works.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Accordion items={faqs} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16 p-8 bg-navy-card border border-navy-border rounded-2xl"
        >
          <h3 className="text-xl font-bold text-white mb-2">Still have questions?</h3>
          <p className="text-slate-400 mb-6">Our team is happy to help. Reach out and we'll get back to you quickly.</p>
          <Link to="/contact">
            <Button>Contact Us</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
