"use client"

import { uploadUserListAction } from "@/actions/uploadUserListAction"
import { InputWithIcon } from "@/components/inputs/InputWithIcon"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import {
    userListUploadSchemaType,
    userListUploadSchema,
} from "@/zod-schemas/user-list"
import { SheetIcon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { useRef, useState, type ChangeEvent } from "react"
import { read, utils } from "xlsx"

type Props = {
    serviceId: string
}

export function UserListLoader({ serviceId }: Props) {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const closeButtonRef = useRef<HTMLButtonElement>(null)

    const {
        executeAsync: executeUserListUploadAction,
        isPending: isExecuting,
        reset: reseUserListUploadAction,
    } = useAction(uploadUserListAction, {
        onSuccess({ data }) {
            if (data?.message) {
                toast({
                    variant: "default",
                    title: "Success! 🎉",
                    description: data.message,
                })
            }
        },
        onError({ error }) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.serverError,
            })
        },
    })

    const handleUserListUpload = async (data: userListUploadSchemaType) => {
        reseUserListUploadAction()
        try {
            await executeUserListUploadAction(data)
            router.replace("?", {
                scroll: false,
            })
            closeButtonRef.current?.click()
        } catch (error) {
            if (error instanceof Error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: `Action error: ${error.message}`,
                })
            }
        }
    }

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            if (
                selectedFile.type ===
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                selectedFile.type === "application/vnd.ms-excel" ||
                selectedFile.name.endsWith(".xlsx") ||
                selectedFile.name.endsWith(".xls")
            ) {
                setError(null)
            } else {
                setError("Please select a valid Excel file (.xlsx or .xls)")
            }
        }
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        if (file) {
            const reader = new FileReader()
            reader.readAsArrayBuffer(file)
            reader.onload = (event) => {
                const data = event.target?.result
                try {
                    const workbook = read(data, { type: "binary" })
                    const sheetName = workbook.SheetNames[0]
                    const sheet = workbook.Sheets[sheetName]
                    const parsedData = utils.sheet_to_json(sheet, {
                        range: 1,
                        header: [
                            "costCenter",
                            "area",
                            "name",
                            "email",
                            "corpUserId",
                        ],
                    }) satisfies userListUploadSchemaType["items"]

                    const params: userListUploadSchemaType = {
                        serviceId,
                        items: parsedData,
                    }

                    const validation = userListUploadSchema.safeParse(params)
                    if (!validation.success) {
                        const errors = validation.error.flatten().fieldErrors
                        setError(Object.values(errors).flat().join(", "))
                        return
                    }

                    handleUserListUpload(validation.data)
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    title="Load User List"
                    aria-label="Load User List"
                >
                    Load
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Load User List</DialogTitle>
                    <DialogDescription>
                        {
                            "Select the Excel file you want to upload. Click save when you're done."
                        }
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="grid w-full max-w-sm items-center gap-2"
                >
                    <InputWithIcon
                        type="text"
                        placeholder="No file selected yet"
                        readOnly
                        icon={<SheetIcon />}
                        value={file?.name ?? ""}
                        onClick={() => fileInputRef.current?.click()}
                        className="pointer-events-auto cursor-pointer"
                    />

                    <input
                        type="file"
                        hidden={true}
                        onChange={handleFileChange}
                        accept=".xlsx,.xls"
                        ref={fileInputRef}
                    />
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="secondary"
                                ref={closeButtonRef}
                            >
                                Close
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={!file || isExecuting}>
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
