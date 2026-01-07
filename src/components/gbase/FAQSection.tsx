
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "What counts as a transaction?",
    answer:
      "Only transactions sent through the gBase app count toward your stats. Each gBase transaction is a verified on-chain action on the Base network.",
  },
  {
    question: "How often can I send gBase?",
    answer:
      "You can send gBase anytime, but only one transaction per hour is counted toward your in-app stats. This ensures fair and consistent activity tracking.",
  },
  {
    question: "What is Wallet Strength?",
    answer:
      "Wallet Strength reflects your activity level based on total transactions and active days. Labels range from New → Warming → Active → Strong → Very Strong.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Yes! gBase only reads public blockchain data. We never access your private keys or sensitive wallet information.",
  },
  {
    question: "Can I share my stats?",
    answer:
      "Absolutely! After each transaction, you can share your activity to Farcaster with one tap. Show off your wallet strength!",
  },
];

const FAQSection = () => {
  return (
    <div className="bg-card rounded-xl border border-border">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="faq-header" className="border-b">
          <AccordionTrigger className="px-4 py-4 hover:no-underline">
            <span className="font-semibold">FAQ</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-2">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`faq-${index}`} className="border-b last:border-0">
                  <AccordionTrigger className="py-3 text-left text-sm hover:no-underline">
                    <span className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-3">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FAQSection;
