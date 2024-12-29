import Form from "next/form"
import { Input } from "@/components/ui/input"
import { SearchButton } from "@/components/SearchButton"

type Props = {
    searchText?: string
}
export function ServiceSearch({ searchText }: Props) {
    return (
        <Form action="/services" className="flex items-center gap-2">
            <Input
                type="text"
                name="searchText"
                placeholder="Search Services"
                className="w-full"
                defaultValue={searchText}
                autoFocus
            />
            <SearchButton />
        </Form>
    )
}