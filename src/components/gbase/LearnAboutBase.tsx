
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ExternalLink } from "lucide-react";

const links = [
  {
    label: "Base Docs",
    url: "https://docs.base.org",
  },
  {
    label: "About Base Network",
    url: "https://base.org",
  },
];

const LearnAboutBase = () => {
  return (
    <div className="bg-card rounded-xl border border-border">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="learn" className="border-0">
          <AccordionTrigger className="px-4 py-4 hover:no-underline">
            <span className="font-semibold">Learn About Base</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-sm text-muted-foreground mb-4">
              Base is a secure, low-cost, developer-friendly Ethereum L2 built to bring the next billion users onchain.
            </p>
            <div className="space-y-2">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary text-sm hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  {link.label}
                </a>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default LearnAboutBase;
