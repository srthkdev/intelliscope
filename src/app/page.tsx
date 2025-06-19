import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border">
        <div className="text-xl font-bold tracking-tight">IntelliScope</div>
        <div className="flex gap-4">
          <Link href="/login" className="btn btn-outline">Login</Link>
          <Link href="/register" className="btn btn-primary">Register</Link>
        </div>
      </nav>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">AI-Powered Investigations</h1>
        <p className="text-lg md:text-2xl text-muted-foreground mb-8 max-w-2xl">
          Unleash the power of collaborative, AI-driven research. Investigate, analyze, and discover insights faster than ever with IntelliScope.
        </p>
        <Link href="/register" className="btn btn-primary text-lg px-8 py-3">Get Started</Link>
      </main>
      <footer className="py-4 text-center text-muted-foreground border-t border-border text-sm">
        &copy; {new Date().getFullYear()} IntelliScope. All rights reserved.
      </footer>
    </div>
  );
}
