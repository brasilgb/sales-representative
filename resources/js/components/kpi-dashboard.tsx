
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Link } from "@inertiajs/react";
import { ArrowRightIcon } from "lucide-react";
import { ReactNode } from "react";

interface KpiDashboardProps {
  title: string;
  value: number;
  icon: ReactNode;
  description: string;
  link?: string;
}
export function KpiDashboard({ title, value, icon, description, link }: KpiDashboardProps) {
  return (
    <Card className="">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums card:text-3xl">
          {value}
        </CardTitle>
        <CardAction>
          {icon}
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="text-muted-foreground flex items-center gap-1 justify-between">
          <div className="w-full">{description}</div>
          {link ? <div className="text-xs text-muted-foreground">
            <span className="text-primary">
              <Link href={link}>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </span>
          </div> : ''}
        </div>
      </CardFooter>
    </Card>
  )
}
