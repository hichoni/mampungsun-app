import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Feather, Heart, MessageCircle } from 'lucide-react';
import { BalloonIcon } from '@/components/icons';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <BalloonIcon className="h-8 w-8 text-primary" />
          <span className="ml-2 text-xl font-headline font-bold text-foreground">맘톡톡</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            로그인
          </Link>
          <Button asChild>
            <Link href="/signup" prefetch={false}>
              회원가입
            </Link>
          </Button>
          <Button asChild variant="secondary">
             <Link href="/teacher/login" prefetch={false}>
              교사용
            </Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary">
                    내 마음의 소리에 귀 기울여보세요
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    맘톡톡은 당신의 감정을 기록하고 공유하며, 따뜻한 위로와 응원을 받을 수 있는 안전한 공간입니다.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup" prefetch={false}>
                      맘톡톡 시작하기
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="Hero"
                data-ai-hint="balloons sky"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
              />
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-accent/20 px-3 py-1 text-sm text-accent-foreground font-medium">핵심 기능</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">마음 건강을 위한 특별한 기능들</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  맘톡톡은 학생들의 감정적 성장을 돕기 위해 설계되었습니다.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Feather className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline">감정 일기 (맘풍선)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>자신의 감정을 솔직하게 기록하고, '맘풍선'을 날려보세요. 일기는 비공개로 간직하거나, 다른 친구들과 공유할 수 있습니다.</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline">따뜻한 공감과 응원</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>친구들의 맘풍선에 공감하고, 미리 준비된 따뜻한 응원과 칭찬 메시지로 마음을 전해보세요. 긍정적인 상호작용이 가득한 공간입니다.</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline">AI 감정 분석 도우미</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>일기를 작성하면 AI가 감정을 분석해줘요. 내 마음을 더 잘 이해하고, 감정에 맞는 지지적인 메시지를 제안받을 수 있습니다.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                오늘, 당신의 마음에 날개를 달아주세요
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                지금 바로 가입하고 맘톡톡 커뮤니티의 일원이 되어보세요.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Button asChild size="lg" className="w-full">
                <Link href="/signup" prefetch={false}>
                  무료로 시작하기
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 맘톡톡. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            이용약관
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            개인정보처리방침
          </Link>
        </nav>
      </footer>
    </div>
  );
}
