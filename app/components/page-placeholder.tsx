import { Card } from "antd";

interface PagePlaceholderProps {
  title: string;
  description: string;
}

export function PagePlaceholder({
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <Card className="page-card" bordered={false}>
      <div className="page-hero">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div style={{ padding: "0 28px 28px" }}>
        <Card
          style={{
            borderRadius: 20,
            borderColor: "rgba(21, 32, 51, 0.06)",
          }}
        >
          {description}
        </Card>
      </div>
    </Card>
  );
}
