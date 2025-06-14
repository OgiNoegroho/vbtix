import { LoginForm } from "~/components/auth/login-form"

export default function Page() {
  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>        {/* Main Content - Left Aligned Layout */}
      <div className="relative z-10 flex h-full w-full items-center justify-start pl-8 lg:pl-16">
        <div className="flex w-auto max-w-md h-auto max-h-[450px] bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-border/20">
          {/* Login Form Container */}
          <div className="w-[400px] px-8 py-10 flex items-center justify-center bg-gradient-to-br from-background/95 to-muted/30 backdrop-blur-sm">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}