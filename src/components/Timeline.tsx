import { motion } from 'framer-motion';

interface TimelineItem {
  content: string;
  date: string;
}

interface TimelineProps {
  data: TimelineItem[];
}


export function Timeline({ data }: TimelineProps) {
  return (
    <ol className="prose prose-sm relative ml-4 border-l border-dashed border-gray-200 dark:border-gray-700">
      {data.map((item, index) => (
        <li key={index} className="mb-6 ml-6 relative">
          <div className="absolute -left-7.5 top-1.5 h-3 w-3 rounded-full border border-white bg-gray-200 dark:border-gray-800 dark:bg-gray-700" />
          <motion.div
            className="space-y-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div dangerouslySetInnerHTML={{ __html: item.content }} />
            <div className="text-muted-foreground">{item.date}</div>
          </motion.div>
        </li>
      ))}
    </ol>
  );
}