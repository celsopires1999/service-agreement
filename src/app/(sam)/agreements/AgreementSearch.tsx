import { LocalPlanSearch } from "@/components/LocalPlanSearch"
import { SearchButton } from "@/components/SearchButton"
import { Input } from "@/components/ui/input"
import { getPlansForSearch } from "@/lib/queries/plan"
import Form from "next/form"

type Props = {
    localPlanId?: string
    searchText?: string
}

export async function AgreementSearch({ localPlanId, searchText }: Props) {
    const plans = await getPlansForSearch()

    return (
        <Form action="/agreements" className="flex items-center gap-2">
            <LocalPlanSearch
                fieldName="localPlanId"
                data={plans}
                defaultValue={localPlanId}
            />
            <Input
                type="text"
                name="searchText"
                placeholder="Search Agreements"
                className="w-full"
                defaultValue={searchText}
                autoFocus
            />
            <SearchButton />
        </Form>
    )
}
