import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

type MathContentProps = {
  content: string;
  className?: string;
};

function MathContent({ content, className = "" }: MathContentProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MathContent;