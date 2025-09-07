
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Link } from "@inertiajs/react";

export default function AppPagination({ data }: any) {
    const clearLinks = [...data?.links];
    clearLinks.shift();
    clearLinks.pop();

    return (
        <div className="flex items-center justify-end  space-x-2">
            <div className="text-muted-foreground flex-1 text-sm">
                Página {data?.current_page} de{" "}
                {data?.last_page}
            </div>
            {data?.prev_page_url ?
                <Button
                    variant="outline"
                    size="icon"
                    className="hidden size-8 lg:flex"
                    disabled={!data?.prev_page_url}
                    asChild
                >
                    <Link href={data?.prev_page_url}>
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft />
                    </Link>
                </Button>
                :
                <Button variant="outline" size="icon" className="hidden size-8 lg:flex" disabled={true}>
                    <ChevronsLeft />
                </Button>
            }

            {data?.prev_page_url ?
                <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={!data?.prev_page_url}
                    asChild
                >
                    <Link href={data?.prev_page_url}>
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft />
                    </Link>
                </Button>
                :
                <Button variant="outline" size="icon" className="size-8" disabled={true}>
                    <ChevronLeft />
                </Button>
            }

            {clearLinks?.map((item: any, index: number) => (
                !item.active ?
                    <Button
                        variant="secondary"
                        size="icon"
                        className="size-8"
                        asChild
                    >
                        <Link href={`${item?.url}`}>
                            {item?.label}
                        </Link>
                    </Button>
                    :
                    <Button variant="default" size="icon" className="size-8" disabled={true}>
                        {item.label}
                    </Button>
            ))}

            {data?.next_page_url ?
                <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={!data?.next_page_url}
                    asChild
                >
                    <Link href={data?.next_page_url}>
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight />
                    </Link>
                </Button>
                :
                <Button variant="outline" size="icon" className="size-8" disabled={true}>
                    <ChevronRight />
                </Button>
            }
            {data?.last_page_url === data?.next_page_url ?
                <Button
                    variant="outline"
                    size="icon"
                    className="hidden size-8 lg:flex"
                    asChild
                >
                    <Link href={data?.last_page_url}>
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight />
                    </Link>
                </Button>
                :
                <Button variant="outline" size="icon" className="hidden size-8 lg:flex" disabled={true}>
                    <ChevronsRight />
                </Button>
            }
        </div>
    )
}
