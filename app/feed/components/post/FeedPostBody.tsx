import { Badge } from "@/components/ui/badge";

interface FeedPostBodyProps {
  title: string;
  description: string;
  category?: string;
}

export function FeedPostBody({
  title,
  description,
  category,
}: FeedPostBodyProps) {
  return (
    <div className="p-4 pt-2 space-y-2">
      <div className="flex items-start justify-between gap-4">
        <h4 className="text-lg font-bold text-foreground leading-snug line-clamp-2">
          {title}
        </h4>
        {category && (
          <Badge variant="secondary" className="whitespace-nowrap shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border-0">
            {category}
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground/90 whitespace-pre-wrap leading-relaxed line-clamp-3">
        {description}
      </p>
    </div>
  );
}
