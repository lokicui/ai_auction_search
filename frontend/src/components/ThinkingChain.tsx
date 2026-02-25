import { useEffect, useState } from "react";
import { Steps } from "antd";
import type { ThinkingStep } from "../types";

interface Props {
  steps: ThinkingStep[];
}

export default function ThinkingChain({ steps }: Props) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible < steps.length) {
      const timer = setTimeout(() => setVisible((v) => v + 1), 400);
      return () => clearTimeout(timer);
    }
  }, [visible, steps.length]);

  const items = steps.slice(0, visible).map((s, i) => ({
    title: (
      <span>
        {s.icon} {s.step}
      </span>
    ),
    description: s.detail,
    status: (i < visible - 1 ? "finish" : "process") as "finish" | "process",
  }));

  return (
    <div style={{ padding: "8px 0" }}>
      <Steps
        direction="vertical"
        size="small"
        current={visible - 1}
        items={items}
      />
    </div>
  );
}
