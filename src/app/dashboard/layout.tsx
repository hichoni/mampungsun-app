import Link from "next/link"
import {
  Bell,
  Home,
  BookUser,
  PlusCircle,
  LogOut,
  User,
  MessageSquare,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BalloonIcon } from "@/components/icons"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <BalloonIcon className="h-6 w-6 text-primary" />
              <span className="font-headline text-lg">맘풍선</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Home className="h-4 w-4" />
                모두의 맘풍선
              </Link>
              <Link
                href="/dashboard/my-diary"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <BookUser className="h-4 w-4" />
                나의 일기
              </Link>
              <Link
                href="/dashboard/chat"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <MessageSquare className="h-4 w-4" />
                마음 대화
              </Link>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <User className="h-4 w-4" />
                프로필
              </Link>
            </nav>
          </div>
          <div className="mt-auto p-4">
             <Button size="sm" className="w-full" asChild>
                <Link href="/dashboard/new-entry">
                  <PlusCircle className="h-4 w-4 mr-2"/>
                  새로운 맘풍선 날리기
                </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
            {/* Can add a search bar here later */}
          </div>
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">로그아웃</span>
            </Link>
          </Button>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-secondary/20">
          {children}
        </main>
      </div>
    </div>
  )
}
