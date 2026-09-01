import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { copy } from "@/lib/labels"

export function ComingSoon({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>{body}</p>
        <p className="text-xs text-muted-foreground">{copy.comingSoon}</p>
      </CardContent>
    </Card>
  )
}
