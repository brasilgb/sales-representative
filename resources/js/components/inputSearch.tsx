import { useForm } from "@inertiajs/react";
import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface SearchProps {
    placeholder: string;
    url: string;
    date?: boolean;
}

export default function InputSearch({ placeholder, url, date }: SearchProps) {
    const { data, setData, post, get, processing, errors } = useForm({
        q: "",
    });

    function handleSubmit(e: any) {
        e.preventDefault();
        get(route(url));
    }

    return (
        <form
            onSubmit={handleSubmit}
        >
            <div className='relative w-full'>
                <Input
                className="w-full"
                    name="search"
                    value={data.q}
                    onChange={(e) => setData("q", e.target.value)}
                    type={date ? "date" : "search"}
                    placeholder={placeholder}
                    autoComplete="off"
                />
                <div className='absolute h-full border-l right-0 top-0 flex items-center justify-center w-8'>
                    <Button variant={'default'} size={'icon'} disabled={processing} className='rounded-l-none'>
                        <Search className='right-1' />
                    </Button>
                </div>
            </div>
        </form>
    );
};