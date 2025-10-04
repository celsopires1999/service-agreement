import Form from "next/form"
import { Input } from "@/components/ui/input"
import { SearchButton } from "@/app/components/SearchButton"

type Props = {
    searchText?: string
}
export function UserSearch({ searchText }: Props) {
    return (
        <Form action="/users" className="flex items-center gap-2">
            <Input
                type="text"
                name="searchText"
                placeholder="Search Users"
                className="w-full"
                defaultValue={searchText}
                autoFocus
            />
            <SearchButton />
        </Form>
    )
}
