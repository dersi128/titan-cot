import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
        <p>This section is a placeholder for a later phase.</p>
      </CardContent>
    </Card>
  )
}
