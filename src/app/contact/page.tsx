"use client";
import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    q: "1. What exactly is Fragview?",
    a: "Fragview is a place to explore perfumes at your own pace. You can browse scents, understand how they feel, and keep track of the fragrances that catch your attention—without being pushed to buy anything."
  },
  {
    q: "2. Can I submit a perfume or brand suggestion?",
    a: "Yes. If you think we’re missing something, you can submit a perfume and we’ll review it before adding it to the collection."
  },
  {
    q: "3. Are the perfumes on Fragview for sale?",
    a: "No. Fragview doesn’t sell perfumes. We help you discover and learn about them, so you can decide where and how you want to buy."
  },
  {
    q: "4. How do I find perfumes that suit me?",
    a: "You can explore by brand, notes, mood, season, or personal preference. There’s no right path—just start with what feels familiar or interesting."
  },
  {
    q: "5. Is Fragview beginner-friendly?",
    a: "Yes. You don’t need to know perfume terms or categories. Everything is written to be simple, human, and easy to understand—even if you’re just starting out."
  },
  {
    q: "6. What is “My Wardrobe”?",
    a: "It’s your personal space to save perfumes you like, want to try, or want to remember. Think of it as a quiet shelf for your scent ideas."
  },
  {
    q: "7. How often is the perfume information updated?",
    a: "We regularly add new perfumes and update existing details so the catalog stays fresh, relevant, and useful."
  },
  {
    q: "8. Is Fragview free to use?",
    a: "Yes. Fragview is completely free. There are no hidden charges."
  }
];

export default function ContactPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <main className="bg-fv-parchment">

      {/* WHITE BACKGROUND WRAPPER */}
      <div className="bg-white text-black">

        {/* HERO */}
        <section className="relative h-[250px]">
          <Image
            src="/contact.webp"
            alt="Contact Us"
            fill
            sizes="(max-width: 1024px) 100vw, 570px"
            className="object-cover"
            priority
          />

          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 flex h-full items-center px-4 sm:px-6 lg:px-[72px] max-w-[1296px] mx-auto">
            {/* FORCE HERO TEXT WHITE */}
            <div className="max-w-xl text-white">
              <h1 className="
    text-[48px]     
    leading-[56px]  
    font-normal     
    tracking-normal 
    " style={{ fontFamily: 'Hedvig Letters Serif' }}>
                How can we help you?
              </h1>

              <p
                className="
    mt-4
    text-[20px]   
    leading-[28px]  
    font-normal
    tracking-normal
    opacity-90
  "
                style={{ fontFamily: 'Inter' }}
              >
                We read, test, and talk about fragrances, so whether you have a question,
                feedback, or just want to say hello, we’re always happy to hear from you.
              </p>

            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-[1296px] mx-auto px-4 sm:px-6 lg:px-[72px] py-16">
          <p
            className="text-[24px] leading-[32px] font-normal text-[#B08D57]"
            style={{ fontFamily: 'Hedvig Letters Serif' }}
          >
            Frequently asked questions
          </p>


          <h2 className="mb-8 font-hedvig text-[48px] leading-[56px] font-normal text-black">
            Find answers to your queries
          </h2>


          <div className="border rounded-xl bg-white divide-y">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div key={index} className="px-6 py-5">

                  {/* QUESTION ROW */}
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left text-black"
                  >
                    <span className="font-inter font-medium text-[24px] leading-[32px] tracking-[0]">
                      {faq.q}
                    </span>


                    <span className="ml-4 flex h-6 w-6 items-center justify-center rounded bg-black text-white text-sm">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>

                  {/* ANSWER */}
                  {isOpen && (
                    <div className="mt-3 text-lg text-fv-text-muted max-w-3xl">
                      {faq.a}

                      {/* OPTIONAL LINK (like screenshot) */}
                      <div className="mt-2 text-left">
                        <a
                          // href={faq.link}
                          className="
        inline-block
        font-inter
        font-medium
        text-black
        text-[20px]
        leading-[28px]
        underline
        underline-offset-1 cursor-pointer
      "
                        >
                          Submit Perfume →
                        </a>
                      </div>
                    </div>

                  )}
                </div>
              );
            })}
          </div>

        </section>

      </div>

      {/* CTA */}
      <section className="border-t bg-[#FFF8ED]">
        <div className="max-w-[1296px] mx-auto px-4 sm:px-6 lg:px-[72px] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p
              className="text-[24px] leading-[32px] font-normal text-[#B08D57]"
              style={{ fontFamily: 'Hedvig Letters Serif' }}
            >
              Still have a question?
            </p>



            <h2
              className="mb-8 font-hedvig text-[48px] leading-[56px] font-normal text-black"
            >
              Reach out to us, anytime
            </h2>

          </div>

          <a
            href="mailto:info@fragview.com"
            className="inline-flex items-center gap-4 px-6 py-3 rounded-full border border-black bg-[#FBF6EE] hover:bg-[#F5EEDF] transition-colors"
          >
            {/* Icon */}
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-black">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 7.5L12 13.5L21 7.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect
                  x="3"
                  y="6"
                  width="18"
                  height="12"
                  rx="2"
                  stroke="white"
                  strokeWidth="2"
                />
              </svg>
            </span>

            {/* Email text */}
            <span
              className="text-black"
              style={{
                fontFamily: '"Hedvig Letters Serif", serif',
                fontWeight: 400,
                fontSize: "24px",
                lineHeight: "32px",
              }}
            >
              info@fragview.com
            </span>
          </a>


        </div>
      </section>

    </main>
  );

}
