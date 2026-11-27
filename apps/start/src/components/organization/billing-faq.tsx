import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Widget, WidgetHead } from '@/components/widget';

const questions = [
  {
    question: 'Is there a free plan?',
    answer: [
      'No, but every new account starts with a 30-day free trial of up to 100,000 events, with every feature and no card needed.',
      'After that, plans start at $1 a month.',
    ],
  },
  {
    question: 'What happens if I go over my plan?',
    answer: [
      'Nothing is lost and nothing extra is charged. We keep recording every event; your charts pause until you move to a bigger plan or your next billing period starts, and then everything recorded in between shows up.',
      'We email you at 80% and at 100%, so it never comes as a surprise.',
    ],
  },
  {
    question: 'Can I change plan or cancel later?',
    answer: [
      'Any time, from this page. Upgrades apply straight away. If you cancel, your plan keeps running until the end of the period you paid for, and recording stops 7 days after that.',
    ],
  },
  {
    question: 'Can I get a refund?',
    answer: [
      'Yes: your first payment is refunded in full if you ask within 14 days. Email hello@flarepanel.dev from the address on your account.',
    ],
  },
  {
    question: 'Who handles the payment?',
    answer: [
      'Polar, our payment partner and merchant of record. Polar issues your invoice and adds VAT or sales tax at checkout where it applies. You can update your card and download invoices in the customer portal.',
    ],
  },
  {
    question: 'We track more than 50M events. Can you help?',
    answer: [
      'Yes. Email hello@flarepanel.dev and we will set up a plan for your volume.',
    ],
  },
];

export function BillingFaq() {
  return (
    <Widget className="w-full">
      <WidgetHead className="flex items-center justify-between">
        <span className="title">Questions</span>
      </WidgetHead>
      <Accordion
        className="w-full max-w-screen-md self-center"
        collapsible
        type="single"
      >
        {questions.map((q) => (
          <AccordionItem key={q.question} value={q.question}>
            <AccordionTrigger className="px-4 text-left">
              {q.question}
            </AccordionTrigger>
            <AccordionContent>
              <div className="col gap-2 p-4 pt-2">
                {q.answer.map((a) => (
                  <p key={a}>{a}</p>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Widget>
  );
}
