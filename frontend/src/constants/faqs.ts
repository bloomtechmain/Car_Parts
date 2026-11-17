export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqGroup {
  id: string;
  title: string;
  items: FaqItem[];
}

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'requests',
    title: 'Requesting a part',
    items: [
      {
        question: 'Is it free to submit a part request?',
        answer:
          'Yes, completely free. There are no charges for customers to submit a request, receive quotes, or contact suppliers through our platform. We earn from suppliers who use our platform to connect with customers.',
      },
      {
        question: 'How long does it take to receive quotes?',
        answer:
          'Most customers receive their first supplier quote within a few hours. In some cases, especially for rare parts, it may take up to 24–48 hours. We notify you by email as soon as we have quotes ready.',
      },
      {
        question: 'Can I request both OEM and aftermarket parts?',
        answer:
          "Yes. In the part description, you can specify whether you prefer OEM (original equipment manufacturer) parts, aftermarket alternatives, or if you're open to both. Our suppliers stock a wide range and will indicate what type of part they're quoting.",
      },
      {
        question: 'Can I submit a request for multiple parts at once?',
        answer:
          "Currently, each submission is for one specific part. If you need multiple parts, you're welcome to submit separate requests for each. This helps suppliers respond more accurately to each individual part.",
      },
      {
        question: 'Do I need my VIN?',
        answer:
          'It is optional, but it helps. The VIN pins down the exact engine, trim and production run, which is often the difference between a part that fits and one that almost fits. You will find it at the base of the windscreen, on the driver-side door pillar, or on your registration documents.',
      },
    ],
  },
  {
    id: 'quotes',
    title: 'Quotes & ordering',
    items: [
      {
        question: 'What happens after I receive a quote?',
        answer:
          'Our team reviews the quotes suppliers send in and passes the best options on to you by email and SMS, each with a price and delivery time. You pick the option you want from the link we send, and we confirm the order with you.',
      },
      {
        question: "How do I know I'm getting a fair price?",
        answer:
          "Because multiple suppliers respond to each request and compete for your business, you're naturally getting market-competitive pricing. Our team also checks every quote before it is passed on to you.",
      },
      {
        question: 'What if no suppliers have the part I need?',
        answer:
          "In rare cases where no supplier can fulfill a request, we'll let you know as soon as possible. Our team will also make suggestions for alternative parts or alternative suppliers outside our immediate network when possible.",
      },
      {
        question: 'Is CarParts Finder available outside the UAE?',
        answer:
          "Currently, our supplier network is focused on the UAE. We are working on expanding to other GCC countries. If you're outside the UAE, feel free to submit a request and we'll do our best to assist.",
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy & trust',
    items: [
      {
        question: 'Will suppliers be able to see my contact information?',
        answer:
          'No. Suppliers only see your part request details — the car make, model, year, and what part you need. Your name, email, phone number, and location are never shared with suppliers. All communication is managed through our team.',
      },
      {
        question: 'How are your suppliers verified?',
        answer:
          'Every supplier on our platform goes through a verification process before they can access customer requests. We verify their trade license, physical location, and contact details. Suppliers are regularly reviewed based on the quality of their responses.',
      },
    ],
  },
  {
    id: 'suppliers',
    title: 'For suppliers',
    items: [
      {
        question: 'How do I join as a supplier?',
        answer:
          'Get in touch through the contact page. Once we have checked your trade license and location, we set up a supplier account for you and you can log in to the supplier portal straight away.',
      },
      {
        question: 'What do I see when a request comes in?',
        answer:
          'The vehicle (make, model, year and VIN if given), the part, its category and any notes the customer added. You never see the customer’s personal details — that keeps the conversation about the part.',
      },
      {
        question: 'How do I quote?',
        answer:
          'Open the request in the portal and send your price, how many days delivery takes, any notes, and a photo of the part if you have one. Our team reviews it and, if it is one of the best options, it goes to the customer.',
      },
    ],
  },
];

export const ALL_FAQS: FaqItem[] = FAQ_GROUPS.flatMap((g) => g.items);
