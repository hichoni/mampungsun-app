import Link from "next/link"
import Image from "next/image"
import {
  Home,
  BookUser,
  PlusCircle,
  Wind,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { HeaderActions } from "@/components/header-actions"

const navLinksData = [
  { href: "/dashboard", icon: Home, label: "모두의 맘풍선" },
  { href: "/dashboard/my-diary", icon: BookUser, label: "나의 맘풍선" },
  { href: "/dashboard/chat", icon: Wind, label: "마음 바람" },
];


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[13.75rem_1fr] lg:grid-cols-[17.5rem_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Image src="/icon-balloon2.png" alt="맘풍선 로고" width={28} height={28} />
              <span className="font-headline text-lg">맘풍선</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navLinksData.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
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
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">내비게이션 메뉴 열기</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <SheetClose asChild>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-lg font-semibold mb-4"
                  >
                    <Image src="/icon-balloon2.png" alt="맘풍선 로고" width={28} height={28} />
                    <span className="font-headline text-lg">맘풍선</span>
                  </Link>
                </SheetClose>
                
                {navLinksData.map((link) => (
                   <SheetClose asChild key={`mobile-${link.href}`}>
                      <Link
                        href={link.href}
                        className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                   </SheetClose>
                ))}
              </nav>
              <div className="mt-auto">
                <SheetClose asChild>
                   <Button size="sm" className="w-full" asChild>
                      <Link href="/dashboard/new-entry">
                        <PlusCircle className="h-4 w-4 mr-2"/>
                        새로운 맘풍선 날리기
                      </Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Can add a search bar here later */}
          </div>
          <HeaderActions />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-secondary/20">
          {children}
        </main>
      </div>
    </div>
  )
}
