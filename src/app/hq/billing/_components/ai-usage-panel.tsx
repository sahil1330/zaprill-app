import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type AiActionStat,
  type AiErrorStat,
  failureRate,
  formatFailurePercent,
} from "@/services/ai/admin-usage";

export function AiUsagePanel({
  actions,
  errors,
}: {
  actions: AiActionStat[];
  errors: AiErrorStat[];
}) {
  const success = actions.reduce((sum, row) => sum + row.successCount, 0);
  const failed = actions.reduce((sum, row) => sum + row.failureCount, 0);
  const rate = formatFailurePercent(failureRate(success, failed));

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Cost by feature</CardTitle>
          <CardDescription>
            Tokens and estimated USD for the selected window. Failure rate{" "}
            {rate}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b">
                  <th className="h-10 px-2 text-left font-medium text-muted-foreground">
                    Feature
                  </th>
                  <th className="h-10 px-2 text-right font-medium text-muted-foreground">
                    Calls
                  </th>
                  <th className="h-10 px-2 text-right font-medium text-muted-foreground">
                    Tokens
                  </th>
                  <th className="h-10 px-2 text-right font-medium text-muted-foreground">
                    Est. cost
                  </th>
                  <th className="h-10 px-2 text-right font-medium text-muted-foreground">
                    Failures
                  </th>
                </tr>
              </thead>
              <tbody>
                {actions.map((row) => (
                  <tr key={row.action} className="border-b">
                    <td className="p-2 font-medium">{row.label}</td>
                    <td className="p-2 text-right">
                      {row.calls.toLocaleString()}
                    </td>
                    <td className="p-2 text-right">
                      {row.tokens.toLocaleString()}
                    </td>
                    <td className="p-2 text-right font-mono">
                      ${row.costUsd.toFixed(4)}
                    </td>
                    <td className="p-2 text-right">{row.failureCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>AI failures</CardTitle>
          <CardDescription>
            Latest unsuccessful model calls in this window. No prompts are
            stored here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errors.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No AI failures in this window.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {errors.map((row) => (
                <li
                  key={`${row.createdAt}-${row.action}-${row.errorCode}`}
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="font-medium">{row.label}</span>
                  {" · "}
                  {row.model}
                  {" · "}
                  {row.errorCode ?? "unknown"}
                  {row.latencyMs !== null ? ` · ${row.latencyMs} ms` : ""}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
