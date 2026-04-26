"use client";

import {
  GitBranch,
  Globe,
  Key,
  Mail,
  Phone,
  ShieldCheck,
  UserX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AUTH_FEATURES = [
  {
    icon: Mail,
    title: "Email & Password",
    description:
      "Min 8 chars, max 30 chars. Email verification required before sign-in.",
    enabled: true,
  },
  {
    icon: Globe,
    title: "Google OAuth",
    description: "Uses GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET.",
    enabled: true,
  },
  {
    icon: GitBranch,
    title: "GitHub OAuth",
    description: "Uses GITHUB_CLIENT_ID + GITHUB_CLIENT_SECRET.",
    enabled: true,
  },
  {
    icon: Phone,
    title: "Phone Number (OTP)",
    description: "OTP sent via email (emailOTP plugin). Phone sign-in enabled.",
    enabled: true,
  },
  {
    icon: UserX,
    title: "Anonymous Sign-in",
    description:
      "Allows anonymous sessions before the user creates an account.",
    enabled: true,
  },
  {
    icon: Key,
    title: "JWKS / Session Signing",
    description:
      "Keys stored in the `jwks` table. Sessions use cross-subdomain cookies on zaprill.com.",
    enabled: true,
  },
];

const TRUSTED_ORIGINS = [
  "http://localhost:3000",
  "http://lvh.me:3000",
  "http://hq.lvh.me:3000",
  "https://app.zaprill.com",
  "https://hq.zaprill.com",
];

export function AuthConfigTab() {
  return (
    <div className="space-y-6">
      {/* Read-only notice */}
      <div className="flex items-start gap-3 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>
          Auth configuration is defined in{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            src/lib/auth.ts
          </code>{" "}
          and requires a code change + redeploy to modify. This view is
          read-only.
        </p>
      </div>

      {/* Active Features */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Active Auth Features
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {AUTH_FEATURES.map((feature) => (
            <Card key={feature.title} className="flex gap-0">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm">{feature.title}</CardTitle>
                      <Badge
                        variant={feature.enabled ? "default" : "secondary"}
                        className="text-xs shrink-0"
                      >
                        {feature.enabled ? "On" : "Off"}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs mt-0.5">
                      {feature.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Trusted Origins */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Trusted Origins
        </h3>
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {TRUSTED_ORIGINS.map((origin) => (
                <div
                  key={origin}
                  className="flex items-center gap-3 rounded-md bg-muted/50 px-3 py-2"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <code className="font-mono text-xs">{origin}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Config */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Session Config
        </h3>
        <Card>
          <CardContent className="pt-4">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Cookie Domain</dt>
                <dd className="font-medium font-mono text-xs mt-0.5">
                  .zaprill.com (prod) / localhost (dev)
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  Cross-subdomain Cookies
                </dt>
                <dd className="font-medium mt-0.5">
                  <Badge variant="default" className="text-xs">
                    Enabled
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email Verification</dt>
                <dd className="font-medium mt-0.5">
                  Required · Auto sign-in after verify
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Password Length</dt>
                <dd className="font-medium mt-0.5">8 – 30 characters</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
