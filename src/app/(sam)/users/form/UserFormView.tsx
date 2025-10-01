import {
    DisplayServerActionResponse,
    ServerActionResponse,
} from "@/app/components/DisplayServerActionResponse"
import { FormControlButtons } from "@/app/components/FormControlButtons"
import { InputWithLabel } from "@/app/components/inputs/InputWithLabel"
import { Form } from "@/components/ui/form"
import { insertUserSchemaType, selectUserSchemaType } from "@/zod-schemas/user"
import { UseFormReturn } from "react-hook-form"
import { UserRoleSelect } from "./UserRoleSelect"

type Props = {
    form: UseFormReturn<insertUserSchemaType>
    submitForm: (data: insertUserSchemaType) => void
    isSaving: boolean
    resetForm: () => void
    saveResult: ServerActionResponse
    user?: selectUserSchemaType
}

export function UserFormView({
    form,
    submitForm,
    isSaving,
    resetForm,
    saveResult,
    user,
}: Props) {
    return (
        <div className="flex flex-col gap-1 sm:px-8">
            <DisplayServerActionResponse result={saveResult} />
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                    {user?.userId ? "Edit" : "New"} User Form
                </h2>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(submitForm)}
                    className="flex flex-col gap-4 md:flex-row md:gap-8"
                >
                    <div className="flex w-full max-w-xs flex-col gap-4">
                        <InputWithLabel<insertUserSchemaType>
                            fieldTitle="Name"
                            nameInSchema="name"
                        />
                        <InputWithLabel<insertUserSchemaType>
                            fieldTitle="Email"
                            nameInSchema="email"
                        />
                        <UserRoleSelect<insertUserSchemaType>
                            fieldTitle="Role"
                            nameInSchema="role"
                        />
                        <FormControlButtons
                            isSaving={isSaving}
                            onReset={resetForm}
                        />
                    </div>
                </form>
            </Form>
        </div>
    )
}
