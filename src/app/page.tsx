import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MessageCircle, Shield, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-24">
        <Link href="/" className="flex items-center gap-4">
          <Image src="/icon-balloon2.png" data-ai-hint="blue balloon" alt="맘풍선 로고" width={64} height={64} />
          <h1 className="text-4xl font-headline font-bold text-primary">맘풍선</h1>
        </Link>
        <nav className="flex gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">학생 로그인</Link>
          </Button>
          <Button asChild>
            <Link href="/teacher/login">교사 로그인</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="text-center py-20 lg:py-32 bg-primary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-gray-800 mb-4">
              마음 속 풍경을 선물하다
            </h2>
            <p className="text-lg md:text-xl text-foreground max-w-2xl mx-auto mb-8">
              맘풍선은 여러분의 마음을 표현하고, 따뜻한 응원을 주고받는 안전한 공간입니다.
            </p>
            <Button asChild size="lg">
              <Link href="/login">지금 마음 표현하기</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-headline font-bold text-primary">주요 기능</h3>
              <p className="text-muted-foreground mt-2">맘풍선은 이런 멋진 기능들을 제공해요.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-destructive/10 rounded-full p-3 w-fit">
                    <Heart className="h-8 w-8 text-destructive" />
                  </div>
                  <CardTitle className="font-headline mt-4">감정 일기 (맘풍선)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">나의 감정을 솔직하게 기록하고, 공개 또는 비공개로 친구들과 나눌 수 있어요.</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-primary/20 rounded-full p-3 w-fit">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-headline mt-4">따뜻한 응원</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">친구들의 이야기에 공감하고, AI가 추천해주는 따뜻한 응원 메시지로 마음을 전해요.</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-accent/50 rounded-full p-3 w-fit">
                    <Shield className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <CardTitle className="font-headline mt-4">안전한 AI 코칭</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">AI 친구 '마음이'와 대화하며 감정을 탐색하고, 긍정적인 지지를 받을 수 있어요.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Creators Section */}
        <section className="bg-primary/10 py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mx-auto bg-accent/50 rounded-full p-4 w-fit mb-6">
                <Users className="h-10 w-10 text-accent-foreground" />
            </div>
            <h3 className="text-3xl md:text-4xl font-headline font-bold text-primary">만든 사람들</h3>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
                '맘풍선'은 학생들의 마음 건강을 최우선으로 생각하는 풍천풍서초등학교 선생님들이 모여 시작된 프로젝트입니다. 저희는 모든 학생이 자신의 감정을 안전하게 표현하고, 따뜻한 지지를 받으며 성장할 수 있는 공간을 만들고 싶었습니다.
            </p>
          </div>
        </section>
        
        {/* Call to Action Section */}
        <section className="bg-secondary/50 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-3xl font-headline font-bold text-secondary-foreground mb-4">
              당신의 마음을 들려주세요
            </h3>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              지금 바로 맘풍선에 참여하여 마음을 나누고, 따뜻한 위로와 응원을 경험해보세요.
            </p>
            <div className="flex justify-center gap-4">
               <Button asChild size="lg">
                <Link href="/login">학생으로 시작하기</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/teacher/login">교사로 시작하기</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} 맘풍선. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
