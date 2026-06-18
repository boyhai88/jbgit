import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-3">
          <CardTitle className="text-4xl font-bold tracking-normal">
            JBGIT
          </CardTitle>
          <CardDescription className="text-base">
            全球开发者协作平台
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full sm:w-auto">开始使用</Button>
        </CardContent>
      </Card>
    </main>
  );
}
